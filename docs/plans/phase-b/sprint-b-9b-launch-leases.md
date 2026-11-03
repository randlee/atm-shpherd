---
id: b-9b-launch-leases
bead: shp-phase-b.17
status: planned
closure_type: integration
target_boundary: launch-ownership
requirements: [ANC-008, ANC-009, REQ-LAUNCH, REQ-LEASE]
adrs: [ADR-SHP-002, ADR-SHP-004, ADR-SHP-005, ADR-SHP-012, ADR-SHP-013]
owned_paths:
  - crates/shpherd-service/src/leases/**
  - crates/shpherd-service/src/launch/**
  - crates/shpherd-service/src/host_eligibility/**
  - crates/shpherd-service/tests/leases/**
  - crates/shpherd-service/tests/host_eligibility/**
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

## Goal

Close one-owner multi-host launch behavior so hydrated teams cannot be launched twice during retries, failures, or ownership transfer.

## Required work and deliverables

- Implement enrolled-host/project eligibility plus the tagged PostgreSQL-authoritative acquire/renew/release/expiry/recovery/transfer protocol using database time, exact holder/daemon/fencing expectations, duration, operation/idempotency binding, monotonic fencing, guarded action evidence, and ownership transfer through the real service/store composition.

```rust
pub enum LeaseState { Active, Released, Expired, Fenced }
pub struct LaunchLease {
    pub team: TeamId,
    pub variant: VariantId,
    pub host: HostId,
    pub holder: DaemonInstanceId,
    pub fencing: FencingToken,
    pub state: LeaseState,
    pub expires_at_unix_ms: u64,
}
pub struct LeaseGrant { pub guard: LaunchLeaseGuard, pub receipt: LeaseReceipt }
pub trait LaunchLeaseService: sealed::Sealed {
    fn acquire(&self, team: TeamId, variant: VariantId, host: HostId,
        holder: DaemonInstanceId, duration_ms: u64, key: IdempotencyKey) -> Result<LeaseGrant, DomainError>;
    fn renew(&self, guard: LaunchLeaseGuard, duration_ms: u64,
        key: IdempotencyKey) -> Result<LeaseGrant, DomainError>;
    fn release(&self, guard: LaunchLeaseGuard, key: IdempotencyKey) -> Result<LeaseReceipt, DomainError>;
    fn transfer(&self, guard: LaunchLeaseGuard, new_host: HostId,
        new_holder: DaemonInstanceId, duration_ms: u64, key: IdempotencyKey) -> Result<LeaseGrant, DomainError>;
}
```

Only a successful authoritative `LeaseReceipt` returns the unforgeable guard. Every renewal/release/transfer compares team, variant, host, daemon, expiry, and fencing; expiry uses PostgreSQL transaction time, never a caller clock. The receipt records replay/operation, authoritative now/expiry, prior/new fencing, holder, and state. Unknown-outcome retries reuse the same idempotency key and resolve to the committed receipt or one safe execution. SQLite stores observation evidence only and cannot grant authority.

## Relationships

`must_follow` B3B's guard/launcher doubles, B7/B8 guarded adapters, and B9A hydrated host projection.

## This sprint does not close

No roster mutation workflow or UI action; B9C/B11 own those integrations.

## Acceptance and validation

- Empty-target hydration eligibility, checkout/config validation, acquire/renew/release/transfer contention, absent/expired/released/fenced/holder-mismatch/stale-fencing/replay-mismatch/unavailable errors, unknown-outcome retry, crashes, partitions, skewed caller clocks, stale evidence, and transfer pass; no scenario yields two valid owners or duplicate runtime sessions and fencing never decreases.
- Read-only dry-run/observe/focus remain available during lease-store outage; every mutation compile-fails without the private guard.
- `req:ANC-008,ANC-009`: unset selection launches through Herdr and explicit tmux launches through tmux across the real guarded composition; aggregate failures remain isolated.
- Public APIs cannot call side effects without `LaunchLeaseGuard`.

Every deliverable is production-ready for integration closure across storage, service, and both launchers.
