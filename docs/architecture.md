# atm-shpherd architecture and ADR index

Status values are `proposed`, `approved`, and `superseded`. B3A, B3B, and B3C convert their assigned proposed contracts below to approved text with executable contract fixtures before dependent implementation begins.

## Boundary map

The intended package graph is:

```text
shpherd-types <- shpherd-schema <- {shpherd-store-sqlite, shpherd-store-postgres}
       ^                ^                         ^
       |                +---- shpherd-store-adaptor
       +--------------------- shpherd-service
                                      ^
                    shpherd-daemon ---+--- authenticated API
                                      ^
                         shpherd-cli / browser / Tauri
```

Clients never access stores or services in-process. External ATM, hmux/Herdr, tmux, sc-cron, and observability integrations are leaf adapters owned by `shpherd-daemon` or the client capability layer.

## ADR index

| ADR | Status | Decision | Finalized by |
|---|---|---|---|
| ADR-SHP-001 | approved | sc-runtime remains generic; all product policy lives in app-named packages | PRD §§1, 4 |
| ADR-SHP-002 | proposed | SQLite is complete host state; PostgreSQL receives an explicit allowlisted projection; conflicts reject rather than silently merge | B3A |
| ADR-SHP-003 | approved | CLI/browser/Tauri are thin authenticated daemon clients; only daemon code calls `shpherd-service` | PRD §4.2 |
| ADR-SHP-004 | proposed | Machine-stable error envelope and strongly typed identity/value objects span store, command, and wire boundaries | B3A/B3B |
| ADR-SHP-005 | proposed | Fixed launcher set uses a closed enum; side-effecting launch APIs require an unforgeable `LaunchLeaseGuard` | B3B |
| ADR-SHP-006 | proposed | ATM import/version mapping and command-only roster mutation use exact plural commands | B3C |
| ADR-SHP-007 | proposed | hmux capability/version, idempotency, resource identity, and dynamic-spawn result contract | B3C |
| ADR-SHP-008 | approved | One responsive UI uses the same API in browser, desktop Tauri, and mobile Tauri shells | PRD §4.3 |
| ADR-SHP-009 | proposed | sc-cron owns scheduling primitives only; Shpherd registers callbacks and owns all job policy | B3C |
| ADR-SHP-010 | proposed | MCP is disabled for Phase B unless a separately approved authenticated surface is specified | B3C |

## Required contract signatures

B3A, B3B, and B3C may refine names within their assigned boundaries but may not weaken these properties:

```rust
pub struct TeamId(/* validated stable id */);
pub struct HostId(/* enrolled host id */);
pub struct FencingToken(/* monotonic opaque token */);
pub struct IdempotencyKey(/* validated operation key */);

pub struct LaunchLeaseGuard {
    team: TeamId,
    host: HostId,
    fencing: FencingToken,
    /* private fields: only lease validation can construct */
}

pub enum Launcher {
    Herdr(HerdrLauncher),
    Tmux(TmuxLauncher),
}

pub struct ErrorEnvelope {
    pub code: ErrorCode,
    pub message: String,
    pub operation: String,
    pub retryable: bool,
    pub recovery: Vec<RecoveryAction>,
    pub docs: Option<String>,
}
```

No public unguarded spawn method exists. Public traits are private or sealed unless an ADR explicitly approves third-party implementation. CLI exit codes, HTTP status, WebSocket command errors, and adapter failures map deterministically from `ErrorCode`.

## Ownership rules

- `shpherd-schema` owns row definitions and static store contracts; engine crates own SQL.
- `shpherd-store-adaptor` performs allowlisted reads/writes but owns no timer, lease, conflict policy, or route.
- `shpherd-service` owns validation, state machines, reconciliation, leases, and named mutations.
- `shpherd-daemon` owns composition, authenticated transport, local process adapters, workers, and health.
- Clients own presentation and platform capability adapters only.
- General generated database commands and widget examples are removed before the first usable product slice.
