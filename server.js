const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleLeadSubmission, loadEnvFile } = require("./lib/lead-handler");

const root = path.join(__dirname, "public");
const rootWithSeparator = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
const host = "127.0.0.1";
const port = 4173;

loadEnvFile();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url.split("?")[0] === "/api/leads") {
      handleLeadSubmission(req, res);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.statusCode = 405;
      res.setHeader("Allow", "GET, HEAD, POST");
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Method not allowed");
      return;
    }

    let requestPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    if (!path.extname(requestPath)) {
      requestPath = path.posix.join(requestPath, "index.html");
    }
    const safePath = decodeURIComponent(requestPath).replace(/^[/\\]+/, "");
    const filePath = path.resolve(root, safePath);

    if (filePath !== root && !filePath.startsWith(rootWithSeparator)) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
      res.end(req.method === "HEAD" ? undefined : data);
    });
  })
  .listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
