---
id: b-2-integrate-workspace
bead: shp-phase-b.2
status: planned
closure_type: contract
target_boundary: generated-workspace
requirements: []
adrs: [ADR-SHP-001, ADR-SHP-003, ADR-SHP-008]
owned_paths:
  - Cargo.toml
  - Cargo.lock
  - crates/*/Cargo.toml
  - crates/*/src/lib.rs
  - boundaries/index.yaml
  - boundaries/_schema/**
  - clients/package.json
  - clients/pnpm-lock.yaml
  - clients/src/platform/shell/**
  - .sc-lint/**
  - crates/*/README.md
  - docs/testing-and-platforms.md
  - docs/issues-inventory.md
  - docs/architecture.md
  - docs/adr/README.md
  - docs/adr/ADR-SHP-001.md
  - docs/adr/ADR-SHP-003.md
  - docs/adr/ADR-SHP-008.md
relations:
  must_follow:
    - sprint: b-1-generate-baseline
      artifact: proven-generated-tree-digest
  parallel_safe: []
recommended_agent: rust-integration-developer
recommended_model: workhorse
---

# B2 — Integrate the generated workspace

## Goal

Establish one buildable generated Shpherd workspace without losing the recovered product assets or crossing the sc-runtime boundary.

## Required work and deliverables

- Reconcile the proven generated workspace with existing PRD, oracle, browser/Tauri client, tests, and history without wholesale replacement.
- Establish app-named crates, binaries `shpherd`/`atm-shpherd`, bundle id `com.synapticcanvas.shpherd`, `.shpherd/` runtime paths, and machine-readable boundary manifests.
- Remove generated widget/general-database production commands; retain only named Shpherd surfaces.
- Preserve desktop icon/window/tray/deep-link/notification scaffolding and pin `@synaptic-canvas/sc-observability` with a nonthrowing browser/no-op adapter.
- Seed each app crate README with its responsibility, allowed dependencies, prohibited policy, and boundary-manifest link; retain the shared Phase B platform/test matrix.
- Maintain the deterministic Phase B child/sprint inventory classification and bijection check in `docs/issues-inventory.md`.

## Relationships

`must_follow` B1: consumes the generated-tree digest. All later Rust sprints consume B2 package and manifest paths.

## This sprint does not close

Crate skeletons contain no migrated domain behavior. B3/B3A and later boundary sprints own implementations.

## Acceptance and validation

- One coherent workspace passes generated setup/lint/test/build gates and existing client checks.
- Boundary manifests encode the dependency graph in `docs/architecture.md`.
- No production raw-row command, local sc-runtime patch, scmux config path, or committed secret remains.
- Desktop identity and observability package/no-op browser adapter have smoke tests; telemetry failure cannot fail an action.
- Every generated app crate has ownership/dependency documentation, and the platform matrix names a concrete owner and evidence gate for every supported surface.
- The issue-inventory check proves exactly 25 unique current implementation children and separately classifies historical titles and plan-anchor governance records.

Every deliverable is production-ready for contract closure: skeletons compile, manifests validate, and retained product assets remain usable.
