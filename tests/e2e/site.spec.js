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
    const missingAlt = await page.locator("img:not([alt])").count();
    expect(missingAlt).toBe(0);
  });
}

test("homepage balances supporting evidence with an accessible signal preview", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("69.4%", { exact: true })).toBeVisible();
  await expect(page.getByText("57.9%", { exact: true })).toBeVisible();
  await expect(page.getByText("+19.9%", { exact: true })).toBeVisible();
  await expect(page.getByText("Interactive concept preview using illustrative data. Not a live customer account.", { exact: true })).toBeVisible();
  await expect(page.getByText("Ranking review · recurring", { exact: true })).toBeVisible();

  const signals = page.getByRole("radio");
  await expect(signals).toHaveCount(3);
  await expect(signals.nth(0)).toBeChecked();
  await signals.nth(0).focus();
  await page.keyboard.press("ArrowDown");
  await expect(signals.nth(1)).toBeChecked();
  await expect(page.getByText("Previously 1 of 3", { exact: true })).toBeVisible();
  await expect(page.locator('[role="listbox"], [role="option"]')).toHaveCount(0);

  const product = page.getByRole("tab", { name: "Product" });
  const productTarget = await product.evaluate((node) => ({
    rendered: node.getBoundingClientRect().height,
    minimum: getComputedStyle(node).minHeight
  }));
  expect(productTarget.minimum).toBe("44px");
  expect(productTarget.rendered).toBeGreaterThanOrEqual(43.99);
  await product.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Lifecycle" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Lifecycle" })).toBeVisible();
  await expect(page.locator("[data-signal-announcement]")).toHaveText("Recommendation updated: Test one day-two return reminder.");

  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Combined" })).toBeFocused();
  await expect(page.getByRole("tabpanel", { name: "Combined" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Product" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Combined" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: "Product" })).toBeFocused();

  await page.getByRole("tab", { name: "Lifecycle" }).click();
  await page.locator('label[for="signal-core"]').click();
  await expect(page.locator('[data-signal-detail="core"] [data-test-view="lifecycle"]')).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Nudge users after their first use", { exact: true })).toBeVisible();

  const mainText = await page.locator("main").innerText();
  expect(mainText).not.toMatch(/\bPAI\b/);
});

test("desktop hero and decision console remain inside the first viewport", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop first-viewport assertion");
  for (const viewport of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const geometry = await page.evaluate(() => {
      const header = document.querySelector(".site-header").getBoundingClientRect();
      const grid = document.querySelector(".home-hero-grid").getBoundingClientRect();
      const required = [
        ".home-hero-copy h1",
        ".home-hero-copy .lede",
        ".home-hero-copy .button-row",
        ".signal-instrument",
        ".console-trust"
      ].map((selector) => document.querySelector(selector).getBoundingClientRect().bottom);
      return { headerTop: header.top, headerBottom: header.bottom, gridTop: grid.top, maxBottom: Math.max(...required), innerHeight: window.innerHeight };
    });
    expect(geometry.headerTop).toBe(0);
    expect(Math.abs(geometry.headerBottom - 112)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.gridTop - 140)).toBeLessThanOrEqual(1);
    expect(geometry.maxBottom).toBeLessThanOrEqual(geometry.innerHeight - 20);
  }
});

test("signal and test selections keep the console height stable", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop stability assertion");
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const instrument = page.locator(".signal-instrument");
  const initialHeight = await instrument.evaluate((node) => node.getBoundingClientRect().height);
  for (const key of ["task", "session", "core"]) {
    await page.locator(`label[for="signal-${key}"]`).click();
    for (const view of ["product", "lifecycle", "combined"]) {
      await page.locator(`[data-signal-detail="${key}"] [data-test-view="${view}"]`).click();
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
      const height = await instrument.evaluate((node) => node.getBoundingClientRect().height);
      expect(Math.abs(height - initialHeight)).toBeLessThanOrEqual(1);
    }
  }

  await page.locator('label[for="signal-core"] .signal-lift strong').evaluate((node) => { node.textContent = "Under review"; });
  const partialHeight = await instrument.evaluate((node) => node.getBoundingClientRect().height);
  expect(Math.abs(partialHeight - initialHeight)).toBeLessThanOrEqual(1);
  await expect(page.getByText("Inspect preview states", { exact: true })).toHaveCount(0);
});

test("console typography and reduced-motion focus meet the accessibility contract", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop typography assertion");
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const typography = await page.evaluate(() => {
    const style = (selector) => {
      const computed = getComputedStyle(document.querySelector(selector));
      return { fontSize: computed.fontSize, lineHeight: computed.lineHeight };
    };
    return {
      signal: style(".signal-name"),
      observation: style(".signal-observation"),
      title: style(".test-panel:not([hidden]) strong"),
      explanation: style(".test-panel:not([hidden]) p")
    };
  });
  expect(typography).toEqual({
    signal: { fontSize: "16px", lineHeight: "20px" },
    observation: { fontSize: "14px", lineHeight: "21px" },
    title: { fontSize: "16px", lineHeight: "20px" },
    explanation: { fontSize: "14px", lineHeight: "21px" }
  });

  await page.getByRole("link", { name: "Explore the console ↓" }).click();
  await expect(page.locator("#signal-preview-title")).toBeFocused();
});

test("responsive console recipes stay stable at breakpoint boundaries", async ({ page, isMobile }) => {
  test.skip(isMobile, "Tablet stability assertion");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [
    { width: 760, height: 1024, expected: null },
    { width: 761, height: 1024, expected: 854 },
    { width: 899, height: 1024, expected: 854 },
    { width: 900, height: 1024, expected: 620 },
    { width: 1024, height: 900, expected: 620 },
    { width: 1239, height: 900, expected: 620 },
    { width: 1240, height: 900, expected: 620 }
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const instrument = page.locator(".signal-instrument");
    const initialHeight = await instrument.evaluate((node) => node.getBoundingClientRect().height);
    if (viewport.expected !== null) expect(Math.abs(initialHeight - viewport.expected)).toBeLessThanOrEqual(1);
    for (const key of ["task", "session", "core"]) {
      await page.locator(`label[for="signal-${key}"]`).click();
      for (const view of ["product", "lifecycle", "combined"]) {
        await page.locator(`[data-signal-detail="${key}"] [data-test-view="${view}"]`).click();
        const height = await instrument.evaluate((node) => node.getBoundingClientRect().height);
        expect(Math.abs(height - initialHeight)).toBeLessThanOrEqual(1);
      }
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("analytics is disabled by default", async ({ page }) => {
  const eventRequests = [];
  page.on("request", (request) => { if (request.url().includes("/api/events")) eventRequests.push(request.url()); });
  await page.goto("/");
  await page.locator('label[for="signal-session"]').click();
  await page.getByRole("tab", { name: "Lifecycle" }).click();
  expect(eventRequests).toHaveLength(0);
});

test("core evidence and proposed tests survive without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByText("69.4%", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Book a signal sprint/ }).first()).toBeVisible();
  await expect(page.getByText("Clarify the first-task prompt", { exact: true })).toBeVisible();
  await expect(page.getByText("Remind users before day one ends", { exact: true })).toBeVisible();
  await expect(page.getByText("Test the prompt, then the reminder", { exact: true })).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(0);
  const fallbackRecommendations = {
    session: ["Strengthen the return path", "Test one day-two return reminder", "Test the reminder before the path"],
    core: ["Make the repeat path obvious", "Nudge users after their first use", "Test the path before the nudge"]
  };
  for (const [key, recommendations] of Object.entries(fallbackRecommendations)) {
    await page.locator(`label[for="signal-${key}"]`).click();
    await expect(page.locator(`#signal-${key}`)).toBeChecked();
    for (const recommendation of recommendations) {
      await expect(page.getByText(recommendation, { exact: true })).toBeVisible();
    }
  }
  await context.close();
});

test("mobile signal ledger stays visible without horizontal overflow", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile layout assertion");
  await page.goto("/");

  const signals = page.getByRole("radio");
  await expect(signals).toHaveCount(3);
  for (const key of ["task", "session", "core"]) await expect(page.locator(`label[for="signal-${key}"]`)).toBeVisible();

  const instrument = page.locator(".signal-instrument");
  const heights = [];
  for (const key of ["task", "session", "core"]) {
    await page.locator(`label[for="signal-${key}"]`).click();
    for (const view of ["product", "lifecycle", "combined"]) {
      await page.locator(`[data-signal-detail="${key}"] [data-test-view="${view}"]`).click();
      heights.push(await instrument.evaluate((node) => node.getBoundingClientRect().height));
    }
  }
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(4);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("all internal navigation targets resolve", async ({ request }) => {
  for (const route of routes) expect((await request.get(route)).status(), route).toBe(200);
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
});
