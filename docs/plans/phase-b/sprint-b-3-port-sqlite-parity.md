---
id: b-3-port-sqlite-parity
bead: shp-phase-b.4
status: planned
closure_type: boundary
target_boundary: shpherd-schema-and-sqlite
vertical_rationale: "The retained scmux schema migration, SQLite reader, and SQLite writer must land atomically in one commit so no revision can expose a migrated schema to an incompatible reader or writer."
requirements: [ANC-002, ANC-006, ANC-010, REQ-SCHEMA]
adrs: [ADR-SHP-001]
owned_paths:
  - crates/shpherd-schema/src/parity/**
  - crates/shpherd-store-sqlite/migrations/parity/**
  - crates/shpherd-store-sqlite/tests/parity/**
  - docs/evidence/schema-parity/**
relations:
  must_follow:
    - sprint: b-2-integrate-workspace
      artifact: generated-schema-and-sqlite-boundaries
  parallel_safe:
    - b-3b-service-launch-api-contract
    - b-3c-external-integration-contract
recommended_agent: rust-storage-developer
recommended_model: deep-reasoning
---

# B3 — Port the scmux SQLite schema at parity

## Goal

Create an exact, testable SQLite parity baseline before any Shpherd-specific schema extension lands.

## Required work and deliverables

- Start only after the B2 release gate confirms that sc-runtime `v0.2.0` is unavailable or its upgrade interrupt has completed; if release is observed first, that interrupt is the next Shpherd work started and no new migration work intervenes.
- Port retained scmux tables, keys, constraints, defaults, and migrations into `shpherd-schema` and `shpherd-store-sqlite` without target extensions.
- Preserve the host-local meaning of the parity schema: no key or constraint creates global team-name or agent-name uniqueness, so another host's independent SQLite database may retain the same names concurrently.
- Add schema fingerprint, representative fixture migration, and documented exclusions.

## Relationships

`must_follow` B2: consumes generated schema/store skeletons. B2 itself cannot complete until B1's sc-runtime 0.1.1 template installation and every baseline test gate pass, so this scmux migration cannot start earlier. B3A consumes the parity fingerprint; B3 is parallel-safe with B3B/B3C because their owned paths are disjoint.

## This sprint does not close

No PostgreSQL projection, host sync, lease, fencing, or Herdr-only field. B4A/B4B/B4C own the independent extension boundaries.

## Acceptance and validation

- `boundary:shpherd-schema-and-sqlite`: automated parity covers every retained object and proves no target-only object exists.
- A two-host parity fixture proves independent SQLite databases can retain identically named teams and agents without conflict; host-qualified fleet identity is added only by later projection work.
- SQLite migration/contract tests, schema fingerprint check, crate lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the SQLite boundary; no stubbed migration or untested retained object remains.
