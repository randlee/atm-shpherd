---
id: b-12-scheduling
bead: shp-phase-b.13
status: planned
closure_type: integration
target_boundary: scheduled-operations
recommended_agent: rust-service-developer
recommended_model: deep-reasoning
---

# B12 — Port schedules and recurring operations

requirements: REQ-SCHEDULE, REQ-LEASE, REQ-LAUNCH.
adrs: ADR-SHP-005, ADR-SHP-009.

## Deliverables and owned paths

- Register Shpherd jobs through the approved sc-cron public API while keeping rows, traits, timers, and policy on their correct side of the boundary.
- Implement CRUD, five-field minute-first grammar, six-field compatibility parsing, JSON callback payload, `CronError`, missed-run/restart policy, eligible-host/lease guarded execution, and aggregate failure isolation.
- Owned paths: daemon scheduling composition, scheduling service policy, sc-cron adapter contract fixtures/tests.

## Relationships

`must_follow` B3A scheduler contract and B9B guarded command path. Parallel-safe with client work.

## This sprint does not close

No OS service lifecycle; B12A owns supervision/reboot/upgrade behavior.

## Acceptance and validation

- Source/version prerequisite and parser/callback fixtures are recorded; sc-cron imports no Shpherd type.
- Manual and scheduled launch share one command path; Herdr default/tmux override, restart/missed runs, and isolated aggregate failures pass.

Every deliverable is production-ready for scheduled-operation integration.
