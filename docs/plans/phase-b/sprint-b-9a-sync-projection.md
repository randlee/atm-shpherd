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
  parallel_safe: [b-10a-daemon-api]
recommended_agent: rust-distributed-systems-developer
recommended_model: deep-reasoning
---

# B9A — Synchronize the approved projection

## Goal

Close deterministic two-host synchronization over the three finished storage boundaries without moving excluded host-local data.

## Required work and deliverables

- Implement service-owned selection, version/change metadata, offline reconciliation, deterministic conflict rejection, audit evidence, and second-host hydration over static adaptor reads/writes.

```rust
pub struct SyncRequest { pub source: HostId, pub target: HostId, pub after: StoreRevision }
pub struct SyncOutcome { pub read: u64, pub applied: u64, pub rejected: u64, pub through: StoreRevision }
pub trait SynchronizationService: sealed::Sealed {
    fn reconcile(&self, request: SyncRequest) -> Result<SyncOutcome, DomainError>;
}
```

An outcome is committed only after the target transaction succeeds. Conflict rejection records audit evidence and advances no target revision.

## Relationships

`must_follow` the independent B4A SQLite, B4B PostgreSQL, and B4C static-adaptor boundary artifacts. Cross-store policy begins here, not in those boundary sprints.

## This sprint does not close

No lease or launch ownership; B9B owns safe launch after hydration.

## Acceptance and validation

- Two-host create/update/delete/offline/reconnect/version-skew/conflict/exclusion/hydration tests pass.
- Every applied/rejected batch has deterministic source/target/revision audit evidence, and replaying committed evidence is idempotent.
- Adaptor has no timer, route, merge, or lease policy; secrets/local handles never synchronize or log.

Every deliverable is production-ready for the synchronization boundary.
