---
id: b-7-herdr-launcher
bead: shp-phase-b.8
status: planned
closure_type: boundary
target_boundary: herdr-hmux-adapter
requirements: [ANC-002, ANC-008, ANC-011, ANC-013, REQ-LAUNCH, REQ-ATM]
adrs: [ADR-SHP-004, ADR-SHP-005, ADR-SHP-007]
owned_paths:
  - crates/shpherd-launchers/src/herdr/**
  - crates/shpherd-launchers/tests/herdr/**
  - tests/fixtures/hmux/**
relations:
  must_follow:
    - sprint: b-3b-service-launch-api-contract
      artifact: guarded-launcher-interface-and-host-operation-double
    - sprint: b-3c-external-integration-contract
      artifact: hmux-capability-schema-and-simulator
  parallel_safe: [b-8-tmux-launcher, b-10a-daemon-api]
recommended_agent: rust-integration-developer
recommended_model: deep-reasoning
---

# B7 — Implement the Herdr-first hmux launcher

## Goal

Close the independent local Herdr/hmux adapter behind the guarded launcher contract without inventing cross-host ownership.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests, B2, and B3B/B3C must close before this sprint; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Implement the boundary-allowlisted local Herdr adapter selected when the guarded launcher contract supplies the default Herdr backend, using capability-checked hmux and the service-issued mutation guard. Adapter contract fixtures prove an omitted backend selects Herdr without composing the daemon, CLI, or SSH path.
- Cover `.atm.toml` `[rmux]`, create/reuse workspace, tab/pane identity, dry-run, named-pane relaunch, restart name repair, bash/pwsh, selected/spare-tab dynamic spawn, ATM identity plus proof-of-registration handoff, supported type/model, nudge routing, and structured reuse/result evidence.
- All mutations require `HostLaunchGuard`; adapter-level retry uses the idempotency key. Dry-run/observe/focus are read-only. Spawn validates typed current ATM roster-registration evidence; member stop/reconcile uses stable runtime identity. The guard prevents duplicate local side effects only and cannot block an identically named team on another host. Owned paths: independent Herdr/hmux adapter and simulator tests.

## Relationships

`must_follow` B3B's guarded launcher/host-operation double and B3C's hmux capability simulator. It is parallel-safe with B8 and the other layer sprints named in frontmatter.

## This sprint does not close

Only guarded local adapter behavior and simulator evidence are closed. Fleet projection, real SSH-to-CLI-to-daemon-to-launcher composition, host-local operation policy, and roster expansion close in B9A/B9B/B9C; this sprint starts no agent through a real daemon or CLI.

## Acceptance and validation

- B7 is the scmux hmux-launcher migration onto the Herdr-first adapter; dispatch validation rejects it unless B1 is complete with successful sc-runtime template-installation and baseline-test evidence.
- Process simulator tests cover deadline before spawn, cancellation during hmux execution, bounded/oversized output, terminate-then-kill escalation, process-group cleanup, ignored termination, daemon crash, and idempotent recovery for not-started versus outcome-unknown mutations.

- `boundary:herdr-hmux-adapter`: read/mutation split, dry-run/start/stop/observe/focus/relaunch/repair/dynamic-spawn/nudge/member-stop/member-reconcile, shell/version negotiation, registration evidence, stable identity, reuse, host-local single-flight, idempotency, and stable errors pass simulator/contract tests.
- Compile-fail tests reject every mutation without a guard. Crash-after-registration, stale/repeated evidence, removal, unrelated-pane preservation, and concurrent same-name launches on two hosts pass.
- Multi-variant fixtures select the requested variant's typed branch, Herdr backend, runtime binding, ordered prompts, and only its assigned members; another variant's binding or roster never leaks into the launch.
- No unguarded spawn API or ATM mutation exists in this adapter; retry/restart cannot duplicate a pane; typed failures preserve definitions.

Every deliverable is production-ready for the Herdr adapter boundary.
