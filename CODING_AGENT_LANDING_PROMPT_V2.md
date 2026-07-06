# Coding Agent Prompt v2: Tighten Sendlyr Landing Positioning

This is a focused iteration on top of the already-shipped repositioning (the
"activation decision layer / PAI" version now in `public/index.html`). Do NOT
rewrite the page. Make targeted edits only. The current positioning is correct
and the structure is good; this pass fixes friction in the ask and the headline.

Paste the block below into a coding agent running in the `sendlyr-landing` repo.

```text
You are working in /Users/stephendang/Sendlyr/sendlyr-landing.

Context:
The homepage was recently repositioned as the "activation decision layer / PAI
discovery" angle. That positioning is correct and must be preserved. This task is
a surgical iteration, not a redesign. Most of the page is good. You are fixing two
specific friction points and three smaller watch-outs that came out of a review.

Read first:
- AGENTS.md
- public/index.html
- public/styles.css
- public/scripts/landing.js
- LANDING_POSITIONING_IMPROVEMENT.md  (positioning rationale — do not contradict it)

Hard constraints (unchanged):
- Static, dependency-light. No React/Vite/Next/Tailwind/TypeScript/build step.
- Work only in public/index.html, public/styles.css, and public/scripts/landing.js.
- Do not touch .env*, secrets, api/, lib/, server.js, or Supabase logic.
- Preserve the current premium, data-forward, technical visual direction.
- Semantic HTML, minimal JS.
- Do NOT undo the existing wins: keep the two-user Problem section, the objection
  ("Analytics and lifecycle can do this. It just takes too long.") section, the
  Trust/security section, and the careful proof framing that says the Typesy
  numbers are activation-signal validation, NOT proven campaign lift. Do not
  reintroduce "retention engine", "behavioral email", or any claim that Sendlyr
  has already lifted retention/conversion.

CHANGE 1 — Decouple the CTA from internal jargon (highest priority).
Problem: the primary asks ("Book PAI sprint" in nav, "Book a PAI discovery sprint"
in hero/CTA) make the visitor adopt our coined term "PAI" before they understand
the value. Lead with the outcome; keep PAI as the named method underneath.
- Nav button: change "Book PAI sprint" to "Book a discovery sprint".
- Hero primary button: change "Book a PAI discovery sprint" to "Book a discovery
  sprint", and add a small support line directly under the CTA row reading:
  "We find your activation behavior (your PAI), then build the experiment around it."
  (Reuse the existing .hero-cta-meta style or add a sibling line; do not add a heavy
  new component.)
- Final CTA section button (#demo): same change to "Book a discovery sprint".
  Keep the section eyebrow "◆ PAI discovery sprint" — that's fine as a label once
  the visitor has read the page; the fix is only on the buttons.
- Keep the Calendly href and behavior unchanged.

CHANGE 2 — Make the hero assert value, not assume a confession.
Problem: "Stop guessing what onboarding should drive." only lands if the visitor
already believes they're guessing. Some won't. Keep that H1 (it is good and on-brand),
but ensure the value is asserted immediately around it so a skeptical reader gets the
benefit fast:
- Keep H1: "Stop guessing what onboarding should drive."
- Directly below the H1, BEFORE the existing subhead, add one short, bold value line:
  "Find the early behavior that predicts paid conversion, then build the journey
  around it." Style it as a lead-in (slightly larger/heavier than the subhead, lighter
  than H1). The existing longer subhead stays as the third line.
- Also leave an HTML comment next to the H1 with an alternate the user can swap in for
  testing: <!-- ALT H1 (assertive): "Find the activation behavior that predicts paid
  conversion. Then build the journey around it." -->

CHANGE 3 — Soften pure-jargon labels where they carry no plain meaning.
The phrase "activation decision layer" is fine as positioning but reads as empty
jargon in UI chrome. Where it appears as a bare label with no plain-language anchor
nearby, pair it with a plain gloss. Specifically:
- The hero diagram title bar currently reads "sendlyr · activation decision layer".
  Leave the term but it must have a plain-language explanation visible elsewhere in the
  hero (the new value line in Change 2 covers this — verify it reads clearly together).
- Do not rename it everywhere; one consistent term is better than three fuzzy ones.

CHANGE 4 — Keep the "Find the PAI" step concrete.
Step 01 in How-it-works lists abstract tokens (Candidate actions / Outcome cohorts /
Confidence tests). Add one concrete, visceral detail so the analysis feels real, e.g.
a small caption or sub-label implying real scale ("scored across millions of historical
events" or similar). Keep it truthful and generic; do not invent specific customer
numbers beyond the already-approved Typesy figures.

Do NOT change:
- The proof/Typesy section numbers or framing.
- The objection section.
- The trust section.
- The blog preview, footer, or vertical pages.

Acceptance criteria:
- No button in the page asks the visitor to "book a PAI sprint" using PAI before the
  value is stated; PAI appears as the named method, not the price of entry.
- A skeptical visitor who does not think of themselves as "guessing" still sees the
  concrete value within the first viewport.
- The two-user example, objection section, trust section, and careful proof framing
  are all still present and unchanged in substance.
- Page still passes: a new visitor can explain Sendlyr in one sentence within 10 seconds.
- Visual direction and static architecture unchanged.

Verify before reporting:
- Run `npm start` and load http://127.0.0.1:4173 (or the port server.js uses).
- Check mobile width ~375px and desktop ~1440px; confirm the new hero value line and
  CTA support line wrap cleanly and the hero does not overflow.
- Report every file changed and paste the final hero + CTA copy as rendered.
```
