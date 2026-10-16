import MaterialSelect from "./MaterialSelect";
import { prettyDate } from "../lib/plans";
import { ui, dateLocale } from "../i18n/core";
import { useEffect, useState } from "react";
import {
  newsletterDashboard,
  newsletterAction,
  newsletterSave,
} from "../lib/goodPlansApi";
import { EventPick } from "./DublinDiscovery";
import DiscoveryManager, { DiscoveryFilters } from "./DiscoveryManager";
import { filterDiscoveryEvents } from "../../shared/discovery-filters";
export default function NewsletterStudio({ selected, onSelect: setSelected }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null),
    [filters, setFilters] = useState({});
  const checking = data?.runs?.some((run) =>
    ["running", "queued"].includes(run.status),
  );
  async function load() {
    setData(await newsletterDashboard());
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!checking) return;
    const timer = setTimeout(
      () => load().catch((e) => setError(e.message)),
      3000,
    );
    return () => clearTimeout(timer);
  }, [data, checking]);
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
      <h1>{ui("Dublin event manager")}</h1>
      <p>
        {ui(
          "Find events, check the details and publish your Dublin picks. Prepare a weekly email when you’re ready; sending always needs your approval.",
        )}
      </p>
      {error && (
        <p role="alert" className="gp-error">
          {ui(error)}
        </p>
      )}
      {!data ? (
        <p role="status">
          {ui(
            error
              ? "The event manager could not load. Reopen it to try again."
              : "Loading event manager…",
          )}
        </p>
      ) : (
        <>
          <DiscoveryManager
            data={data}
            busy={busy}
            action={action}
            editing={editing}
            onEdit={setEditing}
          />
          <div className="gp-publish">
            <b>
              {ui(data.subscribers)}
              {ui(" people signed up")}
            </b>
            <p>
              {ui(
                data.collectionReady
                  ? "Dublin event search is connected and checks for new events daily."
                  : "Automatic event search is not ready yet. You can still add Dublin events below.",
              )}
            </p>
            {data.collectionReady && (
              <p role="status">
                {ui(
                  data.runs?.[0]
                    ? `Last check: ${new Date(data.runs[0].started_at).toLocaleString(dateLocale(), { timeZone: "Europe/Dublin" })} · ${data.runs[0].status}${data.runs[0].error ? ` · ${data.runs[0].error}` : ""}`
                    : "No event search has run yet. Choose Find Dublin events to try it.",
                )}
              </p>
            )}
            {!data.emailReady && (
              <p>
                {ui(
                  "Email signups and sending are not ready yet. Set up the email service to use this feature.",
                )}
              </p>
            )}
            <div className="gp-detail-actions">
              <button
                className="gp-button secondary"
                disabled={busy || checking || !data.collectionReady}
                onClick={() => action(() => newsletterAction("collect"))}
              >
                {ui(checking ? "Checking sources…" : "Find Dublin events")}
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
                {ui("Start this week’s email")}
              </button>
              <button
                className="gp-text-button"
                disabled={busy}
                onClick={() => action(load)}
              >
                {ui("Refresh")}
              </button>
            </div>
          </div>
          <section className="discovery-review">
            <div className="gp-section-heading">
              <div>
                <span className="gp-eyebrow">{ui("EVENTS TO CHECK")}</span>
                <h2>
                  {ui(data.candidates?.length || 0)}
                  {ui(" events to review")}
                </h2>
              </div>
            </div>
            <p>
              {ui(
                "Approve accurate, useful listings before they appear publicly. Women-centred means the source explicitly mentions women; other matches describe the activity or audience without guessing. “Good for two” covers broad partner-friendly ideas and does not assume what either person enjoys.",
              )}
            </p>
            <DiscoveryFilters filters={filters} onChange={setFilters} sources />
            <p role="status">
              {filterDiscoveryEvents(data.candidates || [], filters).length} of{" "}
              {data.candidates?.length || 0} candidates match your filters.
            </p>
            {filterDiscoveryEvents(data.candidates || [], filters).length ? (
              <div className="discovery-candidate-grid">
                {filterDiscoveryEvents(data.candidates, filters).map(
                  (event) => (
                    <article className="discovery-candidate" key={event.id}>
                      <div className="discovery-candidate-score">
                        {event.source === "web"
                          ? "Website discovery"
                          : "Ticketmaster discovery"}
                      </div>
                      <span className="gp-tag">{ui(event.category)}</span>
                      <h3>{event.title}</h3>
                      <p>
                        {ui(
                          new Date(event.starts_at).toLocaleString(
                            dateLocale(),
                            {
                              timeZone: "Europe/Dublin",
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          ),
                        )}
                      </p>
                      <p>
                        {event.venue} · {event.price}
                      </p>
                      <small>
                        Source: {event.source} · checked{" "}
                        {new Date(event.updated_at).toLocaleDateString(
                          "en-IE",
                          { timeZone: "Europe/Dublin" },
                        )}
                      </small>
                      <p>{ui(event.match_reason)}</p>
                      <div className="gp-detail-actions">
                        <a
                          className="gp-text-button"
                          href={event.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {ui("Check source")}
                        </a>
                        <button
                          className="gp-text-button"
                          disabled={busy}
                          onClick={() =>
                            setEditing({ ...event, key: crypto.randomUUID() })
                          }
                        >
                          Edit details
                        </button>
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
                        >
                          {ui("Approve")}
                        </button>
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
                        >
                          {ui("Skip")}
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p>
                {ui(
                  data.collectionReady
                    ? "No new candidates to review. Collection history below shows the latest completed checks."
                    : "No new candidates. Paste a link or enter an event above while automatic discovery is disconnected.",
                )}
              </p>
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
          <h2>{ui("Weekly emails")}</h2>
          <div className="host-event-list">
            {data.issues.map((issue) => (
              <button key={issue.id} onClick={() => setSelected(issue.id)}>
                <b>
                  {ui("Week of ")}
                  {prettyDate(issue.week, { year: "numeric" })}
                </b>
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
                  {ui(new Date(run.started_at).toLocaleString(dateLocale()))} ·{" "}
                  {ui(run.status)} · {ui(run.count)}
                  {ui(" events")}{" "}
                  {run.error && (
                    <span className="gp-error">{ui(run.error)}</span>
                  )}
                </p>
              ))
            ) : (
              <p>{ui("No collections yet.")}</p>
            )}
          </details>
          <details>
            <summary>
              {ui("Manage visible picks (")}
              {ui(data.events.length)})
            </summary>
            {filterDiscoveryEvents(data.events, filters).map((e) => (
              <div className="newsletter-list-row" key={e.id}>
                <span>
                  {e.title} ·{" "}
                  {ui(new Date(e.starts_at).toLocaleDateString(dateLocale()))}
                </span>
                <button
                  className="gp-text-button"
                  disabled={busy}
                  onClick={() => setEditing({ ...e, key: crypto.randomUUID() })}
                >
                  Edit
                </button>
                <button
                  className="gp-text-button"
                  disabled={busy}
                  onClick={() =>
                    action(() => newsletterAction("hide", { id: e.id }))
                  }
                >
                  {ui("Remove from picks")}
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
          <label>
            {ui("Email subject")}
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label>
            {ui("Introduction")}
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              maxLength={1500}
              required
            />
          </label>
          <fieldset className="newsletter-selection">
            <legend>
              {ui("Choose up to 8 events · ")}
              {ui(ids.length)}
              {ui(" selected")}
            </legend>
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
                    {ui(new Date(e.starts_at).toLocaleDateString(dateLocale()))}{" "}
                    · {ui(e.category)} · {e.price}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <button
            className="gp-button secondary"
            disabled={busy || !ids.length}
          >
            {ui("Save preview")}
          </button>
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
              >
                {ui("Add to my plans →")}
              </a>
            </EventPick>
          ))}
        </div>
        <p className="gp-field-note">
          {ui(
            "The email includes these events and each subscriber’s preferences/unsubscribe link. Only subscribers whose interests match this edition receive it.",
          )}
        </p>
      </div>
      {draft ? (
        <div className="gp-publish">
          {dirty && (
            <p role="status">
              {ui("Save your changes to update the preview before sending.")}
            </p>
          )}
          <label className="dublin-consent">
            <input
              type="checkbox"
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
            />
            {ui(
              "I’ve checked the saved preview and want to send this edition.",
            )}
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
            {ui("Approve & send to subscribers")}
          </button>
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
          <p>
            {ui(
              "Sent means accepted by the email provider. Queued messages are processed every 15 minutes.",
            )}
          </p>
          {deliveries.some((d) => d.status === "failed") && (
            <button
              className="gp-button secondary"
              disabled={busy}
              onClick={() =>
                action(() => newsletterAction(`issues/${issue.id}/retry`))
              }
            >
              {ui("Retry failed newsletter emails")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
