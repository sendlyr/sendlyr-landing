function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function readBody(req, maxBytes = 64_000) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(Object.assign(new Error("Request body too large"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function cleanText(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

async function getRequestBody(req, maxBytes) {
  return req.body ?? readBody(req, maxBytes);
}

function parseBody(body, contentType = "") {
  if (Buffer.isBuffer(body)) body = body.toString("utf8");
  if (typeof body === "object" && body !== null) return body;
  if (contentType.includes("application/json")) return JSON.parse(body || "{}");
  return Object.fromEntries(new URLSearchParams(body || ""));
}

module.exports = { cleanText, getRequestBody, parseBody, readBody, sendJson };
