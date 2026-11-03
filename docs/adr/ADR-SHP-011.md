# ADR-SHP-011 — Versioned response and event envelope

- **Status:** Approved
- **Owner:** B3B
- **Decision:** every command returns a correlated versioned `ResponseEnvelope` with completed/accepted/replayed/conflict status and typed result/error union; accepted work emits ordered resumable events.
- **Alternatives rejected:** HTTP-status-only results, uncorrelated events, or command-specific ad hoc envelopes.
- **Consequences:** clients persist request IDs and event cursors; replay returns the original result.
- **Evidence:** API/CLI serialization, reconnect, duplicate request, conflict, and version fixtures.
