---
id: b-4b-postgres-projection-store
bead: shp-phase-b.24
status: planned
closure_type: boundary
target_boundary: postgres-projection-store
requirements: [ANC-011, ANC-012, ANC-013, REQ-SYNC]
adrs: [ADR-SHP-002, ADR-SHP-004, ADR-SHP-012, ADR-SHP-013, ADR-SHP-015]
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

- Implement the complete host-qualified fleet-view rows for local definition summaries and ATM-observed team/agent state, per-source cursors, typed/provenance tombstones, enrolled-host facts, and canonical batch receipts. ATM is authoritative for every projected running-team instance: PostgreSQL stores ATM-observed runtime state and never infers actual runtime state from a Shpherd definition. The schema qualifies identity by source host so identical team and agent names on different hosts remain distinct.
- Prove excluded local fields cannot be encoded or persisted.
- Apply B3A's versioned `PostgresRuntimeConfig`: bounded connections, connect/acquisition/statement/transaction deadlines, idle/max lifetimes, cancellation propagation, and bounded close. Map pool saturation and each timeout/cancel stage to typed `StoreError`, preserving whether a commit outcome is unknown.

## This sprint does not close

No SQLite extension, adaptor, cross-store orchestration, conflict policy, or host launch.

## Acceptance and validation

- `boundary:postgres-projection-store` passes the B3A host-qualified multi-variant/member/backend/status projection, canonical bytes/digest, replay, nonzero entity-revision and genesis/first/MAX/overflow cursor, indefinitely retained variant-qualified tombstone, offline-host replay, enrollment, and exclusion suites. Consumer acknowledgement never removes a tombstone. Two source hosts can publish the same team/member names concurrently and both remain visible.
- Migration/rollback and concurrent projection tests cover unknown-outcome idempotent retry; local paths/prompt bodies/credentials/terminal state are structurally unrepresentable; static checks prove there is no Phase B tombstone-removal, launch lease, ownership-transfer, fencing-token, or global-name-uniqueness API; lint/test, workspace build, and boundary validation pass.
- Fault fixtures exhaust the pool, block connect/acquisition, stall statement/commit, cancel each stage, and start shutdown with active transactions; every case respects its configured deadline, rolls back when uncommitted, resolves unknown outcomes through the idempotency receipt, and closes the pool without task leakage.

Every deliverable is production-ready for the PostgreSQL store boundary.
