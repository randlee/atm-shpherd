---
id: b-3-runtime-upgrade-interrupt
bead: shp-phase-b.3
status: planned
closure_type: integration
target_boundary: runtime-workspace
recommended_agent: rust-integration-developer
recommended_model: workhorse
---

# Interrupt — Upgrade to sc-runtime 0.2.0

requirements: ANC-003, ANC-004, ANC-005, REQ-BOOTSTRAP.
adrs: ADR-SHP-001.

## Deliverables and owned paths

- When `v0.2.0` exists, diff fresh 0.1.1/0.2.0 generations from identical answers and apply managed dependency/template changes without overwriting app work.
- Install the release-provided sc-lint consumer assets with minimum version 0.8.4.
- Owned paths: runtime-managed root manifests, `.sc-lint/**`, generated CI/setup assets, `docs/evidence/runtime-upgrade/**`.

## Relationships

`must_follow` B2 because it upgrades the integrated workspace. It preempts newly started feature work after release; safe in-progress work may reach one checkpoint.

## This sprint does not close

No Shpherd feature or schema behavior is changed except compatibility required by the release.

## Acceptance and validation

- `req:ANC-003..005`: release tag, dependency diff, and sc-lint 0.8.4+ install are evidenced.
- Setup, lint, compatibility/version checks, workspace tests/builds, client check, and Tauri checks pass.

Every deliverable is production-ready for integration closure and leaves the repository on supported published dependencies.
