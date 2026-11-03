# ADR-SHP-002 — Explicit host-aggregate projection

- **Status:** Approved
- **Owner:** B3A
- **Decision:** SQLite is complete host state; PostgreSQL receives the explicit minimum launchable definition: typed placement, Team/Variant, typed project git ref, ordered nonempty prompt refs, launcher/ATM provenance, variant-qualified members, per-variant backend/runtime bindings, assignments/state, enrollment, and source-qualified cursor/tombstone metadata. Resolved paths, prompt bodies, credentials, terminal handles, and observations stay local.
- **Alternatives rejected:** generic replication, shared SQL, last-write-wins, or copying paths/logs/credentials.
- **Consequences:** projection additions require an allowlist migration and exclusion tests.
- **Evidence:** B3A allowlist/exclusion and empty-target hydration fixtures, B4 store contract tests, and B9A two-host launchability/replay/conflict tests.
