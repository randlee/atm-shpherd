---
id: b-9a-sync-projection
bead: shp-phase-b.10
status: planned
closure_type: boundary
target_boundary: synchronization-service
recommended_agent: rust-distributed-systems-developer
recommended_model: deep-reasoning
---

# B9A — Synchronize the approved projection

requirements: REQ-SYNC; PRD §7.
adrs: ADR-SHP-002, ADR-SHP-004.

## Deliverables and owned paths

- Implement service-owned selection, version/change metadata, offline reconciliation, deterministic conflict rejection, audit evidence, and second-host hydration over static adaptor reads/writes.
- Owned paths: synchronization modules in `shpherd-service`, adaptor orchestration contract tests, two-host simulator.

## Relationships

`must_follow` B4 projection schema and B3A conflict contract. Parallel-safe with B6/B10A.

## This sprint does not close

No lease or launch ownership; B9B owns safe launch after hydration.

## Acceptance and validation

- Two-host create/update/delete/offline/reconnect/version-skew/conflict/exclusion/hydration tests pass.
- Adaptor has no timer, route, merge, or lease policy; secrets/local handles never synchronize or log.

Every deliverable is production-ready for the synchronization boundary.
