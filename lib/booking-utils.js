const { cleanText } = require("./http-utils");

function resourceId(uri) {
  const id = cleanText(uri, 500).split("/").filter(Boolean).pop() || "";
  return /^[a-zA-Z0-9-]+$/.test(id) ? id : "";
}

function attributionFromInvitee(invitee = {}) {
  return cleanText(invitee.tracking?.utm_term || invitee.questions_and_answers?.find((item) => /attribution/i.test(item.question))?.answer, 80);
}

function bookingFromCalendly(event = {}, invitee = {}) {
  return {
    calendly_event_id: resourceId(event.uri),
    calendly_invitee_id: resourceId(invitee.uri),
    attribution_id: attributionFromInvitee(invitee),
    scheduled_at: cleanText(event.start_time, 40),
    status: cleanText(invitee.status || event.status, 40),
    synced_at: new Date().toISOString(),
  };
}

module.exports = { attributionFromInvitee, bookingFromCalendly, resourceId };
