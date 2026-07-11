const { groupDaily } = require("../lib/analytics-stats");
const { insertRows } = require("../lib/supabase-rest");
const { loadAnalytics } = require("./analytics-io");
const { dateRangeArgs } = require("./retention-utils");

(async () => {
  const range = dateRangeArgs();
  const { events } = await loadAnalytics(range);
  const rows = groupDaily(events);
  if (!rows.length) { console.log("No analytics to aggregate."); return; }
  const saved = await insertRows(process.env.SUPABASE_AGGREGATES_TABLE || "analytics_daily", rows, { onConflict: "metric_date,event_name,path", upsert: true });
  console.log(saved ? `Inserted ${rows.length} aggregate row(s).` : JSON.stringify(rows, null, 2));
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
