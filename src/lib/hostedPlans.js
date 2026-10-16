import { localDate, wallDateTime } from "./plans.js";

const time = (d,zone) => wallDateTime(d,zone).split("T")[1];
export function hostedPlan(event, base = {}, metadata = {}) {
  const start = new Date(event.starts_at), end = new Date(event.ends_at);
  const guests = event.guests;
  return { ...base, ...metadata, id: base.id || `hosted-${event.id}`, remoteId: event.id, slug: event.slug,
    hostName:event.host_name||'',
    title: event.title, date: localDate(start,event.timezone), endDate: localDate(end,event.timezone) === localDate(start,event.timezone) ? "" : localDate(end,event.timezone),
    time: time(start,event.timezone), endTime: time(end,event.timezone), timezone:event.timezone, city:event.city || base.city, startsAt: event.starts_at, endsAt: event.ends_at,
    location: [event.venue_name, event.venue_address].filter(Boolean).join(", "), notes: event.description,
    cost:base.cost || (event.plan_type==='attend'?'Check the original booking page':''),
    capacity: event.capacity, status: event.status, plusOne: Boolean(event.plus_one),
    visibility:event.visibility||'invite',planType:event.plan_type||'own',bookingUrl:event.booking_url||'',publicUrl:event.share_url||'',
    showGuests: Boolean(event.show_guests), reminder: Boolean(event.reminder),
    seriesName: event.series_name || base.seriesName || "", seriesId: event.series_id, cadence: event.cadence,
    guests: guests ? guests.map(g => g.guest_name) : event.inviteLinks ? event.inviteLinks.map(g => g.guestName) : base.guests || [],
    ...(guests ? { guestEntries: guests.map(g => ({ id: g.id, name: g.guest_name, email: g.guest_email || "", status: g.status, partySize: g.party_size || 1 })) } : {}),
    counts: event.counts || base.counts, inviteLinks: event.inviteLinks || base.inviteLinks,
    kind: base.kind || "Gathering", image: base.image || "good-plans-gathering-collage.png" };
}
export function reconcileHostedPlans(plans, events, metadata = {}) {
  const used = new Set();
  const projected = events.map(event => {
    const exact = plans.find(p => p.remoteId === event.id);
    const draft = !exact && plans.find(p => !p.remoteId && p.id === event.client_id && !used.has(p.id));
    const base = exact || draft;
    if (base) used.add(base.id);
    return hostedPlan(event, base, metadata);
  });
  return [...plans.filter(p => !used.has(p.id)), ...projected];
}
