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

- Implement the complete allowlisted launchable-definition rows, per-source cursors, typed/provenance tombstones, enrolled-host facts, canonical batch receipts, and PostgreSQL `LeaseAuthorityStore` tagged operations/migrations.
- Prove excluded local fields cannot be encoded or persisted.

## This sprint does not close

No SQLite extension, adaptor, cross-store orchestration, conflict policy, or host launch.

## Acceptance and validation

- `boundary:postgres-projection-store` passes the B3A complete lossless multi-variant/member/prompt/branch/backend/runtime projection/hydration, canonical bytes/digest, replay, nonzero entity-revision and genesis/first/MAX/overflow cursor, variant-qualified tombstone, enrollment, exclusion, and database-time tagged acquire/renew/release/transfer suites.
- Migration/rollback and concurrent operation tests cover every typed lease state/mismatch plus unknown-outcome idempotent retry; local paths/prompt bodies/credentials/terminal state are structurally unrepresentable; lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the PostgreSQL store boundary.
