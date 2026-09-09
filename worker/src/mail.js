import { id, sha256 } from "./core.js";
import { fail } from "./hosting-core.js";
export async function sendEmail(env, { key, to, subject, text, html }) {
  if (await env.DB.prepare('SELECT reason FROM email_suppressions WHERE email_hash=?').bind(await sha256(to.trim().toLowerCase())).first())
    throw Object.assign(new Error('Delivery suppressed after a bounce or complaint.'), { suppressed: true, status: 400 });
  if (env.ENVIRONMENT === "development") {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO local_mailbox (id,recipient,subject,body,created_at) VALUES (?,?,?,?,?)",
    )
      .bind(key, to, subject, text, new Date().toISOString())
      .run();
    return `local:${key}`;
  }
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM)
    fail(
      "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
      503,
    );
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": key,
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [to],
      subject,
      text,
      ...(html ? { html } : {}),
    }),
  });
  if (!result.ok)
    fail(`Email provider rejected delivery (${result.status}).`, 503);
  const data = await result.json();
  if (!data.id) fail("Email provider did not confirm acceptance.", 503);
  return data.id;
}
export function emailStatement(
  env,
  { key = id("mail"), eventId = null, invitationId = null, to, subject, text },
) {
  return env.DB.prepare(
    "INSERT OR IGNORE INTO email_deliveries (id,event_id,invitation_id,recipient,subject,body,created_at) VALUES (?,?,?,?,?,?,?)",
  ).bind(
    key,
    eventId,
    invitationId,
    to,
    subject,
    text,
    new Date().toISOString(),
  );
}
export async function deliverPending(env) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM email_deliveries WHERE status IN ('queued','failed') AND attempts < 5 ORDER BY created_at LIMIT 30",
  ).all();
  for (const row of results) {
    try {
      const provider = await sendEmail(env, {
        key: row.id,
        to: row.recipient,
        subject: row.subject,
        text: row.body,
      });
      await env.DB.prepare(
        "UPDATE email_deliveries SET status='sent',provider_id=?,sent_at=?,error=NULL,attempts=attempts+1 WHERE id=?",
      )
        .bind(provider, new Date().toISOString(), row.id)
        .run();
    } catch (error) {
      await env.DB.prepare(
        "UPDATE email_deliveries SET status=?,error=?,attempts=attempts+1 WHERE id=?",
      )
        .bind(error.suppressed ? "suppressed" : "failed", error.message, row.id)
        .run();
    }
  }
}
export async function queueEventNotice(env, event, kind, invitationId = null) {
  const guests = await env.DB.prepare(
    "SELECT * FROM invitations WHERE event_id=? AND guest_email IS NOT NULL" +
      (kind === "reminder"
        ? " AND NOT EXISTS (SELECT 1 FROM rsvps WHERE invitation_id=invitations.id AND status IN ('declined','waitlisted'))"
        : "") +
      (invitationId ? " AND id=?" : ""),
  )
    .bind(...(invitationId ? [event.id, invitationId] : [event.id]))
    .all();
  const label =
    {
      event_updated: "Plan updated",
      event_cancelled: "Plan cancelled",
      waitlist_promoted: "A place opened for you",
      reminder: "Your plan is coming up",
    }[kind] || "Good Plans update";
  const statements = guests.results.map((g) =>
    emailStatement(env, {
      key: `${kind}-${event.id}-${kind === "reminder" ? event.starts_at : event.revision}-${g.id}`,
      eventId: event.id,
      invitationId: g.id,
      to: g.guest_email,
      subject: `${label}: ${event.title}`,
      text: `${label}: ${event.title}\n\n${event.starts_at} (${event.timezone})\n${event.venue_name || "Venue to be decided"}\n\n${event.description || ""}\n\nOpen your original private invitation link to see the details.`,
    }),
  );
  if (statements.length) await env.DB.batch(statements);
}
export async function processNotifications(env) {
  const notices = await env.DB.prepare(
    "SELECT * FROM notification_outbox WHERE status='queued' LIMIT 20",
  ).all();
  for (const n of notices.results) {
    const e = await env.DB.prepare("SELECT * FROM events WHERE id=?")
      .bind(n.event_id)
      .first();
    if (e) await queueEventNotice(env, e, n.kind, n.invitation_id);
    await env.DB.prepare("DELETE FROM notification_outbox WHERE id=?")
      .bind(n.id)
      .run();
  }
  // The legacy outbox records handoff to per-recipient delivery records; only the latter reports provider acceptance.
  const events = await env.DB.prepare(
    "SELECT * FROM events WHERE status='published' AND reminder=1 AND starts_at>? AND starts_at<=?",
  )
    .bind(
      new Date().toISOString(),
      new Date(Date.now() + 86400000).toISOString(),
    )
    .all();
  for (const event of events.results)
    await queueEventNotice(env, event, "reminder");
  await deliverPending(env);
}
