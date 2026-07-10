# Sendlyr landing site

A dependency-light, statically rendered marketing site for the Activation Signal Sprint.

## Architecture

- `src/pages/` contains canonical page HTML.
- `src/partials/` contains the shared header and footer.
- `scripts/build-site.js` pre-renders pages and hashes browser assets.
- `public/` contains generated HTML, source assets, and generated `build/` files.
- `server.js` serves the site and local API routes.
- `api/` contains Vercel functions for leads and pseudonymous events.
- `lib/` contains validation, storage, attribution, and reporting logic.
- `DESIGN.md` is the canonical design system and content contract.

Edit source pages, partials, CSS, or JavaScript. Then run the build. Do not hand-edit generated HTML.

## Local development

Use Node 24, matching `.nvmrc` and Vercel.

```sh
npm install
cp .env.example .env
npm run dev
```

Open `http://127.0.0.1:4173`.

Analytics stays disabled with the default environment. Lead submissions use `data/leads.jsonl` without Supabase credentials.

## Build and verification

```sh
npm run build
npm run check:generated
npm run test:unit
npm run test:e2e
npm test
```

The build is deterministic. It creates content-hashed assets under `public/build/` and renders every route from `src/pages/`.

## Data setup

Run `supabase.sql` for leads. Run `supabase-analytics.sql` for event, booking, and aggregate tables.

Only secret or service-role keys belong in server environments. Never place them in public JavaScript.

Analytics remains off until these production gates pass:

1. Privacy wording receives approval.
2. Supabase tables and retention jobs are verified.
3. Origin rules and platform rate limits are configured.
4. A hosted smoke test confirms event ingestion.

Set `ANALYTICS_ENABLED=true` only after those gates pass. Rebuild after changing it.

## Booking attribution

When analytics is enabled, each Sprint link receives a fresh random `utm_term` attribution value.

```sh
npm run analytics:sync-bookings
npm run analytics:list-bookings
npm run analytics:mark-qualified -- <invitee-id> true
npm run analytics:report
npm run analytics:aggregate -- --from=2026-07-01 --to=2026-07-02
npm run analytics:anonymize
npm run analytics:prune
```

Only opaque Calendly resource IDs are stored. Raw attribution events should be anonymized after 30 days and pruned after 90 days.

Retention commands are dry runs by default. Add `--apply`; production writes also require `--confirm-production`.

## Deployment

Vercel runs `npm run build`, serves `public/`, and uses Node 24 for `api/*.js`.

Configure server-only environment variables from `.env.example`. Verify production with:

```sh
PRODUCTION_URL=https://sendlyr.com PRODUCTION_WAF_VERIFIED=true npm run check:production
```

The repository cannot configure external WAF rules or approve privacy wording. Those remain explicit release gates.
