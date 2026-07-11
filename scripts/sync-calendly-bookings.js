const fs = require("fs");
const path = require("path");
const { loadEnvFile } = require("../lib/env");
const { bookingFromCalendly } = require("../lib/booking-utils");
const { insertRows } = require("../lib/supabase-rest");

loadEnvFile();

async function calendly(urlOrPath) {
  const url = urlOrPath.startsWith("http") ? urlOrPath : `https://api.calendly.com${urlOrPath}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${process.env.CALENDLY_PAT}` } });
  if (!response.ok) throw new Error(`Calendly request failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function calendlyCollection(pathname, maxPages = 100) {
  const rows = [];
  let next = pathname;
  for (let page = 0; next && page < maxPages; page += 1) {
    const result = await calendly(next);
    rows.push(...(result.collection || []));
    next = result.pagination?.next_page;
  }
  if (next) throw new Error(`Calendly pagination exceeded ${maxPages} pages.`);
  return rows;
}

async function syncBookings() {
  if (!process.env.CALENDLY_PAT || !process.env.CALENDLY_ORGANIZATION_URI) throw new Error("CALENDLY_PAT and CALENDLY_ORGANIZATION_URI are required.");
  const organization = encodeURIComponent(process.env.CALENDLY_ORGANIZATION_URI);
  const since = new Date(Date.now() - 90 * 86400000).toISOString();
  const events = await calendlyCollection(`/scheduled_events?organization=${organization}&min_start_time=${encodeURIComponent(since)}&count=100`);
  const bookings = [];
  for (const event of events) {
    const invitees = await calendlyCollection(`/scheduled_events/${event.uri.split("/").pop()}/invitees?count=100`);
    for (const invitee of invitees) {
      const booking = bookingFromCalendly(event, invitee);
      if (booking.attribution_id && booking.calendly_invitee_id) bookings.push(booking);
    }
  }
  if (!bookings.length) { console.log("No attributed bookings found."); return; }
  const saved = await insertRows(process.env.SUPABASE_BOOKINGS_TABLE || "analytics_bookings", bookings, { onConflict: "calendly_invitee_id", upsert: true });
  if (!saved) {
    const target = path.join(__dirname, "..", "data", "bookings.jsonl");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const existing = fs.existsSync(target) ? fs.readFileSync(target, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)) : [];
    const merged = new Map(existing.map((booking) => [booking.calendly_invitee_id, booking]));
    for (const booking of bookings) merged.set(booking.calendly_invitee_id, { ...merged.get(booking.calendly_invitee_id), ...booking });
    fs.writeFileSync(target, [...merged.values()].map((booking) => JSON.stringify(booking)).join("\n") + "\n");
    fs.writeFileSync(path.join(__dirname, "..", "data", "analytics-sync.json"), JSON.stringify({ source: "calendly", last_success_at: new Date().toISOString(), booking_count: bookings.length }, null, 2));
  } else {
    const now = new Date().toISOString();
    await insertRows(process.env.SUPABASE_SYNC_STATE_TABLE || "analytics_sync_state", { source: "calendly", last_success_at: now, booking_count: bookings.length, updated_at: now }, { onConflict: "source", upsert: true });
  }
  console.log(`Synced ${bookings.length} attributed bookings.`);
  return bookings.length;
}

if (require.main === module) syncBookings().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { calendly, calendlyCollection, syncBookings };
