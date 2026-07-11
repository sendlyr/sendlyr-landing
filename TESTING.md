# Testing

## Fast checks

```sh
npm run build
npm run check:generated
npm run test:unit
npm run check:performance
```

Unit tests cover the deterministic renderer, lead and event validation, booking attribution, and funnel calculations.
The coverage gate includes analytics, attribution, event ingestion, server storage, and retention safety logic.

## Browser checks

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright checks all eight routes on desktop and mobile. It covers metadata, overflow, image alternatives, interactions, analytics defaults, internal routes, and no-JavaScript evidence.

## Production smoke

```sh
PRODUCTION_URL=https://sendlyr.com PRODUCTION_WAF_VERIFIED=true npm run check:production
```

Run the smoke test after deployment and before enabling analytics. It requires server credentials, verifies storage, then removes its event.
