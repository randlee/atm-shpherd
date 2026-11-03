---
id: b-7-herdr-launcher
bead: shp-phase-b.8
status: planned
closure_type: boundary
target_boundary: herdr-hmux-adapter
recommended_agent: rust-integration-developer
recommended_model: deep-reasoning
---

# B7 — Implement the Herdr-first hmux launcher

requirements: ANC-008, REQ-LAUNCH, REQ-ATM.
adrs: ADR-SHP-004, ADR-SHP-005, ADR-SHP-007.

## Deliverables and owned paths

- Implement local normalized-definition Herdr adapter using capability-checked hmux with closed launcher dispatch.
- Cover `.atm.toml` `[rmux]`, create/reuse workspace, tab/pane identity, dry-run, named-pane relaunch, restart name repair, bash/pwsh, selected/spare-tab dynamic spawn, ATM setup/registration coordination, supported type/model, nudge routing, and structured reuse/result evidence.
- All side effects require `LaunchLeaseGuard`; adapter-level retry uses the idempotency key. Owned paths: Herdr/hmux daemon adapter and simulator tests.

## Relationships

`must_follow` B6 observation, B6A normalized ATM facts, B3A launcher/hmux contracts, and B4 representable metadata. Parallel-safe with B8.

## This sprint does not close

Only local adapter behavior is closed. Cross-host hydration, lease acquisition/fencing, and end-to-end roster expansion close in B9A/B9B/B9C.

## Acceptance and validation

- Unset launcher selects Herdr; local start/stop/observe/focus and every hmux capability above pass simulator/contract tests.
- No unguarded spawn API exists; retry/restart cannot duplicate a pane; typed failures preserve definitions.

Every deliverable is production-ready for the Herdr adapter boundary.
