const { loadEnvFile } = require("../lib/env");
const { handleEventSubmission } = require("../lib/event-handler");

loadEnvFile();

module.exports = async function events(req, res) {
  await handleEventSubmission(req, res);
};
