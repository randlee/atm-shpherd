# ADR-SHP-011 — Versioned response and event envelope

- **Status:** Approved
- **Owner:** B3B
- **Decision:** every command returns a correlated versioned envelope containing a tagged completed/accepted/replayed/conflict/rejected outcome. Replay embeds the original terminal outcome. Events/resume tokens bind daemon instance, stream, and B2 `EventCursor`; absent means genesis zero, first event is one, checked overflow never wraps, and restart/stream mismatch requires resync. The authenticated health wire uses the frozen `HealthState::{LiveNotReady, Ready, Degraded, Draining}` and typed required/optional dependency inputs; B10A maps an injected readiness source, while B12A alone composes the real dependency states.
- **Alternatives rejected:** HTTP-status-only results, uncorrelated events, or command-specific ad hoc envelopes.
- **Consequences:** clients persist request IDs and event cursors; replay returns the original result; health consumers distinguish liveness, readiness blockers, optional degradation, and draining without inferring heartbeat state.
- **Evidence:** API/CLI tagged-union serialization, exactly-one-terminal-outcome, replay, restart/stream mismatch, reconnect, conflict, version, and injected readiness-state mapping fixtures.
