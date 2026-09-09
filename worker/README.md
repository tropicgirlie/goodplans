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
