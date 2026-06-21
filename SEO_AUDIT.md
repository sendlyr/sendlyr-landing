# Sendlyr SEO Audit

Date: 2026-06-21

## Research Findings

Sources reviewed:

- Google Search Central, [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- Google Search Central, [Title links](https://developers.google.com/search/docs/appearance/title-link)
- Google Search Central, [Meta descriptions / snippets](https://developers.google.com/search/docs/appearance/snippet)
- Google Search Central, [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- Google Search Central, [robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- Google Search Central, [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- Google Search Central, [Structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- Google Search Central, [Localized versions / hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- Google Search Central, [Image SEO](https://developers.google.com/search/docs/appearance/google-images)
- Google Search Central, [Generative AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)
- web.dev, [Web Vitals](https://web.dev/articles/vitals)
- Open Graph protocol, [ogp.me](https://ogp.me/)
- X/Twitter Cards, [Card markup docs](https://docs.x.com/overview)
- llms.txt proposal, [llmstxt.org](https://llmstxt.org/)
- Schema.org, [SoftwareApplication](https://schema.org/SoftwareApplication) and [FAQPage](https://schema.org/FAQPage)

Consensus checklist for a static B2B SaaS marketing site:

- Make each crawlable page self-describing with a unique title, a useful meta description, a canonical URL, and `index,follow` robots metadata.
- Keep canonical URLs absolute, stable, extensionless, and aligned with Vercel `cleanUrls=true`; avoid trailing slashes except the root URL.
- Publish `robots.txt` at the site root and reference an XML sitemap that lists the canonical route set.
- Use one H1 per page, then logical H2/H3 sections that describe the page content for humans and crawlers.
- Add concise, descriptive alt text for meaningful images; reserve empty alt only for decorative images.
- Add image width and height attributes to reduce layout shift.
- Use internal links between the homepage, product/how-it-works page, vertical pages, and blog content so crawlers can understand relationships.
- Use JSON-LD for entity clarity: Organization and WebSite on the homepage, SoftwareApplication/Product for the product, Article and BreadcrumbList for articles, and FAQPage only where visible FAQs already exist.
- For a single English site, `lang="en"` is sufficient; hreflang is unnecessary until translated or regional variants exist.
- Support Core Web Vitals by keeping the static site light, using font `display=swap`, adding image dimensions, preconnecting to font origins, avoiding layout shifts, and lazy-loading non-critical images.
- Add Open Graph and Twitter Card tags to control unfurl previews; use a dedicated 1200x630 image when available.
- For GEO/AEO visibility, define the entity clearly, answer common questions in crawlable text, avoid unsupported claims, use structured data, and provide an `llms.txt` summary with key routes.

## Current Page Audit

| Route | Current title | Meta description | H1 count | Canonical | OG/Twitter | Structured data | Image gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | `Sendlyr — Find the behavior that predicts retention.` | Missing | 1 | Missing | Missing | Missing | 5 images missing width/height |
| `/how-it-works` | `How Sendlyr Works \| From Product Data to Behavior-Based Emails` | Present | 1 | Missing | Missing | Missing | 2 images missing width/height |
| `/blog` | `Blog - Sendlyr` | Missing | 1 | Missing | Missing | Missing | 3 images missing width/height |
| `/blog/pai-discovery-case-study` | `How we found the exact behavior that predicts whether a user will keep paying - Sendlyr` | Present | 1 | Missing | Missing | Missing | 7 images missing width/height; alt text is filename-like |
| `/for/fitness-apps` | `Sendlyr for Fitness Apps — The behavior that predicts whether your user sticks. We find it.` | Present but long | 1 | Missing | Missing | Missing | 3 images missing width/height |
| `/for/cooking-apps` | `Sendlyr for Cooking Apps — The behavior that predicts subscription. We find it.` | Present but long | 1 | Missing | Missing | Missing | 3 images missing width/height |
| `/for/edtech-apps` | `Sendlyr for Edtech Apps — The behavior that predicts retention. Found, then driven.` | Present but long | 1 | Missing | Missing | Missing | 3 images missing width/height |

## Gaps To Fix

- Add unique metadata and canonical URLs to every page.
- Add Open Graph and Twitter Card tags to every page.
- Add JSON-LD for Organization, WebSite, SoftwareApplication/Product, Article, BreadcrumbList, and visible FAQ sections.
- Add width/height attributes and improve weak blog image alt text.
- Add `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt`.
- Confirm `vercel.json` redirects stay aligned with extensionless canonical URLs.
- Add or expose sensible cross-links between homepage, `/how-it-works`, vertical pages, and blog content.

## Implementation Summary

Implemented on 2026-06-21:

- Added unique titles, meta descriptions, robots tags, canonical URLs, Open Graph tags, and Twitter Card tags to every crawlable HTML page.
- Added homepage JSON-LD for `Organization`, `WebSite`, and `SoftwareApplication`/`Product`.
- Added `Article` and `BreadcrumbList` JSON-LD to `/blog/pai-discovery-case-study`.
- Added `FAQPage` JSON-LD to `/how-it-works`, `/for/fitness-apps`, `/for/cooking-apps`, and `/for/edtech-apps`, using only Q&A text already visible on each page.
- Added descriptive image `alt` improvements where existing alt text was filename-like.
- Added `width` and `height` attributes to all images and lazy loading to non-critical content images.
- Added internal footer links between the homepage/how-it-works pages and the vertical `/for/*` pages so those routes are discoverable from crawlable HTML.
- Added `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt`.
- Confirmed `vercel.json` keeps `cleanUrls=true`; sitemap and canonicals use extensionless URLs with no trailing slash.
- Added `public/assets/og/og-default.png`, a real 1200x630 branded Open Graph image generated from source templates in `public/assets/og/`.
- Updated all seven crawlable HTML pages to use `https://www.sendlyr.com/assets/og/og-default.png` for Open Graph and Twitter previews with 1200x630 dimensions and descriptive `og:image:alt` text.
- Added a placeholder Google Search Console HTML-tag verification meta tag to the homepage head for a human to replace before deployment.

## Metadata Before / After

| Route | Before title | After title | Before description | After description |
| --- | --- | --- | --- | --- |
| `/` | `Sendlyr — Find the behavior that predicts retention.` | `Sendlyr \| Behavioral Email for SaaS Retention` | Missing | `Sendlyr finds the product activation indicator that predicts trial-to-paid conversion and routes SaaS users through behavioral emails toward retention.` |
| `/how-it-works` | `How Sendlyr Works \| From Product Data to Behavior-Based Emails` | `How Sendlyr Works \| Behavioral Email Journeys` | Present, long | `See how Sendlyr analyzes product data, finds the activation behavior that predicts conversion, classifies users, and stages emails for approval.` |
| `/blog` | `Blog - Sendlyr` | `Sendlyr Blog \| User Activation and Retention` | Missing | `Read Sendlyr essays and case studies on user activation, Product Activation Indicators, retention analysis, behavioral email, and lifecycle marketing.` |
| `/blog/pai-discovery-case-study` | `How we found the exact behavior that predicts whether a user will keep paying - Sendlyr` | `PAI Discovery Case Study \| Sendlyr Retention Analysis` | Present, short | `A Sendlyr case study on finding the Product Activation Indicator that predicted retention, then building state-based onboarding around it.` |
| `/for/fitness-apps` | `Sendlyr for Fitness Apps — The behavior that predicts whether your user sticks. We find it.` | `Sendlyr for Fitness Apps \| User Activation` | Present, long | `Find which early fitness-app behavior predicts retention, then route each trial or freemium user through approved behavioral emails toward activation.` |
| `/for/cooking-apps` | `Sendlyr for Cooking Apps — The behavior that predicts subscription. We find it.` | `Sendlyr for Cooking Apps \| Trial Conversion` | Present, long | `Find which cooking-app behavior predicts trial-to-paid conversion, then route users through approved lifecycle emails toward that activation milestone.` |
| `/for/edtech-apps` | `Sendlyr for Edtech Apps — The behavior that predicts retention. Found, then driven.` | `Sendlyr for Edtech Apps \| Retention Emails` | Present, long | `Find the edtech activation behavior that predicts retention, then guide learners through approved onboarding emails toward that Product Activation Indicator.` |

## Page-Level After State

| Route | Canonical | OG/Twitter | Structured data | Image state |
| --- | --- | --- | --- | --- |
| `/` | `https://www.sendlyr.com` | Added | Organization, WebSite, SoftwareApplication/Product | All images have alt + width/height |
| `/how-it-works` | `https://www.sendlyr.com/how-it-works` | Added | FAQPage | All images have alt + width/height |
| `/blog` | `https://www.sendlyr.com/blog` | Added | None added; no article body or FAQ on this index page | All images have alt + width/height |
| `/blog/pai-discovery-case-study` | `https://www.sendlyr.com/blog/pai-discovery-case-study` | Added | Article, BreadcrumbList | All images have descriptive alt + width/height |
| `/for/fitness-apps` | `https://www.sendlyr.com/for/fitness-apps` | Added | FAQPage | All images have alt + width/height |
| `/for/cooking-apps` | `https://www.sendlyr.com/for/cooking-apps` | Added | FAQPage | All images have alt + width/height |
| `/for/edtech-apps` | `https://www.sendlyr.com/for/edtech-apps` | Added | FAQPage | All images have alt + width/height |

## Final Verification

- Static validation confirmed each page has title, description, robots, canonical, Open Graph, Twitter Card, and zero images missing alt/width/height.
- JSON-LD blocks parse as valid JSON.
- `public/sitemap.xml` is well-formed for the route set and contains 7 extensionless canonical URLs.
- `public/robots.txt` allows all crawlers and points to `https://www.sendlyr.com/sitemap.xml`.
- Google Fonts already use `display=swap` in the existing stylesheet URL and font preconnects are present.
- `vercel.json` uses `cleanUrls=true`; existing redirects target extensionless `/for/*` and `/how-it-works` routes.
- Local server served all page routes and site-level files with HTTP 200 at `http://127.0.0.1:4173`.
- Browser smoke test confirmed each HTML route rendered visible content, exposed the expected title/canonical/OG metadata in the DOM, had no horizontal overflow at the default desktop viewport, and logged no console errors.
- Follow-up verification on 2026-06-21 confirmed `public/assets/og/og-default.png` is exactly 1200x630 and 356,511 bytes.
- Follow-up browser smoke test confirmed all seven HTML routes serve HTTP 200, render visible content, expose the new Open Graph/Twitter image tags, and map `https://www.sendlyr.com/assets/og/og-default.png` to a local HTTP 200 asset path.
- Follow-up verification confirmed the homepage includes the placeholder Google Search Console token and `public/robots.txt` still references `https://www.sendlyr.com/sitemap.xml`.

## Prioritized TODOs

1. Google Search Console verification remains a human action: replace the placeholder homepage token, deploy, verify ownership, and submit the sitemap.
2. Add Bing Webmaster Tools verification after deployment if Bing coverage matters.
3. Confirm exact publication date for the case study if `datePublished` should be added to Article metadata.
4. Consider adding a short public glossary page for "Product Activation Indicator" once there is enough content to support a dedicated search intent.
5. Build backlink and citation strategy around the Typesy case study, activation analysis, lifecycle marketing, and behavioral email topics.

## Search Console Setup - Human Steps

These steps require a logged-in Google Search Console owner account and cannot be completed by the local static site alone.

1. Open [Google Search Console](https://search.google.com/search-console), click the property selector in the top-left, then click **Add property**.
2. Choose one verification option:
   - HTML tag option: choose **URL prefix**, enter `https://www.sendlyr.com`, continue, open **HTML tag**, copy only the token from the `content` value, paste it into the homepage placeholder `<meta name="google-site-verification" content="REPLACE_WITH_GSC_TOKEN">`, deploy the site, then click **Verify** in Search Console.
   - DNS TXT option: choose **Domain**, enter `sendlyr.com`, continue, copy the provided TXT record, add it at the DNS host for `sendlyr.com`, wait for DNS propagation, then click **Verify** in Search Console.
3. Submit the sitemap: in the verified property, go to **Indexing** -> **Sitemaps**, enter `https://www.sendlyr.com/sitemap.xml` in **Add a new sitemap**, then click **Submit**.
4. Request indexing for key pages: use the top URL Inspection bar, inspect each URL, then click **Request indexing** when Google confirms the URL is accessible. Start with:
   - `https://www.sendlyr.com`
   - `https://www.sendlyr.com/how-it-works`
   - `https://www.sendlyr.com/blog`
   - `https://www.sendlyr.com/blog/pai-discovery-case-study`
   - `https://www.sendlyr.com/for/fitness-apps`
   - `https://www.sendlyr.com/for/cooking-apps`
   - `https://www.sendlyr.com/for/edtech-apps`
