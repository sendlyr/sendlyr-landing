const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public");
const rootWithSeparator = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
const dataDir = path.join(__dirname, "data");
const leadsFile = path.join(dataDir, "leads.jsonl");
const host = "127.0.0.1";
const port = 4173;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function readBody(req, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > maxBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function cleanText(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function parseLead(body, contentType) {
  if (contentType.includes("application/json")) {
    return JSON.parse(body || "{}");
  }

  return Object.fromEntries(new URLSearchParams(body));
}

async function handleLeadSubmission(req, res) {
  try {
    const body = await readBody(req);
    const form = parseLead(body, req.headers["content-type"] || "");

    if (cleanText(form.fax_number)) {
      sendJson(res, 200, { ok: true });
      return;
    }

    const lead = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      submittedAt: new Date().toISOString(),
      name: cleanText(form.name, 120),
      email: cleanText(form.email, 180).toLowerCase(),
      company: cleanText(form.company, 160),
      productUrl: cleanText(form.productUrl, 240),
      message: cleanText(form.message, 1000),
      source: cleanText(form.source, 120),
      userAgent: cleanText(req.headers["user-agent"], 500),
      ip: req.socket.remoteAddress,
    };

    if (!lead.name || !lead.email || !lead.company) {
      sendJson(res, 400, { ok: false, message: "Name, email, and company are required." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      sendJson(res, 400, { ok: false, message: "Enter a valid email address." });
      return;
    }

    fs.mkdirSync(dataDir, { recursive: true });
    fs.appendFileSync(leadsFile, `${JSON.stringify(lead)}\n`, "utf8");

    sendJson(res, 201, { ok: true, message: "Thanks. We received your demo request." });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: "Unable to save your request right now." });
  }
}

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

    const requestPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
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
