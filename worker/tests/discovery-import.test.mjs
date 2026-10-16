import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import {
  boundedText,
  discoveryUrl,
  draftFromDiscoveryPage,
  eventDraft,
  sourceInstant,
  structuredEvents,
  fetchDiscoveryPage,
  webCandidate,
  dublinProgramme,
  publisherEvents,
} from "../src/discovery-import.js";
import {
  collectConfiguredDublin,
  newsletter,
  finishDiscoveryRun,
  scheduledNewsletter,
} from "../src/newsletter.js";
import { robotsPolicy } from "../src/discovery-sources.js";
import { filterDiscoveryEvents } from "../../shared/discovery-filters.js";

const future = new Date(Date.now() + 7 * 86400000).toISOString();
const raw = {
  "@type": "EducationEvent",
  name: "Women’s watercolour workshop",
  startDate: future,
  url: "https://dublin.ie/events/watercolour",
  location: {
    name: "Fictional test studio",
    address: { addressLocality: "Dublin", addressCountry: "IE" },
  },
  offers: { price: 0, priceCurrency: "EUR" },
};
const page = (events) =>
  `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "ItemList", itemListElement: events.map((item) => ({ "@type": "ListItem", item })) }] })}</script>`;
function database() {
  const db = new DatabaseSync(":memory:");
  for (const file of [
    "0006_dublin_newsletter.sql",
    "0008_focused_discovery.sql",
    "0009_discovery_sources.sql",
    "0011_event_care.sql",
  ])
    db.exec(
      readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"),
    );
  db.exec(
    "CREATE TABLE auth_limits(key TEXT PRIMARY KEY,count INTEGER,expires_at INTEGER);",
  );
  const prepare = (sql, args = []) => ({
    bind: (...values) => prepare(sql, values),
    first: async () => db.prepare(sql).get(...args) || null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => ({
      meta: { changes: Number(db.prepare(sql).run(...args).changes) },
    }),
  });
  return {
    db,
    env: {
      ENVIRONMENT: "development",
      DB: {
        prepare,
        batch: async (list) => Promise.all(list.map((item) => item.run())),
      },
    },
  };
}
function api(env, pending = []) {
  return async (path, body, host = true) => {
    const request = new Request(`https://goodplans.example${path}`, {
      method: body ? "POST" : "GET",
      ...(body
        ? {
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
    });
    try {
      const response = await newsletter(request, env, {
        response: (data, init) => Response.json(data, init),
        body: (req) => req.json(),
        requireHost: async () => {
          if (!host) throw Object.assign(new Error("Sign in"), { status: 401 });
          return { id: "test-host" };
        },
        ctx: { waitUntil: (promise) => pending.push(promise) },
      });
      return { status: response.status, data: await response.json() };
    } catch (e) {
      return { status: e.status || 500, data: { error: e.message } };
    }
  };
}
test("structured event lists, subclasses and Dublin times are read without guessed dates or prices", () => {
  assert.equal(structuredEvents(page([raw, raw])).length, 2);
  const draft = draftFromDiscoveryPage(page([raw]), raw.url);
  assert.equal(draft.price, "Free");
  assert.equal(draft.category, "Women & community");
  assert.equal(draft.inDublin, true);
  assert.ok(draft.themes.includes("creative"));
  assert.equal(sourceInstant("2027-07-01T14:00"), "2027-07-01T13:00:00.000Z");
  assert.equal(sourceInstant("2027-01-01T14:00"), "2027-01-01T14:00:00.000Z");
  assert.equal(sourceInstant("2027-03-28T01:30"), "");
  assert.equal(sourceInstant("2027-02-30T14:00Z"), "");
  assert.equal(sourceInstant("2027-07-01"), "");
  assert.equal(
    eventDraft({ ...raw, offers: undefined }, raw.url).price,
    "Check booking page",
  );
  const fallback = draftFromDiscoveryPage(
    '<meta property="og:title" content="A public workshop">',
    raw.url,
  );
  assert.equal(fallback.title, "A public workshop");
  assert.equal(fallback.starts_at, "");
  assert.ok(fallback.warnings.length);
});
test("automatic candidates exclude other Dublins, past or undated events, and preserve cancellation", async () => {
  assert.equal(
    await webCandidate(
      {
        ...raw,
        location: {
          name: "Dublin",
          address: { addressLocality: "Dublin", addressCountry: "US" },
        },
      },
      raw.url,
      "feed",
    ),
    null,
  );
  assert.equal(
    await webCandidate(
      { ...raw, startDate: "2020-01-01T12:00Z" },
      raw.url,
      "feed",
    ),
    null,
  );
  assert.equal(
    await webCandidate({ ...raw, startDate: "2027-01-01" }, raw.url, "feed"),
    null,
  );
  assert.equal(
    (
      await webCandidate(
        { ...raw, eventStatus: "https://schema.org/EventCancelled" },
        raw.url,
        "feed",
      )
    ).status,
    "unavailable",
  );
});
test("Dublin.ie adapter uses programme day and visible performance time, never an epoch time or guessed year", () => {
  const url = "https://dublin.ie/whats-on/listings/fixture/";
  const epoch = Math.floor(+new Date("2027-07-01T10:37Z") / 1000);
  const seeds = dublinProgramme(
    `<article class="event card" data-start-date="${epoch}" data-end-date="${epoch}"><a href="${url}">Class</a></article>`,
    "https://dublin.ie/whats-on/",
  );
  const html =
    '<h1>Watercolour &amp; tea</h1><div class="event-description"><p>A creative workshop.</p></div><hr><div class="event-info"><dl><dt>Date:</dt><dd>Thursday 1st July</dd><dt>Time:</dt><dd>7.30pm</dd><dt>Price:</dt><dd>Free</dd><dt>Address:</dt><dd>Test studio, Dublin 2, Ireland</dd></dl></div>';
  const event = publisherEvents(html, url, seeds[0])[0],
    draft = eventDraft(event, url);
  assert.equal(draft.starts_at, "2027-07-01T18:30:00.000Z");
  assert.equal(draft.title, "Watercolour & tea");
  assert.equal(draft.venue, "Test studio, Dublin 2, Ireland");
  assert.equal(draft.price, "Free");
  assert.equal(
    draftFromDiscoveryPage(html, url).starts_at,
    "",
    "standalone yearless dates need manual completion",
  );
  assert.equal(
    eventDraft(
      publisherEvents(
        html.replace("Thursday 1st July", "1st July - 3rd July"),
        url,
        seeds[0],
      )[0],
      url,
    ).starts_at,
    "",
    "ranges must not invent an occurrence",
  );
});
test("import rejects private URLs, lookalike hosts and unsafe redirects before fetching them", async (t) => {
  for (const url of [
    "http://dublin.ie/event",
    "https://dublin.ie.evil.com/event",
    "https://127.0.0.1/event",
    "https://[::1]/event",
    "https://user:pass@dublin.ie/event",
    "https://dublin.ie:8443/event",
  ])
    assert.throws(() => discoveryUrl(url));
  assert.equal(
    discoveryUrl("https://dublin.ie/event?utm_source=mail&x=1#section").href,
    "https://dublin.ie/event?x=1",
  );
  const mocked = t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(null, {
        status: 302,
        headers: { location: "https://127.0.0.1/private" },
      }),
  );
  await assert.rejects(() => fetchDiscoveryPage(raw.url, {}), /public HTTPS/);
  assert.equal(mocked.mock.callCount(), 1);
});
test("large streamed pages are bounded even when content length is absent", async () => {
  await assert.rejects(
    () => boundedText(new Response(new Uint8Array(512001))),
    /too large/,
  );
});
test("crawler follows publisher path rules and specific agent rules", () => {
  const permits = robotsPolicy(
    "User-agent: *\nDisallow: /private\nAllow: /private/public\nDisallow: /*?token=",
  );
  assert.equal(permits("/private/item"), false);
  assert.equal(permits("/private/public/item"), true);
  assert.equal(permits("/events"), true);
  assert.equal(permits("/event?token=x"), false);
  assert.equal(
    robotsPolicy(
      "User-agent: *\nDisallow: /\nUser-agent: GoodPlansEventFinder\nAllow: /events",
    )("/events/item"),
    true,
  );
  assert.equal(
    robotsPolicy("User-agent: *\nCrawl-delay: 10")("/events"),
    false,
  );
});
test("paste-link review publishes one manual listing and preserves privacy before publishing", async (t) => {
  const { env, db } = database(),
    call = api(env);
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(page([raw]), { headers: { "content-type": "text/html" } }),
  );
  assert.equal(
    (await call("/api/host/newsletter/import-link", { url: raw.url }, false))
      .status,
    401,
  );
  const preview = await call("/api/host/newsletter/import-link", {
    url: raw.url,
  });
  assert.equal(preview.status, 200);
  assert.equal((await call("/api/discovery")).data.events.length, 0);
  assert.equal(
    (await call("/api/host/newsletter/listings", preview.data.draft)).status,
    200,
  );
  assert.equal(
    (await call("/api/host/newsletter/listings", preview.data.draft)).status,
    200,
  );
  const revised = { ...preview.data.draft, title: "Revised pasted workshop" };
  assert.equal(
    (await call("/api/host/newsletter/listings", revised)).status,
    200,
  );
  assert.equal(
    (await call("/api/discovery")).data.events[0].title,
    revised.title,
    "explicit manual publication can update an existing URL without another review",
  );
  const events = (await call("/api/discovery")).data.events;
  assert.equal(events.length, 1);
  assert.equal(events[0].price, "Free");
  assert.equal(
    db.prepare("SELECT count(*) AS n FROM discovered_events").get().n,
    1,
  );
  const edit = await call("/api/host/newsletter/listings", {
    ...events[0],
    title: "Updated class",
    price: "EUR 15",
  });
  assert.equal(edit.status, 200);
  assert.equal(
    (await call("/api/discovery")).data.events[0].title,
    "Updated class",
  );
  db.close();
});
test("automatic source collection deduplicates, respects review and rechecks changed details", async (t) => {
  const { env, db } = database(),
    pending = [],
    call = api(env, pending);
  let event = raw;
  t.mock.method(globalThis, "fetch", async (url) => {
    if (new URL(url).pathname === "/robots.txt")
      return new Response("User-agent: *\nDisallow: /private");
    return new Response(
      page([
        event,
        event,
        { ...event, name: "London class", location: { name: "London" } },
      ]) +
        `<a href="/events/watercolour">Class</a><a href="https://other.example/event">External</a>`,
      { headers: { "content-type": "text/html" } },
    );
  });
  const source = await call("/api/host/newsletter/sources", {
    name: "Test programme",
    url: "https://dublin.ie/events",
    linkPath: "/events/",
    keywords: "watercolour",
  });
  assert.equal(source.status, 200, JSON.stringify(source.data));
  const initial = await call("/api/host/newsletter/collect", {});
  assert.equal(initial.status, 202);
  await Promise.all(pending);
  let dashboard = (await call("/api/host/newsletter")).data;
  assert.equal(dashboard.candidates.length, 1);
  assert.equal(dashboard.sources[0].last_count, 1);
  assert.equal(dashboard.runs[0].status, "complete");
  const candidate = dashboard.candidates[0];
  assert.equal((await call("/api/discovery")).data.events.length, 0);
  assert.equal(
    (await call(`/api/discovery/${candidate.id}`)).status,
    404,
    "direct candidate links must not bypass review",
  );
  assert.equal(
    (
      await call("/api/host/newsletter/review", {
        id: candidate.id,
        decision: "approved",
      })
    ).status,
    200,
  );
  assert.equal((await call(`/api/discovery/${candidate.id}`)).status, 200);
  await collectConfiguredDublin(env);
  assert.equal(
    (await call(`/api/discovery/${candidate.id}`)).status,
    200,
    "unchanged approved events stay approved",
  );
  event = { ...raw, offers: { price: 15, priceCurrency: "EUR" } };
  await collectConfiguredDublin(env);
  assert.equal(
    (await call(`/api/discovery/${candidate.id}`)).status,
    404,
    "changed prices require fresh approval",
  );
  dashboard = (await call("/api/host/newsletter")).data;
  assert.equal(dashboard.candidates.length, 1);
  assert.equal(dashboard.candidates[0].price, "EUR 15");
  await call("/api/host/newsletter/review", {
    id: candidate.id,
    decision: "approved",
  });
  event = {
    ...event,
    startDate: new Date(Date.now() + 8 * 86400000).toISOString(),
  };
  await collectConfiguredDublin(env);
  assert.equal(
    (await call(`/api/discovery/${candidate.id}`)).status,
    404,
    "a reschedule hides the previous public listing until reviewed",
  );
  assert.equal(
    (await call("/api/host/newsletter")).data.candidates[0].starts_at,
    event.startDate,
  );
  await call("/api/host/newsletter/review", {
    id: candidate.id,
    decision: "rejected",
  });
  await collectConfiguredDublin(env);
  assert.equal(
    (await call("/api/host/newsletter")).data.candidates.length,
    0,
    "rejected events do not return on daily checks",
  );
  assert.equal(
    db.prepare("SELECT count(*) AS n FROM discovered_events").get().n,
    1,
  );
  await call("/api/host/newsletter/sources", {
    id: dashboard.sources[0].id,
    enabled: false,
  });
  assert.equal((await call("/api/host/newsletter/collect", {})).status, 503);
  db.close();
});
test("partial source failure is recorded without losing successful sources or duplicating queued jobs", async (t) => {
  const { env, db } = database(),
    call = api(env);
  await call("/api/host/newsletter/sources", {
    name: "Working",
    url: "https://dublin.ie/working",
  });
  await call("/api/host/newsletter/sources", {
    name: "Unavailable",
    url: "https://dublin.ie/broken",
  });
  t.mock.method(globalThis, "fetch", async (url) =>
    new URL(url).pathname === "/robots.txt"
      ? new Response("", { status: 404 })
      : new URL(url).pathname === "/broken"
        ? new Response("Unavailable", { status: 503 })
        : new Response(page([raw]), {
            headers: { "content-type": "text/html" },
          }),
  );
  db.prepare(
    "INSERT INTO discovery_runs(key,status,started_at) VALUES ('test-queued','queued',?)",
  ).run(new Date().toISOString());
  await finishDiscoveryRun(env, "test-queued");
  const run = db
    .prepare("SELECT * FROM discovery_runs WHERE key='test-queued'")
    .get();
  assert.equal(run.status, "partial");
  assert.equal(run.count, 1);
  assert.match(run.error, /Unavailable/);
  const calls = fetch.mock.callCount();
  await finishDiscoveryRun(env, "test-queued");
  assert.equal(fetch.mock.callCount(), calls);
  db.close();
});
test("date, category, theme, source, accent-insensitive search and free filters use Dublin days", () => {
  const events = [
    {
      title: "Café and painting",
      venue: "Dublin",
      category: "Creative classes",
      source: "web",
      themes_json: '["creative"]',
      starts_at: "2027-07-01T23:30:00Z",
      price: "Free",
    },
    {
      title: "Concert",
      venue: "Dublin",
      category: "Music",
      source: "ticketmaster",
      themes: [],
      starts_at: "2027-07-02T19:00:00Z",
      price: "Check booking page",
    },
  ];
  assert.equal(
    filterDiscoveryEvents(events, {
      query: "cafe",
      category: "Creative classes",
      theme: "creative",
      source: "web",
      from: "2027-07-02",
      to: "2027-07-02",
      free: true,
    }).length,
    1,
  );
  assert.equal(filterDiscoveryEvents(events, { to: "2027-07-01" }).length, 0);
  assert.equal(filterDiscoveryEvents(events, { free: true }).length, 1);
});

test("scheduled discovery checks configured websites once per Dublin day without a Ticketmaster key", async (t) => {
  const { env, db } = database(),
    call = api(env);
  await call("/api/host/newsletter/sources", {
    name: "Daily programme",
    url: "https://dublin.ie/events",
  });
  t.mock.method(globalThis, "fetch", async (url) =>
    new URL(url).pathname === "/robots.txt"
      ? new Response("User-agent: *\nDisallow:")
      : new Response(page([raw]), { headers: { "content-type": "text/html" } }),
  );
  await scheduledNewsletter(env);
  const calls = fetch.mock.callCount();
  assert.equal(
    db
      .prepare(
        "SELECT count(*) AS n FROM discovery_runs WHERE key LIKE 'daily-%' AND status='complete'",
      )
      .get().n,
    1,
  );
  assert.equal(
    db
      .prepare(
        "SELECT count(*) AS n FROM discovered_events WHERE review_status='candidate'",
      )
      .get().n,
    1,
  );
  await scheduledNewsletter(env);
  assert.equal(fetch.mock.callCount(), calls);
  assert.equal(
    db.prepare("SELECT count(*) AS n FROM newsletter_deliveries").get().n,
    0,
  );
  db.close();
});

test('childcare is an explicit editorial confirmation, not inferred from family or mothers keywords', async () => {
  const { eventCare, careNotes } = await import('../../shared/event-care.js');
  assert.deepEqual(eventCare(),{children_welcome:'unknown',childcare:'unknown',care_url:null});
  assert.throws(()=>eventCare({childcare:'provided'}),/confirming/);
  assert.throws(()=>eventCare({children_welcome:'yes',care_url:'javascript:alert(1)'}));
  const {env,db}=database(),call=api(env);
  const base={title:'Test mothers’ creative morning',venue:'Test venue, Dublin',starts_at:future,category:'Family & caregiving',url:'https://example.com/test',price:'Check booking page'};
  assert.equal((await call('/api/host/newsletter/listings',{...base,childcare:'provided'})).status,400);
  assert.equal((await call('/api/host/newsletter/listings',base)).status,200);
  let events=(await call('/api/discovery')).data.events;
  assert.equal(filterDiscoveryEvents(events,{care:'childcare'}).length,0);
  assert.equal(filterDiscoveryEvents(events,{care:'children'}).length,0);
  const listing=events[0];
  assert.equal((await call('/api/host/newsletter/listings',{...base,id:listing.id,children_welcome:'yes',care_url:'https://example.com/support'})).status,200);
  events=(await call('/api/discovery')).data.events;
  assert.equal(filterDiscoveryEvents(events,{care:'children'}).length,1);
  assert.equal(filterDiscoveryEvents(events,{care:'childcare'}).length,0);
  assert.equal((await call('/api/host/newsletter/listings',{...base,id:listing.id,children_welcome:'yes',childcare:'provided',care_url:'https://example.com/support'})).status,200);
  events=(await call('/api/discovery')).data.events;
  assert.equal(filterDiscoveryEvents(events,{care:'childcare'}).length,1);
  assert.match(careNotes(events[0]),/confirm ages, availability, cost/);
  db.close();
});
