---
id: b-4c-static-adaptor
bead: shp-phase-b.25
status: planned
closure_type: boundary
target_boundary: static-store-adaptor
requirements: []
adrs: [ADR-SHP-002, ADR-SHP-004]
owned_paths:
  - crates/shpherd-store-adaptor/src/**
  - crates/shpherd-store-adaptor/tests/**
relations:
  must_follow:
    - sprint: b-3a-schema-projection-contract
      artifact: projection-batch-and-store-test-doubles
  parallel_safe: []
recommended_agent: rust-storage-developer
recommended_model: workhorse
---

# B4C — Implement the static store adaptor

## Deliverables

- Implement statically dispatched projection reads/writes against B3A test doubles.
- Keep selection, timer, route, merge, conflict, lease, and reconciliation policy out.

## This sprint does not close

No engine SQL, schema migration, scheduling, cross-store integration, or policy.

## Acceptance and validation

- `boundary:static-store-adaptor` passes B3A batch/receipt tests against both doubles.
- Dependency checks prove no scheduler/launcher/route/policy import; lint/test, build, and boundary validation pass.

Every deliverable is production-ready for the adaptor boundary.
