import { CalendarDays, Compass, Home, Plus, UsersRound } from "lucide-react";
import { ui } from "../i18n/core";

/**
 * Optional phone chrome for reviewing the Good Plans mobile app experience.
 * Real phones use GoodPlansMobileNav; this frame is for desktop demos.
 */
export default function MobileAppFrame({
  children,
  isMobileFrameView,
  activeTab,
  setActiveTab,
  onOpenPlanModal,
  exploreLabel = "Explore",
}) {
  if (!isMobileFrameView) {
    return <div className="gp-mobile-shell">{children}</div>;
  }

  const tabs = [
    { id: "home", label: "Home", Icon: Home },
    { id: "explore", label: exploreLabel, Icon: Compass },
    { id: "create", label: "New", Icon: Plus, create: true },
    { id: "plans", label: "Plans", Icon: CalendarDays },
    { id: "people", label: "People", Icon: UsersRound },
  ];

  return (
    <div className="gp-phone-stage">
      <div className="gp-phone-frame">
        <div className="gp-phone-status" aria-hidden="true">
          <span>9:41</span>
          <span>Good Plans</span>
        </div>
        <div className="gp-phone-body">{children}</div>
        <nav className="gp-mobile-nav gp-phone-nav" aria-label={ui("Mobile app")}>
          {tabs.map(({ id, label, Icon, create }) => (
            <button
              key={id}
              type="button"
              className={`${create ? "gp-mobile-create" : ""} ${activeTab === id ? "active" : ""}`}
              aria-current={activeTab === id ? "page" : undefined}
              onClick={() =>
                create ? onOpenPlanModal?.() : setActiveTab?.(id)
              }
            >
              <Icon />
              <span>{ui(label)}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
