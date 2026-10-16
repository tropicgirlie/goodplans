import { DiscoveryFilters } from "./DiscoveryManager";
import { filterDiscoveryEvents } from "../../shared/discovery-filters";
import MaterialSelect from "./MaterialSelect";
import { ui, dateLocale, localeHref } from "../i18n/core";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Mail, Plus } from "lucide-react";
import {
  discoveryEvents,
  newsletterSubscribe,
  newsletterManage,
} from "../lib/goodPlansApi";
import {
  DUBLIN_INTERESTS,
  discoveryThemes,
  fitsPlanningContext,
} from "../lib/discovery";
export function EventPick({ event, onAdd, children }) {
  const themes = discoveryThemes(event);
  return (
    <article className="dublin-pick">
      <div className="dublin-pick-tags">
        <span className="gp-tag">{ui(event.category)}</span>
        {themes.includes("partners") && (
          <span className="gp-tag dublin-context-tag">{ui("Good for two")}</span>
        )}
      </div>
      <h3>{event.title}</h3>
      {event.care_url&&(event.childcare==='provided'||event.children_welcome==='yes')&&<p className="gp-field-note">{event.childcare==='provided'?'Childcare listed by organiser. Confirm age limits, cost and availability.':'Children welcome. This does not mean childcare is provided.'} <a href={event.care_url} target="_blank" rel="noreferrer">Check support details ↗</a></p>}
      <p>
        <CalendarDays size={16} />
        {ui(new Date(event.starts_at).toLocaleString(dateLocale(), {
          timeZone: "Europe/Dublin",
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }))}{" "}{ui("· Dublin time")}</p>
      <p>{event.venue}</p>
      <strong>{event.price}</strong>
      {event.match_reason && (
        <p className="dublin-match-reason">{ui("Why it’s here: ")}{ui(event.match_reason)}</p>
      )}
      <div className="gp-detail-actions">
        {onAdd && (
          <button className="gp-button" onClick={() => onAdd(event)}>
            <Plus />{ui("Add to my plans")}</button>
        )}
        <a
          className="gp-text-button"
          href={event.url}
          target="_blank"
          rel="noreferrer"
        >{ui("Details & tickets")}<ArrowUpRight />
        </a>
      </div>
      {children}
    </article>
  );
}
export function InterestChoices({ value, onChange }) {
  return (
    <fieldset className="dublin-interests">
      <legend>{ui("Your interests")}{" "}
        <span className="gp-optional">{ui("leave empty for everything")}</span>
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
          {ui(c)}
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
        <span className="gp-eyebrow">{ui("GOOD PLANS, IN YOUR INBOX")}</span>
        <h2>{ui("Your weekly nudge to get together.")}</h2>
        <p>{ui("A small edit of Dublin events, ready to turn into a plan with your people. One weekly email. Leave whenever you like.")}</p>
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
        <label>{ui("Email address")}<input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <div className="dublin-honey" aria-hidden="true">
          <label>{ui("Leave this blank")}<input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <InterestChoices value={interests} onChange={setInterests} />
        <label className="dublin-consent">
          <input name="consent" type="checkbox" required />{ui("Yes, send me Good Plans Dublin each week.")}</label>
        <button className="gp-button" disabled={busy}>
          <Mail />
          {ui(busy ? "Sending confirmation…" : "Send me the good plans")}
        </button>
        {error && (
          <p role="alert" className="gp-error">
            {ui(error)}
          </p>
        )}
        <p><a href={localeHref("/?page=privacy")}>{ui("Privacy & data use")}</a></p>
        {message && <p role="status">{ui(message)}</p>}
        {devLink && (
          <a href={devLink}>{ui("Development mailbox: open confirmation")}</a>
        )}
      </form>
    </section>
  );
}
export default function DublinDiscovery({ onAdd }) {
  const [events, setEvents] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [filters, setFilters] = useState({}),
    [planningContext, setPlanningContext] = useState("all");
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
  const visible = filterDiscoveryEvents(events,filters).filter(event=>fitsPlanningContext(event,planningContext));
  return (
    <section className="dublin-discovery">
      <span className="gp-eyebrow">{ui("A LITTLE INSPIRATION, CLOSE TO HOME")}</span>
      <h1>{ui("This week in Dublin.")}</h1>
      <p>{ui("Good reasons to meet up over the next two weeks. Pick an event, make it a plan, and bring your people.")}</p>
      <fieldset className="dublin-context-picker">
        <legend>{ui("Who are you planning with?")}</legend>
        {[
          ["all", "All ideas"],
          ["partner", "My partner"],
          ["friends", "Friends"],
          ["family", "Family or caregiving"],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={planningContext === value}
            className={planningContext === value ? "selected" : ""}
            onClick={() => setPlanningContext(value)}
          >
            {ui(label)}
          </button>
        ))}
      </fieldset>
      {planningContext === "partner" && (
        <p className="dublin-context-copy">{ui("Ideas for time together, including music, comedy, culture, sport, outdoors, workshops, festivals, and food experiences.")}</p>
      )}
      {planningContext==='family'&&<p className="dublin-context-copy">Make time for yourself and your friends. Use the childcare filter for events whose organiser explicitly lists support. Children welcome and childcare provided are separate options; confirm arrangements before booking.</p>}
      <DiscoveryFilters filters={filters} onChange={setFilters}/>
      {loading ? (
        <p role="status">{ui("Finding the latest picks…")}</p>
      ) : error ? (
        <p role="alert" className="gp-error">
          {ui(error)}
        </p>
      ) : visible.length ? (
        <div className="dublin-grid">
          {visible.map((e) => (
            <EventPick
              key={e.id}
              event={e}
              onAdd={(event) => onAdd(event, planningContext)}
            />
          ))}
        </div>
      ) : (
        <div className="gp-empty">
          <h2>
            {ui(events.length
              ? "No picks match that search."
              : "The next good plans are on their way.")}
          </h2>
          <p>
            {ui(events.length
              ? "Try another category or search."
              : "Our Dublin shortlist is being prepared. Subscribe below to hear when the next edition is ready.")}
          </p>
        </div>
      )}
      <p className="gp-field-note">{ui("Listings link to their original source. Adding a plan does not book a place or reserve tickets.")}</p>
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
        <a className="gp-text-button" href={localeHref("/")}>{ui("← Good Plans home")}</a>
        <h1>{ui("Your Dublin good plans.")}</h1>
        {error && (
          <p className="gp-error" role="alert">
            {ui(error)}
          </p>
        )}
        {!data && !error && <p>{ui("Opening your preferences…")}</p>}
        {data?.status === "pending" && (
          <>
            <p>{ui("Confirm that you want one weekly email of Dublin event picks. You can unsubscribe here at any time.")}</p>
            <button
              className="gp-button"
              disabled={busy}
              onClick={() => act("confirm")}
            >{ui("Confirm my subscription")}</button>
          </>
        )}
        {data?.status === "active" && (
          <>
            <p>{ui("You’re subscribed to Good Plans Dublin. We send issues that include at least one of your interests; leave all unchecked to receive every edition.")}</p>
            <InterestChoices value={choices} onChange={setChoices} />
            <button
              className="gp-button"
              disabled={busy}
              onClick={() => act("preferences")}
            >{ui("Save interests")}</button>
            <button
              className="gp-text-button"
              disabled={busy}
              onClick={() => act("unsubscribe")}
            >{ui("Unsubscribe")}</button>
          </>
        )}
        {data?.status === "unsubscribed" && (
          <p role="status">{ui("You’re unsubscribed. You won’t receive future newsletters.")}</p>
        )}
        {data && data.status !== "deleted" && <details><summary>{ui("Delete newsletter data")}</summary><p>{ui("This permanently removes your subscription and delivery history. You can subscribe again later.")}</p><button className="gp-text-button" disabled={busy} onClick={()=>act("delete")}>{ui("Permanently delete my newsletter data")}</button></details>}
        {data?.status === "deleted" && <p role="status">{ui("Your newsletter data has been deleted.")}</p>}
        <p><a href={localeHref("/?page=privacy")}>{ui("Privacy & data use")}</a></p>
        {message && <p role="status">{ui(message)}</p>}
      </section>
    </main>
  );
}
