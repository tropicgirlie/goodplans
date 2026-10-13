import { ui, dateLocale } from "../i18n/core";
import { OperationsPanel } from "./ServicePages";
import NewsletterStudio from "./NewsletterStudio";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import {
  listHostEvents,
  publishHostEvent,
  hostDashboard,
  updateHostEvent,
  cancelHostEvent,
  inviteGuest,
  retryEmails,
} from "../lib/goodPlansApi";
import { localDate, prettyDate, planDateText, instantForWall, wallDateTime } from "../lib/plans";
import { hostedPlan } from "../lib/hostedPlans";
export default function HostPortal({ user, onLogin, onCreate, selected, tool, issueId, onContext, refreshKey, onChanged, country = 'IE' }) {
  const showOperations = tool === "operations", showNewsletter = tool === "newsletter";
  const setShowOperations = open => onContext({ tool: open ? "operations" : null });
  const setShowNewsletter = open => onContext({ tool: open ? "newsletter" : null, issue: null });
  const setSelected = event => onContext({ event });
  const requestId = useRef(0);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [events, setEvents] = useState([]),
    [detail, setDetail] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [edit, setEdit] = useState(false),
    [confirm, setConfirm] = useState(""),
    [link, setLink] = useState("");
  async function refresh(id = selected) {
    const current = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const [list, dashboard] = await Promise.all([listHostEvents(), id ? hostDashboard(id) : Promise.resolve(null)]);
      if (current !== requestId.current) return;
      setEvents(list.events);
      setDetail(dashboard);
      setLoaded(true);
    } catch (e) { if (current === requestId.current) setError(e.message); }
    finally { if (current === requestId.current) setLoading(false); }
  }
  useEffect(() => {
    setDetail(null); setEdit(false); setConfirm(""); setLink("");
  }, [user?.id, selected]);
  useEffect(() => {
    if (user) void refresh();
    return () => { ++requestId.current; };
  }, [user?.id, selected, refreshKey]);
  async function action(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
      onChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!user)
    return (
      <section className="gp-empty">
        <h2>{ui("Your events")}</h2>
        <p>{ui("Sign in to manage your events, recurring series, invitations and responses.")}</p>
        <button className="gp-button" onClick={onLogin}>{ui("Sign in as host")}</button>
      </section>
    );
  if (showOperations) return <><button className="gp-text-button" onClick={()=>setShowOperations(false)}>{ui("← Back to your events")}</button><OperationsPanel /></>;
  if (showNewsletter)
    return (
      <>
        <button
          className="gp-text-button"
          onClick={() => setShowNewsletter(false)}
        >{ui("← Back to your events")}</button>
        <NewsletterStudio selected={issueId} onSelect={issue => onContext({ issue })} />
      </>
    );
  const event = detail?.event;
  return (
    <section className="host-portal"><button className="gp-text-button" onClick={()=>setShowOperations(true)}>{ui("Help & status")}</button>
      <div className="gp-section-heading">
        <h2>{event?.title || ui("Your events")}</h2>
        <button
          className="gp-button secondary"
          disabled={busy || loading}
          onClick={() => refresh()}
        >
          <RefreshCw />
          {ui(loading ? "Refreshing…" : "Refresh")}
        </button>
      </div>
      {error && (
        <p role="alert" className="gp-error">
          {ui(error)}
        </p>
      )}
      {!selected ? (
        <>
          <div className="host-primary-actions">
          <button
            className="gp-button"
            onClick={() => onCreate({ kind: "Gathering" })}
          >
            <Plus />{ui("Create an event")}</button>
          {country === 'IE' && <button
            className="gp-button secondary"
            onClick={() => setShowNewsletter(true)}
          >{ui("Prepare Dublin email")}</button>}
          </div>
          {country === 'IE' && <p className="host-newsletter-note">
            {ui("Choose Dublin events for a weekly email. It goes only to people who confirm their signup, after you approve it.")}
          </p>}
          {loading && <p role="status">{ui("Loading your events…")}</p>}
          <div className="host-event-list" aria-busy={loading}>
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e.id)}
              >
                <b>{e.title}</b>
                <span>
                  {ui(prettyDate(e.starts_at, {
                    weekday: "short",
                    year: "numeric",
                    timeZone: e.timezone,
                  }))}{" "}
                  · {ui(e.status)}
                </span>
                <small>
                  {e.series_name ? <>{e.series_name} · {ui(e.cadence)}</> : ui("Single event")}
                </small>
              </button>
            ))}
          </div>
          {loaded && !loading && !error && !events.length && (
            <p>{ui("No events here yet. Publish a plan to manage it here.")}</p>
          )}
        </>
      ) : (
        <>
          <button
            className="gp-text-button"
            onClick={() => {
              setSelected(null);
              setDetail(null);
            }}
          >
            <ArrowLeft />{ui("All events")}</button>
          {!event ? (
            <p role="status">{ui(loading ? "Loading event…" : "This event could not be loaded. Refresh to try again, or return to All events.")}</p>
          ) : (
            <>
              <p>
                {ui(planDateText(hostedPlan(event)))} · {event.timezone} · <b>{ui(event.status)}</b>
              </p>
              <p>{event.venue_name}</p>
              <div className="host-counts">
                {Object.entries(detail.counts).map(([key, n]) => (
                  <span key={key}>
                    <b>{ui(n)}</b>
                    {ui(key)}
                  </span>
                ))}
              </div>
              <p className="gp-field-note">{ui("Counts show responses. Each guest’s party size is listed below and included in the capacity check.")}</p>
              {event.status !== "cancelled" && (
                <div className="gp-detail-actions">
                  {event.status === "draft" && (
                    <button
                      className="gp-button"
                      disabled={busy}
                      onClick={() => action(() => publishHostEvent(event.id))}
                    >{ui("Publish event")}</button>
                  )}
                  <button className="gp-button" onClick={() => setEdit(!edit)}>{ui("Edit this occurrence")}</button>
                  <button
                    className="gp-button secondary"
                    onClick={() => setConfirm("event")}
                  >{ui("Cancel event")}</button>
                  {event.series_id && (
                    <button
                      className="gp-button secondary"
                      onClick={() => setConfirm("series")}
                    >{ui("Cancel this and later occurrences")}</button>
                  )}
                </div>
              )}
              {confirm && (
                <div className="gp-publish">
                  <b>
                    {ui(confirm === "series"
                      ? "Cancel this occurrence and the rest of this series?"
                      : "Cancel this event?")}
                  </b>
                  <p>{ui("Guests with email addresses will receive a cancellation notice. Private invite pages will show the cancellation.")}</p>
                  <button
                    className="gp-button"
                    disabled={busy}
                    onClick={() =>
                      action(async () => {
                        await cancelHostEvent(event.id, confirm);
                        setConfirm("");
                      })
                    }
                  >{ui("Confirm cancellation")}</button>
                  <button
                    className="gp-text-button"
                    onClick={() => setConfirm("")}
                  >{ui("Keep the event")}</button>
                </div>
              )}
              {edit && (
                <form
                  className="gp-form host-edit"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    action(async () => {
                      await updateHostEvent(event.id, {
                        title: f.get("title"),
                        startsAt: instantForWall(f.get("start"),event.timezone).toISOString(),
                        endsAt: instantForWall(f.get("end"),event.timezone).toISOString(),
                        timezone: event.timezone,
                        venueName: f.get("venue"),
                        capacity: Number(f.get("capacity")),
                        description: f.get("notes"),
                        revision: event.revision,
                      });
                      setEdit(false);
                    });
                  }}
                >
                  <label>{ui("Event name")}<input
                      name="title"
                      required
                      maxLength={120}
                      defaultValue={event.title}
                    />
                  </label>
                  <div className="gp-form-grid two">
                    {[
                      ["start", "Starts at", event.starts_at],
                      ["end", "Ends at", event.ends_at],
                    ].map(([name, label, iso]) => {
                      const d = new Date(iso);
                      return (
                        <label key={name}>
                          {ui(label)}
                          <input
                            name={name}
                            type="datetime-local"
                            required
                            defaultValue={wallDateTime(d,event.timezone)}
                          />
                        </label>
                      );
                    })}
                  </div>
                  <p className="gp-field-note">{ui("Editing times in")}{" "}
                    {event.timezone}{ui(". Only this occurrence changes.")}</p>
                  <label>{ui("Venue")}<input name="venue" defaultValue={event.venue_name} />
                  </label>
                  <label>{ui("Capacity")}<input
                      name="capacity"
                      type="number"
                      min="1"
                      max="500"
                      required
                      defaultValue={event.capacity}
                    />
                  </label>
                  <label>{ui("Details")}<textarea name="notes" defaultValue={event.description} />
                  </label>
                  <button className="gp-button" disabled={busy}>{ui("Save & notify guests")}</button>
                </form>
              )}
              <h3 className="host-subtitle">{ui("Guest list & responses")}</h3>
              <div className="host-guests">
                {detail.guests.map((g) => (
                  <div key={g.id}>
                    <span>
                      <b>{ui(g.guest_name)}</b>
                      <small>
                        {ui(g.guest_email || "Link-only invitation")} ·{" "}
                        {ui(g.status || "No reply")}
                        {ui(g.party_size === 2 ? " · with a plus-one" : "")}
                      </small>
                    </span>
                    {event.status !== "cancelled" && (
                      <div>
                        <button
                          className="gp-text-button"
                          disabled={busy}
                          onClick={() =>
                            action(async () => {
                              const r = await inviteGuest(event.id, {
                                invitationId: g.id,
                              });
                              setLink(r.inviteUrl);
                            })
                          }
                        >{ui("Get fresh link")}</button>
                        {g.guest_email && (
                          <button
                            className="gp-text-button"
                            disabled={busy}
                            onClick={() =>
                              action(async () => {
                                await inviteGuest(event.id, {
                                  invitationId: g.id,
                                  sendEmail: true,
                                });
                              })
                            }
                          >{ui("Email invitation")}</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {link && (
                <label className="gp-form">{ui("Private link (replaces the previous link for this guest)")}<input
                    readOnly
                    value={link}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
              )}
              {event.status !== "cancelled" && (
                <form
                  className="gp-form host-edit"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget),
                      form = e.currentTarget;
                    action(async () => {
                      const r = await inviteGuest(event.id, {
                        name: f.get("name"),
                        email: f.get("email"),
                        sendEmail: f.get("send") === "on",
                      });
                      setLink(r.inviteUrl);
                      form.reset();
                    });
                  }}
                >
                  <h3>{ui("Add a guest")}</h3>
                  <label>{ui("Name")}<input name="name" required />
                  </label>
                  <label>{ui("Email")}{" "}
                    <span className="gp-optional">{ui("optional for link-only invitations")}</span>
                    <input name="email" type="email" />
                  </label>
                  <label>
                    <input type="checkbox" name="send" />{ui(" Email this invitation now")}</label>
                  <button className="gp-button" disabled={busy}>{ui("Create invitation")}</button>
                </form>
              )}
              <h3 className="host-subtitle">{ui("Email delivery")}</h3>
              {!detail.emailReady && (
                <p className="gp-error">{ui("Email is not configured on this server. You can still copy private links.")}</p>
              )}
              <p className="gp-field-note">{ui("“Sent” means accepted by the email provider, not proof that the guest read it.")}</p>
              {detail.deliveries.map((d) => (
                <p className="host-delivery" key={d.id}>
                  <b>{ui(d.recipient)}</b> — {d.subject} · {ui(d.status)}
                  {d.error && <small>{ui(d.error)}</small>}
                </p>
              ))}
              {detail.deliveries.some((d) => d.status === "failed") && (
                <button
                  className="gp-button secondary"
                  disabled={busy}
                  onClick={() => action(() => retryEmails(event.id))}
                >{ui("Retry failed deliveries")}</button>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
