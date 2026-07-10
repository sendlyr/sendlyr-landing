const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const publicRoot = path.join(__dirname, "..", "public");
const pages = ["index.html", "how-it-works/index.html", "for/fitness-apps/index.html", "for/cooking-apps/index.html", "for/edtech-apps/index.html", "blog/index.html", "blog/pai-discovery-case-study/index.html", "privacy/index.html"];

function dependencies(contents) {
  const values = new Set();
  for (const match of contents.matchAll(/(?:href|src)="(\/build\/[^"]+)"/g)) values.add(match[1]);
  for (const match of contents.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(",")) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url.startsWith("/build/")) values.add(url);
    }
  }
  for (const match of contents.matchAll(/url\(["']?(\/build\/[^)"']+)/g)) values.add(match[1]);
  return values;
}

function routeAssets(html) {
  const assets = dependencies(html);
  for (const match of html.matchAll(/<picture>[\s\S]*?<\/picture>/g)) {
    const picture = match[0];
    const pictureAssets = dependencies(picture);
    const source = picture.match(/srcset="([^"]+)"/);
    if (!source) continue;
    const candidates = source[1].split(",").map((candidate) => candidate.trim().split(/\s+/)[0]).filter((url) => url.startsWith("/build/"));
    for (const asset of pictureAssets) assets.delete(asset);
    if (candidates.length) assets.add(candidates[candidates.length - 1]);
  }
  for (const asset of [...assets]) {
    if (asset.endsWith(".css")) {
      for (const nested of dependencies(fs.readFileSync(path.join(publicRoot, asset), "utf8"))) assets.add(nested);
    }
  }
  return assets;
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(publicRoot, page));
  const buffers = [html, ...[...routeAssets(html.toString("utf8"))].map((asset) => fs.readFileSync(path.join(publicRoot, asset)))];
  const raw = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const gzip = buffers.reduce((sum, buffer) => sum + zlib.gzipSync(buffer, { level: 9 }).length, 0);
  const brotli = buffers.reduce((sum, buffer) => sum + zlib.brotliCompressSync(buffer, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length, 0);
  const limit = page.includes("pai-discovery") ? 700_000 : 450_000;
  if (brotli > limit) throw new Error(`${page} exceeds Brotli route budget: ${brotli} > ${limit}`);
  console.log(`${page}: raw ${Math.round(raw / 1024)} KB · gzip ${Math.round(gzip / 1024)} KB · Brotli ${Math.round(brotli / 1024)} KB`);
}

module.exports = { dependencies, routeAssets };
