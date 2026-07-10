const { cleanText } = require("./http-utils");

function getSupabaseConfig() {
  const url = cleanText(process.env.SUPABASE_URL).replace(/\/$/, "");
  const key = cleanText(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);
  if (key.startsWith("sb_publishable_")) throw new Error("Use a secret/service-role Supabase key on the server.");
  return { url, key };
}

async function insertRows(table, rows, options = {}) {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return false;
  const conflict = options.onConflict ? `?on_conflict=${encodeURIComponent(options.onConflict)}` : "";
  const prefer = ["return=minimal", options.upsert ? "resolution=merge-duplicates" : ""].filter(Boolean).join(",");
  const response = await fetch(`${url}/rest/v1/${encodeURIComponent(table)}${conflict}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: prefer },
    body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error(`Supabase insert failed: ${response.status} ${await response.text()}`);
  return true;
}

async function requestRows(table, query = "", options = {}) {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) throw new Error("Supabase server credentials are required.");
  const response = await fetch(`${url}/rest/v1/${encodeURIComponent(table)}${query}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: options.prefer || "return=representation" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  return response.status === 204 ? [] : response.json();
}

module.exports = { getSupabaseConfig, insertRows, requestRows };
