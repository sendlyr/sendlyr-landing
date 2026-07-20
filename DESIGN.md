# Sendlyr landing design system

Sendlyr should feel like a calm decision instrument for Product, Growth, and Lifecycle leaders. The homepage helps a team find one customer-journey leak, while the supporting routes explain the Activation Signal Sprint and its evidence.

## Signature

The homepage Revenue Leak Map is the primary visual anchor. It connects one customer state to one behavior, one action, and one measurement plan. The continuous decision layer shows how evidence returns after a measured outcome. The Typesy result remains supporting proof on its dedicated routes.

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
wide desktop 1100+       composed tablet 761–1099       editorial mobile ≤760
┌───────┬───────────┐    ┌──────────────────────┐       ┌─────────────────┐
│ thesis│ leak map  │    │ thesis               │       │ brand + action  │
│       │           │    │ leak map             │       │ route rail      │
└───────┴───────────┘    └──────────────────────┘       │ thesis          │
                                                       │ leak map        │
                                                       └─────────────────┘
```

- Desktop uses a 12-column feel and strong left alignment.
- Tablet becomes one composed column before content gets narrow.
- Mobile is editorial. Evidence stacks; essential values never require horizontal scrolling.
- Page gutters: 28px desktop, 22px tablet, 18px mobile.
- Reading width: 680px. Instrument width: up to 760px.

## Shared components

### Header

Compact logo/action row plus route rail. On mobile the route rail scrolls horizontally, signals overflow, and scrolls focused links into view. Real controls are at least 44px.

### Buttons

Primary buttons use ink or teal, a 100px pill radius, and a contained arrow. Hover moves at most 1px. Focus uses a visible 2px teal outline. Public booking actions use “Find your first revenue leak.”

### Evidence ledger

Use divided rows with a mono label, a concise serif statement, and one supporting sentence. Do not turn static information into hoverable cards.

### Revenue Leak Map

The homepage uses one tab system for Activation, Conversion, and Retention. Each tab keeps the same four fields: customer-journey leak, customer state, leading behavior, and recommended next action. The instrument stays stable across states and retains its content without JavaScript.

### Continuous decision layer

Show one path from existing evidence through Sendlyr, human approval, delivery, measurement, and the return loop. Platform marks provide context and never imply endorsement. The diagram must remain understandable when a mark becomes text.

### Result summary

Treatment 84/121 (69.4%), Control 33/57 (57.9%), +19.9% relative lift, and +11.5pp absolute lift stay together wherever the Typesy result appears. The leading-indicator and long-term-retention boundary stays adjacent.

### Disclosure and tabs

Semantic content exists before JavaScript. Enhancements add roving tab focus, arrow/Home/End keys, selected state, and `aria-controls`. Mobile cohort disclosure returns focus to its trigger when closed.

## Page archetypes

- Workflow: promise → three stages → five steps → guardrails → deliverable → Sprint CTA.
- Vertical: tailored activation problem → qualified evidence → three-stage method → fit requirements → Sprint CTA.
- Editorial: thesis → evidence → interpretation → limitation → method/next step.

Page tailoring changes the problem, examples, evidence, and metadata. It does not invent a new product or visual identity.

- Homepage: revenue-leak thesis → interactive example → evidence contract → continuous decision layer → reviewable package → CTA.

## Motion

Three families only: one brand/promise entrance, one cohort evidence fill, and short interaction-state glides. No parallax, carousels, bouncing arrows, or looping gradients. Reduced-motion users receive final states immediately.

## Accessibility

- 44px minimum interactive target.
- Visible focus on every control.
- Meaningful images have alt text; decorative marks are hidden.
- `--faint` is metadata only, never essential small body copy.
- Do not rely on color alone for treatment/control or state.
- One H1 per page, sequential headings, skip link, landmarks, and 200% zoom reflow.

## Quantitative claims

Every number needs a source, cohort, method, qualifier, limitation, permitted pages, and approval status. The Typesy VIP result stays on the approved supporting routes and does not prove long-term retention lift. `RELEASE_CHECKLIST.md` records the publication decision and evidence boundary.

## Hard constraints

- Static output only. No React, Vite, Next.js, Tailwind, TypeScript, or runtime templates.
- No new hue, font, generic stat-card grid, stock imagery, or decorative dashboard chrome.
- Do not use PAI or PP in public positioning. Use “activation signal” or “leading indicator.”
- Do not position Sendlyr as lifecycle-only or email-only. Product and Lifecycle teams share one decision layer.
- No raw secret keys in public code or committed files.
- No sentence longer than 20 words where the message can be split cleanly.
