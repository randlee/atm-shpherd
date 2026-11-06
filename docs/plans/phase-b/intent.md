# Intent - phase-b

Written 2026-11-02 by randlee and Codex.

## What this plan is for

Phase B turns the existing atm-shpherd product definition and client prototype into a working sc-runtime application. It begins with an untouched, tested sc-runtime 0.1.1 `sqlite-postgres` generation, then ports the current scmux schema, business behavior, and web UI into the Shpherd architecture.

The execution-ready boundary map, wave table, and sprint documents are indexed by `phase-b-plan.md`. The locked anchor record remains `anchors.json`; hardening may reorganize sprint ownership but may not weaken or replace those anchors.

Shpherd is an operator convenience and status tool. ATM is the source of truth for each running team instance; Shpherd persists local launch definitions and observations in SQLite, publishes host-qualified reports to a shared PostgreSQL fleet view, and launches through independent Herdr or tmux adapters. PostgreSQL does not own teams or serialize launches, so identical team and agent names may run concurrently on different hosts. Phase B uses sc-cron only as the ATM-state polling heartbeat; scheduled launches and instructions are later work.

## What success looks like

- The generated sc-runtime baseline passes setup, lint, test, CLI-build, and daemon-build gates before scmux migration begins.
- The `shpherd` CLI and `atm-shpherd` daemon reproduce the retained scmux schema, definition management, observation, launcher, and browser/Tauri UI behavior.
- A team launches through Herdr by default and through tmux when explicitly configured.
- PostgreSQL shows host-qualified teams across all computers without becoming launch authority; an operator may explicitly create/import a local definition and launch it through `shpherd` over SSH.
- The Phase B sc-cron heartbeat polls authoritative ATM agent state and refreshes Shpherd observations; it never schedules a launch or instruction.
- The repository upgrades to sc-runtime 0.2.0 immediately after release, including its dependency refresh and complete sc-lint 0.8.4-or-newer consumer installation.

## What is deliberately out of scope

- AI chat, ontology generation, OxyGraph context providers, and schema-derived agent context graphs.
- Replacing app-owned Shpherd schema, synchronization, launcher, or ATM policy with sc-runtime responsibilities.
- Exact visual redesign beyond porting the retained scmux UI behavior into the existing browser/Tauri client.
- PostgreSQL launch leases, global ownership/fencing, global team-name uniqueness, and scheduled/overnight team actions.

## Anchors

Anchors for this plan live in `anchors.json` (record of truth) and are rendered to `anchors.md`. Requirements and ADRs that govern this plan are listed there too, under their own IDs.
