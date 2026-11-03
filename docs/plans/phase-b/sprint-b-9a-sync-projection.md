---
id: b-9a-sync-projection
bead: shp-phase-b.10
status: planned
closure_type: integration
target_boundary: cross-store-synchronization
requirements: [ANC-006, ANC-010, REQ-SCHEMA, REQ-SYNC]
adrs: [ADR-SHP-002, ADR-SHP-004, ADR-SHP-013, ADR-SHP-015]
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

- Implement service-owned complete launchable-definition allowlist selection, source-qualified vector cursors, canonical atomic mutation/tombstone batches, offline reconciliation, deterministic conflict rejection, audit evidence, enrolled-host project-binding hydration, and second-host hydration over static adaptor reads/writes.

```rust
pub struct SyncRequest { pub source: HostId, pub target: HostId, pub after: CursorVector, pub batch_limit: u32 }
pub struct SyncOutcome { pub batches_read: u64, pub mutations_applied: u64, pub rejected: u64,
    pub through: CursorVector, pub replayed_batches: u64 }
pub trait SynchronizationService: sealed::Sealed {
    fn reconcile(&self, request: SyncRequest) -> Result<SyncOutcome, DomainError>;
}
```

Each source stream is contiguous. An absent vector entry is cursor zero, `from_exclusive=0` requests the first batch, and the first mutation is cursor one. MAX can be read but checked advance fails with overflow and no mutation; entity revisions remain distinct validated nonzero values. A target transaction atomically applies rows and tombstones, records the batch hash/audit evidence, and advances only that source cursor. Same-ID/same-hash replay returns the prior receipt; a changed hash, gap, stale base, or conflict rolls back all rows, tombstones, audit, and cursors. Tombstones remain until every enrolled target acknowledges the source cursor. Host-local paths, credentials, runtime handles, lease rows, and local action evidence are excluded.

## Relationships

`must_follow` the independent B4A SQLite, B4B PostgreSQL, and B4C static-adaptor boundary artifacts. Cross-store policy begins here, not in those boundary sprints.

## This sprint does not close

No lease or launch ownership; B9B owns safe launch after hydration.

## Acceptance and validation

- Two-host create/update/delete/tombstone/offline/reconnect/out-of-order/vector-skew/conflict/exclusion/project-binding hydration tests pass with typed entity keys and cross-store canonical digest goldens.
- Transaction-fault tests prove batch atomicity and no cursor advance; duplicate-same-hash replay is idempotent, duplicate-different-hash fails, gaps fail, and independent source cursors advance without overwriting one another. Goldens cover missing vector entry, empty target at zero, first batch/event at one, MAX cursor read, overflow rejection, zero entity-revision rejection, and serde round trips.
- Every applied/rejected batch has deterministic source/target/vector audit evidence; tombstone retention and enrolled-host acknowledgement are proven.
- Starting from an empty target, the hydrated typed hierarchy, Team/Variant/member/assignment bundle, ordered prompts, typed project branch/ref, per-variant backend/runtime bindings, launcher policy, and ATM provenance are sufficient for B9B eligibility, checkout resolution/config validation, roster rendering, and launch; a multi-variant/multi-member fixture proves no member association or field is lost, and no resolved path, prompt body, credential, terminal handle, or origin observation is present.
- Adaptor has no timer, route, merge, or lease policy; secrets/local handles never synchronize or log.

Every deliverable is production-ready for the synchronization boundary.
