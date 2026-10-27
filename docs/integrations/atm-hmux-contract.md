# ATM and hmux command boundary

## Status and provenance

This is a planning contract, not an implementation or a claim that hmux has a
stable machine-readable protocol today. ATM statements are evidence-backed
against commit `e0758566349dd4b240a45b569d3b3b3e862343c0`, inspected read-only.
hmux requirements are the atm-shpherd product contract in
`docs/atm-shpherd-prd.md` §§9-11. No hmux source checkout was assumed or
modified.

## Ownership boundary

| Concern | Current owner/evidence | atm-shpherd boundary |
| --- | --- | --- |
| Catalog and canonical roster | ATM SQLite is the upstream catalog source; the retained roster surface in `atm-core/src/team_admin.rs` and `team_admin/member_mutation.rs` exposes member list/add/update/remove. | Ordinary catalog ingestion is a Shpherd-owned, versioned, read-only ATM SQLite importer over the defined projection. It never writes ATM SQLite. CLI JSON is reserved for roster mutation/reconciliation and optional advisory projections. |
| Roster mutation | `atm teams add-member`, `update-member`, and `remove-member` in `crates/atm/src/commands/teams.rs`. | The daemon service, after an explicit operator intent and domain validation, is the only Shpherd caller. |
| Runtime member status | `atm members --team <team> --json` overlays runtime observation; unavailable observation is represented explicitly rather than as “dead.” `crates/atm/src/commands/members.rs`. | Import as observation/evidence; never persist it as definition truth. |
| Herdr process integration | ATM carries backend/target/session/alias metadata; `atm-herdr` is intentionally a leaf adapter and has no direct roster/SQLite writes (`docs/atm-herdr/boundaries.md`). | hmux owns the compatible Herdr workspace/pane creation and agent command construction. |
| Team policy, lease, intent, reconciliation | Not owned by ATM or hmux. | Owned by Shpherd service and durable action/intention records. |

## ATM command capabilities evidenced today

Ordinary catalog ingestion uses the versioned, read-only ATM SQLite importer
specified by PRD §9; its source revision/fingerprint is part of the imported
evidence. Shpherd never writes ATM SQLite. Executable ATM commands and their
structured JSON are the boundary for roster mutation and reconciliation, and
their version/capability evidence must be recorded. Optional picker projections
do not replace the authoritative catalog importer.

| Command | Evidence-backed behavior | Integration use |
| --- | --- | --- |
| `atm teams --json --members` | Emits a picker projection from retained roster plus live runtime status. See `crates/atm/src/commands/teams.rs` and `atm-core/src/picker_projection.rs`. | Optional advisory picker/read projection; it is not the ordinary catalog importer. |
| `atm members --team <team> --json` | Lists the canonical roster for one selected team and overlays runtime observation. If runtime is unavailable or incomplete, the command marks affected status unavailable/unknown instead of silently reporting them stopped. See `crates/atm/src/commands/members.rs`. | Reconcile the post-mutation roster and retain runtime evidence separately. |
| `atm teams add-member <team> <member> ... --json` | Validates team/name; creates a canonical roster row (and inbox on the current retained path); rejects an existing member. Supports type/model, host, backend, target/session, and alias metadata. See `teams.rs` and `team_admin/member_mutation.rs` `add_member_with_roster_store`. | Register a new member only after Shpherd has persisted an expansion intent. A duplicate error is a reconciliation signal, never permission to create a second runtime pane. |
| `atm teams update-member <team> <member> ... --json` | Changes existing member metadata; requires member existence, validates caller authorization and backend/name constraints. | Repair/update metadata only under an explicit service operation. |
| `atm teams remove-member <team> <member> --json` | Requires target membership and authorization; removes a roster row but explicitly does not remove inbox data. | Explicit removal/reconciliation operation; never infer removal from a missing pane. |

`atm team` (singular) is not the command boundary. The product target uses
`atm teams` (plural), as stated in the PRD.

## Roster registration ownership and idempotency

The source evidence establishes that ATM rejects duplicate member creation; it
does **not** make a multi-system expansion transaction idempotent by itself.
Shpherd must own this workflow:

1. Validate authorization, target host, Team/variant ownership, role/name
   uniqueness, configuration, and declared launcher capability.
2. Persist a durable intent keyed by logical team variant plus member identity
   and an operation/idempotency key, before calling either external system.
3. Read/reconcile current ATM roster. If the desired canonical member already
   exists and matches the request, record `roster_registered`; if it conflicts,
   stop with a typed conflict.
4. Otherwise call `atm teams add-member ... --json`; capture command version,
   request fingerprint, structured result, and observed roster revision.
5. Re-import/reconcile `atm members --team <team> --json` before attempting a
   spawn. ATM acknowledgement alone is insufficient.
6. Acquire/verify the current Shpherd launch lease, then call hmux dynamic
   spawn using the same operation key and an explicit selected/spare tab.
7. Observe the Herdr pane/agent and ATM runtime roster. Complete only when
   both roster and runtime evidence identify the intended member.

If registration succeeds but spawn fails, persist `registered_not_running`.
Retry begins with reconciliation and must reuse the same intent/key; it must
not call `add-member` blindly or create a second pane. This directly realizes
PRD §11 and acceptance criterion 9.

## hmux capability contract required before implementation

The PRD requires Shpherd to capability-check hmux rather than recreate agent
command construction. A compatible hmux executable must declare, at minimum:

1. `.atm.toml` `[rmux]` parsing without a second launch format;
2. create-or-reuse of a Herdr workspace keyed by `ATM_TEAM`, including tab and
   labelled-pane mapping;
3. dry-run validation, named-pane relaunch, and post-restart agent-name repair;
4. bash and pwsh launch support;
5. dynamic spawn into an explicit selected/spare tab with ATM identity/team
   setup, roster registration coordination, and supported type/model launch;
6. a stable result describing workspace/tab/pane/agent identity plus whether a
   pre-existing resource was reused; and
7. ATM nudge routing to the Herdr pane surface.

The exact command names, JSON envelopes, version range, dry-run semantics,
resource identity, failure codes, and fallback to tmux are not yet evidenced.
They are product decisions, not permission to invent a second launch protocol.

## Gaps that require an explicit decision

1. Which ATM SQLite catalog projection/table version is supported and how its
   source revision/fingerprint is derived.
2. Which fields map between Shpherd member definitions and ATM `agent_type`,
   `model`, `backend`, `target`, `session`, `alias`, and `host` without leaking
   paths, mail, or credentials to PostgreSQL or telemetry.
3. The Shpherd idempotency-key format, durable action state machine, lease
   fencing rules, and crash recovery/retry policy.
4. Whether hmux itself calls `atm teams add-member` or receives proof that
   Shpherd already did. Exactly one component must own registration for an
   expansion intent.
5. The hmux capability discovery/version negotiation command and its structured
   response, including how dry-run proves spawn feasibility without mutation.
6. How Shpherd recognizes an already-created Herdr pane across a restart and
   prevents a duplicate when ATM registration succeeded first.
7. The authorization identity presented to ATM commands when Shpherd acts on
   behalf of an operator, and audit/redaction requirements for command output.
