import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Compass,
  Copy,
  Download,
  Heart,
  Leaf,
  MapPin,
  Plus,
  Search,
  Settings2,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import HostPortal from "./components/HostPortal";
import useCloudWorkspace from "./lib/useCloudWorkspace";
import OriginalHome from "./components/OriginalHome";
import LoginScreen from "./components/LoginScreen";
import {
  createEvent,
  exchangeInvite,
  getAuthStatus,
  hostDashboard,
  listHostEvents,
  readEvent,
  submitRsvp,
  logout,
} from "./lib/goodPlansApi";
import {
  PLAN_KEY,
  localDate,
  prettyDate,
  validatePlan,
  calendarData,
  invitationText,
} from "./lib/plans";
import "./planner.css";

const inspirations = [
  {
    id: "make",
    title: "Make something",
    short: "Make something",
    category: "Something creative",
    image: "good-plans-invite-collage.png",
    icon: Sparkles,
    description: "Pottery, collage, or an after-hours workshop",
    tone: "peach",
  },
  {
    id: "loud",
    title: "Go somewhere loud",
    short: "Go somewhere loud",
    category: "Something creative",
    image: "good-plans-after-hours-collage.png",
    icon: Sparkles,
    description: "A gig, a tiny cinema, a dance floor",
    tone: "lavender",
  },
  {
    id: "city",
    title: "See your city",
    short: "See your city",
    category: "Outdoors",
    image: "good-plans-gathering-collage.png",
    icon: Leaf,
    description: "A new neighbourhood, market, or exhibition",
    tone: "sage",
  },
  {
    id: "away",
    title: "Get away",
    short: "Get away",
    category: "Outdoors",
    image: "good-plans-hero-collage.png",
    icon: Leaf,
    description: "A day trip, sleepover, or long weekend",
    tone: "peach",
  },

  {
    id: "coffee",
    title: "Coffee, then see where the day goes",
    short: "A little catch-up",
    category: "Food & drink",
    image: "scrapbook_coffee_walk.jpg",
    icon: Coffee,
    description: "A good coffee, a slow walk, and absolutely no rush.",
    cost: "Pay your own way",
    tone: "peach",
  },
  {
    id: "pottery",
    title: "A little clay. A lot of catching up.",
    short: "Make something together",
    category: "Something creative",
    image: "scrapbook_pottery.jpg",
    icon: Sparkles,
    description:
      "Find a pottery workshop and make something wonderfully imperfect.",
    cost: "Check with the venue",
    tone: "lavender",
  },
  {
    id: "walk",
    title: "Fresh air, familiar faces",
    short: "Take the scenic route",
    category: "Outdoors",
    image: "scrapbook_sunset_hike.jpg",
    icon: Leaf,
    description:
      "Pick a walk that suits everyone. Bring a layer and something to share.",
    cost: "Free",
    tone: "sage",
  },
  {
    id: "dinner",
    title: "Good food. Even better company.",
    short: "Everyone brings something",
    category: "Food & drink",
    image: "scrapbook_pizza_games.jpg",
    icon: Heart,
    description:
      "A bring-a-dish evening at home. Add what everyone is bringing to your notes.",
    cost: "Bring a dish",
    tone: "peach",
  },
];
function stored(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(fallback)
      ? Array.isArray(value)
        ? value
        : fallback
      : (value ?? fallback);
  } catch {
    return fallback;
  }
}
function useSaved(key, fallback) {
  const [value, setValue] = useState(() => stored(key, fallback));
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setError("");
    } catch {
      setError(
        "Your browser could not save changes. Keep this tab open and copy your plan details.",
      );
    }
  }, [key, value]);
  return [value, setValue, error];
}
function SyncRecovery({ cloud }) {
  return cloud.error ? (
    <div className="sync-recovery">
      {cloud.conflict ? (
        <>
          <button onClick={cloud.useAccount}>Use account version</button>
          <button onClick={cloud.useDevice}>Use this device’s version</button>
        </>
      ) : (
        <button onClick={cloud.retry}>Retry account sync</button>
      )}
    </div>
  ) : null;
}
function Brand() {
  return (
    <span className="gp-brand">
      <span className="gp-brand-icon">
        <CalendarDays size={23} />
        <Heart size={10} />
      </span>
      good<span>plans</span>
      <i>✳</i>
    </span>
  );
}
function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    ref.current.querySelector("input:not([type=checkbox])")?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`gp-dialog ${wide ? "wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="gp-dialog-content">
        <header>
          <div>
            <p className="gp-eyebrow">A LITTLE TIME TOGETHER</p>
            <h2>{title}</h2>
          </div>
          <button
            className="gp-icon"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
function PlanForm({ initial, people, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    kind: "Friends outing",
    date: "",
    time: "14:00",
    endTime: "16:00",
    location: "",
    guests: [],
    notes: "",
    cost: "",
    capacity: 12,
    cadence: "Once a month",
    occurrences: 3,
    seriesName: "",
    plusOne: false,
    showGuests: true,
    reminder: false,
    guestEmails: {},
    image: "scrapbook_coffee_walk.jpg",
    ...initial,
  });
  const [error, setError] = useState("");
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  return (
    <Modal
      title={initial?.id ? "Make it yours." : "Something to look forward to."}
      onClose={onClose}
      wide
    >
      <form
        className="gp-form"
        onSubmit={(e) => {
          e.preventDefault();
          const message = validatePlan(form);
          if (message) return setError(message);
          onSave({
            ...form,
            id: form.id || crypto.randomUUID(),
            updatedAt: Date.now(),
          });
        }}
      >
        <div className="gp-type-picker">
          {["Friends outing", "Single event", "Gathering"].map((kind) => (
            <button
              type="button"
              key={kind}
              aria-pressed={form.kind === kind}
              className={form.kind === kind ? "selected" : ""}
              onClick={() => update("kind", kind)}
            >
              {kind === "Friends outing" ? (
                <Heart />
              ) : kind === "Single event" ? (
                <CalendarDays />
              ) : (
                <UsersRound />
              )}
              {kind}
            </button>
          ))}
        </div>
        <label>
          Give your plan a name
          <input
            autoFocus
            required
            maxLength={120}
            placeholder="Sunday brunch & a proper catch-up"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </label>
        <div className="gp-form-grid">
          <label>
            Date <span className="gp-optional">optional for now</span>
            <input
              type="date"
              min={localDate()}
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </label>
          <label>
            Starts at
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
            />
          </label>
          <label>
            Ends at
            <input
              type="time"
              required
              value={form.endTime}
              onChange={(e) => update("endTime", e.target.value)}
            />
          </label>
        </div>
        <p className="gp-field-note">
          Times use your device’s timezone:{" "}
          {Intl.DateTimeFormat().resolvedOptions().timeZone}. Leave the date
          blank if you’re still figuring it out.
        </p>
        <label>
          Where are we meeting?
          <input
            maxLength={200}
            placeholder="A café, an address, or ‘we’ll decide together’"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </label>
        <fieldset>
          <legend>Who’s coming along?</legend>
          {people.length ? (
            <div className="gp-friend-picker">
              {people.map((person) => (
                <label key={person.id}>
                  <input
                    type="checkbox"
                    checked={form.guests.includes(person.name)}
                    onChange={(e) =>
                      update(
                        "guests",
                        e.target.checked
                          ? [...form.guests, person.name]
                          : form.guests.filter((name) => name !== person.name),
                      )
                    }
                  />
                  <span className="gp-avatar">{person.name.charAt(0)}</span>
                  {person.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="gp-field-note">
              Add friends in My people, or add names below.
            </p>
          )}
          <label className="gp-guest-input">
            Guest names{" "}
            <span className="gp-optional">separate with commas</span>
            <input
              placeholder="Maya, Katie, Sophie"
              value={form.guests.join(", ")}
              onChange={(e) =>
                update(
                  "guests",
                  e.target.value.split(",").map((name) => name.trimStart()),
                )
              }
            />
          </label>
        </fieldset>
        <div className="gp-form-grid two">
          <label>
            Cost per person
            <input
              maxLength={80}
              placeholder="Free, €15, or pay your own way"
              value={form.cost}
              onChange={(e) => update("cost", e.target.value)}
            />
          </label>
          <label>
            Guest limit
            <input
              required
              type="number"
              min="1"
              max="500"
              value={form.capacity}
              onChange={(e) => update("capacity", Number(e.target.value))}
            />
          </label>
        </div>
        <fieldset className="host-options">
          <legend>Hosting options</legend>
          <label>
            <input
              type="checkbox"
              checked={Boolean(form.seriesName)}
              onChange={(e) =>
                update(
                  "seriesName",
                  e.target.checked ? form.title || "My series" : "",
                )
              }
            />{" "}
            Make this a recurring series
          </label>
          {form.seriesName && (
            <>
              <label>
                Series name
                <input
                  value={form.seriesName}
                  required
                  onChange={(e) => update("seriesName", e.target.value)}
                />
              </label>
              <div className="gp-form-grid two">
                <label>
                  Repeat
                  <select
                    value={form.cadence}
                    onChange={(e) => update("cadence", e.target.value)}
                  >
                    {[
                      "Weekly",
                      "Once a month",
                      "Every six weeks",
                      "Once a quarter",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Occurrences
                  <input
                    type="number"
                    min="2"
                    max="12"
                    required
                    value={form.occurrences}
                    onChange={(e) =>
                      update("occurrences", Number(e.target.value))
                    }
                  />
                </label>
              </div>
              <p className="gp-field-note">
                Creates {form.occurrences} separate events when published, with
                a guest list for each. Monthly dates stay on the same day, or
                the final day of a shorter month.
              </p>
            </>
          )}
          <label>
            <input
              type="checkbox"
              checked={Boolean(form.plusOne)}
              onChange={(e) => update("plusOne", e.target.checked)}
            />{" "}
            Allow one plus-one per guest (counts toward capacity)
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.showGuests !== false}
              onChange={(e) => update("showGuests", e.target.checked)}
            />{" "}
            Show confirmed guest names on the invitation
          </label>
          <label>
            <input
              type="checkbox"
              checked={Boolean(form.reminder)}
              onChange={(e) => update("reminder", e.target.checked)}
            />{" "}
            Email a reminder within 24 hours of each event
          </label>
          <p className="gp-field-note">
            Reminders and update notices go only to guests with email addresses.
            Invitations are sent only when you choose Email invitation in the
            organiser portal.
          </p>
        </fieldset>
        {form.guests.filter((n) => n.trim()).length > 0 && (
          <details>
            <summary>Add guest emails (optional)</summary>
            {[...new Set(form.guests.filter((n) => n.trim()))].map((name) => (
              <label key={name}>
                {name}
                <input
                  type="email"
                  value={form.guestEmails?.[name] || ""}
                  onChange={(e) =>
                    update("guestEmails", {
                      ...form.guestEmails,
                      [name]: e.target.value,
                    })
                  }
                  placeholder="Email for invitations and updates"
                />
              </label>
            ))}
          </details>
        )}
        <label>
          The little details
          <textarea
            rows={3}
            maxLength={3000}
            placeholder="What to bring, accessibility, travel, or just the vibe…"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="gp-error">
            {error}
          </p>
        )}
        <div className="gp-form-footer">
          <span>
            <Bookmark size={14} /> Saved locally; synced when signed in. Invite
            when you’re ready.
          </span>
          <button className="gp-button" type="submit">
            {initial?.id ? "Save changes" : "Save my plan"}
            <ArrowRight />
          </button>
        </div>
      </form>
    </Modal>
  );
}
function PlanDetail({
  plan,
  onClose,
  onEdit,
  onRemove,
  onPublish,
  publishing,
  publishError,
  guest = false,
}) {
  const [feedback, setFeedback] = useState("");
  const [rsvp, setRsvp] = useState(plan.rsvp?.status || null);
  const [partySize, setPartySize] = useState(plan.rsvp?.party_size || 1);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const calendar = calendarData(plan);
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback("Copied. Ready to paste into your group chat.");
    } catch {
      setFeedback(
        "Copying is unavailable. Select and copy the invitation text below.",
      );
    }
  }
  async function respond(status) {
    setBusy(true);
    setFeedback("");
    try {
      const result = await submitRsvp(plan.remoteId, status, partySize);
      setRsvp(result.rsvp.status);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([calendar.ics], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "good-plan.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <Modal title={plan.title} onClose={onClose} wide>
      <div className="gp-detail">
        <img className="gp-detail-cover" src={`/images/${plan.image}`} alt="" />
        <div className="gp-detail-badges">
          <span className="gp-tag">{plan.kind}</span>
          <span className="gp-tag sage">
            {plan.status === "cancelled"
              ? "Cancelled"
              : plan.remoteId
                ? "Published invitation"
                : "Your private draft"}
          </span>
        </div>
        <div className="gp-detail-meta">
          <p>
            <CalendarDays />
            <span>
              <b>
                {prettyDate(plan.date, { weekday: "long", year: "numeric" })}
              </b>
              <small>
                {plan.date
                  ? `${plan.time}–${plan.endTime} · ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
                  : "You can choose a date later"}
              </small>
            </span>
          </p>
          <p>
            <MapPin />
            <span>
              <b>{plan.location || "Somewhere lovely, to be decided"}</b>
              <small>{plan.cost || "Cost to be decided"}</small>
            </span>
          </p>
          <p>
            <UsersRound />
            <span>
              <b>
                {plan.guests?.filter(Boolean).join(", ") ||
                  "The guest list is open"}
              </b>
              <small>
                Up to {plan.capacity} guests
                {!plan.remoteId && " · no invitations sent yet"}
              </small>
            </span>
          </p>
        </div>
        {plan.notes && <p className="gp-detail-notes">{plan.notes}</p>}
        {plan.status === "cancelled" && (
          <p className="gp-error" role="status">
            This event has been cancelled. No further responses are accepted.
          </p>
        )}
        {guest && plan.plusOne && plan.status !== "cancelled" && (
          <label>
            <input
              type="checkbox"
              checked={partySize === 2}
              onChange={(e) => setPartySize(e.target.checked ? 2 : 1)}
            />{" "}
            I’m bringing a plus-one
          </label>
        )}
        {guest ? (
          <div className="gp-detail-actions">
            {[
              ["accepted", "I’m in"],
              ["maybe", "Maybe"],
              ["declined", "Can’t make it"],
            ].map(([status, label]) => (
              <button
                key={status}
                disabled={busy || plan.status === "cancelled"}
                className={
                  rsvp === status ? "gp-button" : "gp-button secondary"
                }
                onClick={() => respond(status)}
              >
                {rsvp === status && <Check />}
                {label}
              </button>
            ))}
            {rsvp && (
              <p role="status">
                {rsvp === "waitlisted"
                  ? "You’re on the waitlist."
                  : "Your response is saved. You can change it here."}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="gp-detail-actions">
              {
                <button className="gp-button" onClick={onEdit}>
                  {plan.remoteId ? "Manage event & guests" : "Edit plan"}
                  <ArrowRight />
                </button>
              }
              <button
                className="gp-button secondary"
                onClick={() => copy(invitationText(plan))}
              >
                <Copy />
                Copy invite text
              </button>
            </div>
            <details className="gp-invite-text">
              <summary>View invitation text</summary>
              <pre>{invitationText(plan)}</pre>
            </details>
          </>
        )}
        {calendar && plan.status !== "cancelled" && (
          <div className="gp-calendar-links">
            <a href={calendar.google} target="_blank" rel="noreferrer">
              <CalendarDays />
              Google Calendar
              <ArrowUpRight />
            </a>
            <button onClick={download}>
              <Download />
              Download .ics
            </button>
          </div>
        )}
        {!guest && !plan.remoteId && (
          <div className="gp-publish">
            <div>
              <b>Ready for RSVPs?</b>
              <p>
                Publish a private invitation with a separate link for each
                guest. Host sign-in and a date are required. You can add guests
                in the organiser portal.
              </p>
            </div>
            <button
              className="gp-button secondary"
              disabled={publishing || !plan.date}
              onClick={onPublish}
            >
              {publishing ? "Publishing…" : "Publish invitation"}
              <ArrowUpRight />
            </button>
          </div>
        )}
        {plan.inviteLinks?.map((link) => (
          <div className="gp-private-link" key={link.invitationId}>
            <span>
              Private invite for <b>{link.guestName}</b>
            </span>
            <button
              className="gp-button secondary"
              onClick={() => copy(link.inviteUrl)}
            >
              <Copy />
              Copy link
            </button>
          </div>
        ))}
        {(feedback || publishError) && (
          <p
            role="status"
            className={publishError ? "gp-error" : "gp-feedback"}
          >
            {publishError || feedback}
          </p>
        )}
        {!guest && !plan.remoteId && (
          <div className="gp-remove">
            {confirmRemove ? (
              <>
                <span>Delete this draft from this device?</span>
                <button onClick={onRemove}>Yes, delete</button>
                <button onClick={() => setConfirmRemove(false)}>Keep it</button>
              </>
            ) : (
              <button onClick={() => setConfirmRemove(true)}>
                Delete draft
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
export default function App() {
  const [plans, setPlans, storageError] = useSaved(PLAN_KEY, []);
  const [saved, setSaved] = useSaved("good-plans-saved-ideas", []);
  const [people, setPeople, peopleError] = useSaved(
    "good-plans-people-v2",
    stored("good-plans-settings", {}).friends || [],
  );
  const [preferences, setPreferences] = useSaved("good-plans-settings", {});
  const [page, setPage] = useState("Overview");
  const [filter, setFilter] = useState("Upcoming");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All ideas");
  const [form, setForm] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [personForm, setPersonForm] = useState(false);
  const [toast, setToast] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [invite, setInvite] = useState(null);
  const [inviteState, setInviteState] = useState(
    window.location.pathname.startsWith("/events/") ? "loading" : "",
  );
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const cloud = useCloudWorkspace(
    user,
    { plans, people, saved, preferences },
    (data) => {
      setPlans(data.plans || []);
      setPeople(data.people || []);
      setSaved(data.saved || []);
      setPreferences(data.preferences || {});
    },
  );
  const friends = Array.isArray(people) ? people : [];
  const active = plans.find((plan) => plan.id === activeId);
  useEffect(() => {
    getAuthStatus()
      .then((result) => setUser(result.user || null))
      .catch(() => {});
    const match = window.location.pathname.match(/^\/events\/([^/]+)$/);
    if (!match) return;
    (async () => {
      try {
        const slug = decodeURIComponent(match[1]);
        const token = new URLSearchParams(window.location.hash.slice(1)).get(
          "invite",
        );
        if (token) {
          await exchangeInvite(token);
          window.history.replaceState(
            {},
            "",
            `/events/${encodeURIComponent(slug)}`,
          );
        }
        const result = await readEvent(slug);
        const e = result.event;
        const start = new Date(e.starts_at);
        const end = new Date(e.ends_at);
        const time = (d) =>
          `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        setInvite({
          id: e.id,
          remoteId: e.id,
          title: e.title,
          date: localDate(start),
          time: time(start),
          endTime: time(end),
          location: [e.venue_name, e.venue_address].filter(Boolean).join(", "),
          notes: e.description,
          capacity: e.capacity,
          guests: result.guests?.map((g) => g.guest_name) || [],
          rsvp: result.rsvp,
          plusOne: Boolean(e.plus_one),
          status: e.status,
          image: "good-plans-gathering-collage.png",
          kind: "Gathering",
        });
        setInviteState("ready");
      } catch {
        setInviteState("error");
      }
    })();
  }, []);
  useEffect(() => {
    if (!user || page !== "My plans") return;
    let disposed = false;
    listHostEvents()
      .then(({ events }) => {
        if (disposed) return;
        setPlans((old) =>
          old.map((p) => {
            const e = events.find((e) => e.id === p.remoteId);
            if (!e) return p;
            const start = new Date(e.starts_at),
              end = new Date(e.ends_at);
            const time = (d) =>
              `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
            return {
              ...p,
              title: e.title,
              status: e.status,
              date: localDate(start),
              time: time(start),
              endTime: time(end),
              location: e.venue_name,
              notes: e.description,
              capacity: e.capacity,
            };
          }),
        );
      })
      .catch((error) => {
        if (!disposed)
          setToast(`Saved events could not refresh: ${error.message}`);
      });
    return () => {
      disposed = true;
    };
  }, [page, user?.id]);
  useEffect(() => {
    if (!active?.remoteId || !user) return;
    let disposed = false;
    hostDashboard(active.remoteId)
      .then(({ event }) => {
        if (disposed) return;
        const start = new Date(event.starts_at),
          end = new Date(event.ends_at);
        const time = (d) =>
          `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        setPlans((old) =>
          old.map((p) =>
            p.id === activeId
              ? {
                  ...p,
                  title: event.title,
                  date: localDate(start),
                  time: time(start),
                  endTime: time(end),
                  location: event.venue_name,
                  notes: event.description,
                  capacity: event.capacity,
                  status: event.status,
                }
              : p,
          ),
        );
      })
      .catch((error) => {
        if (!disposed)
          setToast(`Could not refresh this event: ${error.message}`);
      });
    return () => {
      disposed = true;
    };
  }, [activeId, active?.remoteId, user?.id]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  function navigate(next) {
    setPage(next);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function start(idea, kind = "Friends outing") {
    setForm({
      kind,
      ...(idea
        ? {
            title: idea.short,
            notes: idea.description,
            cost: idea.cost,
            image: idea.image,
          }
        : {}),
    });
  }
  function save(plan) {
    const clean = {
      ...plan,
      guests: [
        ...new Set(plan.guests.map((name) => name.trim()).filter(Boolean)),
      ],
    };
    setPlans((old) =>
      old.some((p) => p.id === clean.id)
        ? old.map((p) => (p.id === clean.id ? clean : p))
        : [...old, clean],
    );
    setForm(null);
    setActiveId(clean.id);
    setToast("A good plan, saved.");
  }
  async function publish() {
    if (!user) {
      setLogin(true);
      return;
    }
    setPublishing(true);
    setPublishError("");
    try {
      const result = await createEvent({
        title: active.title,
        clientId: active.id,
        seriesName: active.seriesName,
        cadence: active.cadence,
        occurrences: active.occurrences,
        plusOne: active.plusOne,
        showGuests: active.showGuests,
        reminder: active.reminder,
        description: [active.notes, active.cost && `Cost: ${active.cost}`]
          .filter(Boolean)
          .join("\n\n"),
        startsAt: new Date(`${active.date}T${active.time}`).toISOString(),
        endsAt: new Date(`${active.date}T${active.endTime}`).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        venueName: active.location,
        capacity: active.capacity,
        visibility: "invite",
        publish: true,
        guests: active.guests.map((name) => ({
          name,
          email: active.guestEmails?.[name],
        })),
      });
      setPlans((old) =>
        old.map((p) =>
          p.id === active.id
            ? {
                ...p,
                remoteId: result.event.id,
                slug: result.event.slug,
                inviteLinks:
                  result.events?.[0]?.inviteLinks || result.inviteLinks,
                status: result.event.status,
              }
            : p,
        ),
      );
      setToast(
        `${result.events?.length || 1} event(s) published. Manage them in the organiser portal.`,
      );
    } catch (error) {
      setPublishError(error.message);
    } finally {
      setPublishing(false);
    }
  }
  const upcoming = plans
    .filter((p) => p.status !== "cancelled" && p.date && p.date >= localDate())
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const visiblePlans = plans
    .filter(
      (p) =>
        (filter === "All plans" ||
          (filter === "Upcoming"
            ? p.status !== "cancelled" && p.date && p.date >= localDate()
            : filter === "Still planning"
              ? !p.date
              : p.date && p.date < localDate())) &&
        `${p.title} ${p.location} ${p.guests.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  const filteredIdeas = inspirations.filter(
    (i) =>
      (category === "All ideas" || i.category === category) &&
      (page !== "Saved ideas" || saved.includes(i.id)),
  );
  function planCard(plan) {
    return (
      <button
        className="gp-plan-card"
        key={plan.id}
        onClick={() => {
          setPublishError("");
          setActiveId(plan.id);
        }}
      >
        <div className="gp-plan-image">
          <img src={`/images/${plan.image}`} alt="" />
          <span className="gp-tag">
            {plan.status === "cancelled"
              ? "Cancelled"
              : plan.remoteId
                ? "Published"
                : plan.date
                  ? "Date set · draft"
                  : "Still planning"}
          </span>
          {plan.date && (
            <span className="gp-date-stamp">
              <b>{prettyDate(plan.date, { day: "2-digit" }).split(" ")[0]}</b>
              {prettyDate(plan.date, { month: "short" }).split(" ").at(-1)}
            </span>
          )}
        </div>
        <div className="gp-plan-body">
          <small>{plan.kind}</small>
          <h3>{plan.title}</h3>
          <p>
            <MapPin />
            {plan.location || "Pick a place together"}
          </p>
          <div>
            <span>
              {plan.guests.length ? (
                <>
                  <UsersRound />
                  {plan.guests.length} on your guest list
                </>
              ) : (
                "Your people, your plan"
              )}
            </span>
            <ArrowUpRight />
          </div>
        </div>
      </button>
    );
  }
  if (login)
    return (
      <LoginScreen
        onBack={() => setLogin(false)}
        onLoginSuccess={(u) => {
          setUser(u);
          setLogin(false);
          setToast("Signed in. You can now publish your invitation.");
        }}
      />
    );
  if (inviteState)
    return (
      <div className="gp-app gp-invite-route">
        <Brand />
        {inviteState === "loading" ? (
          <p role="status">Opening your invitation…</p>
        ) : inviteState === "error" ? (
          <div className="gp-empty">
            <h1>This invitation isn’t available.</h1>
            <p>
              The link may have expired, or the service may be unavailable. Ask
              your host for a fresh invitation.
            </p>
            <a className="gp-button" href="/">
              Go to Good Plans
              <ArrowRight />
            </a>
          </div>
        ) : (
          <PlanDetail
            plan={invite}
            guest
            onClose={() => {
              window.location.href = "/";
            }}
          />
        )}
      </div>
    );
  return (
    <>
      {page === "Overview" && (
        <OriginalHome
          syncError={cloud.error}
          syncRecovery={<SyncRecovery cloud={cloud} />}
          preferences={preferences}
          onPreferencesChange={setPreferences}
          syncStatus={cloud.status}
          onCreate={(draft) => setForm(draft)}
          onManage={navigate}
          onLogin={() => setLogin(true)}
          currentUser={user}
          onLogout={async () => {
            try {
              await logout();
              setUser(null);
            } catch (error) {
              setToast(error.message);
            }
          }}
          saved={saved}
          onBookmark={(id) =>
            setSaved((old) =>
              old.includes(id) ? old.filter((i) => i !== id) : [...old, id],
            )
          }
        />
      )}
      <div
        className={`gp-app scrapbook-tools ${page === "Overview" ? "home-tools" : ""}`}
      >
        {page !== "Overview" && (
          <>
            <a className="gp-skip" href="#main">
              Skip to content
            </a>
            <nav className="nav scrapbook-nav" aria-label="Planning tools">
              <a
                className="brand"
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("Overview");
                }}
              >
                <img
                  className="brand-mark"
                  src="/images/good-plans-mark.png"
                  alt=""
                />
                <span>
                  good
                  <br />
                  <i>plans</i>
                </span>
              </a>
              <div className="scrapbook-links">
                {[
                  "Overview",
                  "My plans",
                  "My people",
                  "Saved ideas",
                  "Organiser portal",
                ].map((label) => (
                  <button
                    key={label}
                    className={page === label ? "active" : ""}
                    onClick={() => navigate(label)}
                  >
                    {label === "Overview" ? "Home" : label}
                  </button>
                ))}
              </div>
              <button className="primary" onClick={() => start()}>
                Create a plan
                <Plus />
              </button>
            </nav>
            <div className="gp-workspace">
              <header className="gp-topbar">
                <span>
                  {page} <span className="gp-topbar-slash">/</span>
                  <span className="gp-muted"> A little more together</span>
                </span>
                <div>
                  <span className="gp-today">
                    <CalendarDays />
                    {prettyDate(localDate(), { weekday: "short" })}
                  </span>
                  <button className="gp-button" onClick={() => start()}>
                    <Plus />
                    Create a plan
                  </button>
                </div>
              </header>
              <main id="main" className="gp-main">
                {cloud.error && (
                  <div role="alert" className="gp-error">
                    {cloud.error}
                    <SyncRecovery cloud={cloud} />
                  </div>
                )}
                {user && (
                  <p className="gp-field-note" role="status">
                    {cloud.status === "synced"
                      ? "Saved to your account"
                      : cloud.status === "syncing"
                        ? "Saving to your account…"
                        : cloud.status === "loading"
                          ? "Loading your account…"
                          : "Sync needs attention"}
                  </p>
                )}
                {page === "Organiser portal" && (
                  <HostPortal
                    user={user}
                    onLogin={() => setLogin(true)}
                    onCreate={setForm}
                  />
                )}
                {page !== "Organiser portal" && (
                  <div className="gp-heading">
                    <div>
                      <p className="gp-eyebrow">
                        YOUR PEOPLE. YOUR KIND OF PLANS.
                      </p>
                      <h1>
                        {page === "Overview"
                          ? "Good things start with a plan."
                          : page === "My plans"
                            ? "Time together, in the diary."
                            : page === "My people"
                              ? "Keep your people close."
                              : "For a “let’s do this” kind of day."}
                      </h1>
                      <p>
                        {page === "Overview"
                          ? "A catch-up, a day out, a just-because gathering. Make room for what matters."
                          : page === "My plans"
                            ? "Everything you’re looking forward to, and the ideas still taking shape."
                            : page === "My people"
                              ? "A little thoughtfulness makes the next get-together easier."
                              : "Your saved inspiration, ready whenever you are."}
                      </p>
                    </div>
                    <span className="gp-heading-flower" aria-hidden="true">
                      ✳
                    </span>
                  </div>
                )}
                {(storageError || peopleError) && (
                  <p role="alert" className="gp-error">
                    {storageError || peopleError}
                  </p>
                )}
                {page === "Overview" && (
                  <>
                    <section className="gp-hero">
                      <div className="gp-hero-copy">
                        <span className="gp-pill">
                          <span />
                          MAKE TIME FOR THE GOOD STUFF
                        </span>
                        <h2>
                          Less “we should.”
                          <br />
                          More <em>“see you there.”</em>
                        </h2>
                        <p>
                          Get your favourite people out of the group chat
                          <br className="gp-desktop" /> and into a really good
                          day.
                        </p>
                        <button className="gp-button" onClick={() => start()}>
                          Let’s make a plan
                          <ArrowUpRight />
                        </button>
                        <span className="gp-hero-foot">
                          <Heart />
                          For two friends or a whole table.
                        </span>
                      </div>
                      <div className="gp-hero-art">
                        <img
                          src="/images/good-plans-hero-collage.png"
                          alt="A paper collage of friends exploring, making things, and spending time together"
                        />
                        <span className="gp-paper-note">
                          life’s better
                          <br />
                          <em>together.</em>
                          <Heart />
                        </span>
                      </div>
                    </section>
                    <div className="gp-shortcuts">
                      {[
                        [
                          Heart,
                          "An outing with friends",
                          "Start with your favourite people",
                          "Friends outing",
                        ],
                        [
                          CalendarDays,
                          "A single event",
                          "One date. Something to look forward to.",
                          "Single event",
                        ],
                        [
                          UsersRound,
                          "A gathering",
                          "Bring your people around one table",
                          "Gathering",
                        ],
                      ].map(([Icon, title, text, kind]) => (
                        <button key={title} onClick={() => start(null, kind)}>
                          <span className="gp-shortcut-icon">
                            <Icon />
                          </span>
                          <span>
                            <b>{title}</b>
                            <small>{text}</small>
                          </span>
                          <ArrowUpRight />
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {(page === "Overview" || page === "My plans") && (
                  <div className="gp-plans-layout">
                    <section className="gp-plans-section">
                      <div className="gp-section-heading">
                        <h2>
                          {page === "Overview"
                            ? "On the horizon"
                            : "Your plans"}
                          <span>{upcoming.length}</span>
                        </h2>
                        {page === "Overview" ? (
                          <button
                            className="gp-text-button"
                            onClick={() => navigate("My plans")}
                          >
                            All my plans
                            <ArrowRight />
                          </button>
                        ) : (
                          <button
                            className="gp-text-button"
                            onClick={() => start()}
                          >
                            <Plus />
                            New plan
                          </button>
                        )}
                      </div>
                      <div className="gp-plan-toolbar">
                        <div className="gp-tabs" aria-label="Filter plans">
                          {[
                            "Upcoming",
                            "Still planning",
                            "Past",
                            ...(page === "My plans" ? ["All plans"] : []),
                          ].map((tab) => (
                            <button
                              key={tab}
                              aria-pressed={filter === tab}
                              className={filter === tab ? "active" : ""}
                              onClick={() => setFilter(tab)}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                        {page === "My plans" && (
                          <label className="gp-search">
                            <Search />
                            <input
                              aria-label="Search plans"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder="Find a plan…"
                            />
                          </label>
                        )}
                      </div>
                      {visiblePlans.length ? (
                        <div className="gp-plan-grid">
                          {visiblePlans
                            .slice(0, page === "Overview" ? 2 : undefined)
                            .map(planCard)}
                        </div>
                      ) : (
                        <div className="gp-empty">
                          <span className="gp-empty-icon">
                            <CalendarDays />
                            <Heart />
                          </span>
                          <h3>
                            {query
                              ? "No plans found."
                              : filter === "Past"
                                ? "The memories are still to come."
                                : filter === "Still planning"
                                  ? "Leave a little room for possibility."
                                  : "Your next good day goes here."}
                          </h3>
                          <p>
                            {query
                              ? "Try another name, place, or friend."
                              : filter === "Past"
                                ? "Past plans will live here after their date."
                                : "Coffee with a friend? A Sunday with everyone? Start small. Make it happen."}
                          </p>
                          {filter !== "Past" && !query && (
                            <button
                              className="gp-button secondary"
                              onClick={() => start()}
                            >
                              <Plus />
                              Create your first plan
                            </button>
                          )}
                        </div>
                      )}
                    </section>
                    <aside className="gp-calendar">
                      <div className="gp-calendar-title">
                        <h3>
                          {new Intl.DateTimeFormat("en-IE", {
                            month: "long",
                            year: "numeric",
                          }).format(month)}
                        </h3>
                        <div>
                          <button
                            className="gp-icon"
                            aria-label="Previous month"
                            onClick={() =>
                              setMonth(
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth() - 1,
                                  1,
                                ),
                              )
                            }
                          >
                            <ChevronLeft />
                          </button>
                          <button
                            className="gp-icon"
                            aria-label="Next month"
                            onClick={() =>
                              setMonth(
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth() + 1,
                                  1,
                                ),
                              )
                            }
                          >
                            <ChevronRight />
                          </button>
                        </div>
                      </div>
                      <div className="gp-calendar-grid">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                          <small key={`day-${i}`}>{d}</small>
                        ))}
                        {Array.from(
                          { length: (month.getDay() + 6) % 7 },
                          (_, i) => (
                            <span key={`blank-${i}`} />
                          ),
                        )}
                        {Array.from(
                          {
                            length: new Date(
                              month.getFullYear(),
                              month.getMonth() + 1,
                              0,
                            ).getDate(),
                          },
                          (_, i) => {
                            const date = localDate(
                              new Date(
                                month.getFullYear(),
                                month.getMonth(),
                                i + 1,
                              ),
                            );
                            const events = plans.filter(
                              (p) =>
                                p.status !== "cancelled" && p.date === date,
                            );
                            return (
                              <button
                                key={date}
                                aria-label={`${prettyDate(date, { month: "long" })}, ${events.length} plans`}
                                className={`${date === localDate() ? "today" : ""} ${events.length ? "has-plan" : ""}`}
                                onClick={() => {
                                  if (events.length === 1) {
                                    setPublishError("");
                                    setActiveId(events[0].id);
                                  } else if (events.length > 1) {
                                    navigate("My plans");
                                    setFilter("All plans");
                                  } else setForm({ date });
                                }}
                              >
                                {i + 1}
                              </button>
                            );
                          },
                        )}
                      </div>
                      <div className="gp-calendar-legend">
                        <i />A little time together
                      </div>
                      <div className="gp-calendar-note">
                        <span>✳</span>
                        <p>
                          {upcoming.length ? (
                            <>
                              <b>
                                {upcoming.length} good{" "}
                                {upcoming.length === 1 ? "thing" : "things"}{" "}
                                ahead.
                              </b>
                              Something to look forward to.
                            </>
                          ) : (
                            <>
                              <b>Good company is the occasion.</b>You don’t need
                              a special reason.
                            </>
                          )}
                        </p>
                      </div>
                    </aside>
                  </div>
                )}
                {(page === "Overview" || page === "Saved ideas") && (
                  <section className="gp-inspiration">
                    <div className="gp-section-heading">
                      <div>
                        <p className="gp-eyebrow">A LITTLE INSPIRATION</p>
                        <h2>
                          {page === "Saved ideas"
                            ? "Your someday starts here."
                            : "What’s your kind of good time?"}
                        </h2>
                      </div>
                      <span className="gp-muted gp-small">
                        Ideas to make your own, wherever you are.
                      </span>
                    </div>
                    <div className="gp-idea-filters">
                      {[
                        "All ideas",
                        "Food & drink",
                        "Something creative",
                        "Outdoors",
                      ].map((c) => (
                        <button
                          key={c}
                          aria-pressed={category === c}
                          className={category === c ? "active" : ""}
                          onClick={() => setCategory(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="gp-idea-grid">
                      {filteredIdeas.map((idea) => (
                        <article
                          className={`gp-idea-card ${idea.tone}`}
                          key={idea.id}
                        >
                          <div className="gp-idea-image">
                            <img
                              src={`/images/${idea.image}`}
                              alt=""
                              loading="lazy"
                            />
                            <button
                              aria-label={`${saved.includes(idea.id) ? "Unsave" : "Save"} ${idea.short}`}
                              aria-pressed={saved.includes(idea.id)}
                              className="gp-save"
                              onClick={() =>
                                setSaved((old) =>
                                  old.includes(idea.id)
                                    ? old.filter((id) => id !== idea.id)
                                    : [...old, idea.id],
                                )
                              }
                            >
                              <Bookmark
                                fill={
                                  saved.includes(idea.id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                            <span className="gp-tag">
                              <idea.icon />
                              {idea.category}
                            </span>
                          </div>
                          <div className="gp-idea-body">
                            <h3>{idea.title}</h3>
                            <p>{idea.description}</p>
                            <button onClick={() => start(idea)}>
                              Make this a plan
                              <ArrowUpRight />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                    {!filteredIdeas.length && (
                      <div className="gp-empty">
                        <Bookmark />
                        <h3>Keep a good idea for later.</h3>
                        <p>Tap the bookmark on an idea to save it here.</p>
                        <button
                          className="gp-button secondary"
                          onClick={() => {
                            setCategory("All ideas");
                            navigate("Overview");
                          }}
                        >
                          Explore ideas
                          <ArrowRight />
                        </button>
                      </div>
                    )}
                  </section>
                )}
                {page === "My people" && (
                  <section>
                    <div className="gp-section-heading">
                      <h2>
                        Your people<span>{friends.length}</span>
                      </h2>
                      <button
                        className="gp-button"
                        onClick={() => setPersonForm(true)}
                      >
                        <Plus />
                        Add a friend
                      </button>
                    </div>
                    <p className="gp-field-note">
                      Private notes stay on this device and are never added to
                      invitations.
                    </p>
                    {friends.length ? (
                      <div className="gp-people-grid">
                        {friends.map((person) => (
                          <article className="gp-person" key={person.id}>
                            <span className="gp-avatar">{person.name[0]}</span>
                            <h3>{person.name}</h3>
                            <p>
                              {person.note ||
                                person.likes ||
                                "A little time together goes a long way."}
                            </p>
                            <button
                              className="gp-text-button"
                              onClick={() => setPersonForm(person)}
                            >
                              Edit details
                            </button>
                            <button
                              className="gp-text-button"
                              onClick={() => setForm({ guests: [person.name] })}
                            >
                              Plan a catch-up
                              <ArrowRight />
                            </button>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="gp-empty">
                        <UsersRound />
                        <h3>It starts with one friend.</h3>
                        <p>
                          Add the people you’d love to see more. Remember the
                          little things they enjoy.
                        </p>
                        <button
                          className="gp-button secondary"
                          onClick={() => setPersonForm(true)}
                        >
                          <Plus />
                          Add your first friend
                        </button>
                      </div>
                    )}
                  </section>
                )}
                <footer className="gp-footer">
                  <span>
                    <Heart />
                    Made for real life. And the people in it.
                  </span>
                  <button
                    className="gp-text-button"
                    onClick={() => setLogin(true)}
                  >
                    Host sign-in
                    <ArrowUpRight />
                  </button>
                  <span>good plans · by luana.systems</span>
                </footer>
              </main>
            </div>
          </>
        )}
        {form && (
          <PlanForm
            initial={form}
            people={friends}
            onSave={save}
            onClose={() => setForm(null)}
          />
        )}
        {active && !form && (
          <PlanDetail
            key={active.id}
            plan={active}
            onClose={() => setActiveId(null)}
            onEdit={() => {
              if (active.remoteId) {
                setActiveId(null);
                navigate("Organiser portal");
              } else setForm(active);
            }}
            onRemove={() => {
              setPlans((old) => old.filter((p) => p.id !== active.id));
              setActiveId(null);
              setToast("Draft deleted.");
            }}
            onPublish={publish}
            publishing={publishing}
            publishError={publishError}
          />
        )}
        {personForm && (
          <Modal
            title="Someone worth making time for."
            onClose={() => setPersonForm(false)}
          >
            <form
              className="gp-form"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const name = data.get("name").trim();
                if (!name) return;
                if (
                  friends.some(
                    (p) =>
                      p.id !== personForm.id &&
                      p.name.toLowerCase() === name.toLowerCase(),
                  )
                ) {
                  setToast("That friend is already in your people.");
                  return;
                }
                const person = {
                  id: personForm.id || crypto.randomUUID(),
                  name,
                  note: data.get("note").trim(),
                };
                setPeople(
                  personForm.id
                    ? friends.map((p) => (p.id === person.id ? person : p))
                    : [...friends, person],
                );
                setPersonForm(false);
              }}
            >
              <label>
                Their name
                <input
                  autoFocus
                  name="name"
                  defaultValue={personForm.name || ""}
                  required
                  maxLength={80}
                  placeholder="e.g. Maya"
                />
              </label>
              <label>
                Little things to remember
                <textarea
                  name="note"
                  defaultValue={personForm.note || personForm.likes || ""}
                  maxLength={500}
                  rows={3}
                  placeholder="Loves a coastal walk, prefers a quiet café…"
                />
              </label>
              <p className="gp-field-note">
                Private to your account and this device. Never shared in
                invitations.
              </p>
              <button className="gp-button" type="submit">
                <Check />
                {personForm.id ? "Save details" : "Add friend"}
              </button>
            </form>
          </Modal>
        )}
        {toast && (
          <div className="gp-toast" role="status">
            <CheckCircle2 />
            {toast}
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
            >
              <X />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
