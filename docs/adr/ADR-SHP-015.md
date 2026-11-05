# ADR-SHP-015 — Source-qualified synchronization protocol

- **Status:** Approved
- **Owner:** B3A
- **Decision:** synchronization publishes each host's Shpherd definition summaries and ATM-observed team/agent status into a host-qualified PostgreSQL fleet read model. It uses per-source `StoreCursor` vectors distinct from nonzero entity revisions, closed typed entity keys including host and variant-qualified members, provenance-bearing tombstones retained indefinitely for Phase B, and RFC 8949 deterministic-CBOR batches whose SHA-256 digest is the BatchId. Missing source means genesis zero, first mutation is one, checked overflow never wraps, and apply is atomic. Consumer acknowledgement advances source vectors but never deletes or compacts a tombstone. Projection is not launch authority and does not merge same-named instances across hosts.
- **Alternatives rejected:** global scalar cursor, hard deletes without evidence, Phase B tombstone expiry/compaction, partial apply, last-write-wins, or cursor advance before commit.
- **Consequences:** both stores retain Phase B tombstones indefinitely so an offline or later-reenrolled host can replay deletion history; any future compaction policy requires a new ADR and contract version.
- **Evidence:** cross-store canonical-byte/digest goldens plus B9A invalid-key/noncanonical/gap/replay/delete/indefinite-retention/offline-replay/conflict/atomicity/cursor invariants.
