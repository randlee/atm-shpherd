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
  parallel_safe: [b-7-herdr-launcher, b-8-tmux-launcher, b-10a-daemon-api]
recommended_agent: rust-integration-developer
recommended_model: deep-reasoning
---

# B6A — Import ATM team and roster projection

## Goal

Close the versioned ATM read/mutation adapter against frozen fixtures without undocumented SQL or singular commands.

## Required work and deliverables

- Implement versioned read-only ATM SQLite catalog import and exact command adapters for `atm teams add-member|update-member|remove-member ... --json` plus `atm members --team ... --json` reconciliation.
- Enforce the B3C projection version/source fingerprint, exact field mapping/exclusion list, explicit ATM-to-Shpherd binding conversion, caller authorization, expected revision, idempotency, redacted command evidence, and typed version/fingerprint/revision diagnostics.

## Relationships

`must_follow` only B3C's versioned ATM fixtures and adapter double. It is parallel-safe with the service, launcher, and daemon API layers; B9C later consumes the real adapter.

## This sprint does not close

No hmux spawn, sync, lease, or user-facing roster workflow.

## Acceptance and validation

- Fixtures deterministically import the documented fields and prove credentials, paths, process handles, prompts, and unknown fields are excluded; singular `atm team` never appears; undocumented ATM tables are never queried or written.
- Adapter contract tests cover source fingerprint/version rejection, caller auth, explicit foreign-ID binding, add/update/remove expected revisions, idempotent replay, redaction, command evidence, and reconciliation mapping against the B3C double; composed mutation ownership closes in B9C.

Every deliverable is production-ready for the ATM adapter boundary.
