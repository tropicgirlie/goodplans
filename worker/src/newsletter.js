import { eventCare } from '../../shared/event-care.js';
import { id, randomToken, sha256 } from "./core.js";
import { fail } from "./hosting-core.js";
import { sendEmail } from "./mail.js";
import {
  DEFAULT_DISCOVERY_HOSTS,
  draftFromDiscoveryPage,
  fetchDiscoveryPage,
} from "./discovery-import.js";
import {
  collectWebSource,
  discoverySources,
  saveDiscoverySource,
} from "./discovery-sources.js";
import {
  categories,
  discoveryMatch,
  discoverySearches,
  validateListing,
  normaliseTicketmaster,
  weekKey,
  curate,
  matchesInterests,
  issueText,
  newsletterHtml,
} from "./discovery-core.js";
const now = () => new Date().toISOString();
const emailReady = (env) =>
  env.ENVIRONMENT === "development" ||
  Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
function publicOrigin(request, env) {
  if (env.ENVIRONMENT === "development") {
    const origin = request?.headers.get("origin");
    return ["http://127.0.0.1:3000", "http://localhost:3000"].includes(origin)
      ? origin
      : "http://127.0.0.1:3000";
  }
  const value = env.PUBLIC_ORIGIN || (request && new URL(request.url).origin);
  if (!value || !value.startsWith("https://"))
    fail("Set PUBLIC_ORIGIN to the public HTTPS website address.", 503);
  return new URL(value).origin;
}
async function throttle(env, key, max = 3) {
  const t = Math.floor(Date.now() / 1000),
    expiry = t + 3600;
  const result = await env.DB.prepare(
    "INSERT INTO auth_limits(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END RETURNING count",
  )
    .bind(`newsletter:${key}`, expiry, t, t)
    .first();
  if (result.count > max)
    fail("Too many requests. Please try again in an hour.", 429);
}
function interests(value) {
  if (!Array.isArray(value) || value.some((x) => !categories.includes(x)))
    fail("Choose interests from the list.");
  return [...new Set(value)];
}
async function listingRows(env, days = 14) {
  return (
    await env.DB.prepare(
      "SELECT * FROM discovered_events WHERE status='active' AND review_status='approved' AND starts_at>? AND starts_at<=? AND (source='manual' OR updated_at>?) ORDER BY starts_at LIMIT 500",
    )
      .bind(
        now(),
        new Date(Date.now() + days * 86400000).toISOString(),
        new Date(Date.now() - 8 * 86400000).toISOString(),
      )
      .all()
  ).results;
}
async function candidateRows(env) {
  return (
    await env.DB.prepare(
      "SELECT * FROM discovered_events WHERE status='active' AND status='active' AND review_status='candidate' AND starts_at>? ORDER BY discovery_score DESC,starts_at LIMIT 150",
    )
      .bind(now())
      .all()
  ).results;
}
function listingStatement(env, e) {
  return env.DB.prepare(
    "INSERT INTO discovered_events(id,source,source_id,title,starts_at,ends_at,venue,category,price,url,status,updated_at,themes_json,match_reason,discovery_score,review_status,first_seen_at,collector_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(source,source_id) DO UPDATE SET title=excluded.title,starts_at=excluded.starts_at,ends_at=excluded.ends_at,venue=excluded.venue,category=excluded.category,price=excluded.price,url=excluded.url,status=CASE WHEN excluded.source='manual' THEN excluded.status WHEN discovered_events.status='hidden' THEN 'hidden' ELSE excluded.status END,updated_at=excluded.updated_at,themes_json=excluded.themes_json,match_reason=excluded.match_reason,discovery_score=excluded.discovery_score,children_welcome=CASE WHEN excluded.source='manual' OR NOT (discovered_events.title<>excluded.title OR discovered_events.starts_at<>excluded.starts_at OR COALESCE(discovered_events.ends_at,'')<>COALESCE(excluded.ends_at,'') OR discovered_events.venue<>excluded.venue OR discovered_events.price<>excluded.price OR discovered_events.url<>excluded.url OR discovered_events.category<>excluded.category OR discovered_events.themes_json<>excluded.themes_json) THEN discovered_events.children_welcome ELSE 'unknown' END,childcare=CASE WHEN excluded.source='manual' OR NOT (discovered_events.title<>excluded.title OR discovered_events.starts_at<>excluded.starts_at OR COALESCE(discovered_events.ends_at,'')<>COALESCE(excluded.ends_at,'') OR discovered_events.venue<>excluded.venue OR discovered_events.price<>excluded.price OR discovered_events.url<>excluded.url OR discovered_events.category<>excluded.category OR discovered_events.themes_json<>excluded.themes_json) THEN discovered_events.childcare ELSE 'unknown' END,care_url=CASE WHEN excluded.source='manual' OR NOT (discovered_events.title<>excluded.title OR discovered_events.starts_at<>excluded.starts_at OR COALESCE(discovered_events.ends_at,'')<>COALESCE(excluded.ends_at,'') OR discovered_events.venue<>excluded.venue OR discovered_events.price<>excluded.price OR discovered_events.url<>excluded.url OR discovered_events.category<>excluded.category OR discovered_events.themes_json<>excluded.themes_json) THEN discovered_events.care_url ELSE NULL END,review_status=CASE WHEN excluded.source='manual' THEN 'approved' WHEN discovered_events.review_status='rejected' THEN 'rejected' WHEN discovered_events.review_status='approved' AND (discovered_events.title<>excluded.title OR discovered_events.starts_at<>excluded.starts_at OR COALESCE(discovered_events.ends_at,'')<>COALESCE(excluded.ends_at,'') OR discovered_events.venue<>excluded.venue OR discovered_events.price<>excluded.price OR discovered_events.url<>excluded.url OR discovered_events.category<>excluded.category OR discovered_events.themes_json<>excluded.themes_json) THEN 'candidate' WHEN discovered_events.review_status='approved' THEN 'approved' ELSE excluded.review_status END",
  ).bind(
    e.id,
    e.source,
    e.source_id,
    e.title,
    e.starts_at,
    e.ends_at,
    e.venue,
    e.category,
    e.price,
    e.url,
    e.status || "active",
    now(),
    JSON.stringify(e.themes || []),
    e.match_reason || "Added by the organiser",
    e.discovery_score || 0,
    e.review_status || (e.source === "manual" ? "approved" : "candidate"),
    now(),
    e.collector_id || null,
  );
}
export async function collectDublin(env) {
  if (!env.TICKETMASTER_API_KEY)
    fail(
      "Add TICKETMASTER_API_KEY to enable automatic Dublin event collection. You can add local picks manually.",
      503,
    );
  const byId = new Map();
  for (const search of discoverySearches) {
    for (let page = 0; page < (search.pages || 1); page++) {
      const params = new URLSearchParams({
        apikey: env.TICKETMASTER_API_KEY,
        city: "Dublin",
        countryCode: "IE",
        startDateTime: now().replace(/\.\d+Z$/, "Z"),
        endDateTime: new Date(Date.now() + 90 * 86400000)
          .toISOString()
          .replace(/\.\d+Z$/, "Z"),
        size: "50",
        page: String(page),
        sort: "date,asc",
        includeTBA: "no",
        includeTBD: "no",
        ...(search.query ? { keyword: search.query } : {}),
      });
      let response;
      try {
        response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
          { signal: AbortSignal.timeout(15000) },
        );
      } catch {
        fail(
          "Dublin event collection timed out or could not connect. Try again later.",
          503,
        );
      }
      if (!response.ok)
        fail(`Dublin event provider is unavailable (${response.status}).`, 503);
      const payload = await response.json();
      for (const raw of payload._embedded?.events || []) {
        const event = normaliseTicketmaster(raw, search),
          existing = event && byId.get(event.source_id);
        if (!event) continue;
        if (existing) {
          event.themes = [...new Set([...existing.themes, ...event.themes])];
          event.discovery_score = Math.max(
            existing.discovery_score,
            event.discovery_score,
          );
          event.match_reason = [
            ...new Set([existing.match_reason, event.match_reason]),
          ].join("; ");
        }
        byId.set(event.source_id, event);
      }
      if (page + 1 >= (payload.page?.totalPages || 1)) break;
    }
  }
  const collected = [...byId.values()];
  for (let i = 0; i < collected.length; i += 50)
    await env.DB.batch(
      collected.slice(i, i + 50).map((e) => listingStatement(env, e)),
    );
  return collected.length;
}

export async function collectConfiguredDublin(env) {
  const sources = (await discoverySources(env)).filter(
    (source) => source.enabled,
  );
  if (!env.TICKETMASTER_API_KEY && !sources.length)
    fail(
      "Add an automatic website source below, or connect Ticketmaster. You can always paste an event link.",
      503,
    );
  let count = 0;
  const errors = [];
  if (env.TICKETMASTER_API_KEY) {
    try {
      count += await collectDublin(env);
    } catch (e) {
      errors.push(e.message);
    }
  }
  for (const source of sources) {
    const result = await collectWebSource(env, source, (event) =>
      listingStatement(env, event).run(),
    );
    count += result.count;
    if (result.error) errors.push(result.error);
  }
  return { count, errors };
}
export async function finishDiscoveryRun(env, key) {
  const claimed = await env.DB.prepare(
    "UPDATE discovery_runs SET status='running' WHERE key=? AND status='queued'",
  )
    .bind(key)
    .run();
  if (!claimed.meta.changes) return;
  try {
    const result = await collectConfiguredDublin(env);
    await env.DB.prepare(
      "UPDATE discovery_runs SET status=?,finished_at=?,count=?,error=? WHERE key=?",
    )
      .bind(
        result.errors.length ? "partial" : "complete",
        now(),
        result.count,
        result.errors.join("; ").slice(0, 2000) || null,
        key,
      )
      .run();
  } catch (e) {
    await env.DB.prepare(
      "UPDATE discovery_runs SET status='failed',finished_at=?,error=? WHERE key=?",
    )
      .bind(now(), e.message, key)
      .run();
  }
}

async function prepareIssue(env, origin) {
  const week = weekKey();
  const existing = await env.DB.prepare(
    "SELECT * FROM newsletter_issues WHERE week=?",
  )
    .bind(week)
    .first();
  if (existing) return existing;
  const picks = curate(await listingRows(env));
  if (!picks.length)
    fail("Add or collect upcoming Dublin events before preparing an issue.");
  const issue = {
    id: id("issue"),
    week,
    subject: "A few good reasons to get together in Dublin",
    intro:
      "A little inspiration for the next two weeks. Pick something you love, add it to your plans, and bring your people.",
    events_json: JSON.stringify(picks),
    origin,
  };
  await env.DB.prepare(
    "INSERT OR IGNORE INTO newsletter_issues(id,week,subject,intro,events_json,origin,created_at) VALUES (?,?,?,?,?,?,?)",
  )
    .bind(
      issue.id,
      week,
      issue.subject,
      issue.intro,
      issue.events_json,
      origin,
      now(),
    )
    .run();
  return env.DB.prepare("SELECT * FROM newsletter_issues WHERE week=?")
    .bind(week)
    .first();
}
export async function deliverNewsletters(env) {
  const deliveries = (
    await env.DB.prepare(
      "SELECT d.*,s.status AS subscriber_status FROM newsletter_deliveries d JOIN newsletter_subscribers s ON s.id=d.subscriber_id WHERE d.status IN ('queued','failed') AND d.attempts<5 LIMIT 25",
    ).all()
  ).results;
  for (const d of deliveries) {
    const currentSubscriber = await env.DB.prepare(
      "SELECT status FROM newsletter_subscribers WHERE id=?",
    )
      .bind(d.subscriber_id)
      .first();
    if (currentSubscriber?.status !== "active") {
      await env.DB.prepare(
        "UPDATE newsletter_deliveries SET status='skipped' WHERE id=?",
      )
        .bind(d.id)
        .run();
      continue;
    }
    try {
      const issue = await env.DB.prepare(
        "SELECT subject FROM newsletter_issues WHERE id=?",
      )
        .bind(d.issue_id)
        .first();
      const provider = await sendEmail(env, {
        key: d.id,
        to: d.recipient,
        subject: issue.subject,
        text: d.body,
        html: newsletterHtml(d.body, issue.subject),
      });
      await env.DB.prepare(
        "UPDATE newsletter_deliveries SET status='sent',provider_id=?,sent_at=?,attempts=attempts+1,error=NULL WHERE id=?",
      )
        .bind(provider, now(), d.id)
        .run();
    } catch (e) {
      await env.DB.prepare(
        "UPDATE newsletter_deliveries SET status=?,attempts=attempts+1,error=? WHERE id=?",
      )
        .bind(e.suppressed ? "suppressed" : "failed", e.message, d.id)
        .run();
    }
  }
  await env.DB.prepare(
    "UPDATE newsletter_issues SET status='sent' WHERE status='queued' AND NOT EXISTS (SELECT 1 FROM newsletter_deliveries WHERE issue_id=newsletter_issues.id AND status IN ('queued','failed'))",
  ).run();
}
export async function scheduledNewsletter(env) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const key = `daily-${day}`;
  // Recover abandoned queue deliveries, and avoid overlapping manual/scheduled checks.
  await env.DB.prepare(
    "UPDATE discovery_runs SET status='failed',finished_at=?,error='Collection did not finish. Run another check.' WHERE status IN ('running','queued') AND started_at<?",
  )
    .bind(now(), new Date(Date.now() - 20 * 60000).toISOString())
    .run();
  const claimed = await env.DB.prepare(
    "INSERT OR IGNORE INTO discovery_runs(key,status,started_at) SELECT ?,'queued',? WHERE NOT EXISTS (SELECT 1 FROM discovery_runs WHERE status IN ('running','queued'))",
  )
    .bind(key, now())
    .run();
  if (claimed.meta.changes) {
    await finishDiscoveryRun(env, key);
    if ((await listingRows(env)).length)
      await prepareIssue(env, publicOrigin(null, env));
  }
  await deliverNewsletters(env);
}
export async function newsletter(
  request,
  env,
  { response, requireHost, body, ctx },
) {
  const url = new URL(request.url),
    path = url.pathname,
    method = request.method;
  if (
    !path.startsWith("/api/discovery") &&
    !path.startsWith("/api/newsletter") &&
    !path.startsWith("/api/host/newsletter")
  )
    return null;
  if (path === "/api/discovery" && method === "GET")
    return response({ events: curate(await listingRows(env), 100) });
  if (path.startsWith("/api/discovery/") && method === "GET") {
    const event = await env.DB.prepare(
      "SELECT * FROM discovered_events WHERE id=? AND status='active' AND review_status='approved' AND starts_at>? AND (source='manual' OR updated_at>?)",
    )
      .bind(
        decodeURIComponent(path.split("/").at(-1)),
        now(),
        new Date(Date.now() - 8 * 86400000).toISOString(),
      )
      .first();
    if (!event)
      fail(
        "This event is no longer available. Browse the latest Dublin picks.",
        404,
      );
    return response({ event });
  }
  if (path === "/api/newsletter/subscribe" && method === "POST") {
    const input = await body(request);
    if (input.website) return response({ ok: true });
    const email = String(input.email || "")
      .trim()
      .toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      fail("Enter a valid email address.");
    if (input.consent !== true)
      fail("Please choose to receive Good Plans Dublin.");
    const choices = interests(input.interests || []);
    await throttle(
      env,
      `ip:${request.headers.get("cf-connecting-ip") || "local"}`,
      15,
    );
    await throttle(env, `email:${email}`);
    if (!emailReady(env))
      fail(
        "Newsletter signup is not available yet. Please try again later.",
        503,
      );
    const existing = await env.DB.prepare(
      "SELECT * FROM newsletter_subscribers WHERE email=?",
    )
      .bind(email)
      .first();
    const token = randomToken(),
      subscriberId = existing?.id || id("subscriber"),
      hash = await sha256(token);
    if (!existing || existing.status !== "active") {
      await env.DB.prepare(
        "INSERT INTO newsletter_subscribers(id,email,interests_json,token_hash,confirm_expires_at,created_at,consent_version) VALUES (?,?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET token_hash=excluded.token_hash,confirm_expires_at=excluded.confirm_expires_at,interests_json=excluded.interests_json,status='pending',consent_version=excluded.consent_version",
      )
        .bind(
          subscriberId,
          email,
          JSON.stringify(choices),
          hash,
          new Date(Date.now() + 86400000).toISOString(),
          now(),
          "dublin-weekly-v1",
        )
        .run();
    }
    await env.DB.prepare(
      "INSERT INTO newsletter_tokens(token_hash,subscriber_id,created_at) VALUES (?,?,?)",
    )
      .bind(hash, subscriberId, now())
      .run();
    const link = `${publicOrigin(request, env)}/?newsletter=manage#token=${token}`;
    await sendEmail(env, {
      key: id("confirmation"),
      to: email,
      subject:
        existing?.status === "active"
          ? "Your Good Plans Dublin preferences"
          : "Confirm your Good Plans Dublin subscription",
      text: `${existing?.status === "active" ? "Manage your interests or unsubscribe" : "Confirm that you want the weekly Dublin event picks. This confirmation expires in 24 hours"}:\n\n${link}\n\nIf you did not request this, ignore this email.`,
    });
    return response({
      ok: true,
      ...(env.ENVIRONMENT === "development" ? { devLink: link } : {}),
    });
  }
  if (path === "/api/newsletter/manage" && method === "POST") {
    const input = await body(request);
    if (typeof input.token !== "string" || input.token.length !== 64)
      fail("This subscription link is not valid.", 404);
    const hash = await sha256(input.token);
    const subscriber = await env.DB.prepare(
      "SELECT s.* FROM newsletter_tokens t JOIN newsletter_subscribers s ON s.id=t.subscriber_id WHERE t.token_hash=?",
    )
      .bind(hash)
      .first();
    if (!subscriber) fail("This subscription link is not valid.", 404);
    if (input.action === "delete") {
      await env.DB.batch([
        env.DB.prepare(
          "DELETE FROM newsletter_deliveries WHERE subscriber_id=?",
        ).bind(subscriber.id),
        env.DB.prepare(
          "DELETE FROM newsletter_tokens WHERE subscriber_id=?",
        ).bind(subscriber.id),
        env.DB.prepare("DELETE FROM local_mailbox WHERE recipient=?").bind(
          subscriber.email,
        ),
        env.DB.prepare("DELETE FROM newsletter_subscribers WHERE id=?").bind(
          subscriber.id,
        ),
      ]);
      return response({ status: "deleted", interests: [] });
    }
    if (input.action === "confirm") {
      if (subscriber.status !== "active") {
        if (
          subscriber.status !== "pending" ||
          subscriber.token_hash !== hash ||
          subscriber.confirm_expires_at < now()
        )
          fail(
            "This confirmation has expired. Subscribe again for a new link.",
          );
        await env.DB.prepare(
          "UPDATE newsletter_subscribers SET status='active',confirmed_at=? WHERE id=? AND status='pending' AND token_hash=?",
        )
          .bind(now(), subscriber.id, hash)
          .run();
      }
    } else if (input.action === "unsubscribe") {
      await env.DB.batch([
        env.DB.prepare(
          "UPDATE newsletter_subscribers SET status='unsubscribed' WHERE id=?",
        ).bind(subscriber.id),
        env.DB.prepare(
          "UPDATE newsletter_deliveries SET status='skipped' WHERE subscriber_id=? AND status IN ('queued','failed')",
        ).bind(subscriber.id),
      ]);
    } else if (input.action === "preferences") {
      await env.DB.prepare(
        "UPDATE newsletter_subscribers SET interests_json=? WHERE id=?",
      )
        .bind(JSON.stringify(interests(input.interests)), subscriber.id)
        .run();
    } else if (input.action && input.action !== "read")
      fail("Unknown subscription action.");
    const latest = await env.DB.prepare(
      "SELECT status,interests_json FROM newsletter_subscribers WHERE id=?",
    )
      .bind(subscriber.id)
      .first();
    return response({
      status: latest.status,
      interests: JSON.parse(latest.interests_json),
    });
  }
  if (!path.startsWith("/api/host/newsletter")) return null;
  const host = await requireHost(request, env);
  if (path === "/api/host/newsletter" && method === "GET") {
    const issues = (
      await env.DB.prepare(
        "SELECT * FROM newsletter_issues ORDER BY week DESC LIMIT 8",
      ).all()
    ).results;
    const subscribers = await env.DB.prepare(
      "SELECT count(*) AS count FROM newsletter_subscribers WHERE status='active'",
    ).first();
    const runs = (
      await env.DB.prepare(
        "SELECT * FROM discovery_runs ORDER BY started_at DESC LIMIT 5",
      ).all()
    ).results;
    const deliveries = (
      await env.DB.prepare(
        "SELECT issue_id,status,error,count(*) AS count FROM newsletter_deliveries GROUP BY issue_id,status,error",
      ).all()
    ).results;
    const sources = await discoverySources(env);
    return response({
      issues,
      sources,
      importHosts: (env.DISCOVERY_ALLOWED_HOSTS || DEFAULT_DISCOVERY_HOSTS)
        .split(",")
        .map((host) => host.trim())
        .filter(Boolean),
      ticketmasterReady: Boolean(env.TICKETMASTER_API_KEY),
      subscribers: subscribers.count,
      runs,
      deliveries,
      events: await listingRows(env, 90),
      candidates: await candidateRows(env),
      searches: discoverySearches.map(({ query, label }) => ({ query, label })),
      collectionReady: Boolean(
        env.TICKETMASTER_API_KEY || sources.some((source) => source.enabled),
      ),
      scheduledCollection: await env.DB.prepare(
        "SELECT * FROM discovery_runs WHERE key LIKE 'daily-%' ORDER BY started_at DESC LIMIT 1",
      ).first(),
      emailReady: emailReady(env),
    });
  }
  if (path === "/api/host/newsletter/import-link" && method === "POST") {
    await throttle(env, `link:${host.id}`, 30);
    const input = await body(request);
    let page;
    try {
      page = await fetchDiscoveryPage(input.url, env);
    } catch (e) {
      if (e.name === "TimeoutError")
        fail(
          "This source took too long. Try again or enter its details manually.",
          504,
        );
      throw e;
    }
    return response({ draft: draftFromDiscoveryPage(page.html, page.url) });
  }
  if (path === "/api/host/newsletter/sources" && method === "POST") {
    await saveDiscoverySource(env, await body(request));
    return response({ ok: true });
  }
  if (path === "/api/host/newsletter/collect" && method === "POST") {
    await throttle(env, `collect:${host.id}`, 6);
    const sources = await discoverySources(env);
    if (!env.TICKETMASTER_API_KEY && !sources.some((source) => source.enabled))
      fail(
        "Add an automatic website source first, or connect Ticketmaster.",
        503,
      );
    const key = id("manual-run");
    const claimed = await env.DB.prepare(
      "INSERT INTO discovery_runs(key,status,started_at) SELECT ?,'queued',? WHERE NOT EXISTS (SELECT 1 FROM discovery_runs WHERE status IN ('running','queued') AND started_at>?)",
    )
      .bind(key, now(), new Date(Date.now() - 20 * 60000).toISOString())
      .run();
    if (!claimed.meta.changes)
      fail(
        "An event check is already running. Refresh to see its progress.",
        409,
      );
    try {
      if (env.IMPORT_QUEUE) await env.IMPORT_QUEUE.send({ discoveryRun: key });
      else if (ctx) ctx.waitUntil(finishDiscoveryRun(env, key));
      else await finishDiscoveryRun(env, key);
    } catch (e) {
      await env.DB.prepare(
        "UPDATE discovery_runs SET status='failed',finished_at=?,error='Could not queue collection.' WHERE key=?",
      )
        .bind(now(), key)
        .run();
      throw e;
    }
    return response({ key, status: "queued" }, { status: 202 });
  }
  if (path === "/api/host/newsletter/listings" && method === "POST") {
    const input = await body(request),
      listing = validateListing(input),
      care = eventCare(input);
    if (listing.starts_at <= now()) fail("Choose an upcoming event.");
    if (!/\bdublin\b/i.test(listing.venue) && input.confirmDublin !== true)
      fail("Confirm the venue is in Dublin, Ireland.");
    const match = discoveryMatch({ name: listing.title });
    const event = {
      ...listing,
      themes: match.themes,
      match_reason: match.reason,
      discovery_score: match.score,
      id: input.id || id("pick"),
      source: "manual",
      source_id:
        input.id || (await sha256(`${listing.url}:${listing.starts_at}`)),
    };
    if (input.id) {
      const old = await env.DB.prepare(
        "SELECT * FROM discovered_events WHERE id=?",
      )
        .bind(input.id)
        .first();
      if (!old) fail("Manual event not found.", 404);
      await env.DB.prepare(
        "UPDATE discovered_events SET title=?,starts_at=?,ends_at=?,venue=?,category=?,price=?,url=?,status='active',review_status='approved',updated_at=?,themes_json=?,match_reason=?,discovery_score=?,children_welcome=?,childcare=?,care_url=? WHERE id=?",
      )
        .bind(
          listing.title,
          listing.starts_at,
          listing.ends_at,
          listing.venue,
          listing.category,
          listing.price,
          listing.url,
          now(),
          JSON.stringify(match.themes),
          match.reason,
          match.score,
          care.children_welcome,care.childcare,care.care_url,
          old.id,
        )
        .run();
      return response({ ok: true });
    }
    await env.DB.batch([listingStatement(env, event),env.DB.prepare('UPDATE discovered_events SET children_welcome=?,childcare=?,care_url=? WHERE source=? AND source_id=?').bind(care.children_welcome,care.childcare,care.care_url,event.source,event.source_id)]);
    return response({ ok: true });
  }
  if (path === "/api/host/newsletter/hide" && method === "POST") {
    const input = await body(request);
    await env.DB.prepare(
      "UPDATE discovered_events SET status='hidden' WHERE id=?",
    )
      .bind(input.id)
      .run();
    return response({ ok: true });
  }
  if (path === "/api/host/newsletter/review" && method === "POST") {
    const input = await body(request);
    if (!["approved", "rejected"].includes(input.decision))
      fail("Choose approve or skip.");
    const result = await env.DB.prepare(
      "UPDATE discovered_events SET review_status=? WHERE id=? AND status='active' AND review_status='candidate' AND starts_at>?",
    )
      .bind(input.decision, input.id, now())
      .run();
    if (!result.meta.changes)
      fail("This candidate is no longer available.", 409);
    return response({ ok: true });
  }
  if (path === "/api/host/newsletter/prepare" && method === "POST")
    return response({
      issue: await prepareIssue(env, publicOrigin(request, env)),
    });
  const match = path.match(
    /^\/api\/host\/newsletter\/issues\/([^/]+)(?:\/(approve|retry))?$/,
  );
  if (!match) return null;
  const issue = await env.DB.prepare(
    "SELECT * FROM newsletter_issues WHERE id=?",
  )
    .bind(match[1])
    .first();
  if (!issue) fail("Issue not found.", 404);
  const input = await body(request);
  if (method === "PATCH" && !match[2]) {
    const subject = String(input.subject || "").trim(),
      intro = String(input.intro || "").trim();
    if (!subject || subject.length > 120 || !intro || intro.length > 1500)
      fail(
        "Add a subject (up to 120 characters) and introduction (up to 1,500).",
      );
    const ids = [...new Set(input.eventIds || [])];
    if (ids.length < 1 || ids.length > 8) fail("Choose 1–8 events.");
    const available = await listingRows(env),
      picks = ids.map((id) => available.find((e) => e.id === id));
    if (picks.some((e) => !e))
      fail("Some events are no longer available. Refresh your selection.");
    const change = await env.DB.prepare(
      "UPDATE newsletter_issues SET subject=?,intro=?,events_json=?,revision=revision+1 WHERE id=? AND status='draft' AND revision=?",
    )
      .bind(subject, intro, JSON.stringify(picks), issue.id, input.revision)
      .run();
    if (!change.meta.changes)
      fail(
        "This issue changed or was already approved. Refresh before editing.",
        409,
      );
    return response({ ok: true });
  }
  if (method === "POST" && match[2] === "approve") {
    if (issue.status !== "draft" || issue.revision !== input.revision)
      fail(
        "This issue changed or was already approved. Refresh the preview.",
        409,
      );
    if (!emailReady(env))
      fail("Configure email delivery before approving this issue.", 503);
    const available = await listingRows(env),
      picks = JSON.parse(issue.events_json);
    if (
      picks.some(
        (e) =>
          !available.find(
            (a) => a.id === e.id && a.updated_at === e.updated_at,
          ),
      )
    )
      fail(
        "An event changed or expired. Save the selection again to refresh the preview.",
        409,
      );
    const audienceCount = await env.DB.prepare(
      "SELECT count(*) AS n FROM newsletter_subscribers WHERE status='active'",
    ).first();
    if (audienceCount.n > 500)
      fail(
        "This first release supports 500 confirmed subscribers. Increase audience batching before sending.",
      );
    const audience = (
      await env.DB.prepare(
        "SELECT * FROM newsletter_subscribers WHERE status='active' LIMIT 501",
      ).all()
    ).results.filter((s) =>
      matchesInterests(picks, JSON.parse(s.interests_json)),
    );
    if (!audience.length)
      fail("No confirmed subscribers match these picks yet.");
    if (audience.length > 500)
      fail("This first release supports 500 recipients per issue.");
    // JSON row batches keep the 500-recipient audience within D1 query limits.
    const statements = [],
      deliveries = [];
    for (const subscriber of audience) {
      const token = randomToken();
      deliveries.push({
        token_hash: await sha256(token),
        subscriber_id: subscriber.id,
        recipient: subscriber.email,
        id: `newsletter-${issue.id}-${subscriber.id}`,
        body: issueText(
          issue,
          `${issue.origin}/?newsletter=manage#token=${token}`,
        ),
      });
    }
    for (let offset = 0; offset < deliveries.length; offset += 25) {
      const rows = JSON.stringify(deliveries.slice(offset, offset + 25));
      statements.push(
        env.DB.prepare(
          "INSERT INTO newsletter_tokens(token_hash,subscriber_id,created_at) SELECT json_extract(value,'$.token_hash'),json_extract(value,'$.subscriber_id'),? FROM json_each(?) WHERE EXISTS(SELECT 1 FROM newsletter_issues WHERE id=? AND status='draft' AND revision=?)",
        ).bind(now(), rows, issue.id, input.revision),
      );
      statements.push(
        env.DB.prepare(
          "INSERT OR IGNORE INTO newsletter_deliveries(id,issue_id,subscriber_id,recipient,body) SELECT json_extract(value,'$.id'),?,json_extract(value,'$.subscriber_id'),json_extract(value,'$.recipient'),json_extract(value,'$.body') FROM json_each(?) WHERE EXISTS(SELECT 1 FROM newsletter_issues WHERE id=? AND status='draft' AND revision=?) AND EXISTS(SELECT 1 FROM newsletter_subscribers WHERE id=json_extract(value,'$.subscriber_id') AND status='active')",
        ).bind(issue.id, rows, issue.id, input.revision),
      );
    }
    statements.push(
      env.DB.prepare(
        "UPDATE newsletter_issues SET status='queued',approved_at=?,approved_by=? WHERE id=? AND status='draft' AND revision=?",
      ).bind(now(), host.id, issue.id, input.revision),
    );
    const result = await env.DB.batch(statements);
    if (!result.at(-1).meta.changes)
      fail("This issue has already been approved.", 409);
    await deliverNewsletters(env);
    return response({ ok: true, recipients: audience.length });
  }
  if (method === "POST" && match[2] === "retry") {
    await env.DB.prepare(
      "UPDATE newsletter_deliveries SET status='queued',attempts=0 WHERE issue_id=? AND status='failed'",
    )
      .bind(issue.id)
      .run();
    await deliverNewsletters(env);
    return response({ ok: true });
  }
  return null;
}
