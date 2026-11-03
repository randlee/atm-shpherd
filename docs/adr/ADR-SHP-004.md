# ADR-SHP-004 — Canonical identities and revisions

- **Status:** Approved
- **Owner:** B3B
- **Decision:** persistent Shpherd entity IDs are validated ULID newtypes in `shpherd-types`; request/operation IDs are UUIDv7 newtypes. Domain revisions are per-entity `u64`; store cursors are source-qualified; ATM revisions stay opaque foreign values. Conversions are explicit and fallible.
- **Alternatives rejected:** raw strings, implicit ATM/store ID equivalence, global scalar sync cursor, or lossy revision casts.
- **Consequences:** wire/store serialization is stable canonical text; invalid/noncanonical values fail before dispatch.
- **Evidence:** constructor/serde fixtures, conversion rejection tests, and schema/wire round trips.
