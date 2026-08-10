const { test, expect } = require("@playwright/test");

// Match assets by stable basename so assertions work with source and fingerprinted build URLs.
function assetByBasename(name, extensions = "svg|png|webp") {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[/_-])${escapedName}(?:\\.[^./?#]+)*\\.(${extensions})(?:[?#].*)?$`, "i");
}

const platformLogos = [
  ["postgresql", "svg"],
  ["sql-server", "svg"],
  ["posthog", "svg"],
  ["braze", "png|webp"],
  ["customerio", "png|webp"],
];
const platformLogoPatterns = platformLogos.map(([name, extensions]) => assetByBasename(name, extensions));

const routes = ["/", "/how-it-works", "/for/fitness-apps", "/for/cooking-apps", "/for/edtech-apps", "/blog", "/blog/pai-discovery-case-study", "/privacy"];
const methodsRoute = "/blog/pai-discovery-case-study";
const primaryCta = "Request a Signal Validation Pilot";

async function fillPilot(page, budgetAuthority = "yes") {
  const form = page.locator("[data-pilot-form]");
  await form.getByLabel("Name").fill("Ada Lovelace");
  await form.getByLabel("Work email").fill("ada@example.com");
  await form.getByLabel("Company").fill("Example Product");
  await form.getByLabel("Cohort size").selectOption("1000-4999");
  await form.getByLabel("Lifecycle stack").fill("Braze");
  await form.getByLabel("Target outcome").fill("Trial conversion within 14 days");
  await form.getByLabel("Timeline").selectOption("within-30-days");
  await form.getByRole("radio", { name: new RegExp(`^${budgetAuthority}$`, "i") }).check();
  return form;
}

async function enableAnalytics(page, events) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: undefined });
  });
  await page.route((url) => url.pathname === "/", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace('data-analytics-enabled="false"', 'data-analytics-enabled="true"');
    await route.fulfill({ response, body, headers: { ...response.headers(), "content-type": "text/html; charset=utf-8" } });
  });
  await page.route("**/api/events", async (route) => {
    events.push(route.request().postDataJSON());
    await route.fulfill({ status: 202, contentType: "application/json", body: '{"ok":true,"stored":true}' });
  });
  await page.route("**/api/leads", async (route) => {
    await route.fulfill({ status: 201, contentType: "application/json", body: '{"ok":true,"message":"Thanks. We received your request."}' });
  });
}

for (const route of routes) {
  test(`${route} has complete metadata and no overflow`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/sendlyr\.com/);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(await page.locator("img:not([alt])").count()).toBe(0);

    const body = await page.locator("body").innerText();
    if (route === methodsRoute) {
      expect(body).toMatch(/holdout/i);
    } else {
      for (const deleted of [/holdout/i, /correlations/i, /control arm/i, /treatment arm/i]) {
        expect(body, route).not.toMatch(deleted);
      }
    }
  });
}

test("homepage metadata, schema, and Open Graph describe activation intelligence", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Activation Intelligence for Subscription Growth | Sendlyr");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Sendlyr finds the early behavior that predicts conversion, then guides every user toward it through the lifecycle tools you already use.");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Activation Intelligence for Subscription Growth | Sendlyr");
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", "Find the early behavior that predicts conversion, then guide every user toward it through the lifecycle tools you already use.");
  const ogImage = page.locator('meta[property="og:image"]');
  await expect(ogImage).toHaveAttribute("content", /^https:\/\/sendlyr\.com\//);
  await expect(ogImage).toHaveAttribute("content", assetByBasename("og-home", "png"));
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", "Sendlyr activation intelligence for subscription growth.");
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(JSON.stringify(schema)).toContain("Signal Validation Pilot");
  expect(JSON.stringify(schema)).not.toContain("offers");
});

test("homepage follows the activation intelligence spine without deleted positioning", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Activation Intelligence for Subscription Growth");
  await expect(page.locator(".qualifier")).toContainText("around 500 or more eligible users");
  await expect(page.locator(".qualifier")).toContainText("Exact sizing depends on your baseline rate, measurement window, and the behavior you want to validate.");

  const body = await page.locator("body").innerText();
  for (const deleted of [/revenue leak/i, /decision layer/i, /decision package/i, /sendgrid/i, /return to the unfinished task/i, /subject, body, and deep link/i]) {
    expect(body).not.toMatch(deleted);
  }
});

test("hero shows the five-stage flow and both validated indicator states", async ({ page }) => {
  await page.goto("/");
  const flow = page.locator("[data-hero-flow]");
  await expect(flow).toBeVisible();
  await expect(flow.locator(".activation-node-label")).toHaveText(["Data", "Sendlyr", "Leading indicator", "Treatment", "Outcome"]);
  await expect(flow.locator(".activation-node p")).toHaveCount(0);
  await expect(flow).toContainText("Outcome feedback");

  const states = flow.locator("[data-indicator-state]");
  await expect(states).toHaveCount(2);
  await expect(states.nth(0)).toContainText("Validated indicator · Typesy VIP");
  await expect(states.nth(0)).toContainText("Complete at least one course within the first four days");
  await expect(states.nth(0)).toContainText("79.5%");
  await expect(states.nth(0)).toContainText("30.6%");
  await expect(states.nth(0)).toContainText("2.6×");
  await expect(states.nth(1)).toContainText("Validated indicator · Typesy Homeschool");
  await expect(states.nth(1)).toContainText("Hatch three or more pets within the first fourteen days");
  await expect(states.nth(1)).toContainText("57.7%");
  await expect(states.nth(1)).toContainText("33.4%");
  await expect(states.nth(1)).toContainText("1.7×");
  await expect(states).toContainText([/Predicts conversion\. Correlational, not causal\./, /Predicts conversion\. Correlational, not causal\./]);
  await expect(states.locator("small")).toHaveCount(0);

  const heroImageSources = await flow.locator(".activation-node img").evaluateAll((images) => images.map((image) => image.getAttribute("src") || ""));
  expect(heroImageSources.filter((src) => platformLogoPatterns.some((pattern) => pattern.test(src)))).toHaveLength(0);
  await expect(flow.locator(".activation-node-icon svg")).toHaveCount(4);
  const diagramImageSources = await page.locator("[data-how-it-works-diagram] img").evaluateAll((images) => images.map((image) => image.getAttribute("src") || ""));
  expect(diagramImageSources.filter((src) => platformLogoPatterns.some((pattern) => pattern.test(src)))).toHaveLength(5);

  await expect(page.locator("#activation-loop-description")).toContainText("Outcome feedback returns to Sendlyr");
  await expect(flow.locator(".activation-loop-map")).toHaveCount(2);
  for (const svg of await flow.locator(".activation-loop-map").all()) await expect(svg).toHaveAttribute("aria-hidden", "true");

  const visibleMap = flow.locator(".activation-loop-map:visible");
  await expect(visibleMap).toHaveCount(1);
  expect(await visibleMap.locator("path[marker-end]").count()).toBe(6);
  const nodeBackgrounds = await flow.locator(".activation-node--data, .activation-node--sendlyr").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor));
  expect(nodeBackgrounds[0]).not.toBe(nodeBackgrounds[1]);
});

test("validated indicator rotation pauses on hover and keyboard focus", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const rotator = page.locator("[data-indicator-rotator]");
  await expect(rotator).toHaveAttribute("data-active-state", "vip");

  await page.clock.fastForward(5600);
  await expect(rotator).toHaveAttribute("data-active-state", "homeschool");

  await rotator.hover();
  await expect(rotator).toHaveAttribute("data-rotation-paused", "true");
  await page.clock.fastForward(11000);
  await expect(rotator).toHaveAttribute("data-active-state", "homeschool");

  await page.locator(".hero-copy").hover();
  await expect(rotator).toHaveAttribute("data-rotation-paused", "false");
  await page.clock.fastForward(5600);
  await expect(rotator).toHaveAttribute("data-active-state", "vip");

  await rotator.focus();
  await expect(rotator).toBeFocused();
  await expect(rotator).toHaveAttribute("data-rotation-paused", "true");
  await page.clock.fastForward(11000);
  await expect(rotator).toHaveAttribute("data-active-state", "vip");
});

test("How Sendlyr works is a five-stage diagram with both customer stack logo groups", async ({ page }) => {
  await page.goto("/");
  const diagram = page.locator("[data-how-it-works-diagram]");
  await expect(diagram).toBeVisible();
  await expect(diagram.locator(".works-node")).toHaveCount(5);
  await expect(diagram.locator(".works-node h3")).toHaveText(["Data", "Sendlyr", "Leading indicator", "Treatment", "Outcome"]);
  await expect(diagram.locator("ol")).toHaveCount(0);
  await expect(diagram.locator(".works-node--sendlyr")).toContainText("Finds the early behavior that predicts your chosen outcome.");
  await expect(diagram).toContainText("Only the Sendlyr step is new. Your data and lifecycle tools stay in place.");

  const dataLogos = diagram.locator("[data-data-stack-logos] img");
  await expect(dataLogos).toHaveCount(3);
  expect(await dataLogos.evaluateAll((images) => images.map((image) => image.getAttribute("src")))).toEqual([
    expect.stringMatching(assetByBasename("postgresql", "svg")),
    expect.stringMatching(assetByBasename("sql-server", "svg")),
    expect.stringMatching(assetByBasename("posthog", "svg")),
  ]);
  const lifecycleLogos = diagram.locator("[data-lifecycle-stack-logos] img");
  await expect(lifecycleLogos).toHaveCount(2);
  expect(await lifecycleLogos.evaluateAll((images) => images.map((image) => image.getAttribute("src")))).toEqual([
    expect.stringMatching(assetByBasename("braze", "png|webp")),
    expect.stringMatching(assetByBasename("customerio", "png|webp")),
  ]);
  expect((await page.locator("body").innerText()).match(/testing/gi)).toHaveLength(1);
});

test("three-part deliverable ends with the outcome readout", async ({ page }) => {
  await page.goto("/");
  const deliverables = page.locator(".deliverable-steps");
  await expect(deliverables.locator("li")).toHaveCount(3);
  await expect(deliverables.locator("h3")).toHaveText(["Signal analysis", "Lifecycle guidance", "Outcome readout"]);

  const readout = page.locator(".readout-list");
  await expect(readout.locator("li")).toHaveText([
    /Indicator definition/,
    /Behavior window/,
    /Relationship to outcome/,
    /Coverage/,
    /Lifecycle direction/,
    /Measurement plan/,
    /Learning update/,
  ]);
});

test("Typesy result reports both the changed indicator and null conversion outcome", async ({ page }) => {
  await page.goto("/");
  const results = page.locator("#results");
  await expect(results.getByRole("heading", { name: "We moved the behavior. Conversion did not move." })).toBeVisible();
  for (const value of [
    "eReflect’s Typesy",
    "69.4%",
    "129/186",
    "57.7%",
    "56/97",
    "+11.7pp · +20.3% relative",
    "p ≈ 0.051 — borderline",
    "76.8%",
    "136/177",
    "76.7%",
    "66/86",
    "+0.1pp · effectively flat",
    "conversion was already around 77%",
  ]) await expect(results).toContainText(value);
  await expect(results.getByRole("link", { name: "Read the full case study" })).toHaveAttribute("href", "/blog/pai-discovery-case-study");
  await expect(results).not.toContainText("treatment/no-hit");
});

test("founder evidence states the operated experiment and correction", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".founder-frame > p")).toHaveText("Stephen designed and operated a live randomised experiment across 485 users and 568 hand-executed sends. He detected a four-day pipeline outage himself. He corrected the published conclusion when the final data contradicted the hypothesis.");
});

test("Signal Validation Pilot has fixed scope and no public price", async ({ page }) => {
  await page.goto("/");
  const pilot = page.locator("#pilot");
  await expect(pilot).toContainText("one candidate behavior, one outcome, one lifecycle direction, and one complete readout");
  await expect(pilot).toContainText("A clear indicator, its evidence, and the next action for your lifecycle stack.");
  const text = await pilot.innerText();
  expect(text).not.toMatch(/AUD|\$\s*2[,\s]?500|price/i);
});

test("qualification form posts every field to the leads endpoint", async ({ page }) => {
  let submission;
  await page.route("**/api/leads", async (route) => {
    submission = Object.fromEntries(new URLSearchParams(route.request().postData() || ""));
    await route.fulfill({ status: 201, contentType: "application/json", body: '{"ok":true,"message":"Thanks. We received your request."}' });
  });
  await page.goto("/");
  const form = page.locator("[data-pilot-form]");
  await expect(form).toHaveAttribute("action", "/api/leads");
  await expect(form).toHaveAttribute("method", "post");
  for (const label of ["Name", "Work email", "Company", "Cohort size", "Lifecycle stack", "Target outcome", "Timeline"]) {
    await expect(form.getByLabel(label)).toBeVisible();
  }

  const budget = form.getByRole("group", { name: /Budget authority/ });
  const options = budget.getByRole("radio");
  await expect(options).toHaveCount(3);
  expect(await options.evaluateAll((items) => items.map((item) => item.value))).toEqual(["yes", "no", "unsure"]);

  await fillPilot(page, "yes");
  await form.locator('button[type="submit"]').click();
  await expect.poll(() => submission).toMatchObject({
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Example Product",
    cohort_size: "1000-4999",
    lifecycle_stack: "Braze",
    target_outcome: "Trial conversion within 14 days",
    timeline: "within-30-days",
    budget_authority: "yes",
    source: "signal-validation-pilot",
  });
});

test("budget authority is required", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("[data-pilot-form]");
  const radios = form.getByRole("radio");
  await expect(radios).toHaveCount(3);
  for (const radio of await radios.all()) await expect(radio).toHaveAttribute("required", "");

  await form.getByLabel("Name").fill("Ada Lovelace");
  await form.getByLabel("Work email").fill("ada@example.com");
  await form.getByLabel("Company").fill("Example Product");
  await form.getByLabel("Cohort size").selectOption("1000-4999");
  await form.getByLabel("Lifecycle stack").fill("Braze");
  await form.getByLabel("Target outcome").fill("Trial conversion");
  await form.getByLabel("Timeline").selectOption("within-30-days");
  await form.locator('button[type="submit"]').click();
  expect(await radios.first().evaluate((radio) => radio.matches(":invalid"))).toBe(true);
});

test("essential buying information survives without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Activation Intelligence for Subscription Growth" })).toBeVisible();
  await expect(page.locator("[data-activation-loop]")).toBeVisible();
  await expect(page.locator("[data-how-it-works-diagram]")).toBeVisible();
  await expect(page.locator(".qualifier")).toBeVisible();
  await expect(page.locator(".deliverable-steps")).toBeVisible();
  await expect(page.locator(".readout-list")).toBeVisible();
  await expect(page.locator("#results")).toBeVisible();
  await expect(page.locator(".founder-frame")).toBeVisible();
  await expect(page.locator("[data-pilot-form]")).toBeVisible();
  await context.close();
});

test("one primary CTA phrase is used across all public actions", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const actions = page.locator("[data-primary-cta], [data-book-sprint]");
    expect(await actions.count(), route).toBeGreaterThan(0);
    const phrases = await actions.evaluateAll((items) => items.map((item) => item.textContent.replace(/[↓→↗]/g, "").trim()));
    expect(new Set(phrases), route).toEqual(new Set([primaryCta]));
  }
});

test("desktop hero value unit fits the first viewport", async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const bottom = await page.locator(".product-hero").evaluate((element) => element.getBoundingClientRect().bottom);
    expect(bottom, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(viewport.height - 12);
  }
});

test("homepage has no overflow at release widths", async ({ page }) => {
  for (const width of [320, 375, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width <= 430 ? 812 : 900 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${width}px`).toBeLessThanOrEqual(1);
    const loopBounds = await page.locator("[data-activation-loop]").evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right };
    });
    expect(loopBounds.left, `${width}px loop left`).toBeGreaterThanOrEqual(-1);
    expect(loopBounds.right, `${width}px loop right`).toBeLessThanOrEqual(width + 1);
  }
});

test("homepage controls keep touch-sized targets", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/");
  const selector = "[data-primary-cta], .nav-route-row a, .footer-links a, .budget-options label, .pilot-form input:not([type=radio]):not([type=hidden]), .pilot-form select, .pilot-form textarea";
  const undersized = await page.locator(selector).evaluateAll((controls) => {
    const isVisuallyHidden = (control) => {
      if (!control.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return true;

      for (let element = control; element; element = element.parentElement) {
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        const clipsOverflow = [style.overflow, style.overflowX, style.overflowY].some((value) => value === "hidden" || value === "clip");
        if (clipsOverflow && bounds.width <= 1 && bounds.height <= 1) return true;
      }

      const bounds = control.getBoundingClientRect();
      const position = getComputedStyle(control).position;
      return (position === "absolute" || position === "fixed") && (bounds.right <= 0 || bounds.bottom <= 0);
    };

    return controls
      .filter((control) => control.getAttribute("tabindex") !== "-1")
      .filter((control) => !control.closest('[aria-hidden="true"]'))
      .filter((control) => !isVisuallyHidden(control))
      .map((control) => ({ label: control.textContent.trim() || control.getAttribute("name"), width: control.getBoundingClientRect().width, height: control.getBoundingClientRect().height }))
      .filter(({ width, height }) => width < 44 || height < 44);
  });
  expect(undersized).toEqual([]);
});

test("keyboard focus is visible and form radios are operable", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  expect(await skip.evaluate((element) => getComputedStyle(element).outlineWidth)).toBe("2px");

  const yes = page.getByRole("radio", { name: "Yes", exact: true });
  await yes.focus();
  await page.keyboard.press("Space");
  await expect(yes).toBeChecked();
  expect(await yes.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
});

test("analytics is disabled by default for the pilot form", async ({ page }) => {
  const eventRequests = [];
  page.on("request", (request) => { if (request.url().includes("/api/events")) eventRequests.push(request.url()); });
  await page.route("**/api/leads", async (route) => {
    await route.fulfill({ status: 201, contentType: "application/json", body: '{"ok":true,"message":"Thanks. We received your request."}' });
  });
  await page.goto("/?ref=braze-syd-2026");
  const form = await fillPilot(page, "yes");
  await form.locator('button[type="submit"]').click();
  await expect(form.locator("[data-pilot-status]")).toHaveText("Thanks. We received your request.");
  expect(eventRequests).toHaveLength(0);
});

test("enabled analytics records one start and one successful pilot submit", async ({ page }) => {
  const events = [];
  await enableAnalytics(page, events);

  await page.goto("/?ref=braze-syd-2026");
  const form = await fillPilot(page, "unsure");
  await expect.poll(() => events.filter((event) => event.event_name === "pilot_form_start").length).toBe(1);
  expect(events.find((event) => event.event_name === "pilot_form_start").properties).toEqual({ placement: "homepage-pilot" });

  await form.locator('button[type="submit"]').click();
  await expect(form.locator("[data-pilot-status]")).toHaveText("Thanks. We received your request.");
  await expect.poll(() => events.filter((event) => event.event_name === "pilot_form_submit").length).toBe(1);
  expect(events.find((event) => event.event_name === "pilot_form_submit").properties).toEqual({ attribution_id: "braze-syd-2026", budget_authority: "unsure" });
});

test("pilot attribution accepts tagged IDs and drops invalid ref values", async ({ page }) => {
  const events = [];
  await enableAnalytics(page, events);

  for (const [ref, expected] of [["77p-2026", "77p-2026"], ["not_valid", undefined]]) {
    await page.goto(`/?ref=${ref}`);
    const form = await fillPilot(page, "no");
    await form.locator('button[type="submit"]').click();
    await expect.poll(() => events.filter((event) => event.event_name === "pilot_form_submit").length).toBe(expected ? 1 : 2);
    const submitted = events.filter((event) => event.event_name === "pilot_form_submit").at(-1);
    expect(submitted.properties.budget_authority).toBe("no");
    expect(submitted.properties.attribution_id).toBe(expected);
  }
});

test("reduced motion resolves immediately", async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
  const transitionSeconds = await page.locator("[data-primary-cta]").first().evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionSeconds).toBeLessThanOrEqual(0.001);
  const rotator = page.locator("[data-indicator-rotator]");
  await expect(rotator).toHaveAttribute("data-rotation-paused", "true");
  await expect(rotator.locator(".indicator-state.is-active")).toHaveCount(1);
  await expect(rotator).toHaveAttribute("data-active-state", "vip");
  await page.clock.fastForward(22000);
  await expect(rotator).toHaveAttribute("data-active-state", "vip");
});

test("homepage Open Graph asset decodes at its declared dimensions", async ({ page }) => {
  await page.goto("/");
  const dimensions = await page.evaluate(() => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Unable to decode the homepage Open Graph image"));
    image.src = "/assets/og/og-home.png";
  }));
  expect(dimensions).toEqual({ width: 1200, height: 630 });
});

test("all internal navigation targets resolve", async ({ page, request }) => {
  for (const route of routes) expect((await request.get(route)).status(), route).toBe(200);
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);

  await page.goto("/");
  const links = await page.locator('a[href^="/"]').evaluateAll((items) => [...new Set(items.map((item) => item.getAttribute("href")))]);
  for (const href of links) {
    const url = new URL(href, "https://sendlyr.com");
    expect((await request.get(url.pathname)).status(), href).toBe(200);
    if (url.pathname === "/" && url.hash) expect(await page.locator(url.hash).count(), href).toBe(1);
  }
  const localHashes = await page.locator('a[href^="#"]').evaluateAll((items) => items.map((item) => item.hash.slice(1)));
  for (const id of localHashes) expect(await page.locator(`#${id}`).count(), id).toBe(1);
});
