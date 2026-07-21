const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

/*
  Canonical HTML + partials
          │
          ├── leaf assets → content hashes
          ├── CSS → rewritten leaf URLs → content hashes
          └── pages → includes + current route + manifest URLs
                                │
                                ▼
                     committed static public output
*/

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");
const PARTIALS = path.join(SRC, "partials");

const LEAF_ASSETS = [
  "scripts/site.js",
  "scripts/app.js",
  "assets/logo/sendlyr-wordmark-400.webp",
  "assets/logo/sendlyr-wordmark-400.png",
  "assets/logo/sendlyr-icon-512.png",
  "assets/og/og-default.png",
  "assets/og/og-default.svg",
  "assets/images/typesy-logo-colored-512.webp",
  "assets/images/typesy-logo-colored-2-scaled.png",
  "assets/icons/platforms/postgresql.svg",
  "assets/icons/platforms/sql-server.svg",
  "assets/icons/platforms/posthog.svg",
  "assets/icons/platforms/braze.png",
  "assets/icons/platforms/customerio.png",
  "assets/fonts/inter-latin-variable.woff2",
  "assets/fonts/source-serif-4-latin-variable.woff2",
  "assets/fonts/source-serif-4-latin-italic-variable.woff2",
  "assets/fonts/jetbrains-mono-latin-variable.woff2",
  "assets/blog/pai-discovery-case-study/cover-image-840.webp",
  "assets/blog/pai-discovery-case-study/cover-image-1680.webp",
  "assets/blog/pai-discovery-case-study/cover-image-840.png",
  "assets/blog/pai-discovery-case-study/cover-image.png",
];

const CSS_ASSETS = [
  "fonts.css",
  "home-fonts.css",
  "styles.css",
  "site.css",
  "enhance.css",
  "vertical.css",
  "workflow.css",
  "editorial.css",
];

function hashBuffer(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function listPages(directory) {
  const pages = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...listPages(full));
    if (entry.isFile() && entry.name === "index.html") pages.push(full);
  }
  return pages.sort();
}

function ensureInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing generated path outside ${parent}: ${candidate}`);
  }
}

function replaceManifestUrls(value, manifest) {
  const entries = Object.entries(manifest).sort((a, b) => b[0].length - a[0].length);
  if (!entries.length) return value;
  const pattern = new RegExp(entries.map(([source]) => source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
  return value.replace(pattern, (source) => manifest[source]);
}

function writeHashedAsset(outputRoot, relative, contents, manifest) {
  const extension = path.extname(relative);
  const stem = path.basename(relative, extension);
  const safeDirectory = path.dirname(relative).replaceAll(path.sep, "-").replaceAll(".", "");
  const prefix = safeDirectory && safeDirectory !== path.sep ? `${safeDirectory}-` : "";
  const filename = `${prefix}${stem}.${hashBuffer(contents)}${extension}`;
  const target = path.join(outputRoot, "build", filename);
  ensureInside(path.join(outputRoot, "build"), target);
  fs.writeFileSync(target, contents);
  manifest[`/${relative.split(path.sep).join("/")}`] = `/build/${filename}`;
}

function applyIncludes(html) {
  return html.replace(/\{\{>\s*([a-z0-9-]+)\s*\}\}/gi, (_, name) => {
    const partial = path.join(PARTIALS, `${name}.html`);
    if (!fs.existsSync(partial)) throw new Error(`Missing partial: ${name}`);
    return fs.readFileSync(partial, "utf8");
  });
}

function markCurrentRoute(html, currentPath) {
  return html.replace(/\sdata-nav-route="([^"]+)"/g, (match, route) => (
    route === currentPath ? ' aria-current="page"' : ""
  ));
}

function buildSite(outputRoot = PUBLIC) {
  const buildDirectory = path.join(outputRoot, "build");
  ensureInside(outputRoot, buildDirectory);
  fs.rmSync(buildDirectory, { recursive: true, force: true });
  fs.mkdirSync(buildDirectory, { recursive: true });

  const manifest = {};
  for (const relative of LEAF_ASSETS) {
    const source = path.join(PUBLIC, relative);
    if (!fs.existsSync(source)) throw new Error(`Missing build asset: ${relative}`);
    writeHashedAsset(outputRoot, relative, fs.readFileSync(source), manifest);
  }

  for (const relative of CSS_ASSETS) {
    const source = path.join(PUBLIC, relative);
    if (!fs.existsSync(source)) throw new Error(`Missing stylesheet: ${relative}`);
    const rewritten = replaceManifestUrls(fs.readFileSync(source, "utf8"), manifest);
    writeHashedAsset(outputRoot, relative, Buffer.from(rewritten), manifest);
  }

  const pagesRoot = path.join(SRC, "pages");
  const analyticsEnabled = process.env.ANALYTICS_ENABLED === "true" ? "true" : "false";
  for (const source of listPages(pagesRoot)) {
    const relative = path.relative(pagesRoot, source);
    const routeDirectory = path.dirname(relative) === "." ? "" : path.dirname(relative);
    const currentPath = routeDirectory ? `/${routeDirectory.split(path.sep).join("/")}` : "/";
    let html = fs.readFileSync(source, "utf8");
    html = applyIncludes(html);
    html = html.replaceAll("{{analytics_enabled}}", analyticsEnabled);
    html = markCurrentRoute(html, currentPath);
    html = replaceManifestUrls(html, manifest);
    const target = path.join(outputRoot, relative);
    ensureInside(outputRoot, target);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
  }

  fs.writeFileSync(path.join(buildDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return { manifest, outputRoot };
}

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else files.push(full);
  }
  return files.sort();
}

function checkGenerated() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "sendlyr-build-"));
  try {
    buildSite(temporary);
    const generated = [
      ...listFiles(path.join(temporary, "build")),
      ...listPages(temporary),
    ];
    const expectedPaths = new Set(generated.map((file) => path.relative(temporary, file)));
    const committedGenerated = [
      ...listFiles(path.join(PUBLIC, "build")),
      ...listPages(PUBLIC),
    ];
    const mismatches = [];
    for (const file of generated) {
      const relative = path.relative(temporary, file);
      const committed = path.join(PUBLIC, relative);
      if (!fs.existsSync(committed) || !fs.readFileSync(file).equals(fs.readFileSync(committed))) {
        mismatches.push(relative);
      }
    }
    for (const file of committedGenerated) {
      const relative = path.relative(PUBLIC, file);
      if (!expectedPaths.has(relative)) mismatches.push(`stale extra: ${relative}`);
    }
    if (mismatches.length) throw new Error(`Generated output is stale:\n${mismatches.join("\n")}`);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

if (require.main === module) {
  if (process.argv.includes("--check")) checkGenerated();
  else buildSite();
}

module.exports = {
  applyIncludes,
  buildSite,
  checkGenerated,
  hashBuffer,
  markCurrentRoute,
  replaceManifestUrls,
};
