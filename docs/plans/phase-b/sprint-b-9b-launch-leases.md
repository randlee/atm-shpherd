---
id: b-9b-launch-leases
bead: shp-phase-b.17
status: planned
closure_type: integration
target_boundary: launch-ownership
requirements: [ANC-008, ANC-009, REQ-LAUNCH, REQ-LEASE]
adrs: [ADR-SHP-002, ADR-SHP-004, ADR-SHP-005]
owned_paths:
  - crates/shpherd-service/src/leases/**
  - crates/shpherd-service/src/launch/**
  - crates/shpherd-service/tests/leases/**
  - tests/integration/launch-ownership/**
relations:
  must_follow:
    - sprint: b-3b-service-launch-api-contract
      artifact: launch-lease-guard-and-launcher-test-doubles
    - sprint: b-7-herdr-launcher
      artifact: guarded-herdr-adapter
    - sprint: b-8-tmux-launcher
      artifact: guarded-tmux-adapter
    - sprint: b-9a-sync-projection
      artifact: hydrated-host-projection
  parallel_safe: [b-10-dashboard, b-10a-daemon-api]
recommended_agent: rust-distributed-systems-developer
recommended_model: deep-reasoning
---

# B9B — Enforce multi-host launch leases and fencing

## Deliverables

- Implement host eligibility, acquire/renew/release/expiry/recovery, monotonic fencing, guarded action evidence, and ownership transfer through the real service/store composition.

## Relationships

`must_follow` B3B's guard/launcher doubles, B7/B8 guarded adapters, and B9A hydrated host projection.

## This sprint does not close

No roster mutation workflow or UI action; B9C/B11 own those integrations.

## Acceptance and validation

- Eligibility, stale-owner fencing, crashes, partitions, stale clocks, retries, stale evidence, and transfer pass; no scenario yields two valid owners or duplicate runtime sessions.
- `req:ANC-008,ANC-009`: unset selection launches through Herdr and explicit tmux launches through tmux across the real guarded composition; aggregate failures remain isolated.
- Public APIs cannot call side effects without `LaunchLeaseGuard`.

Every deliverable is production-ready for integration closure across storage, service, and both launchers.
