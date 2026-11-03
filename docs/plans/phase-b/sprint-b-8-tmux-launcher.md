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
  parallel_safe: [b-10a-daemon-api]
recommended_agent: rust-integration-developer
recommended_model: workhorse
---

# B8 — Implement explicit tmux compatibility

## Goal

Close explicit tmux compatibility behind the same guarded launcher contract while preserving Herdr as the default.

## Required work and deliverables

- Port retained tmux/tmuxp dry-run/start/stop/observe/focus/relaunch/repair/dynamic-spawn/nudge, construction, discovery, guards, idempotency, evidence, and session semantics behind the same closed launcher result/error contracts; unsupported capabilities fail explicitly.
- Require `LaunchLeaseGuard` for every mutation while keeping dry-run/observe/focus on the read-only trait. Owned paths: tmux daemon adapter and simulator fixtures/tests.

## Relationships

`must_follow` only B3B's guarded launcher and observation double. It is parallel-safe with B7 and the other layer sprints named in frontmatter.

## This sprint does not close

No Herdr fallback policy, remote ownership transfer, or UI launcher action; integration sprints own them.

## Acceptance and validation

- `boundary:tmux-adapter`: every shared lifecycle action, including member stop/reconcile and registration-evidence validation, is implemented or returns `CapabilityMissing`; read actions work without lease authority and guarded/idempotent mutations pass the shared stateful double without duplicate sessions.
- Unsupported capabilities return actionable stable errors; adapter tests, lint/build, and boundary validation pass.
- Multi-variant fixtures select the explicit tmux variant's branch/runtime binding, ordered prompts, and assigned members without defaulting to or merging another variant.

Every deliverable is production-ready for the tmux adapter boundary.
