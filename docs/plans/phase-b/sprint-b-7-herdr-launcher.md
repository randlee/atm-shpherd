---
id: b-7-herdr-launcher
bead: shp-phase-b.8
status: planned
closure_type: boundary
target_boundary: herdr-hmux-adapter
requirements: []
adrs: [ADR-SHP-004, ADR-SHP-005, ADR-SHP-007]
owned_paths:
  - crates/shpherd-daemon/src/adapters/herdr/**
  - crates/shpherd-daemon/tests/herdr/**
  - tests/fixtures/hmux/**
relations:
  must_follow:
    - sprint: b-3b-service-launch-api-contract
      artifact: guarded-launcher-interface-and-lease-guard-double
    - sprint: b-3c-external-integration-contract
      artifact: hmux-capability-schema-and-simulator
  parallel_safe: [b-8-tmux-launcher, b-10a-daemon-api]
recommended_agent: rust-integration-developer
recommended_model: deep-reasoning
---

# B7 — Implement the Herdr-first hmux launcher

## Goal

Close the local Herdr/hmux adapter behind the guarded launcher contract without taking ownership of cross-host leasing.

## Required work and deliverables

- Implement local normalized-definition Herdr adapter using capability-checked hmux with closed launcher dispatch.
- Cover `.atm.toml` `[rmux]`, create/reuse workspace, tab/pane identity, dry-run, named-pane relaunch, restart name repair, bash/pwsh, selected/spare-tab dynamic spawn, ATM identity plus proof-of-registration handoff, supported type/model, nudge routing, and structured reuse/result evidence.
- All side effects require `LaunchLeaseGuard`; adapter-level retry uses the idempotency key. Owned paths: Herdr/hmux daemon adapter and simulator tests.

## Relationships

`must_follow` B3B's guarded launcher/lease double and B3C's hmux capability simulator. It is parallel-safe with B8 and the other layer sprints named in frontmatter.

## This sprint does not close

Only local adapter behavior is closed. Cross-host hydration, lease acquisition/fencing, and composed roster expansion close in B9A/B9B/B9C.

## Acceptance and validation

- `boundary:herdr-hmux-adapter`: every hmux capability and guarded start/stop/observe/focus mapping passes simulator/contract tests.
- No unguarded spawn API or ATM mutation exists in this adapter; retry/restart cannot duplicate a pane; typed failures preserve definitions.

Every deliverable is production-ready for the Herdr adapter boundary.
