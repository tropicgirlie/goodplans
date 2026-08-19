import { DEMO_VENUES, allowedImportUrl, calendarUrls, draftFromPage, id, json, makeIcs, parseCookies, randomToken, resolveRsvp, sha256, slugify } from './core.js';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const cors = { 'access-control-allow-headers': 'content-type, x-good-plans-demo-host', 'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS' };
const accessKeys = new Map();

class HttpError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

function response(data, init = {}) { return json(data, { ...init, headers: { ...cors, ...(init.headers || {}) } }); }
function now() { return new Date().toISOString(); }
function cookie(name, value, maxAge, production) { return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${production ? '; Secure' : ''}`; }
function originOf(request) { const url = new URL(request.url); return `${url.protocol}//${url.host}`; }

async function body(request) {
  try { return await request.json(); } catch { throw new Error('Send a valid JSON request body.'); }
}

async function hostIdentity(request, env) {
  const demoEmail = env.ENVIRONMENT === 'development' && request.headers.get('x-good-plans-demo-host') === env.DEV_HOST_KEY ? 'tessa@example.com' : null;
  let accessEmail = null;
  if (env.ENVIRONMENT === 'production') {
    if (!env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) throw new HttpError('Host sign-in is not configured yet. Finish Cloudflare Access setup before using organiser tools.', 503);
    const token = request.headers.get('cf-access-jwt-assertion');
    if (!token) return null;
    const teamDomain = env.CF_ACCESS_TEAM_DOMAIN.replace(/\/$/, '');
    if (!accessKeys.has(teamDomain)) accessKeys.set(teamDomain, createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`)));
    try {
      const { payload } = await jwtVerify(token, accessKeys.get(teamDomain), { issuer: teamDomain, audience: env.CF_ACCESS_AUD });
      accessEmail = typeof payload.email === 'string' ? payload.email : null;
    } catch { return null; }
  }
  const email = (accessEmail || demoEmail || '').toLowerCase();
  const permitted = (env.HOST_EMAILS || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (!email || !permitted.includes(email)) return null;
  const existing = await env.DB.prepare('SELECT id, email, display_name FROM users WHERE email = ?').bind(email).first();
  if (existing) return existing;
  const user = { id: id('user'), email, display_name: email.split('@')[0] };
  await env.DB.prepare('INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)').bind(user.id, user.email, user.display_name).run();
  return user;
}

async function requireHost(request, env) {
  const user = await hostIdentity(request, env);
  if (!user) throw new HttpError('Host sign-in is required. In production, protect host routes with Cloudflare Access.', 401);
  return user;
}

async function guestIdentity(request, env) {
  const session = parseCookies(request.headers.get('cookie')).good_plans_guest;
  if (!session) return null;
  const hash = await sha256(session);
  return env.DB.prepare(`SELECT gs.id AS session_id, i.id AS invitation_id, i.event_id, i.guest_name, i.guest_email
    FROM guest_sessions gs JOIN invitations i ON i.id = gs.invitation_id
    WHERE gs.session_hash = ? AND gs.expires_at > ?`).bind(hash, now()).first();
}

async function eventForSlug(env, slug) {
  return env.DB.prepare(`SELECT e.*, t.name AS template_name, t.art_direction FROM events e
    LEFT JOIN event_templates t ON t.id = e.template_id WHERE e.slug = ?`).bind(slug).first();
}

async function canReadEvent(request, env, event) {
  const host = await hostIdentity(request, env);
  if (host?.id === event.host_user_id) return true;
  if (event.status !== 'published') return false;
  if (event.visibility === 'public') return true;
  const guest = await guestIdentity(request, env);
  return guest?.event_id === event.id;
}

function publicEvent(event, origin) {
  const { host_user_id, organisation_id, series_id, template_id, cover_key, ...safe } = event;
  return { ...safe, cover_url: cover_key ? `${origin}/api/events/${encodeURIComponent(event.slug)}/cover` : null };
}

async function counts(env, eventId) {
  const rows = await env.DB.prepare(`SELECT status, COUNT(*) AS count FROM rsvps WHERE event_id = ? GROUP BY status`).bind(eventId).all();
  return Object.assign({ accepted: 0, maybe: 0, declined: 0, waitlisted: 0 }, ...rows.results.map((row) => ({ [row.status]: Number(row.count) })));
}

async function uniqueSlug(env, title) {
  const base = slugify(title);
  let candidate = base;
  let suffix = 2;
  while (await env.DB.prepare('SELECT id FROM events WHERE slug = ?').bind(candidate).first()) candidate = `${base}-${suffix++}`;
  return candidate;
}

async function ownedOrganisation(env, host, input) {
  let organisation = input.organisationId
    ? await env.DB.prepare('SELECT * FROM organisations WHERE id = ? AND owner_user_id = ?').bind(input.organisationId, host.id).first()
    : null;
  if (!organisation) organisation = await env.DB.prepare('SELECT * FROM organisations WHERE owner_user_id = ? ORDER BY created_at ASC LIMIT 1').bind(host.id).first();
  if (organisation) return organisation;
  organisation = { id: id('org'), name: String(input.organisationName || 'Women in Tech').slice(0, 120), owner_user_id: host.id };
  await env.DB.prepare('INSERT INTO organisations (id, name, owner_user_id) VALUES (?, ?, ?)').bind(organisation.id, organisation.name, organisation.owner_user_id).run();
  return organisation;
}

async function ownedTemplate(env, organisationId, input) {
  let template = input.templateId
    ? await env.DB.prepare('SELECT * FROM event_templates WHERE id = ? AND organisation_id = ?').bind(input.templateId, organisationId).first()
    : null;
  if (template || !input.templateName) return template;
  template = {
    id: id('template'),
    name: String(input.templateName).slice(0, 120),
    format: String(input.templateFormat || 'brunch').slice(0, 80),
    audienceTone: String(input.audienceTone || 'thoughtful friends').slice(0, 120),
    mood: String(input.mood || 'warm and considered').slice(0, 120),
    ageRange: input.ageRange ? String(input.ageRange).slice(0, 40) : null,
    palette: JSON.stringify(input.palette || ['terracotta', 'butter', 'dusty violet', 'ink']),
    artDirection: String(input.artDirection || 'Editorial paper collage, image-led, no text, no logos, no stereotypes.').slice(0, 500),
    prompt: String(input.promptTemplate || 'Original Good Plans editorial paper collage for {title}. Audience: {audience_tone}. Mood: {mood}. Image-led, no text, logos or stereotypes.').slice(0, 1000),
  };
  await env.DB.prepare(`INSERT INTO event_templates (id, organisation_id, name, format, audience_tone, mood, age_range, palette_json, art_direction, prompt_template)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(template.id, organisationId, template.name, template.format, template.audienceTone, template.mood, template.ageRange, template.palette, template.artDirection, template.prompt).run();
  return { ...template, organisation_id: organisationId, prompt_template: template.prompt, audience_tone: template.audienceTone };
}

async function ownedSeries(env, organisationId, templateId, input) {
  if (!input.seriesName) return null;
  let series = input.seriesId
    ? await env.DB.prepare('SELECT * FROM event_series WHERE id = ? AND organisation_id = ?').bind(input.seriesId, organisationId).first()
    : null;
  if (!series) series = await env.DB.prepare('SELECT * FROM event_series WHERE organisation_id = ? AND name = ?').bind(organisationId, String(input.seriesName).slice(0, 120)).first();
  if (series) return series;
  series = { id: id('series'), name: String(input.seriesName).slice(0, 120), city: input.city || null, cadence: input.cadence || null, templateId: templateId || null };
  await env.DB.prepare('INSERT INTO event_series (id, organisation_id, name, city, cadence, default_template_id) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(series.id, organisationId, series.name, series.city, series.cadence, series.templateId).run();
  return series;
}

async function fetchAllowedPage(url, env) {
  let current = url;
  for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
    const checked = allowedImportUrl(current, env.IMPORT_ALLOWED_HOSTS || '');
    if (!checked.ok) throw new Error(checked.reason);
    const result = await fetch(checked.url, { redirect: 'manual', headers: { 'user-agent': 'GoodPlansLinkImporter/1.0' } });
    if ([301, 302, 303, 307, 308].includes(result.status)) {
      const location = result.headers.get('location');
      if (!location) throw new Error('That event page redirected without a destination.');
      current = new URL(location, checked.url).toString();
      continue;
    }
    if (!result.ok) throw new Error('That event page could not be read right now.');
    const contentType = result.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) throw new Error('That link does not point to a public event page.');
    const length = Number(result.headers.get('content-length') || 0);
    if (length > 512_000) throw new Error('That page is too large to import safely.');
    const text = (await result.text()).slice(0, 512_000);
    return { html: text, url: current, host: new URL(current).hostname };
  }
  throw new Error('That link redirected too many times.');
}

async function processImport(env, sourceId) {
  const source = await env.DB.prepare('SELECT * FROM event_sources WHERE id = ?').bind(sourceId).first();
  if (!source) return;
  try {
    const page = await fetchAllowedPage(source.source_url, env);
    const draft = draftFromPage({ html: page.html, sourceUrl: page.url });
    await env.DB.prepare(`UPDATE event_sources SET status = 'ready_for_review', source_host = ?, source_type = ?, snapshot_json = ?, draft_json = ?, confidence_json = ?, updated_at = ? WHERE id = ?`)
      .bind(page.host, draft.sourceType, JSON.stringify({ title: draft.fields.title, image: draft.fields.image, sourceUrl: page.url }), JSON.stringify(draft.fields), JSON.stringify(draft.confidence), now(), sourceId).run();
  } catch (error) {
    await env.DB.prepare(`UPDATE event_sources SET status = 'failed', snapshot_json = ?, updated_at = ? WHERE id = ?`).bind(JSON.stringify({ error: error.message }), now(), sourceId).run();
  }
}

export class EventRoom {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/connect') {
      if (request.headers.get('upgrade') !== 'websocket') return new Response('Expected WebSocket', { status: 426 });
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }
    if (url.pathname === '/rsvp' && request.method === 'POST') return this.rsvp(await request.json());
    if (url.pathname === '/rebalance' && request.method === 'POST') return this.rebalance(await request.json());
    return new Response('Not found', { status: 404 });
  }

  async rsvp({ eventId, invitationId, requestedStatus }) {
    const event = await this.env.DB.prepare('SELECT id, capacity FROM events WHERE id = ?').bind(eventId).first();
    const invitation = await this.env.DB.prepare('SELECT id, event_id FROM invitations WHERE id = ?').bind(invitationId).first();
    if (!event || !invitation || invitation.event_id !== event.id) return response({ error: 'Invitation is not valid for this event.' }, { status: 403 });
    const current = await this.env.DB.prepare('SELECT * FROM rsvps WHERE invitation_id = ?').bind(invitationId).first();
    const accepted = await this.env.DB.prepare(`SELECT COUNT(*) AS count FROM rsvps WHERE event_id = ? AND status = 'accepted'`).bind(eventId).first();
    let status;
    try { status = resolveRsvp({ capacity: event.capacity, acceptedCount: Number(accepted.count), currentStatus: current?.status, requestedStatus }); } catch (error) { return response({ error: error.message }, { status: 400 }); }
    const rsvpId = current?.id || id('rsvp');
    await this.env.DB.prepare(`INSERT INTO rsvps (id, event_id, invitation_id, status, responded_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(invitation_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`).bind(rsvpId, eventId, invitationId, status, now(), now()).run();
    if (current?.status === 'accepted' && status !== 'accepted') await this.promote(eventId, event.capacity);
    const latestCounts = await counts(this.env, eventId);
    this.broadcast({ type: 'rsvp_counts', eventId, counts: latestCounts });
    return response({ rsvp: { id: rsvpId, status }, counts: latestCounts });
  }

  async rebalance({ eventId }) {
    const event = await this.env.DB.prepare('SELECT id, capacity FROM events WHERE id = ?').bind(eventId).first();
    if (!event) return response({ error: 'Event not found.' }, { status: 404 });
    await this.promote(eventId, event.capacity);
    const latestCounts = await counts(this.env, eventId);
    this.broadcast({ type: 'rsvp_counts', eventId, counts: latestCounts });
    return response({ counts: latestCounts });
  }

  async promote(eventId, capacity) {
    const accepted = await this.env.DB.prepare(`SELECT COUNT(*) AS count FROM rsvps WHERE event_id = ? AND status = 'accepted'`).bind(eventId).first();
    if (Number(accepted.count) >= capacity) return;
    const next = await this.env.DB.prepare(`SELECT id, invitation_id FROM rsvps WHERE event_id = ? AND status = 'waitlisted' ORDER BY responded_at ASC LIMIT 1`).bind(eventId).first();
    if (!next) return;
    await this.env.DB.prepare(`UPDATE rsvps SET status = 'accepted', updated_at = ? WHERE id = ?`).bind(now(), next.id).run();
    const notification = { id: id('notify'), eventId, invitationId: next.invitation_id, kind: 'waitlist_promoted' };
    await this.env.DB.prepare(`INSERT INTO notification_outbox (id, event_id, invitation_id, kind, payload_json) VALUES (?, ?, ?, ?, ?)`).bind(notification.id, notification.eventId, notification.invitationId, notification.kind, JSON.stringify(notification)).run();
    if (this.env.NOTIFICATION_QUEUE) await this.env.NOTIFICATION_QUEUE.send(notification);
  }

  broadcast(payload) { for (const socket of this.ctx.getWebSockets()) { try { socket.send(JSON.stringify(payload)); } catch { /* Closed clients are removed by the runtime. */ } } }
  webSocketMessage() { /* Good Plans WebSockets are server-push only. */ }
  webSocketClose(socket) { socket.close(); }
  webSocketError(socket) { socket.close(); }
}

async function createEvent(request, env) {
  const host = await requireHost(request, env);
  const input = await body(request);
  for (const key of ['title', 'startsAt', 'endsAt', 'timezone']) if (!input[key]) throw new Error(`${key} is required.`);
  const organisation = await ownedOrganisation(env, host, input);
  const template = await ownedTemplate(env, organisation.id, input);
  const series = await ownedSeries(env, organisation.id, template?.id || null, input);
  const event = {
    id: id('event'), hostUserId: host.id, slug: await uniqueSlug(env, input.slug || input.title), title: input.title.trim(), description: input.description || null,
    startsAt: input.startsAt, endsAt: input.endsAt, timezone: input.timezone, venueName: input.venueName || null, venueAddress: input.venueAddress || null,
    venuePlaceId: input.venuePlaceId || null, city: input.city || null, capacity: Number(input.capacity || 12), visibility: input.visibility === 'public' ? 'public' : 'invite',
    status: input.publish ? 'published' : 'draft', organisationId: organisation.id, seriesId: series?.id || null, templateId: template?.id || null,
  };
  if (!Number.isInteger(event.capacity) || event.capacity < 1 || event.capacity > 500) throw new Error('Capacity must be between 1 and 500.');
  await env.DB.prepare(`INSERT INTO events (id, organisation_id, series_id, template_id, host_user_id, slug, title, description, starts_at, ends_at, timezone, venue_name, venue_address, venue_place_id, city, capacity, visibility, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(event.id, event.organisationId, event.seriesId, event.templateId, event.hostUserId, event.slug, event.title, event.description, event.startsAt, event.endsAt, event.timezone, event.venueName, event.venueAddress, event.venuePlaceId, event.city, event.capacity, event.visibility, event.status).run();
  const inviteLinks = await createInvitations(env, event.id, event.slug, input.guests, originOf(request));
  if (template) {
    const artwork = { id: id('art'), eventId: event.id, templateId: template.id, prompt: template.prompt_template.replaceAll('{title}', event.title).replaceAll('{audience_tone}', template.audience_tone).replaceAll('{mood}', template.mood) };
    await env.DB.prepare(`INSERT INTO event_artwork (id, event_id, template_id, status, prompt_snapshot) VALUES (?, ?, ?, 'queued', ?)`).bind(artwork.id, artwork.eventId, artwork.templateId, artwork.prompt).run();
    if (env.ARTWORK_QUEUE) await env.ARTWORK_QUEUE.send(artwork);
  }
  return response({ event: { ...event, starts_at: event.startsAt, ends_at: event.endsAt }, inviteLinks, urls: calendarUrls({ ...event, starts_at: event.startsAt, ends_at: event.endsAt, venue_name: event.venueName, venue_address: event.venueAddress }, originOf(request)) }, { status: 201 });
}

async function createInvitations(env, eventId, slug, guests, origin) {
  if (!Array.isArray(guests)) return [];
  const inviteLinks = [];
  for (const guest of guests.slice(0, 100)) {
    if (!guest?.name && !guest?.email) continue;
    const token = randomToken();
    const invitation = { id: id('invite'), name: String(guest.name || '').slice(0, 100) || null, email: String(guest.email || '').toLowerCase().slice(0, 254) || null };
    await env.DB.prepare(`INSERT INTO invitations (id, event_id, guest_email, guest_name, token_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(invitation.id, eventId, invitation.email, invitation.name, await sha256(token), guest.expiresAt || null).run();
    inviteLinks.push({ invitationId: invitation.id, guestName: invitation.name, inviteUrl: `${origin}/events/${encodeURIComponent(slug)}#invite=${token}` });
  }
  return inviteLinks;
}

async function updateEvent(request, env, eventId) {
  const host = await requireHost(request, env);
  const event = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first();
  if (!event || event.host_user_id !== host.id) return response({ error: 'Event not found.' }, { status: 404 });
  const input = await body(request);
  const allowed = { title: 'title', description: 'description', startsAt: 'starts_at', endsAt: 'ends_at', timezone: 'timezone', venueName: 'venue_name', venueAddress: 'venue_address', venuePlaceId: 'venue_place_id', city: 'city', capacity: 'capacity', visibility: 'visibility' };
  const updates = Object.entries(allowed).filter(([key]) => input[key] !== undefined).map(([key, column]) => ({ key, column, value: key === 'capacity' ? Number(input[key]) : input[key] }));
  if (!updates.length) return response({ event });
  if (updates.some((item) => item.key === 'capacity' && (!Number.isInteger(item.value) || item.value < 1 || item.value > 500))) return response({ error: 'Capacity must be between 1 and 500.' }, { status: 400 });
  const statement = `UPDATE events SET ${updates.map((item) => `${item.column} = ?`).join(', ')}, revision = revision + 1, updated_at = ? WHERE id = ?`;
  await env.DB.prepare(statement).bind(...updates.map((item) => item.value), now(), eventId).run();
  await env.DB.prepare(`INSERT INTO event_changes (id, event_id, actor_user_id, changed_fields_json, message) VALUES (?, ?, ?, ?, ?)`)
    .bind(id('change'), eventId, host.id, JSON.stringify(updates.map((item) => item.key)), input.message || null).run();
  const latest = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first();
  const notify = { id: id('notify'), eventId, kind: 'event_updated', revision: latest.revision };
  await env.DB.prepare(`INSERT INTO notification_outbox (id, event_id, kind, payload_json) VALUES (?, ?, ?, ?)`).bind(notify.id, eventId, notify.kind, JSON.stringify(notify)).run();
  if (env.NOTIFICATION_QUEUE) await env.NOTIFICATION_QUEUE.send(notify);
  if (updates.some((item) => item.key === 'capacity')) {
    const room = env.EVENT_ROOM.get(env.EVENT_ROOM.idFromName(eventId));
    await room.fetch('https://event-room/rebalance', { method: 'POST', body: JSON.stringify({ eventId }) });
  }
  return response({ event: latest, counts: await counts(env, eventId) });
}

async function publishEvent(request, env, eventId) {
  const host = await requireHost(request, env);
  const event = await env.DB.prepare('SELECT * FROM events WHERE id = ? AND host_user_id = ?').bind(eventId, host.id).first();
  if (!event) return response({ error: 'Event not found.' }, { status: 404 });
  await env.DB.prepare(`UPDATE events SET status = 'published', revision = revision + 1, updated_at = ? WHERE id = ?`).bind(now(), event.id).run();
  return response({ event: await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(event.id).first() });
}

async function requestArtwork(request, env, eventId) {
  const host = await requireHost(request, env);
  const event = await env.DB.prepare('SELECT * FROM events WHERE id = ? AND host_user_id = ?').bind(eventId, host.id).first();
  if (!event) return response({ error: 'Event not found.' }, { status: 404 });
  const template = event.template_id ? await env.DB.prepare('SELECT * FROM event_templates WHERE id = ?').bind(event.template_id).first() : null;
  const input = await body(request);
  const artwork = { id: id('art'), eventId: event.id, templateId: template?.id || null, prompt: input.prompt || template?.prompt_template?.replaceAll('{title}', event.title).replaceAll('{audience_tone}', template.audience_tone).replaceAll('{mood}', template.mood) || `Original Good Plans paper collage cover for ${event.title}.` };
  await env.DB.prepare(`INSERT INTO event_artwork (id, event_id, template_id, status, prompt_snapshot) VALUES (?, ?, ?, 'queued', ?)`).bind(artwork.id, artwork.eventId, artwork.templateId, artwork.prompt).run();
  if (env.ARTWORK_QUEUE) await env.ARTWORK_QUEUE.send(artwork);
  return response({ artwork: { id: artwork.id, status: 'queued' } }, { status: 202 });
}

async function addInvitations(request, env, eventId) {
  const host = await requireHost(request, env);
  const event = await env.DB.prepare('SELECT * FROM events WHERE id = ? AND host_user_id = ?').bind(eventId, host.id).first();
  if (!event) return response({ error: 'Event not found.' }, { status: 404 });
  const input = await body(request);
  const inviteLinks = await createInvitations(env, event.id, event.slug, input.guests, originOf(request));
  return response({ inviteLinks }, { status: 201 });
}

async function exchangeInvite(request, env) {
  const { token } = await body(request);
  if (!token || token.length < 32) return response({ error: 'That invitation link is not valid.' }, { status: 400 });
  const invitation = await env.DB.prepare(`SELECT i.*, e.slug FROM invitations i JOIN events e ON e.id = i.event_id WHERE i.token_hash = ? AND (i.expires_at IS NULL OR i.expires_at > ?)`)
    .bind(await sha256(token), now()).first();
  if (!invitation) return response({ error: 'That invitation link has expired or is not valid.' }, { status: 404 });
  const rawSession = randomToken();
  await env.DB.prepare(`INSERT INTO guest_sessions (id, invitation_id, session_hash, expires_at) VALUES (?, ?, ?, ?)`)
    .bind(id('session'), invitation.id, await sha256(rawSession), new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()).run();
  return response({ eventSlug: invitation.slug }, { headers: { 'set-cookie': cookie('good_plans_guest', rawSession, 60 * 60 * 24 * 30, env.ENVIRONMENT === 'production') } });
}

async function submitRsvp(request, env, eventId) {
  const guest = await guestIdentity(request, env);
  if (!guest || guest.event_id !== eventId) return response({ error: 'Open this event from your invite link to respond.' }, { status: 403 });
  const input = await body(request);
  const room = env.EVENT_ROOM.get(env.EVENT_ROOM.idFromName(eventId));
  return room.fetch('https://event-room/rsvp', { method: 'POST', body: JSON.stringify({ eventId, invitationId: guest.invitation_id, requestedStatus: input.status }) });
}

async function createImport(request, env) {
  const host = await requireHost(request, env);
  const input = await body(request);
  const checked = allowedImportUrl(input.url, env.IMPORT_ALLOWED_HOSTS || '');
  if (!checked.ok) return response({ error: checked.reason }, { status: 400 });
  const source = { id: id('source'), hostId: host.id, url: checked.url.toString(), host: checked.host };
  await env.DB.prepare(`INSERT INTO event_sources (id, host_user_id, source_url, source_host, source_type, status) VALUES (?, ?, ?, ?, 'pending', 'queued')`)
    .bind(source.id, source.hostId, source.url, source.host).run();
  if (env.IMPORT_QUEUE) await env.IMPORT_QUEUE.send({ sourceId: source.id }); else await processImport(env, source.id);
  return response({ import: { id: source.id, status: 'queued' } }, { status: 202 });
}

async function getImport(request, env, sourceId) {
  const host = await requireHost(request, env);
  const source = await env.DB.prepare('SELECT * FROM event_sources WHERE id = ? AND host_user_id = ?').bind(sourceId, host.id).first();
  return source ? response({ import: source }) : response({ error: 'Import not found.' }, { status: 404 });
}

async function confirmImport(request, env, sourceId) {
  const host = await requireHost(request, env);
  const source = await env.DB.prepare('SELECT * FROM event_sources WHERE id = ? AND host_user_id = ?').bind(sourceId, host.id).first();
  if (!source) return response({ error: 'Import not found.' }, { status: 404 });
  if (source.status !== 'ready_for_review') return response({ error: 'This link is not ready to turn into an event yet.' }, { status: 409 });
  const draft = JSON.parse(source.draft_json || '{}');
  const input = await body(request);
  const eventInput = {
    title: input.title || draft.title,
    description: input.description || draft.description,
    startsAt: input.startsAt || draft.startsAt,
    endsAt: input.endsAt || draft.endsAt,
    timezone: input.timezone || 'Europe/Dublin',
    venueName: input.venueName || draft.venueName,
    venueAddress: input.venueAddress || draft.venueAddress,
    city: input.city,
    capacity: input.capacity,
    visibility: input.visibility,
    templateId: input.templateId,
    organisationId: input.organisationId,
    seriesId: input.seriesId,
    guests: input.guests,
  };
  const missing = ['title', 'startsAt', 'endsAt'].filter((key) => !eventInput[key]);
  if (missing.length) return response({ error: 'Review the missing event details before creating it.', missing, draft, confidence: JSON.parse(source.confidence_json || '{}') }, { status: 422 });
  const created = await createEvent(new Request(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify(eventInput) }), env);
  if (!created.ok) return created;
  const createdBody = await created.clone().json();
  await env.DB.prepare(`UPDATE event_sources SET event_id = ?, status = 'confirmed', confirmed_at = ?, updated_at = ? WHERE id = ?`).bind(createdBody.event.id, now(), now(), source.id).run();
  return response({ ...createdBody, source: { id: source.id, status: 'confirmed' } }, { status: 201 });
}

async function recommendations(request, env) {
  const input = await body(request);
  const city = input.city || 'Dublin';
  const activity = input.activity || 'something social';
  if (!env.GOOGLE_PLACES_API_KEY) return response({ source: 'demo', venues: DEMO_VENUES.map((venue) => ({ ...venue, explanation: `${venue.fit}. A good ${activity.toLowerCase()} option in ${city}.` })) });
  const placesResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GOOGLE_PLACES_API_KEY, 'x-goog-fieldmask': 'places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.googleMapsUri,places.regularOpeningHours' },
    body: JSON.stringify({ textQuery: `${activity} in ${city}`, languageCode: 'en' }),
  });
  if (!placesResponse.ok) return response({ error: 'Venue search is unavailable right now.' }, { status: 502 });
  const data = await placesResponse.json();
  const venues = (data.places || []).slice(0, 8).map((place) => ({ id: place.id, name: place.displayName?.text, address: place.formattedAddress, kind: place.types?.[0]?.replaceAll('_', ' ') || activity, rating: place.rating || null, mapsUrl: place.googleMapsUri, explanation: `A real ${activity.toLowerCase()} option in ${city}. Check current availability before booking.` }));
  return response({ source: 'google_places', venues });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/health') return response({ ok: true, service: 'good-plans', mode: env.ENVIRONMENT || 'production' });
      if (url.pathname === '/api/recommendations' && request.method === 'POST') return await recommendations(request, env);
      if (url.pathname === '/api/invites/exchange' && request.method === 'POST') return await exchangeInvite(request, env);
      if (url.pathname === '/api/host/event-imports' && request.method === 'POST') return await createImport(request, env);
      if (url.pathname.match(/^\/api\/host\/event-imports\/[^/]+$/) && request.method === 'GET') return await getImport(request, env, url.pathname.split('/').pop());
      const importConfirmMatch = url.pathname.match(/^\/api\/host\/event-imports\/([^/]+)\/confirm$/);
      if (importConfirmMatch && request.method === 'POST') return await confirmImport(request, env, decodeURIComponent(importConfirmMatch[1]));
      if (url.pathname === '/api/host/events' && request.method === 'POST') return await createEvent(request, env);
      const calendarMatch = url.pathname.match(/^\/api\/events\/([^/]+)\/calendar\.ics$/);
      if (calendarMatch && request.method === 'GET') {
        const event = await eventForSlug(env, decodeURIComponent(calendarMatch[1]));
        if (!event || !(await canReadEvent(request, env, event))) return response({ error: 'Event not found.' }, { status: 404 });
        return new Response(makeIcs(event), { headers: { 'content-type': 'text/calendar; charset=utf-8', 'content-disposition': `attachment; filename="${event.slug}.ics"` } });
      }
      const eventMatch = url.pathname.match(/^\/api\/events\/([^/]+)$/);
      const coverMatch = url.pathname.match(/^\/api\/events\/([^/]+)\/cover$/);
      if (coverMatch && request.method === 'GET') {
        const event = await eventForSlug(env, decodeURIComponent(coverMatch[1]));
        if (!event || !(await canReadEvent(request, env, event)) || !event.cover_key) return response({ error: 'Event cover not found.' }, { status: 404 });
        const cover = await env.ARTWORK.get(event.cover_key);
        if (!cover) return response({ error: 'Event cover not found.' }, { status: 404 });
        return new Response(cover.body, { headers: { 'content-type': cover.httpMetadata?.contentType || 'image/png', 'cache-control': 'public, max-age=3600' } });
      }
      if (eventMatch && request.method === 'GET') {
        const event = await eventForSlug(env, decodeURIComponent(eventMatch[1]));
        if (!event || !(await canReadEvent(request, env, event))) return response({ error: 'Event not found.' }, { status: 404 });
        return response({ event: publicEvent(event, originOf(request)), counts: await counts(env, event.id), calendar: calendarUrls(event, originOf(request)) });
      }
      const updateMatch = url.pathname.match(/^\/api\/host\/events\/([^/]+)$/);
      if (updateMatch && request.method === 'PATCH') return await updateEvent(request, env, decodeURIComponent(updateMatch[1]));
      const publishMatch = url.pathname.match(/^\/api\/host\/events\/([^/]+)\/publish$/);
      if (publishMatch && request.method === 'POST') return await publishEvent(request, env, decodeURIComponent(publishMatch[1]));
      const artworkMatch = url.pathname.match(/^\/api\/host\/events\/([^/]+)\/artwork$/);
      if (artworkMatch && request.method === 'POST') return await requestArtwork(request, env, decodeURIComponent(artworkMatch[1]));
      const rsvpMatch = url.pathname.match(/^\/api\/events\/([^/]+)\/rsvps$/);
      if (rsvpMatch && request.method === 'POST') return await submitRsvp(request, env, decodeURIComponent(rsvpMatch[1]));
      const invitationMatch = url.pathname.match(/^\/api\/host\/events\/([^/]+)\/invitations$/);
      if (invitationMatch && request.method === 'POST') return await addInvitations(request, env, decodeURIComponent(invitationMatch[1]));
      const dashboardMatch = url.pathname.match(/^\/api\/host\/events\/([^/]+)\/dashboard$/);
      if (dashboardMatch && request.method === 'GET') {
        const host = await requireHost(request, env);
        const event = await env.DB.prepare('SELECT * FROM events WHERE id = ? AND host_user_id = ?').bind(decodeURIComponent(dashboardMatch[1]), host.id).first();
        if (!event) return response({ error: 'Event not found.' }, { status: 404 });
        const changes = await env.DB.prepare('SELECT * FROM event_changes WHERE event_id = ? ORDER BY created_at DESC LIMIT 10').bind(event.id).all();
        return response({ event, counts: await counts(env, event.id), changes: changes.results });
      }
      const roomMatch = url.pathname.match(/^\/api\/events\/([^/]+)\/live$/);
      if (roomMatch && request.headers.get('upgrade') === 'websocket') {
        const event = await env.DB.prepare('SELECT id, host_user_id FROM events WHERE id = ?').bind(decodeURIComponent(roomMatch[1])).first();
        if (!event) return response({ error: 'Event not found.' }, { status: 404 });
        const guest = await guestIdentity(request, env);
        const host = await hostIdentity(request, env);
        if (guest?.event_id !== event.id && host?.id !== event.host_user_id) return response({ error: 'Invite access is required.' }, { status: 403 });
        const room = env.EVENT_ROOM.get(env.EVENT_ROOM.idFromName(event.id));
        return await room.fetch(new Request('https://event-room/connect', request));
      }
      return await env.ASSETS.fetch(request);
    } catch (error) { return response({ error: error.message || 'Something went wrong.' }, { status: error.status || 500 }); }
  },
  async queue(batch, env) {
    for (const message of batch.messages) {
      try {
        if (message.body?.sourceId) await processImport(env, message.body.sourceId);
        if (message.body?.eventId && message.body?.prompt) await env.DB.prepare(`UPDATE event_artwork SET status = 'ready_for_approval' WHERE id = ?`).bind(message.body.id).run();
        if (message.body?.kind) await env.DB.prepare(`UPDATE notification_outbox SET status = 'sent', sent_at = ? WHERE id = ?`).bind(now(), message.body.id).run();
        message.ack();
      } catch { message.retry(); }
    }
  },
};
