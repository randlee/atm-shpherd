---
id: phase-b
status: planned
integration_branch: integrate/phase-b
target_branch: develop
---

# Phase B — working Shpherd on sc-runtime

## Authority and goal

This plan implements `docs/atm-shpherd-prd.md` and the locked anchors in `anchors.json`. The sprint documents here are authoritative execution scope; Beads epic `shp-phase-b` mirrors status and dependencies. Phase B begins with an untouched sc-runtime 0.1.1 `sqlite-postgres` generation, proves it, ports scmux parity, then adds independent Shpherd ATM-observation, launcher, fleet-projection, API, UI, heartbeat, and operational components composed by a thin daemon. ATM remains authoritative for each running team instance. Herdr is the default; tmux remains explicit, including from the `shpherd` CLI over SSH.

## Boundary map

| Boundary | Intended manifest | Contract change | Allowed dependencies | Primary sprints |
|---|---|---|---|---|
| runtime workspace | generated root manifests | published 0.1.1 baseline, later 0.2.0 managed update | sc-runtime crates only | B1, B2, interrupt |
| foundation/types/auth | root/package manifests | canonical cross-track IDs, revisions/cursors, logical refs, bridge evidence, and verification-independent authorization | generated runtime only | B2 |
| schema | `boundaries/shpherd-schema.yaml` | rows, errors, store contracts, parity and extension migrations | B2 foundation | B3, B3A, B4A |
| engine stores/adaptor | engine manifests | separate SQLite, PostgreSQL, and static-adaptor implementations | schema contract | B4A, B4B, B4C, B9A |
| domain service | `boundaries/shpherd-service.yaml` | definitions, observation, reconciliation, and host-local idempotent commands | schema/adaptor | B5, B6, B9B, B9C |
| local launch adapters | launcher manifest | independent closed Herdr/tmux adapters and hmux capability contract | service/types | B7, B8 |
| ATM adapter | ATM manifest | independent versioned observation and exact command mutation/reconciliation; ATM is actual-state authority | service/types | B6A |
| daemon API | daemon manifest | authenticated snapshots, commands, events, errors, and complete health/readiness wire plus typed dependency-input contract | service/types | B3B, B10A, B12A |
| clients | client boundary | browser/Tauri presentation and capability adapters | daemon API only | B10, B11, B11A |
| heartbeat/supervision | daemon manifest | typed ATM-heartbeat registration/freshness publication and OS lifecycle readiness composition | ATM/projection/API | B3C, B12, B12A |

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
| Issues inventory | `docs/issues-inventory.md` plus Dolt-backed Beads epic `shp-phase-b`; sprint frontmatter records implementation bead IDs and governance records are classified separately |
| Testing/cross-platform guidance | `docs/testing-and-platforms.md`, plus sprint-local acceptance and evidence ownership |
| Process/QA/triage | no shared ATM routing or QA workflow changes in Phase B; product-side ATM command behavior is owned by B3C/B6A/B9C and release defects receive separate fix beads |

## Tracks and waves

The bootstrap chain is necessarily serial because each step consumes the generated or migrated artifact before it. After contracts and SQLite parity, storage, ATM, observation, launcher, API, and client work fan out where their owned paths are disjoint. `must_follow` edges name the consumed artifact in each sprint document.

Stable track IDs do not change between the registry and wave table. A shared contract may be consumed by another track without changing its primary track. Track-local critical paths count track nodes only and exclude the common B1→B2 prefix and evidence-only B13 unless the track is `T-BOOT` or `T-RELEASE`.

| Track ID | Capability | Contract/baseline | Parallel layers | Integration owner | Track-local critical path |
|---|---|---|---|---|---|
| T-BOOT | released runtime workspace | B1 baseline | B2 integration; 0.2.0 interrupt | B2 | 3: B1 → B2 → interrupt |
| T-STORAGE | parity, local/shared stores, synchronization | B3A after B3 parity | B4A, B4B, B4C | B9A | 4: B3 → B3A → B4x → B9A |
| T-SERVICE | definition and observation services | B3B service contract plus B3A/B4A definition store | B5, B6 | B10 read composition and B11 command composition, independently | 4: latest contract → B4A → B5/B6 → B10/B11 |
| T-LAUNCH | independent Herdr/tmux launch adapters and host-local safety | B3B plus B3C hmux contract and B10A CLI/daemon boundary | B7, B8, B10A | B9B sole real SSH launch composition | 3: latest contract → B7/B8/B10A → B9B |
| T-ATM | versioned roster projection and expansion | B3C | B6A | B9C | 3: B3C → B6A → B9C |
| T-API-CLIENT | authenticated API and shared clients | B3B | B10A boundary | B10 read and B11 command applications in parallel, then B11A native packaging | 4: B3B → B10A → B10/B11 → B11A |
| T-HEARTBEAT | ATM-state polling heartbeat | B3C sc-cron registration/freshness contract plus B3B readiness-input contract | B12 registration, polling, and typed freshness publication | B12 | 2: B3B/B3C → B12 |
| T-OPS | daemon supervision and lifecycle | B3B health/readiness and B3C heartbeat contracts | B10A health-wire mapping; B12 heartbeat state; B12A platform adapters | B12A real readiness composition | 3: B3B/B3C → B10A/B12 → B12A |
| T-RELEASE | bounded release evidence | prior track evidence contracts | none | B13 evidence only | 1: B13 |

| Wave | Track | Sprint | Target boundary | Authoritative owned paths | Consumes |
|---|---|---|---|---|---|
| 0 | T-BOOT | B1 | runtime workspace | `config/generator/*`, `docs/evidence/b-1/**` | none |
| 1 | T-BOOT | B2 | generated workspace | root manifests, crate skeleton registries/READMEs, B2 foundation types/auth/boundary fixtures, boundary index/schema, client shell, platform test matrix, ordinary release-check evidence | B1 generated digest |
| 2 | T-STORAGE | B3 | parity schema/SQLite | schema parity modules, parity migrations/tests/evidence | B2 schema/store skeletons |
| 2 | T-SERVICE | B3B | service/launch/API contract | service/API/health-readiness contract docs, core types, service/daemon/CLI manifests | B2 registry |
| 2 | T-ATM | B3C | external integrations | ATM/hmux/cron registration-freshness contract docs, external types/manifest | B2 daemon adapter boundary |
| 3 | T-STORAGE | B3A | schema/projection contract | storage contract docs/types/store manifests | B3 fingerprint |
| 3 | T-ATM | B6A | ATM adapter | independent ATM adapter/tests and ATM fixtures | B3C ATM double |
| 3 | T-LAUNCH | B7 | Herdr/hmux adapter | independent Herdr adapter/tests and hmux fixtures | B3B guard + B3C hmux double |
| 3 | T-LAUNCH | B8 | tmux adapter | independent tmux adapter/tests and fixtures | B3B guard/observation double |
| 3 | T-API-CLIENT | B10A | daemon API/CLI boundary | daemon API/auth/events/health mapping tests and CLI | B3B service/readiness doubles |
| 4 | T-STORAGE | B4A | local schema/SQLite | schema/SQLite extension modules, migrations, tests | B3A local contract |
| 4 | T-STORAGE | B4B | PostgreSQL projection | PostgreSQL projection modules, migrations, tests | B3A shared contract |
| 4 | T-STORAGE | B4C | static adaptor | adaptor source/tests | B3A batch/store doubles |
| 5 | T-SERVICE | B5 | definition service | `shpherd-service/{src,tests}/definitions/**` | B3B definition double + B4A definition store |
| 5 | T-SERVICE | B6 | observation service | `shpherd-service/{src,tests}/observation/**` | B3B reader double + B4A definition-store reads |
| 5 | T-STORAGE | B9A | cross-store synchronization | service sync modules/tests and sync integration tests | B4A/B4B/B4C |
| 6 | T-LAUNCH | B9B | host-local launch safety | service operation/launch modules/tests, sole real SSH CLI/daemon/launcher integration, and cross-host duplicate-name evidence | B7/B8/B10A |
| 6 | T-API-CLIENT | B10 | read client/API composition | catalog/API/observability client paths, real-service integration, performance tests | B10A/B5/B6/B9A |
| 7 | T-ATM | B9C | roster expansion | roster workflow and integration tests | B6A/B7/B9A/B9B |
| 7 | T-HEARTBEAT | B12 | ATM-state heartbeat | heartbeat registration, typed freshness publication, readiness-input mapping, and ATM observation/projection integration | B3B/B3C/B6A/B9A |
| 8 | T-API-CLIENT | B11 | editor/actions/API composition | editor/action client paths, real-command integration, E2E tests | B2/B10A/B5/B9B/B9C; parallel-safe with B10 |
| 8 | T-OPS | B12A | supervision | real daemon-readiness composition, supervision source/tests, platform packaging, operations docs | B10A/B9B/B12 |
| 9 | T-API-CLIENT | B11A | Tauri mobile | generated mobile projects, mobile adapters/tests/docs | B10 read application + B11 command application |
| 10 | T-RELEASE | B13 | release evidence | `docs/evidence/phase-b/**`, release note | B9C/B11A/B12A evidence |
| interrupt | T-BOOT | 0.2.0 upgrade | runtime workspace | runtime-managed manifests/lint, exact upgrade workflow/evidence paths | B2 gate trigger + released tag |

- Sprint count: 25 including three independent contract sprints, three storage boundary siblings, and the 0.2.0 interrupt.
- Maximum usable width: 5 (wave 3).
- Longest `must_follow` chain: 11 including bootstrap and evidence-only certification. Feature tracks close at their own integration sprint; B13 adds no product integration.
- Structured relations in sprint frontmatter name every consumed artifact and parallel-safe pair. Validation rejects duplicate pairs, any must-follow/parallel-safe contradiction, and same-wave owned-path intersections; relation counts are derived rather than frozen in prose.
- B2 defines the authoritative release check used before feature dispatch and at B13. A present 0.2.0 release routes to the interrupt, absence is recorded, and an unavailable/ambiguous detector blocks until retried; Beads and sprint evidence remain the audit record without custom dispatch or closure hooks.

## Track contracts

- B2 first freezes the only canonical cross-track primitives: IDs, nonzero entity revisions, genesis-capable store/event cursors, typed hierarchy/logical refs, launcher/member primitives, registration evidence, and the `shpherd-auth` principal/issuer seam. Its compile matrix builds each contract track at its declared prerequisite and forbids sibling imports.
- B3A depends on parity and freezes only the host-qualified fleet row, app-owned definition-store read/atomic-commit seam, typed-key/canonical batch, tombstone, and projection-operation composites for B4A/B4B/B4C. It defines no launch authority.
- B3B starts after B2 and freezes only the closed hierarchy/atomic Team bundle, service/query, split launcher, host-local operation guard, tagged response/stream, error, and test-double composites while consuming B2 foundation/auth.
- B3C starts after B2 and freezes only ATM, split hmux, the ATM-heartbeat sc-cron callback, redaction, and MCP-disabled external composites while consuming B2 foundation/auth and bridge evidence.

## Performance and platform budgets

B10 measures a deterministic 100-team/1,500-member fixture on the macOS arm64 CI reference runner (or a recorded equivalent): initial interactive catalog within 2.0 s, search/filter response p95 under 100 ms, and an event reflected p95 under 250 ms over 1,000 events. B13 records the exact hardware and tool versions. Desktop targets are macOS, Linux, and Windows; B11A adds iOS and Android build plus simulator/emulator evidence.

## Traceability

Every sprint has one structured `requirements`, `adrs`, `owned_paths`, and `relations` list. Each list includes every requirement or locked anchor that the sprint implements or constrains; acceptance ownership remains explicit in prose and may be unique even when several prerequisite contracts cite the same authority. B13 verifies evidence completeness without re-owning any feature criterion.

## Process artifacts

The boundary manifests are consumed by compilation/boundary validation and remain permanent. Contract fixtures are consumed by independent layer implementations and retained as regression tests. The parity fingerprint is consumed by B3A/B9A to prevent premature target-specific drift. B13 only assembles immutable evidence; defects receive separate fix ownership. B13 repeats the authoritative release check and requires matching interrupt evidence if 0.2.0 was observed.
