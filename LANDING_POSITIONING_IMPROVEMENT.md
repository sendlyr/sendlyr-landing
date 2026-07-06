# Sendlyr Landing Positioning Improvement

Date: 2026-06-26
Source: pitch feedback, live homepage review, case study review, and competitor research in `Sendlyr-Resource/market-research/`.

## Decision

Sharpen the homepage around this angle:

> Sendlyr is the activation decision layer before lifecycle execution.

The page should not lead with "lifecycle platform", "AI email automation", "personalized campaigns", or "engagement platform". Those markets are crowded and invite comparison with Braze, Customer.io, Iterable, Klaviyo, Appcues, and Orbit.

The page should lead with the upstream decision:

> Which early user behavior actually predicts conversion or retention, and what should we do for each user state?

Recommended homepage one-liner:

> Before you build another onboarding journey, prove which activation behavior actually moves conversion.

Recommended product description:

> Sendlyr finds the early behavior that predicts paid conversion or retention, turns it into user states, and gives lifecycle teams an experiment-backed plan they can run through their existing email stack.

## Why This Change

Recent pitch feedback exposed three issues:

1. The landing page feels overwhelming to new people.
2. The case study explains Sendlyr faster than the homepage.
3. Experienced buyers ask why they need Sendlyr if they already have lifecycle and analytics teams.

The answer is not "we are a better lifecycle platform." The answer is:

> Most teams have tools and data, but they still guess which activation behavior their onboarding should drive. Sendlyr compresses that analysis into a PAI, state model, and controlled experiment plan.

PAI means Product Activation Indicator: the specific early behavior that predicts whether a user converts or stays.

## Target Buyer

Primary buyer:

- Lifecycle, growth, retention, or product-led onboarding owner.
- Subscription product or SaaS business.
- Enough event data and user volume to analyze behavior.
- Existing email or engagement stack.
- Limited access to analytics/data science bandwidth, or slow cross-team analytics support.

Best early customer sentence:

> We have users, events, and an email tool, but we do not know which early behavior actually predicts paid conversion or retention.

Avoid early customers who already have a mature lifecycle team plus data science support unless the proof is very strong.

## Homepage Narrative

The homepage should move in this order:

1. Same signup, different behavior, wrong message
2. The real problem is not email copy, it is not knowing what behavior to drive
3. Sendlyr finds the PAI from historical product data
4. Sendlyr turns the PAI into user states and a lifecycle experiment
5. Teams can run it through their existing stack, starting with email
6. Typesy proof shows the method with real data
7. Call to action: book a PAI discovery sprint

This is the simplest mental model:

> Two users sign up on the same day. One is already active. One is stuck. A fixed email sequence treats them the same. Sendlyr decides what each user needs based on whether they are moving toward the activation behavior that predicts conversion.

## First View Recommendation

Hero headline options:

1. `Before you write another onboarding email, prove what behavior it should drive.`
2. `Find the activation behavior that predicts paid conversion. Then build the journey around it.`
3. `Stop guessing what onboarding should drive.`

Recommended H1:

> Stop guessing what onboarding should drive.

Recommended subhead:

> Sendlyr analyzes your product usage, finds the early behavior that predicts conversion or retention, then turns it into user states and lifecycle emails your team can approve and run through your existing stack.

Recommended CTA:

> Book a PAI discovery sprint

Secondary CTA:

> Read the Typesy case study

Hero proof line:

> Live with Typesy: one activation milestone showed 39.5% 12-week retention vs 34.0% baseline across 24,118 trials.

Do not overload the hero with all product concepts. The first view should teach one thing: Sendlyr finds the behavior worth driving.

## Core Sections To Add Or Rewrite

### 1. The Problem

Use the two-user example.

Example copy:

> Two users start a trial today. One completes meaningful product actions. The other signs up, clicks around, and stalls. Seven days later, most lifecycle tools still send both users the same message.
>
> The issue is not that the email is badly written. The issue is that the sequence does not know what each user has actually done, or which behavior predicts paid conversion.

Visual direction:

- Split comparison between "fixed sequence" and "state-based decision".
- User A: active, already hit key behavior, should receive reinforcement or upgrade message.
- User B: stuck before key behavior, should receive unblock message.
- Same generic email should be visually marked as wrong.

### 2. What Sendlyr Does

Use three steps, but make them decision-first:

1. Find the PAI
   - Test early behaviors against conversion or retention outcomes.
   - Score candidates by lift, coverage, and confidence.
2. Define states
   - Classify users by how close they are to the PAI.
   - Avoid sending irrelevant messages.
3. Run the experiment
   - Draft messages for each state.
   - Human approves templates.
   - Treatment/control measures conversion lift.

Keep "email" as the first execution channel, not the product category.

### 3. Why Existing Teams Still Need This

This section should directly answer the objection from the pitch:

> If established apps already have analytics and lifecycle teams, why do they need Sendlyr?

Recommended copy:

> Large teams can do this internally, but it is slow. Lifecycle needs an activation answer. Analytics has a backlog. The work becomes a multi-week loop of hypothesis, SQL, review, segmentation, copy, implementation, and measurement.
>
> Mid-sized teams often have the data and the email tool, but not the analytics capacity to find the activation indicator and convert it into a clean experiment.
>
> Sendlyr gives both teams the missing decision artifact: the PAI, the user-state model, and the experiment plan.

Use this phrase:

> We do not replace your lifecycle stack. We tell it what behavior to drive.

### 4. Proof

Bring the case study logic higher on the page.

Use the case study because audience feedback says it explains Sendlyr better.

Proof framing:

> We did not guess the activation moment. We tested it.

Stats to include:

- Typesy baseline 12-week retention: 34.0%.
- Users who reached the activation milestone: 39.5%.
- Lift: +5.5 percentage points.
- Cohort size: 24,118 trials.

Be careful:

- Do not imply Sendlyr already lifted retention from 34.0% to 39.5% through emails unless the controlled A/B result proves it.
- Phrase this as "the activation milestone predicted retention", not "Sendlyr increased retention" until the A/B readout exists.

### 5. Security And Trust

The current risk objection is real. Add a trust section that reduces perceived risk.

Recommended framing:

> Start with analysis, not a deep integration.

Points:

- Read-only historical event analysis first.
- Minimum required fields only.
- Can begin from an export before live integration.
- No emails send without human approval.
- Use existing sender identity and email stack.
- Treatment/control experiment can be scoped before broad rollout.

Avoid vague claims like "secure socket provider" unless the page names a real architecture.

## Messaging Rules

Say:

- Activation decision layer.
- PAI discovery sprint.
- Finds the behavior that predicts conversion or retention.
- State-based lifecycle experiment.
- Existing email stack.
- Lift x coverage.
- Human-approved templates.

Avoid:

- AI lifecycle assistant.
- AI-powered personalized emails.
- Customer engagement platform.
- Marketing automation.
- Journey builder.
- Better onboarding emails.
- Braze/Customer.io/Klaviyo alternative.

## Fundraising Angle

For fundraising, the sharp story is:

> Lifecycle marketing is moving from calendar-based campaigns to behavioral decisioning. Existing platforms help teams send more messages, but they assume the team already knows which behavior matters. Sendlyr owns the upstream activation decision: find the PAI, classify user states, and prove lift with controlled experiments.

Investor version:

> Sendlyr is building the decision layer for lifecycle growth. The first wedge is a 48-hour PAI discovery sprint for subscription products with event data and weak analytics bandwidth. Over time, the moat is a growing library of activation indicators, state models, and experiment results across subscription categories.

Do not pitch a broad lifecycle platform yet. Pitch a narrow wedge that can expand:

1. PAI discovery sprint
2. State model and lifecycle experiment
3. Repeatable PAI discovery engine
4. Cross-customer activation benchmark library
5. Decision layer that feeds existing engagement stacks

## Implementation Priorities

1. Rewrite hero around activation decision, not retention engine.
2. Move the two-user personalization example into the first or second section.
3. Elevate the case study proof earlier.
4. Add an objection section for teams with existing analytics/lifecycle tools.
5. Add trust/security section with read-only analysis-first workflow.
6. Update CTA language from generic "Book analysis" to "Book a PAI discovery sprint".
7. Update meta title and description to match the sharper angle.

## Acceptance Criteria

The revised page should pass these tests:

- A new visitor can explain Sendlyr in one sentence within 10 seconds.
- The page makes clear that Sendlyr decides what behavior to drive before writing emails.
- The page does not sound like a Braze, Customer.io, Klaviyo, Iterable, Appcues, or Orbit competitor.
- The Typesy proof is framed as PAI validation, not unproven campaign lift.
- The security section makes a first conversation feel low-risk.
- The primary CTA asks for a PAI discovery sprint.

