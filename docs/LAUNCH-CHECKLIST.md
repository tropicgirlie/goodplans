# Launch checklist — reviewed 9 September 2026

## Verdict

Not ready for public launch. The core implementation has passed local testing; a limited, organiser-led beta is the next release target after production activation and verification.

## Verified release blockers

- [x] Newsletter, discovery, circle refinement and launch operations are included in this release commit. Unrelated `dist/index.html` and `.claude/` changes are excluded.
- [x] Backed up production D1 and applied remote migrations **0003–0007** successfully on 9 September 2026.
- [ ] Configure a verified email sender, `RESEND_API_KEY` and `EMAIL_FROM`. Read-only `wrangler secret list` returned no secrets.
- [ ] Configure `TICKETMASTER_API_KEY` if launching live Dublin discovery. Manual curated picks are an alternative for a smaller beta.
- [ ] Verify the production Worker plan supports the collection/notification batch sizes, then build and deploy the new code.
- [ ] Run the real-domain, real-mailbox smoke test: host sign-in → single event and series → invite → guest RSVP/plus-one/waitlist → edit/cancel notice; account sync in a second browser; newsletter confirm → approved test edition → add-to-plan → unsubscribe. Local mailbox tests do not establish real delivery.

## Additional product/operations backlog before broad release

- [x] Added privacy/data-use and support pages, including a persisted support inbox in the organiser portal.
- [ ] Confirm the operator’s identity/contact, legal bases, retention periods and processor arrangements to finalise the privacy notice.
- [x] Added self-service newsletter deletion and a verified, operator-assisted account/guest export and deletion request process. Full account erasure is not automated.
- [x] Implemented signed Resend callbacks, replay deduplication, bounce/complaint suppression and organiser-visible delivery outcomes.
- [ ] Register the production webhook and verify real delivery callbacks.
- [x] Added scheduled-job status, Workers observability, CI checks and an operations/rollback runbook.
- [ ] Assign a support/operations owner, configure external failure alerts and complete a restore drill with retained encrypted backups.
- [x] Keep a creator-led beta scope: current host sign-in is email-allowlisted. This supports the creator hosting for friends; it does not provide public self-service organiser signup.

## Useful follow-ups, not blockers for a creator-led beta

- Connect the example circle to saved real people. It is currently explicitly a sample demonstration; saved people and notes work separately.
- Shared date voting.
- Edit multiple future occurrences together; current editing is per occurrence and cancellation can cover the remaining series.
- Two-way calendar sync; existing Google Calendar links and ICS exports work as add-to-calendar helpers.
- More local event sources, beyond Ticketmaster and manually added picks.
- Audiences above 500 confirmed newsletter subscribers.
- Generated custom artwork.

## Existing evidence

21 unit tests and two isolated Worker/D1 integration journeys passed during newsletter implementation. Production build and Worker dry-run packaging passed. The later circle redesign passed a production build and desktop/mobile interaction checks. These checks are local and are not a full security, deliverability or load audit.

Newsletter collection prepares a weekly draft. A host must approve each edition before email delivery; unattended sending is intentionally not enabled.

## Latest validation

21 unit tests and both expanded isolated D1 integration journeys pass, including signed/invalid/replayed webhooks, suppressed recipients, support access control and newsletter deletion. Production dependency audit reports zero vulnerabilities. Three development-only audit findings remain in the Sharp/Miniflare/Wrangler dependency chain. Production activation and mailbox smoke tests remain blocked on credentials; no new application deployment has been made. See OPERATIONS.md.
