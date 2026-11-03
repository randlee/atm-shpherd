---
id: b-6a-atm-projection
bead: shp-phase-b.16
status: planned
closure_type: boundary
target_boundary: atm-adapter
requirements: []
adrs: [ADR-SHP-004, ADR-SHP-006]
owned_paths:
  - crates/shpherd-daemon/src/adapters/atm/**
  - crates/shpherd-daemon/tests/atm/**
  - tests/fixtures/atm/**
relations:
  must_follow:
    - sprint: b-3c-external-integration-contract
      artifact: atm-versioned-fixtures-and-adapter-double
  parallel_safe: [b-5-definition-service, b-6-observation, b-7-herdr-launcher, b-8-tmux-launcher, b-10a-daemon-api]
recommended_agent: rust-integration-developer
recommended_model: deep-reasoning
---

# B6A — Import ATM team and roster projection

## Deliverables

- Implement versioned read-only ATM SQLite catalog import and exact command adapters for `atm teams add-member|update-member|remove-member ... --json` plus `atm members --team ... --json` reconciliation.
- Record help/version and sanitized JSON fixtures, source identity/revision, normalized mapping, and typed unsupported-version diagnostics.

## Relationships

`must_follow` only B3C's versioned ATM fixtures and adapter double. It is parallel-safe with the service, launcher, and daemon API layers; B9C later consumes the real adapter.

## This sprint does not close

No hmux spawn, sync, lease, or user-facing roster workflow.

## Acceptance and validation

- Fixtures deterministically import; singular `atm team` never appears; undocumented ATM tables are never queried or written.
- Adapter contract tests cover import plus mutation/reconciliation request/result mapping against the B3C double; composed mutation ownership closes in B9C.

Every deliverable is production-ready for the ATM adapter boundary.
