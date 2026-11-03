---
id: b-4a-local-schema-sqlite
bead: shp-phase-b.5
status: planned
closure_type: boundary
target_boundary: local-schema-sqlite
vertical_rationale: "Each local extension migration changes its SQLite reader and writer contract; schema, migration, reader, and writer therefore land atomically so every committed revision remains readable and writable."
requirements: []
adrs: [ADR-SHP-002, ADR-SHP-004, ADR-SHP-015]
owned_paths:
  - crates/shpherd-schema/src/extensions/**
  - crates/shpherd-store-sqlite/src/extensions/**
  - crates/shpherd-store-sqlite/migrations/extensions/**
  - crates/shpherd-store-sqlite/tests/extensions/**
relations:
  must_follow:
    - sprint: b-3a-schema-projection-contract
      artifact: local-extension-row-and-store-contract
  parallel_safe: [b-4b-postgres-projection-store, b-4c-static-adaptor]
recommended_agent: rust-storage-developer
recommended_model: deep-reasoning
---

# B4A — Implement local schema and SQLite extensions

## Goal

Close the local extension schema and SQLite implementation side of the B3A contract atomically.

## Required work and deliverables

- Implement local launcher, logical-project checkout binding, ATM identity, eligibility, per-source cursor/tombstone evidence, and non-authoritative lease-evidence rows/migrations after parity.
- Implement the SQLite side of the fixed projection-store contract.

## This sprint does not close

No PostgreSQL store, adaptor, cross-store sync, conflict policy, or lease state machine.

## Acceptance and validation

- `boundary:local-schema-sqlite` passes the B3A suite; parity rows stay readable and extensions are versioned after parity.
- Migration/rollback and store tests cover validated local checkout binding, cursor/tombstone persistence, lease evidence, and proof that SQLite exposes no lease-grant CAS; lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the local schema/SQLite boundary.
