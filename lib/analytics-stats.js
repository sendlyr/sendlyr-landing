function unique(values) {
  return new Set(values.filter(Boolean)).size;
}

function percent(numerator, denominator) {
  return denominator ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function buildFunnel(events = [], bookings = []) {
  const pageViews = events.filter((event) => event.event_name === "page_view");
  const caseViews = events.filter((event) => event.event_name === "case_study_open" || (event.event_name === "page_view" && event.path === "/blog/pai-discovery-case-study"));
  const ctaClicks = events.filter((event) => event.event_name === "book_sprint_click");
  const attributedIds = new Set(ctaClicks.map((event) => event.properties?.attribution_id).filter(Boolean));
  const attributedBookings = bookings.filter((booking) => attributedIds.has(booking.attribution_id));
  const qualified = attributedBookings.filter((booking) => booking.qualified === true);
  const visitors = unique(pageViews.map((event) => event.session_id));
  const caseReaders = unique(caseViews.map((event) => event.session_id));
  const clickers = unique(ctaClicks.map((event) => event.session_id));
  return {
    visitors,
    case_readers: caseReaders,
    cta_clickers: clickers,
    attributed_bookings: attributedBookings.length,
    qualified_bookings: qualified.length,
    rates: {
      visitor_to_case_reader: percent(caseReaders, visitors),
      visitor_to_cta_clicker: percent(clickers, visitors),
      cta_clicker_to_booking: percent(attributedBookings.length, clickers),
      booking_to_qualified: percent(qualified.length, attributedBookings.length),
    },
  };
}

function groupDaily(events = []) {
  const groups = new Map();
  for (const event of events) {
    const date = String(event.occurred_at || event.received_at || "").slice(0, 10);
    if (!date) continue;
    const key = `${date}:${event.event_name}:${event.path}`;
    const group = groups.get(key) || { metric_date: date, event_name: event.event_name, path: event.path, event_count: 0, sessions: new Set() };
    group.event_count += 1;
    if (event.session_id) group.sessions.add(event.session_id);
    groups.set(key, group);
  }
  return [...groups.values()].map(({ sessions, ...group }) => ({ ...group, unique_sessions: sessions.size }));
}

module.exports = { buildFunnel, groupDaily, percent, unique };
