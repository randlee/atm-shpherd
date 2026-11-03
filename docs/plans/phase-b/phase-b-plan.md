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
| types/schema | `boundaries/shpherd-schema.yaml` | IDs, rows, errors, store contracts, parity and extension migrations | types | B3, B3A, B4A |
| engine stores/adaptor | engine manifests | separate SQLite, PostgreSQL, and static-adaptor implementations | schema contract | B4A, B4B, B4C, B9A |
| domain service | `boundaries/shpherd-service.yaml` | definitions, observation, leases, reconciliation, guarded commands | schema/adaptor | B5, B6, B9B, B9C |
| local launch adapters | daemon manifest | closed Herdr/tmux launcher and hmux capability contract | service/types | B7, B8 |
| ATM adapter | daemon manifest | versioned import and exact command mutation/reconciliation | service/types | B6A |
| daemon API | daemon manifest | authenticated snapshots, commands, events, errors | service/types | B10A |
| clients | client boundary | browser/Tauri presentation and capability adapters | daemon API only | B10, B11, B11A |
| scheduler/supervision | daemon manifest | sc-cron registration and OS lifecycle | service/API | B12, B12A |

B2 creates these manifests from the generated workspace. Until then this table is the intended contract and B2 owns reconciliation with generated paths.

## Required-document disposition

| Required planning input | Authoritative source or creation owner |
|---|---|
| Project and product plan | `docs/atm-shpherd-prd.md`, `README.md`, and `docs/user-stories.md` |
| Phase and sprint plans | this document and every `sprint-b-*.md` listed below |
| Requirements and architecture | `docs/requirements.md`, `docs/architecture.md`, and the PRD |
| Crate documentation | PRD §4.2 now; B2 creates `crates/*/README.md` and links each generated boundary manifest |
| ADRs | `docs/architecture.md` ADR index; B3A/B3B/B3C approve the remaining proposed decisions with executable fixtures |
| Protocol/schema/interface contracts | `docs/integrations/atm-hmux-contract.md`, `docs/porting/scmux-behavior-oracle.md`, and B3A/B3B/B3C-owned `docs/contracts/**` |
| Machine-readable boundaries | intentionally absent before generation; B2 alone creates and validates the `boundaries/**` registry rather than pretending manifests already exist |
| Issues inventory | Dolt-backed Beads epic `shp-phase-b` and its 25 direct children; sprint frontmatter records the exact child ID |
| Testing/cross-platform guidance | `docs/testing-and-platforms.md`, plus sprint-local acceptance and evidence ownership |
| Process/QA/triage | no shared ATM routing or QA workflow changes in Phase B; product-side ATM command behavior is owned by B3C/B6A/B9C and release defects receive separate fix beads |

## Tracks and waves

The bootstrap chain is necessarily serial because each step consumes the generated or migrated artifact before it. After contracts and SQLite parity, storage, ATM, observation, launcher, API, and client work fan out where their owned paths are disjoint. `must_follow` edges name the consumed artifact in each sprint document.

Stable track IDs do not change between the registry and wave table. A shared contract may be consumed by another track without changing its primary track. Track-local critical paths count track nodes only and exclude the common B1→B2 prefix and evidence-only B13 unless the track is `T-BOOT` or `T-RELEASE`.

| Track ID | Capability | Contract/baseline | Parallel layers | Integration owner | Track-local critical path |
|---|---|---|---|---|---|
| T-BOOT | released runtime workspace | B1 baseline | B2 integration; 0.2.0 interrupt | B2 | 3: B1 → B2 → interrupt |
| T-STORAGE | parity, local/shared stores, synchronization | B3A after B3 parity | B4A, B4B, B4C | B9A | 4: B3 → B3A → B4x → B9A |
| T-SERVICE | definition and observation services | B3B | B5, B6 | B10 read composition; B11 command composition | 4: B3B → B5/B6 → B10 → B11 |
| T-LAUNCH | Herdr/tmux launch ownership | B3B plus B3C hmux contract | B7, B8 | B9B | 3: latest contract → B7/B8 → B9B |
| T-ATM | versioned roster projection and expansion | B3C | B6A | B9C | 3: B3C → B6A → B9C |
| T-API-CLIENT | authenticated API and shared clients | B3B | B10A boundary | B10, B11, then B11A native packaging | 5: B3B → B10A → B10 → B11 → B11A |
| T-SCHEDULE | recurring guarded operations | B3C sc-cron contract | B12 application registration/policy | B12 | 2: B3C → B12 |
| T-OPS | daemon supervision and lifecycle | B3B/B3C lifecycle contracts | B12A platform adapters | B12A | 3: B3B/B3C → B10A/B12 → B12A |
| T-RELEASE | bounded release evidence | prior track evidence contracts | none | B13 evidence only | 1: B13 |

| Wave | Track | Sprint | Target boundary | Authoritative owned paths | Consumes |
|---|---|---|---|---|---|
| 0 | T-BOOT | B1 | runtime workspace | `config/generator/*`, `docs/evidence/b-1/**` | none |
| 1 | T-BOOT | B2 | generated workspace | root manifests, crate skeleton registries/READMEs, boundary index/schema, client shell, platform test matrix | B1 generated digest |
| 2 | T-STORAGE | B3 | parity schema/SQLite | schema parity modules, parity migrations/tests/evidence | B2 schema/store skeletons |
| 2 | T-SERVICE | B3B | service/launch/API contract | service/API contract docs, core types, service/daemon/CLI manifests | B2 registry |
| 2 | T-ATM | B3C | external integrations | ATM/hmux/cron contract docs, external types/manifest | B2 daemon adapter boundary |
| 3 | T-STORAGE | B3A | schema/projection contract | storage contract docs/types/store manifests | B3 fingerprint |
| 3 | T-SERVICE | B5 | definition service | `shpherd-service/{src,tests}/definitions/**` | B3B definition double |
| 3 | T-SERVICE | B6 | observation service | `shpherd-service/{src,tests}/observation/**` | B3B reader double |
| 3 | T-ATM | B6A | ATM adapter | daemon ATM adapter/tests and ATM fixtures | B3C ATM double |
| 3 | T-LAUNCH | B7 | Herdr/hmux adapter | daemon Herdr adapter/tests and hmux fixtures | B3B guard + B3C hmux double |
| 3 | T-LAUNCH | B8 | tmux adapter | daemon tmux adapter/tests and fixtures | B3B guard/observation double |
| 3 | T-API-CLIENT | B10A | daemon API/CLI boundary | daemon API/auth/events/tests and CLI | B3B service doubles |
| 4 | T-STORAGE | B4A | local schema/SQLite | schema/SQLite extension modules, migrations, tests | B3A local contract |
| 4 | T-STORAGE | B4B | PostgreSQL projection | PostgreSQL projection modules, migrations, tests | B3A shared contract |
| 4 | T-STORAGE | B4C | static adaptor | adaptor source/tests | B3A batch/store doubles |
| 5 | T-STORAGE | B9A | cross-store synchronization | service sync modules/tests and sync integration tests | B4A/B4B/B4C |
| 6 | T-LAUNCH | B9B | launch ownership | service lease/launch modules/tests and launch integration | B7/B8/B9A |
| 6 | T-API-CLIENT | B10 | read client/API composition | catalog/API/observability client paths, real-service integration, performance tests | B10A/B5/B6/B9A |
| 7 | T-ATM | B9C | roster expansion | roster workflow and integration tests | B6A/B7/B9A/B9B |
| 7 | T-SCHEDULE | B12 | scheduled operations | daemon scheduling and service scheduled-operation paths | B3C/B9B |
| 8 | T-API-CLIENT | B11 | editor/actions/API composition | editor/action client paths, real-command integration, E2E tests | B10/B5/B9B/B9C |
| 8 | T-OPS | B12A | supervision | supervision source/tests, platform packaging, operations docs | B10A/B9B/B12 |
| 9 | T-API-CLIENT | B11A | Tauri mobile | generated mobile projects, mobile adapters/tests/docs | B11 |
| 10 | T-RELEASE | B13 | release evidence | `docs/evidence/phase-b/**`, release note | B9C/B11A/B12A evidence |
| interrupt | T-BOOT | 0.2.0 upgrade | runtime workspace | runtime-managed manifests/lint/CI/evidence | B2 + released tag |

- Sprint count: 25 including three independent contract sprints, three storage boundary siblings, and the 0.2.0 interrupt.
- Maximum usable width: 7 (wave 3).
- Longest `must_follow` chain: 11 including bootstrap and evidence-only certification. Feature tracks close at their own integration sprint; B13 adds no product integration.
- Structured relations in sprint frontmatter contain 44 named-artifact `must_follow` edges and 33 unique `parallel_safe` pairs. Validation rejects duplicate pairs, any must-follow/parallel-safe contradiction, and same-wave owned-path intersections.
- The 0.2.0 interrupt runs immediately after B2 when released and before newly started feature work, per ANC-003.

## Track contracts

- B3A depends on parity and freezes storage/projection contracts for B4A/B4B/B4C.
- B3B starts after B2 and freezes service, launcher, guard, error, daemon command/event, and test-double contracts.
- B3C starts after B2 and freezes ATM, hmux, sc-cron, redaction, and MCP-disabled external contracts.

## Performance and platform budgets

B10 measures a deterministic 100-team/1,500-member fixture on the macOS arm64 CI reference runner (or a recorded equivalent): initial interactive catalog within 2.0 s, search/filter response p95 under 100 ms, and an event reflected p95 under 250 ms over 1,000 events. B13 records the exact hardware and tool versions. Desktop targets are macOS, Linux, and Windows; B11A adds iOS and Android build plus simulator/emulator evidence.

## Traceability

Every sprint has one structured `requirements`, `adrs`, `owned_paths`, and `relations` list. Contract and boundary sprints use empty requirement lists and boundary/ADR-rooted criteria. Integration ownership is unique: ANC-001/002 belong to B1; ANC-003..005 to the interrupt; ANC-006/010 to B9A; ANC-008/009 to B9B; ANC-007 and REQ-API to B10; REQ-DEFINITION to B11. B13 verifies evidence completeness without re-owning any feature criterion.

## Process artifacts

The boundary manifests are consumed by compilation/boundary validation and remain permanent. Contract fixtures are consumed by independent layer implementations and retained as regression tests. The parity fingerprint is consumed by B3A/B9A to prevent premature target-specific drift. B13 only assembles immutable evidence; defects receive separate fix ownership.
