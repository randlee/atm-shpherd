---
id: b-11-editor-actions
bead: shp-phase-b.12
status: planned
closure_type: integration
target_boundary: client-command-experience
requirements: [REQ-DEFINITION, REQ-UI-COMMAND]
adrs: [ADR-SHP-003, ADR-SHP-005, ADR-SHP-008]
owned_paths:
  - clients/src/features/editor/**
  - clients/src/features/actions/**
  - clients/tests/editor/**
  - clients/tests/actions/**
  - tests/integration/api-command/**
relations:
  must_follow:
    - sprint: b-10-dashboard
      artifact: authenticated-shared-client-shell
    - sprint: b-5-definition-service
      artifact: real-definition-command-service
    - sprint: b-9b-launch-leases
      artifact: guarded-launch-command
    - sprint: b-9c-expand-roster
      artifact: idempotent-roster-expansion-command
  parallel_safe: [b-12a-daemon-supervision]
recommended_agent: full-stack-client-developer
recommended_model: workhorse
---

# B11 — Port editor and launch actions

## Goal

Close the real authenticated command composition and equivalent browser/desktop editor and action experience.

## Required work and deliverables

- Port definition editor, discovery/import, start/stop/focus, launcher/host selection, confirmations/errors, and roster expansion through authenticated daemon commands.
- Keep browser and desktop Tauri command capability equivalent with Herdr preselected and tmux explicit.

```ts
export interface ShpherdCommandClient {
  execute(command: CommandEnvelope): Promise<{ requestId: string; revision?: number }>;
}
```

All editor and action mutations use this interface and render the frozen `ErrorEnvelope`; no platform adapter may bypass it.

## Relationships

`must_follow` B10's authenticated client shell, B5's real definition command service, B9B's guarded launch command, and B9C's idempotent roster-expansion command.

## This sprint does not close

No mobile packaging/native capability proof; B11A owns it.

## Acceptance and validation

- Real B5 definition commands, B9B guarded launches, and B9C roster mutations compose through the B10A boundary; browser and desktop E2E cover atomic edits, read-only discovery until import, typed confirmations/errors, Herdr default, tmux override, remote ownership, and idempotent expansion.
- Responsive phone layouts pass shared-web tests.

Every deliverable is production-ready for client command integration.
