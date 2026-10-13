import { getLocale } from "../i18n/core.js";
import { regionalCity } from "../../shared/regions.js";
export const WORKSPACE_PAGES = ["Overview", "My plans", "My people", "Saved ideas", "Organiser portal", "Dublin this week"];
const routes = { plans: "My plans", people: "My people", saved: "Saved ideas", host: "Organiser portal", dublin: "Dublin this week" };
export function pageFromUrl(search) {
  return routes[new URLSearchParams(search).get("view")] || "Overview";
}
export function pageUrl(page, context = {}) {
  const route = Object.keys(routes).find(key => routes[key] === page);
  const params = new URLSearchParams(route ? { view: route } : {});
  for (const key of ["plan", "event", "tool", "issue"]) if (context[key]) params.set(key, context[key]);
  if (getLocale() !== "en") params.set("lang", getLocale());
  return params.size ? `/?${params}` : "/";
}
export function routeContext(search) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(["plan", "event", "tool", "issue"].map(key => [key, params.get(key) || null]));
}
const nameKey = name => String(name || "").trim().toLocaleLowerCase();
export function guestRecords(plan, people = []) {
  const seen = new Set();
  const previous = plan.guestEntries || [];
  return (plan.guests || []).flatMap(value => {
    const name = String(value || "").trim(), key = nameKey(name);
    if (!key || seen.has(key)) return [];
    seen.add(key);
    const existing = previous.find(g => nameKey(g.name) === key);
    const person = people.find(p => p.id === existing?.personId) || people.find(p => nameKey(p.name) === key);
    const legacyEmail = Object.entries(plan.guestEmails || {}).find(([n]) => nameKey(n) === key)?.[1];
    return [{ id: existing?.id || crypto.randomUUID(), personId: person?.id || existing?.personId || null,
      name: person?.name || name, email: existing?.email ?? legacyEmail ?? "" }];
  });
}
export function renameDraftGuests(plans, oldPeople, newPeople) {
  return plans.map(plan => {
    if (plan.remoteId) return plan; // Published names belong to the invitation history.
    const guestEntries = guestRecords(plan, oldPeople).map(guest => ({ ...guest,
      name: newPeople.find(p => p.id === guest.personId)?.name || guest.name }));
    return { ...plan, guestEntries, guests: guestEntries.map(g => g.name) };
  });
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
    country: settings.profile.country, currency: settings.profile.currency,
    timezone: series && organizer.city !== settings.profile.city && settings.profile.country !== 'IE'
      ? regionalCity(settings.profile.country,organizer.city)?.timezone || settings.profile.timezone : settings.profile.timezone,
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
