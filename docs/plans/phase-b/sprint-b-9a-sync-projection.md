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
  - crates/shpherd-service/src/operation_journal/**
  - crates/shpherd-service/tests/sync/**
  - tests/integration/sync/**
relations:
  must_follow:
    - sprint: b-1-generate-baseline
      artifact: proven-installed-and-tested-runtime-template
    - sprint: b-4a-local-schema-sqlite
      artifact: sqlite-projection-store
    - sprint: b-4b-postgres-projection-store
      artifact: postgres-projection-store
    - sprint: b-4c-static-adaptor
      artifact: static-projection-adaptor
    - sprint: b-3b-service-launch-api-contract
      artifact: service-operation-journal-port
  parallel_safe: [b-10a-daemon-api]
recommended_agent: rust-distributed-systems-developer
recommended_model: deep-reasoning
---

# B9A — Synchronize the approved projection

## Goal

Close deterministic two-host synchronization over the three finished storage boundaries without moving excluded host-local data. Synchronization publishes host-qualified rows from every enrolled computer into PostgreSQL so its fleet view shows all computers' teams together.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests, B2, and B4A/B4B/B4C must close before this sprint; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Consume B4A's SQLite baseline only after it proves the pinned scmux schema port and parity behavior, then consume the later B3A/B4A extensions; synchronization adds no schema field and cannot place any Herdr-specific extension ahead of that parity baseline.
- Implement service-owned complete launchable-definition allowlist selection, source-qualified vector cursors, canonical atomic mutation/tombstone batches, offline reconciliation, deterministic conflict rejection, audit evidence, enrolled-host project-binding hydration, and second-host hydration over static adaptor reads/writes.
- Implement the service-level `OperationJournal` adapter over B3A's lower `OperationJournalStore` port, using only schema DTOs/errors. The concrete SQLite engine remains behind B4A and neither direction imports the other's concrete crate.

```rust
pub struct SyncRequest { pub source: HostId, pub target: HostId, pub after: CursorVector, pub batch_limit: u32 }
pub struct SyncOutcome { pub batches_read: u64, pub mutations_applied: u64, pub rejected: u64,
    pub through: CursorVector, pub replayed_batches: u64 }
pub trait SynchronizationService: sealed::Sealed + Send + Sync {
    fn reconcile(&self, request: SyncRequest) -> BoxFuture<'_, Result<SyncOutcome, DomainError>>;
}
```

Each source stream is contiguous. An absent vector entry is cursor zero, `from_exclusive=0` requests the first batch, and the first mutation is cursor one. MAX can be read but checked advance fails with overflow and no mutation; entity revisions remain distinct validated nonzero values. A target transaction atomically applies rows and tombstones, records the batch hash/audit evidence, and advances only that source cursor. Same-ID/same-hash replay returns the prior receipt; a changed hash, gap, stale base, or conflict rolls back all rows, tombstones, audit, and cursors. Phase B retains tombstones indefinitely; enrolled-target acknowledgement advances its source vector but never authorizes tombstone removal. Host-local paths, credentials, runtime handles, lease rows, and local action evidence are excluded.

## Relationships

`must_follow` the independent B4A SQLite, B4B PostgreSQL, and B4C static-adaptor boundary artifacts. Cross-store policy begins here, not in those boundary sprints.

## This sprint does not close

No launch authority or ownership; B9B owns host-local safe launch from an explicitly local definition. PostgreSQL projection is not a launch prerequisite.

## Acceptance and validation

- Dependency validation proves every B9A dispatch follows B1 template install/test, B2 integration, B3/B3A, and completed B4A/B4B/B4C storage boundaries.
- Dispatch fails unless the dependency graph contains a transitive `must_follow` path to completed B1 evidence proving the sc-runtime template was installed and every baseline test passed.
- Two-host create/update/delete/tombstone/offline/reconnect/out-of-order/vector-skew/conflict/exclusion/project-binding hydration tests pass with typed entity keys and cross-store canonical digest goldens. A two-host fixture requires both hosts to publish and retain identically named teams and agents as distinct host-qualified rows without conflict or global-name rejection.
- Transaction-fault tests prove batch atomicity and no cursor advance; duplicate-same-hash replay is idempotent, duplicate-different-hash fails, gaps fail, and independent source cursors advance without overwriting one another. Goldens cover missing vector entry, empty target at zero, first batch/event at one, MAX cursor read, overflow rejection, zero entity-revision rejection, and serde round trips.
- Every applied/rejected batch has deterministic source/target/vector audit evidence; indefinite tombstone retention, acknowledgement without deletion, and replay after a host remains offline across later acknowledgements are proven.
- Starting from an empty target, the hydrated typed hierarchy, Team/Variant/member/assignment bundle, ordered prompts, typed project branch/ref, per-variant backend/runtime bindings, launcher policy, and ATM provenance are sufficient for B9B eligibility, checkout resolution/config validation, roster rendering, and launch; a multi-variant/multi-member fixture proves no member association or field is lost, and no resolved path, prompt body, credential, terminal handle, or origin observation is present. Synchronized Shpherd definitions remain desired launch data only; ATM-observed state is authoritative for every actual running team instance.
- Adaptor has no timer, route, merge, or lease policy; secrets/local handles never synchronize or log.

Every deliverable is production-ready for the synchronization boundary.
