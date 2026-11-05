---
id: b-12a-daemon-supervision
bead: shp-phase-b.19
status: planned
closure_type: integration
target_boundary: daemon-supervision
requirements: [REQ-OPERATE-SUPERVISION]
adrs: [ADR-SHP-003, ADR-SHP-005, ADR-SHP-009, ADR-SHP-011, ADR-SHP-012, ADR-SHP-013]
owned_paths:
  - crates/shpherd-daemon/src/supervision/**
  - crates/shpherd-daemon/tests/supervision/**
  - packaging/launchd/**
  - packaging/systemd/**
  - packaging/windows/**
  - docs/operations/**
relations:
  must_follow:
    - sprint: b-10a-daemon-api
      artifact: daemon-health-and-shutdown-contract
    - sprint: b-9b-launch-leases
      artifact: host-local-operation-recovery-contract
    - sprint: b-12-scheduling
      artifact: atm-heartbeat-restart-policy
  parallel_safe: []
recommended_agent: platform-integration-developer
recommended_model: workhorse
---

# B12A — Install and supervise the daemon

## Goal

Close cross-platform per-user lifecycle for the thin daemon so the sc-cron callback that periodically polls ATM agent state and the local operation journal survive ordinary host lifecycle events. Supervision introduces no scheduled team-launch or agent-instruction job.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests and B2 must close before this migrated feature; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Provide upgrade-safe per-user launchd, systemd, and approved Windows supervision with structured logs/health, configuration migration, host-local operation recovery, and data-preserving uninstall.
- Consume B10A's exact startup-validation and `HealthState` contract. Supervisors use liveness only for process failure detection and readiness for traffic/command admission; they preserve typed degraded reasons, observe `Draining` during stop/upgrade, and never restart-loop a deterministic invalid-configuration failure.
- Prove host observations, fleet projection, and the B12 ATM-state heartbeat recover after logout, reboot, crash, and binary upgrade. Recovery restores PostgreSQL's combined fleet-wide view of host-qualified teams from all enrolled computers, not merely the restarted host's report, and preserves concurrent same-named team and agent instances as distinct host-qualified identities.
- Freeze one bounded shutdown state machine: stop intake, report draining health, cancel the heartbeat/projection work, drain or journal in-flight host-local operations to the configured deadline, terminate owned child process groups, flush operation/event state, close store pools, then exit. Deadline expiry forces termination only after durable local recovery evidence is written; upgrade handoff uses the same sequence.

Each platform adapter implements the same lifecycle contract: install, start, stop, restart, status/health, log discovery, upgrade, and data-preserving uninstall. Generated service definitions contain only executable/config paths and environment-key references; credentials remain in the platform credential store.

## Relationships

`must_follow` B10A health/shutdown, B9B host-local operation recovery, and B12 heartbeat restart artifacts.

## This sprint does not close

No release certification across all product behaviors; B13 owns final evidence.

## Acceptance and validation

- Install/start/stop/restart/crash/reboot/log/health/migration/upgrade/uninstall tests pass per supported desktop platform.
- Platform fixtures prove invalid configuration fails before listener bind without restart storms, required-dependency loss clears readiness, recovery restores readiness, and stop/upgrade observes `Draining` before process exit. Operational metrics/traces cover every shutdown stage and remain nonthrowing/redacted when the observability sink is unavailable.
- Service files contain no secret; stale local operations reconcile through ATM/launcher observation; the heartbeat resumes per B12 policy. Recovery treats ATM as authoritative for every actual running team instance and never promotes a stored Shpherd definition or stale local observation to runtime truth.
- Signal/service-stop fixtures interrupt every shutdown stage, including unknown-outcome local mutations and child processes that ignore graceful termination; forced termination followed by restart converges from the local journal and heartbeat evidence without duplicate mutation or event loss.

Every deliverable is production-ready for daemon lifecycle integration.
