import {
  ArrowUpRight,
  CalendarDays,
  Compass,
  Plus,
  Share,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Artwork from "./Artwork";
import { ui } from "../i18n/core";
import { localDate, prettyDate } from "../lib/plans";
import { regionDiscoveryLabel } from "../lib/region";

/**
 * Phone / installed-app Home. Replaces the marketing homepage inside the
 * iOS app shell so the Home tab opens planning tools, not the landing page.
 */
export default function IosHome({
  settings,
  plans = [],
  friends = [],
  onNavigate,
  onCreate,
  onLogin,
  currentUser,
  showInstallTip = false,
}) {
  const upcoming = plans
    .filter((plan) => !plan.date || plan.date >= localDate())
    .slice(0, 3);
  const explore = regionDiscoveryLabel(settings?.profile);

  return (
    <main className="ios-home" id="main">
      <header className="ios-home-header">
        <div className="ios-home-brand">
          <Artwork
            className="ios-home-mark"
            src="/images/good-plans-mark.png"
            alt=""
          />
          <div>
            <p className="eyebrow">{ui("good plans")}</p>
            <h1>{ui("Your people, your time.")}</h1>
          </div>
        </div>
        <p className="ios-home-today">
          <CalendarDays size={14} />
          {prettyDate(localDate(), { weekday: "long", month: "short", day: "numeric" })}
        </p>
      </header>

      {showInstallTip && (
        <aside className="ios-install-tip" role="note">
          <Share size={18} />
          <p>
            {ui("Add Good Plans to your Home Screen:")}{" "}
            <b>{ui("Share")}</b> → <b>{ui("Add to Home Screen")}</b>
          </p>
        </aside>
      )}

      <section className="ios-home-actions" aria-label={ui("Quick actions")}>
        <button type="button" className="ios-action primary" onClick={onCreate}>
          <Plus />
          <span>
            <b>{ui("New plan")}</b>
            <small>{ui("Draft on this phone")}</small>
          </span>
        </button>
        <button
          type="button"
          className="ios-action"
          onClick={() => onNavigate("My people")}
        >
          <UsersRound />
          <span>
            <b>{ui("My people")}</b>
            <small>
              {friends.length
                ? `${friends.length} ${ui(friends.length === 1 ? "friend" : "friends")}`
                : ui("Add your circle")}
            </small>
          </span>
        </button>
        <button
          type="button"
          className="ios-action"
          onClick={() => onNavigate("Dublin this week")}
        >
          <Compass />
          <span>
            <b>{ui(explore)}</b>
            <small>{ui("Ideas near you")}</small>
          </span>
        </button>
      </section>

      <section className="ios-home-plans">
        <div className="ios-home-section-head">
          <h2>{ui("On the horizon")}</h2>
          <button
            type="button"
            className="gp-text-button"
            onClick={() => onNavigate("My plans")}
          >
            {ui("All plans")} <ArrowUpRight size={16} />
          </button>
        </div>
        {upcoming.length ? (
          <ul className="ios-plan-list">
            {upcoming.map((plan) => (
              <li key={plan.id || plan.title}>
                <button
                  type="button"
                  onClick={() => onNavigate("My plans")}
                >
                  <span className="ios-plan-date">
                    {plan.date
                      ? prettyDate(plan.date, { weekday: "short", day: "numeric", month: "short" })
                      : ui("Date open")}
                  </span>
                  <b>{plan.title || ui("Untitled plan")}</b>
                  <small>
                    {[plan.location, (plan.guests || []).slice(0, 2).join(", ")]
                      .filter(Boolean)
                      .join(" · ") || ui("Add details when you’re ready")}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="ios-empty">
            <Sparkles size={22} />
            <h3>{ui("Your next good day goes here.")}</h3>
            <p>{ui("Coffee with a friend? A Sunday with everyone? Start small.")}</p>
            <button type="button" className="primary" onClick={onCreate}>
              <Plus size={16} /> {ui("Create your first plan")}
            </button>
          </div>
        )}
      </section>

      <footer className="ios-home-foot">
        {currentUser ? (
          <p>{ui("Signed in as")} {currentUser.email || currentUser.name}</p>
        ) : (
          <button type="button" className="gp-text-button" onClick={onLogin}>
            {ui("Sign in to publish invitations")} <ArrowUpRight size={14} />
          </button>
        )}
      </footer>
    </main>
  );
}
