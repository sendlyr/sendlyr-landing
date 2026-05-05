# Agent Guide

This repo is a simple static landing page served by a small Node.js file server.

## Project Shape

- `server.js` serves static files from `public/` and accepts lead form submissions at `POST /api/leads` for local development.
- `api/leads.js` is the Vercel serverless endpoint for production lead submissions.
- `lib/lead-handler.js` owns lead validation and storage.
- `public/index.html` contains the landing page markup and inline JavaScript.
- `public/styles.css` contains all page styles.
- `public/assets/images/` is reserved for future image assets.
- `public/assets/icons/` is reserved for future icon assets.
- `supabase.sql` defines the Supabase `leads` table.
- `data/leads.jsonl` stores local lead submissions and is ignored by git.

## Constraints

- Keep the project static and dependency-light.
- Do not add React, Vite, Next.js, Tailwind, TypeScript, or a build step.
- Do not add auth, email sending, or extra integrations unless explicitly requested.
- Keep `server.js` minimal. Production form handling should stay in `api/leads.js` and shared logic should stay in `lib/lead-handler.js`.
- Never expose Supabase secret/service-role keys in browser JavaScript or committed files.
- Preserve the current visual direction unless a design change is explicitly requested.
- Prefer semantic HTML and clear, readable class names.

## Editing Notes

- Put new public assets under `public/assets/images/` or `public/assets/icons/`.
- Reference public files from HTML with root-relative paths such as `/styles.css` or `/assets/images/example.png`.
- Keep JavaScript minimal and page-specific unless the project direction changes.
- Verify changes by running `node server.js` and opening `http://127.0.0.1:4173`.
