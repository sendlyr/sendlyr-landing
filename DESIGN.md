# Sendlyr landing design system

Sendlyr should feel like an activation-signal instrument: precise, calm, and evidence-led. The audience is Product, Growth, and Lifecycle leaders. Every page has one job: make the Activation Signal Sprint credible enough to book.

## Signature

The evolving signal ledger is the memorable element. It ranks leading indicators, shows movement over time, and connects each signal to Product and Lifecycle tests. The ledger uses editorial rows, hairlines, short annotations, and restrained controls instead of generic dashboard widgets.

The Typesy result is supporting proof, not the page thesis. It shows that a leading indicator can guide a useful test without implying a universal outcome.

## Tokens

| Role | Token | Value |
|---|---|---|
| Canvas | `--bg` | `#F6F7F5` |
| Paper | `--surface` | `#FFFFFF` |
| Raised paper | `--surface-2` | `#FBFBF9` |
| Primary ink | `--ink` | `#0B1316` |
| Secondary ink | `--ink-2` | `#1F2A30` |
| Body text | `--mute` | `#52616A` |
| Quiet text | `--faint` | `#6F7C84` |
| Brand teal | `--teal` | `#0B5F66` |
| Teal tint | `--teal-soft` | `#E6F1F0` |
| Brand violet | `--violet` | `#6D5BD0` |
| Violet tint | `--violet-soft` | `#EFEDFB` |
| Positive | `--emerald` | `#15795E` |
| Caution | `--amber` | `#A96415` |
| Negative | `--rose` | `#A93640` |
| Hairline | `--line` | `#E1E5E1` |

Spacing uses a 4px rhythm. Main steps are 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, and 112px. Radii are 4, 8, 12, 16, and 22px. Shadows are low-opacity ink only.

## Typography

- Inter: body, navigation, buttons, and controls.
- Source Serif 4: display headings and important numbers. Headlines use italic 400.
- JetBrains Mono: evidence labels, metadata, and instrument chrome.
- No fourth family.
- Display headline: 14 words maximum.
- Section headline: 12 words maximum.
- Visible explanatory sentence: 20 words maximum.
- Control label: 6 words maximum.

## Layout

```text
wide desktop 1240+       composed tablet 761–1239       editorial mobile ≤760
┌───────┬───────────┐    ┌──────────────────────┐       ┌─────────────────┐
│ thesis│ signal    │    │ thesis               │       │ brand + action  │
│       │ instrument│    │ signal instrument    │       │ route rail      │
└───────┴───────────┘    └──────────────────────┘       │ thesis          │
                                                       │ signal ledger   │
                                                       └─────────────────┘
```

- Desktop uses a 12-column feel and strong left alignment.
- Tablet becomes one composed column before content gets narrow.
- Mobile is editorial. Evidence stacks; essential values never require horizontal scrolling.
- Page gutters: 28px desktop, 22px tablet, 18px mobile.
- Reading width: 680px. Instrument width: up to 760px.
- The signal ledger becomes stacked editorial rows on mobile.

## Shared components

### Header

Compact logo/action row plus route rail. On mobile the route rail scrolls horizontally, signals overflow, and scrolls focused links into view. Real controls are at least 44px.

### Buttons

Primary buttons use ink or teal, a 100px pill radius, and a contained arrow. Hover moves at most 1px. Focus uses a visible 2px teal outline. The label is always “Book an Activation Signal Sprint” or the compact “Book a sprint.”

### Evidence ledger

Use divided rows with a mono label, a concise serif statement, and one supporting sentence. Do not turn static information into hoverable cards.

### Signal ledger

Use one ranked list of activation signals or leading indicators. Each row shows rank, movement, coverage, and an evidence qualifier. Selection reveals interpretation and recommended tests without changing the page into app chrome.

Signal examples must work across industries. Prefer “complete a first meaningful task” over internal acronyms or lifecycle-only events.

On the homepage, signal selection uses native radios. Do not combine listbox roles, option buttons, and `aria-activedescendant`. JavaScript may update downstream illustrative bindings and announce the changed recommendation, but native radios own selection semantics.

### Movement annotation

Show when a signal changes rank after a release or new observation window. State what changed and what remains unknown. Never use a causal arrow unless causality is established.

### Product and Lifecycle test lanes

Every selected signal can reveal a Product test, a Lifecycle test, and a coordinated sequence. Lanes share one signal and one learning goal. They are not separate product modules.

### Concept preview

The homepage instrument is an illustrative, interactive concept. It is not a live customer account or a claim that the monitoring product already exists. Keep that boundary visible beside the preview.

The enhanced console uses four fixed zones: 80px header, 244px ranking, 258px decision detail, and 38px trust footer. Signal and Product/Lifecycle/Combined changes never resize the desktop console.

The public landing page does not simulate loading, empty, error, success, or partial states. Those belong to a future live-product component, not visitor controls. Semantic signal and recommendation content remains available without JavaScript.

### Result summary

Treatment 84/121 (69.4%), Control 33/57 (57.9%), +19.9% relative lift, and +11.5pp absolute lift stay together. The leading-indicator and long-term-retention boundary stays adjacent. This block appears as supporting evidence below the broader product story.

### Disclosure and tabs

Semantic content exists before JavaScript. Tab buttons remain natively hidden until enhancement; Product, Lifecycle, and Combined sections remain readable without scripts. Enhancement adds horizontal Left/Right navigation, Home/End keys, selected state, controlled panels, and a polite recommendation announcement.

## Page archetypes

- Homepage: broad activation problem → illustrative signal ledger → ranking shift → shared Product/Lifecycle tests → Sprint method → supporting proof → CTA.
- Workflow: promise → three stages → five steps → guardrails → deliverable → Sprint CTA.
- Vertical: tailored activation problem → qualified evidence → three-stage method → fit requirements → Sprint CTA.
- Editorial: thesis → evidence → interpretation → limitation → method/next step.

Page tailoring changes the problem, examples, evidence, and metadata. It does not invent a new product or visual identity.

## Motion

Three families only: one brand/promise entrance, one restrained ranking movement, and short interaction-state glides. The Typesy cohort may use one supporting evidence fill. No parallax, carousels, bouncing arrows, or looping gradients. Reduced-motion users receive final states immediately.

## Accessibility

- 44px minimum interactive target.
- Visible focus on every control.
- Meaningful images have alt text; decorative marks are hidden.
- `--faint` is metadata only, never essential small body copy.
- Do not rely on color alone for treatment/control or state.
- One H1 per page, sequential headings, skip link, landmarks, and 200% zoom reflow.

## Quantitative claims

Every number needs a source, cohort, method, qualifier, limitation, permitted pages, and approval status. The pre-approved public result is the Typesy VIP first-course-within-four-days leading indicator. It does not prove long-term retention lift.

Illustrative preview values must be clearly labelled as illustrative data. They demonstrate interaction and decision structure, not customer outcomes or live monitoring.

## Hard constraints

- Static output only. No React, Vite, Next.js, Tailwind, TypeScript, or runtime templates.
- No new hue, font, generic stat-card grid, generic widget mosaic, fake app chrome, stock imagery, or decorative dashboard chrome.
- Do not use PAI or PP in public-facing positioning. Use “activation signal” or “leading indicator.”
- Do not position Sendlyr as lifecycle-only or email-only. Product decisions, UI/UX changes, and lifecycle tests share the same signal system.
- No raw secret keys in public code or committed files.
- No sentence longer than 20 words where the message can be split cleanly.
