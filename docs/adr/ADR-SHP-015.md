# ADR-SHP-015 — Source-qualified synchronization protocol

- **Status:** Approved
- **Owner:** B3A
- **Decision:** synchronization publishes each host's Shpherd definition summaries and ATM-observed team/agent status into a host-qualified PostgreSQL fleet read model. It uses per-source `StoreCursor` vectors distinct from nonzero entity revisions, closed typed entity keys including host and variant-qualified members, provenance-bearing tombstones, and RFC 8949 deterministic-CBOR batches whose SHA-256 digest is the BatchId. Missing source means genesis zero, first mutation is one, checked overflow never wraps, and apply is atomic. Projection is not launch authority and does not merge same-named instances across hosts.
- **Alternatives rejected:** global scalar cursor, hard deletes without evidence, partial apply, last-write-wins, or cursor advance before commit.
- **Consequences:** tombstones remain until every enrolled consumer acknowledges them or approved retention expires.
- **Evidence:** cross-store canonical-byte/digest goldens plus B9A invalid-key/noncanonical/gap/replay/delete/retention/conflict/atomicity/cursor invariants.
