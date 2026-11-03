---
id: b-9b-launch-leases
bead: shp-phase-b.17
status: planned
closure_type: integration
target_boundary: launch-ownership
recommended_agent: rust-distributed-systems-developer
recommended_model: deep-reasoning
---

# B9B — Enforce multi-host launch leases and fencing

requirements: REQ-LEASE, REQ-LAUNCH.
adrs: ADR-SHP-002, ADR-SHP-004, ADR-SHP-005.

## Deliverables and owned paths

- Implement host eligibility, acquire/renew/release/expiry/recovery, monotonic fencing, guarded action evidence, and ownership transfer through the real service/store composition.
- Owned paths: lease and guarded-launch service modules, lease persistence integration, distributed simulator scenarios.

## Relationships

`must_follow` B9A hydration, B4 storage, B3A guard contract, and B7/B8 guarded adapters.

## This sprint does not close

No roster mutation workflow or UI action; B9C/B11 own those integrations.

## Acceptance and validation

- Eligibility, stale-owner fencing, crashes, partitions, stale clocks, retries, stale evidence, and transfer pass; no scenario yields two valid owners or duplicate runtime sessions.
- Public APIs cannot call side effects without `LaunchLeaseGuard`.

Every deliverable is production-ready for integration closure across storage, service, and both launchers.
