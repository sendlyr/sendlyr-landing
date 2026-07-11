const crypto = require("crypto");
const { loadEnvFile } = require("../lib/env");
const { requestRows } = require("../lib/supabase-rest");

loadEnvFile();

const routes = ["/", "/how-it-works", "/for/fitness-apps", "/for/cooking-apps", "/for/edtech-apps", "/blog", "/blog/pai-discovery-case-study", "/privacy", "/robots.txt", "/sitemap.xml"];

(async () => {
  const base = String(process.env.PRODUCTION_URL || "").replace(/\/$/, "");
  if (!base) throw new Error("Set PRODUCTION_URL before running this check.");
  if (process.env.PRODUCTION_WAF_VERIFIED !== "true") throw new Error("Set PRODUCTION_WAF_VERIFIED=true after checking the platform rate-limit rule.");
  if (!process.env.SUPABASE_URL || !(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)) throw new Error("Server credentials are required to verify and remove the smoke event.");
  for (const route of routes) {
    const response = await fetch(`${base}${route}`, { redirect: "manual" });
    if (!response.ok) throw new Error(`${route} returned ${response.status}`);
    if (!response.headers.get("x-content-type-options")) throw new Error(`${route} is missing security headers`);
    console.log(`${response.status} ${route}`);
  }
  const eventId = `smoke-${crypto.randomUUID()}`;
  const payload = { event_id: eventId, event_name: "page_view", session_id: `smoke-${crypto.randomUUID()}`, page_id: `smoke-${crypto.randomUUID()}`, path: "/", referrer_host: "", properties: { title: "Production smoke" }, occurred_at: new Date().toISOString() };
  const response = await fetch(`${base}/api/events`, { method: "POST", headers: { "Content-Type": "application/json", Origin: base }, body: JSON.stringify(payload) });
  const result = await response.json();
  if (response.status !== 202 || result.stored !== true) throw new Error(`/api/events did not store the smoke event: ${response.status} ${JSON.stringify(result)}`);
  const table = process.env.SUPABASE_EVENTS_TABLE || "analytics_events";
  const stored = await requestRows(table, `?event_id=eq.${encodeURIComponent(eventId)}&select=event_id`);
  if (stored.length !== 1) throw new Error("Smoke event was not found in server storage.");
  await requestRows(table, `?event_id=eq.${encodeURIComponent(eventId)}`, { method: "DELETE" });
  console.log(`Production smoke passed for ${base}; the smoke event was removed.`);
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
