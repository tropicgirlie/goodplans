import { localDate } from "./plans.js";
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
  const time = (d) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return {
    title: event.title,
    kind: "Friends outing",
    date: localDate(start),
    time: time(start),
    endTime: localDate(start) === localDate(end) ? time(end) : "",
    location: event.venue,
    cost: event.price,
    discoveryId: event.id,
    notes: `${planningContext === "partner" ? "Planning with: my partner.\n\n" : ""}Details & tickets: ${event.url}\n\n${event.ends_at ? "" : "End time is a suggested two-hour planning window; check the event details.\n"}Adding this plan does not reserve tickets. Check the source for availability and changes.`,
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
      themes.includes("caregiving") || event.category === "Family & caregiving"
    );
  if (context === "friends") return !themes.includes("caregiving");
  return true;
}
