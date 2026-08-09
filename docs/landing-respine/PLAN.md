# Landing respine — Codex lane plan

Source of truth for scope: `~/.gstack/projects/Sendlyr-Resource/stephendang-unknown-design-20260809-landing-validation-spine.md` (APPROVED 2026-08-09).
Branch: `landing/validation-spine`, based on `origin/main` (`c58c46f`).
Ship deadline: **Monday 17 August 2026.** Braze Sydney Tue 18 Aug. 77 Partners closes Thu 20 Aug.

## Three repo facts that shaped this decomposition

1. **The analytics system is built and tested; it is switched off in production.** The earlier
   read that "there is no analytics" was true of production only. `lib/event-handler.js` has a
   full allowlist of event names, paths, destinations, and per-event property schemas;
   `public/scripts/site.js` emits to `/api/events`; `tests/e2e/site.spec.js:220-256` covers both
   the disabled and enabled paths. `lib/event-handler.js:97` gates on `ANALYTICS_ENABLED`.
   Lane A is therefore an extension job, not a build job.

2. **The e2e suite is welded to the copy being deleted.** 19 tests in one 309-line file; roughly
   16 assert on homepage structure that this work removes — the Revenue Leak Map tablist, the
   continuous decision layer flow, the SendGrid mark, the connector-boundary sentence, the
   decision package artifact, the "Find the customer-journey leak worth fixing first" heading,
   and "Find your first revenue leak" in three placements. Splitting the file per lane is
   busywork because one lane owns 85% of it. **Lane B owns `tests/e2e/site.spec.js` outright.**
   No other lane may touch it.

3. **Every lane runs `npm run build`, which regenerates all of `public/**`.** Lane B owns the
   shared partials, so its build touches every generated page. To avoid four lanes fighting over
   generated output: **no lane commits regenerated `public/**/index.html`.** Lanes edit `src/`,
   run `npm run build` locally to verify, then `git checkout -- public/` before reporting. One
   build is run at merge time and committed once.

## Event contract (authored here so all lanes can work in parallel)

Lane A implements the server side, Lane B emits the client side. Neither waits on the other.

**`allowedEvents` — ADD ONLY, never remove.** Removing a name would require re-adding a narrower
Postgres check constraint against a table with existing rows, which fails unless `NOT VALID`.
Keep all eight current names. Add:
- `pilot_form_start` — properties: `{ placement }`
- `pilot_form_submit` — properties: `{ attribution_id, budget_authority }`

**`budget_authority` is REQUIRED and must be one of `yes` | `no` | `unsure`.** With no price on
the page, this field carries the entire purchase-intent signal. A submission without it is a
lead, not evidence. Validation rejects the submission if absent.

**`attribution_id`** reuses the existing `^[a-zA-Z0-9-]{1,80}$` pattern already validated for
`book_sprint_click`. Tagged entry links:
- Braze City x City Sydney, 18 Aug → `?ref=braze-syd-2026`
- 77 Partners application, 19-20 Aug → `?ref=77p-2026`

**`allowedDestinations`** — remove `/#decision-layer` (the anchor is being deleted). JS-only, no
migration implication.

**`allowedPaths`** — unchanged. `/for/fitness-apps` and `/for/cooking-apps` leave the nav but the
pages stay reachable, so their paths stay allowlisted.

**SQL migration** (`supabase-analytics.sql`): the file currently drops and re-adds
`analytics_event_name_check`. Extend the name list with the two new events. If the live
`analytics_events` table has rows, use `NOT VALID` then `VALIDATE CONSTRAINT` in a controlled
window rather than a bare re-add.

## Lanes

All four start in parallel. File ownership is disjoint.

### Lane A — backend: analytics extension + qualification form handling
**Owns:** `lib/event-handler.js`, `lib/lead-handler.js`, `api/events.js`, `api/leads.js`,
`supabase-analytics.sql`, `scripts/check-production.js`, `tests/unit/handlers.test.js`
**Must not touch:** anything under `src/`, `public/scripts/`, `tests/e2e/`
**Job:** implement the event contract above; extend the lead handler to accept and validate the
qualification fields (cohort size, lifecycle stack, target outcome, timeline, budget authority —
last one required); extend `check-production.js` to insert, verify, and remove a
`pilot_form_submit` event.

### Lane B — frontend: homepage respine and its tests
**Owns:** `src/pages/index.html`, `src/partials/site-header.html`, `src/partials/site-footer.html`,
`public/scripts/app.js`, `public/scripts/site.js`, homepage CSS, `tests/e2e/site.spec.js`
**Must not touch:** `lib/`, `api/`, other `src/pages/**`
**Job — kill:** the continuous decision layer section, diagram, feedback loop, and the
`Decision layer` nav item in header and footer; the Revenue Leak Map section and its tablist; the
decision package section; the SendGrid mark and every message-authoring output; every "revenue
leak" string including the three CTA placements and page title; `Fitness` and `Cooking` from both
navs.
**Job — build:** the validation hero, the 500-user / no-CDP-no-CPaaS qualifier, the three-part
deliverable, a "what you leave with" block ending at the readout, the "We moved the behavior.
Conversion did not move." results section, the founder-evidence block, and the unpriced Signal
Validation Pilot section with its qualification form. Then rewrite the e2e spec against the new
page, including the two analytics tests, per the event contract.

### Lane C — content: proof correction
**Owns:** `src/pages/blog/pai-discovery-case-study/index.html`, `src/pages/blog/index.html`,
`src/pages/for/edtech-apps/index.html`, `src/og/og-default.html`, `public/llms.txt`
**Job:** replace the 178-user cut (121/57, 69.4% vs 57.9%, "19.9% relative / 11.5pp") with the
2026-08-04 Supabase pull, and publish the two omitted facts. Exact figures and the reporting
constraints are in the approved design doc under "Correct". Typesy and eReflect may be named —
naming is approved, do not anonymise anything.

### Lane D — content: secondary pages
**Owns:** `src/pages/how-it-works/index.html`, `src/pages/for/fitness-apps/index.html`,
`src/pages/for/cooking-apps/index.html`
**Job:** remove the "Activation Signal Sprint" name and replace with the Signal Validation Pilot;
purge "revenue leak" copy; align the how-it-works spine to validation rather than discovery.

## Merge order

Parallel start → merge **A → B → C → D** → one `npm run build` committed once → full `npm test`
→ deploy. B merges before C and D because it owns the shared partials, so C and D rebase onto a
tree whose header and footer are already final.

Security review runs on the merged result, not per-lane, and has one specific target: the form
is the only new user-input surface, so check the `budget_authority` allowlist, the
`attribution_id` regex, rate limiting in `withinRateLimit`, and that no Supabase service-role key
reaches the browser.

## Acceptance, every lane

Report back with: files changed, the commands run, and evidence. `npm run build` then
`git checkout -- public/` before reporting. `npm run check:generated` must pass. Lane A also runs
`npm run test:unit`. Lane B also runs `npm run test:e2e`. "Should work" is not done.

## Known open item

`PROGRESS.md` in `~/Sendlyr-Resource` still says "sell five Activation Signal Sprints" from the
evening of 2026-08-08, contradicting the same day's kill and the 08-09 no-price decision. Not in
scope for these lanes; flagged so it gets corrected before the 77 Partners application quotes it.
