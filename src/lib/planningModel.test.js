import test from "node:test";
import assert from "node:assert/strict";
import { draftDefaults, mergeSettings, pageFromUrl, pageUrl, personError, personRecord, syncConsentEnabled } from "./planningModel.js";
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
