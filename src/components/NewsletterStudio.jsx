import MaterialSelect from "./MaterialSelect";
import { prettyDate } from "../lib/plans";
import { ui, dateLocale } from "../i18n/core";
import { useEffect, useState } from "react";
import {
  newsletterDashboard,
  newsletterAction,
  newsletterSave,
} from "../lib/goodPlansApi";
import { DUBLIN_INTERESTS } from "../lib/discovery";
import { EventPick } from "./DublinDiscovery";
export default function NewsletterStudio({ selected, onSelect: setSelected }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
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
      <span className="gp-eyebrow">{ui("GOOD PLANS DUBLIN")}</span>
      <h1>{ui("Dublin events email")}</h1>
      <p>{ui("Choose Dublin events and write a weekly email. Only people who confirmed their signup receive it, after you approve it.")}</p>
      {error && (
        <p role="alert" className="gp-error">
          {ui(error)}
        </p>
      )}
      {!data ? (
        <p role="status">{ui(error ? "Dublin email could not load. Reopen it to try again." : "Loading Dublin email…")}</p>
      ) : (
        <>
          <div className="gp-publish">
            <b>{ui(data.subscribers)}{ui(" people signed up")}</b>
            <p>
              {ui(data.collectionReady
                ? "Dublin event search is connected and checks for new events daily."
                : "Automatic event search is not ready yet. You can still add Dublin events below.")}
            </p>
            {data.collectionReady && <p role="status">{ui(data.scheduledCollection
              ? `Last daily check: ${new Date(data.scheduledCollection.started_at).toLocaleString(dateLocale())} · ${data.scheduledCollection.status}${data.scheduledCollection.error ? ` · ${data.scheduledCollection.error}` : ""}`
              : "No event search has run yet. Choose Find Dublin events to try it.")}</p>}
            {!data.emailReady && (
              <p>{ui("Email signups and sending are not ready yet. Set up the email service to use this feature.")}</p>
            )}
            <div className="gp-detail-actions">
              <button
                className="gp-button secondary"
                disabled={busy || !data.collectionReady}
                onClick={() => action(() => newsletterAction("collect"))}
              >{ui("Find Dublin events")}</button>
              <button
                className="gp-button"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    const r = await newsletterAction("prepare");
                    setSelected(r.issue.id);
                  })
                }
              >{ui("Start this week’s email")}</button>
              <button
                className="gp-text-button"
                disabled={busy}
                onClick={() => action(load)}
              >{ui("Refresh")}</button>
            </div>
          </div>
          <section className="discovery-review">
            <div className="gp-section-heading">
              <div>
                <span className="gp-eyebrow">{ui("EVENTS TO CHECK")}</span>
                <h2>{ui(data.candidates?.length || 0)}{ui(" events to review")}</h2>
              </div>
            </div>
            <p>{ui("Approve accurate, useful listings before they appear publicly. Women-centred means the source explicitly mentions women; other matches describe the activity or audience without guessing. “Good for two” covers broad partner-friendly ideas and does not assume what either person enjoys.")}</p>
            {(data.candidates || []).length ? (
              <div className="discovery-candidate-grid">
                {data.candidates.map((event) => (
                  <article className="discovery-candidate" key={event.id}>
                    <div className="discovery-candidate-score">
                      {ui(event.discovery_score)}{ui(" fit")}</div>
                    <span className="gp-tag">{ui(event.category)}</span>
                    <h3>{event.title}</h3>
                    <p>
                      {ui(new Date(event.starts_at).toLocaleString(dateLocale(), {
                        timeZone: "Europe/Dublin",
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }))}
                    </p>
                    <p>{event.venue}</p>
                    <p>{ui(event.match_reason)}</p>
                    <div className="gp-detail-actions">
                      <a
                        className="gp-text-button"
                        href={event.url}
                        target="_blank"
                        rel="noreferrer"
                      >{ui("Check source")}</a>
                      <button
                        className="gp-button"
                        disabled={busy}
                        onClick={() =>
                          action(() =>
                            newsletterAction("review", {
                              id: event.id,
                              decision: "approved",
                            }),
                          )
                        }
                      >{ui("Approve")}</button>
                      <button
                        className="gp-button secondary"
                        disabled={busy}
                        onClick={() =>
                          action(() =>
                            newsletterAction("review", {
                              id: event.id,
                              decision: "rejected",
                            }),
                          )
                        }
                      >{ui("Skip")}</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p>{ui(data.collectionReady ? "No new candidates to review. Collection history below shows the latest completed checks." : "No new candidates. Add a verified local event below while automatic discovery is disconnected.")}</p>
            )}
            <details>
              <summary>{ui("What the finder looks for")}</summary>
              <div className="discovery-search-list">
                {(data.searches || []).map((search) => (
                  <span className="gp-tag" key={search.label}>
                    {ui(search.label)}
                  </span>
                ))}
              </div>
            </details>
          </section>
          <details className="newsletter-manual" open={!data.collectionReady}>
            <summary>{ui("Add a local event")}</summary>
            <p>{ui("Include free activities, workshops and community gatherings. Use verified details from the original listing.")}</p>
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
              <label>{ui("Event title")}<input name="title" required maxLength={160} />
              </label>
              <div className="gp-form-grid two">
                <label>{ui("Starts at")}<input name="start" type="datetime-local" required />
                </label>
                <label>{ui("Ends at (optional)")}<input name="end" type="datetime-local" />
                </label>
              </div>
              <p className="gp-field-note">{ui("Enter times in")}{" "}
                {ui(Intl.DateTimeFormat().resolvedOptions().timeZone)}.
              </p>
              <label>{ui("Dublin venue")}<input name="venue" required maxLength={240} />
              </label>
              <label>{ui("Category")}<MaterialSelect aria-label={ui("Category")} name="category">
                  {DUBLIN_INTERESTS.map((c) => (
                    <option key={c} value={c}>{ui(c)}</option>
                  ))}
                </MaterialSelect>
              </label>
              <label>{ui("Price")}<input
                  name="price"
                  placeholder={ui("Free, €15, or check booking page")}
                  maxLength={100}
                />
              </label>
              <label>{ui("Original event or booking URL")}<input name="url" type="url" required placeholder={ui("https://…")} />
              </label>
              <button className="gp-button" disabled={busy}>{ui("Add to Dublin picks")}</button>
            </form>
          </details>
          <h2>{ui("Weekly emails")}</h2>
          <div className="host-event-list">
            {data.issues.map((issue) => (
              <button key={issue.id} onClick={() => setSelected(issue.id)}>
                <b>{ui("Week of ")}{prettyDate(issue.week, { year: "numeric" })}</b>
                <span>
                  {issue.subject} · {ui(issue.status)}
                </span>
              </button>
            ))}
          </div>
          {!data.issues.length && (
            <p>{ui("Collect or add events, then prepare your first draft.")}</p>
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
            <summary>{ui("Collection history")}</summary>
            {data.runs.length ? (
              data.runs.map((run) => (
                <p key={run.key}>
                  {ui(new Date(run.started_at).toLocaleString(dateLocale()))} · {ui(run.status)} ·{" "}
                  {ui(run.count)}{ui(" events")}{" "}
                  {run.error && <span className="gp-error">{ui(run.error)}</span>}
                </p>
              ))
            ) : (
              <p>{ui("No collections yet.")}</p>
            )}
          </details>
          <details>
            <summary>{ui("Manage visible picks (")}{ui(data.events.length)})</summary>
            {data.events.map((e) => (
              <div className="newsletter-list-row" key={e.id}>
                <span>
                  {e.title} · {ui(new Date(e.starts_at).toLocaleDateString(dateLocale()))}
                </span>
                <button
                  className="gp-text-button"
                  disabled={busy}
                  onClick={() =>
                    action(() => newsletterAction("hide", { id: e.id }))
                  }
                >{ui("Remove from picks")}</button>
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
      <h2>{ui(draft ? "Review your draft" : "Sent / queued edition")}</h2>
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
          <label>{ui("Email subject")}<input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label>{ui("Introduction")}<textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              maxLength={1500}
              required
            />
          </label>
          <fieldset className="newsletter-selection">
            <legend>{ui("Choose up to 8 events · ")}{ui(ids.length)}{ui(" selected")}</legend>
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
                    {ui(new Date(e.starts_at).toLocaleDateString(dateLocale()))} · {ui(e.category)}{" "}
                    · {e.price}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <button
            className="gp-button secondary"
            disabled={busy || !ids.length}
          >{ui("Save preview")}</button>
        </form>
      )}
      <div className="newsletter-paper">
        <span className="gp-eyebrow">{ui("SAVED EMAIL PREVIEW")}</span>
        <h2>{issue.subject}</h2>
        <p className="newsletter-intro">{issue.intro}</p>
        <div className="dublin-grid">
          {original.map((e) => (
            <EventPick key={e.id} event={e}>
              <a
                href={`/?discover=${encodeURIComponent(e.id)}`}
                className="gp-text-button"
              >{ui("Add to my plans →")}</a>
            </EventPick>
          ))}
        </div>
        <p className="gp-field-note">{ui("The email includes these events and each subscriber’s preferences/unsubscribe link. Only subscribers whose interests match this edition receive it.")}</p>
      </div>
      {draft ? (
        <div className="gp-publish">
          {dirty && (
            <p role="status">{ui("Save your changes to update the preview before sending.")}</p>
          )}
          <label className="dublin-consent">
            <input
              type="checkbox"
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
            />{ui("I’ve checked the saved preview and want to send this edition.")}</label>
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
          >{ui("Approve & send to subscribers")}</button>
        </div>
      ) : (
        <div className="gp-publish">
          <h3>{ui("Delivery progress")}</h3>
          {deliveries.map((d) => (
            <p key={`${d.status}-${d.error || ""}`}>
              {ui(d.count)} {ui(d.status)}
              {d.error && <span className="gp-error"> · {ui(d.error)}</span>}
            </p>
          ))}
          <p>{ui("Sent means accepted by the email provider. Queued messages are processed every 15 minutes.")}</p>
          {deliveries.some((d) => d.status === "failed") && (
            <button
              className="gp-button secondary"
              disabled={busy}
              onClick={() =>
                action(() => newsletterAction(`issues/${issue.id}/retry`))
              }
            >{ui("Retry failed newsletter emails")}</button>
          )}
        </div>
      )}
    </section>
  );
}
