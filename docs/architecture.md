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

Clients never access stores or services in-process. ATM observation/roster commands and hmux/Herdr/tmux launching are independent application adapters composed by the thin `shpherd-daemon`; `sc-cron` supplies only the Phase B ATM-state polling heartbeat. The daemon owns transport and lifecycle composition, not those components' domain policy.

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
| [ADR-SHP-012](adr/ADR-SHP-012.md) | approved | PostgreSQL fleet read model and host-local launch safety | B3A |
| [ADR-SHP-013](adr/ADR-SHP-013.md) | approved | enrolled hosts/local project bindings | B3B |
| [ADR-SHP-014](adr/ADR-SHP-014.md) | approved | clone identity/reference policy | B3B |
| [ADR-SHP-015](adr/ADR-SHP-015.md) | approved | source-qualified synchronization protocol | B3A |
| [ADR-SHP-016](adr/ADR-SHP-016.md) | approved | evidence-based runtime release check; amends ADR-SHP-001 | B2 |

## Required contract signatures

B2 owns all canonical cross-track primitives and bridge evidence in `shpherd-types::foundation`, plus the verification-independent principal/issuer capability in lower `shpherd-auth`. B3A owns only host-qualified fleet rows, typed-key/canonical-batch, tombstone, and projection-operation composites; B3B owns only the closed hierarchy/atomic Team bundle, dispatch, roster/query, split launcher, tagged response/stream, and enrollment composites; B3C owns only ATM, split hmux, and the ATM-heartbeat sc-cron composites. Each contract fixture compiles at its declared prerequisite without sibling imports and may not weaken the linked approved ADRs.

No public unguarded spawn method exists. The deliberately open cross-crate ports are `DefinitionStore` (schema-owned port with `shpherd-store-sqlite` as the sole production implementation and `shpherd-service` as its read/commit consumer), `ProjectionStore` (app-owned SQLite/PostgreSQL implementations), `OperationJournalStore` (schema/storage port with app-owned SQLite implementation), `OperationJournal` (service adapter over that lower port), `CronHandler` (the daemon-composed ATM heartbeat callback), `EvidenceVerifier` (daemon auth composition only), `AtmRosterAuthority` (service-owned port with the independent ATM adapter allowlisted), and the service-owned launcher and `HostProjectResolver` ports (independent hmux/Herdr/tmux adapters allowlisted). Boundary manifests and ADRs enumerate their permitted implementation and dependent crates. Application service traits are sealed beside their `shpherd-service` implementations; launcher mutation requires a host-local opaque operation guard and durable idempotency evidence. PostgreSQL exposes no launch-authorization, ownership, or global-uniqueness port. CLI exit codes, HTTP status, WebSocket command errors, and adapter failures map deterministically from `ErrorCode`.

## Ownership rules

- B2 owns the canonical foundation, lower `shpherd-auth` non-serializable principal/issuer seam, and authoritative release-check contract; feature and interrupt sprints cannot replace them. Daemon alone parses/verifies credentials and holds the issuer/verifier capability; boundary lint forbids service/adaptor issuer construction. Service and adapters consume borrowed principals and never depend on daemon.
- `shpherd-schema` owns row definitions and static store contracts; engine crates own SQL.
- `shpherd-store-adaptor` performs allowlisted host-qualified fleet projection reads/writes but owns no timer, launch authority, conflict policy, or route.
- `shpherd-service` owns validation, reconciliation, host-local idempotency/single-flight policy, and named mutations; ATM remains authoritative for actual running-team state.
- `shpherd-atm` and `shpherd-launchers` own their external-system adapters without owning timers or transport; the same team and agent names may run on different hosts.
- `shpherd-daemon` is a thin composition root for authenticated transport, component lifecycle, the ATM polling heartbeat, and health.
- Clients own presentation and platform capability adapters only.
- Wire/domain payloads contain no caller authorization claims; daemon composition injects verified principal context.
- General generated database commands and widget examples are removed before the first usable product slice.
