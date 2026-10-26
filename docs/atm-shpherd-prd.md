# atm-shpherd product requirements document

- **Status:** Draft, revised for sc-runtime Phase B
- **Repository:** `randlee/atm-shpherd`
- **Binaries:** `shpherd` (CLI) and `atm-shpherd` (daemon)
- **Behavior source:** scmux
- **Runtime foundation:** sc-runtime Phase B `sqlite-postgres` generated layout, after Phase B generation and scheduler work are available

## 1. Product decision

`atm-shpherd` is a sc-runtime application, not a scmux fork and not application code inside sc-runtime. It ports scmux's team-definition, launch, observation, and web-UI behavior into an app-specific generated workspace. It starts as a host-local SQLite plus shared PostgreSQL application because one local host database and one aggregate database are the product's required shape, not a later migration.

The app owns all team semantics: the schema, host-aggregate sync policy, ATM catalog importer, hmux/Herdr/tmux adapters, dashboard, launch leases, and scheduling registration. The runtime owns reusable framework boundaries only: configuration loading, transport, command envelopes, daemon assembly, store-generation primitives, and scheduler primitives. No sc-runtime crate contains shpherd domain logic or moves shpherd rows.

## 2. Outcomes

1. Define, browse, launch, and observe many agent teams using the proven scmux hierarchy and dashboard workflows.
2. Launch a synchronized ATM-backed team from an eligible second computer.
3. Use hmux and Herdr as the primary initial launch/view path; retain tmux only as a compatible adapter where needed.
4. Add one agent to a live team's roster on demand without duplicate ATM members or duplicate runtime panes.
5. Synchronize host-local facts to PostgreSQL on a schedule the application registers with `sc-cron`.
6. Provide one responsive team-management UI with the same authenticated API and command capabilities in a browser, a dedicated desktop application, and a phone application.

## 3. Non-goals

- A scmux crate rename or copying scmux's daemon/CLI/store graph.
- Application-specific code in `sc-config`, `sc-transport`, `sc-command`, `sc-runtime`, or `sc-cron`.
- A replication engine, outbox, inbox, merge policy, timer, or route inside sc-runtime.
- Raw writes to ATM SQLite or ATM mailbox files.
- SQL Server, a generic database abstraction, or one SQL string executed against both engines.
- A central remote-execution service; every terminal side effect is performed by the enrolled host daemon.

## 4. Runtime and application boundary

### 4.1 Reusable sc-runtime dependencies

| Crate | atm-shpherd uses it for | It must not contain |
| --- | --- | --- |
| `sc-config` | JSON configuration files and environment overrides | `.shpherd` domain schema or TOML-only assumptions |
| `sc-transport` | local daemon endpoint/client transport | shpherd synchronization policy |
| `sc-command` | typed envelopes and errors | team operations |
| `sc-runtime` | daemon builder, lock, listener, shutdown, fixture | application stores or team runtime workers |
| `sc-cron` | optional in-process scheduler primitive | shpherd store traits, shpherd rows, or adapter logic |

Phase B is used from its source/generation work after its relevant work lands; this application does not pin, retag, or wait for publication of `v0.1.0`. The v0.1 generator is SQLite-only and is not sufficient for this product.

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
| `shpherd-service` | Domain rules and service functions called by routes, CLI, and MCP; it depends on the adaptor, not directly on engine SQL. |
| `shpherd-daemon` | Axum routes, optional MCP, static UI hosting, local adapters, and application-scheduled workers; produces `atm-shpherd`. |
| `shpherd-cli` | Thin HTTP client; produces `shpherd`; never opens either store. |

Routes, CLI, MCP, dashboard, and pollers call service functions and contain no SQL. The adaptor is the one exception to “service is the writer”: it writes rows through the paired `EngineStore` implementations as the consumer-owned sync mechanism. `dyn EngineStore`, a generic `StorageBackend`, and cross-engine SQL are prohibited.

### 4.3 Shared UI and Tauri clients

`shpherd-ui` is a responsive TypeScript web client that consumes the daemon's authenticated HTTP/WebSocket API. It is the same product UI in every form factor: it is served to ordinary browsers and bundled by Tauri for macOS, Windows, Linux, iOS, and Android. The phone and desktop clients are presentation shells; they do not open Shpherd stores, run hmux, or acquire launch leases.

Tauri is a first-class supported client target, not a replacement transport. Its desktop build supplies the durable application identity operators need—icon, Dock/task-switcher presence, dedicated window, tray/status surface, native notifications, and deep links. Its mobile builds supply an installed phone client with deep links, notifications, and optional biometric unlock. Browser, desktop, and phone clients use the same versioned API, authorization policy, command semantics, and real-time event stream; responsive presentation and explicit confirmation requirements may differ by screen size.

The daemon is authoritative for every team action. A remote browser or phone connects to the enrolled host/control-plane endpoint over authenticated TLS, including through Tailscale; no Tauri IPC or mobile-local daemon is part of the remote-control protocol. Platform-specific functionality is isolated behind client capability adapters, so a browser never needs a Tauri API to perform an ordinary Shpherd operation.

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

Runtime pollers/adapters cannot mutate definitions. An error for one team cannot stop or rewrite another team. A team has stable cross-host identity and an immutable-by-default ATM identity.

## 7. Host-aggregate synchronization

`shpherd-store-adaptor` implements the consumer-owned **host-aggregate** policy. It is neither framework replication nor a generic outbox/inbox feature.

```text
ATM SQLite (source catalog on origin host)
        └─ read-only import → host SQLite rows
                                      ⇅ host-aggregate adaptor
                                shared PostgreSQL rows
                                      ⇅ host-aggregate adaptor
                           target-host SQLite rows
                                      └─ hmux / Herdr launch
```

The application defines which rows aggregate and which remain host-local. Shared definitions, launch catalog snapshots, assignments, and requested state may move to PostgreSQL. Local process observations, machine-specific paths, terminal handles, logs, and credentials do not. Same-or-similar schemas use Phase B generation flags for columns that exist on only one side.

The adaptor uses `EngineStore::read_rows` and `EngineStore::write_rows` with static dispatch. It does not create an outbox, inbox, timer, routing policy, lease protocol, or conflict-merging mechanism. Team conflict, launch ownership, and reconciliation policy are shpherd service/domain code. The initial catalog-owner policy rejects incompatible roster/launch revisions with a typed domain conflict rather than silently merging them.

An eligible target host resolves a logical project/repository binding to its local checkout and validates local prompt/config references before a launch. PostgreSQL distributes definition and requested-state rows; it never receives secrets, raw ATM mailbox data, or a live terminal handle.

## 8. Scheduled synchronization with sc-cron

Cloud sync is scheduled by `atm-shpherd`, not by sc-runtime. At application composition, `shpherd-daemon` registers a `shpherd-store-adaptor` sync callback as an application job with the optional Phase B `sc-cron` drop-in. The adaptor itself starts no timer; it supplies the application-specific sync work when the scheduler invokes that callback.

`sc-cron` stays independent of application storage traits and application rows. It has its own SQLite configuration table in its own file. The application creates/updates its schedule record through sc-cron's public API; this is not a shpherd-store write and does not use any rusqlite `SqliteWriter` building block. Registering the callback does not create a dependency in the opposite direction: `sc-cron` never imports shpherd traits, rows, or business logic.

The normal schedule expression has five minute-first fields: minute, hour, day-of-month, month, day-of-week. Six-field seconds-first input remains compatibility parsing only. The registered job is either an in-process Rust hook or the documented `python3 <module> cron.tick` / `python3 <module> cron.stop` hook. It receives one JSON object containing the schedule name and row payload only—never ATM team or phase fields—and returns fallible public results as `CronError`.

The required `sc-cron` source is Phase B sprint b-3 after its beads-cache b-8 prerequisite, not a future HTTP/MCP scheduler API and not a later published crate.

## 9. ATM catalog and roster integration

ATM SQLite is the upstream source for launchable team catalog and roster facts. A versioned, read-only ATM importer owned by atm-shpherd reads only the defined catalog projection and materializes it as host SQLite rows. Imported data includes stable ATM team identity, members/roles, agent type/model, launch/config references, logical project binding, prompt references, and source revision/fingerprint. It excludes secrets and mailbox contents.

Ordinary import direction is ATM SQLite → host SQLite → adaptor → PostgreSQL → target host SQLite. Shpherd never issues raw SQL writes to ATM SQLite.

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
- dynamic agent spawn into a selected/spare tab, ATM identity/team setup, ATM roster registration, and supported type/model launch; and
- ATM nudge routing to the Herdr pane surface.

tmux remains a compatibility adapter for the initial scmux port. It is not the permanent domain model. Herdr/Ovis are viewer and interaction surfaces; shpherd remains authoritative for team policy, data movement, launch validation, and reconciliation.

## 11. On-demand roster expansion

`shpherd team add-agent <team> <agent-name> --type <type> --model <model>` creates an idempotent expansion intent for a target team variant and optional target tab.

The service must:

1. validate name/role uniqueness, host capability, launcher capability, configuration, and team ownership;
2. persist the application intent before side effects;
3. invoke `atm teams add-member ... --json`, never raw ATM SQL;
4. re-import the resulting ATM revision and synchronize it through the adaptor;
5. require the current domain launch lease before calling hmux dynamic spawn;
6. observe the resulting Herdr pane/agent state; and
7. complete only when roster and runtime evidence both exist.

If roster registration succeeds but launch fails, the durable state is `registered_not_running` with a retry that cannot create another ATM member or another pane.

## 12. Delivery order

| Milestone | Deliverable | Dependency |
| --- | --- | --- |
| M0 | Generate `sqlite-postgres` workspace after Phase B b-8; wire all `shpherd-*` package boundaries | Phase B generation layout |
| M1 | Define `shpherd-schema`; implement both engine stores, migrations, and host-aggregate adaptor | Phase B b-4/b-5/b-7 |
| M2 | Register scheduled adaptor sync using Phase B `sc-cron`; prove adaptor has no timer | Phase B b-3 and its beads-cache b-8 prerequisite |
| M3 | Port scmux definitions, writer service, read projection, and API behavior | M0-M2 |
| M4 | Build `shpherd-ui`; package it through Tauri for desktop and iOS/Android while retaining browser parity | M3 |
| M5 | Port hmux/Herdr and compatible tmux launch/observe/doctor vertical slice | M3 |
| M6 | Add ATM catalog importer and cross-host launch binding/reconciliation | M1-M5 |
| M7 | Add idempotent roster expansion and ATM/Herdr runtime evidence | M6 |

## 13. Acceptance criteria

1. The generated workspace uses `sqlite-postgres` and contains `shpherd-schema`, both engine stores, and `shpherd-store-adaptor` from the start.
2. `shpherd-types` contains no row structs; schema/store engine boundaries compile without dynamic storage dispatch or shared SQL.
3. The adaptor moves only the application-defined host-aggregate rows, starts no timer, and has no dependency on hmux, Herdr, ATM, or sc-cron.
4. The daemon registers an sc-cron job that calls adaptor sync; sc-cron has no dependency on shpherd application storage/types and no HTTP/MCP request contract is invented.
5. A scmux fixture imports into the new schema and renders equivalent catalog/editor behavior through daemon routes.
6. CLI, dashboard, MCP, and pollers contain no SQL and use service functions; only the adaptor moves paired-store rows.
7. ATM catalog import is read-only; roster changes use `atm teams` commands and are visible after re-import.
8. A second enrolled host receives the required aggregate rows, resolves its local repository binding, and can launch exactly one eligible team variant under the app's lease policy.
9. Retried roster expansion creates neither a duplicate ATM member nor a duplicate hmux/Herdr pane.
10. A failure in one team, one host, one adaptor run, or one scheduled job does not stop or mutate an unrelated team.
11. The browser, desktop Tauri app, and mobile Tauri app use the same authenticated API and can each perform every supported team operation permitted to that operator.
12. Tauri client code contains no direct store, hmux, ATM, launch-lease, or domain-mutation implementation; platform-specific capabilities are optional enhancements.
13. Client observability is non-throwing, redacts the defined sensitive fields, and cannot change the result of a service request.

## 14. Decisions still owned by atm-shpherd

1. Exact host-aggregate row set, local-only columns, provenance, and catalog-owner conflict policy.
2. Domain lease/fencing and reconciliation policy; these are not adaptor features.
3. Project-to-local-repository binding and host enrollment/authentication.
4. ATM catalog projection/table-version contract and supported roster field mapping.
5. Exact hmux capability/version negotiation and fallback behavior.
6. Whether optional MCP is enabled for the application.
