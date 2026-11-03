---
id: b-5-definition-service
bead: shp-phase-b.6
status: planned
closure_type: boundary
target_boundary: shpherd-service-definitions
recommended_agent: rust-domain-developer
recommended_model: deep-reasoning
---

# B5 — Port definition management and command contracts

requirements: REQ-DEFINITION, REQ-API; PRD §6 and scmux oracle.
adrs: ADR-SHP-003, ADR-SHP-004.

## Deliverables and owned paths

- Implement hierarchy and atomic create/edit/move/clone/unlink/import domain behavior in `shpherd-service` with typed command inputs/results.
- Define transport-independent command contracts and machine errors; do not wire the thin CLI before B10A.
- Owned paths: definition/domain modules and tests in `shpherd-service`, definition command types in `shpherd-types` as fixed by B3A.

## Relationships

`must_follow` B3 parity types and B3A clone/error contracts. B6 and B10A consume the definition service API.

## This sprint does not close

No HTTP route, CLI transport, dashboard editor, PostgreSQL sync, or runtime launcher is claimed.

## Acceptance and validation

- Golden tests cover hierarchy, exactly one Captain, concrete prompts, variants, identity, running-edit guards, atomic rollback, clone policy, and reference-counted unlink.
- Definition writer is the sole durable mutation capability; poller test doubles cannot obtain it.
- Service crate lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the service boundary with no transport placeholder or stub.
