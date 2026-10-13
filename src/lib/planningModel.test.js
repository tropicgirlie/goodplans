import { reconcileHostedPlans } from "./hostedPlans.js";
import test from "node:test";
import assert from "node:assert/strict";
import { guestRecords, renameDraftGuests, routeContext, draftDefaults, mergeSettings, pageFromUrl, pageUrl, personError, personRecord, syncConsentEnabled } from "./planningModel.js";
import { activityCategories, rankIdeas } from "../../shared/recommendations.js";

test("sync opt-in belongs to one authenticated account, never a legacy browser flag", () => {
  assert.equal(syncConsentEnabled({ alice: true }, { id: "alice" }), true);
  assert.equal(syncConsentEnabled({ alice: true }, { id: "bob" }), false);
  assert.equal(syncConsentEnabled(true, { id: "bob" }), false);
  assert.equal(syncConsentEnabled({ alice: true }, null), false);
});
test("editing a friend preserves private details and duplicate validation is shared", () => {
  const person = { id: "a", name: "Maya", note: "Quiet café", likes: "Pottery", avoids: "Loud music", interests: ["Coffee"] };
  const edited = personRecord(person, { ...person, name: "Maya Lin", note: "New note" });
  assert.deepEqual(edited.interests, ["Coffee"]);
  assert.equal(edited.avoids, "Loud music");
  assert.ok(personError("  MAYA  ", [person]));
  assert.equal(personError("Maya", [person], "a"), "");
});
test("series drafts carry configured date, city, capacity, description and invite defaults", () => {
  const defaults = { profile: { city: "Dublin" }, invite: { limit: 12, reminder: false, plusOne: false, showGuests: true }, organizer: { count: 3, cadence: "Once a month" } };
  const settings = mergeSettings(defaults, { organizer: { city: "Cork", seriesName: "Our walks", nextDate: "2026-11-02", capacity: 8, note: "Bring a layer" }, invite: { plusOne: true } });
  const draft = draftDefaults(settings, true);
  assert.equal(draft.city, "Cork"); assert.equal(draft.date, "2026-11-02"); assert.equal(draft.capacity, 8);
  assert.equal(draft.notes, "Bring a layer"); assert.equal(draft.plusOne, true); assert.equal(draft.cadence, "Once a month");
});
test("dashboard links round-trip through URL routes", () => {
  for (const page of ["Overview", "My plans", "My people", "Saved ideas", "Organiser portal", "Dublin this week"])
    assert.equal(pageFromUrl(new URL(pageUrl(page), "https://example.com").search), page);
  assert.equal(pageFromUrl("?view=unknown"), "Overview");
});
test("ideas use stated interests and quiet preferences without demographic assumptions", () => {
  const ideas = [{ name: "Dinner", category: "dinner-out", noise: "high" }, { name: "Pottery", category: "pottery-workshop", noise: "low" }];
  assert.equal(rankIdeas(ideas, [{ likes: "Pottery", avoids: "Loud venues" }])[0].name, "Pottery");
  assert.deepEqual(rankIdeas(ideas, [{ age: 70, mbti: "INFJ", name: "A" }]).map(i => i.name), ideas.map(i => i.name));
  assert.deepEqual(activityCategories("contemporary art gallery"), ["gallery"]);
  assert.ok(!activityCategories("contemporary art gallery").includes("pottery-workshop"));
});

test("friend identity survives renaming in drafts with email intact; published names stay historical", () => {
  const before = [{ id: "friend-1", name: "Emma" }], after = [{ id: "friend-1", name: "Emma Jones" }];
  const original = { id: "draft", guests: [" emma ", "EMMA", "Sam", ""], guestEmails: { Emma: "emma@example.com" } };
  const entries = guestRecords(original, before);
  assert.equal(entries.length, 2);
  const draft = { ...original, guestEntries: entries };
  const published = { ...draft, id: "published", remoteId: "event-1" };
  const [renamed, historical] = renameDraftGuests([draft, published], before, after);
  assert.deepEqual(renamed.guests, ["Emma Jones", "Sam"]);
  assert.equal(renamed.guestEntries[0].id, entries[0].id);
  assert.equal(renamed.guestEntries[0].email, "emma@example.com");
  assert.equal(historical, published);
  assert.equal(guestRecords(renamed, after)[0].id, entries[0].id);
});
test("plan, hosted occurrence, and newsletter edition links retain context", () => {
  const context = { plan: "plan-1", event: "event-2", tool: "newsletter", issue: "edition-3" };
  assert.deepEqual(routeContext(new URL(pageUrl("Organiser portal", context), "https://example.com").search), context);
});

test("published series reconcile every occurrence without duplicate drafts or unrelated changes", () => {
  const local = [{ id: "draft", title: "Original draft", guests: ["Emma"], image: "custom.jpg" }, { id: "unrelated", title: "Coffee", guests: [] }];
  const events = [1, 2, 3].map(n => ({ id: `event-${n}`, client_id: "draft", title: "Sunday walks", slug: `walk-${n}`,
    starts_at: `2026-11-${String(n * 7).padStart(2, "0")}T14:00:00Z`, ends_at: `2026-11-${String(n * 7).padStart(2, "0")}T16:00:00Z`,
    status: "published", capacity: 4, series_id: "series-1", series_name: "Sunday walks", guests: [{ id: `invite-${n}`, guest_name: "Emma", status: "accepted" }], counts: { accepted: 1 } }));
  const first = reconcileHostedPlans(local, events);
  assert.equal(first.length, 4);
  assert.equal(first.find(p => p.id === "draft").remoteId, "event-1");
  assert.equal(first.find(p => p.id === "unrelated"), local[1]);
  assert.equal(new Set(first.filter(p => p.remoteId).map(p => p.date)).size, 3);
  assert.equal(first.find(p => p.id === "draft").image, "custom.jpg");
  const refreshed = reconcileHostedPlans(first, events.map(e => ({ ...e, title: "Updated walk", guests: [...e.guests, { id: "extra", guest_name: "Sam", status: "waitlisted" }], counts: { accepted: 1, waitlisted: 1 } })));
  assert.equal(refreshed.length, 4);
  assert.deepEqual(refreshed.find(p => p.remoteId === "event-2").guests, ["Emma", "Sam"]);
  assert.equal(refreshed.find(p => p.remoteId === "event-3").counts.waitlisted, 1);
  assert.equal(reconcileHostedPlans([], events).length, 3, "another host device gets all server-only events");
});
