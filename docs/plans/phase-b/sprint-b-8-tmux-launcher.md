---
id: b-8-tmux-launcher
bead: shp-phase-b.9
status: planned
closure_type: boundary
target_boundary: tmux-adapter
requirements: [ANC-002, ANC-008, ANC-009, ANC-013, REQ-LAUNCH]
adrs: [ADR-SHP-004, ADR-SHP-005]
owned_paths:
  - crates/shpherd-launchers/src/tmux/**
  - crates/shpherd-launchers/tests/tmux/**
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

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests, B2, and B3B must close before this sprint; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Port retained tmux/tmuxp dry-run/start/stop/observe/focus/relaunch/repair/dynamic-spawn/nudge, construction, discovery, guards, idempotency, evidence, and session semantics behind the same boundary-allowlisted launcher port and service-issued mutation guard; unsupported capabilities fail explicitly. Tmux observations are launcher evidence only and never replace ATM as the source of truth for each running team instance.
- Require `HostLaunchGuard` for every mutation while keeping dry-run/observe/focus on the read-only trait. The guard and idempotency journal are host-local; an identically named tmux team may run on another host. Owned paths: independent tmux adapter and simulator fixtures/tests.

## Relationships

`must_follow` only B3B's guarded launcher and observation double. It is parallel-safe with B7 and the other layer sprints named in frontmatter.

## This sprint does not close

No Herdr fallback policy, cross-host ownership, real SSH/CLI/daemon composition, active-agent start through the product API, or UI launcher action; B9B owns the real launch integration.

## Acceptance and validation

- Process simulator tests cover deadline before spawn, cancellation during tmux execution, bounded/oversized output, terminate-then-kill escalation, process-group cleanup, ignored termination, daemon crash, and idempotent recovery for not-started versus outcome-unknown mutations.

- `boundary:tmux-adapter`: every shared lifecycle action, including member stop/reconcile and registration-evidence validation, is implemented or returns `CapabilityMissing`; guarded/idempotent mutations pass the shared stateful double without duplicate sessions on one host while same-name sessions on another host remain valid.
- The adapter exposes the explicit tmux path through the guarded launcher contract; adapter fixtures drive it only through the B3B stateful double and never claim a real CLI, daemon, SSH, or active-agent integration.
- Unsupported capabilities return actionable stable errors; adapter tests, lint/build, and boundary validation pass.
- Multi-variant fixtures select the explicit tmux variant's branch/runtime binding, ordered prompts, and assigned members without defaulting to or merging another variant.

Every deliverable is production-ready for the tmux adapter boundary.
