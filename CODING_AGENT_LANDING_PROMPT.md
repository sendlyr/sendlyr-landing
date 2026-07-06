# Coding Agent Prompt: Improve Sendlyr Landing Page Positioning

Use this prompt with a coding agent in the `sendlyr-landing` repo.

```text
You are working in /Users/stephendang/Sendlyr/sendlyr-landing.

Goal:
Improve the Sendlyr landing page positioning and copy so the angle is sharper, easier to understand, and ready for future fundraising narrative.

Read first:
- AGENTS.md
- README.md
- LANDING_POSITIONING_IMPROVEMENT.md
- design-qa/SENDLYR_DESIGN_SPEC.md
- public/index.html
- public/styles.css
- public/blog/pai-discovery-case-study.html if present, or the live case study copy if the repo has it

Hard constraints:
- Keep the site static and dependency-light.
- Do not add React, Vite, Next.js, Tailwind, TypeScript, or any build step.
- Preserve the current premium, data-forward, technical visual direction.
- Work mainly in public/index.html and public/styles.css.
- Do not touch .env*, secrets, api/, lib/, server.js, or Supabase logic unless a small copy-only metadata change requires it.
- Use semantic HTML.
- Keep JavaScript minimal.
- Do not claim Sendlyr has already improved retention or conversion through the email experiment unless the page clearly frames the Typesy numbers as activation-signal validation.

Strategic decision:
The homepage must position Sendlyr as the activation decision layer before lifecycle execution.

Do not position Sendlyr as:
- AI lifecycle assistant
- AI-powered personalized emails
- customer engagement platform
- marketing automation
- generic journey builder
- better onboarding emails
- Braze, Customer.io, Klaviyo, Iterable, Appcues, or Orbit replacement

Core message:
Before you build another onboarding journey, prove which activation behavior actually moves conversion.

Preferred H1:
Stop guessing what onboarding should drive.

Preferred subhead:
Sendlyr analyzes your product usage, finds the early behavior that predicts conversion or retention, then turns it into user states and lifecycle emails your team can approve and run through your existing stack.

Primary CTA:
Book a PAI discovery sprint

Secondary CTA:
Read the Typesy case study

Page narrative:
1. Hero: Sendlyr finds the behavior worth driving.
2. Problem: two users sign up at the same time but behave differently; fixed lifecycle emails treat them the same.
3. Explanation: the real problem is not email copy, it is not knowing which behavior predicts paid conversion or retention.
4. Method: find the PAI, define user states, run a controlled lifecycle experiment.
5. Objection answer: existing analytics and lifecycle teams can do this, but it is slow; Sendlyr compresses the analysis into a decision artifact.
6. Proof: Typesy case study shows the activation milestone predicted 39.5% 12-week retention vs 34.0% baseline across 24,118 trials.
7. Trust: read-only historical analysis first; minimum required data; can start from export; no email sends without approval; use existing stack.
8. CTA: book a PAI discovery sprint.

Copy blocks to include or adapt:

Problem section:
"Two users start a trial today. One completes meaningful product actions. The other signs up, clicks around, and stalls. Seven days later, most lifecycle tools still send both users the same message.

The issue is not that the email is badly written. The issue is that the sequence does not know what each user has actually done, or which behavior predicts paid conversion."

Objection section:
"Large teams can do this internally, but it is slow. Lifecycle needs an activation answer. Analytics has a backlog. The work becomes a multi-week loop of hypothesis, SQL, review, segmentation, copy, implementation, and measurement.

Mid-sized teams often have the data and the email tool, but not the analytics capacity to find the activation indicator and convert it into a clean experiment.

Sendlyr gives both teams the missing decision artifact: the PAI, the user-state model, and the experiment plan."

Sharp line:
"We do not replace your lifecycle stack. We tell it what behavior to drive."

Trust section:
"Start with analysis, not a deep integration."

Include these trust points:
- Read-only historical event analysis first.
- Minimum required fields only.
- Can begin from an export before live integration.
- No emails send without human approval.
- Uses the customer's existing sender or email stack.
- Treatment/control experiment is scoped before broad rollout.

Proof handling:
Use the Typesy proof, but be precise:
- Baseline 12-week retention: 34.0%.
- Users who reached activation milestone: 39.5%.
- Lift: +5.5 percentage points.
- Cohort size: 24,118 trials.

Do not say "Sendlyr lifted retention to 39.5%" unless the page clearly explains this was PAI discovery/validation, not final A/B campaign impact.

SEO/meta updates:
Update title and description to reflect activation decision / PAI discovery.
Possible title:
"Sendlyr | Product Activation Indicator Discovery"
Possible description:
"Sendlyr finds the early user behavior that predicts conversion or retention, then turns it into state-based lifecycle experiments your team can run through its existing email stack."

Visual direction:
Preserve the current look. Prefer rewriting sections and adjusting existing diagrams/components over redesigning the whole page.
If you add a visual, make it a concrete comparison:
- Fixed sequence: same message to active and stuck users.
- Sendlyr decision layer: active user gets reinforcement; stuck user gets unblock message.

Acceptance criteria:
- A new visitor can explain Sendlyr in one sentence within 10 seconds.
- The hero clearly says Sendlyr finds the activation behavior worth driving.
- The page uses the two-user example near the top.
- The page directly answers "why do I need this if I already have analytics and lifecycle teams?"
- The page includes a low-risk trust/security section.
- The page avoids sounding like a generic marketing automation tool.
- The page preserves the static architecture and design system.
- Run `npm start` and verify the page at http://127.0.0.1:4173.
- Check mobile width around 375px and desktop around 1440px.
- Report files changed and any verification output.
```

