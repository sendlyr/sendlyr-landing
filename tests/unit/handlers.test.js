const assert = require("node:assert/strict");
const test = require("node:test");
const { buildLead, getPublicErrorMessage, validateLead } = require("../../lib/lead-handler");
const { buildEvent, handleEventSubmission, hashAddress, isAllowedOrigin, validateEvent } = require("../../lib/event-handler");

function responseCapture() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(body) { this.body = body; } };
}

test("lead builder normalizes fields and validates email", () => {
  const request = { headers: { "user-agent": "Browser", "x-forwarded-for": "127.0.0.1, proxy" }, socket: {} };
  const lead = buildLead({ name: " Ada ", email: "ADA@EXAMPLE.COM ", company: " Sendlyr ", productUrl: "https://example.com" }, request);
  assert.equal(lead.email, "ada@example.com");
  assert.equal(lead.ip, "127.0.0.1");
  assert.equal(validateLead(lead), "");
  assert.match(validateLead({ name: "", email: "bad", company: "" }), /required/);
  assert.match(validateLead({ name: "Ada", email: "bad", company: "Sendlyr" }), /valid email/);
});

test("lead errors do not expose internal details", () => {
  assert.match(getPublicErrorMessage(new Error("Supabase insert failed: 401 secret")), /rejected/);
  assert.match(getPublicErrorMessage(new Error("fetch failed")), /reached/);
  assert.match(getPublicErrorMessage(new Error("unknown")), /Unable/);
});

test("event builder permits only the public taxonomy", () => {
  const event = buildEvent({ event_id: "e1", event_name: "page_view", session_id: "s1", page_id: "p1", path: "/", occurred_at: new Date().toISOString(), properties: { title: "Home" } });
  assert.equal(validateEvent(event), "");
  assert.match(validateEvent({ ...event, event_name: "email_captured" }), /Unknown/);
  assert.match(validateEvent({ ...event, session_id: "" }), /identifiers/);
  assert.match(validateEvent({ ...event, path: "https://bad" }), /path/);
  assert.match(validateEvent({ ...event, occurred_at: "never" }), /time/);
  assert.match(validateEvent({ ...event, properties: { email: "nope" } }), /properties/);
  assert.match(validateEvent({ ...event, event_name: "cohort_toggle", properties: { state: "maybe" } }), /state/);
  assert.equal(validateEvent({ ...event, event_name: "decision_loop_step", properties: { step: "learn" } }), "");
  assert.equal(validateEvent({ ...event, event_name: "decision_trace_change", properties: { state: "at_risk" } }), "");
  assert.equal(validateEvent({ ...event, event_name: "journey_archetype_change", properties: { archetype: "goal_driven_novice" } }), "");
  assert.equal(validateEvent({ ...event, event_name: "delivery_path_change", properties: { path: "existing_lifecycle_stack" } }), "");
  assert.match(validateEvent({ ...event, event_name: "decision_loop_step", properties: { step: "unknown" } }), /loop/);
  assert.match(validateEvent({ ...event, event_name: "decision_trace_change", properties: { state: "unknown" } }), /trace/);
  assert.match(validateEvent({ ...event, event_name: "journey_archetype_change", properties: { archetype: "demographic_label" } }), /archetype/);
  assert.match(validateEvent({ ...event, event_name: "delivery_path_change", properties: { path: "replacement_platform" } }), /delivery/);
  assert.match(validateEvent({ ...event, event_name: "book_sprint_click", properties: { placement: "hero", attribution_id: "bad value" } }), /attribution/);
});

test("event origins are restricted", () => {
  assert.equal(isAllowedOrigin({ headers: {} }), true);
  assert.equal(isAllowedOrigin({ headers: { origin: "http://127.0.0.1:4173" } }), true);
  assert.equal(isAllowedOrigin({ headers: { origin: "https://untrusted.example" } }), false);
});

test("event ingestion stays inert while disabled", async () => {
  const previous = process.env.ANALYTICS_ENABLED;
  process.env.ANALYTICS_ENABLED = "false";
  const res = responseCapture();
  await handleEventSubmission({ method: "POST", headers: {}, body: {} }, res);
  assert.equal(res.statusCode, 202);
  assert.deepEqual(JSON.parse(res.body), { ok: true, stored: false });
  if (previous === undefined) delete process.env.ANALYTICS_ENABLED; else process.env.ANALYTICS_ENABLED = previous;
});

test("enabled ingestion requires a strong server secret", async () => {
  const previousEnabled = process.env.ANALYTICS_ENABLED;
  const previousSecret = process.env.ANALYTICS_ID_SECRET;
  process.env.ANALYTICS_ENABLED = "true";
  process.env.ANALYTICS_ID_SECRET = "short";
  const res = responseCapture();
  await handleEventSubmission({ method: "POST", headers: { "content-type": "application/json" }, body: {} }, res);
  assert.equal(res.statusCode, 503);
  assert.throws(() => hashAddress({ headers: {}, socket: {} }), /32 bytes/);
  if (previousEnabled === undefined) delete process.env.ANALYTICS_ENABLED; else process.env.ANALYTICS_ENABLED = previousEnabled;
  if (previousSecret === undefined) delete process.env.ANALYTICS_ID_SECRET; else process.env.ANALYTICS_ID_SECRET = previousSecret;
});

test("enabled ingestion stores a valid allowlisted event", async () => {
  const keys = ["ANALYTICS_ENABLED", "ANALYTICS_ID_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  Object.assign(process.env, { ANALYTICS_ENABLED: "true", ANALYTICS_ID_SECRET: "12345678901234567890123456789012", SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "server-secret" });
  const previousFetch = global.fetch;
  global.fetch = async () => ({ ok: true, status: 201, text: async () => "" });
  try {
    const res = responseCapture();
    await handleEventSubmission({ method: "POST", headers: { "content-type": "application/json", origin: "http://127.0.0.1:4173" }, socket: { remoteAddress: "127.0.0.1" }, body: { event_id: "e-valid", event_name: "page_view", session_id: "s-valid", page_id: "p-valid", path: "/", occurred_at: new Date().toISOString(), properties: { title: "Home" } } }, res);
    assert.equal(res.statusCode, 202);
    assert.equal(JSON.parse(res.body).stored, true);
  } finally {
    global.fetch = previousFetch;
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test("enabled ingestion rejects unsafe transport before storage", async () => {
  const previousEnabled = process.env.ANALYTICS_ENABLED;
  const previousSecret = process.env.ANALYTICS_ID_SECRET;
  process.env.ANALYTICS_ENABLED = "true";
  process.env.ANALYTICS_ID_SECRET = "12345678901234567890123456789012";
  try {
    const wrongMethod = responseCapture();
    await handleEventSubmission({ method: "GET", headers: {} }, wrongMethod);
    assert.equal(wrongMethod.statusCode, 405);
    const wrongOrigin = responseCapture();
    await handleEventSubmission({ method: "POST", headers: { origin: "https://bad.example", "content-type": "application/json" }, socket: {} }, wrongOrigin);
    assert.equal(wrongOrigin.statusCode, 403);
    const wrongType = responseCapture();
    await handleEventSubmission({ method: "POST", headers: { origin: "http://127.0.0.1:4173", "content-type": "text/plain" }, socket: {} }, wrongType);
    assert.equal(wrongType.statusCode, 415);
    const tooLarge = responseCapture();
    await handleEventSubmission({ method: "POST", headers: { origin: "http://127.0.0.1:4173", "content-type": "application/json" }, socket: {}, body: { payload: "x".repeat(5000) } }, tooLarge);
    assert.equal(tooLarge.statusCode, 413);
  } finally {
    if (previousEnabled === undefined) delete process.env.ANALYTICS_ENABLED; else process.env.ANALYTICS_ENABLED = previousEnabled;
    if (previousSecret === undefined) delete process.env.ANALYTICS_ID_SECRET; else process.env.ANALYTICS_ID_SECRET = previousSecret;
  }
});
