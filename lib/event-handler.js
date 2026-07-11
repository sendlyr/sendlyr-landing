const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { cleanText, getRequestBody, parseBody, sendJson } = require("./http-utils");
const { insertRows } = require("./supabase-rest");

const allowedEvents = new Set(["page_view", "navigation_click", "workflow_open", "case_study_open", "book_sprint_click", "cohort_toggle", "proof_tab_change"]);
const allowedPaths = new Set(["/", "/how-it-works", "/for/fitness-apps", "/for/cooking-apps", "/for/edtech-apps", "/blog", "/blog/pai-discovery-case-study", "/privacy"]);
const propertySchemas = {
  page_view: new Set(["title"]),
  navigation_click: new Set(["href", "placement"]),
  workflow_open: new Set(["href"]),
  case_study_open: new Set(["href"]),
  book_sprint_click: new Set(["placement", "attribution_id"]),
  cohort_toggle: new Set(["state"]),
  proof_tab_change: new Set(["tab"]),
};
const eventsFile = path.join(__dirname, "..", "data", "events.jsonl");
const requestBuckets = new Map();

function hashAddress(req) {
  const secret = cleanText(process.env.ANALYTICS_ID_SECRET, 500);
  if (Buffer.byteLength(secret) < 32) throw new Error("ANALYTICS_ID_SECRET must contain at least 32 bytes.");
  const address = cleanText(req.headers["x-forwarded-for"], 120).split(",")[0] || cleanText(req.socket?.remoteAddress, 120);
  return crypto.createHmac("sha256", secret).update(address).digest("hex").slice(0, 16);
}

function isAllowedOrigin(req) {
  const origin = cleanText(req.headers.origin, 300);
  if (!origin) return !process.env.VERCEL;
  const defaults = ["http://127.0.0.1:4173", "http://localhost:4173", "https://sendlyr.com", "https://www.sendlyr.com"];
  const allowed = cleanText(process.env.ANALYTICS_ALLOWED_ORIGINS, 2000).split(",").map((value) => value.trim()).filter(Boolean);
  return [...defaults, ...allowed].includes(origin);
}

function withinRateLimit(req, now = Date.now()) {
  const key = hashAddress(req);
  const bucket = requestBuckets.get(key) || { started: now, count: 0 };
  if (now - bucket.started > 60_000) { bucket.started = now; bucket.count = 0; }
  bucket.count += 1;
  requestBuckets.set(key, bucket);
  if (requestBuckets.size > 2000) requestBuckets.clear();
  return bucket.count <= 120;
}

function buildEvent(form) {
  const properties = {};
  if (form.properties && typeof form.properties === "object" && !Array.isArray(form.properties)) {
    for (const [key, value] of Object.entries(form.properties).slice(0, 12)) properties[cleanText(key, 40)] = cleanText(value, 160);
  }
  return {
    event_id: cleanText(form.event_id, 80),
    event_name: cleanText(form.event_name, 60),
    session_id: cleanText(form.session_id, 80),
    page_id: cleanText(form.page_id, 80),
    path: cleanText(form.path, 240),
    referrer_host: cleanText(form.referrer_host, 180),
    properties,
    occurred_at: cleanText(form.occurred_at, 40) || new Date().toISOString(),
    received_at: new Date().toISOString(),
  };
}

function validateEvent(event) {
  if (!allowedEvents.has(event.event_name)) return "Unknown event.";
  if (!event.event_id || !event.session_id || !event.page_id) return "Event identifiers are required.";
  for (const identifier of [event.event_id, event.session_id, event.page_id]) {
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(identifier)) return "Invalid event identifier.";
  }
  if (!allowedPaths.has(event.path)) return "Invalid event path.";
  const occurred = Date.parse(event.occurred_at);
  if (!Number.isFinite(occurred) || occurred < Date.now() - 86_400_000 || occurred > Date.now() + 300_000) return "Invalid event time.";
  const allowedProperties = propertySchemas[event.event_name];
  if (Object.keys(event.properties).some((key) => !allowedProperties.has(key))) return "Invalid event properties.";
  if (event.event_name === "cohort_toggle" && !["open", "closed"].includes(event.properties.state)) return "Invalid event state.";
  if (event.event_name === "proof_tab_change" && !["Discover", "Validate", "Operate"].includes(event.properties.tab)) return "Invalid tab state.";
  if (event.event_name === "book_sprint_click" && !/^[a-zA-Z0-9-]{1,80}$/.test(event.properties.attribution_id || "")) return "Invalid attribution identifier.";
  if (event.properties.href && !allowedPaths.has(event.properties.href)) return "Invalid event destination.";
  if (event.properties.placement && !/^[a-zA-Z0-9-]{1,40}$/.test(event.properties.placement)) return "Invalid event placement.";
  return "";
}

function saveEventLocally(event) {
  fs.mkdirSync(path.dirname(eventsFile), { recursive: true });
  fs.appendFileSync(eventsFile, `${JSON.stringify(event)}\n`, "utf8");
}

async function handleEventSubmission(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
    return;
  }
  if (process.env.ANALYTICS_ENABLED !== "true") {
    sendJson(res, 202, { ok: true, stored: false });
    return;
  }
  if (Buffer.byteLength(cleanText(process.env.ANALYTICS_ID_SECRET, 500)) < 32) {
    sendJson(res, 503, { ok: false, message: "Analytics storage is not ready." });
    return;
  }
  if (!isAllowedOrigin(req)) { sendJson(res, 403, { ok: false, message: "Origin not allowed" }); return; }
  if (!withinRateLimit(req)) { sendJson(res, 429, { ok: false, message: "Rate limit exceeded" }); return; }
  if (!(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    sendJson(res, 415, { ok: false, message: "JSON content type required." });
    return;
  }
  try {
    const rawBody = await getRequestBody(req, 4_096);
    const measured = typeof rawBody === "string" || Buffer.isBuffer(rawBody) ? Buffer.byteLength(rawBody) : Buffer.byteLength(JSON.stringify(rawBody || {}));
    if (measured > 4_096) {
      sendJson(res, 413, { ok: false, message: "Request body too large." });
      return;
    }
    const event = buildEvent(parseBody(rawBody, req.headers["content-type"] || ""));
    const error = validateEvent(event);
    if (error) { sendJson(res, 400, { ok: false, message: error }); return; }
    const saved = await insertRows(process.env.SUPABASE_EVENTS_TABLE || "analytics_events", event);
    if (!saved && !process.env.VERCEL) saveEventLocally(event);
    if (!saved && process.env.VERCEL) throw new Error("Analytics storage is not configured.");
    sendJson(res, 202, { ok: true, stored: true });
  } catch (error) {
    if (String(error?.message).includes("Supabase insert failed: 409")) {
      sendJson(res, 202, { ok: true, stored: true, duplicate: true });
      return;
    }
    console.error(error);
    sendJson(res, error.statusCode || 500, { ok: false, message: "Unable to store this event." });
  }
}

module.exports = { allowedEvents, allowedPaths, buildEvent, handleEventSubmission, hashAddress, isAllowedOrigin, propertySchemas, validateEvent, withinRateLimit };
