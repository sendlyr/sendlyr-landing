const { loadEnvFile } = require("../lib/env");
const { requestRows } = require("../lib/supabase-rest");
const { idsFilter, maintenanceOptions } = require("./retention-utils");

loadEnvFile();

async function anonymize({ apply } = maintenanceOptions()) {
  const table = process.env.SUPABASE_EVENTS_TABLE || "analytics_events";
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
  let total = 0;
  do {
    const candidates = await requestRows(table, `?select=event_id&received_at=lt.${encodeURIComponent(cutoff)}&session_id=neq.expired&order=received_at.asc&limit=500`);
    if (!candidates.length) break;
    total += candidates.length;
    if (!apply) break;
    const filter = idsFilter("event_id", candidates.map((row) => row.event_id));
    await requestRows(table, `?${filter}`, { method: "PATCH", body: { session_id: "expired", page_id: "expired", referrer_host: "" } });
  } while (apply);
  console.log(`${apply ? "Anonymized" : "Dry run found at least"} ${total} event(s).${apply ? "" : " Re-run with --apply."}`);
  return total;
}

if (require.main === module) anonymize().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { anonymize };
