# atm-shpherd

`atm-shpherd` is a multi-host control plane for defining, launching, and observing many ATM-backed agent teams. It preserves scmux's useful product behavior—team hierarchy, explicit definitions, launch gates, runtime observation, and dashboard workflows—while replatforming as a sc-runtime application. It is not a scmux fork or crate rename.

## Operator surfaces

One responsive Shpherd UI is available in three equal forms:

- an ordinary browser, including remote access over Tailscale;
- a Tauri desktop app with an icon, Dock/task-switcher presence, dedicated window, tray/status surface, notifications, and deep links; and
- a Tauri iOS/Android app with the same authenticated team API and command capability.

The clients are presentation shells. They never open Shpherd stores, run hmux, acquire launch leases, or implement team business logic. Every action is authorized and executed by an `atm-shpherd` daemon on an enrolled host or control-plane endpoint.

## Commands

- `shpherd` — thin operator CLI.
- `atm-shpherd` — daemon; owns database access, domain services, runtime adapters, synchronization, and API/static UI hosting.

## Architecture

The product uses sc-runtime Phase B's `sqlite-postgres` generated layout. Rust application crates use the `shpherd-` namespace:

```text
shpherd-types            non-database API and lifecycle types
shpherd-schema           tables, rows, and static EngineStore contract
shpherd-store-sqlite     SQLite-only migrations and queries
shpherd-store-postgres   Postgres-only migrations and queries
shpherd-store-adaptor    app-owned host-aggregate row movement
shpherd-service          domain rules and named mutation paths
shpherd-daemon           API, static UI hosting, local adapters; produces atm-shpherd
shpherd-cli              thin client; produces shpherd
```

`sc-runtime` provides reusable infrastructure, not Shpherd domain code. In particular, `sc-cron` knows no Shpherd rows or traits: the application registers an adaptor-sync callback through its public API, and the adaptor owns no timer.

Each managed repository normally keeps host-local state below `.shpherd/`:

```text
.shpherd/
  state.sqlite3
  daemon.sock
  daemon.lock
  logs/
```

Configuration follows sc-config's JSON `config/default.json` and ignored `config/local.json` convention. SQLite and Postgres migrations are embedded in their respective engine-store crates. Secrets never enter the repository, host aggregate rows, or client telemetry.

## Data and runtime flow

```text
ATM SQLite → host SQLite ⇄ app-owned adaptor ⇄ shared PostgreSQL
                                                ⇅
                                  eligible target-host SQLite → hmux / Herdr
```

ATM catalog ingestion is read-only. Roster changes use documented `atm teams` commands with JSON output, then re-import and synchronize the observed revision. hmux is the first Herdr-native launcher adapter; tmux remains a compatible adapter where necessary.

The shared TypeScript UI uses `@synaptic-canvas/sc-observability` for non-throwing, redacted client observability. It must never block or alter a team action.

## Documentation

The independent [client preview workspace](clients/README.md) runs now with
Corepack/pnpm under `clients/`. It provides a responsive fixture-backed team
catalog and a thin Tauri debug host while sc-runtime Phase B work continues.
It does not connect to a production daemon or implement team mutations.

The detailed requirements, strict runtime boundaries, Tauri client contract, scheduler boundary, hmux capability set, and delivery plan are in [the PRD](docs/atm-shpherd-prd.md).

## Branches

- `main` is the protected release branch; changes arrive through pull requests.
- `develop` is the protected integration branch.
