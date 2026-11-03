---
id: b-8-tmux-launcher
bead: shp-phase-b.9
status: planned
closure_type: boundary
target_boundary: tmux-adapter
recommended_agent: rust-integration-developer
recommended_model: workhorse
---

# B8 — Implement explicit tmux compatibility

requirements: ANC-008, ANC-009, REQ-LAUNCH.
adrs: ADR-SHP-004, ADR-SHP-005.

## Deliverables and owned paths

- Port retained tmux/tmuxp construction, discovery, attach/focus, stop, guards, and session semantics behind the same closed launcher result/error contracts.
- Require `LaunchLeaseGuard` for side effects. Owned paths: tmux daemon adapter and simulator fixtures/tests.

## Relationships

`must_follow` B6 observation and B3A launcher contracts. Parallel-safe with B7.

## This sprint does not close

No Herdr fallback policy, remote ownership transfer, or UI launcher action; integration sprints own them.

## Acceptance and validation

- Explicit tmux selects tmux; unset selection remains Herdr. Start/observe/focus/stop and aggregate failure isolation pass without duplicate sessions.
- Unsupported capabilities return actionable stable errors; adapter tests, lint/build, and boundary validation pass.

Every deliverable is production-ready for the tmux adapter boundary.
