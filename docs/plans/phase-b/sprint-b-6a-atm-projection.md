---
id: b-6a-atm-projection
bead: shp-phase-b.16
status: planned
closure_type: boundary
target_boundary: atm-adapter
requirements: [ANC-011, ANC-015, REQ-ATM, REQ-API]
adrs: [ADR-SHP-003, ADR-SHP-004, ADR-SHP-006]
owned_paths:
  - crates/shpherd-atm/src/**
  - crates/shpherd-atm/tests/**
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

- Implement versioned read-only ATM catalog observation and exact command adapters for `atm teams add-member|update-member|remove-member ... --json` plus `atm members --team ... --json` reconciliation. ATM output is authoritative for actual running-team roster and agent state; Shpherd definitions and cached observations never override it.
- Enforce the B3C projection version/source fingerprint, exact field mapping/exclusion list, explicit ATM-to-Shpherd binding conversion, verified `AuthenticatedPrincipal` authorization, expected revision, idempotency, redacted command evidence, and typed version/fingerprint/revision diagnostics. No wire/domain mutation payload may carry caller claims.

## Relationships

`must_follow` only B3C's versioned ATM fixtures and roster-authority port double. It is parallel-safe with the service, launcher, and daemon API layers; thin daemon composition later injects this independent implementation into B9C and the B12 heartbeat through service-owned ports.

## This sprint does not close

No hmux spawn, fleet projection, timer, launch authority, or user-facing roster workflow.

## Acceptance and validation

- Fixtures deterministically import the documented fields and prove credentials, paths, process handles, prompts, and unknown fields are excluded; singular `atm team` never appears; undocumented ATM tables are never queried or written.
- Adapter contract tests cover source fingerprint/version rejection, forged-claim absence, expired/scope-mismatched verified principals, explicit foreign-ID binding, add/update/remove expected revisions, idempotent replay, redaction, command evidence, and reconciliation mapping against the B3C double; composed mutation ownership closes in B9C.
- Process simulator tests cover deadline before spawn, cancellation during command execution, bounded/oversized output, redaction before persistence, terminate-then-kill escalation, process-group cleanup, daemon crash, and safe retry for not-started versus outcome-unknown mutation.

Every deliverable is production-ready for the ATM adapter boundary.
