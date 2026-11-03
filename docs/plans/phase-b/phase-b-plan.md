---
id: phase-b
status: planned
integration_branch: integrate/phase-b
target_branch: develop
---

# Phase B — working Shpherd on sc-runtime

## Authority and goal

This plan implements `docs/atm-shpherd-prd.md` and the locked anchors in `anchors.json`. The sprint documents here are authoritative execution scope; Beads epic `shp-phase-b` mirrors status and dependencies. Phase B begins with an untouched sc-runtime 0.1.1 `sqlite-postgres` generation, proves it, ports scmux parity, then adds Shpherd-owned ATM, launcher, synchronization, API, UI, scheduling, and operational behavior. Herdr is the default; tmux remains explicit.

## Boundary map

| Boundary | Intended manifest | Contract change | Allowed dependencies | Primary sprints |
|---|---|---|---|---|
| runtime workspace | generated root manifests | published 0.1.1 baseline, later 0.2.0 managed update | sc-runtime crates only | B1, B2, interrupt |
| types/schema | `boundaries/shpherd-schema.yaml` | IDs, rows, errors, store contracts, parity and extension migrations | types | B3, B3A, B4 |
| engine stores/adaptor | engine manifests | SQLite/Postgres implementations and allowlisted projection | schema | B4, B9A |
| domain service | `boundaries/shpherd-service.yaml` | definitions, observation, leases, reconciliation, guarded commands | schema/adaptor | B5, B6, B9B, B9C |
| local launch adapters | daemon manifest | closed Herdr/tmux launcher and hmux capability contract | service/types | B7, B8 |
| ATM adapter | daemon manifest | versioned import and exact command mutation/reconciliation | service/types | B6A |
| daemon API | daemon manifest | authenticated snapshots, commands, events, errors | service/types | B10A |
| clients | client boundary | browser/Tauri presentation and capability adapters | daemon API only | B10, B11, B11A |
| scheduler/supervision | daemon manifest | sc-cron registration and OS lifecycle | service/API | B12, B12A |

B2 creates these manifests from the generated workspace. Until then this table is the intended contract and B2 owns reconciliation with generated paths.

## Tracks and waves

The bootstrap chain is necessarily serial because each step consumes the generated or migrated artifact before it. After contracts and SQLite parity, storage, ATM, observation, launcher, API, and client work fan out where their owned paths are disjoint. `must_follow` edges name the consumed artifact in each sprint document.

| Wave | Track | Sprints | Target boundaries |
|---|---|---|---|
| 0 | bootstrap | B1 | isolated generated baseline |
| 1 | bootstrap | B2 | integrated workspace and manifests |
| 2 | schema/contracts | B3, then B3A | parity schema; approved app contracts |
| 3 | parallel boundaries | B4, B5, B6A | schema/adaptor; service definitions; ATM adapter |
| 4 | parallel boundaries | B6, B9A, B10A | observation; synchronization; daemon API |
| 5 | launcher/integration | B7, B8, B9B, B10 | Herdr; tmux; leases; read UI |
| 6 | actions/operations | B9C, B11, B12, B12A | roster action; client actions; scheduler; supervision |
| 7 | native/release | B11A, B13 | mobile capability; release certification |

- Sprint count: 21 including B3A and the 0.2.0 interrupt.
- Maximum usable width: 4.
- Longest current `must_follow` chain: 10. The chain exceeds three because bootstrap generation, parity-before-extension (ANC-010), external command/lease safety, and real-client integration consume artifacts that cannot exist earlier. Independent boundaries still run in parallel at waves 3-6.
- The 0.2.0 interrupt runs immediately after B2 when released and before newly started feature work, per ANC-003.

## Cross-cutting contracts finalized by B3A

B3A approves ADR-SHP-002, 004, 005, 006, 007, 009, and 010. Its fixtures freeze projection exclusions/conflicts; domain newtypes and error mapping; sealed/open trait policy; closed launcher dispatch; `LaunchLeaseGuard`; ATM versions/commands; hmux capabilities/results; sc-cron callback grammar; and MCP disabled status. Downstream sprint documents cite those ADRs.

## Performance and platform budgets

B10 measures a deterministic 100-team/1,500-member fixture on the macOS arm64 CI reference runner (or a recorded equivalent): initial interactive catalog within 2.0 s, search/filter response p95 under 100 ms, and an event reflected p95 under 250 ms over 1,000 events. B13 records the exact hardware and tool versions. Desktop targets are macOS, Linux, and Windows; B11A adds iOS and Android build plus simulator/emulator evidence.

## Traceability

Every sprint document has one `requirements` list and one acceptance list. ANC-001..005 are owned by B1/the interrupt; ANC-006 and ANC-010 by B3/B4; ANC-007 by B10/B11; ANC-008 by B7 and integration sprints; ANC-009 by B8 and integration sprints. The final B13 gate requires every anchor development report to pass.

## Process artifacts

The boundary manifests are consumed by compilation/boundary validation to prevent dependency drift and remain permanent. Contract fixtures are consumed by independent layer implementations and retained as regression tests. The parity fingerprint is consumed by B4/B13 to prevent premature target-specific schema drift and remains until scmux parity is intentionally superseded by an approved migration.
