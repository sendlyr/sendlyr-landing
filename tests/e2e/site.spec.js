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

  const signals = page.getByRole("option");
  await expect(signals).toHaveCount(3);
  await signals.nth(0).focus();
  await page.keyboard.press("ArrowDown");
  await expect(signals.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Previously 1 of 3", { exact: true })).toBeVisible();

  const product = page.getByRole("tab", { name: "Product" });
  await product.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Lifecycle" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Lifecycle" })).toBeVisible();

  const mainText = await page.locator("main").innerText();
  expect(mainText).not.toMatch(/\bPAI\b/);
});

test("concept preview exposes resilient loading and data states", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Inspect preview states", { exact: true }).click();

  await page.getByRole("button", { name: "Empty", exact: true }).click();
  await expect(page.getByText("No signals ranked in this preview yet.", { exact: true })).toBeVisible();
  await expect(page.getByText("Interactive concept preview using illustrative data. Not a live customer account.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Partial", exact: true }).click();
  await expect(page.getByRole("option", { name: /Use a core feature three times/ })).toContainText("Review pending");

  await page.getByRole("button", { name: "Success", exact: true }).click();
  const coreSignal = page.getByRole("option", { name: /Use a core feature three times/ });
  await expect(coreSignal).toContainText("+12%");
  await expect(coreSignal).toContainText("28%");
});

test("analytics is disabled by default", async ({ page }) => {
  const eventRequests = [];
  page.on("request", (request) => { if (request.url().includes("/api/events")) eventRequests.push(request.url()); });
  await page.goto("/");
  await page.getByRole("option", { name: /Return for a second active session/ }).click();
  await page.getByRole("tab", { name: "Lifecycle" }).click();
  expect(eventRequests).toHaveLength(0);
});

test("core evidence and proposed tests survive without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByText("69.4%", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Book a signal sprint/ }).first()).toBeVisible();
  await expect(page.getByText("Test a clearer first-task prompt for eligible new users.", { exact: true })).toBeVisible();
  await expect(page.getByText("Test a day-one reminder for users who have not completed the task.", { exact: true })).toBeVisible();
  await context.close();
});

test("mobile signal ledger stays visible without horizontal overflow", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile layout assertion");
  await page.goto("/");

  const signals = page.getByRole("option");
  await expect(signals).toHaveCount(3);
  for (const signal of await signals.all()) await expect(signal).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("all internal navigation targets resolve", async ({ request }) => {
  for (const route of routes) expect((await request.get(route)).status(), route).toBe(200);
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
});
