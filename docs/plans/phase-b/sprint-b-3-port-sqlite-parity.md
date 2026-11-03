---
id: b-3-port-sqlite-parity
bead: shp-phase-b.4
status: planned
closure_type: boundary
target_boundary: shpherd-schema-and-sqlite
recommended_agent: rust-storage-developer
recommended_model: deep-reasoning
---

# B3 — Port the scmux SQLite schema at parity

requirements: ANC-006, ANC-010, REQ-SCHEMA; PRD §6 and scmux oracle.
adrs: ADR-SHP-001.

## Deliverables and owned paths

- Port retained scmux tables, keys, constraints, defaults, and migrations into `shpherd-schema` and `shpherd-store-sqlite` without target extensions.
- Add schema fingerprint, representative fixture migration, and documented exclusions.
- Owned paths: `crates/shpherd-schema/src/parity/**`, `crates/shpherd-store-sqlite/migrations/parity/**`, parity tests/fixtures.

## Relationships

`must_follow` B2: consumes generated schema/store contracts. B3A and B4 consume the parity fingerprint. Parallel-safe with no sprint editing these paths.

## This sprint does not close

No PostgreSQL projection, host sync, lease, fencing, or Herdr-only field. B4 owns extensions.

## Acceptance and validation

- `req:ANC-006,ANC-010`: automated parity covers every retained object and proves no target-only object exists.
- SQLite migration/contract tests, schema fingerprint check, crate lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the SQLite boundary; no stubbed migration or untested retained object remains.
