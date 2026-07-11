const fs = require("fs");
const path = require("path");
const { loadEnvFile } = require("../lib/env");
const { requestRows } = require("../lib/supabase-rest");

loadEnvFile();

function readJsonLines(filename) {
  if (!fs.existsSync(filename)) return [];
  return fs.readFileSync(filename, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

async function paginatedRows(table, query, pageSize = 1000, maxPages = 10000) {
  const rows = [];
  for (let page = 0; page < maxPages; page += 1) {
    const separator = query.includes("?") ? "&" : "?";
    const batch = await requestRows(table, `${query}${separator}limit=${pageSize}&offset=${page * pageSize}`);
    rows.push(...batch);
    if (batch.length < pageSize) return rows;
  }
  throw new Error(`Supabase pagination exceeded ${maxPages} pages.`);
}

function inRange(row, field, from, to) {
  const value = String(row[field] || "").slice(0, 10);
  return (!from || value >= from) && (!to || value < to);
}

async function loadAnalytics({ from, to } = {}) {
  if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)) {
    const eventRange = `${from ? `&occurred_at=gte.${encodeURIComponent(from)}` : ""}${to ? `&occurred_at=lt.${encodeURIComponent(to)}` : ""}`;
    const bookingRange = `${from ? `&scheduled_at=gte.${encodeURIComponent(from)}` : ""}${to ? `&scheduled_at=lt.${encodeURIComponent(to)}` : ""}`;
    const [events, bookings] = await Promise.all([
      paginatedRows(process.env.SUPABASE_EVENTS_TABLE || "analytics_events", `?select=*&order=occurred_at.asc${eventRange}`),
      paginatedRows(process.env.SUPABASE_BOOKINGS_TABLE || "analytics_bookings", `?select=*&order=scheduled_at.asc${bookingRange}`),
    ]);
    return { events, bookings };
  }
  const root = path.join(__dirname, "..", "data");
  return {
    events: readJsonLines(path.join(root, "events.jsonl")).filter((row) => inRange(row, "occurred_at", from, to)),
    bookings: readJsonLines(path.join(root, "bookings.jsonl")).filter((row) => inRange(row, "scheduled_at", from, to)),
  };
}

module.exports = { inRange, loadAnalytics, paginatedRows, readJsonLines };
