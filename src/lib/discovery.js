import { careNotes } from '../../shared/event-care.js';
import { ui } from "../i18n/core.js";
import { localDate, wallDateTime } from "./plans.js";
export const DUBLIN_INTERESTS = [
  "Creative classes",
  "Dance & movement",
  "Wellbeing & retreats",
  "Women & community",
  "Family & caregiving",
  "Seasonal",
  "Festivals",
  "Music",
  "Arts & culture",
  "Comedy",
  "Sports & games",
  "Outdoors",
  "Food & social",
  "Other",
];
export function discoveryDraft(event, planningContext = "all") {
  const start = new Date(event.starts_at),
    end = event.ends_at ? new Date(event.ends_at) : new Date(+start + 7200000);
  const timezone = event.timezone || "Europe/Dublin";
  const time = d => wallDateTime(d,timezone).split("T")[1];
  return {
    title: event.title,
    planType:'attend',bookingUrl:event.url,
    kind: "Friends outing",
    date: localDate(start,timezone),
    timezone,
    endDate: localDate(start,timezone) === localDate(end,timezone) ? "" : localDate(end,timezone),
    time: time(start),
    endTime: time(end),
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    location: event.venue,
    cost: event.price,
    discoveryId: event.id,
    notes: [careNotes(event),planningContext === "partner" ? ui("Planning with: my partner.") : "", ui(`Details & tickets: ${event.url}`), event.ends_at ? "" : ui("End time is a suggested two-hour planning window; check the event details."), ui("Adding this plan does not reserve tickets. Check the source for availability and changes.")].filter(Boolean).join("\n\n"),
    image: "good-plans-gathering-collage.png",
  };
}

export function discoveryThemes(event) {
  if (Array.isArray(event.themes)) return event.themes;
  try {
    const parsed = JSON.parse(event.themes_json || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const goodForTwoCategories = new Set([
  "Creative classes",
  "Dance & movement",
  "Wellbeing & retreats",
  "Festivals",
  "Music",
  "Arts & culture",
  "Comedy",
  "Sports & games",
  "Outdoors",
  "Food & social",
  "Seasonal",
]);

export function fitsPlanningContext(event, context) {
  const themes = discoveryThemes(event);
  if (context === "partner") {
    if (
      (themes.includes("women") || themes.includes("caregiving")) &&
      !themes.includes("partner-explicit")
    )
      return false;
    if (themes.includes("partners") || themes.includes("partner-explicit"))
      return true;
    return goodForTwoCategories.has(event.category);
  }
  if (context === "family")
    return (
      themes.includes("caregiving") || event.category === "Family & caregiving" || (event.care_url&&(event.children_welcome==='yes'||event.childcare==='provided'))
    );
  if (context === "friends") return !themes.includes("caregiving") || (event.care_url && event.childcare==='provided');
  return true;
}
