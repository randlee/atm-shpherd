# ADR-SHP-015 — Source-qualified synchronization protocol

- **Status:** Approved
- **Owner:** B3A
- **Decision:** synchronization uses per-source cursor vectors, contiguous revisions, closed typed entity keys, provenance-bearing tombstones, and RFC 8949 deterministic-CBOR batches whose SHA-256 digest is the BatchId. Apply is atomic; noncanonical bytes, digest mismatch, conflict, or gap advance no cursor.
- **Alternatives rejected:** global scalar cursor, hard deletes without evidence, partial apply, last-write-wins, or cursor advance before commit.
- **Consequences:** tombstones remain until every enrolled consumer acknowledges them or approved retention expires.
- **Evidence:** cross-store canonical-byte/digest goldens plus B9A invalid-key/noncanonical/gap/replay/delete/retention/conflict/atomicity/cursor invariants.
