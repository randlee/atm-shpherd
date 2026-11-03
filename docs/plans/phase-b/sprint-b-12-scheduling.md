---
id: b-12-scheduling
bead: shp-phase-b.13
status: planned
closure_type: integration
target_boundary: scheduled-operations
requirements: [REQ-SCHEDULE]
adrs: [ADR-SHP-005, ADR-SHP-009]
owned_paths:
  - crates/shpherd-daemon/src/scheduling/**
  - crates/shpherd-daemon/tests/scheduling/**
  - crates/shpherd-service/src/scheduled_operations/**
  - crates/shpherd-service/tests/scheduled_operations/**
relations:
  must_follow:
    - sprint: b-3c-external-integration-contract
      artifact: sc-cron-callback-schema-and-double
    - sprint: b-9b-launch-leases
      artifact: guarded-launch-command
  parallel_safe: [b-11-editor-actions]
recommended_agent: rust-service-developer
recommended_model: deep-reasoning
---

# B12 — Port schedules and recurring operations

## Goal

Close recurring guarded operations through the pinned sc-cron contract with deterministic restart and missed-run behavior.

## Required work and deliverables

- Register Shpherd jobs through the approved sc-cron public API while keeping rows, traits, timers, and policy on their correct side of the boundary.
- Integrate and contract-test sc-cron CRUD, five-field minute-first grammar, six-field compatibility parsing, JSON callback payload, `CronError`, missed-run/restart policy, eligible-host/lease guarded execution, and aggregate failure isolation without reimplementing its parser.

```rust
pub trait ShpherdScheduleRegistry: sealed::Sealed {
    fn upsert(&self, name: String, expression: String, payload: serde_json::Value) -> Result<(), CronError>;
    fn remove(&self, name: &str) -> Result<(), CronError>;
    fn register_callback(&self, callback: CronCallback) -> Result<(), CronError>;
}
```

The daemon owns this adapter and registers the B3C callback once; sc-cron never imports a Shpherd row or service trait.

## Relationships

`must_follow` B3C's sc-cron callback schema/double and B9B's guarded command path. Parallel-safe with client and roster integration work.

## This sprint does not close

No OS service lifecycle; B12A owns supervision/reboot/upgrade behavior.

## Acceptance and validation

- Source/version prerequisite and parser/callback fixtures are recorded; sc-cron imports no Shpherd type.
- Schedule create/read/update/delete and invalid-expression behavior pass through the pinned sc-cron API; Shpherd contains no duplicate cron parser.
- Manual and scheduled launch share one command path; Herdr default/tmux override, restart/missed runs, and isolated aggregate failures pass.

Every deliverable is production-ready for scheduled-operation integration.
