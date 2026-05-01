# Sendlyr Landing Page

A simple static landing page served by Node.js.

## Structure

- `server.js` - static file server
- `public/index.html` - landing page markup and page JavaScript
- `public/styles.css` - landing page styles
- `public/assets/images/` - future image assets
- `public/assets/icons/` - future icon assets
- `data/leads.jsonl` - local lead submissions, created automatically and ignored by git

## Run Locally

```sh
node server.js
```

Then open:

```text
http://127.0.0.1:4173
```

No build step is required.

## Lead Form

The demo form posts to `POST /api/leads`. Submissions are saved locally as JSON lines in `data/leads.jsonl`.
