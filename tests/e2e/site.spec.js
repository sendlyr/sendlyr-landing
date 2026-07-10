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

test("homepage keeps evidence visible and tabs keyboard accessible", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByText("69.4%", { exact: true })).toBeVisible();
  await expect(page.getByText("57.9%", { exact: true })).toBeVisible();
  await expect(page.getByText("+19.9%", { exact: true })).toBeVisible();
  if (isMobile) {
    const summary = page.getByText("Inspect the 178-user cohort");
    await expect(summary).toBeVisible();
    await summary.click();
  }
  await expect(page.locator(".person")).toHaveCount(178);
  const discover = page.getByRole("tab", { name: "Discover" });
  await discover.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Validate" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Validate" })).toBeVisible();
});

test("analytics is disabled by default", async ({ page }) => {
  const eventRequests = [];
  page.on("request", (request) => { if (request.url().includes("/api/events")) eventRequests.push(request.url()); });
  await page.goto("/");
  await page.getByRole("tab", { name: "Validate" }).click();
  expect(eventRequests).toHaveLength(0);
});

test("core evidence survives without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByText("69.4%", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Book an Activation Signal Sprint/ }).first()).toBeVisible();
  await context.close();
});

test("all internal navigation targets resolve", async ({ request }) => {
  for (const route of routes) expect((await request.get(route)).status(), route).toBe(200);
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
});
