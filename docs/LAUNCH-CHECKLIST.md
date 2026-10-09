# Launch checklist — 9 October 2026

**Release target: an allowlisted, creator-led pilot. Not yet verified for public launch.**

[BACKLOG.md](./BACKLOG.md) is the current source for implementation and release work. [The audit](./AUDIT-2026-10-09.md) records the pre-fix findings and scope. Local completion does not establish production deployment or real email delivery.

## Implementation

- [x] Local personal planning without login; explicit account-scoped sync and a confirmation step.
- [x] Dashboard friends/notes/ideas, correct planner handoffs, consistent draft defaults and URL navigation.
- [x] Host sign-in, single events, recurring series, private invitations, capacity/plus-ones, waitlist promotion, editing and cancellation.
- [x] Discovery review queue, manual event additions, separately confirmed newsletter consent, weekly drafts and organiser approval before sending.
- [x] Support/data-request pages, signed email callbacks and delivery suppression implementation.
- [x] Local regression checks, isolated backend integration journeys and temporary production build.

## Configuration evidence

- [x] RESEND_API_KEY and EMAIL_FROM exist; a real sign-in code was received earlier.
- [x] Production health endpoint responded at audit time.
- [ ] Configure an authorised live event source, or curate reviewed manual listings. The production discovery feed was empty and Ticketmaster key absent at audit time.
- [ ] Register the production Resend webhook and configure its signing secret. RESEND_WEBHOOK_SECRET was absent at audit time.
- [ ] Confirm the production migration set and deploy the reviewed build. This pass has not changed production.

## Required live verification

- [ ] Real host → single event/series → private invite → guest RSVP/plus-one/waitlist → edit/cancel email → calendar export, including the phone guest UI.
- [ ] Approved test newsletter → subscribe/confirm → delivery callback → add to plan → unsubscribe/deletion.
- [ ] Two-browser sync, account changes on a shared browser, conflict resolution and backup recovery.
- [ ] Operator/contact, retention/deletion procedure, support owner, failure alerts and restore drill confirmed.
- [ ] Host allowlisting remains the advertised pilot scope. Public organiser signup is not implemented.

The scheduled collector queues candidates; approval remains mandatory before public listing or newsletter sending. Ticketmaster does not cover every independent class, retreat or community event. No listing guarantees safety, accessibility, availability or a booking.

After implementation checks, re-run a focused browser audit and complete these live checks before declaring the pilot ready.
