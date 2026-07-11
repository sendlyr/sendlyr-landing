const { loadEnvFile } = require("../lib/env");
const { requestRows } = require("../lib/supabase-rest");

loadEnvFile();

function qualificationArgs(args = process.argv.slice(2)) {
  const [id, rawValue = "true", reason = "operator review"] = args;
  if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) throw new Error("Usage: npm run analytics:mark-qualified -- <invitee-id> [true|false] [reason]");
  if (!["true", "false"].includes(rawValue)) throw new Error("Qualification value must be true or false.");
  return { id, value: rawValue === "true", reason: String(reason).slice(0, 240) };
}

async function markQualified({ id, value, reason } = qualificationArgs()) {
  const table = process.env.SUPABASE_BOOKINGS_TABLE || "analytics_bookings";
  const exact = `?calendly_invitee_id=eq.${encodeURIComponent(id)}`;
  const matches = await requestRows(table, `${exact}&select=calendly_invitee_id`);
  if (matches.length !== 1) throw new Error(`Expected one booking, found ${matches.length}.`);
  const rows = await requestRows(table, exact, { method: "PATCH", body: { qualified: value, qualified_at: new Date().toISOString(), qualified_by: process.env.ANALYTICS_OPERATOR_ID || "local-operator", qualification_reason: reason } });
  if (rows.length !== 1) throw new Error(`Expected one updated booking, found ${rows.length}.`);
  console.log("Updated 1 booking.");
  return rows[0];
}

if (require.main === module) markQualified().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { markQualified, qualificationArgs };
