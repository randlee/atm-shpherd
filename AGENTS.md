# Agent workflow

Read `README.md` and `docs/atm-shpherd-prd.md` before implementation. Work on
scoped branches; `main` and `develop` receive reviewed pull requests. Preserve
unrelated work. Commit only the files owned by the task and push only when the
active task authorizes it.

Use `bd prime`, `bd ready`, and `bd show <id>` for durable work tracking; claim
with `bd update <id> --claim` and close only after verification. Beads uses Dolt,
not JSONL synchronization. In linked worktrees `bd where` identifies the shared
canonical workspace. Do not reinitialize an existing database or change hooks.
If the installed bd lacks embedded Dolt, a fresh repository can use the documented
`bd init --proxied-server --non-interactive --skip-hooks --skip-agents` mode.

The preparation workspace lives under `clients/`. Use Node 22.12+ and Corepack's
pinned pnpm version. Run `pnpm install --frozen-lockfile`, then `pnpm check` from
that directory. For Rust host changes also run `pnpm tauri:fmt` and `pnpm tauri:check`.
Report exact validation and any unavailable platform checks.

Clients are presentation shells. No store access, ATM/hmux invocation, leases,
scheduling, daemon sidecars, or team mutation rules belong here. Keep the mock
contract explicitly provisional until daemon API work lands. Browser imports
must not require Tauri APIs. Telemetry is allowlisted and nonthrowing; never send
credentials, terminal/mailbox contents, prompt text, or raw error objects.

Do not generate application Rust crates against unfinished sc-runtime Phase B.
The only Rust code in this preparation sprint is the thin Tauri presentation host.
