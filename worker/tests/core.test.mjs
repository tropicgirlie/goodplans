import assert from 'node:assert/strict';
import test from 'node:test';
import { allowedImportUrl, draftFromPage, makeIcs, resolveRsvp } from '../src/core.js';

test('waitlists an accepted RSVP once capacity is full', () => {
  assert.equal(resolveRsvp({ capacity: 2, acceptedCount: 2, currentStatus: null, requestedStatus: 'accepted' }), 'waitlisted');
  assert.equal(resolveRsvp({ capacity: 2, acceptedCount: 2, currentStatus: 'accepted', requestedStatus: 'accepted' }), 'accepted');
  assert.equal(resolveRsvp({ capacity: 2, acceptedCount: 2, currentStatus: 'accepted', requestedStatus: 'declined' }), 'declined');
});

test('only imports approved public hosts', () => {
  assert.equal(allowedImportUrl('https://www.eventbrite.com/e/good-plans', 'eventbrite.com,tickettailor.com').ok, true);
  assert.equal(allowedImportUrl('https://eventbrite.com.evil.example/tickets', 'eventbrite.com').ok, false);
  assert.equal(allowedImportUrl('file:///etc/passwd', 'eventbrite.com').ok, false);
});

test('prefers Event JSON-LD when importing a public event page', () => {
  const html = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Event","name":"Women in Tech Brunch","startDate":"2026-10-19T14:00:00+01:00","location":{"@type":"Place","name":"The Fumbally","address":{"streetAddress":"Fumbally Lane","addressLocality":"Dublin"}},"offers":{"price":"18","priceCurrency":"EUR"}}</script>`;
  const draft = draftFromPage({ html, sourceUrl: 'https://www.eventbrite.com/e/brunch' });
  assert.equal(draft.fields.title, 'Women in Tech Brunch');
  assert.equal(draft.fields.venueName, 'The Fumbally');
  assert.equal(draft.fields.venueAddress, 'Fumbally Lane, Dublin');
  assert.equal(draft.confidence.startsAt, 'high');
});

test('creates a portable calendar file', () => {
  const ics = makeIcs({ id: 'event_1', title: 'Good Plans Brunch', starts_at: '2026-10-19T14:00:00+01:00', ends_at: '2026-10-19T16:00:00+01:00', venue_name: 'The Fumbally', venue_address: 'Dublin 8', description: 'A small table.' });
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /SUMMARY:Good Plans Brunch/);
  assert.match(ics, /END:VCALENDAR/);
});
