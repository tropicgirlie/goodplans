import { id, randomToken, sha256, slugify } from "./core.js";
import { fail, seriesDates, validateEvent } from "./hosting-core.js";
import {
  sendEmail,
  emailStatement,
  queueEventNotice,
  deliverPending,
} from "./mail.js";
const now = () => new Date().toISOString();
const allowed = (env, email) =>
  (env.HOST_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email);
async function limit(env, key, max, seconds) {
  const expiry = Math.floor(Date.now() / 1000) + seconds;
  const row = await env.DB.prepare(
    "INSERT INTO auth_limits(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END RETURNING count",
  )
    .bind(
      key,
      expiry,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000),
    )
    .first();
  if (row.count > max) fail("Too many attempts. Please try again later.", 429);
}
export async function hosting(
  request,
  env,
  { response, requireHost, body, cookie, counts },
) {
  const url = new URL(request.url),
    path = url.pathname,
    method = request.method;
  if (
    path.startsWith("/api/") &&
    !["GET", "HEAD", "OPTIONS"].includes(method)
  ) {
    const origin = request.headers.get("origin");
    if (
      origin &&
      origin !== url.origin &&
      !(
        env.ENVIRONMENT === "development" &&
        ["http://127.0.0.1:3000", "http://localhost:3000"].includes(origin)
      )
    )
      fail("This request must come from the planner.", 403);
  }
  if (path === "/api/auth/otp/request" && method === "POST") {
    const input = await body(request);
    const email = String(input.email || "")
      .trim()
      .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      fail("Enter a valid email address.");
    await limit(
      env,
      `send-ip:${request.headers.get("cf-connecting-ip") || "local"}`,
      15,
      900,
    );
    await limit(env, `send:${email}`, 3, 900);
    if (!allowed(env, email)) return response({ ok: true });
    const code = String(
        100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000),
      ),
      codeId = id("otp");
    await env.DB.batch([
      env.DB.prepare("DELETE FROM login_codes WHERE email=?").bind(email),
      env.DB.prepare(
        "INSERT INTO login_codes(id,email,code,expires_at,attempts) VALUES (?,?,?,?,0)",
      ).bind(
        codeId,
        email,
        await sha256(`${codeId}:${code}`),
        new Date(Date.now() + 300000).toISOString(),
      ),
    ]);
    try {
      await sendEmail(env, {
        key: codeId,
        to: email,
        subject: "Your Good Plans sign-in code",
        text: `Your sign-in code is ${code}. It expires in five minutes. If you did not request it, ignore this email.`,
      });
    } catch (error) {
      await env.DB.prepare("DELETE FROM login_codes WHERE id=?")
        .bind(codeId)
        .run();
      throw error;
    }
    return response({
      ok: true,
      ...(env.ENVIRONMENT === "development" ? { devCode: code } : {}),
    });
  }
  if (path === "/api/auth/otp/verify" && method === "POST") {
    const input = await body(request),
      email = String(input.email || "")
        .trim()
        .toLowerCase(),
      code = String(input.code || "");
    await limit(
      env,
      `verify-ip:${request.headers.get("cf-connecting-ip") || "local"}`,
      40,
      900,
    );
    await limit(env, `verify:${email}`, 10, 900);
    if (!allowed(env, email) || !/^\d{6}$/.test(code))
      fail("Invalid or expired code.");
    const row = await env.DB.prepare(
      "UPDATE login_codes SET attempts=attempts+1 WHERE email=? AND expires_at>? AND attempts<5 RETURNING *",
    )
      .bind(email, now())
      .first();
    if (!row || row.code !== (await sha256(`${row.id}:${code}`)))
      fail("Invalid or expired code. Request a new code after five attempts.");
    const consumed = await env.DB.prepare(
      "DELETE FROM login_codes WHERE id=? RETURNING id",
    )
      .bind(row.id)
      .first();
    if (!consumed) fail("This code has already been used.");
    await env.DB.prepare(
      "INSERT OR IGNORE INTO users(id,email,display_name) VALUES (?,?,?)",
    )
      .bind(id("user"), email, email.split("@")[0])
      .run();
    const user = await env.DB.prepare(
      "SELECT id,email,display_name FROM users WHERE email=?",
    )
      .bind(email)
      .first();
    const token = randomToken();
    await env.DB.prepare(
      "INSERT INTO host_sessions(id,user_id,session_hash,expires_at) VALUES (?,?,?,?)",
    )
      .bind(
        id("session"),
        user.id,
        await sha256(token),
        new Date(Date.now() + 2592000000).toISOString(),
      )
      .run();
    return response(
      { user },
      {
        headers: {
          "set-cookie": cookie(
            "good_plans_host",
            token,
            2592000,
            env.ENVIRONMENT === "production",
          ),
        },
      },
    );
  }
  if (!path.startsWith("/api/host/")) return null;
  const supported =
    path === "/api/host/workspace" ||
    path === "/api/host/events" ||
    /^\/api\/host\/events\/[^/]+\/(dashboard|cancel|invite|retry-email)$/.test(
      path,
    ) ||
    (/^\/api\/host\/events\/[^/]+$/.test(path) && method === "PATCH");
  if (!supported) return null;
  const host = await requireHost(request, env);
  const publicOrigin =
    env.PUBLIC_ORIGIN ||
    (env.ENVIRONMENT === "development" &&
    ["http://127.0.0.1:3000", "http://localhost:3000"].includes(
      request.headers.get("origin"),
    )
      ? request.headers.get("origin")
      : url.origin);
  if (path === "/api/host/workspace") {
    if (method === "GET") {
      const row = await env.DB.prepare(
        "SELECT * FROM host_workspaces WHERE user_id=?",
      )
        .bind(host.id)
        .first();
      return response({
        data: row ? JSON.parse(row.data_json) : null,
        revision: row?.revision || 0,
      });
    }
    if (method === "PUT") {
      const { data, revision } = await body(request);
      if (
        !data ||
        !["plans", "people", "saved"].every((k) => Array.isArray(data[k])) ||
        JSON.stringify(data).length > 500000
      )
        fail("Workspace data is invalid or too large.");
      const result =
        revision === 0
          ? await env.DB.prepare(
              "INSERT OR IGNORE INTO host_workspaces(user_id,data_json,revision) VALUES (?,?,1)",
            )
              .bind(host.id, JSON.stringify(data))
              .run()
          : await env.DB.prepare(
              "UPDATE host_workspaces SET data_json=?,revision=revision+1 WHERE user_id=? AND revision=?",
            )
              .bind(JSON.stringify(data), host.id, revision)
              .run();
      if (!result.meta.changes)
        fail(
          "Your workspace changed on another device. Reload before saving.",
          409,
        );
      return response({ revision: revision + 1 });
    }
  }
  if (path === "/api/host/events" && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT e.*,s.name AS series_name,s.cadence FROM events e LEFT JOIN event_series s ON s.id=e.series_id WHERE e.host_user_id=? ORDER BY e.starts_at",
    )
      .bind(host.id)
      .all();
    return response({ events: results });
  }
  if (path === "/api/host/events" && method === "POST") {
    const input = await body(request);
    validateEvent(input);
    if (!input.clientId || String(input.clientId).length > 100)
      fail("A draft identifier is required.");
    const existing = await env.DB.prepare(
      "SELECT response_json FROM host_requests WHERE user_id=? AND request_key=?",
    )
      .bind(host.id, input.clientId)
      .first();
    if (existing) return response(JSON.parse(existing.response_json));
    const dates = seriesDates(input);
    const guests = Array.isArray(input.guests) ? input.guests : [];
    if (guests.length > 50) fail("Invite up to 50 guests at a time.");
    for (const g of guests) {
      if (!String(g.name || "").trim()) fail("Each guest needs a name.");
      if (g.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email))
        fail(`Check the email for ${g.name}.`);
    }
    let org = await env.DB.prepare(
      "SELECT id FROM organisations WHERE owner_user_id=? LIMIT 1",
    )
      .bind(host.id)
      .first();
    const statements = [];
    if (!org) {
      org = { id: id("org") };
      statements.push(
        env.DB.prepare(
          "INSERT INTO organisations(id,name,owner_user_id) VALUES (?,?,?)",
        ).bind(org.id, "My gatherings", host.id),
      );
    }
    const seriesId = input.seriesName ? id("series") : null;
    if (seriesId)
      statements.push(
        env.DB.prepare(
          "INSERT INTO event_series(id,organisation_id,name,city,cadence) VALUES (?,?,?,?,?)",
        ).bind(
          seriesId,
          org.id,
          String(input.seriesName).slice(0, 120),
          input.city || null,
          input.cadence || "Once a month",
        ),
      );
    const result = { events: [], inviteLinks: [] };
    for (let n = 0; n < dates.length; n++) {
      const event = {
        id: id("event"),
        slug: `${slugify(input.title)}-${crypto.randomUUID().slice(0, 8)}`,
        title: input.title.trim(),
        starts_at: dates[n].startsAt,
        ends_at: dates[n].endsAt,
        timezone: input.timezone,
        venue_name: input.venueName || "",
        description: input.description || "",
        capacity: Number(input.capacity),
        status: input.publish ? "published" : "draft",
        series_id: seriesId,
        series_name: input.seriesName || null,
        cadence: input.cadence || null,
        plus_one: input.plusOne ? 1 : 0,
        show_guests: input.showGuests === false ? 0 : 1,
        reminder: input.reminder ? 1 : 0,
        client_id: input.clientId,
        revision: 1,
      };
      statements.push(
        env.DB.prepare(
          "INSERT INTO events(id,organisation_id,series_id,host_user_id,slug,title,description,starts_at,ends_at,timezone,venue_name,capacity,visibility,status,plus_one,show_guests,reminder,client_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        ).bind(
          event.id,
          org.id,
          seriesId,
          host.id,
          event.slug,
          event.title,
          event.description,
          event.starts_at,
          event.ends_at,
          event.timezone,
          event.venue_name,
          event.capacity,
          "invite",
          event.status,
          event.plus_one,
          event.show_guests,
          event.reminder,
          input.clientId,
        ),
      );
      event.inviteLinks = [];
      for (const guest of guests) {
        const token = randomToken(),
          invitationId = id("invite");
        statements.push(
          env.DB.prepare(
            "INSERT INTO invitations(id,event_id,guest_email,guest_name,token_hash) VALUES (?,?,?,?,?)",
          ).bind(
            invitationId,
            event.id,
            guest.email?.trim().toLowerCase() || null,
            guest.name.trim(),
            await sha256(token),
          ),
        );
        event.inviteLinks.push({
          invitationId,
          guestName: guest.name,
          inviteUrl: `${publicOrigin}/events/${event.slug}#invite=${token}`,
        });
      }
      result.events.push(event);
      result.inviteLinks.push(...event.inviteLinks);
    }
    result.event = result.events[0];
    statements.push(
      env.DB.prepare(
        "INSERT INTO host_requests(user_id,request_key,response_json) VALUES (?,?,?)",
      ).bind(host.id, input.clientId, JSON.stringify(result)),
    );
    try {
      await env.DB.batch(statements);
    } catch (error) {
      const retry = await env.DB.prepare(
        "SELECT response_json FROM host_requests WHERE user_id=? AND request_key=?",
      )
        .bind(host.id, input.clientId)
        .first();
      if (retry) return response(JSON.parse(retry.response_json));
      throw error;
    }
    return response(result, { status: 201 });
  }
  const eventId = decodeURIComponent(path.split("/")[4]);
  const event = await env.DB.prepare(
    "SELECT * FROM events WHERE id=? AND host_user_id=?",
  )
    .bind(eventId, host.id)
    .first();
  if (!event) fail("Event not found.", 404);
  if (path.endsWith("/dashboard") && method === "GET") {
    const guests = await env.DB.prepare(
      "SELECT i.id,i.guest_name,i.guest_email,i.expires_at,r.status,r.party_size FROM invitations i LEFT JOIN rsvps r ON r.invitation_id=i.id WHERE i.event_id=? ORDER BY i.created_at",
    )
      .bind(eventId)
      .all();
    const mail = await env.DB.prepare(
      "SELECT id,recipient,subject,status,error,sent_at FROM email_deliveries WHERE event_id=? ORDER BY created_at DESC",
    )
      .bind(eventId)
      .all();
    return response({
      event,
      guests: guests.results,
      counts: await counts(env, eventId),
      deliveries: mail.results,
      emailReady:
        env.ENVIRONMENT === "development" ||
        Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
    });
  }
  if (path.endsWith("/cancel") && method === "POST") {
    const input = await body(request);
    const events =
      input.scope === "series" && event.series_id
        ? (
            await env.DB.prepare(
              "SELECT * FROM events WHERE series_id=? AND host_user_id=? AND starts_at>=? AND status!='cancelled'",
            )
              .bind(event.series_id, host.id, event.starts_at)
              .all()
          ).results
        : [event];
    for (const e of events) {
      if (e.status === "cancelled") continue;
      await env.DB.prepare(
        "UPDATE events SET status='cancelled',revision=revision+1,updated_at=? WHERE id=?",
      )
        .bind(now(), e.id)
        .run();
      await queueEventNotice(
        env,
        { ...e, revision: e.revision + 1 },
        "event_cancelled",
      );
    }
    await deliverPending(env);
    return response({ ok: true });
  }
  if (method === "PATCH") {
    if (event.status === "cancelled")
      fail("Cancelled events cannot be edited.", 409);
    const input = await body(request);
    const merged = {
      title: input.title ?? event.title,
      startsAt: input.startsAt ?? event.starts_at,
      endsAt: input.endsAt ?? event.ends_at,
      timezone: input.timezone ?? event.timezone,
      capacity: input.capacity ?? event.capacity,
    };
    validateEvent(merged);
    const seats = await env.DB.prepare(
      "SELECT COALESCE(SUM(party_size),0) AS n FROM rsvps WHERE event_id=? AND status='accepted'",
    )
      .bind(eventId)
      .first();
    if (merged.capacity < seats.n)
      fail("Capacity cannot be lower than the number of confirmed guests.");
    const changed = await env.DB.prepare(
      "UPDATE events SET title=?,starts_at=?,ends_at=?,timezone=?,capacity=?,venue_name=?,description=?,revision=revision+1,updated_at=? WHERE id=? AND revision=? AND status!='cancelled' AND ? >= (SELECT COALESCE(SUM(party_size),0) FROM rsvps WHERE event_id=? AND status='accepted')",
    )
      .bind(
        merged.title,
        new Date(merged.startsAt).toISOString(),
        new Date(merged.endsAt).toISOString(),
        merged.timezone,
        Number(merged.capacity),
        input.venueName ?? event.venue_name,
        input.description ?? event.description,
        now(),
        eventId,
        input.revision,
        Number(merged.capacity),
        eventId,
      )
      .run();
    if (!changed.meta.changes)
      fail("This event changed elsewhere. Refresh before editing.", 409);
    const latest = await env.DB.prepare("SELECT * FROM events WHERE id=?")
      .bind(eventId)
      .first();
    await queueEventNotice(env, latest, "event_updated");
    await deliverPending(env);
    await env.EVENT_ROOM.get(env.EVENT_ROOM.idFromName(eventId)).fetch(
      "https://event-room/rebalance",
      { method: "POST", body: JSON.stringify({ eventId }) },
    );
    return response({ event: latest });
  }
  if (path.endsWith("/invite") && method === "POST") {
    const input = await body(request);
    if (event.status === "cancelled") fail("This event is cancelled.");
    if (input.sendEmail && !input.invitationId && !input.email)
      fail("Add an email address for this guest.");
    const token = randomToken();
    let guest;
    if (input.invitationId) {
      guest = await env.DB.prepare(
        "SELECT * FROM invitations WHERE id=? AND event_id=?",
      )
        .bind(input.invitationId, eventId)
        .first();
      if (!guest) fail("Invitation not found.", 404);
      if (input.sendEmail && !guest.guest_email)
        fail("Add an email address for this guest.");
      await env.DB.prepare(
        "UPDATE invitations SET token_hash=?,expires_at=NULL WHERE id=?",
      )
        .bind(await sha256(token), guest.id)
        .run();
    } else {
      if (!String(input.name || "").trim()) fail("Guest name is required.");
      if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
        fail("Enter a valid guest email.");
      guest = {
        id: id("invite"),
        guest_name: input.name.trim(),
        guest_email: input.email || null,
      };
      await env.DB.prepare(
        "INSERT INTO invitations(id,event_id,guest_name,guest_email,token_hash) VALUES (?,?,?,?,?)",
      )
        .bind(
          guest.id,
          eventId,
          guest.guest_name,
          guest.guest_email,
          await sha256(token),
        )
        .run();
    }
    const inviteUrl = `${publicOrigin}/events/${event.slug}#invite=${token}`;
    if (input.sendEmail) {
      if (!guest.guest_email) fail("Add an email address for this guest.");
      await emailStatement(env, {
        eventId,
        invitationId: guest.id,
        to: guest.guest_email,
        subject: `You're invited: ${event.title}`,
        text: `Hi ${guest.guest_name},\n\nYou're invited to ${event.title}.\n${event.starts_at} (${event.timezone})\n${event.venue_name || ""}\n\nYour private RSVP link:\n${inviteUrl}`,
      }).run();
      await deliverPending(env);
    }
    return response({ inviteUrl, invitationId: guest.id });
  }
  if (path.endsWith("/retry-email") && method === "POST") {
    await env.DB.prepare(
      "UPDATE email_deliveries SET attempts=0,status='queued' WHERE event_id=? AND status='failed'",
    )
      .bind(eventId)
      .run();
    await deliverPending(env);
    return response({ ok: true });
  }
  return null;
}
