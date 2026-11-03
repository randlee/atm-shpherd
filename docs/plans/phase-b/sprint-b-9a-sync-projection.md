---
id: b-9a-sync-projection
bead: shp-phase-b.10
status: planned
closure_type: integration
target_boundary: cross-store-synchronization
requirements: [ANC-006, ANC-010, REQ-SCHEMA, REQ-SYNC]
adrs: [ADR-SHP-002, ADR-SHP-004]
owned_paths:
  - crates/shpherd-service/src/sync/**
  - crates/shpherd-service/tests/sync/**
  - tests/integration/sync/**
relations:
  must_follow:
    - sprint: b-4a-local-schema-sqlite
      artifact: sqlite-projection-store
    - sprint: b-4b-postgres-projection-store
      artifact: postgres-projection-store
    - sprint: b-4c-static-adaptor
      artifact: static-projection-adaptor
  parallel_safe: [b-9b-launch-leases, b-10a-daemon-api]
recommended_agent: rust-distributed-systems-developer
recommended_model: deep-reasoning
---

# B9A — Synchronize the approved projection

## Deliverables

- Implement service-owned selection, version/change metadata, offline reconciliation, deterministic conflict rejection, audit evidence, and second-host hydration over static adaptor reads/writes.

## Relationships

`must_follow` the independent B4A SQLite, B4B PostgreSQL, and B4C static-adaptor boundary artifacts. Cross-store policy begins here, not in those boundary sprints.

## This sprint does not close

No lease or launch ownership; B9B owns safe launch after hydration.

## Acceptance and validation

- Two-host create/update/delete/offline/reconnect/version-skew/conflict/exclusion/hydration tests pass.
- Adaptor has no timer, route, merge, or lease policy; secrets/local handles never synchronize or log.

Every deliverable is production-ready for the synchronization boundary.
