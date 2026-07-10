const { loadEnvFile } = require("../lib/env");
const { requestRows } = require("../lib/supabase-rest");
const { idsFilter, maintenanceOptions } = require("./retention-utils");

loadEnvFile();

async function verifyDays(rows) {
  const dates = [...new Set(rows.map((row) => String(row.received_at).slice(0, 10)))];
  if (!dates.length) return;
  const filter = dates.map((date) => `"${date}"`).join(",");
  const aggregates = await requestRows(process.env.SUPABASE_AGGREGATES_TABLE || "analytics_daily", `?select=metric_date&metric_date=in.(${encodeURIComponent(filter)})`);
  const verified = new Set(aggregates.map((row) => row.metric_date));
  const missing = dates.filter((date) => !verified.has(date));
  if (missing.length) throw new Error(`Refusing to prune unverified aggregate days: ${missing.join(", ")}`);
}

async function pruneTable({ table, idColumn, timeColumn, cutoff, apply, verify = false }) {
  let total = 0;
  do {
    const rows = await requestRows(table, `?select=${idColumn},${timeColumn}&${timeColumn}=lt.${encodeURIComponent(cutoff)}&order=${timeColumn}.asc&limit=500`);
    if (!rows.length) break;
    if (verify) await verifyDays(rows);
    total += rows.length;
    if (!apply) break;
    await requestRows(table, `?${idsFilter(idColumn, rows.map((row) => row[idColumn]))}`, { method: "DELETE" });
  } while (apply);
  return total;
}

async function prune({ apply } = maintenanceOptions()) {
  const rawCutoff = new Date(Date.now() - 90 * 86400000).toISOString();
  const bookingCutoff = new Date(Date.now() - 395 * 86400000).toISOString();
  const events = await pruneTable({ table: process.env.SUPABASE_EVENTS_TABLE || "analytics_events", idColumn: "event_id", timeColumn: "received_at", cutoff: rawCutoff, apply, verify: true });
  const bookings = await pruneTable({ table: process.env.SUPABASE_BOOKINGS_TABLE || "analytics_bookings", idColumn: "calendly_invitee_id", timeColumn: "scheduled_at", cutoff: bookingCutoff, apply });
  console.log(`${apply ? "Pruned" : "Dry run found at least"} ${events} raw event(s) and ${bookings} booking(s).${apply ? " Aggregates were retained." : " Re-run with --apply."}`);
  return { events, bookings };
}

if (require.main === module) prune().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { prune, pruneTable, verifyDays };
