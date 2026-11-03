# ADR-SHP-004 — Canonical identities and revisions

- **Status:** Approved
- **Owner:** B3B
- **Decision:** persistent Armada/Fleet/Flotilla/Team/Variant/Member/Host/Project entities use validated ULID newtypes in `shpherd-types`; request/operation IDs are UUIDv7 newtypes. Hierarchy mutations check aggregate target/parent/descendant revisions; store cursors are source-qualified; ATM revisions stay opaque foreign values. Conversions are explicit and fallible.
- **Alternatives rejected:** raw strings, implicit ATM/store ID equivalence, global scalar sync cursor, or lossy revision casts.
- **Consequences:** wire/store serialization is stable canonical text; invalid/noncanonical values fail before dispatch.
- **Evidence:** constructor/serde fixtures, conversion rejection tests, and schema/wire round trips.
