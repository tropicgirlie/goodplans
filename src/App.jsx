import MaterialSelect from "./components/MaterialSelect";
import { launchSettings, regionDiscoveryLabel } from "./lib/region";
import LanguageSwitcher, { useLocale } from "./i18n/LanguageSwitcher";
import { updateDocumentLanguage } from "./i18n/core";
import { ui, dateLocale, localeHref } from "./i18n/core";
import Artwork from "./components/Artwork";
import ServicePages from "./components/ServicePages";
import DublinDiscovery, {
  NewsletterPreferences,
} from "./components/DublinDiscovery";
import { discoveryDraft } from "./lib/discovery";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Maximize2,
  Minimize2,
  Plus,
  Search,
  Settings2,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import HostPortal from "./components/HostPortal";
import InvitationSettings from './components/InvitationSettings';
import OpenInvitationJoin from './components/OpenInvitationJoin';

import useCloudWorkspace from "./lib/useCloudWorkspace";
import OriginalHome, { defaultSettings } from "./components/OriginalHome";
import AffinityMatchMatrix from "./components/AffinityMatchMatrix";
import SettingsPanel from "./components/SettingsPanel";
import LoginScreen from "./components/LoginScreen";
import {
  createEvent,
  exchangeInvite,
  getAuthStatus,
  hostDashboard,
  listHostEvents,
  discoveryEvent,
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
  planInstants,
  planDateText,
  planOnDate,
} from "./lib/plans";
import { hostedPlan, reconcileHostedPlans } from "./lib/hostedPlans";
import { routeContext, guestRecords, renameDraftGuests, pageFromUrl, pageUrl, mergeSettings, draftDefaults, personError, personRecord, syncConsentEnabled } from "./lib/planningModel";
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
          <button onClick={cloud.useAccount}>{ui("Use account version")}</button>
          <button onClick={cloud.useDevice}>{ui("Use this device’s version")}</button>
        </>
      ) : (
        <button onClick={cloud.retry}>{ui("Retry account sync")}</button>
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
function Modal({ title, onClose, children, wide = false, compact = false }) {
  const ref = useRef();
  const [expanded, setExpanded] = useState(false);
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
      className={`gp-dialog ${wide ? "wide" : ""} ${compact ? "compact-plan" : ""} ${expanded ? "expanded" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="gp-dialog-content">
        <header>
          <div>
            {!compact && <p className="gp-eyebrow">{ui("A LITTLE TIME TOGETHER")}</p>}
            <h2>{title}</h2>
          </div>
          <div className="gp-dialog-controls">
          <LanguageSwitcher />
          {wide && <button className="gp-icon" aria-label={ui(expanded ? "Shrink panel" : "Expand panel")}
            title={ui(expanded ? "Shrink panel" : "Expand panel")} aria-pressed={expanded}
            onClick={() => setExpanded(value => !value)}>
            {expanded ? <Minimize2 /> : <Maximize2 />}
          </button>}
          <button
            className="gp-icon"
            aria-label={ui("Close dialog")}
            onClick={onClose}
          >
            <X />
          </button>
          </div>
        </header>
        {children}
      </div>
    </dialog>
  );
}
function PlanForm({ initial, people, onSave, onClose }) {
  const [form, setForm] = useState(() => { const draft = {
    title: "",
    kind: "Friends outing",
    date: "",
    endDate: "",
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
    visibility:'invite',planType:'own',bookingUrl:'',
    guestEmails: {},
    image: "scrapbook_coffee_walk.jpg",
    ...initial,
  }; return { ...draft, showGuests:draft.visibility==='public'&&initial?.showGuests===undefined?false:draft.showGuests, guestEntries: guestRecords(draft, people) }; });
  const [error, setError] = useState("");
  const update = (key, value) => setForm(old => {
    const next = { ...old, [key]: value };
    return key === "guests" ? { ...next, guestEntries: guestRecords(next, people) } : next;
  });
  return (
    <Modal
      title={ui(initial?.id ? "Edit your plan." : "Make a plan.")}
      onClose={onClose}
      wide
      compact
    >
      <form
        className="gp-form"
        onInvalidCapture={event => {
          // Reveal an invalid optional field before the browser tries to focus it.
          for (let node = event.target.parentElement; node; node = node.parentElement)
            if (node.tagName === "DETAILS") node.open = true;
        }}
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
              {ui(kind)}
            </button>
          ))}
        </div>
        <label>{ui("Give your plan a name")}<input
            autoFocus
            required
            maxLength={120}
            placeholder={ui(form.country !== 'IE' ? 'Coffee with the group' : "Sunday brunch & a proper catch-up")}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </label>
        <InvitationSettings form={form} onChange={setForm}/>
        <details className="gp-schedule" open={form.date || form.endDate ? true : undefined}>
          <summary>{ui(form.date ? "Date & time" : "Add a date & time")}</summary>
        <div className="gp-form-grid">
          <label>{ui("Date ")}<span className="gp-optional">{ui("optional for now")}</span>
            <input
              type="date"
              min={initial?.date && initial.date < localDate(new Date(),form.timezone) ? initial.date : localDate(new Date(),form.timezone)}
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </label>
          <label>{ui("Starts at")}<input
              type="time"
              required
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
            />
          </label>
          <label>{ui("Ends at")}<input
              type="time"
              required
              value={form.endTime}
              onChange={(e) => update("endTime", e.target.value)}
            />
          </label>
        </div>
        <details className="gp-date-options" open={form.endDate ? true : undefined}>
          <summary>{ui("Overnight or a few days away?")}</summary>
          <label>{ui("End date ")}<span className="gp-optional">{ui("same day if left blank")}</span>
            <input type="date" min={form.date || localDate(new Date(),form.timezone)} value={form.endDate}
              onChange={e => update("endDate", e.target.value)} />
          </label>
        </details>
        <label>{ui("Event timezone")}<MaterialSelect aria-label={ui("Event timezone")} value={form.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone} onChange={event=>update("timezone",event.target.value)}>{[...new Set([form.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,"Europe/Dublin"])].map(zone=><option value={zone} key={zone}>{zone}</option>)}</MaterialSelect></label>
        <p className="gp-field-note">{ui("Times in ")}{form.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}{ui(". The date can wait.")}</p>
        </details>
        <label>{ui("Where are we meeting?")}<input
            maxLength={200}
            placeholder={ui("A café, an address, or ‘we’ll decide together’")}
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </label>
        <fieldset>
          <legend>{ui("Who’s coming along?")}</legend>
          {people.length ? (
            <div className="gp-friend-picker">
              {people.map((person) => (
                <label key={person.id}>
                  <input
                    type="checkbox"
                    checked={form.guestEntries.some(g => g.personId === person.id)}
                    onChange={(e) =>
                      update(
                        "guests",
                        e.target.checked
                          ? [...form.guests, person.name]
                          : form.guests.filter(name => name.trim().toLocaleLowerCase() !== person.name.toLocaleLowerCase()),
                      )
                    }
                  />
                  <span className="gp-avatar">{person.name.charAt(0)}</span>
                  {person.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="gp-field-note">{ui("Add friends in My people, or add names below.")}</p>
          )}
          <details className="gp-extra-guests" open={!people.length || form.guestEntries.some(g => !g.personId) ? true : undefined}>
          <summary>{ui("Add or edit guest names")}</summary>
          <label className="gp-guest-input">{ui("Guest names")}{" "}
            <span className="gp-optional">{ui("separate with commas")}</span>
            <input
              placeholder={form.country === 'BR' ? 'Ana, Camila, Joana' : ui("Maya, Katie, Sophie")}
              value={form.guests.join(", ")}
              onChange={(e) =>
                update(
                  "guests",
                  e.target.value.split(",").map((name) => name.trimStart()),
                )
              }
            />
          </label>
          </details>
        </fieldset>
        <div className="gp-plan-extras">
        <details className="gp-plan-notes" open={form.notes ? true : undefined}>
          <summary>{ui("Notes & practical details")}</summary>
        <label>{ui("The little details")}<textarea
            rows={2}
            maxLength={3000}
            placeholder={ui("What to bring, accessibility, travel, or just the vibe…")}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </label>
        </details>
        <details className="gp-hosting-disclosure" open={form.kind !== "Friends outing" || form.seriesName ? true : undefined}>
          <summary>{ui("Invitations & series")}</summary>
          <p className="gp-field-note">{ui("Saving keeps this plan private. Publishing an RSVP invitation is a separate step, available to signed-in hosts.")}</p>
        <div className="gp-form-grid two">
          <label>{ui("Cost per person")}<input
              maxLength={80}
              placeholder={ui(form.currency === "BRL" ? "Free, R$ 30, or pay your own way" : "Free, €15, or pay your own way")}
              value={form.cost}
              onChange={(e) => update("cost", e.target.value)}
            />
          </label>
          <label>{ui("Guest limit")}<input
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
          <legend>{ui("Hosting options")}</legend>
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
            />{" "}{ui("Make this a recurring series")}</label>
          {form.seriesName && (
            <>
              <label>{ui("Series name")}<input
                  value={form.seriesName}
                  required
                  onChange={(e) => update("seriesName", e.target.value)}
                />
              </label>
              <div className="gp-form-grid two">
                <label>{ui("Repeat")}<MaterialSelect aria-label={ui("Repeat")}
                    value={form.cadence}
                    onChange={(e) => update("cadence", e.target.value)}
                  >
                    {[
                      "Weekly",
                      "Once a month",
                      "Every six weeks",
                      "Once a quarter",
                    ].map((c) => (
                      <option key={c} value={c}>{ui(c)}</option>
                    ))}
                  </MaterialSelect>
                </label>
                <label>{ui("Occurrences")}<input
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
              <p className="gp-field-note">{ui("Creates ")}{ui(form.occurrences)}{ui(" separate events when published, with a guest list for each. Monthly dates stay on the same day, or the final day of a shorter month.")}</p>
            </>
          )}
          <label>
            <input
              type="checkbox"
              checked={Boolean(form.plusOne)}
              onChange={(e) => update("plusOne", e.target.checked)}
            />{" "}{ui("Allow one plus-one per guest (counts toward capacity)")}</label>
          <label>
            <input
              type="checkbox"
              checked={form.showGuests !== false}
              onChange={(e) => update("showGuests", e.target.checked)}
            />{" "}{ui("Show confirmed guest names on the invitation")}</label>
          <label>
            <input
              type="checkbox"
              checked={Boolean(form.reminder)}
              onChange={(e) => update("reminder", e.target.checked)}
            />{" "}{ui("Email a reminder within 24 hours of each event")}</label>
          <p className="gp-field-note">{ui("Reminders and update notices go only to guests with email addresses. Invitations are sent only when you choose Email invitation in the organiser portal.")}</p>
        </fieldset>
        {form.guestEntries.length > 0 && (
          <details>
            <summary>{ui("Add guest emails (optional)")}</summary>
            {form.guestEntries.map(guest => (
              <label key={guest.id}>{guest.name}
                <input type="email" value={guest.email || ""}
                  onChange={e => update("guestEntries", form.guestEntries.map(g => g.id === guest.id ? { ...g, email: e.target.value } : g))}
                  placeholder={ui("Email for invitations and updates")} />
              </label>
            ))}
          </details>
        )}
        </details>
        </div>
        {error && (
          <p role="alert" className="gp-error">
            {ui(error)}
          </p>
        )}
        <div className="gp-form-footer">
          <span>
            <Bookmark size={14} />{ui(" Private draft · saved on this device")}</span>
          <button className="gp-button" type="submit">
            {ui(initial?.id ? "Save changes" : "Save my plan")}
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
  onRefresh,
  guest = false,
}) {
  const [feedback, setFeedback] = useState("");
  const [rsvp, setRsvp] = useState(plan.rsvp?.status || null);
  const [partySize, setPartySize] = useState(plan.rsvp?.party_size || 1);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  useEffect(() => {
    setRsvp(plan.rsvp?.status || null);
    setPartySize(plan.rsvp?.party_size || 1);
  }, [plan.rsvp?.status, plan.rsvp?.party_size]);
  const calendar = calendarData(plan);
  const ended = plan.visibility==='public' && plan.endsAt && +new Date(plan.endsAt)<=Date.now();
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
      const result = await submitRsvp(plan.remoteId, status, partySize, plan.invitationId);
      setRsvp(result.rsvp.status);
      if (onRefresh) await onRefresh();
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
        <Artwork className="gp-detail-cover" src={`/images/${plan.image}`} alt="" />
        <div className="gp-detail-badges">
          <span className="gp-tag">{ui(plan.seriesName ? "Series occurrence" : plan.planType==='attend'?"Joining an event":plan.kind)}</span>
          <span className="gp-tag sage">
            {ui(plan.status === "cancelled"
              ? "Cancelled"
              : plan.remoteId
                ? (plan.visibility==='public'?"Open invitation":"Private invitation")
                : "Your private draft")}
          </span>
        </div>
        {guest && <p className="gp-invitation-identity" role="status">{plan.invitee ? <>{plan.visibility==='public'?'Your response, ':ui("Invitation for ")}<strong>{plan.invitee}</strong></> : plan.visibility==='public'?'You’re invited to join. Share this link with friends.':ui("Open your personal invitation link to respond.")}</p>}
        <div className="gp-detail-meta">
          <p>
            <CalendarDays />
            <span>
              <b>{ui(planDateText(plan))}</b>
              <small>
                {ui(plan.date
                  ? plan.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
                  : "You can choose a date later")}
              </small>
            </span>
          </p>
          <p>
            <MapPin />
            <span>
              <b>{plan.location || ui("Somewhere lovely, to be decided")}</b>
              <small>{plan.cost || ui("Cost to be decided")}</small>
            </span>
          </p>
          <p>
            <UsersRound />
            <span>
              <b>
                {guest && !plan.showGuests ? 'Guest names are private' : plan.guests?.filter(Boolean).join(", ") || (plan.visibility==='public'?'An open invitation to join me':ui("The guest list is open"))}
              </b>
              <small>{ui(plan.planType==='attend'?"Our group: up to ":"Up to ")}{ui(plan.capacity)}{ui(" guests")}{ui(plan.counts && ` · ${plan.counts.accepted || 0} confirmed · ${plan.counts.waitlisted || 0} waitlisted`)}
                {ui(!plan.remoteId && " · no invitations sent yet")}
              </small>
            </span>
          </p>
        </div>
        {plan.notes && <p className="gp-detail-notes">{plan.notes}</p>}
        {plan.bookingUrl && <p><a className="gp-button secondary" href={plan.bookingUrl} target="_blank" rel="noreferrer">{plan.planType==='attend'?'Get tickets / booking':'Booking details'}<ArrowUpRight/></a></p>}
        {plan.planType==='attend'&&<p className="gp-field-note">This invitation is to join the host’s group. An RSVP does not buy or reserve a ticket for the original event.</p>}
        {plan.status === "cancelled" && (
          <p className="gp-error" role="status">{plan.planType==='attend'?'This meet-up is cancelled. The original event may still go ahead; check with the ticket provider.':ui("This event has been cancelled. No further responses are accepted.")}</p>
        )}
        {guest && plan.plusOne && !ended && plan.status !== "cancelled" && (
          <label>
            <input
              type="checkbox"
              checked={partySize === 2}
              onChange={(e) => setPartySize(e.target.checked ? 2 : 1)}
            />{" "}{ui("I’m bringing a plus-one")}</label>
        )}
        {guest && ended ? <p role="status">This meet-up has ended. Responses are closed.</p> : guest && plan.visibility==='public' && !plan.invitationId && plan.status!=='cancelled' ? <OpenInvitationJoin plan={plan} partySize={partySize} onJoined={onRefresh}/> : guest ? (
          <div className="gp-detail-actions">
            {[
              ["accepted", "I’m in"],
              ["maybe", "Maybe"],
              ["declined", "Can’t make it"],
            ].map(([status, label]) => (
              <button
                key={status}
                disabled={busy || plan.status === "cancelled" || !plan.invitationId}
                aria-pressed={rsvp === status}
                className={
                  rsvp === status ? "gp-button" : "gp-button secondary"
                }
                onClick={() => respond(status)}
              >
                {rsvp === status && <Check />}
                {ui(label)}
              </button>
            ))}
            {rsvp && (
              <p role="status">
                {ui(`Your response: ${ui({ accepted: "Going", maybe: "Maybe", declined: "Can’t make it", waitlisted: "Waitlisted" }[rsvp] || rsvp)}${["accepted", "waitlisted"].includes(rsvp) ? ` · ${plan.rsvp?.party_size || partySize} ${ui(((plan.rsvp?.party_size || partySize) === 1) ? "person" : "people")}` : ""}. `)}
                {ui(plan.status !== "cancelled" ? "You can change it here." : "Kept as response history.")}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="gp-detail-actions">
              {
                <button className="gp-button" onClick={onEdit}>
                  {ui(plan.remoteId ? "Manage event & guests" : "Edit plan")}
                  <ArrowRight />
                </button>
              }
              <button
                className="gp-button secondary"
                onClick={() => copy(invitationText(plan))}
              >
                <Copy />{ui("Copy invite text")}</button>
            </div>
            <details className="gp-invite-text">
              <summary>{ui("View invitation text")}</summary>
              <pre>{ui(invitationText(plan))}</pre>
            </details>
          </>
        )}
        {calendar && plan.status !== "cancelled" && (
          <div className="gp-calendar-links">
            <a href={calendar.google} target="_blank" rel="noreferrer">
              <CalendarDays />{ui("Google Calendar")}<ArrowUpRight />
            </a>
            <button onClick={download}>
              <Download />{ui("Download .ics")}</button>
          </div>
        )}
        {!guest && !plan.remoteId && (
          <div className="gp-publish">
            <div>
              <b>{ui("Ready for RSVPs?")}</b>
              <p>{plan.visibility==='public'?'Publish an open link you can post in your group chat. Anyone with it can join; ticket booking stays separate.':ui("Publish a private invitation with a separate link for each guest. Host sign-in and a date are required. You can add guests in the organiser portal.")}</p>
            </div>
            <button
              className="gp-button secondary"
              disabled={publishing || !plan.date}
              onClick={onPublish}
            >
              {ui(publishing ? "Publishing…" : "Publish invitation")}
              <ArrowUpRight />
            </button>
          </div>
        )}
        {plan.inviteLinks?.map((link) => (
          <div className="gp-private-link" key={link.invitationId}>
            <span>{ui("Private invite for ")}<b>{ui(link.guestName)}</b>
            </span>
            <button
              className="gp-button secondary"
              onClick={() => copy(link.inviteUrl)}
            >
              <Copy />{ui("Copy link")}</button>
          </div>
        ))}
        {!guest && plan.remoteId && plan.visibility==='public'&&plan.publicUrl&&<div className="gp-private-link"><span>Open invitation · anyone with this link can join</span><button className="gp-button secondary" onClick={()=>copy(plan.publicUrl)}><Copy/>Copy open invitation link</button></div>}
        {(feedback || publishError) && (
          <p
            role="status"
            className={publishError ? "gp-error" : "gp-feedback"}
          >
            {ui(publishError || feedback)}
          </p>
        )}
        {!guest && !plan.remoteId && (
          <div className="gp-remove">
            {confirmRemove ? (
              <>
                <span>{ui("Delete this draft from this device?")}</span>
                <button onClick={onRemove}>{ui("Yes, delete")}</button>
                <button onClick={() => setConfirmRemove(false)}>{ui("Keep it")}</button>
              </>
            ) : (
              <button onClick={() => setConfirmRemove(true)}>{ui("Delete draft")}</button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
export default function App() {
  const language = useLocale();
  useEffect(() => { updateDocumentLanguage(); }, [language]);
  const [plans, setPlans, storageError] = useSaved(PLAN_KEY, []);
  const [saved, setSaved] = useSaved("good-plans-saved-ideas", []);
  const [people, setPeople, peopleError] = useSaved(
    "good-plans-people-v2",
    stored("good-plans-settings", {}).friends || [],
  );
  const [preferences, setPreferences] = useSaved("good-plans-settings", {});
  const [page, setPage] = useState(() => pageFromUrl(window.location.search));
  const [filter, setFilter] = useState("Upcoming");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All ideas");
  const [form, setForm] = useState(null);
  const [route, setRoute] = useState(() => routeContext(window.location.search));
  const activeId = route.plan;
  const [hostRefresh, setHostRefresh] = useState(0);
  const [pendingContext, setPendingContext] = useState({});
  const [login, setLogin] = useState(false);
  const [pendingPage, setPendingPage] = useState("Organiser portal");
  const [planningSettings, setPlanningSettings] = useState(false);
  const [circleSelection, setCircleSelection] = useState([]);
  const [user, setUser] = useState(null);
  const [personForm, setPersonForm] = useState(false);
  const [personFormError, setPersonFormError] = useState("");
  useEffect(() => { setPersonFormError(""); }, [personForm]);
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
  const [syncConsents, setSyncConsents] = useSaved("good-plans-sync-consents-v1", {});
  const [confirmSync, setConfirmSync] = useState(false);
  const syncEnabled = syncConsentEnabled(syncConsents, user);
  const cloud = useCloudWorkspace(
    syncEnabled ? user : null,
    { plans, people, saved, preferences },
    (data) => {
      setPlans(data.plans || []);
      setPeople(data.people || []);
      setSaved(data.saved || []);
      setPreferences(data.preferences || {});
    },
  );
  const friends = Array.isArray(people) ? people : [];
  const settings = launchSettings(defaultSettings, preferences, friends);
  const selectedCircle = useMemo(() => circleSelection.filter(id => friends.some(f => f.id === id)), [circleSelection, friends]);
  useEffect(() => {
    const back = () => { setPage(pageFromUrl(window.location.search)); setRoute(routeContext(window.location.search)); setPlanningSettings(false); setForm(null); };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  const active = plans.find((plan) => plan.id === activeId);
  useEffect(() => {
    getAuthStatus().then(result => setUser(result.user || null)).catch(() => {});
  }, []);
  const inviteRequest = useRef(0);
  const invitationContexts = useRef(new Map());
  const [inviteError, setInviteError] = useState("");
  async function refreshInvitation({ incoming = false } = {}) {
    const match = window.location.pathname.match(/^\/events\/([^/]+)$/);
    if (!match) return;
    const requestId = ++inviteRequest.current;
    if (incoming) { setInviteState("loading"); setInvite(null); }
    try {
      const slug = decodeURIComponent(match[1]);
      const key = `good-plans-invitation:${slug}`;
      const token = new URLSearchParams(window.location.hash.slice(1)).get("invite");
      let invitationId = invitationContexts.current.get(slug);
      try { invitationId ||= sessionStorage.getItem(key); } catch { /* Storage may be disabled. */ }
      if (token) {
        const exchanged = await exchangeInvite(token);
        if (requestId !== inviteRequest.current) return;
        if (exchanged.eventSlug !== slug) throw new Error("This link belongs to a different event. Ask your host for the complete invitation link.");
        invitationId = exchanged.invitationId;
        invitationContexts.current.set(slug, invitationId);
        try { sessionStorage.setItem(key, invitationId); } catch { /* Cookie still protects the session. */ }
        window.history.replaceState({}, "", `/events/${encodeURIComponent(slug)}`);
      }
      const result = await readEvent(slug, invitationId || invite?.invitationId);
      if (requestId !== inviteRequest.current) return;
      if (result.guest?.invitationId) {
        invitationContexts.current.set(slug, result.guest.invitationId);
        try { sessionStorage.setItem(key, result.guest.invitationId); } catch { /* Optional recovery only. */ }
      }
      setInvite({ ...hostedPlan(result.event), guests: result.guests?.map(g => g.guest_name) || [],
        counts:result.counts, rsvp: result.rsvp, invitationId: result.guest?.invitationId, invitee: result.guest?.name });
      setInviteError("");
      setInviteState("ready");
    } catch (error) {
      if (requestId !== inviteRequest.current) return;
      setInviteError(error.message);
      setInviteState("error");
    }
  }
  useEffect(() => {
    const incoming = () => { void refreshInvitation({ incoming: true }); };
    const focus = () => {
      if (window.location.pathname.startsWith("/events/")) void refreshInvitation({ incoming: Boolean(window.location.hash) });
      else setHostRefresh(value => value + 1);
    };
    const visible = () => { if (document.visibilityState === "visible") focus(); };
    incoming();
    window.addEventListener("hashchange", incoming);
    window.addEventListener("popstate", incoming);
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visible);
    return () => {
      ++inviteRequest.current;
      window.removeEventListener("hashchange", incoming);
      window.removeEventListener("popstate", incoming);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  useEffect(() => {
    if (!user || !["My plans", "Overview"].includes(page)) return;
    let disposed = false;
    listHostEvents().then(({ events }) => {
      if (!disposed) setPlans(old => reconcileHostedPlans(old, events, { hostUserId: user.id }));
    }).catch(error => { if (!disposed) setToast(`Saved events could not refresh: ${error.message}`); });
    return () => { disposed = true; };
  }, [page, user?.id, hostRefresh]);
  useEffect(() => {
    if (!active?.remoteId || !user) return;
    let disposed = false;
    hostDashboard(active.remoteId).then(({ event, guests, counts }) => {
      if (!disposed) setPlans(old => reconcileHostedPlans(old, [{ ...event, guests, counts }], { hostUserId: user.id }));
    }).catch(error => { if (!disposed) setToast(`Could not refresh this event: ${error.message}`); });
    return () => { disposed = true; };
  }, [activeId, active?.remoteId, user?.id, hostRefresh]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  async function addDiscovery(event, planningContext = "all") {
    try {
      const existing = plans.find((p) => p.discoveryId === event.id);
      const result = await discoveryEvent(event.id);
      navigate("My plans");
      if (existing) {
        setFilter(existing.date ? ((existing.endDate || existing.date) >= localDate() ? "Upcoming" : "Past") : "Still planning");
        setActiveId(existing.id);
      }
      else setForm(discoveryDraft(result.event, planningContext));
    } catch (error) {
      setToast(error.message);
    }
  }
  useEffect(() => {
    const discoveryId = new URLSearchParams(window.location.search).get(
      "discover",
    );
    if (!discoveryId) return;
    discoveryEvent(discoveryId)
      .then(({ event }) => {
        setPage("My plans");
        setForm(discoveryDraft(event));
      })
      .catch((error) => {
        setPage("Dublin this week");
        setToast(error.message);
      });
    window.history.replaceState({}, "", window.location.pathname);
  }, []);
  function changeContext(changes, replace = false) {
    const current = routeContext(window.location.search);
    const next = { ...current, ...changes };
    const url = pageUrl(pageFromUrl(window.location.search), next);
    const state = changes.plan ? { planModal: true } : {};
    window.history[replace ? "replaceState" : "pushState"](state, "", url);
    setRoute(next);
  }
  function setActiveId(id) { changeContext({ plan: id }, !id); }
  function closePlan() {
    if (window.history.state?.planModal) window.history.back();
    else setActiveId(null);
  }
  function navigate(next, context = {}) {
    if (!user && next === "Organiser portal") {
      setPendingPage(next);
      setPendingContext(context);
      setLogin(true);
      return;
    }
    window.history.pushState({}, "", pageUrl(next, context));
    setRoute(routeContext(window.location.search));
    setPage(next);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function updatePeople(nextPeople) {
    setPlans(old => renameDraftGuests(old, friends, nextPeople));
    setPeople(nextPeople);
  }
  async function signOut() {
    try {
      await logout();
      setUser(null);
      setPlanningSettings(false);
      setConfirmSync(false);
      if (page === "Organiser portal") navigate("Overview");
      setToast("Signed out. Your local plans are still on this device.");
    } catch (error) { setToast(error.message); }
  }
  function updatePlanningSettings(next) {
    const value = typeof next === "function" ? next(settings) : next;
    const { friends: updatedFriends, ...updatedPreferences } = value;
    setPreferences(updatedPreferences);
    if (updatedFriends) updatePeople(updatedFriends);
  }
  function start(idea, kind = "Friends outing") {
    setForm({
      ...draftDefaults(settings),
      kind,
      ...(idea
        ? {
            title: ui(idea.short),
            notes: ui(idea.description),
            cost: ui(idea.cost),
            image: idea.image,
          }
        : {}),
    });
  }
  function save(plan) {
    const guestEntries = guestRecords(plan, friends);
    const clean = { ...plan, guestEntries, guests: guestEntries.map(g => g.name) };
    delete clean.guestEmails; // Migrated emails now belong to stable guest records.
    setPlans((old) =>
      old.some((p) => p.id === clean.id)
        ? old.map((p) => (p.id === clean.id ? clean : p))
        : [...old, clean],
    );
    setForm(null);
    navigate("My plans");
    setFilter(clean.date ? ((clean.endDate || clean.date) >= localDate() ? "Upcoming" : "Past") : "Still planning");
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
        startsAt: planInstants(active).start.toISOString(),
        endsAt: planInstants(active).end.toISOString(),
        timezone: active.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        venueName: active.location,
        city: active.city || settings.profile.city,
        capacity: active.capacity,
        visibility: active.visibility || 'invite',
        planType:active.planType||'own',bookingUrl:active.bookingUrl||null,
        publish: true,
        guests: guestRecords(active, friends).map(({ name, email }) => ({ name, email })),
      });
      setPlans(old => reconcileHostedPlans(old, result.events || [result.event], { hostUserId: user.id }));
      setHostRefresh(value => value + 1);
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
    .filter((p) => p.status !== "cancelled" && p.date && (p.endDate || p.date) >= localDate())
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const visiblePlans = plans
    .filter(
      (p) =>
        (filter === "All plans" ||
          (filter === "Upcoming"
            ? p.status !== "cancelled" && p.date && (p.endDate || p.date) >= localDate()
            : filter === "Still planning"
              ? !p.date
              : p.date && (p.endDate || p.date) < localDate())) &&
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
          <Artwork src={`/images/${plan.image}`} alt="" />
          <span className="gp-tag">
            {ui(plan.status === "cancelled"
              ? "Cancelled"
              : plan.remoteId
                ? "Published"
                : plan.date
                  ? "Date set · draft"
                  : "Still planning")}
          </span>
          {plan.date && (
            <span className="gp-date-stamp">
              <b>{ui(prettyDate(plan.date, { day: "2-digit" }).split(" ")[0])}</b>
              {ui(prettyDate(plan.date, { month: "short" }).split(" ").at(-1))}
            </span>
          )}
        </div>
        <div className="gp-plan-body">
          <small>{ui(plan.seriesName ? "Series occurrence" : plan.planType==='attend'?"Joining an event":plan.kind)}</small>
          <h3>{plan.title}</h3>
          <p>
            <MapPin />
            {plan.location || ui("Pick a place together")}
          </p>
          <div>
            <span>
              {plan.guests.length ? (
                <>
                  <UsersRound />
                  {ui(plan.guests.length)}{ui(" on your guest list")}</>
              ) : (
                ui("Your people, your plan")
              )}
            </span>
            <ArrowUpRight />
          </div>
        </div>
      </button>
    );
  }
  if (
    new URLSearchParams(window.location.search).get("newsletter") === "manage"
  )
    return <NewsletterPreferences />;
  if (["privacy", "support"].includes(new URLSearchParams(window.location.search).get("page"))) return <ServicePages page={new URLSearchParams(window.location.search).get("page")} />;
  if (login)
    return (
      <LoginScreen
        onBack={() => setLogin(false)}
        onLoginSuccess={(u) => {
          setUser(u);
          setLogin(false);
          window.history.pushState({}, "", pageUrl(pendingPage, { ...pendingContext, ...(activeId ? { plan: activeId } : {}) }));
          setRoute(routeContext(window.location.search));
          setPendingContext({});
          setPage(pendingPage);
          setToast("Signed in. You can now publish your invitation.");
        }}
      />
    );
  if (inviteState)
    return (
      <div className="gp-app gp-invite-route">
        <Brand />
        {inviteState === "loading" ? (
          <p role="status">{ui("Opening your invitation…")}</p>
        ) : inviteState === "error" ? (
          <div className="gp-empty">
            <h1>{ui("This invitation isn’t available.")}</h1>
            <p>
              {ui(inviteError || "Ask your host for a fresh invitation.")}
            </p>
            <a className="gp-button" href={localeHref("/")}>{ui("Go to Good Plans")}<ArrowRight />
            </a>
          </div>
        ) : (
          <PlanDetail
            key={invite.invitationId || invite.remoteId}
            plan={invite}
            onRefresh={() => refreshInvitation()}
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
          onCreate={(draft) => setForm({ ...draftDefaults(settings), ...draft })}
          onManage={navigate}
          onLogin={() => setLogin(true)}
          currentUser={user}
          onLogout={signOut}
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
            <a className="gp-skip" href="#main">{ui("Skip to content")}</a>
            <nav className="nav scrapbook-nav" aria-label={ui("Planning tools")}>
              <a
                className="brand"
                href={localeHref("/")}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("Overview");
                }}
              >
                <Artwork
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
                  "Dublin this week",
                ].map((label) => (
                  <a
                    key={label}
                    href={pageUrl(label)}
                    aria-current={page === label ? "page" : undefined}
                    className={page === label ? "active" : ""}
                    onClick={e => { if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); navigate(label); } }}
                  >
                    {ui(label === "Overview" ? "Home" : label === "Organiser portal" ? "My events" : label === "Dublin this week" ? regionDiscoveryLabel(settings.profile) : label)}
                  </a>
                ))}
              </div>
              <LanguageSwitcher />
              <button className="primary" onClick={() => start()}>{ui("New plan")}<Plus />
              </button>
            </nav>
            <div className="gp-workspace">
              <header className="gp-topbar">
                <span>
                  {ui(page === "Organiser portal" ? "My events" : page === "Dublin this week" ? regionDiscoveryLabel(settings.profile) : page)} <span className="gp-topbar-slash">/</span>
                  <span className="gp-muted">{ui(" A little more together")}</span>
                </span>
                <div>
                  <span className="gp-today">
                    <CalendarDays />
                    {ui(prettyDate(localDate(), { weekday: "short" }))}
                  </span>

                </div>
              </header>
              <main id="main" className="gp-main">
                {cloud.error && (
                  <div role="alert" className="gp-error">
                    {ui(cloud.error)}
                    <SyncRecovery cloud={cloud} />
                  </div>
                )}
                <div className="gp-storage-status">
                  <p role="status">{ui(syncEnabled ? (cloud.status === "synced" ? "Saved to your account" : cloud.status === "syncing" ? "Saving to your account…" : cloud.status === "loading" ? "Loading your account…" : "Account sync needs attention") : "Saved on this device")}</p>
                  {syncEnabled ? <button className="gp-text-button" onClick={() => setSyncConsents(old => ({ ...old, [user.id]: false }))}>{ui("Stop account sync")}</button> : <button className="gp-text-button" onClick={() => { if (user) setConfirmSync(true); else { setPendingPage(page); setLogin(true); } }}>{ui(user ? "Enable account sync" : "Sign in for optional sync")}</button>}
                  <details><summary>{ui("About storage")}</summary><p>{ui("Clearing browser data removes local plans and notes. Optional sync stores them in your account across devices. Stopping sync does not delete earlier account data.")}</p></details>
                </div>
                {page === "Organiser portal" && (
                  <HostPortal
                    user={user}
                    country={settings.profile.country}
                    onLogin={() => setLogin(true)}
                    onCreate={setForm}
                    selected={route.event}
                    tool={route.tool}
                    issueId={route.issue}
                    onContext={changeContext}
                    refreshKey={hostRefresh}
                    onChanged={() => setHostRefresh(value => value + 1)}
                  />
                )}
                {page === "Dublin this week" && <DublinDiscovery onAdd={addDiscovery} />}
                {page !== "Organiser portal" && page !== "Dublin this week" && (
                  <div className="gp-heading">
                    <div>
                      <p className="gp-eyebrow">{ui("YOUR PEOPLE. YOUR KIND OF PLANS.")}</p>
                      <h1>
                        {ui(page === "Overview"
                          ? "Good things start with a plan."
                          : page === "My plans"
                            ? "Time together, in the diary."
                            : page === "My people"
                              ? "Keep your people close."
                              : "For a “let’s do this” kind of day.")}
                      </h1>
                      <p>
                        {ui(page === "Overview"
                          ? "A catch-up, a day out, a just-because gathering. Make room for what matters."
                          : page === "My plans"
                            ? "Everything you’re looking forward to, and the ideas still taking shape."
                            : page === "My people"
                              ? "A little thoughtfulness makes the next get-together easier."
                              : "Your saved inspiration, ready whenever you are.")}
                      </p>
                    </div>
                    <span className="gp-heading-flower" aria-hidden="true">
                      ✳
                    </span>
                  </div>
                )}
                {(storageError || peopleError) && (
                  <p role="alert" className="gp-error">
                    {ui(storageError || peopleError)}
                  </p>
                )}
                {page === "Overview" && (
                  <>
                    <section className="gp-hero">
                      <div className="gp-hero-copy">
                        <span className="gp-pill">
                          <span />{ui("MAKE TIME FOR THE GOOD STUFF")}</span>
                        <h2>{ui("Less “we should.”")}<br />{ui("More ")}<em>{ui("“see you there.”")}</em>
                        </h2>
                        <p>{ui("Get your favourite people out of the group chat")}<br className="gp-desktop" />{ui(" and into a really good day.")}</p>
                        <button className="gp-button" onClick={() => start()}>{ui("Let’s make a plan")}<ArrowUpRight />
                        </button>
                        <span className="gp-hero-foot">
                          <Heart />{ui("For two friends or a whole table.")}</span>
                      </div>
                      <div className="gp-hero-art">
                        <Artwork
                          src="/images/good-plans-hero-collage.png"
                          alt={ui("A paper collage of friends exploring, making things, and spending time together")}
                        />
                        <span className="gp-paper-note">{ui("life’s better")}<br />
                          <em>{ui("together.")}</em>
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
                            <b>{ui(title)}</b>
                            <small>{ui(text)}</small>
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
                          {ui(page === "Overview"
                            ? "On the horizon"
                            : "Your plans")}
                          <span>{ui(visiblePlans.length)}</span>
                        </h2>
                        {page === "Overview" ? (
                          <button
                            className="gp-text-button"
                            onClick={() => navigate("My plans")}
                          >{ui("All my plans")}<ArrowRight />
                          </button>
                        ) : (
                          <button
                            className="gp-text-button"
                            onClick={() => start()}
                          >
                            <Plus />{ui("New plan")}</button>
                        )}
                      </div>
                      <div className="gp-plan-toolbar">
                        <div className="gp-tabs" aria-label={ui("Filter plans")}>
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
                              {ui(tab)}
                            </button>
                          ))}
                        </div>
                        {page === "My plans" && (
                          <label className="gp-search">
                            <Search />
                            <input
                              aria-label={ui("Search plans")}
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder={ui("Find a plan…")}
                            />
                          </label>
                        )}
                      </div>
                      {visiblePlans.length ? (
                        <div className="gp-plan-grid">
                          {ui(visiblePlans
                            .slice(0, page === "Overview" ? 2 : undefined)
                            .map(planCard))}
                        </div>
                      ) : (
                        <div className="gp-empty">
                          <span className="gp-empty-icon">
                            <CalendarDays />
                            <Heart />
                          </span>
                          <h3>
                            {ui(query
                              ? "No plans found."
                              : filter === "Past"
                                ? "The memories are still to come."
                                : filter === "Still planning"
                                  ? "Leave a little room for possibility."
                                  : "Your next good day goes here.")}
                          </h3>
                          <p>
                            {ui(query
                              ? "Try another name, place, or friend."
                              : filter === "Past"
                                ? "Past plans will live here after their date."
                                : "Coffee with a friend? A Sunday with everyone? Start small. Make it happen.")}
                          </p>
                          {filter !== "Past" && !query && (
                            <button
                              className="gp-button secondary"
                              onClick={() => start()}
                            >
                              <Plus />{ui("Create your first plan")}</button>
                          )}
                        </div>
                      )}
                    </section>
                    <aside className="gp-calendar">
                      <div className="gp-calendar-title">
                        <h3>
                          {ui(new Intl.DateTimeFormat(dateLocale(), {
                            month: "long",
                            year: "numeric",
                          }).format(month))}
                        </h3>
                        <div>
                          <button
                            className="gp-icon"
                            aria-label={ui("Previous month")}
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
                            aria-label={ui("Next month")}
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
                        {Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(dateLocale(), { weekday: "narrow" }).format(new Date(2026, 0, 5 + i))).map((d, i) => (
                          <small key={`day-${i}`}>{ui(d)}</small>
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
                                planOnDate(p, date),
                            );
                            return (
                              <button
                                key={date}
                                aria-label={`${prettyDate(date, { month: "long" })}, ${events.length} ${ui(events.length === 1 ? "plan" : "plans")}`}
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
                                {ui(i + 1)}
                              </button>
                            );
                          },
                        )}
                      </div>
                      <div className="gp-calendar-legend">
                        <i />{ui("A little time together")}</div>
                      <div className="gp-calendar-note">
                        <span>✳</span>
                        <p>
                          {upcoming.length ? (
                            <>
                              <b>
                                {upcoming.length}{" "}{ui(upcoming.length === 1 ? "good thing ahead." : "good things ahead.")}</b>{ui("Something to look forward to.")}</>
                          ) : (
                            <>
                              <b>{ui("Good company is the occasion.")}</b>{ui("You don’t need a special reason.")}</>
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
                        <p className="gp-eyebrow">{ui("A LITTLE INSPIRATION")}</p>
                        <h2>
                          {ui(page === "Saved ideas"
                            ? "Your someday starts here."
                            : "What’s your kind of good time?")}
                        </h2>
                      </div>
                      <span className="gp-muted gp-small">{ui("Ideas to make your own, wherever you are.")}</span>
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
                          {ui(c)}
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
                            <Artwork
                              src={`/images/${idea.image}`}
                              alt=""
                              loading="lazy"
                            />
                            <button
                              aria-label={ui(`${saved.includes(idea.id) ? "Unsave" : "Save"} ${idea.short}`)}
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
                              {ui(idea.category)}
                            </span>
                          </div>
                          <div className="gp-idea-body">
                            <h3>{ui(idea.title)}</h3>
                            <p>{ui(idea.description)}</p>
                            <button onClick={() => start(idea)}>{ui("Make this a plan")}<ArrowUpRight />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                    {!filteredIdeas.length && (
                      <div className="gp-empty">
                        <Bookmark />
                        <h3>{ui("Keep a good idea for later.")}</h3>
                        <p>{ui("Tap the bookmark on an idea to save it here.")}</p>
                        <button
                          className="gp-button secondary"
                          onClick={() => {
                            setCategory("All ideas");
                            navigate("Overview");
                          }}
                        >{ui("Explore ideas")}<ArrowRight />
                        </button>
                      </div>
                    )}
                  </section>
                )}
                {page === "My people" && <>
                  <button className="gp-button secondary" onClick={() => setPlanningSettings(true)}><Settings2 />{ui(" Planning settings")}</button>
                  {friends.length > 0 && <AffinityMatchMatrix friends={friends} example={false} city={settings.profile.city} preferences={settings} selectedFriends={selectedCircle} setSelectedFriends={setCircleSelection} onOpenPlanModal={idea => setForm({ ...draftDefaults(settings), title: ui(idea.name), location: [idea.venue?.name, idea.venue?.address].filter(Boolean).join(", "), guests: friends.filter(f => selectedCircle.includes(f.id)).map(f => f.name) })} />}
                  <SettingsPanel open={planningSettings} initialTab="profile" onClose={() => setPlanningSettings(false)} settings={settings} setSettings={updatePlanningSettings} onCreateOrganizer={() => { setPlanningSettings(false); setForm(draftDefaults(settings, true)); }} currentUser={user} syncStatus={cloud.status} onLogout={signOut} onLoginClick={() => { setPlanningSettings(false); setPendingPage(page); setLogin(true); }} />
                </>}
                {page === "My people" && (
                  <section>
                    <div className="gp-section-heading">
                      <h2>{ui("Your people")}<span>{ui(friends.length)}</span>
                      </h2>
                      <button
                        className="gp-button"
                        onClick={() => setPersonForm(true)}
                      >
                        <Plus />{ui("Add a friend")}</button>
                    </div>
                    <p className="gp-field-note">{ui("Private notes are never added to invitations. ")}{ui(syncEnabled ? "Account sync is enabled for these notes." : "They are saved on this device.")}
                    </p>
                    {friends.length ? (
                      <div className="gp-people-grid">
                        {friends.map((person) => (
                          <article className="gp-person" key={person.id}>
                            <span className="gp-avatar">{person.name[0]}</span>
                            <h3>{person.name}</h3>
                            <p>
                              {person.note || person.likes || ui("A little time together goes a long way.")}
                            </p>
                            <button
                              className="gp-text-button"
                              onClick={() => setPersonForm(person)}
                            >{ui("Edit details")}</button>
                            <button
                              className="gp-text-button"
                              onClick={() => setForm({ ...draftDefaults(settings), guests: [person.name] })}
                            >{ui("Plan a catch-up")}<ArrowRight />
                            </button>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="gp-empty">
                        <UsersRound />
                        <h3>{ui("It starts with one friend.")}</h3>
                        <p>{ui("Add the people you’d love to see more. Remember the little things they enjoy.")}</p>
                        <button
                          className="gp-button secondary"
                          onClick={() => setPersonForm(true)}
                        >
                          <Plus />{ui("Add your first friend")}</button>
                      </div>
                    )}
                  </section>
                )}
                <footer className="gp-footer"><a href={localeHref("/?page=privacy")}>{ui("Privacy")}</a><a href={localeHref("/?page=support")}>{ui("Help & data requests")}</a>
                  <span>
                    <Heart />{ui("Made for real life. And the people in it.")}</span>
                  <button
                    className="gp-text-button"
                    onClick={() => { if (user) { navigate("My people"); setPlanningSettings(true); } else { setPendingPage(page); setLogin(true); } }}
                  >
                    {ui(user ? "Host account" : "Host sign-in")}
                    <ArrowUpRight />
                  </button>
                  <span>{ui("good plans · by luana.systems")}</span>
                </footer>
              </main>
            </div>
          </>
        )}
        {form && (
          <PlanForm
            initial={{ ...draftDefaults(settings), ...form }}
            people={friends}
            onSave={save}
            onClose={() => setForm(null)}
          />
        )}
        {active && !form && (
          <PlanDetail
            key={active.id}
            plan={active}
            onClose={closePlan}
            onEdit={() => {
              if (active.remoteId) {
                setActiveId(null);
                navigate("Organiser portal", { event: active.remoteId });
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
        {confirmSync && user && <Modal title={ui("Enable account sync?")} onClose={() => setConfirmSync(false)}>
          <p>{ui("Your plans, saved people, private notes and preferences will be stored in the account for ")}<strong>{user.email}</strong>.</p>
          <p>{ui("If this account already has a workspace, it may replace what you see on this device. A device backup is kept before replacement. Conflicting edits will ask you to choose a version.")}</p>
          <p>{ui("Stopping sync stops future uploads, but does not delete previously saved account data.")}</p>
          <button className="gp-button" onClick={() => { setSyncConsents(old => ({ ...old, [user.id]: true })); setConfirmSync(false); }}>{ui("Enable sync for this account")}</button>
          <button className="gp-text-button" onClick={() => setConfirmSync(false)}>{ui("Keep planning on this device")}</button>
        </Modal>}
        {personForm && (
          <Modal
            title={ui("Someone worth making time for.")}
            onClose={() => setPersonForm(false)}
          >
            <form
              className="gp-form"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const name = data.get("name").trim();
                const message = personError(name, friends, personForm.id);
                if (message) { setPersonFormError(message); return; }
                const person = personRecord(personForm, { name, note: data.get("note"), likes: data.get("likes"), avoids: data.get("avoids") });
                updatePeople(
                  personForm.id
                    ? friends.map((p) => (p.id === person.id ? person : p))
                    : [...friends, person],
                );
                setPersonForm(false);
              }}
            >
              <label>{ui("Their name")}<input
                  autoFocus
                  name="name"
                  defaultValue={personForm.name || ""}
                  required
                  maxLength={80}
                  placeholder={settings.profile.country === 'BR' ? 'Ana' : ui("e.g. Maya")}
                />
              </label>
              <label>{ui("Little things to remember")}<textarea
                  name="note"
                  defaultValue={personForm.note || ""}
                  maxLength={500}
                  rows={3}
                  placeholder={ui("Loves a coastal walk, prefers a quiet café…")}
                />
              </label>
              <label>{ui("They tend to love")}<input name="likes" defaultValue={personForm.likes || ""} maxLength={300} placeholder={ui("Pottery, live music, coastal walks…")} /></label>
              <label>{ui("They would skip")}<input name="avoids" defaultValue={personForm.avoids || ""} maxLength={300} placeholder={ui("Loud venues, long walks…")} /></label>
              <p className="gp-field-note">{ui("Saved on this device; stored in your account only if you enable sync. Private notes are never included in invitations.")}</p>
              {personFormError && <p role="alert" className="gp-error">{ui(personFormError)}</p>}
              <button className="gp-button" type="submit">
                <Check />
                {ui(personForm.id ? "Save details" : "Add friend")}
              </button>
            </form>
          </Modal>
        )}
        {toast && (
          <div className="gp-toast" role="status">
            <CheckCircle2 />
            {ui(toast)}
            <button
              aria-label={ui("Dismiss notification")}
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
