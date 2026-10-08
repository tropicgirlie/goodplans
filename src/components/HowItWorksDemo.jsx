import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  MapPin,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";
import AffinityMatchMatrix from "./AffinityMatchMatrix";
import { FRIENDS_DATA } from "../data/mockData";
import { localDate, prettyDate } from "../lib/plans";

const demoMoments = [
  "A free Sunday afternoon",
  "A catch-up after work",
  "A first meeting with new people",
  "A weekend away",
];

const steps = [
  { id: "company", label: "Good company", n: "01" },
  { id: "ideas", label: "A few good ideas", n: "02" },
  { id: "details", label: "Fill in the plan", n: "03" },
  { id: "invite", label: "Invitation page", n: "04" },
];

export default function HowItWorksDemo({
  onSignIn,
  onSavePlan,
  currentUser,
}) {
  const [step, setStep] = useState("company");
  const [selectedFriends, setSelectedFriends] = useState(["f1", "f2"]);
  const [pickedIdea, setPickedIdea] = useState(null);
  const [friendNames, setFriendNames] = useState("Maya, Aoife");
  const [activity, setActivity] = useState("Gallery late");
  const [moment, setMoment] = useState(demoMoments[0]);
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const names = FRIENDS_DATA.filter((f) => selectedFriends.includes(f.id))
      .map((f) => f.name.split(" ")[0])
      .join(", ");
    if (names) setFriendNames(names);
  }, [selectedFriends]);

  const handleIdea = (idea) => {
    setPickedIdea(idea);
    setActivity(idea.name || "A good day together");
    setLocation(
      idea.venue
        ? [idea.venue.name, idea.venue.address].filter(Boolean).join(", ")
        : "",
    );
    setNotes(idea.venue?.fit || idea.vibe || moment);
    setStep("details");
    document
      .querySelector("#how-details")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const previewPlan = {
    title: activity,
    date,
    time: "14:00",
    endTime: "16:00",
    location: location || "Somewhere lovely in Dublin",
    guests: friendNames
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean),
    notes: notes || moment,
    capacity: 12,
    kind: "Friends outing",
    image: "good-plans-invite-collage.png",
  };

  const goToInvite = (event) => {
    event.preventDefault();
    setStep("invite");
    document
      .querySelector("#how-invite")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="how-demo" id="how">
      <div className="how-demo-intro">
        <p className="eyebrow">see how it works</p>
        <h2>
          From good company
          <br />
          <em>to an invite worth opening.</em>
        </h2>
        <p>
          Walk through a sample plan. Choose people, pick an idea, fill in the
          details, then preview the invitation page your friends would open.
        </p>
      </div>

      <ol className="how-demo-steps" aria-label="Demo steps">
        {steps.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={step === item.id ? "active" : ""}
              aria-current={step === item.id ? "step" : undefined}
              onClick={() => setStep(item.id)}
            >
              <span>{item.n}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      {(step === "company" || step === "ideas") && (
        <div className="how-demo-stage">
          <p className="how-demo-note">
            Sample friends and suggestions — try the flow, then sign in to use
            your own people and notes.
          </p>
          <AffinityMatchMatrix
            selectedFriends={selectedFriends}
            setSelectedFriends={(next) => {
              setSelectedFriends(next);
              setStep("ideas");
            }}
            onOpenPlanModal={handleIdea}
          />
          <div className="how-demo-actions">
            <button
              type="button"
              className="primary"
              disabled={!selectedFriends.length}
              onClick={() => setStep("ideas")}
            >
              Continue to ideas <ArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="how-demo-stage" id="how-details">
          <div className="how-demo-fill">
            <div className="section-intro">
              <p className="eyebrow">step 03</p>
              <h3>Fill in the info.</h3>
              <p>
                This is what you’d customise for a real outing. Private notes
                stay with you — only the plan details appear on the invite.
              </p>
              {pickedIdea && (
                <p className="how-demo-picked">
                  <Sparkles size={14} /> Starting from{" "}
                  <b>{pickedIdea.name}</b>
                  {pickedIdea.venue?.name
                    ? ` · ${pickedIdea.venue.name}`
                    : ""}
                </p>
              )}
            </div>
            <form className="planner-card" onSubmit={goToInvite}>
              <label>
                Who are you making time for?
                <input
                  value={friendNames}
                  onChange={(e) => setFriendNames(e.target.value)}
                  placeholder="Maya, Aoife"
                  required
                />
              </label>
              <label>
                What could you do?
                <input
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  required
                />
              </label>
              <label>
                What kind of moment?
                <select
                  value={moment}
                  onChange={(e) => setMoment(e.target.value)}
                >
                  {demoMoments.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                Where?
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="A café, gallery, or ‘we’ll decide together’"
                />
              </label>
              <label>
                When? <span className="gp-optional">optional</span>
                <input
                  type="date"
                  min={localDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                Little details for the invite
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What to bring, the vibe, how to get there…"
                />
              </label>
              <button className="primary create" type="submit">
                Preview invitation page <Send />
              </button>
            </form>
          </div>
        </div>
      )}

      {step === "invite" && (
        <div className="how-demo-stage" id="how-invite">
          <div className="how-invite-preview">
            <div className="how-invite-card">
              <img
                src={`/images/${previewPlan.image}`}
                alt=""
                className="how-invite-cover"
              />
              <p className="eyebrow">private invitation · demo</p>
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
                        : "Date still open"}
                    </b>
                    <small>
                      {previewPlan.date
                        ? `${previewPlan.time}–${previewPlan.endTime}`
                        : "You’ll confirm later"}
                    </small>
                  </span>
                </p>
                <p>
                  <MapPin size={16} />
                  <span>
                    <b>{previewPlan.location}</b>
                    <small>Dublin</small>
                  </span>
                </p>
                <p>
                  <UsersRound size={16} />
                  <span>
                    <b>{previewPlan.guests.join(", ") || "Your guests"}</b>
                    <small>Up to {previewPlan.capacity} guests</small>
                  </span>
                </p>
              </div>
              {previewPlan.notes && (
                <p className="how-invite-notes">{previewPlan.notes}</p>
              )}
              <div className="how-invite-rsvp" aria-hidden="true">
                <button type="button" disabled>
                  <Check size={14} /> I’m in
                </button>
                <button type="button" disabled>
                  Maybe
                </button>
                <button type="button" disabled>
                  Can’t make it
                </button>
              </div>
              <p className="how-demo-note">
                Demo preview only — guests would RSVP on their private link.
              </p>
            </div>
            <div className="how-invite-aside">
              <p className="eyebrow">what’s next</p>
              <h3>Ready to plan with your people?</h3>
              <p>
                Sign in to save your friends, preferences and drafts, then
                publish a real invitation from the host admin panel.
              </p>
              <div className="how-demo-actions">
                {currentUser ? (
                  <button
                    type="button"
                    className="primary"
                    onClick={() =>
                      onSavePlan?.({
                        title: previewPlan.title,
                        date: previewPlan.date,
                        guests: previewPlan.guests,
                        location: previewPlan.location,
                        notes: previewPlan.notes,
                        capacity: previewPlan.capacity,
                        image: previewPlan.image,
                        kind: "Friends outing",
                      })
                    }
                  >
                    Save this as my plan <ArrowUpRight />
                  </button>
                ) : (
                  <button type="button" className="primary" onClick={onSignIn}>
                    Sign in to use your people <ArrowUpRight />
                  </button>
                )}
                <button
                  type="button"
                  className="text-action"
                  onClick={() => setStep("company")}
                >
                  Restart demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
