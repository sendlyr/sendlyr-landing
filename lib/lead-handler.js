const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const leadsFile = path.join(dataDir, "leads.jsonl");

function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function readBody(req, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > maxBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function cleanText(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function parseLead(body, contentType) {
  if (Buffer.isBuffer(body)) {
    body = body.toString("utf8");
  }

  if (typeof body === "object" && body !== null) {
    return body;
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(body || "{}");
  }

  return Object.fromEntries(new URLSearchParams(body || ""));
}

async function getRequestBody(req) {
  if (req.body) {
    return req.body;
  }

  return readBody(req);
}

function buildLead(form, req) {
  return {
    submitted_at: new Date().toISOString(),
    name: cleanText(form.name, 120),
    email: cleanText(form.email, 180).toLowerCase(),
    company: cleanText(form.company, 160),
    product_url: cleanText(form.productUrl || form.product_url, 240),
    message: cleanText(form.message, 1000),
    source: cleanText(form.source, 120),
    user_agent: cleanText(req.headers["user-agent"], 500),
    ip:
      cleanText(req.headers["x-forwarded-for"], 120).split(",")[0] ||
      cleanText(req.socket && req.socket.remoteAddress, 120),
  };
}

function validateLead(lead) {
  if (!lead.name || !lead.email || !lead.company) {
    return "Name, email, and company are required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return "Enter a valid email address.";
  }

  return "";
}

async function saveLeadToSupabase(lead) {
  const supabaseUrl = cleanText(process.env.SUPABASE_URL).replace(/\/$/, "");
  const serviceRoleKey = cleanText(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );
  const table = cleanText(process.env.SUPABASE_LEADS_TABLE || "leads", 80);

  if (!supabaseUrl || !serviceRoleKey) {
    return false;
  }

  if (serviceRoleKey.startsWith("sb_publishable_")) {
    throw new Error(
      "Supabase publishable key configured for server insert. Use a secret/service-role key instead."
    );
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase insert failed: ${response.status} ${detail}`);
  }

  return true;
}

function saveLeadLocally(lead) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.appendFileSync(leadsFile, `${JSON.stringify(lead)}\n`, "utf8");
}

function getPublicErrorMessage(error) {
  const message = String((error && error.message) || "");

  if (message.includes("publishable key")) {
    return "Supabase is configured with a publishable key. Use a secret/service-role key in Vercel.";
  }

  if (message.includes("environment variables are missing")) {
    return "Supabase environment variables are missing in Vercel.";
  }

  if (message.includes("Supabase insert failed: 401") || message.includes("Supabase insert failed: 403")) {
    return "Supabase rejected the insert. Check the server key and row-level security policy.";
  }

  if (message.includes("Supabase insert failed")) {
    return "Supabase rejected the insert. Check the leads table schema and API key.";
  }

  if (message.includes("fetch failed")) {
    return "Supabase could not be reached. Check the project URL or Supabase status.";
  }

  return "Unable to save your request right now.";
}

async function handleLeadSubmission(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
    return;
  }

  try {
    const body = await getRequestBody(req);
    const form = parseLead(body, req.headers["content-type"] || "");

    if (cleanText(form.fax_number)) {
      sendJson(res, 200, {
        ok: true,
        message: "Thanks. We received your demo request.",
        storage: "spam-filtered",
      });
      return;
    }

    const lead = buildLead(form, req);
    const validationError = validateLead(lead);
    if (validationError) {
      sendJson(res, 400, { ok: false, message: validationError });
      return;
    }

    const hasSupabaseConfig = Boolean(
      cleanText(process.env.SUPABASE_URL) &&
        cleanText(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
    );
    const savedToSupabase = await saveLeadToSupabase(lead);
    if (!savedToSupabase) {
      if (process.env.VERCEL) {
        throw new Error("Supabase environment variables are missing in Vercel.");
      }

      saveLeadLocally(lead);
    }

    sendJson(res, 201, {
      ok: true,
      message: "Thanks. We received your demo request.",
      storage: savedToSupabase || hasSupabaseConfig ? "supabase" : "local",
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { ok: false, message: getPublicErrorMessage(error) });
  }
}

module.exports = {
  handleLeadSubmission,
  loadEnvFile,
};
