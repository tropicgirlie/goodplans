# Good Plans backend

The Cloudflare Worker owns host authentication, account workspaces, recurring events, private invitations, RSVP capacity, waitlists and email delivery. D1 stores records; one Durable Object per event serializes guest responses.

## Local development

```sh
npm install
npm run db:local
npm run dev:api
# In another terminal:
npm run dev
```

Open http://127.0.0.1:3000. Vite proxies `/api` to the local Worker. Sign in as `tessa@example.com`; the development login screen displays the code. Development emails are written to D1 `local_mailbox`, never sent to real recipients. Production never returns a sign-in code. No frontend secret or development host header is needed.

## Verification

```sh
npm test
npm run test:integration
npm run build -- --outDir /tmp/good-plans-build
npx wrangler deploy --dry-run --config worker/wrangler.jsonc --assets /tmp/good-plans-build
```

Integration tests create a temporary D1 database, apply every migration and run an isolated Worker on port 8791. They do not use the planner's local database or send email.

## Production activation

The implementation has been tested locally, not deployed or verified with a real mailbox. Configure a verified Resend sender and secret securely:

```sh
npx wrangler secret put RESEND_API_KEY --config worker/wrangler.jsonc
npx wrangler secret put EMAIL_FROM --config worker/wrangler.jsonc
```

`EMAIL_FROM` should be a verified sender such as `Good Plans <hello@your-domain.example>`. Keep credentials out of frontend variables. Check `HOST_EMAILS` in the Worker configuration: only these addresses can organise events. Optional `PUBLIC_ORIGIN` chooses one canonical invitation origin; otherwise the current origin is used.

When releasing, apply migrations to the remote database before running the new Worker:

```sh
npx wrangler d1 migrations apply good-plans --remote --config worker/wrangler.jsonc
npm run build
npx wrangler deploy --config worker/wrangler.jsonc
```

Migration `0005_complete_hosting.sql` is additive and required. The Worker configuration includes the 15-minute notification schedule and API-first asset routing. Verify a real host sign-in, invitation received by a test guest, RSVP, event update/cancellation email, and account sync across two browsers before opening the site to users. Check provider delivery/bounce records as well as the portal: “sent” means provider acceptance, not inbox delivery.

Cloudflare Access is optional alongside OTP. If using it, configure `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` and an allowlist policy. Existing D1, R2, Durable Object and queue bindings are retained.

## Behaviour and limits

- Series create 1–12 independent occurrences, each with its own invitations. Monthly recurrence clamps month-end dates and preserves wall-clock time across daylight-saving changes. Nonexistent clock-change times are rejected.
- Host editing changes one occurrence; cancellation can include that occurrence and all later dates in the series.
- Invitations are emailed only from the explicit portal action. Guests with email addresses receive update/cancellation notices; optional reminders run within 24 hours of an event. Declined and waitlisted guests do not receive reminders.
- Failed email deliveries are visible, retried automatically up to five attempts, and can be retried from the portal. Stable delivery keys prevent duplicate provider requests. Fresh invitation links replace the previous token for that guest.
- Account workspaces store drafts, people, bookmarks and preferences with optimistic revisions. Local data remains usable offline. Conflicts offer an explicit account/device choice and preserve a local backup.
- Google Calendar and ICS are add-to-calendar helpers, not two-way calendar sync. Shared date voting is not implemented.
- The homepage affinity matrix and starter venue suggestions are illustrative. Public-source imports require an approved host, allowlisted URL and host review. Imported information must be confirmed before publishing.
- Artwork generation remains an optional backend integration; the host flow uses the existing collage assets. The artwork queue is not a connected image generator.

## Weekly Dublin discovery and newsletter

Migration `0006_dublin_newsletter.sql` adds the public event catalogue, confirmed subscribers, weekly editions, consent records and a separate newsletter delivery queue. Apply it locally with `npm run db:local`; remote migration and deployment are still required before release.

Add a Ticketmaster Discovery API credential securely:

```sh
npx wrangler secret put TICKETMASTER_API_KEY --config worker/wrangler.jsonc
```

Use Workers Paid for the combined collection and notification batches; the free per-invocation D1 query limit is too low for a full run. Audience inserts are grouped into JSON row batches.

The newsletter also uses `RESEND_API_KEY`, `EMAIL_FROM` and the canonical `PUBLIC_ORIGIN` in the Worker configuration. The existing 15-minute cron checks for a new Dublin calendar week. It collects Dublin events for the next 14 days once per week, then prepares one draft of up to eight varied picks. It does **not** approve or email an edition automatically. The organiser can collect again, add verified local events manually, edit the subject/introduction and event selection, and approve the saved preview in **Organiser portal → Weekly Dublin newsletter**.

- Collection uses the official Ticketmaster Discovery API; no general-purpose scraping. Its key and applicable provider access are needed. There is no synthetic public event feed. Manual listings allow smaller events from other sources.
- Up to 500 provider records are fetched per run. Undated, non-Dublin, cancelled/postponed/off-sale events are filtered. Provider records older than eight days and events whose start time passed are unavailable in discovery. Curated duplicates are collapsed by title, start time and venue.
- Each card and newsletter entry has a source link and an `/?discover=…` link that opens a reviewed planning draft. Adding a plan never reserves tickets. Unknown end times are explicitly labelled as a suggested planning window.
- Signup requires consent and a confirmation email. Pending subscribers receive no newsletters. Confirmation expires in 24 hours. Active subscribers can change interests or unsubscribe using their private email link; existing subscribers' preferences are not changed by an unauthenticated signup request.
- Interests choose which editions a subscriber receives: at least one selected event category must match. Empty interests means every edition. The first release caps the confirmed audience at 500; larger lists need paged audience preparation.
- Approval checks the saved revision and event freshness, captures the audience and queues one delivery per issue/subscriber transactionally. Repeated approval cannot resend an edition. Delivery processes 25 messages per run, checks subscription status again, and retries provider failures up to five attempts. Unsubscribe suppresses queued and failed messages; already in-flight messages may finish.
- Emails include plain text and escaped HTML versions, source attribution, and private preferences/unsubscribe links. Provider acceptance is not proof of inbox delivery. Failed newsletter sends can be retried in the studio. Never treat local mailbox delivery as a production email test.
- Weekly collection errors appear in the studio. If collection fails, use **Collect Dublin events** after fixing the credential/service, then **Prepare this week's draft**. Existing drafts retain the host's selections; **Save preview** refreshes selected event details before approval.

Tests cover normalization, category selection, deduplication, unsafe links, Dublin week boundaries, consent, confirmation, interests, stale previews, approval idempotence, unsubscribe and the original organiser journey. Before enabling subscriptions in production, verify a real confirmation email and approved test issue, its plan link and unsubscribe action in a separate browser. Live API credentials, email delivery and production configuration have not been verified locally.
