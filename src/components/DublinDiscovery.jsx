import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Mail, Plus } from "lucide-react";
import {
  discoveryEvents,
  newsletterSubscribe,
  newsletterManage,
} from "../lib/goodPlansApi";
import { DUBLIN_INTERESTS } from "../lib/discovery";
export function EventPick({ event, onAdd, children }) {
  return (
    <article className="dublin-pick">
      <span className="gp-tag">{event.category}</span>
      <h3>{event.title}</h3>
      <p>
        <CalendarDays size={16} />
        {new Date(event.starts_at).toLocaleString("en-IE", {
          timeZone: "Europe/Dublin",
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        · Dublin time
      </p>
      <p>{event.venue}</p>
      <strong>{event.price}</strong>
      <div className="gp-detail-actions">
        {onAdd && (
          <button className="gp-button" onClick={() => onAdd(event)}>
            <Plus />
            Add to my plans
          </button>
        )}
        <a
          className="gp-text-button"
          href={event.url}
          target="_blank"
          rel="noreferrer"
        >
          Details & tickets
          <ArrowUpRight />
        </a>
      </div>
      {children}
    </article>
  );
}
export function InterestChoices({ value, onChange }) {
  return (
    <fieldset className="dublin-interests">
      <legend>
        Your interests{" "}
        <span className="gp-optional">leave empty for everything</span>
      </legend>
      {DUBLIN_INTERESTS.map((c) => (
        <label key={c}>
          <input
            type="checkbox"
            checked={value.includes(c)}
            onChange={() =>
              onChange(
                value.includes(c)
                  ? value.filter((x) => x !== c)
                  : [...value, c],
              )
            }
          />
          {c}
        </label>
      ))}
    </fieldset>
  );
}
export function NewsletterSignup() {
  const [interests, setInterests] = useState([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [devLink, setDevLink] = useState("");
  return (
    <section className="dublin-signup">
      <div>
        <span className="gp-eyebrow">GOOD PLANS, IN YOUR INBOX</span>
        <h2>Your weekly nudge to get together.</h2>
        <p>
          A small edit of Dublin events, ready to turn into a plan with your
          people. One weekly email. Leave whenever you like.
        </p>
      </div>
      <form
        className="gp-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError("");
          setMessage("");
          try {
            const r = await newsletterSubscribe({
              email: f.get("email"),
              consent: f.get("consent") === "on",
              interests,
              website: f.get("website"),
            });
            setMessage(
              "Check your inbox for a confirmation or preferences link. You are subscribed only after confirming.",
            );
            setDevLink(r.devLink || "");
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <div className="dublin-honey" aria-hidden="true">
          <label>
            Leave this blank
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <InterestChoices value={interests} onChange={setInterests} />
        <label className="dublin-consent">
          <input name="consent" type="checkbox" required />
          Yes, send me Good Plans Dublin each week.
        </label>
        <button className="gp-button" disabled={busy}>
          <Mail />
          {busy ? "Sending confirmation…" : "Send me the good plans"}
        </button>
        {error && (
          <p role="alert" className="gp-error">
            {error}
          </p>
        )}
        <p><a href="/?page=privacy">Privacy & data use</a></p>
        {message && <p role="status">{message}</p>}
        {devLink && (
          <a href={devLink}>Development mailbox: open confirmation</a>
        )}
      </form>
    </section>
  );
}
export default function DublinDiscovery({ onAdd }) {
  const [events, setEvents] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [category, setCategory] = useState("All"),
    [query, setQuery] = useState("");
  useEffect(() => {
    let active = true;
    discoveryEvents()
      .then((r) => {
        if (active) setEvents(r.events);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const visible = events.filter(
    (e) =>
      (category === "All" || e.category === category) &&
      `${e.title} ${e.venue}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="dublin-discovery">
      <span className="gp-eyebrow">A LITTLE INSPIRATION, CLOSE TO HOME</span>
      <h1>This week in Dublin.</h1>
      <p>
        Good reasons to meet up over the next two weeks. Pick an event, make it
        a plan, and bring your people.
      </p>
      <div className="dublin-filters gp-form">
        <label>
          Find an event
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Music, a venue, something you love…"
          />
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["All", ...DUBLIN_INTERESTS].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p role="status">Finding the latest picks…</p>
      ) : error ? (
        <p role="alert" className="gp-error">
          {error}
        </p>
      ) : visible.length ? (
        <div className="dublin-grid">
          {visible.map((e) => (
            <EventPick key={e.id} event={e} onAdd={onAdd} />
          ))}
        </div>
      ) : (
        <div className="gp-empty">
          <h2>
            {events.length
              ? "No picks match that search."
              : "The next good plans are on their way."}
          </h2>
          <p>
            {events.length
              ? "Try another category or search."
              : "Our Dublin shortlist is being prepared. Subscribe below to hear when the next edition is ready."}
          </p>
        </div>
      )}
      <p className="gp-field-note">
        Listings link to their original source. Adding a plan does not book a
        place or reserve tickets.
      </p>
      <NewsletterSignup />
    </section>
  );
}
export function NewsletterPreferences() {
  const [token] = useState(
      () =>
        new URLSearchParams(window.location.hash.slice(1)).get("token") || "",
    ),
    [data, setData] = useState(null),
    [choices, setChoices] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function act(action) {
    setBusy(true);
    setError("");
    try {
      const r = await newsletterManage({ token, action, interests: choices });
      setData(r);
      setChoices(r.interests || []);
      setMessage(action === "preferences" ? "Your interests are saved." : "");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    act("read");
  }, []);
  return (
    <main className="gp-app">
      <section className="dublin-preferences gp-form">
        <a className="gp-text-button" href="/">
          ← Good Plans home
        </a>
        <h1>Your Dublin good plans.</h1>
        {error && (
          <p className="gp-error" role="alert">
            {error}
          </p>
        )}
        {!data && !error && <p>Opening your preferences…</p>}
        {data?.status === "pending" && (
          <>
            <p>
              Confirm that you want one weekly email of Dublin event picks. You
              can unsubscribe here at any time.
            </p>
            <button
              className="gp-button"
              disabled={busy}
              onClick={() => act("confirm")}
            >
              Confirm my subscription
            </button>
          </>
        )}
        {data?.status === "active" && (
          <>
            <p>
              You’re subscribed to Good Plans Dublin. We send issues that
              include at least one of your interests; leave all unchecked to
              receive every edition.
            </p>
            <InterestChoices value={choices} onChange={setChoices} />
            <button
              className="gp-button"
              disabled={busy}
              onClick={() => act("preferences")}
            >
              Save interests
            </button>
            <button
              className="gp-text-button"
              disabled={busy}
              onClick={() => act("unsubscribe")}
            >
              Unsubscribe
            </button>
          </>
        )}
        {data?.status === "unsubscribed" && (
          <p role="status">
            You’re unsubscribed. You won’t receive future newsletters.
          </p>
        )}
        {data && data.status !== "deleted" && <details><summary>Delete newsletter data</summary><p>This permanently removes your subscription and delivery history. You can subscribe again later.</p><button className="gp-text-button" disabled={busy} onClick={()=>act("delete")}>Permanently delete my newsletter data</button></details>}
        {data?.status === "deleted" && <p role="status">Your newsletter data has been deleted.</p>}
        <p><a href="/?page=privacy">Privacy & data use</a></p>
        {message && <p role="status">{message}</p>}
      </section>
    </main>
  );
}
