---
id: b-3a-freeze-contracts
bead: shp-phase-b.15
status: planned
closure_type: contract
target_boundary: shpherd-application-contracts
recommended_agent: architecture-developer
recommended_model: deep-reasoning
---

# B3A — Freeze application contracts

requirements: REQ-SCHEMA, REQ-DEFINITION, REQ-LAUNCH, REQ-ATM, REQ-SYNC, REQ-LEASE, REQ-API, REQ-SCHEDULE.
adrs: finalize ADR-SHP-002, 004, 005, 006, 007, 009, 010.

## Deliverables and owned paths

- Approve SQLite/Postgres projection/exclusions/conflicts; host enrollment/project binding; clone semantics; ATM projection/version/commands; hmux capability/results; sc-cron callback semantics; daemon auth/API transport; and MCP disabled status.
- Define domain newtypes, sealed/open public trait inventory, `ErrorEnvelope` mappings, closed `Launcher` dispatch, private-constructor `LaunchLeaseGuard`, test doubles, and contract fixtures.
- Owned paths: `docs/architecture.md` ADR sections, `docs/contracts/**`, `crates/shpherd-types/src/**`, boundary manifest public-contract sections, contract tests/doubles.

## Relationships

`must_follow` B3 because projection contracts cite parity objects. B4/B5/B6A/B7/B9A/B9B/B10A/B12 consume named ADRs and fixtures.

## This sprint does not close

Contracts compile and fixtures pass, but no store, launcher, sync, API, or scheduler implementation is claimed.

## Acceptance and validation

- Every listed ADR is `approved`, names an owner and testable contract, and is cited by downstream docs.
- No external implementation can construct `LaunchLeaseGuard`; no public unguarded spawn exists; fixed traits/launchers are sealed or closed.
- Error codes map deterministically to CLI exit/API status and carry recovery/retry metadata.
- Contract tests/doubles compile; workspace build and boundary validation pass.

Every deliverable is production-ready for contract closure and permits parallel implementation without renegotiation.
