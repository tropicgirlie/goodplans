# Good Plans Cloudflare backend

This Worker owns event records, private invite access, canonical RSVPs, waitlists, source imports, artwork jobs and calendar downloads. The browser never talks directly to D1.

## Local setup

1. Copy `.dev.vars.example` to `.dev.vars` and set a long local `DEV_HOST_KEY`.
2. Create a local D1 database and apply migrations:

   ```sh
   npx wrangler d1 migrations apply good-plans --local --config worker/wrangler.jsonc
   ```

3. Run the API with `npm run dev:api`.
4. Set `VITE_GOOD_PLANS_API_URL=http://127.0.0.1:8787` and `VITE_GOOD_PLANS_DEV_HOST_KEY` in a local frontend environment file, then run `npm run dev`.

## Production bindings

This project is already connected to these Cloudflare resources:

- D1 database: `good-plans`
- R2 bucket: `good-plans-artwork`
- Queues: `good-plans-imports`, `good-plans-imports-dlq`, `good-plans-artwork-jobs`, `good-plans-artwork-dlq`, `good-plans-notifications`, `good-plans-notifications-dlq`

Add the following Worker secrets before the first production deployment. Do not put any secret in Vite environment variables.

```sh
npx wrangler secret put CF_ACCESS_TEAM_DOMAIN --config worker/wrangler.jsonc
npx wrangler secret put CF_ACCESS_AUD --config worker/wrangler.jsonc
npx wrangler secret put GOOGLE_PLACES_API_KEY --config worker/wrangler.jsonc
```

Protect `/api/host/*` with a Cloudflare Access policy that permits the Good Plans organiser account. In production the Worker verifies the `Cf-Access-Jwt-Assertion` signature against the team JWKS and checks both the configured audience and permitted host email list. The local development host header works only when `ENVIRONMENT=development` and matches `DEV_HOST_KEY`.

After Access is configured, build and deploy:

```sh
npm run build
npx wrangler deploy --config worker/wrangler.jsonc
```

## Production boundaries

- Good Plans owns RSVP status. Google Calendar is only an add-to-calendar helper until a separately built host sync adapter is connected.
- Public links import only from hosts listed in `IMPORT_ALLOWED_HOSTS`. The worker checks redirects again before fetching.
- Artwork queues move jobs to `ready_for_approval`. Connect an approved raster image generator behind the artwork consumer. Do not substitute generated SVG art.
