---
id: b-6a-atm-projection
bead: shp-phase-b.16
status: planned
closure_type: boundary
target_boundary: atm-adapter
recommended_agent: rust-integration-developer
recommended_model: deep-reasoning
---

# B6A — Import ATM team and roster projection

requirements: REQ-ATM; PRD §9 and ATM/hmux contract.
adrs: ADR-SHP-004, ADR-SHP-006.

## Deliverables and owned paths

- Implement versioned read-only ATM SQLite catalog import and exact command adapters for `atm teams add-member|update-member|remove-member ... --json` plus `atm members --team ... --json` reconciliation.
- Record help/version and sanitized JSON fixtures, source identity/revision, normalized mapping, and typed unsupported-version diagnostics.
- Owned paths: daemon ATM adapter modules, ATM fixtures/contract tests, no ATM source or database writes.

## Relationships

`must_follow` B3A ATM/newtype/error contracts. Parallel-safe with B4/B5. B7/B9C consume normalized launch/roster facts.

## This sprint does not close

No hmux spawn, sync, lease, or user-facing roster workflow.

## Acceptance and validation

- Fixtures deterministically import; singular `atm team` never appears; undocumented ATM tables are never queried or written.
- Add/update/remove and post-mutation reconciliation tests cover conflicts, unavailable runtime evidence, redaction, and version failure.

Every deliverable is production-ready for the ATM adapter boundary.
