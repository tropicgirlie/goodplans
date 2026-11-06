import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  MapPin,
  Send,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import Artwork from "./Artwork";
import { ui } from "../i18n/core";
import { localDate, prettyDate } from "../lib/plans";

/**
 * Public invitation-page preview. Continues from the example circle or the
 * “See an event page” CTA. Does not require sign-in; saving still creates a
 * local draft the visitor can publish later as a host.
 */
export default function InvitationPreviewDemo({
  open,
  onClose,
  initial = {},
  onSavePlan,
  city = "Dublin",
}) {
  const [activity, setActivity] = useState(initial.title || "");
  const [friendNames, setFriendNames] = useState(
    (initial.guests || []).join(", ") || "",
  );
  const [location, setLocation] = useState(initial.location || "");
  const [notes, setNotes] = useState(initial.notes || "");
  const [date, setDate] = useState(initial.date || "");
  const [step, setStep] = useState("details");

  useEffect(() => {
    if (!open) return;
    setActivity(initial.title || ui("A good day together"));
    setFriendNames((initial.guests || []).join(", ") || ui("Maya, Aoife"));
    setLocation(initial.location || "");
    setNotes(initial.notes || "");
    setDate(initial.date || "");
    setStep("details");
  }, [open, initial.title, initial.location, initial.date, initial.notes, initial.guests]);

  if (!open) return null;

  const guests = friendNames
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  const previewPlan = {
    title: activity.trim() || ui("A good day together"),
    date,
    time: initial.time || "14:00",
    endTime: initial.endTime || "16:00",
    location: location.trim() || ui("Somewhere lovely in Dublin"),
    guests,
    notes: notes.trim(),
    capacity: initial.capacity || 12,
    kind: initial.kind || "Friends outing",
    image: initial.image || "good-plans-invite-collage.png",
    city,
  };

  function save() {
    onSavePlan?.({
      title: previewPlan.title,
      date: previewPlan.date,
      guests: previewPlan.guests,
      location: previewPlan.location,
      notes: previewPlan.notes,
      capacity: previewPlan.capacity,
      kind: previewPlan.kind,
      image: previewPlan.image,
      city,
    });
    onClose?.();
  }

  return (
    <div
      className="invite-preview-layer"
      role="dialog"
      aria-modal="true"
      aria-label={ui("Invitation page preview")}
    >
      <button
        type="button"
        className="invite-preview-backdrop"
        aria-label={ui("Close preview")}
        onClick={onClose}
      />
      <div className="invite-preview-panel">
        <header className="invite-preview-header">
          <div>
            <p className="eyebrow">{ui("see how it works")}</p>
            <h2>
              {step === "details"
                ? ui("Fill in the plan.")
                : ui("Invitation page")}
            </h2>
          </div>
          <button
            type="button"
            aria-label={ui("Close preview")}
            onClick={onClose}
          >
            <X />
          </button>
        </header>

        <ol className="invite-preview-steps" aria-label={ui("Preview steps")}>
          {[
            ["details", "03", ui("Fill in the plan")],
            ["invite", "04", ui("Invitation page")],
          ].map(([id, n, label]) => (
            <li key={id}>
              <button
                type="button"
                className={step === id ? "active" : ""}
                aria-current={step === id ? "step" : undefined}
                onClick={() => setStep(id)}
              >
                <span>{n}</span>
                {label}
              </button>
            </li>
          ))}
        </ol>

        {step === "details" ? (
          <form
            className="planner-card invite-preview-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!activity.trim()) return;
              setStep("invite");
            }}
            noValidate
          >
            {initial.title && (
              <p className="how-demo-picked">
                <Sparkles size={14} /> {ui("Starting from")}{" "}
                <b>{initial.title}</b>
                {initial.location ? ` · ${initial.location}` : ""}
              </p>
            )}
            <label>
              {ui("Who are you making time for?")}
              <input
                value={friendNames}
                onChange={(e) => setFriendNames(e.target.value)}
                placeholder={ui("Maya, Aoife")}
              />
            </label>
            <label>
              {ui("What could you do?")}
              <input
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              />
            </label>
            <label>
              {ui("Where?")}
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={ui(
                  "A café, gallery, or ‘we’ll decide together’",
                )}
              />
            </label>
            <label>
              {ui("When?")}{" "}
              <span className="gp-optional">{ui("optional")}</span>
              <input
                type="date"
                min={localDate()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              {ui("Little details for the invite")}
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={ui(
                  "What to bring, the vibe, how to get there…",
                )}
              />
            </label>
            <p className="how-demo-note">
              {ui(
                "Demo only — private notes stay with you. Guests see the invitation page.",
              )}
            </p>
            <button className="primary create" type="submit">
              {ui("Preview invitation page")} <Send />
            </button>
          </form>
        ) : (
          <div className="how-invite-preview">
            <div className="how-invite-card">
              <Artwork
                src={`/images/${previewPlan.image}`}
                alt=""
                className="how-invite-cover"
              />
              <p className="eyebrow">{ui("private invitation · demo")}</p>
              <h3>{previewPlan.title}</h3>
              <div className="how-invite-meta">
                <p>
                  <CalendarDays size={16} />
                  <span>
                    <b>
                      {previewPlan.date
                        ? prettyDate(previewPlan.date, {
                            weekday: "long",
                            year: "numeric",
                          })
                        : ui("Date still open")}
                    </b>
                    <small>
                      {previewPlan.date
                        ? `${previewPlan.time}–${previewPlan.endTime}`
                        : ui("You’ll confirm later")}
                    </small>
                  </span>
                </p>
                <p>
                  <MapPin size={16} />
                  <span>
                    <b>{previewPlan.location}</b>
                    <small>{city}</small>
                  </span>
                </p>
                <p>
                  <UsersRound size={16} />
                  <span>
                    <b>
                      {previewPlan.guests.join(", ") || ui("Your guests")}
                    </b>
                    <small>
                      {ui("Up to")} {previewPlan.capacity} {ui("guests")}
                    </small>
                  </span>
                </p>
              </div>
              {previewPlan.notes && (
                <p className="how-invite-notes">{previewPlan.notes}</p>
              )}
              <div className="how-invite-rsvp" aria-hidden="true">
                <button type="button" disabled>
                  <Check size={14} /> {ui("I’m in")}
                </button>
                <button type="button" disabled>
                  {ui("Maybe")}
                </button>
                <button type="button" disabled>
                  {ui("Can’t make it")}
                </button>
              </div>
              <p className="how-demo-note">
                {ui(
                  "Demo preview only — guests would RSVP on their private link.",
                )}
              </p>
            </div>
            <div className="how-invite-aside">
              <p className="eyebrow">{ui("what’s next")}</p>
              <h3>{ui("Ready to keep this plan?")}</h3>
              <p>
                {ui(
                  "Save a local draft now. Sign in as a host when you want to publish a real invitation.",
                )}
              </p>
              <div className="how-demo-actions">
                <button type="button" className="primary" onClick={save}>
                  {ui("Save this as my plan")} <ArrowUpRight />
                </button>
                <button
                  type="button"
                  className="text-action"
                  onClick={() => setStep("details")}
                >
                  {ui("Edit details")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
