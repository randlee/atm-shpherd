# Intent - phase-b

Written 2026-11-02 by randlee and Codex.

## What this plan is for

Phase B turns the existing atm-shpherd product definition and client prototype into a working sc-runtime application. It begins with an untouched, tested sc-runtime 0.1.1 `sqlite-postgres` generation, then ports the current scmux schema, business behavior, and web UI into the Shpherd architecture.

The execution-ready boundary map, wave table, and sprint documents are indexed by `phase-b-plan.md`. The locked anchor record remains `anchors.json`; hardening may reorganize sprint ownership but may not weaken or replace those anchors.

Shpherd manages teams across computers through a local SQLite database synchronized with shared PostgreSQL state. Herdr is the default launcher; tmux remains an explicitly supported backend. The plan preserves scmux behavior first, then adds the minimum app-owned fields and adapters needed for Herdr, ATM roster management, multi-host operation, and later scheduling.

## What success looks like

- The generated sc-runtime baseline passes setup, lint, test, CLI-build, and daemon-build gates before scmux migration begins.
- The `shpherd` CLI and `atm-shpherd` daemon reproduce the retained scmux schema, definition management, observation, launcher, and browser/Tauri UI behavior.
- A team launches through Herdr by default and through tmux when explicitly configured.
- SQLite-to-PostgreSQL synchronization makes team definitions available for safe launch on another authorized host.
- The repository upgrades to sc-runtime 0.2.0 immediately after release, including its dependency refresh and complete sc-lint 0.8.4-or-newer consumer installation.

## What is deliberately out of scope

- AI chat, ontology generation, OxyGraph context providers, and schema-derived agent context graphs.
- Replacing app-owned Shpherd schema, synchronization, launcher, or ATM policy with sc-runtime responsibilities.
- Exact visual redesign beyond porting the retained scmux UI behavior into the existing browser/Tauri client.

## Anchors

Anchors for this plan live in `anchors.json` (record of truth) and are rendered to `anchors.md`. Requirements and ADRs that govern this plan are listed there too, under their own IDs.
