# TODOS

## Analytics

### Verify the decision-event constraint before enabling production analytics

**What:** Apply and verify the `decision_trace_change` database constraint update, then extend the production smoke check to exercise that event.

**Why:** Prevent Revenue Leak Map interactions from being silently rejected by an older Supabase check constraint.

**Context:** Production currently renders with analytics disabled. Before setting `ANALYTICS_ENABLED=true`, apply the current `supabase-analytics.sql` migration in a controlled window and update `scripts/check-production.js` to insert, verify, and remove a `decision_trace_change` event. Consider `NOT VALID` followed by `VALIDATE CONSTRAINT` if the live events table is large.

**Effort:** S
**Priority:** P1
**Depends on:** A decision to enable production analytics

## Completed
