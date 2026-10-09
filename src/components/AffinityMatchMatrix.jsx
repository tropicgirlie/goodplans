import { useState, useEffect, useMemo } from "react";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import VibeDoodle from "./VibeDoodle";
import { findVenues } from "../lib/goodPlansApi";
import { FRIENDS_DATA } from "../data/mockData";
import { rankIdeas } from "../../shared/recommendations";
import "./AffinityMatchMatrix.css";

const activityNames = {
  "coffee-stroll": "Coffee & a stroll",
  "board-games": "A little friendly competition",
  "pottery-workshop": "Make something together",
  "outdoor-walk": "A breath of sea air",
  "dinner-out": "Dinner & a proper catch-up",
  retreat: "A day to slow down",
};

export default function AffinityMatchMatrix({
  selectedFriends,
  setSelectedFriends,
  onOpenPlanModal,
  friends = FRIENDS_DATA,
  example = true,
  onPersonalise,
  city = "Dublin",
  preferences = {},
}) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [retry, setRetry] = useState(0);
  const activeFriends = friends.filter((f) =>
    selectedFriends.includes(f.id),
  );

  const recommendations = useMemo(() => rankIdeas(catalog, activeFriends, preferences), [catalog, friends, selectedFriends, preferences]);
  const selectionKey = selectedFriends.join("|");
  useEffect(() => { setExpanded(false); }, [selectionKey, city]);

  useEffect(() => {
    let current = true;
    setError("");
    setCatalog([]);
    setLoading(true);
    findVenues({ city })
      .then((result) => {
        if (current) setCatalog(result.venues || []);
      })
      .catch(() => {
        if (current)
          setError("We couldn’t load ideas just now. Please try again.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [city, retry]);

  return (
    <section className="circle-edit" aria-labelledby="circle-title">
      <header className="circle-heading">
        <div>
          <p className="circle-eyebrow">Women’s social cohorts</p>
          <h2 id="circle-title">
            Good company.
            <br />
            <em>A few good ideas.</em>
          </h2>
        </div>
        <p>
          {example ? "Interactive example · These are fictional friends and illustrative ideas. Try changing the group, then add your own people. No account needed." : "Choose your saved friends and explore ideas for time together. Suggestions are starting points; confirm details with the venue."}
        </p>
      </header>
      {example && onPersonalise && <button className="circle-more" onClick={onPersonalise}>Plan with my people <ArrowUpRight size={18} /></button>}
      <div className="circle-workspace">
        <div className="circle-people">
          <div className="circle-step">
            <span>01</span>
            <h3>Who’s coming?</h3>
            <small>{activeFriends.length} selected</small>
          </div>
          <p className="circle-hint">Tap a friend to add or remove them.</p>
          <div
            className="circle-friends"
            role="group"
            aria-label="Choose friends"
          >
            {friends.map((friend) => {
              const selected = selectedFriends.includes(friend.id);
              return (
                <button
                  type="button"
                  className={`circle-friend ${selected ? "is-selected" : ""}`}
                  key={friend.id}
                  aria-pressed={selected}
                  onClick={() =>
                    setSelectedFriends(
                      selected
                        ? selectedFriends.filter((id) => id !== friend.id)
                        : [...selectedFriends, friend.id],
                    )
                  }
                >
                  {friend.avatar ? <img src={friend.avatar} alt="" loading="lazy" /> : <span className="circle-initial" aria-hidden="true">{friend.name.slice(0, 1)}</span>}
                  <span>
                    <b>{friend.name}</b>
                    <small>{(friend.interests || []).slice(0, 2).join(" · ")}</small>
                  </span>
                  <span className="circle-check" aria-hidden="true">
                    {selected && <Check size={14} />}
                  </span>
                </button>
              );
            })}
          </div>
          {example && <details className="circle-context">
            <summary>
              About this example <ChevronDown size={15} />
            </summary>
            <p>
              These are sample friends and illustrative suggestions. Explore how
              changing the group changes the ideas; check the venue before
              making a plan.
            </p>
            <p>
              Ideas use stated interests, not age or personality assumptions.
            </p>
            {activeFriends.map((f) => (
              <p key={f.id}>
                <b>{f.name.split(" ")[0]}</b> · {(f.interests || []).join(", ")}
              </p>
            ))}
          </details>}
        </div>
        <div className="circle-ideas" aria-busy={loading}>
          <div className="circle-step">
            <span>02</span>
            <h3>Pick your kind of plan.</h3>
          </div>
          <p className="circle-hint">
            {activeFriends.length
              ? `Ideas for ${activeFriends.map((f) => f.name.split(" ")[0]).join(", ")}.`
              : "Start by choosing someone on the left."}
          </p>
          {!activeFriends.length ? <p className="circle-state">Select a friend to see ideas.</p> : loading ? (
            <p className="circle-state" role="status">
              Finding a few good ideas…
            </p>
          ) : error ? (
            <div className="circle-state" role="alert">
              <p>{error}</p>
              <button
                className="circle-more"
                onClick={() => setRetry((n) => n + 1)}
              >
                Try again
              </button>
            </div>
          ) : !recommendations.length ? (
            <p className="circle-state">
              {activeFriends.length
                ? "No starter venues for this city yet. You can still create your own plan."
                : "Good plans start with your people. Select a friend to see ideas."}
            </p>
          ) : (
            <>
              <div className="circle-recommendations">
                {recommendations
                  .slice(0, expanded ? undefined : 3)
                  .map((idea, index) => (
                    <button
                      className="circle-idea"
                      key={`${idea.iconName}-${index}`}
                      onClick={() => onOpenPlanModal(idea)}
                    >
                      <span className="circle-doodle" aria-hidden="true">
                        <VibeDoodle type={idea.iconName} size={34} />
                      </span>
                      <span className="circle-idea-copy">
                        {index === 0 && (
                          <small className="circle-pick-label">
                            A place to start
                          </small>
                        )}
                        <b>{activityNames[idea.iconName] || idea.name}</b>
                        <span>{idea.venue?.name || idea.vibe}</span>
                        {idea.reason && <small className="circle-reason">{idea.reason}</small>}
                      </span>
                      <span className="circle-idea-action">
                        Make a plan <ArrowUpRight size={18} />
                      </span>
                    </button>
                  ))}
              </div>
              {recommendations.length > 3 && (
                <button
                  className="circle-more"
                  aria-expanded={expanded}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded
                    ? "Show fewer ideas"
                    : `See ${recommendations.length - 3} more ideas`}
                  <ChevronDown
                    size={16}
                    style={{
                      transform: expanded ? "rotate(180deg)" : undefined,
                    }}
                  />
                </button>
              )}
            </>
          )}
          <p className="circle-footnote">
            {example ? "Illustrative suggestions, not a compatibility test." : "Ideas are ordered using your saved interests and preferences on this device. Names and notes are not sent to the recommendation service."}
          </p>
        </div>
      </div>
    </section>
  );
}
