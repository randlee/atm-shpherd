---
id: b-12a-daemon-supervision
bead: shp-phase-b.19
status: planned
closure_type: integration
target_boundary: daemon-supervision
recommended_agent: platform-integration-developer
recommended_model: workhorse
---

# B12A — Install and supervise the daemon

requirements: REQ-OPERATE, REQ-SCHEDULE, REQ-LEASE.
adrs: ADR-SHP-003, ADR-SHP-005, ADR-SHP-009.

## Deliverables and owned paths

- Provide upgrade-safe per-user launchd, systemd, and approved Windows supervision with structured logs/health, configuration migration, graceful lease release/fencing, and data-preserving uninstall.
- Prove synchronized teams and B12 schedules survive logout, reboot, crash, and binary upgrade.
- Owned paths: installer/service-generation modules, platform service templates, lifecycle tests/docs.

## Relationships

`must_follow` B10A health/API, B9B fencing, B9A sync, and B12 scheduling artifacts.

## This sprint does not close

No release certification across all product behaviors; B13 owns final evidence.

## Acceptance and validation

- Install/start/stop/restart/crash/reboot/log/health/migration/upgrade/uninstall tests pass per supported desktop platform.
- Service files contain no secret; stale ownership is fenced; schedules resume per B12 policy.

Every deliverable is production-ready for daemon lifecycle integration.
