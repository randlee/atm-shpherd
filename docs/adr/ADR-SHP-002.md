# ADR-SHP-002 — Explicit host-aggregate projection

- **Status:** Approved
- **Owner:** B3A
- **Decision:** SQLite is complete host state; PostgreSQL receives only allowlisted shared rows and source-qualified cursor/tombstone metadata. Incompatible revisions reject without cursor advance.
- **Alternatives rejected:** generic replication, shared SQL, last-write-wins, or copying paths/logs/credentials.
- **Consequences:** projection additions require an allowlist migration and exclusion tests.
- **Evidence:** B3A fixtures, B4 store contract tests, and B9A two-host replay/conflict tests.
