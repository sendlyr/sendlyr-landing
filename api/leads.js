const { handleLeadSubmission, loadEnvFile } = require("../lib/lead-handler");

loadEnvFile();

module.exports = async function leads(req, res) {
  await handleLeadSubmission(req, res);
};
