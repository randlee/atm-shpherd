---
id: b-4a-local-schema-sqlite
bead: shp-phase-b.5
status: planned
closure_type: boundary
target_boundary: local-schema-sqlite
vertical_rationale: "Each local extension migration changes its SQLite reader and writer contract; schema, migration, reader, and writer therefore land atomically so every committed revision remains readable and writable."
requirements: [ANC-002, ANC-006, ANC-010, ANC-011, ANC-013, REQ-SCHEMA, REQ-SYNC]
adrs: [ADR-SHP-002, ADR-SHP-004, ADR-SHP-012, ADR-SHP-013, ADR-SHP-015]
owned_paths:
  - crates/shpherd-schema/src/extensions/**
  - crates/shpherd-store-sqlite/src/extensions/**
  - crates/shpherd-store-sqlite/migrations/extensions/**
  - crates/shpherd-store-sqlite/tests/extensions/**
relations:
  must_follow:
    - sprint: b-1-generate-baseline
      artifact: proven-installed-and-tested-runtime-template
    - sprint: b-3a-schema-projection-contract
      artifact: local-extension-row-and-store-contract
    - sprint: b-3b-service-launch-api-contract
      artifact: operation-journal-port
  parallel_safe: [b-4b-postgres-projection-store, b-4c-static-adaptor]
recommended_agent: rust-storage-developer
recommended_model: deep-reasoning
---

# B4A — Implement local schema and SQLite extensions

## Goal

Close the local extension schema and SQLite implementation side of the B3A contract atomically.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests, B2, B3 parity, and B3A must close before this sprint; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Begin from B3's pinned scmux SQLite schema and preserve its parity-tested tables, migrations, readers, writers, and behavior as the initial local database baseline. Only after that parity evidence passes, implement the B3A extension migrations for resolved checkout/config paths, local prompt bodies, runtime handles/ATM observations, logical-project checkout binding, per-source cursor/tombstone evidence, host-local launch-operation evidence, the durable roster-expansion operation/evidence row, and the general accepted-operation/outcome/event journal while persisting the complete local definition subset; no Herdr-specific field may precede the parity baseline. ATM observation rows are authoritative for actual running-team and roster state, remain separate from desired definitions and cached values, and cannot be overwritten by definition data.
- Implement the SQLite sides of the fixed `DefinitionStore`, projection-store, roster-operation, and operation-journal contracts. `DefinitionStore::commit` is the sole atomic local definition mutation seam consumed by B5; its read surface is the sole durable definition source consumed by B6. Supply a stateful contract double and prove no service or poller can bypass this seam.
- Apply B3A's versioned `SqliteRuntimeConfig`: a bounded read pool, one serialized writer, bounded acquisition/statement/transaction deadlines, SQLite busy timeout, idle lifetime, and cancellation propagation. Map busy/pool/timeout/cancel outcomes to typed `StoreError`; shutdown rejects new acquisition, cancels/drains bounded work, rolls back incomplete transactions, and closes every connection by deadline.

## This sprint does not close

No PostgreSQL store, adaptor, cross-store sync, conflict policy, or distributed launch authority.

## Acceptance and validation

- Dependency validation proves the transitive `must_follow` chain B1 template install/test → B2 integration → B3 parity → B3A contract → B4A before any migration code is dispatched.
- Dispatch fails unless the dependency graph contains a transitive `must_follow` path to completed B1 evidence proving the sc-runtime template was installed and every baseline test passed.
- `boundary:local-schema-sqlite` passes the B3A suite; parity rows stay readable and extensions are versioned after parity. Definition-store tests prove atomic hierarchy/team-bundle commit, expected-revision rejection, idempotent replay, aligned reads, pagination, rollback, and read-only capability injection.
- Migration/rollback and store tests cover lossless multi-variant/member/prompt/branch/backend/runtime round trips, validated local checkout/config binding, prompt-body/credential/runtime-observation exclusion from projection, variant-qualified member keys, canonical batches, nonzero entity revisions, genesis/first/MAX/overflow cursor behavior, tombstone persistence, host-local launch-operation evidence, roster-operation uniqueness/digest-aware replay/restart/retention, atomic accepted/terminal/event journal persistence and publish-after-commit replay, and proof that SQLite exposes no cross-host ownership or launch-grant operation; lint/test, workspace build, and boundary validation pass.
- Fault fixtures exhaust the read pool, block acquisition, hold the single writer busy, stall statements/commit, cancel each stage, and begin shutdown mid-transaction; every case meets its deadline, rolls back when not committed, records outcome-unknown only at the commit boundary, and closes cleanly.

Every deliverable is production-ready for the local schema/SQLite boundary.
