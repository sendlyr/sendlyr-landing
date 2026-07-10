const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { applyIncludes, buildSite, hashBuffer, markCurrentRoute, replaceManifestUrls } = require("../../scripts/build-site");

test("hashes and replaces deterministic asset references", () => {
  assert.equal(hashBuffer("sendlyr"), hashBuffer(Buffer.from("sendlyr")));
  assert.equal(replaceManifestUrls("/a.css /a", { "/a.css": "/build/a.1.css", "/a": "/build/a.1" }), "/build/a.1.css /build/a.1");
});

test("renders shared includes and current navigation", () => {
  const included = applyIncludes("{{> site-footer}}");
  assert.match(included, /site-footer/);
  assert.match(markCurrentRoute('<a data-nav-route="/blog">Blog</a>', "/blog"), /aria-current="page"/);
});

test("build renders eight routes with hashed assets", () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "sendlyr-test-build-"));
  try {
    const { manifest } = buildSite(output);
    assert.ok(Object.keys(manifest).length >= 20);
    for (const route of ["index.html", "how-it-works/index.html", "for/fitness-apps/index.html", "for/cooking-apps/index.html", "for/edtech-apps/index.html", "blog/index.html", "blog/pai-discovery-case-study/index.html", "privacy/index.html"]) {
      const html = fs.readFileSync(path.join(output, route), "utf8");
      assert.match(html, /\/build\//);
      assert.doesNotMatch(html, /\{\{/);
      assert.match(html, /data-analytics-enabled="false"/);
    }
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});
