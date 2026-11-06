# atm-shpherd product requirements document

- **Status:** Draft, revised for sc-runtime Phase B
- **Repository:** `randlee/atm-shpherd`
- **Binaries:** `shpherd` (CLI) and `atm-shpherd` (daemon)
- **Behavior source:** scmux
- **Runtime foundation:** released sc-runtime `v0.1.1` `sqlite-postgres` generated layout, upgraded to `v0.2.0` as the next work started once that release is available

## 1. Product decision

`atm-shpherd` is a sc-runtime application and an operator convenience/status tool, not a scmux fork, a distributed team authority, or application code inside sc-runtime. It ports scmux's team-definition, launch, observation, and web-UI behavior into an app-specific generated workspace. ATM is authoritative for each running team's actual roster and runtime membership. Shpherd persists desired launch definitions, invokes host-local launchers, observes ATM, and presents a fleet-wide view.

The app owns its schema, host-report projection policy, ATM observation adapter, hmux/Herdr/tmux adapters, dashboard, host-local idempotency, and heartbeat registration. Those concerns remain independent components composed by a thin daemon. The runtime owns reusable framework boundaries only: configuration loading, transport, command envelopes, daemon assembly, store-generation primitives, and scheduler primitives. No sc-runtime crate contains Shpherd domain logic or moves Shpherd rows.

## 2. Outcomes

1. Define, browse, launch, and observe many agent teams using the proven scmux hierarchy and dashboard workflows.
2. Launch a persisted team definition from an SSH-accessible host, allowing the same named team and agents to run concurrently on other hosts.
3. Use hmux and Herdr as the primary initial launch/view path; retain tmux only as a compatible adapter where needed.
4. Add one agent to a live team's roster on demand without duplicate ATM members or duplicate runtime panes.
5. Use an `sc-cron` heartbeat to poll authoritative ATM agent state and refresh the host-qualified fleet view.
6. Provide one responsive team-management UI with the same authenticated API and command capabilities in a browser, a dedicated desktop application, and a phone application.

## 3. Non-goals

- A scmux crate rename or copying scmux's daemon/CLI/store graph.
- Application-specific code in `sc-config`, `sc-transport`, `sc-command`, `sc-runtime`, or `sc-cron`.
- A replication engine, outbox, inbox, merge policy, timer, or route inside sc-runtime.
- Raw writes to ATM SQLite or ATM mailbox files.
- SQL Server, a generic database abstraction, or one SQL string executed against both engines.
- A central remote-execution service; every terminal side effect is performed by the enrolled host daemon.
- PostgreSQL launch authority, cross-host ownership, distributed fencing, or global team-name uniqueness.
- Scheduled team launches or agent instructions in Phase B; those are a later composition of existing launch, readiness, and ATM messaging operations.

## 4. Runtime and application boundary

### 4.1 Reusable sc-runtime dependencies

| Crate | atm-shpherd uses it for | It must not contain |
| --- | --- | --- |
| `sc-config` | JSON configuration files and environment overrides | `.shpherd` domain schema or TOML-only assumptions |
| `sc-transport` | local daemon endpoint/client transport | shpherd synchronization policy |
| `sc-command` | typed envelopes and errors | team operations |
| `sc-runtime` | daemon builder, lock, listener, shutdown, fixture | application stores or team runtime workers |
| `sc-cron` | optional in-process scheduler primitive | shpherd store traits, shpherd rows, or adapter logic |

Phase B starts from the released sc-runtime `v0.1.1` `sqlite-postgres` template. The generated baseline is installed and proven before any scmux migration. B2 records an authoritative sc-runtime release check before feature dispatch, and B13 repeats it at certification. When sc-runtime `v0.2.0` is released, its dependency refresh and complete sc-lint `0.8.4`-or-newer consumer installation are the next Shpherd work started, subject only to completing an already-running safe checkpoint; an unavailable or ambiguous detector blocks until an authoritative result is recorded.

### 4.2 Generated application workspace

The generator input is `sqlite-postgres`. Postgres is the chosen shared engine; MySQL is the other Phase B pairing option and is not selected. SQL Server is out of scope.

All Rust application packages use a `shpherd-` prefix for crates.io coexistence. Executable names remain `shpherd` and `atm-shpherd`.

| Package | Responsibility |
| --- | --- |
| `shpherd-types` | Non-database request, response, OpenAPI, and lifecycle types. |
| `shpherd-schema` | Table/column definitions, row structs, and the static `EngineStore` contract. |
| `shpherd-store-sqlite` | SQLite-only migrations, sqlx queries, WAL/read-pool/write-connection behavior, and `EngineStore` implementation. |
| `shpherd-store-postgres` | Postgres-only migrations, sqlx queries, and `EngineStore` implementation. |
| `shpherd-store-adaptor` | Consumer-owned host-aggregate row movement. It depends on schema and calls `read_rows`/`write_rows`; it starts no timer. |
| `shpherd-atm` | ATM state polling and documented `atm teams` command adapter; owns no timer or launch policy. |
| `shpherd-launchers` | Herdr/hmux and tmux process adapters behind the shared launcher contract. |
| `shpherd-service` | Domain rules and transport-independent command handlers called inside the daemon; it depends on the adaptor, not directly on engine SQL. |
| `shpherd-daemon` | Axum routes, static UI hosting, dependency composition, heartbeat registration, and lifecycle supervision; produces `atm-shpherd`. MCP is disabled in Phase B. |
| `shpherd-cli` | Thin HTTP client; produces `shpherd`; never opens either store. |

Daemon routes and the heartbeat callback call independent service/adaptor components and contain no SQL, ATM reconciliation policy, or launcher construction. The `shpherd` CLI, browser, and Tauri clients call the authenticated daemon API and never invoke `shpherd-service` in-process. The adaptor writes projection rows through the paired `EngineStore` implementations. `dyn EngineStore`, a generic `StorageBackend`, and cross-engine SQL are prohibited.

### 4.3 Shared UI and Tauri clients

`shpherd-ui` is a responsive TypeScript web client that consumes the daemon's authenticated HTTP/WebSocket API. It is the same product UI in every form factor: it is served to ordinary browsers and bundled by Tauri for macOS, Windows, Linux, iOS, and Android. The phone and desktop clients are presentation shells; they do not open Shpherd stores or run hmux/tmux.

Tauri is a first-class supported client target, not a replacement transport. Its desktop build supplies the durable application identity operators need—icon, Dock/task-switcher presence, dedicated window, tray/status surface, native notifications, and deep links. Its mobile builds supply an installed phone client with deep links, notifications, and optional biometric unlock. Browser, desktop, and phone clients use the same versioned API, authorization policy, command semantics, and real-time event stream; responsive presentation and explicit confirmation requirements may differ by screen size.

ATM is authoritative for actual running-team state. A selected host daemon authorizes and executes only that host's Shpherd actions. A remote browser or phone connects to the host endpoint over authenticated TLS, including through Tailscale; an SSH-authenticated operator may invoke the same `shpherd` CLI noninteractively on that host. No Tauri IPC or mobile-local daemon is part of the remote-control protocol.

Caller/role/scope claims are never accepted in request JSON. Daemon auth parses/verifies transport credentials, then its composition-owned B2 `shpherd-auth` issuer creates a private, non-serializable principal injected into domain/ATM dispatch; service and adapters do not depend on daemon. Responses use a tagged completed/accepted/replayed/conflict/rejected outcome; replay embeds the original terminal outcome. Event resume tokens bind daemon instance, stream, and genesis-capable cursor, so restart, stream mismatch, or checked overflow requires resynchronization.

The TypeScript UI uses `@synaptic-canvas/sc-observability` (starting from the published 1.5.0 line, pinned in the application lockfile) for client-side, non-throwing observability host bindings. Its use must redact credentials, terminal content, raw ATM mailbox data, and prompt bodies; telemetry failure must never block a team action. Browser compatibility is provided by a deliberate browser/no-op adapter rather than by granting browser code native Tauri capabilities.

### 4.4 Generated examples and general database commands

The generated widget example is a scaffolding example, not an atm-shpherd domain command. It is retained only until the first real shpherd vertical slice replaces it.

The application disables generated general database commands before the first usable release. Raw row create/delete access would violate team/roster invariants; all operator mutations use named shpherd services and commands.

## 5. Local layout and configuration

The generated app's configuration follows sc-config's JSON contract: `config/default.json` plus ignored `config/local.json` and environment overrides. It configures the project instance root and endpoint; it is not `.shpherd/config.toml`.

For managed repository root `REPO`, the configured instance root is normally `REPO/.shpherd/`:

```text
.shpherd/
  state.sqlite3          # host-local shpherd store; ignored by Git
  daemon.sock            # configured Unix endpoint on Unix; ignored by Git
  daemon.lock            # singleton lock; ignored by Git
  logs/                  # retention-managed logs; ignored by Git
```

`.shpherd/daemon.sock` is an app-configured endpoint, not an implicit sc-runtime default. `--endpoint` and `SC_ENDPOINT` remain supported. SQLite and Postgres migrations live in their respective store crates, embedded through `sqlx::migrate!`; they do not live in `.shpherd/migrations/`.

Secrets are never committed or copied between databases. Local SQLite receives its path through the SQLite store's `OpenConfig.url`; Postgres receives a database URL through the Postgres store's `OpenConfig.url`.

## 6. Team model and scmux port

The initial product model preserves scmux behavior:

```text
Armada → Fleet → optional Flotilla → Team → Team member
                                            └→ Team variant (host/path/branch/runtime binding)
```

Port these product behaviors into `shpherd-*`, without copying scmux crates:

- explicit definitions and a single definition-writer service path;
- validated team/member/variant creation, edit, move, clone, unlink, and import;
- runtime projection distinct from durable definitions;
- read-only discovery until explicit operator import;
- scoped launch, stop, focus/jump, host health, CI, and doctor flows; and
- the existing dashboard's catalog and editor workflows.

Runtime pollers/adapters cannot mutate definitions. Definitions describe desired launch configuration; ATM observations describe actual running state and may drift from a definition. Shpherd reports that drift and may persist evidence when configured. The closed parent model admits only Armada → Fleet → optional Flotilla → Team. A Team create/patch validates its local definition transactionally. An error for one team cannot stop or rewrite another team.

## 7. Host-aggregate synchronization

`shpherd-service` owns the consumer-specific **host-aggregate** policy; `shpherd-store-adaptor` is its statically dispatched row-I/O seam. Neither is framework replication nor a generic outbox/inbox feature.

```text
ATM actual state on each host
        └─ heartbeat observation → host SQLite report
                                      └─ host-report adaptor
                                 shared PostgreSQL fleet view

host SQLite persisted definition ──→ hmux / Herdr or tmux launch
```

The application defines which reported rows aggregate and which remain host-local. PostgreSQL stores a host-qualified fleet read model: persisted definition summaries, ATM-observed team/agent status, source host, source revision, and observation time. Local paths, prompt bodies, terminal handles, logs, credentials, and raw ATM mailbox content never enter it. `(host, team)` identity permits the same team and agent names on multiple hosts. PostgreSQL rows never prove that a team is running and never grant or deny launch permission.

The adaptor uses `EngineStore::read_rows` and `EngineStore::write_rows` with static dispatch. It does not create an outbox, inbox, timer, routing policy, lease protocol, or conflict-merging mechanism. Synchronization uses source-qualified `StoreCursor` vectors distinct from nonzero entity revisions, closed typed keys, provenance-bearing tombstones, and deterministic-CBOR batches. Missing source means cursor zero, first mutation is one, and checked overflow never wraps; rows, tombstones, audit, and one source cursor commit atomically or not at all. Replay requires identical canonical bytes, while invalid keys/encoding, digest mismatch, gaps, and conflicts advance no cursor.

Before launch, the selected host resolves its persisted logical project/repository binding to a local checkout and validates local prompt/config references. An operator may explicitly copy/import a definition seen in the fleet view; that creates an ordinary local definition rather than transferring ownership. PostgreSQL never receives secrets, raw ATM mailbox data, or a live terminal handle.

PostgreSQL has no launch-authority API, lease row, fencing token, ownership transfer, or global uniqueness constraint. Each host uses a host-local single-flight guard plus durable idempotency/operation evidence to avoid duplicate side effects on that host. Another host may concurrently launch the same named definition and agents.

## 8. ATM status heartbeat with sc-cron

At application composition, `shpherd-daemon` registers one Phase B `sc-cron` heartbeat. The callback polls ATM agent/team state through `shpherd-atm`, refreshes host-local observations, computes definition drift, and publishes the resulting host report to PostgreSQL. The ATM adapter and store adaptor start no timer.

`sc-cron` stays independent of application storage traits and application rows. The application registers the heartbeat through sc-cron's public callback API; `sc-cron` never imports Shpherd traits, rows, or business logic. Scheduled launches, roster changes, ATM messages, and overnight agent instructions are explicitly outside Phase B.

The daemon injects an `Arc<dyn CronHandler + Send + Sync>` through the pinned public API. The handler receives schedule/run metadata and cancellation, then delegates the heartbeat to independent ATM/status/projection components. Cancellation is terminal and never reported as success. Phase B exposes no general Shpherd schedule editor or scheduled-action policy.

B3C must pin the exact `sc-cron` repository revision or published package version and capture its public grammar/callback fixtures before B12 begins. The integration uses that public in-process API; it does not wait for or invent a future HTTP/MCP scheduler surface.

## 9. ATM catalog and roster integration

ATM is the source of truth for each running team instance's actual roster and runtime membership. A versioned, read-only ATM observer in `shpherd-atm` reads only the defined status projection and materializes host-local observation rows. It excludes secrets and mailbox contents. Shpherd definitions remain separate desired launch data.

Ordinary observation direction is ATM → host SQLite → PostgreSQL fleet view. There is no automatic PostgreSQL → target-host ownership or launch path. Shpherd never issues raw SQL writes to ATM SQLite.

Roster mutations use ATM's documented command surface with JSON output:

- `atm teams add-member` creates a member and rejects duplicates;
- `atm teams update-member` changes metadata for an existing member;
- `atm teams remove-member` handles explicit removal; and
- `atm members --team <team> --json` reconciles the resulting roster.

The installed command is `atm teams` (plural), not `atm team`. After a mutation, shpherd re-imports the ATM revision, then the adaptor synchronizes the affected rows.

## 10. hmux, Herdr, and tmux

hmux is the initial Herdr-native launcher adapter. Shpherd invokes a capability-checked compatible hmux executable with structured arguments; it does not recreate agent command construction.

The required hmux capability set is:

- read `[rmux]` configuration in `.atm.toml` without inventing a second launch format;
- create/reuse a Herdr workspace keyed by `ATM_TEAM`, mapping windows to tabs and panes to labelled Herdr panes;
- dry-run validation, named-pane relaunch, and post-restart Herdr agent-name repair;
- bash and pwsh launch support;
- dynamic agent spawn into a selected/spare tab using Shpherd-supplied roster-registration evidence, ATM identity/team setup, and supported type/model launch; and
- ATM nudge routing to the Herdr pane surface.

Dry-run, observe, and focus are read-only requests. Start, stop, relaunch, repair, spawn, nudge, member stop, and member reconcile use a host-local single-flight guard and durable idempotency key. Spawn requires typed evidence binding the Shpherd operation/key, ATM team/member, roster revision, and redacted result digest. Member-scoped removal/reconciliation uses stable runtime identity and preserves unrelated sessions.

tmux remains a compatibility adapter for the initial scmux port. It is not the permanent domain model. Herdr/Ovis are viewer and interaction surfaces; Shpherd is a convenience/status layer, while ATM remains authoritative for actual running teams.

## 11. On-demand roster expansion

`shpherd team add-agent <team> <agent-name> --type <type> --model <model>` creates an idempotent expansion intent for a target team variant and optional target tab.

The service must:

1. validate name/role uniqueness within the selected host instance, host capability, launcher capability, and configuration;
2. persist the application intent before side effects;
3. invoke `atm teams add-member ... --json`, never raw ATM SQL;
4. re-import the resulting ATM revision and synchronize it through the adaptor;
5. acquire the host-local single-flight guard before calling hmux dynamic spawn;
6. observe the resulting Herdr pane/agent state; and
7. complete only when roster and runtime evidence both exist.

If roster registration succeeds but launch fails, the durable state is `registered_not_running` with a retry that cannot create another ATM member or another pane.

## 12. Delivery order

| Milestone | Deliverable | Dependency |
| --- | --- | --- |
| M0 | Generate and prove the released sc-runtime 0.1.1 `sqlite-postgres` workspace | B1 |
| M1 | Integrate the generated workspace and machine-readable package boundaries | B2 |
| M2 | Establish scmux SQLite parity and approve the Shpherd application contracts | B3, B3A |
| M3 | Implement schema extensions, definition/observation services, ATM projection, and both launch adapters | B4-B8 |
| M4 | Implement fleet projection, host-local launch safety, roster expansion, and authenticated daemon/CLI transport | B9A-B10A |
| M5 | Port the shared browser/Tauri UI and command experience | B10-B11A |
| M6 | Add the ATM status heartbeat, daemon supervision, and cross-platform release certification | B12-B13 |

## 13. Acceptance criteria

1. The generated workspace uses `sqlite-postgres` and contains `shpherd-schema`, both engine stores, and `shpherd-store-adaptor` from the start.
2. `shpherd-types` contains no row structs; schema/store engine boundaries compile without dynamic storage dispatch or shared SQL.
3. The adaptor moves only the application-defined host-aggregate rows, starts no timer, and has no dependency on hmux, Herdr, ATM, or sc-cron.
4. The daemon registers one sc-cron heartbeat that polls ATM agent state and publishes host status; it registers no scheduled launch or instruction job.
5. A scmux fixture imports into the new schema and renders equivalent catalog/editor behavior through daemon routes.
6. Daemon routes and pollers contain no SQL and use service functions; CLI/dashboard clients use the authenticated API; only the adaptor moves paired-store rows. MCP is disabled in Phase B unless separately approved.
7. ATM catalog import is read-only; roster changes use `atm teams` commands and are visible after re-import.
8. Two enrolled hosts can concurrently run the same named team and agents; PostgreSQL displays both host-qualified instances without granting launch authority.
9. Retried roster expansion creates neither a duplicate ATM member nor a duplicate hmux/Herdr pane.
10. A failure in one team, one host, one adaptor run, or one heartbeat does not stop or mutate an unrelated team.
11. The browser, desktop Tauri app, and mobile Tauri app use the same authenticated API and can each perform every supported team operation permitted to that operator.
12. Tauri client code contains no direct store, hmux, ATM, or domain-mutation implementation; platform-specific capabilities are optional enhancements.
13. Client observability is non-throwing, redacts the defined sensitive fields, and cannot change the result of a service request.
14. Before feature dispatch and again at B13, the authoritative release check records the observed tag or absence and release digest when present; failed or ambiguous detection blocks until retried, while an observed `v0.2.0` routes to the digest-bound runtime interrupt.

## 14. Decisions still owned by atm-shpherd

1. Exact host-aggregate row set, local-only columns, provenance, and catalog-owner conflict policy.
2. Host-local single-flight/idempotency and ATM drift-reporting policy; these are not adaptor features.
3. Project-to-local-repository binding and host enrollment/authentication.
4. ATM catalog projection/table-version contract and supported roster field mapping.
5. Exact hmux capability/version negotiation and fallback behavior.
6. MCP is disabled for Phase B; enabling it later requires a separate authenticated-surface ADR and plan.
