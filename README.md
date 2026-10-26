# atm-shpherd

`atm-shpherd` is a multi-host control plane for defining, launching, and observing many ATM-backed agent teams.

It preserves the useful product behavior of scmux—team hierarchy, explicit definitions, launch gates, runtime observation, and dashboard workflows—while replatforming it on `sc-runtime`. It is not a scmux fork or a crate rename.

## Commands

- `shpherd` — the operator CLI.
- `atm-shpherd` — the local daemon. It owns database access, runtime adapters, synchronization, and the dashboard/API surface.

The CLI never opens SQLite or PostgreSQL directly.

## Architecture

`atm-shpherd` is a downstream application of `sc-runtime` 0.1.0 and uses its four foundational crates:

- `sc-config` for typed configuration;
- `sc-transport` for local daemon transport;
- `sc-command` for typed command/API envelopes; and
- `sc-runtime` for daemon lifecycle, locking, transport assembly, and test fixtures.

Application crates use an app-specific crates.io namespace:

```text
shpherd-types     shared API and lifecycle types
shpherd-sqlite    local SQLite migrations and queries
shpherd-service   domain rules and the only mutation path
shpherd-daemon    daemon/API/dashboard; produces atm-shpherd
shpherd-cli       thin client; produces shpherd
```

Each managed repository keeps local state beneath `.shpherd/`:

```text
.shpherd/
  config.toml
  state.sqlite3
  daemon.sock
  daemon.lock
  logs/
```

Secrets do not belong in `.shpherd/config.toml` or the repository.

## Delivery path

The first release is a working local, scmux-compatible baseline implemented through sc-runtime:

1. Port scmux schema semantics, business rules, and dashboard behavior to the `shpherd-*` application crates.
2. Use hmux as the initial Herdr-native launcher adapter, retaining tmux compatibility where needed.
3. Import ATM launch catalog/roster data read-only into `shpherd-sqlite`.
4. Add a shared PostgreSQL control plane to synchronize launchable teams between enrolled hosts, with leases/fencing to prevent duplicate launches.
5. Add idempotent roster expansion: create an ATM member, synchronize the catalog, then spawn the agent through hmux/Herdr.
6. Accept future `sc-cron` requests only through the versioned daemon API.

The launch catalog flows from ATM into shpherd and then across hosts:

```text
ATM SQLite → shpherd SQLite ⇄ PostgreSQL ⇄ target-host shpherd SQLite → hmux / Herdr
```

ATM roster changes use the documented `atm teams` commands (`add-member`, `update-member`, and `remove-member`) with JSON output; shpherd does not issue raw writes to ATM SQLite.

## Documentation

The detailed product requirements, migration sequence, safety constraints, hmux capability contract, and multi-host design are in [the PRD](docs/atm-shpherd-prd.md).

## Branches

- `main` is the protected release branch. Changes reach it through pull requests.
- `develop` is the protected integration branch.
