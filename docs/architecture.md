# atm-shpherd architecture and ADR index

Every Phase B ADR is approved in its individually owned file under `docs/adr/`. This index is stable and B2-owned; contract sprints own only their disjoint ADR files and executable fixtures.

## Boundary map

The intended package graph is:

```text
shpherd-types <- shpherd-auth <- {shpherd-service, shpherd-daemon}
       ^
       +------ shpherd-schema <- {shpherd-store-sqlite, shpherd-store-postgres}
                         ^                         ^
                         +---- shpherd-store-adaptor
                         +---- shpherd-service
                                      ^
                    shpherd-daemon ---+--- authenticated API
                                      ^
                         shpherd-cli / browser / Tauri
```

Clients never access stores or services in-process. External ATM, hmux/Herdr, tmux, sc-cron, and observability integrations are leaf adapters owned by `shpherd-daemon` or the client capability layer.

## ADR index

| ADR | Status | Decision | Finalized by |
|---|---|---|---|
| [ADR-SHP-001](adr/ADR-SHP-001.md) | approved | runtime/application boundary | B2 |
| [ADR-SHP-002](adr/ADR-SHP-002.md) | approved | explicit host-aggregate projection | B3A |
| [ADR-SHP-003](adr/ADR-SHP-003.md) | approved | thin authenticated clients | B2 |
| [ADR-SHP-004](adr/ADR-SHP-004.md) | approved | canonical identities, revisions, and cursors | B2 |
| [ADR-SHP-005](adr/ADR-SHP-005.md) | approved | closed guarded launcher lifecycle | B3B |
| [ADR-SHP-006](adr/ADR-SHP-006.md) | approved | versioned ATM projection/command mutation | B3C |
| [ADR-SHP-007](adr/ADR-SHP-007.md) | approved | hmux capability-negotiated lifecycle | B3C |
| [ADR-SHP-008](adr/ADR-SHP-008.md) | approved | shared responsive UI/native shells | B2 |
| [ADR-SHP-009](adr/ADR-SHP-009.md) | approved | injectable sc-cron handler | B3C |
| [ADR-SHP-010](adr/ADR-SHP-010.md) | approved | MCP disabled in Phase B | B3C |
| [ADR-SHP-011](adr/ADR-SHP-011.md) | approved | versioned response/event envelope | B3B |
| [ADR-SHP-012](adr/ADR-SHP-012.md) | approved | PostgreSQL lease authority | B3A |
| [ADR-SHP-013](adr/ADR-SHP-013.md) | approved | enrolled hosts/local project bindings | B3B |
| [ADR-SHP-014](adr/ADR-SHP-014.md) | approved | clone identity/reference policy | B3B |
| [ADR-SHP-015](adr/ADR-SHP-015.md) | approved | source-qualified synchronization protocol | B3A |

## Required contract signatures

B2 owns all canonical cross-track primitives and bridge evidence in `shpherd-types::foundation`, plus the verification-independent principal/issuer capability in lower `shpherd-auth`. B3A owns only complete launchable shared-row, typed-key/canonical-batch, tombstone, and tagged lease-operation composites; B3B owns only the closed hierarchy/atomic Team bundle, dispatch, roster/query, split launcher, tagged response/stream, and enrollment composites; B3C owns only ATM, split hmux, and sc-cron composites. Each contract fixture compiles at its declared prerequisite without sibling imports and may not weaken the linked approved ADRs.

No public unguarded spawn method exists. `ProjectionStore` is the one Phase B open trait because the app-owned SQLite and PostgreSQL crates implement it across crate boundaries; ADR-SHP-002 and boundary validation restrict its approved implementations. Service and launcher traits, including `GuardedLauncher`, remain private or sealed unless a later ADR explicitly opens them. CLI exit codes, HTTP status, WebSocket command errors, and adapter failures map deterministically from `ErrorCode`.

## Ownership rules

- B2 owns the canonical foundation, lower `shpherd-auth` non-serializable principal/issuer seam, and fail-closed runtime-release detector/history/dispatch/close gate; feature and interrupt sprints cannot replace them. Daemon alone parses/verifies credentials; service and adapters consume borrowed principals and never depend on daemon.
- `shpherd-schema` owns row definitions and static store contracts; engine crates own SQL.
- `shpherd-store-adaptor` performs allowlisted reads/writes but owns no timer, lease, conflict policy, or route.
- `shpherd-service` owns validation, state machines, reconciliation, leases, and named mutations.
- `shpherd-daemon` owns composition, authenticated transport, local process adapters, workers, and health.
- Clients own presentation and platform capability adapters only.
- Wire/domain payloads contain no caller authorization claims; daemon composition injects verified principal context.
- General generated database commands and widget examples are removed before the first usable product slice.
