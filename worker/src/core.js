const encoder = new TextEncoder();

export const DEMO_VENUES = [
  { id: 'fumbally', name: 'The Fumbally', address: 'Fumbally Lane, Dublin 8', kind: 'Long-table lunch', fit: 'Easy for a mixed group', latitude: 53.3384, longitude: -6.2785 },
  { id: 'lighthouse', name: 'Light House Cinema', address: 'Market Square, Smithfield, Dublin 7', kind: 'Small-screen evening', fit: 'A good one-to-one plan', latitude: 53.3484, longitude: -6.2786 },
  { id: 'hugh-lane', name: 'Hugh Lane Gallery', address: 'Parnell Square North, Dublin 1', kind: 'Gallery late', fit: 'Start here, decide later', latitude: 53.3527, longitude: -6.2645 },
  { id: 'howth', name: 'Howth Harbour', address: 'Howth, Co. Dublin', kind: 'A day out of town', fit: 'Best when everyone wants fresh air', latitude: 53.3889, longitude: -6.0662 },
];

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
  });
}

export function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
}

export function slugify(value) {
  return String(value || 'good-plans-event').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 70) || 'good-plans-event';
}

export function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => part.trim().split(/=(.*)/s)).filter(([key]) => key).map(([key, value = '']) => [key, decodeURIComponent(value)]));
}

export async function sha256(value) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function allowedImportUrl(raw, allowedHosts = '') {
  let url;
  try { url = new URL(raw); } catch { return { ok: false, reason: 'That does not look like a complete public URL.' }; }
  if (!['https:', 'http:'].includes(url.protocol)) return { ok: false, reason: 'Only web links can be imported.' };
  if (url.username || url.password || url.port) return { ok: false, reason: 'That link is not supported.' };
  const host = url.hostname.toLowerCase();
  const allowed = allowedHosts.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  const permitted = allowed.some((domain) => host === domain || host.endsWith(`.${domain}`));
  return permitted ? { ok: true, url, host } : { ok: false, reason: 'This first version accepts links from approved public event and map sources only.' };
}

export function extractMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return null;
}

export function decodeHtml(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export function extractJsonLdEvent(html) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
  const visit = (value) => {
    if (!value) return null;
    if (Array.isArray(value)) { for (const item of value) { const found = visit(item); if (found) return found; } }
    if (typeof value === 'object') {
      const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
      if (types.includes('Event')) return value;
      if (value['@graph']) return visit(value['@graph']);
    }
    return null;
  };
  for (const script of scripts) {
    try { const found = visit(JSON.parse(script.trim())); if (found) return found; } catch { /* Ignore invalid publisher JSON-LD. */ }
  }
  return null;
}

export function draftFromPage({ html, sourceUrl }) {
  const event = extractJsonLdEvent(html);
  const location = event?.location || {};
  const address = typeof location === 'string' ? location : [location.address?.streetAddress, location.address?.addressLocality, location.address?.addressRegion, location.address?.postalCode].filter(Boolean).join(', ');
  const offers = Array.isArray(event?.offers) ? event.offers[0] : event?.offers;
  const title = event?.name || extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title');
  const description = event?.description || extractMeta(html, 'og:description') || extractMeta(html, 'description');
  const image = event?.image?.url || event?.image || extractMeta(html, 'og:image');
  const fields = {
    title: title || null,
    description: description || null,
    startsAt: event?.startDate || null,
    endsAt: event?.endDate || null,
    venueName: typeof location === 'object' ? location.name || null : null,
    venueAddress: address || null,
    price: offers?.price || null,
    currency: offers?.priceCurrency || null,
    image: image || null,
    sourceUrl,
  };
  const confidence = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, event?.[key] ? 'high' : value ? 'medium' : 'low']));
  if (event?.name) confidence.title = 'high';
  if (event?.startDate) confidence.startsAt = 'high';
  if (event?.location) { confidence.venueName = 'high'; confidence.venueAddress = address ? 'high' : 'medium'; }
  return { fields, confidence, sourceType: event ? 'structured_event' : 'page_metadata' };
}

export function resolveRsvp({ capacity, acceptedCount, currentStatus, requestedStatus }) {
  const valid = new Set(['accepted', 'maybe', 'declined']);
  if (!valid.has(requestedStatus)) throw new Error('Choose accepted, maybe, or declined.');
  if (requestedStatus !== 'accepted') return requestedStatus;
  const acceptedWithoutGuest = Math.max(0, acceptedCount - (currentStatus === 'accepted' ? 1 : 0));
  return acceptedWithoutGuest >= capacity ? 'waitlisted' : 'accepted';
}

export function calendarUrls(event, origin) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compactDate(event.starts_at)}/${compactDate(event.ends_at)}`,
    ctz: event.timezone,
    location: [event.venue_name, event.venue_address].filter(Boolean).join(', '),
    details: event.description || 'Planned with Good Plans',
  });
  return {
    google: `https://calendar.google.com/calendar/render?${params.toString()}`,
    ics: `${origin}/api/events/${encodeURIComponent(event.slug)}/calendar.ics`,
  };
}

export function compactDate(value) {
  return new Date(value).toISOString().replaceAll(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function makeIcs(event) {
  const escape = (value = '') => String(value).replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll(/\r?\n/g, '\\n');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Good Plans//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${escape(event.id)}@goodplans`, `DTSTAMP:${compactDate(new Date().toISOString())}`, `DTSTART:${compactDate(event.starts_at)}`, `DTEND:${compactDate(event.ends_at)}`, `SUMMARY:${escape(event.title)}`, `DESCRIPTION:${escape(event.description || 'Planned with Good Plans')}`, `LOCATION:${escape([event.venue_name, event.venue_address].filter(Boolean).join(', '))}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
}
