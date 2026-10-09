# Good Plans backlog

Updated 9 October 2026. Source: [full audit](./AUDIT-2026-10-09.md). Preserve the original scrapbook design. A checked implementation item means verified locally, not deployed or verified in production.

## Before release — P1

- [x] GP-01 — Wire dashboard logout to session invalidation and show failures.
- [x] GP-02 — Use a native settings dialog with initial focus, Escape, focus containment and restoration.
- [x] GP-03 — Carry homepage names, activity, moment and chosen recommendation into editable drafts.
- [x] GP-04 — Make recommendations use explicit preferences and the chosen city; remove demographic assumptions and correct map category labels.
- [x] GP-05 — Serve fonts locally, replace external example portraits with initials, load Maps only on request and disclose external requests.
- [x] GP-06 — Fix small-text/button contrast through shared colour tokens.
- [x] GP-07 — Scope optional sync consent to each account and explain workspace replacement before activation.

## Usability and reliability — P2

- [x] GP-08 — Apply invitation and series settings to new drafts consistently.
- [x] GP-09 — Prevent unrelated renders from resetting or refetching recommendations.
- [x] GP-10 — Unify friend editing/validation and preserve notes, likes and avoids.
- [x] GP-11 — Make storage copy reflect local versus explicitly enabled account sync.
- [x] GP-12 — Give dashboard pages stable URLs, refresh recovery and browser Back support.
- [x] GP-13 — Enlarge small touch targets without changing the design character.
- [x] GP-14 — Optimise artwork and favicon; lazy-load below-fold images.
- [x] GP-15 — Put Add your first person at the start of the empty circle flow.
- [x] GP-16 — Reconcile release documentation with current implementation/configuration evidence.

## Polish — P3

- [x] GP-17 — Ease heading tracking and simplify repeated mobile preambles; standardise spacing.

## Production verification — remains separate from local fixes

- [ ] REL-01 — Commit/review and deploy the intended version; verify live local-first behaviour.
- [ ] REL-02 — Populate discovery with reviewed manual events or configure an authorised source. Ticketmaster key was absent and production feed empty at audit time.
- [ ] REL-03 — Register the Resend webhook/secret and verify real delivered/bounced callbacks. Sending credentials exist and an OTP was received earlier.
- [ ] REL-04 — Real-domain host → single event/series → private invite → guest RSVP/plus-one/waitlist → edit/cancel email → calendar smoke test, including phone UI.
- [ ] REL-05 — Approved test newsletter: subscribe/confirm → edition → delivery → add to plan → unsubscribe/deletion.
- [ ] REL-06 — Two-browser sync and shared-browser account switching/conflict recovery verification.
- [ ] REL-07 — Confirm operator/contact, retention, deletion handling, support/operations owner, external alerts and a database restore drill.
- [ ] REL-08 — Keep the pilot host-allowlisted; implement public organiser registration before advertising self-service signup.

## Later product work

- [ ] Shared date voting.
- [ ] Bulk edits across future series occurrences.
- [ ] Two-way calendar sync.
- [ ] Additional authorised local class, retreat and community feeds.
- [ ] Scale newsletter delivery beyond the current supported audience.

## Verification log

- Baseline audit: 25 unit tests, two isolated backend integration journeys and a temporary production build pass. Browser checks found the issues above; no new deployment was made.

### 9 October 2026 — implementation pass

All 17 audit implementation items are addressed locally. Production release items remain open.

- Browser: homepage name/activity/moment reach a draft; settings gets focus, hides the background and closes with Escape/restores focus; dashboard logout signs out while retaining local friends.
- Browser: series draft receives title/date/location/capacity/cadence/invitation defaults; sign-in leaves sync disabled, and enabling sync requires the account-specific explanation. Declining leaves planning local.
- Browser: clean workspace shows Add your first friend without the empty matrix; structured friend details save together; a pottery interest moves a creative workshop to the first suggestion in the same-origin Worker preview.
- Browser: expanded recommendations survive opening/closing settings; dashboard refresh and browser Back retain/restore the correct section.
- Browser: gallery shortlist labels are accurate and Maps has no iframe until requested; inspected phone layouts have no horizontal overflow. Sync/footer target heights are 44px.
- Contrast: white/coral 5.75:1, coral/cream 5.08:1, blue/cream 5.89:1. Full accessibility certification remains outside this pass.
- Assets: hero 3.44 MB → 502 KB default WebP; invitation artwork 3.61 MB → 398 KB; mark 1.20 MB → 11 KB; favicon 3.6 KB. Responsive variants reduce phone downloads further. Original files are preserved.
- 30 unit tests and both isolated backend integration journeys pass. Temporary production build passes. Final build and duplicate-name UI validation also pass.
- No deployment, real newsletter send or production database mutation was made. Existing dist/index.html and .claude/ changes are preserved.

- Visual evidence: [phone onboarding](./screenshots/mobile-onboarding-2026-10-09.jpg). Production setup and live verification remain open under REL-01–REL-08.
