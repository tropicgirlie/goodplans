# Dublin event manager

Implemented and verified locally on 16 October 2026. The matching Worker/frontend and migrations 0009–0011 were deployed on 16 October 2026. Production sources still need to be chosen and checked.

## Add something you found

Sign in as an approved host and open **My events → Manage Dublin events & email**.

1. Paste an event URL into **Event link**, then choose **Read event link**.
2. Check the editable title, Dublin venue, category, price and start/end times. Missing details stay blank. Form times are **Europe/Dublin**, regardless of the computer’s timezone.
3. Confirm the source details and choose **Publish to Dublin picks**. This showcases the event; it does not sell tickets or book a place.
4. If a website cannot be read, use **Enter details myself**. Manual booking links can point to any public HTTPS website; the importer only fetches connected domains.

Reading a link does not publish it. Automatic candidates can also be edited through this form. Visible picks can be edited or removed.

## Find events automatically

1. Open **Manage automatic sources** and choose **Add Dublin.ie programme**, or add a connected public programme/JSON-LD feed.
2. Optionally enter comma-separated keywords, such as `watercolour, dance, women, retreat, Christmas`. At least one keyword must match. Leave blank for broader coverage.
3. Choose **Find Dublin events** for an immediate background check. The existing Worker cron also checks active sources once per Dublin calendar day.
4. Inspect the queue and **Approve**, **Edit details**, or **Skip** each event. Collection never publishes an event automatically.
5. Edit source keywords or pause/resume sources. Source cards show the last check, matches and errors. Collection history distinguishes complete, partial and failed checks.

Ticketmaster is optional. Its existing themed Dublin searches run alongside websites when its key is present. The Dublin.ie connector needs no API key. This checks chosen sources, rather than searching the entire web exhaustively.

## Filters and email

Public discovery and the review queue support search, category, focus, Dublin date range and free-only filters. The organiser can also filter manual, website and Ticketmaster listings. Unknown prices are not classified as free. Focus labels are suggestions to review, not assumptions about a person’s identity.

The public showcase covers 14 days; organiser picks and collection cover 90 days. Newsletter sending remains separate, with confirmed subscribers and explicit edition approval.

## Implementation

- Migration `worker/migrations/0009_discovery_sources.sql` adds sources and a collector reference.
- `POST /api/host/newsletter/import-link` returns a private editable draft.
- `POST /api/host/newsletter/sources` creates/edits sources or pauses/resumes them.
- `POST /api/host/newsletter/collect` returns HTTP 202 and uses the existing import queue. Local preview falls back to `ctx.waitUntil`.
- Approved-host authentication protects import, sources, collection, editing and review. Public event details now require approval as well as active status.
- The collector supports Event JSON-LD, subclasses, graphs, lists and JSON-LD feeds. A dedicated Dublin.ie adapter combines the programme’s machine-readable day with the detail page’s visible performance time. Standalone yearless dates and ambiguous ranges require manual completion.
- HTTPS domain allowlisting, checked redirects, timeouts and streamed response-size limits bound fetching. Automatic collection checks robots rules and stays on the configured origin. It does not bypass login, CAPTCHA, bot restrictions or non-zero crawl delays.
- Maximum five website sources, a programme and three linked pages per source/check, and 50 usable candidates per source. This is a bounded shortlist, not complete website indexing.
- Stable provider identifiers or event URLs prevent repeated imports. Rejected and hidden events stay suppressed. Material changes to approved automatic details return the event to review. Explicit cancellation/sold-out metadata makes it unavailable. Unrefreshed automatic picks expire from discovery after eight days; all past starts are excluded.
- One failed source does not discard other successes. Daily runs are idempotent; overlapping manual checks are rejected; abandoned jobs become retryable failures.

`DISCOVERY_ALLOWED_HOSTS` optionally replaces the default domain list: `dublin.ie,visitdublin.com,eventbrite.ie,eventbrite.com,tickettailor.com,ticket-tailor.com`. Connected domains must expose public information and permit this use. Some pages lack readable dates and need manual completion or another connector.

Optional secret: `TICKETMASTER_API_KEY`. Resend settings are needed only for real mail delivery, not collection. No paid search or AI service is required for the implemented website collector.

## Production activation — not performed yet

1. Build deployment assets using the normal release workflow; preserve unrelated local build changes.
2. Apply migration `0009` to production D1.
3. Deploy Worker and frontend, preserving secrets, routes, import queue and cron.
4. Sign in on the real domain, enable Dublin.ie, run a check and inspect queue/history. Approve only checked listings.
5. Verify public filters, event-to-plan handoff, the daily cron and existing email approval behaviour on the real domain.

## Verification

60 tests pass, including SQLite-backed importer/collector tests for source restrictions, streamed limits, Dublin summer time, missing dates, duplicates, partial failures, daily idempotence, candidate privacy and re-review after date/price changes. Three isolated Worker/D1 integration journeys pass, including host protection and source editing. Build and whitespace checks pass.

Chrome local verification: real Dublin.ie link → private draft; one explicitly fictional local listing → publication; two real upcoming Dublin.ie events → private review queue without Ticketmaster; public search/free filter → event-to-plan handoff. Manager, showcase and editor checked at 390px without horizontal overflow. No production writes or real emails.

## References

- [Dublin.ie programme](https://dublin.ie/whats-on/), checked during implementation.
- [Schema.org Event](https://schema.org/Event).
- [Ticketmaster Discovery API](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/).
- [Cloudflare Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/).

## Time with friends when you have children

The listing editor has an optional **Children & childcare** disclosure. **Children welcome** and **Childcare support** are separate fields, unknown by default. An explicit yes/no claim requires the organiser’s HTTPS confirmation page. Public filters distinguish children welcome from childcare listed by the organiser. Cards link to the source and ask visitors to check ages, availability, cost and booking; support is never inferred from “family”, “mother” or “caregiver” keywords. Source changes clear previous care confirmations for re-review. Confirmed details travel into a saved plan’s notes; the app does not collect children’s names or needs. No childcare is claimed for Mari’s class.

Apply migration **0011_event_care.sql** with the other pending migrations before deployment.
