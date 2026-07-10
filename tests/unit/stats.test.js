const assert = require("node:assert/strict");
const test = require("node:test");
const { buildFunnel, groupDaily, percent, unique } = require("../../lib/analytics-stats");
const { attributionFromInvitee, bookingFromCalendly, resourceId } = require("../../lib/booking-utils");

test("funnel uses unique visitors and attributed bookings", () => {
  const events = [
    { event_name: "page_view", session_id: "a", path: "/", occurred_at: "2026-07-10T01:00:00Z" },
    { event_name: "page_view", session_id: "a", path: "/blog/pai-discovery-case-study", occurred_at: "2026-07-10T01:01:00Z" },
    { event_name: "page_view", session_id: "b", path: "/", occurred_at: "2026-07-10T01:02:00Z" },
    { event_name: "book_sprint_click", session_id: "a", path: "/", properties: { attribution_id: "match" }, occurred_at: "2026-07-10T01:03:00Z" },
  ];
  const funnel = buildFunnel(events, [{ attribution_id: "match", qualified: true }]);
  assert.deepEqual(funnel, { visitors: 2, case_readers: 1, cta_clickers: 1, attributed_bookings: 1, qualified_bookings: 1, rates: { visitor_to_case_reader: 50, visitor_to_cta_clicker: 50, cta_clicker_to_booking: 100, booking_to_qualified: 100 } });
  assert.equal(percent(1, 0), 0);
  assert.equal(unique(["a", "a", "", "b"]), 2);
  assert.deepEqual(groupDaily(events)[0], { metric_date: "2026-07-10", event_name: "page_view", path: "/", event_count: 2, unique_sessions: 2 });
});

test("booking conversion keeps attribution and opaque resource IDs", () => {
  const invitee = { uri: "https://api.calendly.com/invitees/i1", email: "Ada@example.com", status: "active", tracking: { utm_term: "attr-1" } };
  assert.equal(attributionFromInvitee(invitee), "attr-1");
  const booking = bookingFromCalendly({ uri: "https://api.calendly.com/events/e1", start_time: "2026-07-20T00:00:00Z" }, invitee);
  assert.equal(booking.attribution_id, "attr-1");
  assert.equal(booking.calendly_event_id, "e1");
  assert.equal(booking.calendly_invitee_id, "i1");
  assert.equal(booking.qualified, undefined);
  assert.equal(attributionFromInvitee({ questions_and_answers: [{ question: "Attribution ID", answer: "question-id" }] }), "question-id");
  assert.equal(bookingFromCalendly({}, {}).calendly_invitee_id, "");
  assert.equal(resourceId("https://api.calendly.com/invitees/good-id"), "good-id");
  assert.equal(resourceId("https://api.calendly.com/invitees/bad%20id"), "");
});
