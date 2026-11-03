---
id: b-8-tmux-launcher
bead: shp-phase-b.9
status: planned
closure_type: boundary
target_boundary: tmux-adapter
requirements: []
adrs: [ADR-SHP-004, ADR-SHP-005]
owned_paths:
  - crates/shpherd-daemon/src/adapters/tmux/**
  - crates/shpherd-daemon/tests/tmux/**
  - tests/fixtures/tmux/**
relations:
  must_follow:
    - sprint: b-3b-service-launch-api-contract
      artifact: guarded-launcher-interface-and-observation-double
  parallel_safe: [b-5-definition-service, b-6-observation, b-6a-atm-projection, b-7-herdr-launcher, b-10a-daemon-api]
recommended_agent: rust-integration-developer
recommended_model: workhorse
---

# B8 — Implement explicit tmux compatibility

## Deliverables

- Port retained tmux/tmuxp construction, discovery, attach/focus, stop, guards, and session semantics behind the same closed launcher result/error contracts.
- Require `LaunchLeaseGuard` for side effects. Owned paths: tmux daemon adapter and simulator fixtures/tests.

## Relationships

`must_follow` only B3B's guarded launcher and observation double. It is parallel-safe with B7 and the other layer sprints named in frontmatter.

## This sprint does not close

No Herdr fallback policy, remote ownership transfer, or UI launcher action; integration sprints own them.

## Acceptance and validation

- `boundary:tmux-adapter`: guarded start/observe/focus/stop mappings pass the shared contract without duplicate sessions.
- Unsupported capabilities return actionable stable errors; adapter tests, lint/build, and boundary validation pass.

Every deliverable is production-ready for the tmux adapter boundary.
