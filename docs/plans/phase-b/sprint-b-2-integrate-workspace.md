---
id: b-2-integrate-workspace
bead: shp-phase-b.2
status: planned
closure_type: contract
target_boundary: generated-workspace
recommended_agent: rust-integration-developer
recommended_model: workhorse
---

# B2 — Integrate the generated workspace

requirements: ANC-002, REQ-BOOTSTRAP, REQ-API, REQ-UI; PRD §§4-5.
adrs: ADR-SHP-001, ADR-SHP-003, ADR-SHP-008.

## Deliverables and owned paths

- Reconcile the proven generated workspace with existing PRD, oracle, browser/Tauri client, tests, and history without wholesale replacement.
- Establish app-named crates, binaries `shpherd`/`atm-shpherd`, bundle id `com.synapticcanvas.shpherd`, `.shpherd/` runtime paths, and machine-readable boundary manifests.
- Remove generated widget/general-database production commands; retain only named Shpherd surfaces.
- Preserve desktop icon/window/tray/deep-link/notification scaffolding and pin `@synaptic-canvas/sc-observability` with a nonthrowing browser/no-op adapter.
- Owned paths: root Rust manifests, `crates/**` initial skeletons, `boundaries/**`, `clients/package*.json`, generated setup/lint assets, repository configuration.

## Relationships

`must_follow` B1: consumes the generated-tree digest. All later Rust sprints consume B2 package and manifest paths.

## This sprint does not close

Crate skeletons contain no migrated domain behavior. B3/B3A and later boundary sprints own implementations.

## Acceptance and validation

- One coherent workspace passes generated setup/lint/test/build gates and existing client checks.
- Boundary manifests encode the dependency graph in `docs/architecture.md`.
- No production raw-row command, local sc-runtime patch, scmux config path, or committed secret remains.
- Desktop identity and observability package/no-op browser adapter have smoke tests; telemetry failure cannot fail an action.

Every deliverable is production-ready for contract closure: skeletons compile, manifests validate, and retained product assets remain usable.
