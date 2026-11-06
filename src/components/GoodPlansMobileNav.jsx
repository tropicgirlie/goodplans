import { CalendarDays, Compass, Home, Plus, UsersRound } from "lucide-react";
import { ui } from "../i18n/core";

const tabs = [
  { id: "Overview", label: "Home", Icon: Home },
  { id: "Dublin this week", label: "Explore", Icon: Compass },
  { id: "create", label: "New", Icon: Plus, create: true },
  { id: "My plans", label: "Plans", Icon: CalendarDays },
  { id: "My people", label: "People", Icon: UsersRound },
];

/**
 * Sticky bottom navigation for the Good Plans mobile experience.
 * Shown under 760px; desktop keeps the existing scrapbook nav.
 */
export default function GoodPlansMobileNav({
  page,
  onNavigate,
  onCreate,
  exploreLabel,
}) {
  return (
    <nav className="gp-mobile-nav" aria-label={ui("Mobile app")}>
      {tabs.map(({ id, label, Icon, create }) => {
        const active = !create && page === id;
        return (
          <button
            key={id}
            type="button"
            className={`${create ? "gp-mobile-create" : ""} ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
            aria-label={ui(create ? "Create a plan" : label)}
            onClick={() => (create ? onCreate?.() : onNavigate?.(id))}
          >
            <Icon />
            <span>{ui(id === "Dublin this week" ? exploreLabel || label : label)}</span>
          </button>
        );
      })}
    </nav>
  );
}
