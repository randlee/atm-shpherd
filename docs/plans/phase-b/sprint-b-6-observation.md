---
id: b-6-observation
bead: shp-phase-b.7
status: planned
closure_type: boundary
target_boundary: shpherd-service-observation
requirements: []
adrs: [ADR-SHP-003, ADR-SHP-004]
owned_paths:
  - crates/shpherd-service/src/observation/**
  - crates/shpherd-service/tests/observation/**
relations:
  must_follow:
    - sprint: b-3b-service-launch-api-contract
      artifact: observation-types-and-definition-reader-double
  parallel_safe: [b-6a-atm-projection, b-7-herdr-launcher, b-8-tmux-launcher, b-10a-daemon-api]
recommended_agent: rust-domain-developer
recommended_model: workhorse
---

# B6 — Port observation, discovery, focus, and doctor

## Goal

Close the read-side service boundary without granting pollers or discovery any durable definition-write capability.

## Required work and deliverables

- Implement backend-neutral observation projections, lifecycle states, stale/degraded semantics, per-team error isolation, read-only discovery, explicit import request, focus resolution, and doctor diagnostics.

The production read side implements the frozen B3B seam:

```rust
pub trait ObservationService: sealed::Sealed {
    fn snapshot(&self, query: ObservationQuery) -> Result<Vec<ObservationSnapshot>, DomainError>;
}
```

Every snapshot uses the frozen `ObservationState` enum. Discovery and pollers can return an import request or diagnostic evidence, but only B5's `DefinitionService` can persist it.

## Relationships

`must_follow` only B3B's observation types and definition-reader double. It is parallel-safe with B5, the external adapters, launchers, and daemon API.

## This sprint does not close

No Herdr/tmux transport polling or UI. B7/B8 adapters and B10 UI close those paths.

## Acceptance and validation

- Boundary tests cover stopped/starting/running/idle/done/degraded/unknown, stale snapshots, isolated failures, read-only discovery, import delegation, focus, and doctor.
- Pollers have no definition-write capability. Service lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the observation boundary.
