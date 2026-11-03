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

- B12 may start while sc-runtime 0.2.0 is unavailable, but if 0.2.0 is released first, the B2-installed release gate must make the Shpherd 0.2.0 upgrade the next work started; that upgrade, including every dependency update supplied by the release, must finish before B12 begins or resumes.
- Register Shpherd jobs through the approved sc-cron public API while keeping rows, traits, timers, and policy on their correct side of the boundary.
- Integrate and contract-test sc-cron CRUD plus get/list reads, five-field minute-first grammar, six-field compatibility parsing, injected `Arc<dyn CronHandler + Send + Sync>`, cancellation, JSON callback payload, `CronError`, missed-run/restart policy, eligible-host/lease guarded execution, and aggregate failure isolation without reimplementing its parser.

```rust
pub trait ShpherdScheduleRegistry: sealed::Sealed {
    fn upsert(&self, record: ScheduleRecord, expected: Option<u64>) -> Result<ScheduleRecord, CronError>;
    fn get(&self, id: &ScheduleId) -> Result<ScheduleRecord, CronError>;
    fn list(&self, query: ScheduleQuery) -> Result<SchedulePage, CronError>;
    fn remove(&self, id: &ScheduleId, expected: u64) -> Result<(), CronError>;
    fn register_handler(&self, handler: std::sync::Arc<dyn CronHandler>) -> Result<(), CronError>;
}
```

The daemon owns this adapter and registers the B3C callback once; sc-cron never imports a Shpherd row or service trait.

## Relationships

`must_follow` B3C's sc-cron callback schema/double and B9B's guarded command path. Parallel-safe with client and roster integration work.

## This sprint does not close

No OS service lifecycle; B12A owns supervision/reboot/upgrade behavior.

## Acceptance and validation

- Source/version prerequisite and parser/callback fixtures are recorded; sc-cron imports no Shpherd type.
- Schedule create/get/list/update/delete, revision conflict, invalid-expression, handler failure, and cancellation behavior pass through the pinned sc-cron API; Shpherd contains no duplicate cron parser.
- Manual and scheduled launch share one command path; an unset launcher selects Herdr, an explicitly selected tmux backend remains available, and restart/missed-run plus isolated aggregate-failure fixtures pass.

Every deliverable is production-ready for scheduled-operation integration.
