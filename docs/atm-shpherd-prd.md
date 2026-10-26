# atm-shpherd product requirements document

- **Status:** Draft
- **Repository:** `randlee/atm-shpherd`
- **Commands:** `shpherd` (CLI), `atm-shpherd` (daemon)
- **Source system:** `scmux`
- **Foundation:** final `sc-runtime` 0.1.0 release

## Foundation requirements: sc-runtime crates

`atm-shpherd` is a downstream application of the final `sc-runtime` 0.1.0 release. It must use all four published sc-runtime foundation crates rather than recreating their responsibilities:

| sc-runtime crate | Required use in atm-shpherd |
| --- | --- |
| `sc-config` | Resolve typed configuration and environment overrides, including the project-local `.shpherd/config.toml` contract. |
| `sc-transport` | Resolve the local daemon endpoint and carry CLI-to-daemon traffic over the supported UDS/TCP transport. |
| `sc-command` | Provide the JSON command envelope, typed errors, and consistent CLI/API/MCP response behavior. |
| `sc-runtime` | Own daemon assembly, singleton locking, listener lifecycle, graceful shutdown, health wiring, and isolated daemon test fixtures. |

The generated application workspace is also required as the application boundary. All application crates use the `shpherd-` prefix so they can publish and coexist on crates.io without claiming generic names. The packaged binaries remain `shpherd` (CLI) and `atm-shpherd` (daemon).

| atm-shpherd application crate | Responsibility |
| --- | --- |
| `shpherd-types` | Shared typed requests, responses, lifecycle records, and schema/OpenAPI shapes. |
| `shpherd-sqlite` | Local `.shpherd/state.sqlite3` migrations and checked queries. |
| `shpherd-service` | The only application path to database mutation and domain rules. |
| `shpherd-daemon` | Axum routes, MCP surface where enabled, dashboard asset serving, adapters, and runtime workers; produces the `atm-shpherd` binary. |
| `shpherd-cli` | The `shpherd` thin HTTP client binary; it never accesses SQLite or PostgreSQL directly. |

`sc-runtime` remains a framework dependency, not the location for atm-shpherd domain code. Team definitions, launch/lease logic, ATM/Herdr adapters, and dashboard behavior belong in the generated application workspace.

## 1. Product decision

`atm-shpherd` will first become a working, local, scmux-compatible team manager **implemented as a generated sc-runtime application**. The first delivery ports the scmux SQLite schema semantics, definition/business logic, launch/runtime behavior, and web dashboard into the sc-runtime application boundaries with minimal intentional product behavior change.

This is not a scmux fork, a crate rename, or a copy of scmux's daemon architecture. `sc-runtime` is the reason to create `atm-shpherd`: it replaces scmux's bespoke process/configuration/transport/command/store wiring with the shared runtime’s daemon lifecycle, thin CLI, typed command contract, configuration contract, and generated application layers. The direct port is of scmux product behavior and UI—not of its crate graph or direct persistence implementation.

Only after that vertical slice works end to end will the product evolve into an ATM- and Herdr-oriented management plane for many teams across multiple computers. tmux remains a supported launcher/observation adapter during the transition, but it is not the permanent required management interface.

This sequencing is deliberate:

1. It gives the new product a demonstrably useful baseline quickly.
2. It retains scmux as a behavior and API compatibility oracle while porting.
3. It separates porting risk from new distributed-systems, ATM, and Herdr integration risk.
4. It lets the eventual multi-host design replace implementation seams rather than rewrite an unproven new product.

## 2. Problem

Teams need one place to define, launch, and observe many agent teams. Today, scmux provides much of the local team model and dashboard, but its implementation is coupled to its existing local daemon, SQLite access pattern, and tmux-centric runtime assumptions.

The target product must preserve what already works—explicit team definitions, hierarchy, launch validation, runtime observation, and operational visibility—while gaining a clean path to:

- ATM-backed team identity and member-level status;
- Herdr as a management/viewer integration surface;
- optional tmux rather than tmux as the defining runtime abstraction;
- local SQLite state under the managed repository; and
- a later shared PostgreSQL control plane for a multi-computer network of teams.

## 3. Goals

### 3.1 Baseline goals (first shippable release)

- Deliver a generated `sc-runtime` application named `atm-shpherd`.
- Provide `shpherd` as a thin CLI and `atm-shpherd` as the only process that accesses project databases.
- Port scmux’s team definition schema and its meaning: Armada, Fleet, optional Flotilla, Crew/Team, members, variants, hosts, runtime status, events, and CI records.
- Port the existing definition writer semantics, validation gates, runtime projection, launch/stop/jump flows, and dashboard behavior.
- Keep local SQLite as the only persistence backend for the baseline.
- Locate all project-local configuration, database files, daemon endpoint/lock files, and logs beneath `.shpherd/`.
- Retain tmux/hmux support sufficiently to prove launch, observation, and stop behavior against the ported model.
- Import the launchable team catalog from ATM's local SQLite state into `shpherd-sqlite`, then synchronize that materialized catalog through PostgreSQL so an eligible second host can launch the same team.
- Allow an operator to add and launch one roster-expansion agent on demand, with durable intent, idempotency, and observed-runtime confirmation.

### 3.2 Evolution goals (after baseline parity)

- Integrate ATM through documented CLI/API contracts for team/member state, without directly opening or mutating ATM storage.
- Integrate Herdr as a team-management and viewing surface, including a safe launch/action seam.
- Abstract the runtime backend so tmux is one adapter, not a required global dependency.
- Add a cloud/server PostgreSQL control plane shared by enrolled hosts, while preserving a local SQLite cache/journal per managed repository.
- Provide a stable, idempotent API boundary for `sc-cron` when it becomes available.

## 4. Non-goals

- Replacing ATM, Herdr, Ovis, hmux, tmux, or `sc-cron`.
- Requiring Herdr or Ovis for the baseline release.
- Creating a public multi-tenant SaaS in the first distributed release.
- Introducing direct database access from the CLI, UI, scheduler, or pollers.
- Solving unrestricted remote shell execution.
- Supporting offline, conflicting edits to shared team definitions in the first multi-host release.

## 5. Users and primary workflows

| User | Need | Baseline workflow |
| --- | --- | --- |
| Team operator | Maintain a catalog of ready teams | Open dashboard or run `shpherd team list`; edit definitions through the writer path. |
| Team operator | Start a team in a repository | Select a team/variant; pass validation; invoke the configured local runtime adapter. |
| Team operator | Observe many teams | Use dashboard and CLI status/doctor views for lifecycle, host, and runtime state. |
| Team operator | Recover from launch failure | Read an actionable command/runtime record without affecting unrelated teams. |
| Future scheduler (`sc-cron`) | Request scheduled work | Submit an idempotent request to the daemon API, never manipulate tables or terminals directly. |

## 6. Domain model

The scmux hierarchy remains the initial model. User-facing naming can transition from *Crew* to *Team*, but migration compatibility takes precedence over cosmetic renaming.

```text
Armada
  └─ Fleet
      └─ optional Flotilla
          └─ Team (scmux Crew)
              ├─ Team member (scmux CrewMember)
              └─ Team variant: host + repository root + branch + runtime binding
```

Hard invariants carried from scmux:

- Definitions are explicit; runtime discovery never auto-creates them.
- Exactly one persistent writer/service path mutates definitions.
- Runtime pollers/adapters are definition-write-prohibited.
- A team has a stable, cross-host identity and an immutable-by-default external team name.
- Launch validates required prompts/configuration and a concrete runtime binding.
- A failure in one team must not stop or corrupt unrelated teams.
- Organizational edits may be allowed while running; roster/prompt changes are gated.

## 7. Local layout and daemon contract

For managed repository root `REPO`, shpherd owns only `REPO/.shpherd/`:

```text
.shpherd/
  config.toml                 # non-secret project settings
  state.sqlite3               # local definition/runtime store in baseline; ignored by Git
  daemon.sock                 # local Unix socket; ignored by Git
  daemon.lock                 # singleton lock; ignored by Git
  logs/                       # retention-managed daemon logs; ignored by Git
  migrations/                 # project migrations when needed
```

`config.toml` may contain paths, project identity, and named credential references. It must not contain database passwords, private keys, bearer tokens, or ATM secrets. Those resolve from the operating system credential store, environment injection, or a later supported secret provider.

`shpherd` communicates only with the local daemon over the sc-runtime transport. The daemon owns database migrations, SQLite connections, runtime adapters, and the HTTP API used by the dashboard. The CLI must emit both readable output and a stable `--json` envelope with typed errors.

## 8. Phase 1: direct scmux port and local parity

### 8.1 Scope

Port the following from scmux before redesigning them:

1. The SQLite schema semantics and migration history into `shpherd-sqlite`, using its migrations and checked-query conventions.
2. Definition reads/writes and the single `definition_writer` boundary as `shpherd-service` functions; no ported route, CLI command, poller, or UI path may access a store directly.
3. Team/variant validation and lifecycle state machine.
4. Runtime projection, tmux polling, local host health, CI observation, and discovery/import behavior.
5. Launch, stop, and jump request behavior, initially using tmux/hmux-compatible adapters.
6. The dashboard assets and read/editor API behavior required to make the current UI functional.
7. CLI and doctor-equivalent operations for diagnostics.

### 8.2 Compatibility and replatforming principle

The port is behavior-first and sc-runtime-first, not source-copy-first. `sc-runtime` 0.1.0's daemon-owned store/service architecture is mandatory: existing scmux database calls are translated into `shpherd-sqlite` and `shpherd-service`; existing HTTP handlers become thin `shpherd-daemon` routes; and the legacy CLI becomes the thin `shpherd-cli` client. The observable schema semantics, validation rules, endpoint payloads where practical, and dashboard workflow are the compatibility targets.

The following are explicitly prohibited in the port:

- copying scmux crates into this workspace and renaming them;
- retaining a direct SQLite path in `shpherd`, dashboard code, pollers, or adapters;
- recreating bespoke daemon locking, listener, configuration, command-envelope, or test-fixture infrastructure already provided by sc-runtime;
- treating sc-runtime as an optional future cleanup after a working scmux clone exists.

The old scmux checkout is retained as a read-only oracle. For each migrated capability, fixture tests compare the old expected behavior with the new daemon’s behavior. No destructive migration is run against an operator’s live scmux database during development; import uses a copied database or exported fixture.

### 8.3 Exit criteria

Phase 1 is complete only when:

1. `shpherd init` creates the `.shpherd/` layout and starts/contacts the daemon.
2. A seeded or imported scmux definition hierarchy renders in the ported dashboard.
3. Create/edit/move/clone/unlink operations route exclusively through the writer service and are atomic.
4. Unregistered tmux discovery is read-only until an explicit import action.
5. One local team variant can launch, be observed, stopped, and diagnosed without affecting another team.
6. The CLI and dashboard use the daemon API; neither opens SQLite directly.
7. The ported behavior has automated schema, API, and end-to-end tests.

### 8.4 hmux capability contract

hmux is the initial Herdr-native launcher adapter. Shpherd does not reimplement agent command construction; it validates and invokes a compatible hmux version with structured arguments, records the request/result, and reconciles the resulting Herdr runtime.

The initial adapter must support these documented hmux capabilities:

- Read the existing `.atm.toml` `[rmux]` team configuration, preserving configuration compatibility rather than inventing a parallel launch format.
- Create or reuse a Herdr workspace keyed by `ATM_TEAM`; map configured windows to tabs and panes to labelled Herdr panes.
- Provide dry-run validation before launch.
- Relaunch one named configured pane without rebuilding the whole team workspace.
- Repair Herdr agent-name registrations after a Herdr restart without relaunching every agent.
- Support cross-platform shell generation (`bash` and `pwsh`) for configured teams.
- Support the documented dynamic-agent spawn path: create an agent pane in a target/spare tab, set ATM identity/team environment, register the member with ATM, and launch a supported agent type/model.
- Route ATM nudges to the Herdr pane surface when the target team is running under hmux.

The adapter must capability-check the installed hmux version rather than assuming every local executable implements every documented feature. In particular, dynamic spawn and its options are a required shpherd integration capability, not an assumption about an older installed hmux binary.

tmux remains a compatible adapter for the baseline where needed. Its session/window/pane layout is not the long-term shpherd domain model; Herdr workspaces/tabs/panes are the hmux realization of the same team definition.

### 8.5 ATM launch-catalog synchronization

ATM's SQLite state is the upstream source for a team's launch definition and roster. Shpherd imports it through a versioned, read-only ATM catalog adapter and materializes it in `shpherd-sqlite`. The imported payload includes only launch-relevant, non-secret data: stable ATM team identity, members/roles, supported agent type and model, launch/config references, repository/logical-project binding, prompt references, and source revision/fingerprint.

The synchronization topology is:

```text
ATM SQLite (origin host, launch catalog source)
        └─ read-only importer → shpherd-sqlite
                                      ⇅ durable sync/outbox
                                shared PostgreSQL
                                      ⇅ durable sync/inbox
                         shpherd-sqlite (eligible target host)
                                      └─ hmux / Herdr launch
```

PostgreSQL distributes imported definitions and desired launch intent so the team can be selected and launched from another enrolled computer. It does not copy secrets, raw ATM mailboxes, local absolute paths without a host mapping, or active terminal handles. A target host resolves the logical repository/project binding to its local checkout and validates all prompt/config references before launch.

The ATM import direction is one-way for ordinary catalog synchronization: ATM SQLite → shpherd local projection → PostgreSQL → other shpherd local projections. Shpherd must not issue raw SQL writes to ATM SQLite. Explicit roster changes invoke ATM's documented `atm teams` administration surface with `--json`, then are re-imported and synchronized as an observed catalog revision:

- `atm teams add-member` creates a new roster member and rejects duplicates;
- `atm teams update-member` changes mutable metadata for an existing member; and
- `atm teams remove-member` removes an existing member only through its explicit ATM authorization/validation path.

`atm members --team <team> --json` is the supported roster read surface used to reconcile a completed mutation. The installed command is `atm teams` (plural); `atm team` is not a valid command.

If two hosts present incompatible catalog revisions, PostgreSQL preserves provenance and returns a typed conflict; it never silently merges roster membership or launch commands. The initial policy designates an origin/catalog-owner host per team until a future multi-writer protocol is specified.

## 9. Phase 2: ATM and Herdr evolution

ATM and Herdr are introduced after Phase 1, behind adapters and feature flags so the working local baseline remains usable.

### 9.1 ATM

- Map a team’s stable external name to an ATM team explicitly.
- Import launch definition and roster data from ATM SQLite only through the versioned, read-only catalog adapter defined above; do not let arbitrary shpherd code query ATM tables.
- Read ATM member-level runtime state through supported ATM CLI/API contracts.
- Use ATM for notifications, readiness, and optional lifecycle coordination only after a clear command contract is agreed.
- Never issue raw SQL writes to ATM SQLite or manipulate ATM mailbox files. Explicit roster changes invoke `atm teams add-member`, `atm teams update-member`, or `atm teams remove-member` with JSON output and are reconciled through the catalog importer.
- Keep ATM roster/team changes behind explicit operator-approved definition actions.

### 9.2 On-demand roster expansion

An operator can request a single additional agent for an existing team, for example through `shpherd team add-agent <team> <agent-name> --type <type> --model <model>`. The request names its target team variant, agent identity, agent type/model, and optional target tab/window; it carries an idempotency key.

The daemon must:

1. validate team ownership, role/name uniqueness, target-host capability, launcher support, and configuration/prompt requirements;
2. persist a durable `roster_expansion_requested` intent before any side effect;
3. use `atm teams add-member ... --json` to create the roster member, never raw SQLite mutation; use `update-member` only for an existing member and `remove-member` only for an explicit removal workflow;
4. re-import the resulting ATM catalog revision into `shpherd-sqlite` and synchronize it through PostgreSQL;
5. require the current target-host lease before invoking hmux's dynamic-agent spawn path;
6. create/launch the agent in the selected Herdr tab (default: hmux's spare tab), then observe and report the resulting pane/agent state; and
7. mark the expansion complete only after both roster and runtime evidence are present.

If roster mutation succeeds but launch fails, the result is an explicit `registered_not_running` state with a safe retry path. A retry must not create a second ATM member or a duplicate pane.

### 9.3 Herdr

- Add a Herdr adapter that can discover and correlate approved workspace/pane/agent state to a shpherd team variant.
- Define Herdr actions as narrow, auditable operations: open/focus a team, request launch, show status, and request scoped stop.
- Treat Herdr/Ovis as viewer and interaction surfaces. Shpherd remains authoritative for team definitions, launch validation, and lifecycle coordination.
- Do not make the Herdr agent panel the persistence model for teams.

### 9.4 Runtime adapter interface

The daemon defines a launcher/observer interface with operations such as `validate`, `launch`, `observe`, `focus`, and `stop`. Initial implementation is a tmux/hmux adapter. Future adapters can be Herdr-native or another approved runtime without changing domain, database, or scheduler interfaces.

## 10. Phase 3: multi-host control plane

### 10.1 Data ownership

When multi-host support begins, PostgreSQL becomes authoritative for data shared by hosts:

- team definitions, hierarchy, variants, and desired state;
- enrolled hosts and capability declarations;
- assignments, leases, fencing tokens, and idempotency keys;
- shared lifecycle/audit events; and
- scheduler requests and outcomes.

The local `.shpherd/state.sqlite3` becomes a host-local cache, durable outbox, execution journal, and local-runtime observation store. It remains authoritative only for facts observed or executed by that host. It must never become a second shared-definition writer.

### 10.2 Safe launch protocol

1. An operator or scheduler creates a launch request with an idempotency key.
2. The designated host daemon claims a transactional lease for the target team variant.
3. The lease returns a fencing token. Only its current holder can perform local launch side effects or publish running state.
4. The host records local side effects durably, then reports lifecycle events to the control plane.
5. Reconciliation after a network loss observes real local runtime before granting a replacement launch lease.

The shared service records intent; it never opens a terminal or executes a command on a host. An authenticated host daemon performs all local work.

### 10.3 Degraded mode

During a PostgreSQL/control-plane outage, a host may observe and safely stop a team it already owns. It may not edit shared definitions, claim a new remote assignment, or silently duplicate a launch. Status must show cache age and control-plane state explicitly.

## 11. `sc-cron` boundary

`sc-cron` is a future caller, not a database or runtime owner. It submits versioned requests through the daemon API:

```text
schedule_id + idempotency_key + action + target scope + scheduled time + policy metadata
```

The daemon validates, authorizes, leases, executes, and reports the request. `sc-cron` owns schedule calculation, missed-run behavior, retry policy, and calendar semantics. It must not access `.shpherd/`, SQLite, PostgreSQL, tmux/hmux, ATM, or Herdr directly.

## 12. Security and operational requirements

- Commands use structured argv; no user-controlled shell interpolation.
- Every destructive action has an exact resolved scope and confirmation path.
- Logs/audit events record actor, request ID, target variant, runtime adapter, result, and correlation ID, but never secrets.
- Multi-host traffic uses authenticated TLS; host enrollment and database roles use least privilege.
- All mutation endpoints use typed, stable errors and idempotency where retries can occur.
- `shpherd doctor --json` reports daemon availability, database health, adapter health, control-plane reachability, cache freshness, current lease state, and remediation.

## 13. Delivery sequence

| Milestone | Deliverable | Depends on |
| --- | --- | --- |
| M0 | Pin final sc-runtime 0.1.0 and generate the application workspace; wire all four foundation crates and the `.shpherd` resolver | sc-runtime 0.1.0 |
| M1 | Translate scmux SQLite schema semantics into `shpherd-sqlite`; implement read-model services and catalog/dashboard read parity | M0 |
| M2 | Translate the definition writer into `shpherd-service`; add thin `shpherd-daemon` routes, thin `shpherd-cli` API parity, and import fixtures | M1 |
| M3 | hmux/Herdr launch-observe-stop vertical slice, capability negotiation, and doctor | M2 |
| M4 | Read-only ATM SQLite catalog importer, provenance/revision tracking, and member-scoped ATM status | M3 |
| M5 | PostgreSQL control plane, host enrollment, catalog cache/outbox sync, cross-host repository binding, and fenced leases | M4; architecture approval |
| M6 | Idempotent on-demand roster expansion: ATM member mutation → catalog re-import → hmux dynamic spawn → observed runtime evidence | M5 |
| M7 | Herdr actions and Ovis-compatible viewer integration | M3 |
| M8 | `sc-cron` request adapter | M5; sc-cron contract |

## 14. Acceptance criteria

1. All project-local state is created below `.shpherd/`; no `.scmux/` or global project state is required for new operation.
2. A scmux fixture can be imported and produces an equivalent hierarchy and launchability result.
3. The ported dashboard can list, inspect, create, edit, and organize teams through daemon APIs.
4. Pollers and adapters cannot persist definition changes outside the writer service.
5. A local launch is idempotent and scoped; a failed launch cannot stop another team.
6. A read-only import of an ATM launch catalog records source provenance/revision and never writes ATM SQLite directly.
7. An enrolled second host receives the synchronized catalog, resolves its own repository binding, and can launch an eligible team through a valid fenced lease.
8. On-demand roster expansion cannot create duplicate ATM members or duplicate hmux/Herdr panes when retried.
9. ATM and Herdr integration work does not regress the M3 hmux/Herdr baseline.
10. In the multi-host release, two hosts cannot both acquire a valid live launch lease for one team variant.
11. A mocked `sc-cron` request exercises the same daemon validation and idempotency path as a CLI request.

## 15. Decisions needed before M6

1. Whether hosts reach PostgreSQL directly or use a dedicated control-plane API. A dedicated API is preferred for policy and credential isolation.
2. Deployment/authentication model for the shared control plane (for example, private network plus application credentials or an OIDC provider).
3. Required host platforms for the first multi-host release.
4. Exact ATM lifecycle commands that shpherd may invoke.
5. Exact Herdr action and ownership contract for starting/focusing/stopping a team.
6. The `sc-cron` request/authentication contract.
