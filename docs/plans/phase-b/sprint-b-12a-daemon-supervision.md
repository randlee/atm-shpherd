---
id: b-12a-daemon-supervision
bead: shp-phase-b.19
status: planned
closure_type: integration
target_boundary: daemon-supervision
requirements: [REQ-OPERATE-SUPERVISION]
adrs: [ADR-SHP-003, ADR-SHP-005, ADR-SHP-009]
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
      artifact: lease-release-and-fencing-contract
    - sprint: b-12-scheduling
      artifact: schedule-restart-and-missed-run-policy
  parallel_safe: [b-11-editor-actions, b-11a-mobile]
recommended_agent: platform-integration-developer
recommended_model: workhorse
---

# B12A — Install and supervise the daemon

## Deliverables

- Provide upgrade-safe per-user launchd, systemd, and approved Windows supervision with structured logs/health, configuration migration, graceful lease release/fencing, and data-preserving uninstall.
- Prove synchronized teams and B12 schedules survive logout, reboot, crash, and binary upgrade.

## Relationships

`must_follow` B10A health/shutdown, B9B lease-release/fencing, and B12 restart/missed-run policy artifacts.

## This sprint does not close

No release certification across all product behaviors; B13 owns final evidence.

## Acceptance and validation

- Install/start/stop/restart/crash/reboot/log/health/migration/upgrade/uninstall tests pass per supported desktop platform.
- Service files contain no secret; stale ownership is fenced; schedules resume per B12 policy.

Every deliverable is production-ready for daemon lifecycle integration.
