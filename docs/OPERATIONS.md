# Good Plans operations

The creator manages the allowlisted beta. Before inviting guests, assign a person to check the organiser portal’s **Support & service status** daily and Cloudflare Workers errors/queue dead letters. Configure Cloudflare failure notifications for that person; the code does not create an external alert subscription.

## Activation

Set production secrets with `wrangler secret put NAME --config worker/wrangler.jsonc`: `RESEND_API_KEY`, `EMAIL_FROM` (verified domain sender), `RESEND_WEBHOOK_SECRET`, and optionally `TICKETMASTER_API_KEY`. Never commit secret values. Configure the Resend endpoint at `/api/webhooks/resend` for delivered, bounced, complained, suppressed and failed events. Signature verification is mandatory. Provider acceptance is displayed as sent; delivered indicates recipient-server acceptance, not that the person read the message.

Confirm the actual operator identity, public contact, purposes/legal bases, retention periods and processor transfer arrangements before finalising the privacy notice. The current notice describes the implementation but these operator-specific decisions remain release requirements.

## Support and data requests

The support form saves requests in D1, visible to authenticated hosts. It does not send an acknowledgement email. Check daily; verify ownership using the existing account/invitation contact before disclosing or deleting records. Never accept a form’s claimed identity alone. Export only the verified person’s records. For deletion, remove dependent email deliveries and host request cache before invitations/events/workspaces/user records; preserve other people’s records where necessary. Use a reviewed transaction and a backup, then verify affected rows. Full account erasure remains an operator-assisted process. Newsletter deletion is self-service using the private preferences token; hashed suppression entries remain to prevent unwanted email.

## Release and recovery

1. Run `npm ci`, `npm test`, `npm run build`, `npm run test:integration`, and a Wrangler deployment dry-run. CI runs these for pushes and PRs.
2. Save a private D1 export outside the repository before migrations. An export was saved locally at `/tmp/good-plans-prelaunch.backup.sql` on 9 September 2026; move it to approved encrypted backup storage before this machine cleans temporary files.
3. Apply additive migrations, then deploy built assets and Worker together. Verify both custom domains, login, RSVP, series, sync, webhook delivery, newsletter confirmation and unsubscribe with approved test mailboxes.
4. For a code regression, use Cloudflare’s deployment rollback to the preceding known-good version. Additive tables can remain. Do not drop production data as a rollback shortcut.
5. For data recovery, restore the private export to a separate D1 database, verify counts and critical records there, and review changes since the backup before switching bindings. A restore drill and retained backup policy are still required before broad release.

The scheduled handler records job status; the newsletter studio also shows collection errors. A completed scheduler invocation may contain a failed collection recorded in discovery runs. Configure external alerting and inspect both views. No automatic newsletter is sent until an organiser approves its draft.

## Known release limits

Hosting is allowlisted, newsletters are capped at 500 confirmed recipients, and the current batch sizes require a verified appropriate Workers plan. The sample circle and starter venues are illustrative, not independently verified live listings. `npm audit` currently reports a development-only Sharp/Miniflare/Wrangler advisory; do not downgrade Wrangler using a forced audit fix. Production dependencies should be checked separately with `npm audit --omit=dev`.
