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

- Begin this scmux feature/UI migration only after B1 has installed and tested the sc-runtime 0.1.1 templates and B2 has integrated that generated workspace baseline.
- B11 may start while sc-runtime 0.2.0 is unavailable, but if 0.2.0 is released first, the B2-installed release gate must make the Shpherd 0.2.0 upgrade the next work started and that upgrade must finish before B11 begins or resumes.
- Port atomic Team-bundle create/edit plus move/clone/unlink/import, discovery, the split read/guarded launcher lifecycle, host enrollment/project binding selection, tagged outcome confirmations/errors, and add/update/remove roster workflows through authenticated daemon commands, following the corresponding editor/action behaviors and parity mappings recorded in `docs/porting/scmux-behavior-oracle.md`.
- Keep browser and desktop Tauri command capability equivalent with Herdr preselected and tmux explicit.

```ts
export interface ShpherdCommandClient {
  execute(command: CommandEnvelope): Promise<ResponseEnvelope>;
}
```

All editor and action mutations use this interface and render the frozen `ErrorEnvelope`; no platform adapter may bypass it.

## Relationships

`must_follow` B10's authenticated client shell, B5's real definition command service, B9B's guarded launch command, and B9C's idempotent roster-expansion command.

## This sprint does not close

No mobile packaging/native capability proof; B11A owns it.

## Acceptance and validation

- Real B5 hierarchy commands, B9B guarded lifecycle, and B9C add/update/remove mutations compose through B10A; browser/desktop E2E cover Team-bundle validity, aggregate revisions/running constraints/clone policy, completed/accepted/replayed/conflict/rejected outcomes, read-only launch actions during lease outage, mutation guard failures, read-only discovery until import, typed errors, Herdr default, tmux override, host enrollment/project checkout health, remote ownership, roster evidence, member-scoped reconcile, and idempotent recovery. Multi-variant edit/clone/launch fixtures preserve stable member associations, ordered prompts, typed branch refs, and distinct per-variant backend/runtime bindings through API round trip and rendered editor state.
- Responsive phone layouts pass shared-web tests.

Every deliverable is production-ready for client command integration.
