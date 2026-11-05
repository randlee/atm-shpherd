# ADR-SHP-004 — Canonical identities and revisions

- **Status:** Approved
- **Owner:** B2
- **Decision:** B2-owned `shpherd-types::foundation` defines validated ULID entities and UUIDv7 request/operation IDs. Domain/entity revisions are nonzero and distinct from genesis-capable `StoreCursor`/`EventCursor`; checked advance never wraps. Hierarchy mutations check aggregate target/parent/descendant revisions; ATM revisions stay opaque foreign values. Conversions are explicit and fallible.
- **Alternatives rejected:** raw strings, implicit ATM/store ID equivalence, global scalar sync cursor, or lossy revision casts.
- **Consequences:** wire/store serialization is stable canonical text; invalid/noncanonical values fail before dispatch.
- **Evidence:** constructor/serde fixtures, conversion rejection tests, and schema/wire round trips.
