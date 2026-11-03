---
id: b-13-release-certification
bead: shp-phase-b.14
status: planned
closure_type: integration
target_boundary: phase-release
recommended_agent: release-qa-developer
recommended_model: deep-reasoning
---

# B13 — Certify parity and release readiness

requirements: ANC-001..ANC-010, REQ-BOOTSTRAP, REQ-SCHEMA, REQ-DEFINITION, REQ-LAUNCH, REQ-ATM, REQ-SYNC, REQ-LEASE, REQ-API, REQ-UI, REQ-SCHEDULE, REQ-OPERATE.
adrs: ADR-SHP-001..ADR-SHP-010.

## Deliverables and owned paths

- Run the final oracle, migration, sync, launcher, API, client, mobile, scheduler, supervision, security, upgrade, and platform gauntlet; close only evidence-backed gaps.
- Record exact performance hardware/tools and anchor development-gate reports. If sc-runtime 0.2.0 exists, the interrupt must be complete.
- Owned paths: release evidence, approved gap fixes in explicitly assigned follow-up branches, release notes.

## Relationships

`must_follow` every integration sprint whose feature acceptance it certifies. It does not make unrelated implementation tracks wait before their own integration closure.

## This sprint does not close

No new feature or deferred redesign; AI/context graph work remains out of scope.

## Acceptance and validation

- Retained scmux capabilities map to tests or approved exclusions; parity precedes extensions; Herdr-default/tmux-explicit, sync/fencing, API, scheduling, and supervision pass.
- Full Rust/client gates pass with macOS/Linux/Windows desktop evidence and B11A iOS/Android build plus simulator/emulator evidence.
- Every Phase B anchor development gate passes; no open P0/P1 defect remains.

Every deliverable is production-ready for phase release integration.
