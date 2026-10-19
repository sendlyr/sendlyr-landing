// Render a 1200×630 social image from a local HTML source.
// Usage: node scripts/render-og.js src/og/og-skills.html public/assets/og/og-skills.png
const path = require("path");
const { chromium } = require("@playwright/test");

async function main() {
  const [source, target] = process.argv.slice(2);
  if (!source || !target) throw new Error("Usage: node scripts/render-og.js <source.html> <target.png>");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.goto(`file://${path.resolve(source)}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: target, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
