import { useEffect, useState } from "react";
import {
  newsletterDashboard,
  newsletterAction,
  newsletterSave,
} from "../lib/goodPlansApi";
import { DUBLIN_INTERESTS } from "../lib/discovery";
import { EventPick } from "./DublinDiscovery";
export default function NewsletterStudio() {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState(null);
  async function load() {
    setData(await newsletterDashboard());
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function action(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="newsletter-studio">
      <span className="gp-eyebrow">GOOD PLANS DUBLIN</span>
      <h1>Your weekly edit.</h1>
      <p>
        Collection runs weekly and prepares a draft. Review your picks here,
        then approve the email for confirmed subscribers.
      </p>
      {error && (
        <p role="alert" className="gp-error">
          {error}
        </p>
      )}
      {!data ? (
        <p>Loading newsletter studio…</p>
      ) : (
        <>
          <div className="gp-publish">
            <b>{data.subscribers} confirmed subscribers</b>
            <p>
              {data.collectionReady
                ? "Automatic Ticketmaster collection is connected."
                : "Automatic collection needs TICKETMASTER_API_KEY. You can add local events below."}
            </p>
            {!data.emailReady && (
              <p>
                Email delivery needs RESEND_API_KEY and EMAIL_FROM before signup
                and sending are available.
              </p>
            )}
            <div className="gp-detail-actions">
              <button
                className="gp-button secondary"
                disabled={busy}
                onClick={() => action(() => newsletterAction("collect"))}
              >
                Collect Dublin events
              </button>
              <button
                className="gp-button"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    const r = await newsletterAction("prepare");
                    setSelected(r.issue.id);
                  })
                }
              >
                Prepare this week’s draft
              </button>
              <button
                className="gp-text-button"
                disabled={busy}
                onClick={() => action(load)}
              >
                Refresh
              </button>
            </div>
          </div>
          <details className="newsletter-manual">
            <summary>Add a local event</summary>
            <p>
              Include free activities, workshops and community gatherings. Use
              verified details from the original listing.
            </p>
            <form
              className="gp-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget,
                  f = new FormData(form);
                action(async () => {
                  await newsletterAction("listings", {
                    title: f.get("title"),
                    venue: f.get("venue"),
                    starts_at: new Date(f.get("start")).toISOString(),
                    ends_at: f.get("end")
                      ? new Date(f.get("end")).toISOString()
                      : null,
                    category: f.get("category"),
                    price: f.get("price"),
                    url: f.get("url"),
                  });
                  form.reset();
                });
              }}
            >
              <label>
                Event title
                <input name="title" required maxLength={160} />
              </label>
              <div className="gp-form-grid two">
                <label>
                  Starts at
                  <input name="start" type="datetime-local" required />
                </label>
                <label>
                  Ends at (optional)
                  <input name="end" type="datetime-local" />
                </label>
              </div>
              <p className="gp-field-note">
                Enter times in{" "}
                {Intl.DateTimeFormat().resolvedOptions().timeZone}.
              </p>
              <label>
                Dublin venue
                <input name="venue" required maxLength={240} />
              </label>
              <label>
                Category
                <select name="category">
                  {DUBLIN_INTERESTS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Price
                <input
                  name="price"
                  placeholder="Free, €15, or check booking page"
                  maxLength={100}
                />
              </label>
              <label>
                Original event or booking URL
                <input name="url" type="url" required placeholder="https://…" />
              </label>
              <button className="gp-button" disabled={busy}>
                Add to Dublin picks
              </button>
            </form>
          </details>
          <h2>Newsletter editions</h2>
          <div className="host-event-list">
            {data.issues.map((issue) => (
              <button key={issue.id} onClick={() => setSelected(issue.id)}>
                <b>Week of {issue.week}</b>
                <span>
                  {issue.subject} · {issue.status}
                </span>
              </button>
            ))}
          </div>
          {!data.issues.length && (
            <p>Collect or add events, then prepare your first draft.</p>
          )}
          {data.issues
            .filter((i) => i.id === selected)
            .map((issue) => (
              <IssueEditor
                key={`${issue.id}-${issue.revision}-${issue.status}`}
                issue={issue}
                events={data.events}
                busy={busy}
                action={action}
                emailReady={data.emailReady}
                deliveries={data.deliveries.filter(
                  (d) => d.issue_id === issue.id,
                )}
              />
            ))}
          <details>
            <summary>Collection history</summary>
            {data.runs.length ? (
              data.runs.map((run) => (
                <p key={run.key}>
                  {new Date(run.started_at).toLocaleString()} · {run.status} ·{" "}
                  {run.count} events{" "}
                  {run.error && <span className="gp-error">{run.error}</span>}
                </p>
              ))
            ) : (
              <p>No collections yet.</p>
            )}
          </details>
          <details>
            <summary>Manage visible picks ({data.events.length})</summary>
            {data.events.map((e) => (
              <div className="newsletter-list-row" key={e.id}>
                <span>
                  {e.title} · {new Date(e.starts_at).toLocaleDateString()}
                </span>
                <button
                  className="gp-text-button"
                  disabled={busy}
                  onClick={() =>
                    action(() => newsletterAction("hide", { id: e.id }))
                  }
                >
                  Remove from picks
                </button>
              </div>
            ))}
          </details>
        </>
      )}
    </section>
  );
}
function IssueEditor({ issue, events, busy, action, emailReady, deliveries }) {
  const original = JSON.parse(issue.events_json),
    [ids, setIds] = useState(
      original
        .filter((e) => events.some((a) => a.id === e.id))
        .map((e) => e.id),
    ),
    [subject, setSubject] = useState(issue.subject),
    [intro, setIntro] = useState(issue.intro),
    [confirm, setConfirm] = useState(false);
  const draft = issue.status === "draft",
    dirty =
      subject !== issue.subject ||
      intro !== issue.intro ||
      JSON.stringify(ids) !== JSON.stringify(original.map((e) => e.id));
  return (
    <section className="newsletter-preview">
      <h2>{draft ? "Review your draft" : "Sent / queued edition"}</h2>
      {draft && (
        <form
          className="gp-form"
          onSubmit={(e) => {
            e.preventDefault();
            action(() =>
              newsletterSave(issue.id, {
                subject,
                intro,
                eventIds: ids,
                revision: issue.revision,
              }),
            );
          }}
        >
          <label>
            Email subject
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label>
            Introduction
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              maxLength={1500}
              required
            />
          </label>
          <fieldset className="newsletter-selection">
            <legend>Choose up to 8 events · {ids.length} selected</legend>
            {events.map((e) => (
              <label key={e.id}>
                <input
                  type="checkbox"
                  checked={ids.includes(e.id)}
                  disabled={!ids.includes(e.id) && ids.length >= 8}
                  onChange={() =>
                    setIds(
                      ids.includes(e.id)
                        ? ids.filter((x) => x !== e.id)
                        : [...ids, e.id],
                    )
                  }
                />
                <span>
                  {e.title}
                  <small>
                    {new Date(e.starts_at).toLocaleDateString()} · {e.category}{" "}
                    · {e.price}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <button
            className="gp-button secondary"
            disabled={busy || !ids.length}
          >
            Save preview
          </button>
        </form>
      )}
      <div className="newsletter-paper">
        <span className="gp-eyebrow">SAVED EMAIL PREVIEW</span>
        <h2>{issue.subject}</h2>
        <p className="newsletter-intro">{issue.intro}</p>
        <div className="dublin-grid">
          {original.map((e) => (
            <EventPick key={e.id} event={e}>
              <a
                href={`/?discover=${encodeURIComponent(e.id)}`}
                className="gp-text-button"
              >
                Add to my plans →
              </a>
            </EventPick>
          ))}
        </div>
        <p className="gp-field-note">
          The email includes these events and each subscriber’s
          preferences/unsubscribe link. Only subscribers whose interests match
          this edition receive it.
        </p>
      </div>
      {draft ? (
        <div className="gp-publish">
          {dirty && (
            <p role="status">
              Save your changes to update the preview before sending.
            </p>
          )}
          <label className="dublin-consent">
            <input
              type="checkbox"
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
            />
            I’ve checked the saved preview and want to send this edition.
          </label>
          <button
            className="gp-button"
            disabled={busy || dirty || !confirm || !emailReady}
            onClick={() =>
              action(() =>
                newsletterAction(`issues/${issue.id}/approve`, {
                  revision: issue.revision,
                }),
              )
            }
          >
            Approve & send to subscribers
          </button>
        </div>
      ) : (
        <div className="gp-publish">
          <h3>Delivery progress</h3>
          {deliveries.map((d) => (
            <p key={`${d.status}-${d.error || ""}`}>
              {d.count} {d.status}
              {d.error && <span className="gp-error"> · {d.error}</span>}
            </p>
          ))}
          <p>
            Sent means accepted by the email provider. Queued messages are
            processed every 15 minutes.
          </p>
          {deliveries.some((d) => d.status === "failed") && (
            <button
              className="gp-button secondary"
              disabled={busy}
              onClick={() =>
                action(() => newsletterAction(`issues/${issue.id}/retry`))
              }
            >
              Retry failed newsletter emails
            </button>
          )}
        </div>
      )}
    </section>
  );
}
