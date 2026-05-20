# Sendlyr Landing v2 — Implementation Guide

This guide moves the design from this prototype (`Landing v2.html`, `landing-v2.css`, `landing-v2.js` in the design project) into the real repo at `sendlyr-landing/` with no build step, no new dependencies, and no architectural changes.

The constraints in `AGENTS.md` are respected: static files only, no React/Vite/Tailwind/TS, server.js stays minimal, secrets stay server-side.

---

## 1. File mapping

Copy these design-project files into the repo at the listed paths. Overwrite where noted.

| Design project | → | Repo path | Action |
|---|---|---|---|
| `Landing v2.html` | → | `public/index.html` | **Overwrite** |
| `landing-v2.css` | → | `public/styles.css` | **Overwrite** |
| `landing-v2.js` | → | `public/scripts/landing.js` | **Create** (new path) |
| existing `public/assets/logo/*` | | unchanged | keep |
| existing `public/assets/images/typesy-logo-colored-2-scaled.png` | | unchanged | keep |

> The current `public/index.html` has inline `<script>` and inline `<link rel="stylesheet" href="/styles.css">`. The new version keeps the same approach but splits the JS into `/scripts/landing.js` to keep the page small and editable.

---

## 2. Path adjustments after copy

The prototype uses **relative paths** (e.g. `assets/logo/sendlyr-icon-transparent.png`). The repo serves from `public/` with **root-relative paths** (e.g. `/assets/logo/...`). After copying:

In `public/index.html`, find-and-replace:

```text
href="assets/        →  href="/assets/
src="assets/         →  src="/assets/
href="landing-v2.css" →  href="/styles.css"
src="landing-v2.js"  →  src="/scripts/landing.js"
```

The favicon link too:
```html
<link rel="icon" type="image/png" href="/assets/logo/sendlyr-icon-transparent.png">
```

No path changes needed inside `styles.css` or `landing.js` — neither references assets by path.

---

## 3. Server change (one line)

`server.js` currently serves `public/` flatly. If it already passes through nested folders, **nothing to do**. If not, confirm that `/scripts/landing.js` resolves. Most simple static servers handle this without changes; verify by visiting `http://127.0.0.1:4173/scripts/landing.js` after dropping the file.

---

## 4. Content swaps (placeholders → real values)

Search `public/index.html` for these and replace with real data:

| Placeholder | Where | Replace with |
|---|---|---|
| `YOUR_CALENDLY_LINK` | Final CTA `onclick` | Real Calendly URL — change `<button>` to `<a class="btn-primary lg" href="...">` for accessibility |
| `1 customer live` | Nav `.nav-status` | Real count, or remove the span if not desired |
| `n = 24,118` | Hero proof bar + Typesy proof footer | Real Typesy cohort size |
| `2.1M events`, `1.4M events`, `680k events` | Step 01 visualization | Real numbers or remove the `.src-evt` spans |
| `Reading speed app · 24k+ users` | Trusted-by row | Confirm wording with Typesy |

The `signal_a / signal_b / signal_c` bars in Step 02 are intentionally generic — keep them; they read as a schematic, not customer data.

---

## 5. What got removed vs the current page

So the coding agent doesn't get confused — these sections from the current `public/index.html` are **gone**:

- The `<section class="qualifier-section merged">` "Works best for" three-bullet list.
- The standalone `<section class="trusted-section">` with the wrapped Typesy card (replaced by the hairline strip).
- The original "BEFORE / AFTER / ACTIVATION / DIFFERENTIATION" four-card stack — now structured as **Hero → Trusted → How it works (NEW) → Before → After → Typesy proof → Why Sendlyr → CTA**.
- The lead form was not in the current `index.html` I saw, but the CSS retains lead-form styles. If you ever add the form back, the styles still work.

If the agent reports missing markup for the qualifier list, that's expected — it was intentionally cut.

---

## 6. Visual / behavior contract (so nothing regresses)

The agent should verify after copying:

1. **Hero diagram renders** — five labeled nodes (EVENTS, ANALYSIS, MILESTONE, EMAIL, USERS), particles flow left→right and a dashed return path runs underneath. Milestone node has a glow and a slowly-rotating dashed ring.
2. **Step 02 bars fill** when scrolled into view (use `IntersectionObserver`).
3. **Before-cards animations** still play (composer typing, cadence cycle, flow-drag arrow, gen card pop, routing balls, approval scan).
4. **No console errors.**
5. **Mobile: ≤ 760px** — proof bar collapses to 2×2, nav links hide, sections stack.
6. **Keyboard:** anchor links in nav (`#how`, `#problem`, `#proof`, `#why`, `#demo`) scroll to sections.

---

## 7. Optional cleanups (only if asked)

- The `landing.js` file uses inline `style.width` on the bar fills. If you'd rather keep CSS source-of-truth, move to CSS custom properties (`--w: 92%`) and `width: var(--w)`.
- The hero diagram is SVG built in JS. To make it static for direct editing, the agent can serialize the runtime DOM and paste it back into the HTML — but the particle animation needs JS either way.
- If you want to keep the lead form (current repo posts to `/api/leads`), add the `<form class="lead-form">` block back inside the `.cta-card` and remove the button + meta row. The CSS already supports it.

---

## 8. Prompt to give your coding agent

Paste this block into the coding agent. It assumes the agent has access to both this design project and the `sendlyr-landing` repo.

```
You're updating the Sendlyr static landing page. The design is finalized in another project; your job is to port it cleanly into this repo.

Source files (in the design project, attach them):
- Landing v2.html
- landing-v2.css
- landing-v2.js
- (assets in assets/logo/ and assets/images/ are identical to what's already in this repo — do not re-copy)

Target repo: this one (sendlyr-landing). Constraints from AGENTS.md still apply:
- No React, no build step, no new dependencies.
- Keep server.js minimal.
- Put static assets under public/assets/.

Steps:
1. Overwrite public/index.html with Landing v2.html.
2. Overwrite public/styles.css with landing-v2.css.
3. Create public/scripts/landing.js from landing-v2.js.
4. In the new index.html, rewrite asset and script paths to root-relative:
   - href="assets/...  →  href="/assets/...
   - src="assets/...   →  src="/assets/...
   - href="landing-v2.css"  →  href="/styles.css"
   - src="landing-v2.js"    →  src="/scripts/landing.js"
   - Favicon link to /assets/logo/sendlyr-icon-transparent.png
5. Confirm the Calendly placeholder. The final CTA currently uses a <button onclick="window.open('YOUR_CALENDLY_LINK', '_blank')">. Replace with an <a href="..." target="_blank" rel="noopener" class="btn-primary lg"> using the real Calendly URL — ask me for it if missing.
6. Confirm `node server.js` serves /scripts/landing.js (nested folder). If the current server doesn't handle nested paths, fix server.js minimally — read file from the resolved path under public/.

Verify:
- npm start, open http://127.0.0.1:4173
- Hero animated diagram renders (5 nodes, flowing particles, dashed return loop, milestone glow).
- Before-section mini-animations still play: composer typing, cadence cycle, flow-drag arrow.
- After-section mini-animations still play: prompt-typing + cards pop in, routing balls fly into buckets, approval scan + confirm.
- Step 02 progress bars fill on scroll.
- Mobile (≤760px): proof bar becomes 2×2, nav links hide, sections stack cleanly.
- Zero console errors.

Do NOT:
- Add the qualifier "Works best for" list back (intentionally removed).
- Re-add the standalone trusted-by card (replaced by the hairline strip).
- Add the lead form back unless I ask — the CTA is now a direct Calendly link.
- Touch api/leads.js or lib/lead-handler.js. The lead endpoint stays.

Report:
- A diff summary of changed files.
- Any path that didn't resolve.
- Anything in the design that doesn't fit the static-only constraint (shouldn't be anything; the prototype is vanilla HTML/CSS/JS).
```

---

## 9. After it ships

Things to test against real traffic:

- The headline `"The one behavior that predicts retention. Found, then driven."` is the most opinionated copy change — consider A/B against the current `"Find the one behavior that predicts retention. Then drive it."` if you have the volume.
- The new How-it-works section may shift the scroll-to-CTA rate up or down. Worth tracking scroll depth + book-call click.
- The hero diagram is the heaviest visual element. If you ever see CLS issues, give `.hd-stage` an explicit `aspect-ratio` instead of fixed height (already 280px now, fine for most cases).
