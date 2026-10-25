# Launch checklist — updated 25 October 2026

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
- [x] Enable a permitted live source and populate reviewed listings. Dublin.ie enabled; real queue collected three candidates, all three manually reviewed and published after a classifier correction. Ticketmaster remains optional.
- [ ] Register the production Resend webhook and configure its signing secret. RESEND_WEBHOOK_SECRET was absent at audit time.
- [x] Apply migrations through 0013 and deploy frontend/Worker to both custom domains. Live health, matching assets and anonymous host protection checked. [Activation evidence](./LAUNCH-2026-10-25.md).

## Required live verification

- [ ] Real host → single event/series → private invite → guest RSVP/plus-one/waitlist → edit/cancel email → calendar export, including the phone guest UI.
- [ ] Approved test newsletter → subscribe/confirm → delivery callback → add to plan → unsubscribe/deletion.
- [ ] Two-browser sync, account changes on a shared browser, conflict resolution and backup recovery.
- [ ] Operator/contact, retention/deletion procedure, support owner, failure alerts and restore drill confirmed.
- [ ] Host allowlisting remains the advertised pilot scope. Public organiser signup is not implemented.

The scheduled collector queues candidates; approval remains mandatory before public listing or newsletter sending. Ticketmaster does not cover every independent class, retreat or community event. No listing guarantees safety, accessibility, availability or a booking.

Partial live checks completed on 25 October: creator inbox received sign-in and newsletter confirmation messages, newsletter preferences/unsubscribe/deletion worked with no subscriber remaining, public discovery filters and event-to-plan handoff worked, and a local-first friend plan retained its date/venue/guest after reload at phone widths. A private backup restored into a separate local database with integrity OK and no foreign-key violations. These checks do not close the remaining authenticated event, edition, callback, sync, physical-device and operational-owner requirements above.

After implementation checks, re-run a focused browser audit and complete these live checks before declaring the pilot ready.
