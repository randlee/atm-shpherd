# scmux behavior oracle

## Purpose and provenance

This document is the behavior oracle for the scmux-to-atm-shpherd port. It
records observable product behavior and invariants, rather than a crate-level
implementation to copy. A port is conformant when it preserves the behaviors
marked **retain** while meeting the stronger atm-shpherd PRD boundaries.

| Source | Pinned revision | Evidence used |
| --- | --- | --- |
| scmux | `91928539961cd4638354a3cd635bc948daa099d6` | `docs/requirements.md`, `docs/architecture.md`, `docs/schema.sql`, `docs/example-session.json`, `crates/scmux-daemon/src/{api,definition_writer,runtime,tmux_poller,start_cycle,tmux}.rs`, and `dashboard/team-dashboard.jsx` |
| atm-shpherd | this repository's `docs/atm-shpherd-prd.md` | Port target and explicit product choices |
| ATM | `e0758566349dd4b240a45b569d3b3b3e862343c0` | See [`../integrations/atm-hmux-contract.md`](../integrations/atm-hmux-contract.md) |

The scmux checkout was inspected read-only. Its untracked `.env` and `.sc/`
were neither read nor used. The fixtures in [`../../fixtures/scmux`](../../fixtures/scmux)
are sanitized, synthetic derivatives of the cited public source examples.

## Terms and hierarchy

**Retain.** The catalog is a hierarchy of `Armada -> Fleet -> optional
Flotilla -> Crew -> {CrewMember, CrewVariant}`. Armada/Fleet/Flotilla are
organization and view constructs; a Crew is the operational unit; a variant
binds an operational Crew to a concrete host/path/repository/branch context.
`crew_ulid` is the stable cross-host identity and the crew name is
immutable-by-default so it can remain aligned with its ATM team identity.

Evidence: scmux `docs/requirements.md` §§2, 4.2, 4.6; `docs/architecture.md`
§§5-6; `definition_writer.rs` `NewCrewBundle`, `CrewVariantInput`, and
`patch_crew_bundle`.

**Port decision.** The product API may call the operational object “Team,” as
the PRD does, but the import model must preserve the source distinction between
the stable team/crew identity, an organization reference, and a host variant.
Do not collapse an Armada clone into a second runtime.

## Durable definitions versus observation

**Retain.** Definitions are durable only through one writer service. The
writer validates a whole bundle and commits complex changes atomically. tmux,
host, CI, and ATM pollers build an in-memory runtime projection; they do not
turn discovered state into definitions, reconstruct deleted definitions, or
persist runtime truth.

**Retain.** A failed start or poll for one crew is scoped to that crew. It
must record/return an error without stopping or rewriting unrelated crews.
Runtime state remains a projection (`stopped`, `starting`, `running`, `idle`,
and `done` policy in the desired model), not an alternate definition store.

Evidence: scmux `docs/requirements.md` INV-01..INV-07 and RT-04..RT-05;
`docs/architecture.md` §§2-4, 7; `tmux_poller.rs` (projection then per-session
start cycle); `start_cycle.rs` (per-session errors are marked and continued);
`runtime.rs` (in-memory status); and `api.rs` `/runtime/*` and `/discovery`.

**Port decision.** The shpherd daemon, rather than any browser, desktop, or
mobile client, is the sole writer and action owner. Poller adapters must have
no write capability to shpherd definitions.

## Definition-writer workflow

**Retain.** Multiple routes and UI affordances may request edits, but every
persistent mutation follows this logical sequence:

1. Read current definition and validate the requested hierarchy and payload.
2. Apply the complete create/edit/move/clone/unlink operation in one
   transaction.
3. Publish the refreshed catalog only after commit; on failed atomicity,
   return an error and refresh from the durable state.

The source writer enforces exactly one Captain, non-empty prompt arrays, at
least one variant, and a placement whose Fleet belongs to the selected Armada
and whose Flotilla (if any) belongs to that Fleet. The PRD strengthens prompt
validation: every reference must resolve to concrete text at launch.

Evidence: scmux `definition_writer.rs` `create_crew_bundle`,
`validate_placement`, `validate_captain_count`,
`validate_startup_prompts_non_empty`, and `validate_variants_non_empty`;
`docs/requirements.md` ED-03..ED-05 and CR-01..CR-05.

## Create, edit, move, clone, and unlink

| Workflow | Retained behavior | Required port interpretation |
| --- | --- | --- |
| Create | Create an Armada, Fleet, Flotilla, or atomic Crew bundle through the writer. | Reject an unresolvable placement or invalid Crew bundle before persistence. |
| Edit | Forms may be temporarily invalid, but save is atomic. Crew rename is rejected by default. | While running, permit organization-only edits but reject roster/prompt changes. |
| Move | Move the `CrewRef`/placement, not the Crew identity or live runtime. | Validate the destination Armada/Fleet/Flotilla relationship. |
| Clone Armada | Creates another view profile. | Preserve the PRD shared-reference policy; it does not duplicate a running team. |
| Clone Fleet/Crew | Source copied according to the explicit clone policy and assigned a requested placement. | Require an explicit decision between shared reference and copy-on-write. A copied operational team needs a new stable identity/ATM identity. |
| Unlink | Delete the organization reference. Source deletes the Crew only after its last reference is gone. | Preserve reference-counted cleanup; never infer it back from a discovered terminal. |

Evidence: scmux `definition_writer.rs` `clone_armada`, `clone_fleet`,
`clone_crew`, `move_crew_ref`, and `unlink_crew_ref`; `api.rs` editor routes;
and `docs/requirements.md` ED-06..ED-08 and ORG-02..ORG-04.

## Discovery and explicit import

**Retain.** Discovery is an informational view of unregistered terminal
sessions/windows/panes. It is read-only. Only a deliberate import supplies a
destination hierarchy, variant binding, and member intent, then calls the same
definition writer used by normal create. Empty discovered sessions cannot be
imported.

Evidence: scmux `docs/requirements.md` DI-01..DI-04; `api.rs` `/discovery`,
`/runtime/discovery/unregistered`, and `import_discovery_session`;
`dashboard/team-dashboard.jsx` `DiscoveryView`.

**Port decision.** Import is an operator-confirmed conversion, not a recovery
mechanism. Imported terminal metadata is provenance/evidence only; it must not
overwrite an existing ATM roster or create a roster member implicitly.

## Launch, observe, stop, and focus

**Retain launch guard.** A launch resolves exactly one eligible variant for the
target host, then checks host/path/repository binding, configuration, and
required prompts before any spawn. Invalid configuration blocks a new launch
but does not force-stop an already-running crew. Scope commands support Crew,
Flotilla, Fleet, and Armada.

**Retain observe.** Runtime observation is pane/member scoped. It reports
configured versus unregistered runtime and host/CI/ATM snapshots without
changing durable definitions. `doctor` is the operational diagnostic surface.

**Retain stop/focus.** Stop targets only the selected crew runtime and should
first request graceful shutdown; any terminal-force fallback remains explicitly
scoped. Focus/jump is viewer attach behavior and is never evidence of a
definition or a launch.

Evidence: scmux `docs/requirements.md` RT-01..RT-06, AH-01..AH-04, ORG-01;
`api.rs` `start_session`, `stop_session`, and `jump_session`; `tmux.rs`;
`runtime.rs`; and `dashboard/team-dashboard.jsx` `JumpModal` and
`runStartStop`.

**Port decision.** Shpherd obtains its own domain lease/fencing before hmux
dynamic spawn. A client never executes hmux, opens a store, or decides a
lease. The daemon records enough action evidence to reconcile a crash between
roster registration and runtime spawn.

## Dashboard catalog and editor

**Retain.** The dashboard offers a live catalog in grouped, grid, and list
forms, filtering/search, health/runtime badges, start/stop, and focus/jump. A
separate editor reads the hierarchy and offers create, clone, move, and unlink
operations. Discovery is visibly informational and separate from editing.

Evidence: scmux `dashboard/team-dashboard.jsx` `Dashboard`,
`OrganizationEditorModal`, `ProjectEditorModal`, and `DiscoveryView`; `api.rs`
`/editor/state`, `/editor/*`, `/sessions`, `/hosts`, and `/discovery`.

**Port decision.** Shpherd's browser and Tauri surfaces consume the same
authenticated daemon API. They display validation/action results but contain
no direct SQL, ATM, hmux, lease, or business-mutation implementation.

## Acceptance-oriented invariants

1. A poller cannot create, change, or resurrect a durable definition.
2. A Crew has one Captain, non-empty concrete prompt references, an eligible
   variant, stable identity, and valid hierarchy placement before launch.
3. A failed mutation is atomic; a failed Team A action never stops or mutates
   Team B.
4. Moving/unlinking affects only the reference and obeys reference-counted
   cleanup.
5. Discovery remains read-only until a user-import route invokes the writer.
6. A launch validates before side effects, observes after side effects, and
   rejects duplicate concurrent action/lease ownership.
7. Focus is viewer-only; stop is target-scoped; runtime evidence never becomes
   definition truth.
8. A roster-expansion retry cannot create a second ATM member or a second
   hmux/Herdr pane; see the ATM/hmux contract.

## Product decisions still required

The PRD intentionally leaves these unresolved; an implementation must not
silently select one:

1. The exact shared host-aggregate rows, local-only columns, provenance, and
   incompatible catalog/launch revision conflict policy.
2. Domain lease/fencing lifetime, holder identity, recovery, and reconciliation
   rules.
3. Enrollment/authentication and logical-project to target-host checkout
   binding.
4. The ATM catalog projection/table-version contract and the roster-field
   mapping.
5. hmux capability/version negotiation, dynamic-spawn result contract, and
   fallback behavior.
6. The shared-reference versus copy-on-write semantics for each clone action,
   especially the externally visible ATM identity of a copied Crew.
7. Whether an optional MCP surface is enabled and, if so, its authorization
   model.
