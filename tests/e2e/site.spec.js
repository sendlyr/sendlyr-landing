const { test, expect } = require("@playwright/test");

const routes = ["/", "/how-it-works", "/for/fitness-apps", "/for/cooking-apps", "/for/edtech-apps", "/blog", "/blog/pai-discovery-case-study", "/privacy"];

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
  });
}

test("homepage metadata, schema, and Open Graph asset match the wedge-first offer", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Find the customer-journey leak worth fixing first | Sendlyr");
  const description = "Sendlyr turns existing product behavior into one priority customer state, one next best action, and a measurable test.";
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Find the customer-journey leak worth fixing first | Sendlyr");
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://sendlyr.com/assets/og/og-home.png");
  const schema = await page.locator('script[type="application/ld+json"]').textContent();
  expect(schema).toContain("Sendlyr revenue leak analysis");
  expect(schema).toContain(description);
  expect(schema).not.toContain("offers");
});

test("homepage uses five narrative units and the evidence contract instead of unapproved customer proof", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main > section")).toHaveCount(5);
  const contract = page.locator(".evidence-contract");
  for (const label of ["Scoped data", "Reviewed definitions", "Controlled change", "Declared measure"]) {
    await expect(contract).toContainText(label);
  }
  await expect(page.getByText("Trusted by", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("img", { name: "Typesy" })).toHaveCount(0);
  await expect(page.getByText("Behavioral Journey Simulation", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Existing engagement stack" })).toHaveCount(0);
});

test("revenue leak map exposes the exact activation, conversion, and retention decisions", async ({ page }) => {
  await page.goto("/");
  const cases = [
    ["Activation Onboarding", "Onboarding started, not finished", "Unstarted", "First meaningful task", "Guide the shortest path to first value"],
    ["Conversion First value", "Exploration without a value moment", "In progress", "Core feature completed", "Show one relevant use case in context"],
    ["Retention Early habit", "Early habit fading", "At risk", "Return for a second active session", "Reinforce the next reason to return"],
  ];
  for (const [tabName, leak, state, behavior, action] of cases) {
    const tab = page.getByRole("tab", { name: tabName });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const panel = page.getByRole("tabpanel", { name: tabName });
    for (const value of [leak, state, behavior, action]) await expect(panel).toContainText(value);
  }
});

test("revenue leak map supports arrow, Home, and End keys", async ({ page }) => {
  await page.goto("/");
  const activation = page.getByRole("tab", { name: "Activation Onboarding" });
  await activation.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Retention Early habit" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(activation).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowUp");
  await expect(page.getByRole("tab", { name: "Retention Early habit" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Retention Early habit" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(activation).toHaveAttribute("aria-selected", "true");
});

test("homepage Open Graph and platform assets decode at their declared dimensions", async ({ page }) => {
  await page.goto("/");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBe("https://sendlyr.com/assets/og/og-home.png");

  const dimensions = await page.evaluate(async () => {
    const load = (src) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ src, width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error(`Unable to decode ${src}`));
      image.src = src;
    });
    return Promise.all([
      load("/assets/og/og-home.png"),
      ...[...document.querySelectorAll(".source-databases img, .provider-marks img")].map((image) => load(image.getAttribute("src"))),
    ]);
  });

  expect(dimensions[0]).toEqual({ src: "/assets/og/og-home.png", width: 1200, height: 630 });
  for (const asset of dimensions.slice(1)) {
    expect(asset.width, asset.src).toBeGreaterThan(0);
    expect(asset.height, asset.src).toBeGreaterThan(0);
  }
});

test("hero decision instrument remains stable across states", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const map = page.locator(".leak-map");
  const heights = [];
  for (const name of ["Activation Onboarding", "Conversion First value", "Retention Early habit"]) {
    await page.getByRole("tab", { name }).click();
    heights.push(await map.evaluate((element) => element.getBoundingClientRect().height));
  }
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
});

test("desktop hero value unit fits the first viewport", async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const bottom = await page.locator(".product-hero").evaluate((element) => element.getBoundingClientRect().bottom);
    expect(bottom, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(viewport.height - 20);
  }
});

test("continuous decision layer uses one activation scenario and a connected feedback path", async ({ page }) => {
  await page.goto("/");
  const flow = page.locator(".decision-flow");
  for (const value of [
    "PostgreSQL",
    "SQL Server",
    "PostHog",
    "Onboarding opened; first task absent after 24h",
    "New user, onboarding opened, no first task 24h after signup",
    "Unstarted",
    "First meaningful task",
    "Return to the unfinished task with one clear next step",
    "Lifecycle owner approval required",
    "Existing engagement stack · Email first",
    "One reminder: subject, body, and deep link",
    "First meaningful task completed within 48h",
    "Raise the rule’s priority only if the pattern repeats",
  ]) await expect(flow).toContainText(value);
  await expect(flow.getByAltText("Braze")).toBeVisible();
  await expect(flow.getByAltText("Customer.io")).toBeVisible();
  await expect(flow).toContainText("SendGrid");
  const width = await page.evaluate(() => window.innerWidth);
  if (width > 900) {
    await expect(page.locator(".feedback-loop svg")).toBeVisible();
  } else {
    await expect(page.locator(".feedback-loop")).toBeVisible();
    expect(await page.locator(".feedback-loop").evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe("2px");
  }
  await expect(page.locator(".connector-boundary")).toHaveText("Example systems shown for context. Connector scope is configured with each team; platform marks do not imply vendor endorsement.");
});

test("decision package keeps essential output visible and rationale collapsed by default", async ({ page }) => {
  await page.goto("/");
  const artifact = page.locator(".decision-package");
  for (const field of ["Customer state", "Leading behavior", "Recommended action", "Human approval", "Delivery destination", "Outcome to measure"]) {
    await expect(artifact).toContainText(field);
  }
  const details = artifact.locator("details");
  await expect(details).not.toHaveAttribute("open", "");
  await expect(details.getByText("Observation", { exact: true })).not.toBeVisible();
  await details.getByText("Why this recommendation", { exact: true }).click();
  await expect(details).toHaveAttribute("open", "");
  for (const field of ["Observation", "Rule threshold", "Changed surface", "Held constant", "Evidence boundary"]) {
    await expect(details).toContainText(field);
  }
  await expect(details).toContainText("Illustrative recommendation; customer data and a controlled measurement determine whether this behavior predicts the outcome.");
});

test("mobile tabs expose overflow, reveal selection, and keep stable dimensions", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const tablist = page.locator(".leak-tabs");
  expect(await tablist.evaluate((element) => getComputedStyle(element).maskImage)).not.toBe("none");
  expect(await tablist.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  const map = page.locator(".leak-map");
  const firstHeight = await map.evaluate((element) => element.getBoundingClientRect().height);
  await page.getByRole("tab", { name: "Activation Onboarding" }).focus();
  await page.keyboard.press("End");
  const retention = page.getByRole("tab", { name: "Retention Early habit" });
  await expect(retention).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => retention.evaluate((tab) => {
    const list = tab.parentElement.getBoundingClientRect();
    const item = tab.getBoundingClientRect();
    return item.left >= list.left - 1 && item.right <= list.right + 1;
  })).toBe(true);
  const lastHeight = await map.evaluate((element) => element.getBoundingClientRect().height);
  expect(Math.abs(lastHeight - firstHeight)).toBeLessThanOrEqual(4);
  expect(await page.locator(".nav-route-row").evaluate((element) => getComputedStyle(element).maskImage)).not.toBe("none");
});

test("homepage has no overflow at release widths", async ({ page }) => {
  for (const width of [320, 375, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width <= 430 ? 812 : 900 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${width}px`).toBeLessThanOrEqual(1);
  }
});

test("homepage controls keep touch-sized targets", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/");
  const undersized = await page.locator("[data-instrument-tabs] button").evaluateAll((controls) => controls
    .map((control) => ({ label: control.textContent.trim(), width: control.getBoundingClientRect().width, height: control.getBoundingClientRect().height }))
    .filter(({ width, height }) => width < 44 || height < 44));
  expect(undersized).toEqual([]);
});

test("analytics is disabled by default", async ({ page }) => {
  const eventRequests = [];
  page.on("request", (request) => { if (request.url().includes("/api/events")) eventRequests.push(request.url()); });
  await page.goto("/");
  await page.getByRole("tab", { name: "Conversion First value" }).click();
  expect(eventRequests).toHaveLength(0);
});

test("essential buying information survives without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Find the customer-journey leak worth fixing first." })).toBeVisible();
  await expect(page.getByRole("tabpanel", { name: "Activation Onboarding" })).toBeVisible();
  await expect(page.locator(".evidence-contract")).toBeVisible();
  await expect(page.locator(".decision-flow")).toBeVisible();
  await expect(page.locator(".decision-package")).toBeVisible();
  await expect(page.locator(".final-offer")).toBeVisible();
  await context.close();
});

test("one primary CTA phrase is used across the homepage", async ({ page }) => {
  await page.goto("/");
  const links = page.locator("[data-book-sprint]");
  await expect(links).toHaveCount(3);
  expect(await links.evaluateAll((items) => items.map((item) => ({ text: item.textContent.replace("↗", "").trim(), href: item.getAttribute("href"), target: item.target, rel: item.rel, placement: item.dataset.placement })))).toEqual([
    { text: "Find your first revenue leak", href: "https://calendly.com/dquang191104/30min", target: "_blank", rel: "noopener", placement: "header" },
    { text: "Find your first revenue leak", href: "https://calendly.com/dquang191104/30min", target: "_blank", rel: "noopener", placement: "hero" },
    { text: "Find your first revenue leak", href: "https://calendly.com/dquang191104/30min", target: "_blank", rel: "noopener", placement: "revenue-leak" },
  ]);
});

test("all public booking actions use the wedge-first CTA", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const links = page.locator("[data-book-sprint]");
    expect(await links.count(), route).toBeGreaterThan(0);
    for (const link of await links.all()) {
      await expect(link, route).toContainText("Find your first revenue leak");
      await expect(link, route).toHaveAttribute("href", "https://calendly.com/dquang191104/30min");
    }
  }
});

test("reduced motion resolves immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Activation Onboarding" })).toHaveAttribute("aria-selected", "true");
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
  const transitionSeconds = await page.getByRole("tab", { name: "Activation Onboarding" }).evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionSeconds).toBeLessThanOrEqual(0.001);
});

test("all internal navigation targets resolve", async ({ request }) => {
  for (const route of routes) expect((await request.get(route)).status(), route).toBe(200);
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
});
