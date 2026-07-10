const { buildFunnel } = require("../lib/analytics-stats");
const { loadAnalytics } = require("./analytics-io");

(async () => {
  const { events, bookings } = await loadAnalytics();
  console.log(JSON.stringify({ generated_at: new Date().toISOString(), funnel: buildFunnel(events, bookings) }, null, 2));
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
