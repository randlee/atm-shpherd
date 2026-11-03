# ADR-SHP-015 — Source-qualified synchronization protocol

- **Status:** Approved
- **Owner:** B3A
- **Decision:** synchronization uses per-source cursor vectors, contiguous revisions, explicit tombstones, content-addressed idempotent batches, and atomic apply. Conflict or gap rejects the batch and advances no cursor.
- **Alternatives rejected:** global scalar cursor, hard deletes without evidence, partial apply, last-write-wins, or cursor advance before commit.
- **Consequences:** tombstones remain until every enrolled consumer acknowledges them or approved retention expires.
- **Evidence:** B3A fixtures plus B9A gap/replay/delete/conflict/atomicity/cursor invariants.
