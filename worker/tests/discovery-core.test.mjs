import test from "node:test";
import assert from "node:assert/strict";
import {
  normaliseTicketmaster,
  curate,
  weekKey,
  validateListing,
  matchesInterests,
  newsletterHtml,
} from "../src/discovery-core.js";
import { collectDublin } from "../src/newsletter.js";
const fixture = {
  id: "sample",
  name: "A gig",
  url: "https://www.ticketmaster.ie/event/example",
  dates: {
    start: { dateTime: "2027-01-05T19:00:00Z" },
    status: { code: "onsale" },
  },
  _embedded: { venues: [{ name: "A venue", city: { name: "Dublin" } }] },
  classifications: [{ segment: { name: "Music" } }],
};
test("provider data maps safely without inventing prices or end times", () => {
  const e = normaliseTicketmaster(fixture);
  assert.equal(e.category, "Music");
  assert.equal(e.price, "Check booking page");
  assert.equal(e.ends_at, null);
  assert.equal(e.id, "tm-sample");
  assert.equal(
    normaliseTicketmaster({ ...fixture, dates: { start: { dateTBA: true } } }),
    null,
  );
  assert.equal(
    normaliseTicketmaster({
      ...fixture,
      _embedded: { venues: [{ name: "A venue", city: { name: "London" } }] },
    }),
    null,
  );
  assert.equal(
    normaliseTicketmaster({
      ...fixture,
      dates: { ...fixture.dates, status: { code: "cancelled" } },
    }).status,
    "unavailable",
  );
});
test("unsafe source links and reversed event dates are rejected", () => {
  assert.throws(() =>
    validateListing({
      title: "A",
      venue: "Dublin",
      starts_at: "2027-01-01",
      url: "javascript:alert(1)",
    }),
  );
  assert.throws(() =>
    validateListing({
      title: "A",
      venue: "Dublin",
      starts_at: "2027-01-01",
      ends_at: "2026-01-01",
      url: "https://example.com",
    }),
  );
});
test("weekly curation deduplicates and includes a mix of categories", () => {
  const e = normaliseTicketmaster(fixture);
  const picks = curate([
    e,
    { ...e, id: "other" },
    { ...e, id: "art", title: "Gallery", category: "Arts & culture" },
  ]);
  assert.equal(picks.length, 2);
  assert.equal(matchesInterests(picks, ["Outdoors"]), false);
  assert.equal(matchesInterests(picks, []), true);
  assert.equal(matchesInterests(picks, ["Music"]), true);
});
test("week rolls over at Dublin midnight including summer time", () => {
  assert.equal(weekKey(new Date("2026-09-06T23:30:00Z")), "2026-09-07");
  assert.equal(weekKey(new Date("2026-01-04T23:30:00Z")), "2025-12-29");
});
test("newsletter HTML escapes event text and adds safe links", () => {
  const html = newsletterHtml(
    "<script>alert(1)</script>\nAdd to my plans: https://example.com/?x=1&y=2",
    "<img>",
  );
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;img&gt;"));
  assert.ok(html.includes('href="https://example.com/?x=1&amp;y=2"'));
});
test("collection is configuration-gated and normalises real API shape", async (t) => {
  await assert.rejects(() => collectDublin({}), /TICKETMASTER/);
  const writes = [];
  t.mock.method(globalThis, "fetch", async (url) => {
    const q = new URL(url).searchParams;
    assert.equal(q.get("city"), "Dublin");
    assert.equal(q.get("countryCode"), "IE");
    return Response.json({
      _embedded: { events: [fixture] },
      page: { totalPages: 1 },
    });
  });
  const env = {
    TICKETMASTER_API_KEY: "test",
    DB: {
      prepare: (sql) => ({ bind: (...args) => ({ sql, args }) }),
      batch: async (statements) => writes.push(...statements),
    },
  };
  assert.equal(await collectDublin(env), 1);
  assert.equal(writes[0].args[0], "tm-sample");
});
