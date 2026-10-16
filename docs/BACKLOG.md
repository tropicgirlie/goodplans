# Good Plans backlog

Updated 16 October 2026. Sources: [initial audit](./AUDIT-2026-10-09.md), [current UI/UX and flow audit](./AUDIT-2026-10-12.md). Preserve the original scrapbook design. A checked implementation item means verified locally, not deployed or verified in production.

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

## 12 October follow-up audit — new P1 fixes before release

- [x] GP-18 — Refresh hosted events after publication and open the intended event from Manage event & guests.
- [x] GP-19 — Reconcile every hosted/series occurrence into My plans/calendar, including current guest metadata and events absent from local storage.
- [x] GP-20 — Handle same-event invitation hash changes and bind responses to the displayed invitation identity; add shared-device/multiple-tab regressions.
- [x] GP-21 — Remove form-specific low-contrast overrides: placeholders measure 3.12:1 and unselected type labels about 4.46:1.

## 12 October follow-up audit — P2 usability and reliability

- [x] GP-22 — Simplify the friend-outing form; disclose hosting, email, capacity and series controls progressively.
- [x] GP-23 — Use stable draft guest/person IDs and case-insensitive duplicate validation; preserve name-associated email data on rename.
- [x] GP-24 — Refresh invitation details/guest state after responses; remove contradictory change-response copy on cancelled events.
- [x] GP-25 — Support explicit end dates for overnight/multi-day plans across forms, imports, invitations and calendar export, including overnight DST changes.
- [x] GP-26 — Give selected hosted events/occurrences and plan details stable URLs; make refresh and browser Back retain/close the intended context.
- [x] GP-27 — Match plan totals to active filters and reveal newly saved/imported plans under the correct filter, including reopening an already imported event.
- [x] GP-28 — Add separate host-list loading state; announce empty only after a successful empty response.
- [x] GP-29 — Make finder/schedule copy reflect real configuration and latest job status; avoid promising a background run while disconnected.
- [x] GP-30 — Expose current-page and selected-RSVP state through appropriate accessibility semantics or explicit response text.

Implementation evidence: [12 October fixes and validation](./FIXES-2026-10-12.md).

## Compact design follow-up

- [x] GP-31 — Shrink the default planner, add expand/shrink control, replace the muddy backdrop with cream, align both navigation bars and reduce dashboard/settings spacing.
- [x] GP-32 — Make the navigation create action smaller, remove its doubled shadow and the repeated dashboard topbar action.
- [x] GP-33 — Separate organiser event/series and weekly newsletter actions with a responsive gap.
- [x] GP-34 — Add English/Spanish language choice across active screens, dates, accessibility labels, planning copy and Spanish interest matching; preserve routes, draft state and canonical dropdown values.
- [x] GP-35 — Add Brazilian Portuguese (`pt-BR`) across the same screens, dates, invitations and supported interests; keep the language selector compact and preserve original personal/event content.
- [x] GP-36 — Add a Brazil region with editable city, Brazilian everyday outing examples, reais, official venue starter ideas in São Paulo/Rio, partner/family context and Brazilian event timezones across drafts, publication, series, host editing, invitations and calendar exports. Region choice is independent of language; saved events retain their own times and content.
- [ ] GP-37 — Connect authorised São Paulo event sources and expand reviewed coverage within the city. Add Brazil-specific scheduled curation/newsletter only after city filtering, source dates, opt-in and delivery verification are available. Current Brazil suggestions are explicitly evergreen ideas, not dated listings.
- [ ] GP-38 — Localise transactional email templates and store delivery-language preference independently from newsletter consent; verify Portuguese host/guest delivery on the real domain. Existing server-generated emails retain their current language.
- [ ] GP-39 — Check loading on a slower phone connection and consider lazy-loading additional workspace screens/locales. Material components and translation dictionaries now have separate cached chunks; the largest application chunk is 380KB and the 500KB chunk warning is gone. Total initial JavaScript is still about 668KB before compression, so slow-device performance remains unverified.
- [x] GP-40 — Review Brazilian Portuguese for natural wording and translation pitfalls. Clarify creative classes, remove literal marketing phrasing and provide the creator with [presentation review copy](./REVISAO-PT-BR-APRESENTACAO.md). Final editorial choices remain with the creator.
- [x] GP-41 — Replace fixed-choice dropdowns with shared Material Design select menus across all interface languages; preserve form values, keyboard navigation, compact navigation targets and menus inside dialogs. Translate the selected label immediately on language change.
- [x] GP-42 — Remove language-based country inference. Country/city choices stay stable across English, Spanish and Portuguese; translate editorial Brazil idea copy across languages while preserving official venue names and personal content.
- [x] GP-43 — Add Spain location settings, euros, fictional example friends and clearly labelled evergreen Barcelona ideas with official links. Launch choices are restricted to São Paulo (Brazil) and Barcelona (Spain); older saved plans retain their locations/timezones.
- [ ] GP-44 — Implement country/city-scoped discovery storage, public routes, organiser review/manual listing and background collectors for São Paulo (Brazil) and Barcelona (Spain). Connect authorised sources, verify date/price/cancellation handling and enable regional newsletters only after approval and delivery tests. [Implementation plan](./REGIONAL-EVENT-DISCOVERY.md).

## Production verification — remains separate from local fixes

- [ ] REL-01 — Deploy and verify the intended version on both public domains. Commit `ffe0ec1` was pushed; 12 October live inspection still shows the older example/map/planner behaviour. Verify live local-first behaviour after deployment.
- [ ] REL-02 — Populate discovery with reviewed manual events or configure an authorised source. Ticketmaster key was absent and production feed empty at audit time.
- [ ] REL-03 — Register the Resend webhook/secret and verify real delivered/bounced callbacks. Sending credentials exist and an OTP was received earlier.
- [ ] REL-04 — Real-domain host → single event/series → private invite → guest RSVP/plus-one/waitlist → edit/cancel email → calendar smoke test, including phone UI.
- [ ] REL-05 — Approved test newsletter: subscribe/confirm → edition → delivery → add to plan → unsubscribe/deletion.
- [ ] REL-06 — Two-browser sync and shared-browser account switching/conflict recovery verification.
- [ ] REL-07 — Confirm operator/contact, retention, deletion handling, support/operations owner, external alerts and a database restore drill.
- [ ] REL-08 — Keep the pilot host-allowlisted; implement public organiser registration before advertising self-service signup.

- [ ] REL-09 — Finish full device, 200% zoom and keyboard review. The localisation follow-up successfully tested real 320/390px viewport overrides for homepage, organiser/editor and planner layouts, plus 768px organiser layout. The earlier override failure is historical; a full phone journey, physical devices, zoom and full keyboard coverage remain open.

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

### 12 October 2026 — follow-up audit

- Added 13 open issues (four P1, nine P2) from the [current audit](./AUDIT-2026-10-12.md); no product-code fixes applied in this pass.
- Verified locally: friend → draft → host OTP → single-event publish → guest RSVP; capacity waitlist; host edits; three weekly series dates in portal; plus-one and cancellation; manual listing → discovery → editable friend draft; newsletter confirm/unsubscribe; support request → operations; dialog Escape/focus restoration and declined sync consent.
- Found stale post-publish handoff, missing later series dates in personal calendar, stale guest/count data, same-event invitation hash handling, remaining form contrast failures and the P2 gaps above.
- 30 unit tests, two isolated integration journeys and a fresh temporary production build pass.
- Live API health is green but discovery is empty. Live UI still lacks committed example/map/privacy improvements; REL-01 is not complete.
- Phone people layout visually inspected at 400×816. Complete phone interactions, narrower/tablet/zoom checks and independent-browser sync remain unverified in this pass.
- Production was read-only; all functional writes used isolated fictional test records. No real email sent, deployment, commit or push made.

### 12 October 2026 — follow-up fixes

GP-18–GP-30 are implemented and verified with the applicable local checks. This does not close production release verification.

- Friend outings use a shorter form with expandable invitation/series controls and a visible sticky Save action. Invalid collapsed fields expand before native validation focuses them.
- Publication projects every occurrence into the diary, preserves unrelated drafts and refreshes guest/count metadata. Manage opens the intended event; plan, hosted event and newsletter edition URLs survive refresh. Browser Back/Escape close plan detail cleanly.
- Per-invitation HttpOnly cookies and explicit server-validated invitation IDs keep guests separate in shared tabs. Same-event incoming links refresh identity. Replies refresh details and guest names; cancelled pages show response history without offering changes.
- Draft guests have stable IDs; case-equivalent names deduplicate, and friend renaming preserves draft associations/emails while published names remain historical.
- End dates work through creation, editing, discovery, publication, invitation text and calendar export. The diary includes each occupied day; Dublin DST/repeated-hour instants are covered by regressions.
- Form placeholders, optional labels and unselected plan types use accessible tokens: measured 5.95:1 on the cream surface. Current navigation and RSVP choices expose accessible state.
- Host loading/failure/empty are distinct. Unconfigured discovery makes no next-run promise, disables Collect, and opens manual entry; configured discovery exposes the latest recorded daily collection.
- 35 unit tests and three isolated backend integration journeys pass. Fresh production build passes (352.14 KB JS / 105.81 KB gzip; 111.53 KB CSS / 22.67 KB gzip). No production database write, real email, deployment, commit or push in this pass.
- [Visual evidence: simpler friend plan](./screenshots/friend-plan-fixes-2026-10-12.jpg). Mobile/tablet/zoom verification remains open in REL-09. Existing dist/index.html and .claude/ changes remain untouched.

### 12 October 2026 — compact design follow-up

- Default friend-planning panel reduced from 690×919 to 480×609 pixels in the tested desktop view. Expand switches to 720px; Shrink preserves entered values and selected friends. Panel widths remain constrained to the available viewport.
- Optional date/time, additional names, notes and invitation controls stay accessible through disclosures. Existing dates/notes open for editing. Saving a dated, friend-selected local draft works after expansion/shrinking.
- Backdrops use translucent cream without the old green/grey cast or blur. Dashboard headings, cohort spacing and settings panels are smaller.
- Home and workspace navigation links/buttons/icons share the same vertical centre; measured no desktop horizontal overflow. At narrower breakpoints, navigation links become one horizontally scrollable row.
- Production build and all 35 existing unit tests pass. No additional backend changes, deployment, commit or push in this pass. Phone/device verification remains open under REL-09.
- Visual evidence: [compact planner](./screenshots/compact-planner-2026-10-12.jpg) and [aligned home navigation](./screenshots/aligned-nav-2026-10-12.jpg).


### 12 October 2026 — compact navigation and Spanish localisation

- GP-32–34 are complete locally. Navigation action has no shadow, retains a 44px target and fits beside brand/language at 320px. Organiser actions have a 12px gap and stack on phones.
- Spanish covers the active homepage, personal dashboard, settings, plan/invitation screens, host sign-in, organiser/newsletter tools, discovery/subscription and privacy/support pages. Language is remembered locally, links can carry `lang=es`, HTML language/title/description and date/weekday formatting update. Personal names/notes and external event/editor content stay as entered; API values, cadence, timezone and calendar instants stay stable. Server-generated delivery emails retain their existing language.
- Browser: Spanish → English → Spanish within the same plan retains title and selected friend; saved fictional local draft `379facf1-610d-424c-b65c-dbea7e7fa8e4` is visible afterwards. No production writes or email sends.
- Browser: 320/390px homepage/editor/organiser/planner checks and 768px organiser have no page overflow in tested states. Fixed intrinsic-width overflow from newsletter date fields and homepage planner selects. Spanish support choices retain canonical `export`; cadence labels retain `Weekly`, `Once a month`, etc. Language remains Spanish after privacy/support page navigation.
- 38 unit checks pass, including language/history/hash/data preservation, localised dates/copied invitation and Spanish interest ordering. Production build passes (427.20KB JS / 131.32KB gzip; 119.89KB CSS / 24.10KB gzip). Browser reports no console errors.
- [Spanish homepage](./screenshots/spanish-home-2026-10-12.jpg), [Spanish organiser](./screenshots/spanish-organiser-2026-10-12.jpg). No commit, push or deployment in this follow-up. User-owned `dist/index.html` and `.claude/` remain untouched.

### 12 October 2026 — Brazilian Portuguese localisation

- GP-35 is complete locally. The native language menu includes Português (Brasil), with a compact PT-BR display and the full accessible name. All 919 English-source interface entries covered by Spanish also have Brazilian Portuguese translations. Dates, weekdays, document language/title/description, copied invitation text and generated planning copy follow `pt-BR`.
- Language is remembered locally and carried in app routes, including full-page privacy/support/home links when storage is unavailable. Names, notes, custom activities, venue names, source prices, stored enums and calendar timestamps stay as entered/canonical. Fixed display translation around free-text notes and venue names so words that also match UI copy remain personal content.
- Portuguese interests (chá, aquarela, cerâmica, jogos de tabuleiro, caminhada, jantar, retiros, exposição, museu, cinema) and quieter-place preferences order the same stable suggestion categories. Event discovery remains Dublin-focused; localisation does not convert currencies or move event timezones.
- Browser: Portuguese → English → Portuguese retains a fictional draft title and selected friend; saved locally as `5ea49839-09e8-416e-a627-8aad7834c2ff`. Reload and privacy → support navigation retain Portuguese. Support categories and newsletter category options retain canonical API values.
- Browser: 320px homepage/navigation, single-event editor and organiser action group, plus 390px newsletter and support forms have no page overflow in tested states. Organiser actions stack with a 12px gap. No production writes or mail sends; browser console has no errors in this check.
- 42 unit checks and production build pass (497.25KB JS / 155.95KB gzip; 120.75KB CSS / 24.24KB gzip). [Portuguese homepage](./screenshots/portuguese-home-2026-10-12.jpg). Server-generated email templates and authored newsletter/event content keep their existing language; translated email delivery is a separate follow-up.
- No commit, push or deployment in this follow-up. REL-01–09 remain open. User-owned `dist/index.html` and `.claude/` remain untouched.

### Launch city scope

The creator narrowed Brazil to São Paulo and Spain to Barcelona. Country selection now defaults to those cities, with a single Material city option; old broader discovery profiles display the launch city without rewriting saved events. Rio/Madrid starter entries are removed. Future collection and newsletters target these two cities only.


### Public launch scope — English and Dublin only

The creator has narrowed the visible release to English and Dublin. Language and country/city selectors are hidden. Existing saved plans retain their authored content, locations and timezones. Spanish, Brazilian Portuguese, São Paulo and Barcelona remain deferred; their dictionaries and catalogue work are kept for a later release. Regional source collectors and newsletters are not blockers for this Dublin release. English links and legacy translated URLs use the English interface; new planning defaults use Dublin, EUR and Europe/Dublin.


## Dublin curation — 16 October 2026

- [x] GP-45 — Add an organiser event manager with paste-link → editable draft → checked publication, manual fallback, public/admin filters, approved website sources, daily background collection, queue/history, source editing/pause, and re-review of changed automatic details. Dublin.ie works without a Ticketmaster key. See [usage and activation](./DUBLIN-EVENT-MANAGER.md). Verified locally with 60 tests, three Worker/D1 integration journeys and Chrome desktop/mobile checks.
- [ ] GP-46 — Expand reviewed Dublin source coverage: additional venue adapters or authorised feeds, RSS/iCalendar where dates are reliable, larger crawl budgets/pagination, and optional search-provider integration. Current collector scans configured public sources, not the whole web; no exhaustive event-coverage claim.
- [ ] REL-10 — Migration 0009 and the event manager/collector are deployed. Remaining: enable Dublin.ie on the production host portal, verify manual import/publication and approval privacy, inspect daily cron runs and check event-to-plan handoff. Production website sources have not been activated.

## Invitations and care support — 16 October 2026

- [x] GP-47 — Open shareable invitations alongside private personal guest links. Existing-event meet-ups have a separate booking URL and RSVP, no-account guest joining, private guest names by default, idempotency, capacity/waitlist and cancellation support. Verified with the local Mari dance-class test, 62 unit checks and four isolated Worker/D1 journeys. See [invitation guide](./INVITATION-MODES.md).
- [x] GP-48 — Separate children-welcome and childcare-support discovery fields, require an organiser confirmation page for explicit claims, public filters and source links, and retain support notes when making a plan. Keyword matching never confirms childcare. No children’s profiles collected.
- [ ] REL-11 — Migrations 0009–0011 and the matching frontend/Worker are deployed. Remaining: published open/private invitation and care-filter smoke tests on the production origin. The local test invitation remains local; the creator’s separate live draft is unpublished. Sign-in email request accepted; no guest invitations or bookings were sent.
- [ ] GP-49 — Add reviewed Dublin event sources that explicitly advertise childcare, crèche support, parent-and-baby sessions or children-welcome arrangements. Verify eligibility, age limits, charges and booking with the original organiser before applying support labels.

### Production account preparation — 16 October 2026

- Migrations 0009–0011 applied and deployment `2c70f0a8-cf1e-44d9-b1f9-ff3ef21dbd4a` completed. Production health/discovery/auth protection checked. REL-10/11 remain open for source activation and published invitation smoke checks.
- An account-owned, unpublished dance-class draft is ready for the creator’s next email-code sign-in. Guest names stay private, reminders are off, and no guest invitations were generated. Anonymous read/join checks return 404. Production email request accepted; inbox receipt and successful sign-in are not yet verified.
