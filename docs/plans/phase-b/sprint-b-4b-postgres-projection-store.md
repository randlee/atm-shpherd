---
id: b-4b-postgres-projection-store
bead: shp-phase-b.24
status: planned
closure_type: boundary
target_boundary: postgres-projection-store
requirements: []
adrs: [ADR-SHP-002, ADR-SHP-004, ADR-SHP-012, ADR-SHP-015]
owned_paths:
  - crates/shpherd-store-postgres/src/projection/**
  - crates/shpherd-store-postgres/migrations/projection/**
  - crates/shpherd-store-postgres/tests/projection/**
relations:
  must_follow:
    - sprint: b-3a-schema-projection-contract
      artifact: shared-row-and-projection-store-contract
  parallel_safe: [b-4c-static-adaptor]
recommended_agent: rust-storage-developer
recommended_model: deep-reasoning
---

# B4B — Implement the PostgreSQL projection store

## Goal

Close the allowlisted PostgreSQL projection-store side of B3A without importing local-only state or sync policy.

## Required work and deliverables

- Implement only allowlisted shared rows, per-source cursors, tombstones, enrolled-host facts, and the PostgreSQL `LeaseAuthorityStore` CAS/migrations.
- Prove excluded local fields cannot be encoded or persisted.

## This sprint does not close

No SQLite extension, adaptor, cross-store orchestration, conflict policy, or host launch.

## Acceptance and validation

- `boundary:postgres-projection-store` passes the B3A projection, replay, cursor, tombstone, enrollment, exclusion, database-time lease CAS, holder/expiry/fencing/transfer suites.
- Migration/rollback and concurrent CAS tests pass; local paths/credentials are structurally unrepresentable; lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the PostgreSQL store boundary.
