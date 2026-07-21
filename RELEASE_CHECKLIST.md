# Release checklist

Deployment is intentionally blocked until every unchecked release gate is resolved and Stephen gives explicit merge/deploy approval.

## Wedge-first homepage gates

- [x] Replace the homepage customer-logo trust band with the evidence-contract fallback.
- [x] Keep one interactive tab system: Activation, Conversion, and Retention in the hero.
- [x] Remove Behavioral Journey Simulation and the separate delivery switcher from the homepage.
- [x] Keep human approval, existing-stack delivery, a measurable outcome, and the return loop visible.
- [x] Use the same activation scenario in the decision loop and decision package.
- [x] Add the homepage-specific 1200×630 Open Graph asset without a customer logo or metric.
- [x] Pass the deterministic build, 27 unit checks, performance budgets, and 54 desktop/mobile browser checks.
- [x] Align public booking actions on the shared wedge-first CTA without changing the Calendly destination.
- [x] Restore the Vercel function configuration to the production `main` contract.
- [x] Reconcile `DESIGN.md` with the Revenue Leak Map, continuous decision layer, and Typesy supporting-proof role.
- [x] Five-person comprehension test intentionally waived by Stephen on 2026-07-20; the release accepts the messaging-interpretation risk.
- [x] Revenue-leak copy replacement threshold waived with the comprehension-test gate on 2026-07-20.
- [x] PostgreSQL, SQL Server, PostHog, Braze, and Customer.io mark usage confirmed reviewed by Stephen on 2026-07-20.
- [x] Explicit merge/deploy approval received from Stephen on 2026-07-20. Merging to `main` deploys production.

## Public claim register

| Surface | Exact public claim | Source | As-of date | Visible evidence boundary | Owner | Permission |
| --- | --- | --- | --- | --- | --- | --- |
| Homepage | Evidence contract: scoped data, reviewed definitions, controlled change, and declared measure | Approved wedge-first design brief | 2026-07-20 | No customer result is claimed | Stephen | Not required |
| `/for/edtech-apps` | `Typesy VIP measured first-course completion within four days` plus 69.4% treatment, 57.9% control, and +19.9% relative lift | Typesy VIP experiment outcome supplied for publication | 2026-07-10 | Links to the method notes and claim limits | Stephen | Confirmed for publication by Stephen on 2026-07-20 |
| `/blog` | `Typesy VIP: an observed leading-indicator lift` | Typesy VIP experiment outcome supplied for publication | 2026-07-10 | Card links to the full case-study boundary | Stephen | Confirmed for publication by Stephen on 2026-07-20 |
| `/blog/pai-discovery-case-study` | Named 178-user result and observed 19.9% relative difference | Typesy VIP experiment outcome supplied for publication | 2026-07-10 | Page states the descriptive result and that significance is not established | Stephen | Confirmed for publication by Stephen on 2026-07-20 |
| Shared Open Graph asset | Named Typesy result and metrics in `og-default` | Typesy VIP experiment outcome supplied for publication | 2026-07-10 | Asset states `Descriptive result · significance not established` | Stephen | Confirmed for publication by Stephen on 2026-07-20 |

Stephen directed the release branch to retain the full Typesy details and confirmed publication permission on 2026-07-20. The homepage still avoids the claim.

## Platform-mark boundary

The homepage visibly states: `Example systems shown for context. Connector scope is configured with each team; platform marks do not imply vendor endorsement.`

SendGrid remains text-only. The diagram must remain understandable if every third-party image mark is replaced with text.

## Cross-route consistency audit

| Route | Current phrase | Assessment | Proposed correction | Owner | Target |
| --- | --- | --- | --- | --- | --- |
| `/how-it-works` | `Activation Signal Sprint` plus `Find your first revenue leak` | Resolved: the route identifies the Sprint as Sendlyr’s first focused engagement | None | Stephen | Complete |
| `/for/fitness-apps` | `Find your first revenue leak` | Resolved | None | Stephen | Complete |
| `/for/cooking-apps` | `Find your first revenue leak` | Resolved | None | Stephen | Complete |
| `/for/edtech-apps` | `Find your first revenue leak` plus the named Typesy proof | CTA resolved; Typesy details retained with confirmed publication permission | None | Stephen | Complete |
| `/blog` and case study | Named Typesy proof | Retained with confirmed publication permission | None | Stephen | Complete |
