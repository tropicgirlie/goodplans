export const WORKSPACE_PAGES = ["Overview", "My plans", "My people", "Saved ideas", "Organiser portal", "Dublin this week"];
const routes = { plans: "My plans", people: "My people", saved: "Saved ideas", host: "Organiser portal", dublin: "Dublin this week" };
export function pageFromUrl(search) {
  return routes[new URLSearchParams(search).get("view")] || "Overview";
}
export function pageUrl(page) {
  const route = Object.keys(routes).find(key => routes[key] === page);
  return route ? `/?view=${route}` : "/";
}
export function mergeSettings(defaults, preferences = {}, friends) {
  const result = { ...defaults, ...preferences };
  for (const key of ["profile", "availability", "discovery", "invite", "organizer"])
    result[key] = { ...defaults[key], ...preferences[key] };
  if (friends) result.friends = friends;
  return result;
}
export function draftDefaults(settings, series = false) {
  const invite = settings.invite;
  const organizer = settings.organizer;
  return {
    capacity: series ? organizer.capacity : invite.limit,
    plusOne: invite.plusOne,
    reminder: invite.reminder,
    showGuests: invite.showGuests,
    city: series ? organizer.city : settings.profile.city,
    ...(series ? {
      kind: "Gathering", title: organizer.seriesName, seriesName: organizer.seriesName,
      cadence: organizer.cadence, occurrences: organizer.count || 3,
      date: organizer.nextDate, location: organizer.city, notes: organizer.note,
      image: "good-plans-women-tech-brunch.png",
    } : {}),
  };
}
export function personError(name, people, id) {
  if (!name.trim()) return "Add a name for your friend.";
  if (people.some(p => p.id !== id && p.name.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase()))
    return "That friend is already in your people.";
  return "";
}
export function personRecord(existing, values) {
  return { ...existing, id: existing?.id || crypto.randomUUID(), name: values.name.trim(),
    note: (values.note || "").trim(), likes: (values.likes || "").trim(), avoids: (values.avoids || "").trim() };
}
export function syncConsentEnabled(consents, user) {
  return Boolean(user?.id && consents?.[user.id] === true);
}
