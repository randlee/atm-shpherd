---
id: b-11-editor-actions
bead: shp-phase-b.12
status: planned
closure_type: integration
target_boundary: client-command-experience
recommended_agent: full-stack-client-developer
recommended_model: workhorse
---

# B11 — Port editor and launch actions

requirements: ANC-007, ANC-008, ANC-009, REQ-UI, REQ-LAUNCH, REQ-ATM.
adrs: ADR-SHP-003, ADR-SHP-005, ADR-SHP-008.

## Deliverables and owned paths

- Port definition editor, discovery/import, start/stop/focus, launcher/host selection, confirmations/errors, and roster expansion through authenticated daemon commands.
- Keep browser and desktop Tauri command capability equivalent with Herdr preselected and tmux explicit.
- Owned paths: `clients/src/features/editor/**`, `clients/src/features/actions/**`, action E2E tests.

## Relationships

`must_follow` B10 read client, B10A commands, B7/B8 launchers, B9B leases, and B9C roster workflow.

## This sprint does not close

No mobile packaging/native capability proof; B11A owns it.

## Acceptance and validation

- Browser and desktop E2E cover atomic edits, read-only discovery until import, typed confirmations/errors, Herdr default, tmux override, remote ownership, and idempotent expansion.
- Responsive phone layouts pass shared-web tests.

Every deliverable is production-ready for client command integration.
