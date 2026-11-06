---
id: b-3-runtime-upgrade-interrupt
bead: shp-phase-b.3
status: planned
closure_type: integration
target_boundary: runtime-workspace
requirements: [ANC-003, ANC-004, ANC-005, REQ-BOOTSTRAP]
adrs: [ADR-SHP-001]
owned_paths:
  - Cargo.toml
  - Cargo.lock
  - .sc-lint/**
  - .github/workflows/runtime-upgrade.yml
  - docs/evidence/runtime-upgrade/upgrade/**
relations:
  must_follow:
    - sprint: b-2-integrate-workspace
      artifact: integrated-generated-workspace
  parallel_safe: []
recommended_agent: rust-integration-developer
recommended_model: workhorse
---

# Interrupt — Upgrade to sc-runtime 0.2.0

## Goal

Adopt the released runtime upgrade and its managed lint assets at the first safe checkpoint without overwriting application work.

## Required work and deliverables

- Upgrade the integrated Shpherd workspace that B1 initially generated from sc-runtime `v0.1.1` and B2 integrated only after B1 template installation and all baseline test gates passed, before any scmux feature or UI migration began.
- Once the B2 release trigger observes `v0.2.0`, make this interrupt the next Shpherd work started; no newly started feature may intervene, while already-running work may reach only one safe checkpoint.
- Diff fresh 0.1.1/0.2.0 generations from identical answers and apply managed dependency/template changes without overwriting app work.
- Install the release-provided sc-lint consumer assets with minimum version 0.8.4.
- Consume B2's recorded release-check result and bind upgrade evidence to its observed release/asset digest. This interrupt performs no detector, dispatch-hook, history, or close-validator work.

## Relationships

`must_follow` B2 because it upgrades the integrated, tested workspace. It preempts every newly started feature after release; only work already in progress may reach one safe checkpoint.

## This sprint does not close

No Shpherd feature or schema behavior is changed except compatibility required by the release.

## Acceptance and validation

- `req:ANC-003..005`: the consumed B2 trigger, release tag/digest, dependency diff, dispatch/preemption decision, and sc-lint 0.8.4+ install are evidenced.
- The interrupt evidence is accepted only when it binds the detected digest and all upgrade gates pass.
- Setup, lint, compatibility/version checks, workspace tests/builds, client check, and Tauri checks pass.

Every deliverable is production-ready for integration closure and leaves the repository on supported published dependencies.
