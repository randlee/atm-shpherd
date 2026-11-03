---
id: b-4-schema-extensions
bead: shp-phase-b.5
status: planned
closure_type: boundary
target_boundary: schema-stores-adaptor
recommended_agent: rust-storage-developer
recommended_model: deep-reasoning
---

# B4 — Add launch and synchronization schema extensions

requirements: ANC-010, REQ-SCHEMA, REQ-SYNC, REQ-LEASE.
adrs: ADR-SHP-002, ADR-SHP-004.

## Deliverables and owned paths

- Layer local extensions after parity for launcher, project binding, ATM identity, host eligibility, sync/version, and ownership state.
- Implement the explicit PostgreSQL projection schema and allowlisted adaptor row contracts, excluding paths, handles, logs, credentials, observations, and mailbox/prompt content.
- Owned paths: extension migrations/rows in schema and both store crates, adaptor row-contract modules, boundary-rooted tests.

## Relationships

`must_follow` B3 parity fingerprint and B3A projection/newtype contracts. Parallel-safe with B5/B6A through disjoint crate paths.

## This sprint does not close

No scheduler, reconciliation loop, lease state machine, or remote launch. B9A/B9B own behavior.

## Acceptance and validation

- Upgrade/downgrade preserves parity rows; every shared column has ADR justification and every local exclusion is tested.
- Engine/adaptor contract tests, migration tests, crate lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the storage boundary with no policy hidden in the adaptor.
