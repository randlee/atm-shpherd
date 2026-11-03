---
id: b-6-observation
bead: shp-phase-b.7
status: planned
closure_type: boundary
target_boundary: shpherd-service-observation
recommended_agent: rust-domain-developer
recommended_model: workhorse
---

# B6 — Port observation, discovery, focus, and doctor

requirements: REQ-DEFINITION, REQ-LAUNCH; PRD §6 and scmux oracle.
adrs: ADR-SHP-003, ADR-SHP-004.

## Deliverables and owned paths

- Implement backend-neutral observation projections, lifecycle states, stale/degraded semantics, per-team error isolation, read-only discovery, explicit import request, focus resolution, and doctor diagnostics.
- Owned paths: observation/discovery/doctor modules in `shpherd-service`, observation types fixed by B3A, service tests.

## Relationships

`must_follow` B5 because it consumes definition read and import contracts. Parallel-safe with B4/B6A.

## This sprint does not close

No Herdr/tmux transport polling or UI. B7/B8 adapters and B10 UI close those paths.

## Acceptance and validation

- Boundary tests cover stopped/starting/running/idle/done/degraded/unknown, stale snapshots, isolated failures, read-only discovery, import delegation, focus, and doctor.
- Pollers have no definition-write capability. Service lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the observation boundary.
