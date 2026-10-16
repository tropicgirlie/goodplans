import { decodeHtml, draftFromPage, sha256 } from "./core.js";
import { discoveryMatch, safeLink, validateListing } from "./discovery-core.js";
import { fail } from "./hosting-core.js";
import { wallTimeToUTC } from "../../shared/timezones.js";

export const DEFAULT_DISCOVERY_HOSTS =
  "dublin.ie,visitdublin.com,eventbrite.ie,eventbrite.com,tickettailor.com,ticket-tailor.com";
const plain = (value) =>
  decodeHtml(String(value || "").replace(/<[^>]*>/g, " "))
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => {
      const point =
        code[0].toLowerCase() === "x"
          ? parseInt(code.slice(1), 16)
          : Number(code);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : "";
    })
    .replace(/&nbsp;/g, " ")
    .replace(/&euro;/g, "€")
    .replace(/\s+/g, " ")
    .trim();
const dublinDay = (value) => {
  const fields = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Dublin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value]),
  );
  return `${fields.year}-${fields.month}-${fields.day}`;
};
export function discoveryUrl(raw, env = {}) {
  const url = new URL(safeLink(raw));
  const host = url.hostname;
  if (
    url.port ||
    !host.includes(".") ||
    /[\[\]:]/.test(host) ||
    /^[\d.]+$/.test(host) ||
    /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host)
  )
    fail("Use a public HTTPS event website.");
  const allowed = (env.DISCOVERY_ALLOWED_HOSTS || DEFAULT_DISCOVERY_HOSTS)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.some((domain) => host === domain || host.endsWith(`.${domain}`)))
    fail(
      "This website is not connected for link import yet. Enter the details manually, or ask the site owner to add this public source.",
    );
  url.hash = "";
  for (const key of [...url.searchParams.keys()])
    if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  return url;
}
export async function boundedText(response, limit = 512_000) {
  if (Number(response.headers.get("content-length") || 0) > limit) {
    await response.body?.cancel();
    fail(
      "This event page is too large to read safely. Enter the details manually.",
    );
  }
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        fail(
          "This event page is too large to read safely. Enter the details manually.",
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(data);
}
export async function fetchDiscoveryPage(raw, env, checkPath = async () => {}) {
  let current = discoveryUrl(raw, env);
  for (let attempt = 0; attempt < 4; attempt++) {
    await checkPath(current);
    const response = await fetch(current.href, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: {
        "user-agent": "GoodPlansEventFinder/1.0",
        accept: "text/html,application/ld+json,application/json",
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) fail("This source redirected without a destination.");
      const next = discoveryUrl(new URL(location, current).href, env);
      // Automatic sources also reject cross-origin redirects in checkPath.
      current = next;
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      fail(
        `This source could not be read (${response.status}). Try again later.`,
        502,
      );
    }
    if (
      !/text\/html|application\/(?:ld\+)?json/i.test(
        response.headers.get("content-type") || "",
      )
    ) {
      await response.body?.cancel();
      fail("Use a public HTML event page or JSON event feed.");
    }
    return { html: await boundedText(response), url: current.href };
  }
  fail("This event link redirected too many times.");
}
export function structuredEvents(html) {
  const found = [];
  let visited = 0;
  function visit(value, depth = 0) {
    if (!value || depth > 15 || ++visited > 5000 || found.length >= 100) return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    if (typeof value !== "object") return;
    const types = []
      .concat(value["@type"] || [])
      .map((type) => String(type).split(/[\/#]/).at(-1));
    if (types.some((type) => type === "Event" || type.endsWith("Event")))
      found.push(value);
    for (const key of [
      "@graph",
      "itemListElement",
      "item",
      "mainEntity",
      "subEvent",
      "events",
    ])
      visit(value[key], depth + 1);
  }
  const scripts = [
    ...html.matchAll(
      /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((match) => match[1]);
  if (/^\s*[\[{]/.test(html)) scripts.push(html);
  for (const script of scripts) {
    try {
      visit(JSON.parse(script));
    } catch {
      /* Invalid publisher data is not an event. */
    }
  }
  return found;
}
export function sourceInstant(raw) {
  if (typeof raw !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(raw))
    return "";
  try {
    const fields = raw
      .match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/)
      .slice(1)
      .map(Number);
    const day = new Date(Date.UTC(fields[0], fields[1] - 1, fields[2]));
    if (
      day.getUTCFullYear() !== fields[0] ||
      day.getUTCMonth() + 1 !== fields[1] ||
      day.getUTCDate() !== fields[2] ||
      fields[3] > 23 ||
      fields[4] > 59
    )
      return "";
    if (/(?:Z|[+-]\d\d:\d\d)$/i.test(raw)) return new Date(raw).toISOString();
    const match = raw.match(
      /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d))?$/,
    );
    if (!match) return "";
    return wallTimeToUTC(
      Object.fromEntries(
        ["year", "month", "day", "hour", "minute", "second"].map((key, i) => [
          key,
          Number(match[i + 1] || 0),
        ]),
      ),
      "Europe/Dublin",
    );
  } catch {
    return "";
  }
}
export function eventDraft(raw, sourceUrl) {
  const location = [].concat(raw.location || [])[0] || {};
  const address =
    typeof location.address === "string"
      ? location.address
      : [
          location.address?.streetAddress,
          location.address?.addressLocality,
          location.address?.addressRegion,
          location.address?.postalCode,
        ]
          .filter(Boolean)
          .join(", ");
  const country =
    typeof location.address?.addressCountry === "object"
      ? location.address.addressCountry.name
      : location.address?.addressCountry;
  const inDublin =
    /\bdublin\b/i.test([location.name, address].join(" ")) &&
    (!country || /^(IE|IRL|Ireland|Éire)$/i.test(country));
  const match = discoveryMatch({
    name: plain(raw.name),
    info: plain(raw.description),
  });
  // An artist biography mentioning women or children does not establish an audience.
  const title = plain(raw.name),
    description = plain(raw.description);
  match.themes = match.themes.filter(
    (theme) =>
      theme !== "women" ||
      /\b(wom[ae]n|girls?|mums?|mothers?|female|menopause|sisterhood)\b/i.test(
        title,
      ) ||
      /\b(?:for|welcoming|open to|community of)\s+(?:all\s+)?(?:wom[ae]n|girls?|mums?|mothers?)\b|women[- ]only/i.test(
        description,
      ),
  );
  if (raw.category === "Music")
    match.themes = match.themes.filter(
      (theme) =>
        !["creative", "dance", "wellbeing"].includes(theme) ||
        /\b(workshop|class|lesson|retreat|watercolou?r|pottery|salsa)\b/i.test(
          title,
        ),
    );
  match.reason = match.themes.length
    ? `Suggested focus: ${match.themes.join(", ")}; check the original listing`
    : "Upcoming Dublin event; check the original listing";
  const mapping = {
    women: "Women & community",
    caregiving: "Family & caregiving",
    creative: "Creative classes",
    dance: "Dance & movement",
    wellbeing: "Wellbeing & retreats",
    seasonal: "Seasonal",
    festival: "Festivals",
  };
  const offer = [].concat(raw.offers || [])[0];
  const price =
    raw.isAccessibleForFree === true || String(offer?.price) === "0"
      ? "Free"
      : offer?.price !== undefined
        ? `${offer.priceCurrency || "EUR"} ${plain(offer.price)}`
        : "Check booking page";
  let url = sourceUrl;
  try {
    const original = new URL(
      safeLink(new URL(raw.url || sourceUrl, sourceUrl).href),
    );
    original.hash = "";
    for (const key of [...original.searchParams.keys()])
      if (/^(utm_|fbclid$|gclid$)/i.test(key))
        original.searchParams.delete(key);
    url = original.href;
  } catch {
    /* Keep the readable source. */
  }
  const starts_at = sourceInstant(raw.startDate),
    ends_at = sourceInstant(raw.endDate);
  return {
    title: plain(raw.name).slice(0, 160),
    venue: plain(
      [...new Set([location.name, address].filter(Boolean))].join(", "),
    ).slice(0, 240),
    starts_at,
    ends_at: ends_at || null,
    category:
      match.themes.map((theme) => mapping[theme]).find(Boolean) ||
      (raw.category === "Music"
        ? "Music"
        : /comedy/i.test(`${raw.name} ${raw.description}`)
          ? "Comedy"
          : /music|concert|gig/i.test(`${raw.name} ${raw.description}`)
            ? "Music"
            : /theatre|exhibition|gallery/i.test(
                  `${raw.name} ${raw.description}`,
                )
              ? "Arts & culture"
              : "Other"),
    price: price.slice(0, 100),
    url,
    themes: match.themes,
    match_reason: match.reason,
    discovery_score: match.score,
    status:
      /EventCancelled|EventPostponed|EventRescheduled/.test(
        raw.eventStatus || "",
      ) || /SoldOut|Discontinued/.test(offer?.availability || "")
        ? "unavailable"
        : "active",
    inDublin,
    warnings: [
      !inDublin && "Confirm this venue is in Dublin, Ireland.",
      !starts_at && "Add the confirmed start date and time in Dublin.",
      raw.endDate && !ends_at && "Check the end time on the original listing.",
    ].filter(Boolean),
  };
}
export function draftFromDiscoveryPage(html, url) {
  const raw = publisherEvents(html, url)[0];
  if (raw) return eventDraft(raw, url);
  const metadata = draftFromPage({ html, sourceUrl: url }).fields;
  return {
    title: plain(metadata.title).slice(0, 160),
    venue: "",
    starts_at: "",
    ends_at: null,
    category: "Other",
    price: "Check booking page",
    url,
    inDublin: false,
    warnings: [
      "This page has no readable structured event details. Complete and check the fields before publishing.",
    ],
  };
}
// Dublin.ie publishes visible definition-list fields rather than Event JSON-LD.
// Its programme supplies machine-readable days; never treat its epoch's time-of-day
// as a performance time. Ranges/undated sessions still require manual completion.
export function dublinProgramme(html, base) {
  if (new URL(base).hostname !== "dublin.ie") return [];
  const seeds = [];
  for (const match of html.matchAll(
    /<article\b([^>]*\bclass=["'][^"']*\bevent\b[^"']*["'][^>]*)>([\s\S]*?)<\/article>/gi,
  )) {
    const start = match[1].match(/data-start-date=["'](\d{10})["']/)?.[1],
      end = match[1].match(/data-end-date=["'](\d{10})["']/)?.[1];
    const link = match[2].match(/<a\b[^>]*href=["']([^"']+)["']/)?.[1];
    if (!start || !link) continue;
    try {
      const url = new URL(decodeHtml(link), base);
      if (url.origin !== new URL(base).origin) continue;
      seeds.push({
        url: url.href,
        day: dublinDay(Number(start) * 1000),
        endDay: end ? dublinDay(Number(end) * 1000) : null,
        text: plain(match[2]),
        category: /data-categories=["'][^"']*music-and-comedy/i.test(match[1])
          ? "Music"
          : null,
      });
    } catch {
      /* Unsupported card. */
    }
  }
  return seeds;
}
export function publisherEvents(html, url, seed) {
  const structured = structuredEvents(html);
  if (structured.length) return structured;
  const parsed = new URL(url);
  if (
    parsed.hostname !== "dublin.ie" ||
    !parsed.pathname.startsWith("/whats-on/listings/")
  )
    return [];
  const info = html.match(
    /<div\b[^>]*class=["']event-info["'][^>]*>([\s\S]*?)<\/dl>/i,
  )?.[1];
  if (!info) return [];
  const fields = Object.fromEntries(
    [
      ...info.matchAll(
        /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi,
      ),
    ].map((match) => [
      plain(match[1]).replace(/:$/, "").toLowerCase(),
      plain(match[2]),
    ]),
  );
  const title = plain(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const date = fields.date?.match(
    /^(?:[a-z]+\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?$/i,
  );
  let day = "";
  if (date) {
    const month = months.indexOf(date[2].toLowerCase()) + 1;
    if (month) {
      const year = date[3] || seed?.day?.slice(0, 4);
      if (year)
        day = `${year}-${String(month).padStart(2, "0")}-${date[1].padStart(2, "0")}`;
      if (seed && day !== seed.day) day = "";
    }
  }
  const time = fields.time?.match(/^(\d{1,2})(?:[.:](\d\d))?\s*(am|pm)$/i);
  let clock = "";
  if (
    time &&
    Number(time[1]) >= 1 &&
    Number(time[1]) <= 12 &&
    Number(time[2] || 0) < 60
  )
    clock = `${String((Number(time[1]) % 12) + (/pm/i.test(time[3]) ? 12 : 0)).padStart(2, "0")}:${time[2] || "00"}`;
  const price = fields.price?.replace(/^€/, "").trim();
  return [
    {
      "@type": "Event",
      name: title,
      url,
      startDate: day && clock ? `${day}T${clock}` : null,
      category: seed?.category,
      description: plain(
        html.match(
          /class=["']event-description["'][^>]*>([\s\S]{0,12000}?)<hr/i,
        )?.[1] || "",
      ).slice(0, 600),
      location: { name: fields.address || "", address: fields.address || "" },
      ...(price && /^\d+(?:[.,]\d+)?$/.test(price)
        ? { offers: { price: price.replace(",", "."), priceCurrency: "EUR" } }
        : {}),
      isAccessibleForFree: /^free\b/i.test(fields.price || ""),
    },
  ];
}
export function eventPageLinks(html, base, path) {
  if (!path) return [];
  const urls = new Set();
  for (const match of html.matchAll(
    /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi,
  )) {
    try {
      const url = new URL(decodeHtml(match[1]), base);
      url.hash = "";
      if (
        url.origin === new URL(base).origin &&
        url.pathname.includes(path) &&
        url.href !== base
      )
        urls.add(url.href);
    } catch {
      /* Ignore non-links. */
    }
    if (urls.size >= 30) break;
  }
  return [...urls];
}
export async function webCandidate(raw, url, collectorId) {
  const draft = eventDraft(raw, url);
  if (
    !draft.inDublin ||
    !draft.starts_at ||
    draft.starts_at <= new Date().toISOString() ||
    draft.starts_at > new Date(Date.now() + 90 * 86400000).toISOString()
  )
    return null;
  try {
    const listing = validateListing(draft);
    // Event-specific URLs/identifiers survive a reschedule. A listing index without
    // event URLs falls back to its title, rather than treating the whole index as one event.
    const identity =
      typeof raw["@id"] === "string"
        ? raw["@id"]
        : typeof raw.identifier === "string"
          ? raw.identifier
          : typeof raw.identifier?.value === "string"
            ? raw.identifier.value
            : raw.url
              ? listing.url
              : `${listing.url}:${listing.title}`;
    const sourceId = await sha256(identity);
    return {
      ...draft,
      ...listing,
      id: `web-${sourceId}`,
      source: "web",
      source_id: sourceId,
      collector_id: collectorId,
      review_status: "candidate",
    };
  } catch {
    return null;
  }
}
