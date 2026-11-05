---
id: b-11-editor-actions
bead: shp-phase-b.12
status: planned
closure_type: integration
target_boundary: client-command-experience
requirements: [REQ-DEFINITION, REQ-UI-COMMAND]
adrs: [ADR-SHP-003, ADR-SHP-004, ADR-SHP-005, ADR-SHP-008, ADR-SHP-011, ADR-SHP-013, ADR-SHP-014]
owned_paths:
  - clients/src/features/editor/**
  - clients/src/features/actions/**
  - clients/tests/editor/**
  - clients/tests/actions/**
  - tests/integration/api-command/**
relations:
  must_follow:
    - sprint: b-2-integrate-workspace
      artifact: shared-client-shell
    - sprint: b-10a-daemon-api
      artifact: authenticated-command-client-boundary
    - sprint: b-5-definition-service
      artifact: real-definition-command-service
    - sprint: b-9b-launch-leases
      artifact: guarded-launch-command
    - sprint: b-9c-expand-roster
      artifact: idempotent-roster-expansion-command
  parallel_safe: [b-10-dashboard, b-12a-daemon-supervision]
recommended_agent: full-stack-client-developer
recommended_model: workhorse
---

# B11 — Port editor and launch actions

## Goal

Close the real authenticated command composition and equivalent browser/desktop editor and action experience.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests, B2, and this sprint's integration prerequisites must close before feature/UI migration; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Port atomic Team-bundle create/edit plus move/clone/unlink/import, discovery, the split read/guarded launcher lifecycle, host enrollment/project binding selection, tagged outcome confirmations/errors, and add/update/remove roster workflows through authenticated daemon commands, following the corresponding editor/action behaviors and parity mappings recorded in `docs/porting/scmux-behavior-oracle.md`.
- Keep browser and desktop Tauri command capability equivalent with Herdr preselected and tmux explicit. An SSH-connected operator can invoke the same authenticated Shpherd commands noninteractively to start a Herdr session with active agents by default or an explicitly selected tmux session with active agents.

```ts
export interface ShpherdCommandClient {
  execute(command: CommandEnvelope): Promise<ResponseEnvelope>;
}
```

All editor and action mutations use this interface and render the frozen `ErrorEnvelope`; no platform adapter may bypass it.

## Relationships

`must_follow` B2's shared client shell, B10A's authenticated command-client boundary, B5's real definition command service, B9B's guarded launch command, and B9C's idempotent roster-expansion command. B11 is parallel-safe with B10 because their command and read application paths are disjoint and both consume the B2/B10A-owned client contracts.

## This sprint does not close

No dashboard read composition or mobile packaging/native capability proof; B10 and B11A own those independently.

## Acceptance and validation

- Real B5 hierarchy commands, B9B guarded lifecycle, and B9C add/update/remove mutations compose through B10A; browser/desktop E2E cover Team-bundle validity, aggregate revisions/running constraints/clone policy, completed/accepted/replayed/conflict/rejected outcomes, read-only launch actions during PostgreSQL outage, host-local mutation-guard failures, read-only fleet discovery until explicit local import, typed errors, Herdr default, tmux override, host enrollment/project checkout health, concurrent same-name instances on different hosts, roster evidence, member-scoped reconcile, and idempotent recovery. Runtime state for each running team is observed from authoritative ATM data and is never inferred from a stored Shpherd definition. PostgreSQL supplies a combined read-only fleet view containing concrete teams from two computers without acquiring launch authority. Multi-variant edit/clone/launch fixtures preserve stable member associations, ordered prompts, typed branch refs, and distinct per-variant backend/runtime bindings through API round trip and rendered editor state.
- Responsive phone layouts pass shared-web tests.

Every deliverable is production-ready for client command integration.
