# Release checklist

Deployment is intentionally blocked until every unchecked release gate is resolved and Stephen gives explicit merge/deploy approval.

## Wedge-first homepage gates

- [x] Replace the homepage customer-logo trust band with the evidence-contract fallback.
- [x] Keep one interactive tab system: Activation, Conversion, and Retention in the hero.
- [x] Remove Behavioral Journey Simulation and the separate delivery switcher from the homepage.
- [x] Keep human approval, existing-stack delivery, a measurable outcome, and the return loop visible.
- [x] Use the same activation scenario in the decision loop and decision package.
- [x] Add the homepage-specific 1200×630 Open Graph asset without a customer logo or metric.
- [x] Pass the deterministic build, 27 unit checks, performance budgets, and 48 desktop/mobile browser checks.
- [ ] Show the page to five qualified Product, Growth, or Lifecycle leaders for 15 seconds and record their exact understanding and first hesitation.
- [ ] Replace the complete `revenue leak` copy package if at least three participants interpret it as finance, billing, or generic consulting.
- [ ] Review PostgreSQL, SQL Server, PostHog, Braze, and Customer.io mark usage against each vendor's current trademark guidelines. Replace any uncleared image mark with text.
- [ ] Obtain explicit merge/deploy approval after every release gate passes. Merging to `main` deploys production.

## Public claim register

| Surface | Exact public claim | Source | As-of date | Visible evidence boundary | Owner | Permission |
| --- | --- | --- | --- | --- | --- | --- |
| Homepage | Evidence contract: scoped data, reviewed definitions, controlled change, and declared measure | Approved wedge-first design brief | 2026-07-20 | No customer result is claimed | Stephen | Not required |
| `/for/edtech-apps` | `Typesy VIP measured first-course completion within four days` plus 69.4% treatment, 57.9% control, and +19.9% relative lift | Typesy VIP experiment outcome supplied for publication | 2026-07-10 | Links to the method notes and claim limits | Stephen | **Written status not recorded — release blocker** |
| `/blog` | `Typesy VIP: an observed leading-indicator lift` | Typesy VIP experiment outcome supplied for publication | 2026-07-10 | Card links to the full case-study boundary | Stephen | **Written status not recorded — release blocker** |
| `/blog/pai-discovery-case-study` | Named 178-user result and observed 19.9% relative difference | Typesy VIP experiment outcome supplied for publication | 2026-07-10 | Page states the descriptive result and that significance is not established | Stephen | **Written status not recorded — release blocker** |
| Shared Open Graph asset | Named Typesy result and metrics in `og-default` | Typesy VIP experiment outcome supplied for publication | 2026-07-10 | Asset states `Descriptive result · significance not established` | Stephen | **Written status not recorded — release blocker** |

If written publication permission cannot be produced, remove or anonymize every blocked Typesy surface before deployment. The homepage already avoids the claim.

## Platform-mark boundary

The homepage visibly states: `Example systems shown for context. Connector scope is configured with each team; platform marks do not imply vendor endorsement.`

SendGrid remains text-only. The diagram must remain understandable if every third-party image mark is replaced with text.

## Cross-route consistency audit

| Route | Current phrase | Assessment | Proposed correction | Owner | Target |
| --- | --- | --- | --- | --- | --- |
| `/how-it-works` | `Activation Signal Sprint` | Acceptable as the fulfillment format for the first revenue-leak engagement | Clarify the relationship on the route when its body copy is next revised | Stephen | Before production or record as accepted |
| `/for/fitness-apps` | `Book an Activation Signal Sprint` | CTA wording differs from the shared wedge-first action | Change to `Find your first revenue leak` without changing the Calendly destination | Stephen | Before production |
| `/for/cooking-apps` | `Book an Activation Signal Sprint` | CTA wording differs from the shared wedge-first action | Change to `Find your first revenue leak` without changing the Calendly destination | Stephen | Before production |
| `/for/edtech-apps` | `Book an Activation Signal Sprint` | CTA wording differs and the route contains blocked named proof | Align the CTA and resolve the Typesy permission gate | Stephen | Before production |
| `/blog` and case study | Named Typesy proof | Commercial proof is useful but publication permission is not recorded | Preserve only after written permission is attached to this register | Stephen | Before production |
