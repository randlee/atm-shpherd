---
id: b-6-observation
bead: shp-phase-b.7
status: planned
closure_type: boundary
target_boundary: shpherd-service-observation
requirements: [REQ-DEFINITION, REQ-API]
adrs: [ADR-SHP-002, ADR-SHP-003, ADR-SHP-004]
owned_paths:
  - crates/shpherd-service/src/observation/**
  - crates/shpherd-service/tests/observation/**
relations:
  must_follow:
    - sprint: b-3b-service-launch-api-contract
      artifact: observation-types-and-definition-reader-double
    - sprint: b-4a-local-schema-sqlite
      artifact: sqlite-definition-store-read-implementation-and-stateful-double
  parallel_safe: [b-6a-atm-projection, b-7-herdr-launcher, b-8-tmux-launcher, b-10a-daemon-api]
recommended_agent: rust-domain-developer
recommended_model: workhorse
---

# B6 — Port observation, discovery, focus, and doctor

## Goal

Close the read-side service boundary without granting pollers or discovery any durable definition-write capability.

## Required work and deliverables

- Implement the complete versioned B3B query surface for hierarchy, catalog, team, member, variant, discovery, host, backend, and diagnostics over B4A's injected app-owned `DefinitionStore` read capability, with pagination, provenance, stale/partial semantics, per-team error isolation, read-only discovery, explicit import request, focus resolution, and doctor diagnostics. The service owns read policy and mapping; the store owns typed reads and contains no observation policy.

The production read side implements the frozen B3B seam:

```rust
pub trait ObservationService: sealed::Sealed + Send + Sync {
    fn query<'a>(&'a self, context: &'a DispatchContext<'a>, query: Query, page: PageRequest) -> BoxFuture<'a, Result<(QueryResult, ReadMeta), DomainError>>;
}
```

Every snapshot uses the frozen `ObservationState` enum. Discovery and pollers can return an import request or diagnostic evidence, but only B5's `DefinitionService` can persist it.

## Relationships

`must_follow` B3B's observation types/definition-reader double and B4A's SQLite `DefinitionStore` read implementation/stateful double. It is parallel-safe with B5, the external adapters, launchers, and daemon API.

## This sprint does not close

No Herdr/tmux transport polling or UI. B7/B8 adapters and B10 UI close those paths.

## Acceptance and validation

- Boundary tests cover aligned typed hierarchy and lossless multi-variant Team bundles (member associations, prompt order, branch refs, backend/runtime bindings), every query/result variant, stable pagination, provenance, stopped/starting/running/idle/done/degraded/unknown, stale and partial snapshots with explicit omissions, isolated failures, read-only discovery, import delegation, host/backend capability views, focus, and doctor. Every actual running-team, roster, and runtime-status result comes from authoritative ATM-observed state; stored Shpherd definitions remain desired configuration and can never be promoted to runtime truth. Phase B status observations consumed by B6 are refreshed by B12's sc-cron heartbeat periodically polling ATM agent state; B6 registers no timer and schedules no launch or agent-instruction work.
- Static composition exposes only `DefinitionStore::read` to observation code; pollers have no definition-write capability. Compile-fail tests reject SQL/store-engine imports and commit-capability injection into pollers. Service lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the observation boundary.
