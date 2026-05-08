# Sendlyr Landing Page

A simple static landing page served by Node.js.

## Structure

- `server.js` - static file server
- `api/leads.js` - Vercel serverless endpoint for lead submissions
- `lib/lead-handler.js` - shared lead validation and storage logic
- `public/index.html` - landing page markup and page JavaScript
- `public/styles.css` - landing page styles
- `public/assets/images/` - future image assets
- `public/assets/icons/` - future icon assets
- `supabase.sql` - Supabase table schema for lead storage
- `data/leads.jsonl` - local fallback submissions, created automatically and ignored by git

## Run Locally

Add Supabase credentials to `.env`:

```sh
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-or-service-role-key
SUPABASE_LEADS_TABLE=leads
```

Then run:

```sh
npm start
```

Then open:

```text
http://127.0.0.1:4173
```

No build step is required.

## Lead Form

The demo form posts to `POST /api/leads`.

- If Supabase env vars are set, submissions are inserted into the `leads` table.
- If Supabase env vars are missing locally, submissions fall back to `data/leads.jsonl`.

## Supabase Setup

1. Open your Supabase project.
2. Go to the SQL Editor.
3. Run the SQL in `supabase.sql`.
4. Find your API settings:
   - Project URL: Project Settings or Connect dialog.
   - Server key: API Keys. Use a secret/service-role key only in server environments, never in browser JavaScript.
   - Do not use a publishable/anon key for `SUPABASE_SERVICE_ROLE_KEY`; RLS will block inserts.

## Vercel Setup

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Framework preset: Other.
4. Build command: leave empty.
5. Output directory: leave empty.
6. Add Environment Variables in Vercel Project Settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` with a secret/service-role key, not a publishable key
   - `SUPABASE_LEADS_TABLE` with value `leads`
7. Redeploy after adding environment variables.
