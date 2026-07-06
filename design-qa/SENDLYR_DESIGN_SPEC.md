# Sendlyr Landing — Design Spec (the "taste")

This is the source of truth the design-QA agent checks the site against. It is
extracted from the live system in `public/styles.css` and `public/index.html`.
The design voice is: **premium · data-forward · technical**. Restrained, editorial,
instrument-panel. Not playful, not loud, not generic-SaaS.

If you intentionally change the design language, update THIS file in the same
commit. The agent treats this file as ground truth — drift from it is a finding.

---

## 1. Foundations (tokens)

All color, radius, shadow, and font values live as CSS custom properties in
`:root` in `public/styles.css`. **Rule: production CSS references tokens, not raw
values.** A raw hex/px that duplicates an existing token is a finding (exceptions
live in `baseline.json`).

### Color tokens
| Group | Tokens |
|---|---|
| Background | `--bg #F6F7F5`, `--surface #FFFFFF`, `--surface-2 #FBFBF9`, `--surface-ink #0B1316` |
| Ink / text | `--ink #0B1316`, `--ink-2 #1F2A30`, `--mute #5A6770`, `--faint #8B96A0`, `--ghost #C7CDD2` |
| Brand teal | `--teal #0B5F66`, `--teal-d #084D52`, `--teal-soft #E6F1F0`, `--teal-line #C6DDDC`, `--teal-glow rgba(11,95,102,.10)` |
| Brand violet | `--violet #6D5BD0`, `--violet-soft #EFEDFB` |
| Semantic amber | `--amber #B5701A`, `--amber-soft #FBF0DC`, `--amber-line #EBD09A` |
| Semantic rose | `--rose #B53D45`, `--rose-soft #F8E4E5`, `--rose-line #ECC2C4` |
| Semantic emerald | `--emerald #15795E`, `--emerald-soft #DBF3E7`, `--emerald-line #B2E2C9` |
| Lines | `--line #E4E6E2`, `--line-soft #ECEDE9`, `--line-strong #D4D7D2` |

**Color meaning is fixed** — do not repurpose:
- **Ink / black** = primary action buttons and primary text.
- **Teal** = the brand accent, links, "live/active" state, positive proof.
- **Violet** = secondary accent. It appears almost exclusively *paired with teal in
  a gradient* (`linear-gradient(120deg, teal, violet)`), never as a solo fill.
- **Amber** = editing / in-progress / caution.
- **Rose** = bad / error / "the old way."
- **Emerald** = success / approved / retained.
- No other brand hues. No blue, no generic indigo as a brand color (blues only
  appear as third-party source-logo dots, which are allow-listed in `baseline.json`).

### Radius scale
`--r-xs 4px`, `--r-sm 6px`, `--r-md 10px`, `--r-lg 14px`, `--r-xl 20px`. Off-scale
`border-radius` values are a finding.

### Shadow scale
`--shadow-xs/sm/md/lg/xl`, all low-opacity ink (`rgba(11,23,28,…)`). Shadows are
soft and subtle. A hard or saturated/colored drop shadow is a finding.

### Spacing
Padding/margins cluster on an even rhythm (multiples of ~4, commonly 14/16/18/
22/24/28/36/44/56/64/92px). A value far off this rhythm (e.g. `padding: 13px 27px`)
is a soft (P2) finding.

---

## 2. Type system

Three families, loaded once from Google Fonts in `index.html`:
- `--font-ui` → **Inter** — all body, UI, button, nav text.
- `--font-display` → **Source Serif 4** — display headings & big numbers, **always
  `font-style: italic`, `font-weight: 400`**, tight negative letter-spacing.
- `--font-mono` → **JetBrains Mono** — eyebrows, labels, meta, status text, table
  cells, all "technical chrome."

`body` sets `font-feature-settings: 'cv11','ss01','ss03'` and
`font-variant-numeric: tabular-nums`. Stats and tables must read as tabular figures.

### Type roles (must hold)
| Role | Family | Style |
|---|---|---|
| Display heading (`h1.hero-head`, `.block-title`, `.cta-card h2`, `.proof-val`, `.hp-val`, `.why-name`, article `h1/h2`, blog `h1/h2/h3`) | Source Serif 4 | italic, 400, letter-spacing −0.8 to −2.2px, `line-height` ~0.96–1.08 |
| Accent word inside a display heading | same, wrapped in `<em>` | teal→violet gradient text (`-webkit-background-clip:text`) |
| Eyebrow / kicker / label / meta (`.block-eye`, `.*-eye`, `.nav-mid`, `.nav-status`, `.hp-label`, `.step-num`, table heads, `.*-meta`, `footer`) | JetBrains Mono | 10–13px, often UPPERCASE, letter-spacing 1.2–1.4px, color `--faint` or `--teal` |
| Body / deck / description | Inter | 13.5–18px, color `--mute`/`--ink-2`, line-height 1.55–1.78 |
| Buttons | Inter | weight 600, 13–15px |

### Type rules (the "taste," made checkable)
1. A display-sized heading (≈≥28px, visually a title) **must** use `--font-display`
   italic. A large heading in Inter or non-italic serif is a finding.
2. An eyebrow/label/status/meta string **must** use `--font-mono`. A mono-context
   label set in Inter is a finding.
3. Accent words in headings are wrapped in `<em>` and inherit the teal→violet
   gradient. A heading that hardcodes a gradient on a `<span>` instead of using the
   established `em` pattern is a soft finding.
4. No fourth font family. Any `font-family` literal that is not one of the three
   tokens is a finding.

---

## 3. Signature patterns (the look)

These recurring motifs are the brand. Their absence where expected, or a new
component that ignores them, is a finding.

- **Eyebrow + gradient-italic title + muted deck** opens most sections
  (`.block-head` → `.block-eye` ◆, `.block-title em`, `.block-deck`).
- **Hairline everything.** Cards/sections are white on `--bg`, separated by 1px
  `--line` borders and soft shadows — not heavy borders, not flat fills.
- **Instrument-panel chrome.** "Live" UI mimics a console: traffic-light dots
  (`.b-lights`), mono titles, a teal "● live" stamp, faint grid backgrounds
  (`body::before`, `.hero-diagram::before`).
- **Pulse = alive.** A small dot with `animation: pulse` + colored glow ring marks
  live/active status. Used sparingly.
- **Tabular stats in italic serif.** Big numbers (`.proof-val`, `.hp-val`,
  `.mcad-input .dval`) are Source Serif 4 italic, tight tracking, often gradient.
- **Rounded-100px pills** for tags/badges, tinted with a `*-soft` bg + matching
  text color + optional `*-line` border (`.ba-tag`, `.mg-card .badge`, `.hero-tag`).

---

## 4. Surface area (pages to audit)

Static pages under `public/`, served with `cleanUrls` (no `.html` in URLs):
- `/` — `index.html`
- `/how-it-works`
- `/for/fitness-apps`, `/for/cooking-apps`, `/for/edtech-apps`
- `/blog`, `/blog/pai-discovery-case-study`
- `/assets/og/og-default.html` (OG image template — internal, not a public route)

`vercel.json` redirects: `/for/fitness|cooking|edtech` → `*-apps` (301), and any
other `/for/*` → `/how-it-works` (302). Nav and footer must be consistent across
all public pages.

---

## 5. Responsive contract

Breakpoints in use: **960px** (pipeline collapses), **880px** (multi-col grids → 1
col, block-head stacks), **760px** (nav-mid hidden, tighter padding, hero proof →
2-up). `body` sets `overflow-x: hidden` — this *masks* horizontal overflow, so the
agent must check for elements that would overflow rather than trusting scroll state.

Checks: no fixed widths that exceed the viewport at 375px; grids collapse; nav
remains usable (logo + primary CTA visible) below 760px; tap targets ≥ ~40px high.

---

## 6. Accessibility baseline

- Every `<img>` has meaningful `alt` (decorative → `alt=""`).
- Interactive elements have a visible focus state. (Current CSS leans on hover; a
  missing `:focus-visible` style on buttons/links is a P1 finding.)
- **`prefers-reduced-motion` is currently NOT handled** — several infinite
  animations run (`pulse`, `sv-blink`, `cblnk`, cadence pulse) with no
  `@media (prefers-reduced-motion: reduce)` override. Flag until fixed; do not
  baseline it away.
- Text contrast: `--mute #5A6770` on `--bg`/`--surface` passes for body. `--faint
  #8B96A0` is ~3:1 — acceptable for large/decorative/uppercase-meta, a finding if
  used for essential small body copy.
- Heading order is sequential (no jump from `h1` to `h3` for hierarchy).
- Each page has a unique, descriptive `<title>` and meta description.

---

## 7. Hard "don'ts" (from AGENTS.md + design voice)

- No React / Vite / Next / Tailwind / TypeScript / build step. It stays static.
- Don't change the visual direction unless explicitly requested — the agent
  **reports**, it does not redesign.
- No new font, no pure-white page background (`--bg` is warm off-white by design).
- No raw hex/px duplicating a token; no colored/hard shadows; no sentence-case
  eyebrows; no solo-violet fills; no centered long-form body paragraphs.
- Never put Supabase service/secret keys in client JS or committed files.
