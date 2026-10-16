import { bookingLink } from './invitations.js';
// These are editorial confirmations, never inferred from an event category or name.
export function eventCare(input = {}) {
  const children = input.children_welcome ?? 'unknown';
  const childcare = input.childcare ?? 'unknown';
  if (!['unknown', 'yes', 'no'].includes(children) || !['unknown', 'provided', 'not-provided'].includes(childcare))
    throw Object.assign(new Error('Choose valid children and childcare options.'), { status: 400 });
  const evidence = bookingLink(input.care_url);
  if ((children !== 'unknown' || childcare !== 'unknown') && !evidence)
    throw Object.assign(new Error('Add the organiser’s page confirming the children or childcare details.'), { status: 400 });
  return { children_welcome: children, childcare, care_url: evidence };
}
export function careNotes(event) {
  return [event.children_welcome === 'yes' ? 'Children welcome — check the organiser’s age limits.' : event.children_welcome === 'no' ? 'Adults only.' : '',
    event.childcare === 'provided' ? 'Childcare listed by the organiser — confirm ages, availability, cost and booking directly.' : event.childcare === 'not-provided' ? 'No childcare provided.' : '',
    event.care_url ? `Children & childcare details: ${event.care_url}` : ''].filter(Boolean).join('\n');
}
