# Agent Guide

This repo is a simple static landing page served by a small Node.js file server.

## Project Shape

- `server.js` serves static files and local lead or event API requests.
- `api/` contains the Vercel lead and pseudonymous event endpoints.
- `lib/` owns validation, server storage, attribution, and reporting logic.
- `src/pages/` contains canonical page markup.
- `src/partials/` contains shared static header and footer markup.
- `scripts/build-site.js` deterministically renders committed static output to `public/`.
- `public/styles.css`, `public/site.css`, `public/enhance.css`, and page styles contain the design implementation.
- `public/assets/images/` contains approved public image assets, including supporting proof media.
- `public/assets/icons/` contains approved public icon assets; third-party platform marks keep their source and usage notes beside the assets.
- `supabase.sql` defines leads; `supabase-analytics.sql` defines server-only analytics tables.
- `data/leads.jsonl` stores local lead submissions and is ignored by git.

## Constraints

- Keep the project static and dependency-light.
- Do not add React, Vite, Next.js, Tailwind, TypeScript, a bundler, or runtime rendering.
- The only approved build step is the dependency-free Node pre-renderer in `scripts/build-site.js`.
- Do not add auth, email sending, or extra integrations unless explicitly requested.
- Keep `server.js` minimal. Production form handling should stay in `api/leads.js` and shared logic should stay in `lib/lead-handler.js`.
- Never expose Supabase secret/service-role keys in browser JavaScript or committed files.
- Preserve the current visual direction unless a design change is explicitly requested.
- Prefer semantic HTML and clear, readable class names.

## Editing Notes

- Put new public assets under `public/assets/images/` or `public/assets/icons/`.
- Reference public files from HTML with root-relative paths such as `/styles.css` or `/assets/images/example.png`.
- Edit canonical files under `src/`; never hand-edit generated `public/**/index.html` files.
- Keep JavaScript minimal. Shared progressive enhancement belongs in `public/scripts/site.js`; homepage-only interactions belong in `public/scripts/app.js`.
- Verify changes with `npm run build`, `npm test`, and `npm run dev` at `http://127.0.0.1:4173`.
