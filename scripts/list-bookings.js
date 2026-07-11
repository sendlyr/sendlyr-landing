const { loadAnalytics } = require("./analytics-io");

(async () => {
  const { bookings } = await loadAnalytics();
  console.table(bookings.map(({ calendly_invitee_id, attribution_id, scheduled_at, status, qualified }) => ({ id: calendly_invitee_id, attribution_id, scheduled_at, status, qualified })));
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
