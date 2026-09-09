import { useEffect, useState } from "react";
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
import { localDate, prettyDate } from "../lib/plans";
export default function HostPortal({ user, onLogin, onCreate }) {
  const [events, setEvents] = useState([]),
    [selected, setSelected] = useState(null),
    [detail, setDetail] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [edit, setEdit] = useState(false),
    [confirm, setConfirm] = useState(""),
    [link, setLink] = useState("");
  async function refresh(id = selected) {
    setError("");
    try {
      const r = await listHostEvents();
      setEvents(r.events);
      if (id) setDetail(await hostDashboard(id));
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    if (user) refresh();
  }, [user]);
  async function action(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!user)
    return (
      <section className="gp-empty">
        <h2>Your organiser portal</h2>
        <p>
          Sign in to manage your events, recurring series, invitations and
          responses.
        </p>
        <button className="gp-button" onClick={onLogin}>
          Sign in as host
        </button>
      </section>
    );
  const event = detail?.event;
  return (
    <section className="host-portal">
      <div className="gp-section-heading">
        <h2>{event?.title || "Your hosted events"}</h2>
        <button
          className="gp-button secondary"
          disabled={busy}
          onClick={() => refresh()}
        >
          <RefreshCw />
          Refresh
        </button>
      </div>
      {error && (
        <p role="alert" className="gp-error">
          {error}
        </p>
      )}
      {!selected ? (
        <>
          <button
            className="gp-button"
            onClick={() => onCreate({ kind: "Gathering" })}
          >
            <Plus />
            Create event or series
          </button>
          <div className="host-event-list">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={async () => {
                  setSelected(e.id);
                  setEdit(false);
                  setConfirm("");
                  setLink("");
                  setDetail(null);
                  await refresh(e.id);
                }}
              >
                <b>{e.title}</b>
                <span>
                  {prettyDate(e.starts_at, {
                    weekday: "short",
                    year: "numeric",
                  })}{" "}
                  · {e.status}
                </span>
                <small>
                  {e.series_name
                    ? `${e.series_name} · ${e.cadence}`
                    : "Single event"}
                </small>
              </button>
            ))}
          </div>
          {!events.length && (
            <p>No hosted events yet. Publish a saved plan to see it here.</p>
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
            <ArrowLeft />
            All events
          </button>
          {!event ? (
            <p role="status">Loading event…</p>
          ) : (
            <>
              <p>
                {prettyDate(event.starts_at, {
                  weekday: "long",
                  year: "numeric",
                })}{" "}
                · {event.timezone} · <b>{event.status}</b>
              </p>
              <p>{event.venue_name}</p>
              <div className="host-counts">
                {Object.entries(detail.counts).map(([key, n]) => (
                  <span key={key}>
                    <b>{n}</b>
                    {key}
                  </span>
                ))}
              </div>
              <p className="gp-field-note">
                Counts show responses. Each guest’s party size is listed below
                and included in the capacity check.
              </p>
              {event.status !== "cancelled" && (
                <div className="gp-detail-actions">
                  {event.status === "draft" && (
                    <button
                      className="gp-button"
                      disabled={busy}
                      onClick={() => action(() => publishHostEvent(event.id))}
                    >
                      Publish event
                    </button>
                  )}
                  <button className="gp-button" onClick={() => setEdit(!edit)}>
                    Edit this occurrence
                  </button>
                  <button
                    className="gp-button secondary"
                    onClick={() => setConfirm("event")}
                  >
                    Cancel event
                  </button>
                  {event.series_id && (
                    <button
                      className="gp-button secondary"
                      onClick={() => setConfirm("series")}
                    >
                      Cancel this and later occurrences
                    </button>
                  )}
                </div>
              )}
              {confirm && (
                <div className="gp-publish">
                  <b>
                    {confirm === "series"
                      ? "Cancel this occurrence and the rest of this series?"
                      : "Cancel this event?"}
                  </b>
                  <p>
                    Guests with email addresses will receive a cancellation
                    notice. Private invite pages will show the cancellation.
                  </p>
                  <button
                    className="gp-button"
                    disabled={busy}
                    onClick={() =>
                      action(async () => {
                        await cancelHostEvent(event.id, confirm);
                        setConfirm("");
                      })
                    }
                  >
                    Confirm cancellation
                  </button>
                  <button
                    className="gp-text-button"
                    onClick={() => setConfirm("")}
                  >
                    Keep the event
                  </button>
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
                        startsAt: new Date(f.get("start")).toISOString(),
                        endsAt: new Date(f.get("end")).toISOString(),
                        timezone:
                          Intl.DateTimeFormat().resolvedOptions().timeZone,
                        venueName: f.get("venue"),
                        capacity: Number(f.get("capacity")),
                        description: f.get("notes"),
                        revision: event.revision,
                      });
                      setEdit(false);
                    });
                  }}
                >
                  <label>
                    Event name
                    <input
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
                          {label}
                          <input
                            name={name}
                            type="datetime-local"
                            required
                            defaultValue={`${localDate(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`}
                          />
                        </label>
                      );
                    })}
                  </div>
                  <p className="gp-field-note">
                    Editing times in{" "}
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}. Only
                    this occurrence changes.
                  </p>
                  <label>
                    Venue
                    <input name="venue" defaultValue={event.venue_name} />
                  </label>
                  <label>
                    Capacity
                    <input
                      name="capacity"
                      type="number"
                      min="1"
                      max="500"
                      required
                      defaultValue={event.capacity}
                    />
                  </label>
                  <label>
                    Details
                    <textarea name="notes" defaultValue={event.description} />
                  </label>
                  <button className="gp-button" disabled={busy}>
                    Save & notify guests
                  </button>
                </form>
              )}
              <h3 className="host-subtitle">Guest list & responses</h3>
              <div className="host-guests">
                {detail.guests.map((g) => (
                  <div key={g.id}>
                    <span>
                      <b>{g.guest_name}</b>
                      <small>
                        {g.guest_email || "Link-only invitation"} ·{" "}
                        {g.status || "No reply"}
                        {g.party_size === 2 ? " · with a plus-one" : ""}
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
                        >
                          Get fresh link
                        </button>
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
                          >
                            Email invitation
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {link && (
                <label className="gp-form">
                  Private link (replaces the previous link for this guest)
                  <input
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
                  <h3>Add a guest</h3>
                  <label>
                    Name
                    <input name="name" required />
                  </label>
                  <label>
                    Email{" "}
                    <span className="gp-optional">
                      optional for link-only invitations
                    </span>
                    <input name="email" type="email" />
                  </label>
                  <label>
                    <input type="checkbox" name="send" /> Email this invitation
                    now
                  </label>
                  <button className="gp-button" disabled={busy}>
                    Create invitation
                  </button>
                </form>
              )}
              <h3 className="host-subtitle">Email delivery</h3>
              {!detail.emailReady && (
                <p className="gp-error">
                  Email is not configured on this server. You can still copy
                  private links.
                </p>
              )}
              <p className="gp-field-note">
                “Sent” means accepted by the email provider, not proof that the
                guest read it.
              </p>
              {detail.deliveries.map((d) => (
                <p className="host-delivery" key={d.id}>
                  <b>{d.recipient}</b> — {d.subject} · {d.status}
                  {d.error && <small>{d.error}</small>}
                </p>
              ))}
              {detail.deliveries.some((d) => d.status === "failed") && (
                <button
                  className="gp-button secondary"
                  disabled={busy}
                  onClick={() => action(() => retryEmails(event.id))}
                >
                  Retry failed deliveries
                </button>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
