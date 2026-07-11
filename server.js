const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleLeadSubmission } = require("./lib/lead-handler");
const { handleEventSubmission } = require("./lib/event-handler");
const { loadEnvFile } = require("./lib/env");

const root = path.join(__dirname, "public");
const rootWithSeparator = `${root}${path.sep}`;
const contentTypes = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".ico": "image/x-icon",
};

loadEnvFile();

function createServer() {
  return http.createServer((req, res) => {
    const pathname = req.url.split("?")[0];
    if (pathname === "/api/leads") { handleLeadSubmission(req, res); return; }
    if (pathname === "/api/events") { handleEventSubmission(req, res); return; }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.statusCode = 405; res.setHeader("Allow", "GET, HEAD, POST"); res.end("Method not allowed"); return;
    }
    let requestPath = pathname === "/" ? "/index.html" : pathname;
    if (!path.extname(requestPath)) requestPath = path.posix.join(requestPath, "index.html");
    let safePath;
    try { safePath = decodeURIComponent(requestPath).replace(/^[/\\]+/, ""); }
    catch { res.statusCode = 400; res.end("Bad request"); return; }
    const filePath = path.resolve(root, safePath);
    if (filePath !== root && !filePath.startsWith(rootWithSeparator)) { res.statusCode = 403; res.end("Forbidden"); return; }
    fs.readFile(filePath, (error, data) => {
      if (error) { res.statusCode = 404; res.setHeader("Content-Type", "text/plain; charset=utf-8"); res.end("Not found"); return; }
      const extension = path.extname(filePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader("Content-Type", contentTypes[extension] || "application/octet-stream");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      res.setHeader("Cache-Control", requestPath.startsWith("/build/") ? "public, max-age=31536000, immutable" : extension === ".html" ? "no-cache" : "public, max-age=3600");
      res.end(req.method === "HEAD" ? undefined : data);
    });
  });
}

function startServer({ host = process.env.HOST || "127.0.0.1", port = Number(process.env.PORT || 4173) } = {}) {
  const server = createServer();
  return server.listen(port, host, () => console.log(`Server running at http://${host}:${port}`));
}

if (require.main === module) startServer();

module.exports = { createServer, startServer };
