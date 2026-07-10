const assert = require("node:assert/strict");
const test = require("node:test");
const { getSupabaseConfig, insertRows, requestRows } = require("../../lib/supabase-rest");

function withEnv(values, callback) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.assign(process.env, values);
  return Promise.resolve(callback()).finally(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
}

test("Supabase configuration rejects browser keys", async () => {
  await withEnv({ SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "sb_publishable_bad" }, () => {
    assert.throws(() => getSupabaseConfig(), /secret/);
  });
});

test("Supabase inserts are disabled without server configuration", async () => {
  await withEnv({ SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "" }, async () => {
    assert.equal(await insertRows("events", {}), false);
    await assert.rejects(() => requestRows("events"), /required/);
  });
});

test("Supabase helpers send server-authenticated REST requests", async () => {
  await withEnv({ SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "server-secret" }, async () => {
    const previousFetch = global.fetch;
    const calls = [];
    global.fetch = async (url, options) => { calls.push({ url, options }); return { ok: true, status: options.method === "POST" ? 201 : 200, json: async () => [{ ok: true }], text: async () => "" }; };
    try {
      assert.equal(await insertRows("events", { id: 1 }, { onConflict: "id", upsert: true }), true);
      assert.deepEqual(await requestRows("events", "?select=*"), [{ ok: true }]);
      assert.match(calls[0].url, /on_conflict=id/);
      assert.match(calls[0].options.headers.Prefer, /merge-duplicates/);
    } finally { global.fetch = previousFetch; }
  });
});
