---
id: b-4b-postgres-projection-store
bead: shp-phase-b.24
status: planned
closure_type: boundary
target_boundary: postgres-projection-store
requirements: []
adrs: [ADR-SHP-002, ADR-SHP-004]
owned_paths:
  - crates/shpherd-store-postgres/src/projection/**
  - crates/shpherd-store-postgres/migrations/projection/**
  - crates/shpherd-store-postgres/tests/projection/**
relations:
  must_follow:
    - sprint: b-3a-schema-projection-contract
      artifact: shared-row-and-projection-store-contract
  parallel_safe: [b-4a-local-schema-sqlite, b-4c-static-adaptor]
recommended_agent: rust-storage-developer
recommended_model: deep-reasoning
---

# B4B — Implement the PostgreSQL projection store

## Deliverables

- Implement only allowlisted shared rows/migrations and the PostgreSQL side of the static store contract.
- Prove excluded local fields cannot be encoded or persisted.

## This sprint does not close

No SQLite extension, adaptor, cross-store orchestration, conflict policy, or host launch.

## Acceptance and validation

- `boundary:postgres-projection-store` passes the B3A suite and exclusion tests.
- Migration/rollback, store tests, lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the PostgreSQL store boundary.
