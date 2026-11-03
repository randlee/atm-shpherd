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
  - .github/workflows/**
  - docs/evidence/runtime-upgrade/**
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

- When `v0.2.0` exists, diff fresh 0.1.1/0.2.0 generations from identical answers and apply managed dependency/template changes without overwriting app work.
- Install the release-provided sc-lint consumer assets with minimum version 0.8.4.
- At every sprint dispatch and before B13/epic closure, write `docs/evidence/runtime-upgrade/release-trigger.json` with checked timestamp, authoritative release source, observed tag/asset digest or explicit absence, current commit, and decision. Append immutable upgrade/history evidence when the trigger fires.

## Relationships

`must_follow` B2 because it upgrades the integrated workspace. It preempts newly started feature work after release; safe in-progress work may reach one checkpoint.

## This sprint does not close

No Shpherd feature or schema behavior is changed except compatibility required by the release.

## Acceptance and validation

- `req:ANC-003..005`: release detection history, release tag, dependency diff, dispatch/preemption decision, and sc-lint 0.8.4+ install are evidenced.
- The validator fails B13 and epic closure if history shows 0.2.0 existed before certification and the interrupt's passing evidence/digest is absent; an explicit not-released observation is accepted only with source and timestamp.
- Setup, lint, compatibility/version checks, workspace tests/builds, client check, and Tauri checks pass.

Every deliverable is production-ready for integration closure and leaves the repository on supported published dependencies.
