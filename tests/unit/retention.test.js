const assert = require("node:assert/strict");
const test = require("node:test");
const { dateRangeArgs, idsFilter, maintenanceOptions } = require("../../scripts/retention-utils");
const { markQualified, qualificationArgs } = require("../../scripts/mark-qualified-booking");
const { inRange, loadAnalytics, paginatedRows, readJsonLines } = require("../../scripts/analytics-io");
const { anonymize } = require("../../scripts/anonymize-attribution");
const { prune } = require("../../scripts/prune-analytics");
const { calendlyCollection } = require("../../scripts/sync-calendly-bookings");

test("retention writes are dry-run and production-confirmed", () => {
  assert.deepEqual(maintenanceOptions([], {}), { apply: false, confirmProduction: false, production: false });
  assert.throws(() => maintenanceOptions(["--apply"], { ANALYTICS_ENV: "production" }), /confirm-production/);
  assert.equal(maintenanceOptions(["--apply", "--confirm-production"], { ANALYTICS_ENV: "production" }).apply, true);
});

test("maintenance filters allow only exact safe identifiers", () => {
  assert.equal(idsFilter("event_id", ["one", "two-2"]), "event_id=in.(one,two-2)");
  assert.throws(() => idsFilter("bad.column", ["one"]), /Unsafe/);
  assert.throws(() => idsFilter("event_id", ["one),or.true"]), /Unsafe/);
});

test("aggregate ranges must be complete and ordered", () => {
  assert.deepEqual(dateRangeArgs(["--from=2026-07-01", "--to=2026-07-10"]), { from: "2026-07-01", to: "2026-07-10" });
  assert.throws(() => dateRangeArgs(["--from=2026-07-10", "--to=2026-07-01"]), /complete range/);
});

test("qualification accepts one exact ID and strict boolean", () => {
  assert.deepEqual(qualificationArgs(["invitee-1", "false", "Not ICP"]), { id: "invitee-1", value: false, reason: "Not ICP" });
  assert.throws(() => qualificationArgs(["invitee-1", "yes"]), /true or false/);
  assert.throws(() => qualificationArgs(["bad/id", "true"]), /Usage/);
});

test("analytics range filtering is end-exclusive", () => {
  assert.equal(inRange({ occurred_at: "2026-07-05T00:00:00Z" }, "occurred_at", "2026-07-01", "2026-07-10"), true);
  assert.equal(inRange({ occurred_at: "2026-07-10T00:00:00Z" }, "occurred_at", "2026-07-01", "2026-07-10"), false);
});

test("Supabase analytics reads every page", async () => {
  const previous = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, fetch: global.fetch };
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "server-secret";
  global.fetch = async (url) => {
    const offset = Number(new URL(url).searchParams.get("offset"));
    const rows = offset === 0 ? [{ id: 1 }, { id: 2 }] : [{ id: 3 }];
    return { ok: true, status: 200, json: async () => rows, text: async () => "" };
  };
  try { assert.deepEqual(await paginatedRows("events", "?select=*", 2), [{ id: 1 }, { id: 2 }, { id: 3 }]); }
  finally {
    global.fetch = previous.fetch;
    if (previous.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.url;
    if (previous.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.key;
  }
});

test("pagination fails closed at its page ceiling", async () => {
  const previous = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, fetch: global.fetch };
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "server-secret";
  global.fetch = async () => ({ ok: true, status: 200, json: async () => [{ id: 1 }], text: async () => "" });
  try { await assert.rejects(() => paginatedRows("events", "", 1, 1), /exceeded/); }
  finally {
    global.fetch = previous.fetch;
    if (previous.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.url;
    if (previous.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.key;
  }
});

test("local analytics loader handles absent files", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    assert.deepEqual(readJsonLines("/tmp/sendlyr-definitely-missing.jsonl"), []);
    assert.deepEqual(await loadAnalytics({ from: "2026-07-01", to: "2026-07-10" }), { events: [], bookings: [] });
  } finally {
    if (previousUrl !== undefined) process.env.SUPABASE_URL = previousUrl;
    if (previousKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});

test("qualification reads and updates exactly one booking", async () => {
  const previous = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, fetch: global.fetch };
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "server-secret";
  let calls = 0;
  global.fetch = async (_url, options) => { calls += 1; return { ok: true, status: 200, json: async () => [{ calendly_invitee_id: "invitee-1", qualified: options.method === "PATCH" }], text: async () => "" }; };
  try {
    const row = await markQualified({ id: "invitee-1", value: true, reason: "ICP" });
    assert.equal(row.qualified, true);
    assert.equal(calls, 2);
  } finally {
    global.fetch = previous.fetch;
    if (previous.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.url;
    if (previous.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.key;
  }
});

test("maintenance commands perform no writes by default", async () => {
  const previous = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, fetch: global.fetch };
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "server-secret";
  const methods = [];
  global.fetch = async (url, options) => {
    methods.push(options.method);
    const rows = url.includes("analytics_events") ? [{ event_id: "event-1", received_at: "2020-01-01T00:00:00Z" }] : url.includes("analytics_daily") ? [{ metric_date: "2020-01-01" }] : [];
    return { ok: true, status: 200, json: async () => rows, text: async () => "" };
  };
  try {
    assert.equal(await anonymize({ apply: false }), 1);
    assert.deepEqual(await prune({ apply: false }), { events: 1, bookings: 0 });
    assert.deepEqual(new Set(methods), new Set(["GET"]));
  } finally {
    global.fetch = previous.fetch;
    if (previous.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.url;
    if (previous.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.key;
  }
});

test("Calendly collection follows every pagination URL", async () => {
  const previousFetch = global.fetch;
  const previousToken = process.env.CALENDLY_PAT;
  process.env.CALENDLY_PAT = "token";
  let page = 0;
  global.fetch = async () => {
    page += 1;
    return { ok: true, json: async () => page === 1 ? { collection: [{ id: 1 }], pagination: { next_page: "https://api.calendly.com/page-2" } } : { collection: [{ id: 2 }], pagination: {} }, text: async () => "" };
  };
  try { assert.deepEqual(await calendlyCollection("/page-1"), [{ id: 1 }, { id: 2 }]); }
  finally { global.fetch = previousFetch; if (previousToken === undefined) delete process.env.CALENDLY_PAT; else process.env.CALENDLY_PAT = previousToken; }
});
