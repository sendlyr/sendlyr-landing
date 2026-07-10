const fs = require("fs");
const path = require("path");
const { loadEnvFile } = require("./env");
const { cleanText, getRequestBody, parseBody, sendJson } = require("./http-utils");
const { insertRows } = require("./supabase-rest");

const dataDir = path.join(__dirname, "..", "data");
const leadsFile = path.join(dataDir, "leads.jsonl");

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
    ip: cleanText(req.headers["x-forwarded-for"], 120).split(",")[0] || cleanText(req.socket?.remoteAddress, 120),
  };
}

function validateLead(lead) {
  if (!lead.name || !lead.email || !lead.company) return "Name, email, and company are required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return "Enter a valid email address.";
  return "";
}

function saveLeadLocally(lead) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.appendFileSync(leadsFile, `${JSON.stringify(lead)}\n`, "utf8");
}

function getPublicErrorMessage(error) {
  const message = String(error?.message || "");
  if (message.includes("secret/service-role")) return "Supabase requires a secret server key.";
  if (message.includes("Supabase insert failed")) return "Supabase rejected the request. Check its schema and server key.";
  if (message.includes("fetch failed")) return "Supabase could not be reached.";
  return "Unable to save your request right now.";
}

async function handleLeadSubmission(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
    return;
  }
  try {
    const form = parseBody(await getRequestBody(req, 32_000), req.headers["content-type"] || "");
    if (cleanText(form.fax_number)) {
      sendJson(res, 200, { ok: true, message: "Thanks. We received your request.", storage: "spam-filtered" });
      return;
    }
    const lead = buildLead(form, req);
    const validationError = validateLead(lead);
    if (validationError) {
      sendJson(res, 400, { ok: false, message: validationError });
      return;
    }
    const savedToSupabase = await insertRows(process.env.SUPABASE_LEADS_TABLE || "leads", lead);
    if (!savedToSupabase) {
      if (process.env.VERCEL) throw new Error("Supabase environment variables are missing in Vercel.");
      saveLeadLocally(lead);
    }
    sendJson(res, 201, { ok: true, message: "Thanks. We received your request.", storage: savedToSupabase ? "supabase" : "local" });
  } catch (error) {
    console.error(error);
    sendJson(res, error.statusCode || 500, { ok: false, message: getPublicErrorMessage(error) });
  }
}

module.exports = { buildLead, getPublicErrorMessage, handleLeadSubmission, loadEnvFile, saveLeadLocally, validateLead };
