import { useState, useEffect } from "react";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import VibeDoodle from "./VibeDoodle";
import { findVenues } from "../lib/goodPlansApi";
import { FRIENDS_DATA } from "../data/mockData";
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
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [retry, setRetry] = useState(0);
  const activeFriends = FRIENDS_DATA.filter((f) =>
    selectedFriends.includes(f.id),
  );

  useEffect(() => {
    let current = true;
    setExpanded(false);
    setError("");
    setRecommendations([]);
    if (!selectedFriends.length) {
      setLoading(false);
      return;
    }
    setLoading(true);
    findVenues({
      friends: FRIENDS_DATA.filter((f) => selectedFriends.includes(f.id)),
    })
      .then((result) => {
        if (current) setRecommendations(result.venues || []);
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
  }, [selectedFriends, retry]);

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
          Choose who’s coming. Find a little time together that feels right for
          your group.
        </p>
      </header>
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
            {FRIENDS_DATA.map((friend) => {
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
                  <img src={friend.avatar} alt="" loading="lazy" />
                  <span>
                    <b>{friend.name}</b>
                    <small>{friend.interests.slice(0, 2).join(" · ")}</small>
                  </span>
                  <span className="circle-check" aria-hidden="true">
                    {selected && <Check size={14} />}
                  </span>
                </button>
              );
            })}
          </div>
          <details className="circle-context">
            <summary>
              About this example <ChevronDown size={15} />
            </summary>
            <p>
              These are sample friends and illustrative suggestions. Explore how
              changing the group changes the ideas; check the venue before
              making a plan.
            </p>
            <p>
              Personality types are example profile details, not a measure of
              friendship compatibility.
            </p>
            {activeFriends.map((f) => (
              <p key={f.id}>
                <b>{f.name.split(" ")[0]}</b> · {f.mbti} · {f.archetype}
              </p>
            ))}
          </details>
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
          {loading ? (
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
                ? "No ideas for this group just yet. Try a different combination."
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
            An example circle, not a compatibility test. The best plan is the
            one you’ll enjoy together.
          </p>
        </div>
      </div>
    </section>
  );
}
