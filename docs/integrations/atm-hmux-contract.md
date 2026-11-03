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
6. Convert the reconciled ATM command evidence into typed roster-registration
   evidence, acquire/verify the current Shpherd launch lease, then call hmux
   dynamic spawn using the same operation key and an explicit selected/spare
   tab. Missing/stale/digest-mismatched evidence fails before spawn.
7. Observe the Herdr pane/agent and ATM runtime roster. Complete only when
   both roster and runtime evidence identify the intended member.

If registration succeeds but spawn fails, persist `registered_not_running`.
Retry begins with reconciliation and must reuse the same intent/key/evidence;
it must not call `add-member` blindly or create a second pane. Remove/reconcile
uses the recorded stable runtime identity and stops no unrelated pane. This
directly realizes PRD §11 and acceptance criterion 9.

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

## Frozen Phase B projection and command contract

The executable B3C contract resolves the former reference gaps as follows:

1. ATM projection v1 records CLI version, help/schema/fixture hashes, and the
   opaque roster revision. A fingerprint mismatch is an unsupported source,
   not permission to guess a mapping.
2. Projection v1 captures ATM `id`, `name`, `role`, `agent_type`, `model`,
   `host`, `backend`, `target`, `session`, `alias`, and `target_tab`.
   `target`/`session`/`alias` remain sanitized host-local launch references;
   credentials, mail/inbox data, prompt bodies, absolute checkout paths,
   process handles, raw command output, and unknown fields are excluded from
   PostgreSQL and telemetry. ATM foreign IDs/revisions enter Shpherd only
   through an explicit fallible binding table; they are never parsed as
   Shpherd ULIDs or domain revisions.
3. Add/update/remove carry operation, expected ATM revision, and idempotency
   key but no caller claims. B10A parses/verifies transport credentials and
   uses the B2 `shpherd-auth` composition issuer to obtain a private
   `AuthenticatedPrincipal`; ATM receives only a borrow and never imports
   daemon. Evidence records operation/key/team/member,
   exact plural argv, redacted stdout hash, before/after revision, and replay
   status. Stale revisions, forged claims, scope mismatch, and unauthorized
   principals fail before invocation.
4. Shpherd alone calls the plural ATM mutation commands. hmux receives proof of
   roster registration plus a lease fencing token and never mutates ATM.
5. hmux reports a semantic version, shells, and explicit support for dry-run,
   start, stop, observe, focus, relaunch, repair, dynamic spawn, nudge,
   member-stop, and member-reconcile. Dry-run/observe/focus are fencing-free
   reads; every mutation carries fencing/idempotency. Spawn additionally carries
   typed evidence binding operation/key, ATM team/member, roster revision, and
   redacted result digest. Each request/result/error is the versioned B3C
   schema; absent capability or stale evidence is a typed failure.
6. All mutating hmux requests include the durable operation key. Results expose
   stable workspace/tab/pane/agent identity and reuse evidence so restart
   recovery reconciles instead of duplicating a pane. Member-scoped stop and
   reconcile require that identity and preserve unrelated sessions.
7. Caller authorization evidence is separate from command argv/output; secrets
   are never included in evidence, logs, PostgreSQL rows, or sync batches.

The B3C stateful doubles and `tests/fixtures/atm/**`/`tests/fixtures/hmux/**`
are the executable authority. Any source change requires a new projection or
protocol version and a reviewed contract update before adapter code changes.
