import { fail } from "./hosting-core.js";
export const categories = [
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
  "Outdoors",
  "Food & social",
  "Other",
];
export const discoverySearches = [
  { query: null, label: "What’s on in Dublin", themes: [], boost: 0, pages: 2 },
  { query: "watercolour", label: "Watercolour and painting", themes: [], boost: 24 },
  { query: "pottery", label: "Pottery and ceramics", themes: [], boost: 24 },
  { query: "craft workshop", label: "Creative workshops", themes: [], boost: 20 },
  { query: "dance class", label: "Dance and movement", themes: [], boost: 24 },
  { query: "women", label: "Women-centred events", themes: [], boost: 32 },
  { query: "mother", label: "Mothers and caregivers", themes: [], boost: 30 },
  { query: "caregiver", label: "Caregiving support", themes: [], boost: 30 },
  { query: "retreat", label: "Retreats", themes: [], boost: 24 },
  { query: "wellness", label: "Wellbeing", themes: [], boost: 20 },
  { query: "festival", label: "Festivals", themes: [], boost: 18 },
  { query: "Christmas", label: "Christmas and winter", themes: [], boost: 24 },
  { query: "family", label: "Family-friendly events", themes: [], boost: 16 },
];
const themeRules = [
  ["women", /\b(wom[ae]n|female|girls?|sisterhood|mums?|mothers?|menopause)\b/i, 34],
  ["caregiving", /\b(caregiv(?:er|ing)|carers?|parents?|mothers?|baby|babies|toddlers?|family|children|kids?)\b/i, 24],
  ["creative", /\b(watercolou?r|paint(?:ing)?|pottery|ceramics?|crafts?|sewing|floral|drawing|printmaking|art class|workshop)\b/i, 20],
  ["dance", /\b(dance|dancing|salsa|bachata|ballet|movement|zumba|heels class)\b/i, 20],
  ["wellbeing", /\b(retreat|wellness|wellbeing|yoga|pilates|mindful(?:ness)?|spa|sound bath|meditat(?:e|ion))\b/i, 20],
  ["seasonal", /\b(christmas|xmas|elf|santa|winter lights?|halloween|pumpkin|festive market)\b/i, 20],
  ["festival", /\b(festival|fair|feis)\b/i, 16],
];
const themeLabels = {
  women: "Women-centred",
  caregiving: "Caregiving-friendly",
  creative: "Creative class",
  dance: "Dance & movement",
  wellbeing: "Wellbeing",
  seasonal: "Seasonal",
  festival: "Festival",
};
export function discoveryMatch(event, search = discoverySearches[0]) {
  const classification = event.classifications?.[0] || {};
  const text = [
    event.name,
    event.info,
    event.pleaseNote,
    event._embedded?.venues?.[0]?.name,
    classification.segment?.name,
    classification.genre?.name,
    classification.subGenre?.name,
  ]
    .filter(Boolean)
    .join(" ");
  const themes = new Set(search.themes || []);
  let score = 20 + (search.boost || 0);
  for (const [theme, pattern, weight] of themeRules) {
    if (pattern.test(text)) {
      if (!themes.has(theme)) score += weight;
      themes.add(theme);
    }
  }
  const labels = [...themes].map((theme) => themeLabels[theme]).filter(Boolean);
  return {
    themes: [...themes],
    score: Math.min(score, 100),
    reason: labels.length
      ? `Matched ${labels.join(", ").toLowerCase()}`
      : "Popular upcoming Dublin event",
  };
}
export function safeLink(raw) {
  try {
    if (typeof raw !== "string" || raw.length > 2048)
      throw new Error("Link too long");
    const u = new URL(raw);
    if (u.protocol === "https:" && !u.username && !u.password) return u.href;
  } catch {}
  fail("Provide a complete HTTPS event or booking link.");
}
export function validateListing(input) {
  const title = String(input.title || "").trim(),
    venue = String(input.venue || "").trim();
  if (!title || title.length > 160 || !venue || venue.length > 240)
    fail("Add an event name (up to 160 characters) and venue (up to 240).");
  const start = new Date(input.starts_at),
    end = input.ends_at ? new Date(input.ends_at) : null;
  if (
    !Number.isFinite(+start) ||
    (end && (!Number.isFinite(+end) || end <= start))
  )
    fail("Choose a valid event date and a later end time, if known.");
  return {
    title,
    venue,
    starts_at: start.toISOString(),
    ends_at: end?.toISOString() || null,
    category: categories.includes(input.category) ? input.category : "Other",
    price: String(input.price || "Check booking page").slice(0, 100),
    url: safeLink(input.url),
  };
}
export function normaliseTicketmaster(event, search = discoverySearches[0]) {
  const start = event.dates?.start;
  if (
    !event.id ||
    !start?.dateTime ||
    start.dateTBD ||
    start.dateTBA ||
    start.timeTBA
  )
    return null;
  const venue = event._embedded?.venues?.[0];
  if (!venue || !/dublin/i.test(venue.city?.name || "")) return null;
  const kind = `${event.classifications?.[0]?.segment?.name || ""} ${event.classifications?.[0]?.genre?.name || ""}`;
  const price = event.priceRanges?.[0];
  try {
    const match = discoveryMatch(event, search);
    const [primaryTheme] = match.themes;
    return {
      ...validateListing({
        title: event.name,
        starts_at: start.dateTime,
        venue: [venue.name, venue.city?.name].filter(Boolean).join(", "),
        category:
          primaryTheme === "women"
            ? "Women & community"
            : primaryTheme === "caregiving"
              ? "Family & caregiving"
              : primaryTheme === "creative"
                ? "Creative classes"
                : primaryTheme === "dance"
                  ? "Dance & movement"
                  : primaryTheme === "wellbeing"
                    ? "Wellbeing & retreats"
                    : primaryTheme === "seasonal"
                      ? "Seasonal"
                      : primaryTheme === "festival"
                        ? "Festivals"
                        : /comedy/i.test(kind)
                          ? "Comedy"
                          : /music/i.test(kind)
                            ? "Music"
                            : /arts|theatre|film/i.test(kind)
                              ? "Arts & culture"
                              : "Other",
        price: price
          ? `${price.min === 0 && price.max === 0 ? "Free" : `${price.currency || "EUR"} ${price.min}${price.max > price.min ? `–${price.max}` : ""}`}`
          : "Check booking page",
        url: event.url,
      }),
      id: `tm-${event.id}`,
      source: "ticketmaster",
      source_id: event.id,
      themes: match.themes,
      match_reason: match.reason,
      discovery_score: match.score,
      review_status: "candidate",
      status: ["cancelled", "postponed", "offsale"].includes(
        event.dates?.status?.code,
      )
        ? "unavailable"
        : "active",
    };
  } catch {
    return null;
  }
}
export function weekKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  const d = new Date(`${p.year}-${p.month}-${p.day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
export function curate(events, maximum = 8) {
  const seen = new Set(),
    unique = [];
  for (const e of events) {
    const key = `${e.title.toLowerCase().replace(/[^a-z0-9]/g, "")}:${e.starts_at.slice(0, 16)}:${e.venue.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(e);
    }
  }
  const selected = [];
  for (const category of categories) {
    const e = unique.find((e) => e.category === category);
    if (e) selected.push(e);
  }
  for (const e of [...unique].sort(
    (a, b) => (b.discovery_score || 0) - (a.discovery_score || 0),
  ))
    if (!selected.includes(e)) selected.push(e);
  return selected
    .slice(0, maximum)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}
export function matchesInterests(events, interests) {
  return (
    !interests.length || events.some((e) => interests.includes(e.category))
  );
}
export function issueText(issue, unsubscribeUrl) {
  const events = JSON.parse(issue.events_json);
  return `${issue.intro}\n\n${events.map((e) => `${e.title}\n${new Date(e.starts_at).toLocaleString("en-IE", { timeZone: "Europe/Dublin", dateStyle: "full", timeStyle: "short" })} · Dublin time\n${e.venue}\n${e.price}\nAdd to my plans: ${issue.origin}/?discover=${encodeURIComponent(e.id)}\nDetails & tickets: ${e.url}`).join("\n\n")}\n\nAdding a plan does not reserve tickets. Check the source for availability and changes.\n\nYou opted in to Good Plans Dublin. Manage interests or unsubscribe: ${unsubscribeUrl}`;
}

export function newsletterHtml(text, subject) {
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const content = text
    .split("\n")
    .map((line) => {
      const at =
        line.indexOf("https://") >= 0
          ? line.indexOf("https://")
          : line.indexOf("http://");
      if (at < 0) return escape(line) || "<br>";
      const label = line.slice(0, at).replace(/:\s*$/, "") || "Open Good Plans";
      const link = line.slice(at);
      return `<a href="${escape(link)}" style="color:#58468d;font-weight:bold">${escape(label)}</a>`;
    })
    .join("<br>");
  return `<!doctype html><html><body style="margin:0;background:#fff0ca;color:#28241f;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;padding:32px 24px"><p style="font-weight:bold;letter-spacing:2px">GOOD PLANS DUBLIN</p><h1 style="font-family:Georgia,serif;color:#58468d">${escape(subject)}</h1><div style="background:#fffaf0;border:2px solid #28241f;padding:24px;line-height:1.6">${content}</div><p>Make time. Make it good.</p></div></body></html>`;
}
