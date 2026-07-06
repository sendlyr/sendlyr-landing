# Design-QA Runner (Codex Automation)

A scheduled agent that audits the Sendlyr landing site against its own design taste
and files findings into one rolling GitHub issue. **Report-only — it never edits the
site.**

## Files
- `SENDLYR_DESIGN_SPEC.md` — the codified taste (tokens, type roles, signature
  patterns, a11y baseline). Ground truth. Update it when you intentionally change the
  design language.
- `AGENT_PROMPT.md` — the task instructions the agent executes each run.
- `baseline.json` — accepted deviations the agent must not re-flag. Grow this over
  time so the runner stays signal, not noise.
- `reports/` — fallback report output (gitignore this dir if you don't want it tracked).

## Set up in Codex (cloud Automations)
1. Push this `design-qa/` folder to `main` on `github.com/sendlyr/sendlyr-landing`.
2. In Codex → the `sendlyr-landing` environment → **Automations** → new scheduled task.
3. **Schedule:** daily (e.g. 07:00 your time). Daily is plenty for a landing page.
4. **Task prompt** (paste this — it just points at the real instructions):

   ```
   Read design-qa/AGENT_PROMPT.md in this repo and execute it exactly.
   Audit the live landing pages under public/ against design-qa/SENDLYR_DESIGN_SPEC.md,
   honoring design-qa/baseline.json. Report findings into the single rolling GitHub
   issue as instructed. Do not edit any page, CSS, or HTML — you are a reviewer.
   ```

5. **Permissions:** give the task read access to the repo and permission to use `gh`
   for issues (label `design-qa`). It does **not** need write access to code or PR
   permissions — it only manages an issue. If `gh` isn't available in the sandbox, it
   falls back to writing `design-qa/reports/latest.md`.

## Run it manually first (recommended)
Before trusting the schedule, run the same prompt once interactively in Codex on this
repo and read the first issue it produces. Tune `SENDLYR_DESIGN_SPEC.md` and
`baseline.json` until the findings are all things you'd actually act on. Two or three
tuning passes and the daily run becomes trustworthy.

## Keeping it useful (the only real risk: noise)
- Each accepted finding → add to `baseline.json` so it never returns.
- If a run produces a finding you disagree with, the fix is usually a sharper rule in
  the spec, not a smarter agent.
- It manages ONE issue and edits it in place — you should never see a pile of
  duplicate issues. If you do, the dedup step in `AGENT_PROMPT.md` was skipped; re-run.
