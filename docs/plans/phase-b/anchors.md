# Anchors - phase-b

Constraints captured during planning. Each anchor is a testable statement written by the orchestrator and approved by the user; the user's verbatim words are kept beneath it as provenance. Every anchor is judged at the planning gate and again at the development gate. Edit `anchors.json`, not this file; this file is rendered.

Intent: `docs/plans/phase-b/intent.md`

| ID | Status | Summary | Stated |
| --- | --- | --- | --- |
| ANC-001 | locked | Generate from sc-runtime 0.1.1 | 2026-11-02 |
| ANC-002 | locked | Install and test before migration | 2026-11-02 |
| ANC-003 | locked | Upgrade immediately to 0.2.0 | 2026-11-02 |
| ANC-004 | locked | Apply 0.2.0 dependency updates | 2026-11-02 |
| ANC-005 | locked | Install sc-lint 0.8.4 or newer | 2026-11-02 |
| ANC-006 | locked | Port the scmux database schema | 2026-11-02 |
| ANC-007 | locked | Port the scmux UI logic | 2026-11-02 |
| ANC-008 | locked | Use Herdr as default launcher | 2026-11-02 |
| ANC-009 | locked | Retain tmux launch support | 2026-11-02 |
| ANC-010 | locked | Establish parity before Herdr fields | 2026-11-02 |
| ANC-011 | locked | Use ATM as actual-state authority | 2026-11-03 |
| ANC-012 | locked | Keep PostgreSQL as fleet read model | 2026-11-03 |
| ANC-013 | locked | Permit host-qualified duplicate teams | 2026-11-03 |
| ANC-014 | locked | Launch persisted teams over SSH | 2026-11-03 |
| ANC-015 | locked | Limit MVP cron to ATM heartbeat | 2026-11-03 |

## ANC-001

Anchor: Shpherd's initial runtime workspace must be generated from sc-runtime version 0.1.1.

> install the sc-runtime templates at 0.1.1 (latest release)

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Generate from sc-runtime 0.1.1

Scope: The first Phase B bead that installs or generates the Shpherd runtime workspace.

Deterministic check to pair with the development gate: Cargo metadata and the generation record identify sc-runtime 0.1.1 for the initial Shpherd scaffold.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-12-scheduling`: B12 depends on an existing runtime baseline and does not install or generate the initial Shpherd workspace.
- `sprint-b-12a-daemon-supervision`: B12A adds daemon lifecycle supervision and does not install or generate Shpherd's initial runtime workspace.
- `sprint-b-13-release-certification`: B13 certifies existing implementation evidence and does not install or generate the initial Shpherd runtime workspace.
- `sprint-b-3-port-sqlite-parity`: This sprint follows the generated workspace and ports SQLite schema parity; it does not install or generate the initial runtime workspace.
- `sprint-b-3a-schema-projection-contract`: B3A freezes storage contracts after bootstrap and does not install or generate the initial runtime workspace.
- `sprint-b-3b-service-launch-api-contract`: B3B freezes application contracts after bootstrap and does not install or generate the initial runtime workspace.
- `sprint-b-3c-external-integration-contract`: B3C freezes external integration contracts after bootstrap and does not install or generate the initial runtime workspace.
- `sprint-b-4a-local-schema-sqlite`: B4A extends the already-generated workspace and does not install or generate the initial sc-runtime template baseline.
- `sprint-b-7-herdr-launcher`: B7 implements the Herdr adapter after workspace generation and does not install or generate the initial sc-runtime template baseline.
- `sprint-b-8-tmux-launcher`: B8 ports tmux compatibility after workspace generation and does not install or generate the initial runtime template.
- `sprint-b-9a-sync-projection`: B9A integrates completed stores after workspace generation and does not install or generate the initial runtime template.
- `sprint-b-9b-launch-leases`: B9B is later launch integration and does not install the initial workspace or perform the sc-runtime v0.2.0 dependency/sc-lint upgrade.
- `sprint-b-9c-expand-roster`: B9C implements roster expansion after workspace generation and does not install the initial runtime template.
- `sprint-b-11a-mobile`: B11A is later native packaging and does not install the initial workspace or perform the sc-runtime v0.2.0 dependency/sc-lint upgrade.
- `sprint-b-10a-daemon-api`: B10A implements the daemon API after bootstrap and does not install or generate the initial runtime workspace.

Beads: anchor `shp-shk`, plan questions `shp-shk.1`, dev questions `shp-shk.2`

Fixtures:
- pass: B1 generates Shpherd from the sc-runtime v0.1.1 tag in release mode and resolves published 0.1.1 runtime crates.
- fail: B1 generates Shpherd from an unreleased sc-runtime checkout or any template version other than 0.1.1.

## ANC-002

Anchor: Template installation and testing must precede scmux feature and UI migration in Phase B.

> I would expect the plan to start w/ template installation and testing. Then have sprints to migrate the current scmux features and ui to shpherd.

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Install and test before migration

Scope: The dependency order among Phase B implementation beads.

Deterministic check to pair with the development gate: Every scmux migration bead depends transitively on the completed sc-runtime installation-and-test bead.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-13-release-certification`: B13 certifies existing implementation evidence and does not implement template installation or scmux migration.
- `sprint-b-9a-sync-projection`: B9A implements new SQLite-to-PostgreSQL synchronization after schema parity; it does not port scmux schema, feature behavior, or UI.
- `sprint-b-9c-expand-roster`: B9C implements new ATM roster expansion after the retained scmux behavior is ported; it does not port scmux schema, feature behavior, or UI.
- `sprint-b-12a-daemon-supervision`: B12A adds new cross-platform daemon supervision after migrated features are complete; it does not port scmux schema, feature behavior, or UI.
- `sprint-b-9b-launch-leases`: B9B composes host-local launch safety after the launcher port and does not port scmux schema, feature behavior, or UI.
- `sprint-b-12-scheduling`: B12 adds the new sc-cron ATM heartbeat after the required B1/B2 prerequisites and does not migrate scmux schema, feature behavior, or UI.
- `sprint-b-11a-mobile`: B11A packages the already-migrated shared application for native mobile and does not port scmux schema, feature behavior, or UI.

Beads: anchor `shp-vvt`, plan questions `shp-vvt.1`, dev questions `shp-vvt.2`

Fixtures:
- pass: Every scmux schema, behavior, and UI migration bead depends transitively on the completed B1 template installation and test gates.
- fail: A scmux schema, behavior, or UI migration starts before B1 template installation and testing pass.

## ANC-003

Anchor: The sc-runtime 0.2.0 upgrade must be the next Shpherd work started after version 0.2.0 is released.

> updrade to 0.2.0 as soon as it lands

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Upgrade immediately to 0.2.0

Scope: Phase B work started after the sc-runtime 0.2.0 release becomes available.

Deterministic check to pair with the development gate: The tracker history shows no new feature bead started between the sc-runtime 0.2.0 release and the Shpherd 0.2.0 upgrade bead.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-1-generate-baseline`: This sprint establishes the sc-runtime 0.1.1 baseline and does not cover work started after sc-runtime 0.2.0 is released.

Beads: anchor `shp-czn`, plan questions `shp-czn.1`, dev questions `shp-czn.2`

Fixtures:
- pass: After the sc-runtime v0.2.0 tag appears, the 0.2.0 interrupt is the next newly started Shpherd bead.
- fail: After the sc-runtime v0.2.0 tag appears, a different ready feature bead starts before the upgrade interrupt.

## ANC-004

Anchor: Shpherd's sc-runtime 0.2.0 upgrade must include the dependency updates supplied by that release.

> 0.2.0 upgrades some dependencies and fully installs sc-lint 0.8.4+ on consumer repo

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Apply 0.2.0 dependency updates

Scope: The Phase B bead that upgrades Shpherd from sc-runtime 0.1.1 to 0.2.0.

Deterministic check to pair with the development gate: Shpherd's dependency manifests match a fresh sc-runtime 0.2.0 generation for managed dependency versions.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-10-dashboard`: B10 extends the generated client baseline and does not perform the sc-runtime 0.2.0 dependency upgrade.
- `sprint-b-11-editor-actions`: B11 implements editor and launch actions and does not perform the sc-runtime 0.2.0 dependency upgrade.
- `sprint-b-12a-daemon-supervision`: B12A adds daemon lifecycle supervision and does not perform the sc-runtime 0.2.0 dependency upgrade.
- `sprint-b-1-generate-baseline`: This sprint establishes the sc-runtime 0.1.1 baseline and does not cover the dependency updates in the sc-runtime 0.2.0 upgrade.
- `sprint-b-3-port-sqlite-parity`: B3 ports scmux SQLite parity and does not perform the sc-runtime 0.2.0 dependency upgrade.
- `sprint-b-3b-service-launch-api-contract`: B3B freezes service and launcher contracts but does not perform the sc-runtime 0.2.0 dependency upgrade.
- `sprint-b-3c-external-integration-contract`: B3C freezes external integration contracts but does not perform the sc-runtime 0.2.0 dependency upgrade.
- `sprint-b-4a-local-schema-sqlite`: B4A implements SQLite schema extensions and does not perform the sc-runtime v0.2.0 managed dependency upgrade.
- `sprint-b-7-herdr-launcher`: sprint-b-7-herdr-launcher implements feature behavior and does not perform the sc-runtime v0.2.0 managed dependency upgrade.
- `sprint-b-8-tmux-launcher`: sprint-b-8-tmux-launcher implements feature behavior and does not perform the sc-runtime v0.2.0 managed dependency upgrade.
- `sprint-b-9a-sync-projection`: sprint-b-9a-sync-projection implements feature behavior and does not perform the sc-runtime v0.2.0 managed dependency upgrade.
- `sprint-b-9b-launch-leases`: B9B is later launch integration and does not install the initial workspace or perform the sc-runtime v0.2.0 dependency/sc-lint upgrade.
- `sprint-b-11a-mobile`: B11A is later native packaging and does not install the initial workspace or perform the sc-runtime v0.2.0 dependency/sc-lint upgrade.
- `sprint-b-12-scheduling`: B12 integrates scheduled operations; only the runtime-upgrade interrupt applies dependency updates supplied by sc-runtime 0.2.0.
- `sprint-b-9c-expand-roster`: B9C performs roster expansion and does not apply dependency updates supplied by sc-runtime 0.2.0; the runtime-upgrade interrupt owns that work.
- `sprint-b-3a-schema-projection-contract`: B3A freezes storage contracts and does not perform the sc-runtime 0.2.0 dependency upgrade.
- `sprint-b-10a-daemon-api`: B10A implements the daemon API after bootstrap and does not own the sc-runtime 0.2.0 dependency upgrade.
- `sprint-b-6-observation`: B6 implements the observation read boundary and does not perform the sc-runtime 0.2.0 upgrade or manage its dependency updates.
- `sprint-b-5-definition-service`: B5 implements definition-service behavior and does not perform the sc-runtime 0.2.0 managed dependency upgrade.

Beads: anchor `shp-des`, plan questions `shp-des.1`, dev questions `shp-des.2`

Fixtures:
- pass: The 0.2.0 upgrade applies every managed dependency-version change shown by an equivalent fresh v0.2.0 generation.
- fail: The upgrade leaves a managed dependency at its 0.1.1 version despite the fresh v0.2.0 generation changing it.

## ANC-005

Anchor: Shpherd's sc-runtime 0.2.0 upgrade must leave sc-lint 0.8.4 or newer fully installed in the consumer repository.

> 0.2.0 upgrades some dependencies and fully installs sc-lint 0.8.4+ on consumer repo

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Install sc-lint 0.8.4 or newer

Scope: The Phase B bead that upgrades Shpherd from sc-runtime 0.1.1 to 0.2.0.

Deterministic check to pair with the development gate: The consumer repository contains the complete sc-lint installation and its version check reports 0.8.4 or newer.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-10-dashboard`: B10 extends the generated client baseline and does not perform the sc-runtime 0.2.0 upgrade or install sc-lint.
- `sprint-b-11-editor-actions`: B11 implements editor and launch actions and does not perform the sc-runtime 0.2.0 upgrade or install sc-lint.
- `sprint-b-12-scheduling`: B12 integrates scheduled operations and does not perform the sc-runtime 0.2.0 upgrade or install sc-lint.
- `sprint-b-12a-daemon-supervision`: B12A adds daemon lifecycle supervision and does not perform the sc-runtime 0.2.0 upgrade or install sc-lint.
- `sprint-b-1-generate-baseline`: This sprint establishes the sc-runtime 0.1.1 baseline and does not cover the sc-lint installation in the sc-runtime 0.2.0 upgrade.
- `sprint-b-3-port-sqlite-parity`: B3 ports scmux SQLite parity and does not install the sc-runtime 0.2.0 sc-lint consumer assets.
- `sprint-b-3b-service-launch-api-contract`: B3B freezes service and launcher contracts but does not install the sc-runtime 0.2.0 sc-lint assets.
- `sprint-b-3c-external-integration-contract`: B3C freezes external integration contracts but does not install the sc-runtime 0.2.0 sc-lint assets.
- `sprint-b-4a-local-schema-sqlite`: B4A implements SQLite schema extensions and does not install the sc-runtime v0.2.0 sc-lint consumer assets.
- `sprint-b-7-herdr-launcher`: sprint-b-7-herdr-launcher implements feature behavior and does not install the sc-runtime v0.2.0 sc-lint consumer assets.
- `sprint-b-8-tmux-launcher`: sprint-b-8-tmux-launcher implements feature behavior and does not install the sc-runtime v0.2.0 sc-lint consumer assets.
- `sprint-b-9a-sync-projection`: sprint-b-9a-sync-projection implements feature behavior and does not install the sc-runtime v0.2.0 sc-lint consumer assets.
- `sprint-b-9b-launch-leases`: B9B is later launch integration and does not install the initial workspace or perform the sc-runtime v0.2.0 dependency/sc-lint upgrade.
- `sprint-b-11a-mobile`: B11A is later native packaging and does not install the initial workspace or perform the sc-runtime v0.2.0 dependency/sc-lint upgrade.
- `sprint-b-10a-daemon-api`: B10A implements the daemon API boundary; only the runtime-upgrade interrupt installs sc-lint 0.8.4 or newer.
- `sprint-b-9c-expand-roster`: B9C performs roster expansion and does not install sc-lint; the runtime-upgrade interrupt owns the sc-lint 0.8.4 or newer installation.
- `sprint-b-3a-schema-projection-contract`: B3A freezes storage contracts and does not install the sc-runtime 0.2.0 sc-lint consumer assets.
- `sprint-b-5-definition-service`: B5 implements definition-service behavior and does not install the sc-runtime 0.2.0 sc-lint consumer assets.

Beads: anchor `shp-sb9`, plan questions `shp-sb9.1`, dev questions `shp-sb9.2`

Fixtures:
- pass: The consumer repository contains all v0.2.0-managed .sc-lint assets, requires sc-lint 0.8.4 or newer, and passes setup and lint compatibility checks.
- fail: The repository reports an sc-lint binary version but omits managed .sc-lint assets or permits a version older than 0.8.4.

## ANC-006

Anchor: Shpherd's initial database schema must be ported from scmux.

> use the existing schema + ui logic in scmux

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Port the scmux database schema

Scope: Every Phase B bead that creates or migrates Shpherd database schema objects.

Deterministic check to pair with the development gate: A schema parity test compares Shpherd migrations with the pinned scmux schema and explains every intentional difference.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-12-scheduling`: B12 integrates schedules through sc-cron and does not create or migrate Shpherd database schema objects.
- `sprint-b-2-integrate-workspace`: B2 freezes shared contract types but creates or migrates no Shpherd database schema objects; the schema port belongs to a later database sprint.
- `sprint-b-1-generate-baseline`: B1 generates and tests the runtime template baseline but does not port or migrate the scmux database schema.
- `sprint-b-4b-postgres-projection-store`: B4B implements a new cloud projection store and does not own the initial scmux SQLite schema port.
- `sprint-b-6a-atm-projection`: B6A implements an ATM adapter against frozen fixtures and creates or migrates no Shpherd database schema objects.
- `sprint-b-9b-launch-leases`: B9B composes existing stores and launchers but creates or migrates no Shpherd database schema object.
- `sprint-b-9c-expand-roster`: B9C composes roster and launch services and creates or migrates no Shpherd database schema object.
- `sprint-b-6-observation`: B6 implements read-only observation after schema contracts; B3 owns the initial scmux schema port.
- `sprint-b-5-definition-service`: B5 implements service-layer definition behavior over the completed store seam; it creates or migrates no database schema object.
- `sprint-b-10a-daemon-api`: B10A implements daemon transport, startup, health, and observability contracts; it creates or migrates no database schema object.
- `sprint-b-12a-daemon-supervision`: B12A composes and supervises the completed daemon and creates or migrates no Shpherd database schema objects.

Beads: anchor `shp-n20`, plan questions `shp-n20.1`, dev questions `shp-n20.2`

Fixtures:
- pass: B3 ports and fingerprints the pinned scmux SQLite schema, with every difference explicitly excluded before target extensions begin.
- fail: B3 replaces the scmux schema with a newly designed Shpherd schema without first establishing parity.

## ANC-007

Anchor: Shpherd's initial UI logic must be ported from scmux.

> use the existing schema + ui logic in scmux

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Port the scmux UI logic

Scope: Every Phase B bead that creates or migrates dashboard or editor UI logic.

Deterministic check to pair with the development gate: UI parity tests map each retained scmux dashboard and editor behavior to a Shpherd implementation and test.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-2-integrate-workspace`: B2 preserves the generated client shell but ports no scmux dashboard or editor UI logic; UI parity belongs to later client sprints.
- `sprint-b-1-generate-baseline`: B1 generates and tests the runtime template baseline but does not port scmux dashboard or editor UI logic.
- `sprint-b-11a-mobile`: B11A packages the shared B11 application and adds native capability adapters; it creates or migrates no dashboard or editor UI logic.
- `sprint-b-7-herdr-launcher`: B7 ports the scmux hmux launcher as a daemon adapter and implements no dashboard or editor UI logic.
- `sprint-b-3b-service-launch-api-contract`: B3B freezes service, launcher, and API contracts but creates or migrates no dashboard or editor UI logic.

Beads: anchor `shp-2rr`, plan questions `shp-2rr.1`, dev questions `shp-2rr.2`

Fixtures:
- pass: UI migration beads map each retained scmux dashboard and editor behavior to a Shpherd implementation and parity test.
- fail: The Shpherd UI is rebuilt without identifying or testing the retained scmux UI behavior it replaces.

## ANC-008

Anchor: Herdr must be Shpherd's default launcher.

> shpherd will be herdr first (by default)

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Use Herdr as default launcher

Scope: Any Phase B bead that defines or implements launch backend selection.

Deterministic check to pair with the development gate: A launcher selection test proves an unset launcher chooses Herdr.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-10a-daemon-api`: Default launcher selection belongs to launcher integration work; this sprint implements the daemon API and thin CLI boundary.
- `sprint-b-12a-daemon-supervision`: B12A installs and supervises the Shpherd daemon service and does not select a launch backend.
- `sprint-b-3c-external-integration-contract`: B3C freezes the hmux process contract but does not own Shpherd launcher default selection; B3B and launcher integration own that policy.
- `sprint-b-4a-local-schema-sqlite`: B4A persists the launcher policy fixed by B3A but does not choose or implement Shpherd launcher defaults.
- `sprint-b-4b-postgres-projection-store`: B4B stores projected launcher policy but does not select or implement Shpherd launcher defaults.
- `sprint-b-9a-sync-projection`: B9A synchronizes an already-selected launcher policy but does not define or implement backend selection.
- `sprint-b-11a-mobile`: B11A packages shared clients for iOS and Android but does not define or implement launch-backend selection.

Beads: anchor `shp-vn1`, plan questions `shp-vn1.1`, dev questions `shp-vn1.2`

Fixtures:
- pass: A team launch with no launcher setting selects the Herdr adapter.
- fail: A team launch with no launcher setting selects tmux or requires the operator to choose a backend.

## ANC-009

Anchor: Shpherd must support tmux launching.

> but will also support tmux launching (default in scmux).

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Retain tmux launch support

Scope: Any Phase B bead that defines team launcher configuration or implements tmux launch support.

Deterministic check to pair with the development gate: A launcher integration test proves an explicitly selected tmux backend can launch, observe, focus, and stop a team.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-3c-external-integration-contract`: B3C freezes ATM, hmux, and sc-cron contracts and does not define or implement the tmux launcher adapter.
- `sprint-b-3a-schema-projection-contract`: B3A preserves a typed tmux selection through storage projection but does not implement or exercise actual tmux launching; B8 and B9B own that lifecycle.
- `sprint-b-7-herdr-launcher`: B7 implements only the Herdr/hmux adapter; explicit tmux launch support is owned by B8.
- `sprint-b-9a-sync-projection`: B9A synchronizes tmux configuration values but does not define team launcher configuration or implement tmux launching.
- `sprint-b-10-dashboard`: B10 is a read-only catalog/dashboard integration and neither defines launcher configuration nor implements tmux launching.
- `sprint-b-4a-local-schema-sqlite`: B4A persists schema and operation evidence but does not implement or exercise the tmux launcher; B8 and B9B own that lifecycle.

Beads: anchor `shp-tar`, plan questions `shp-tar.1`, dev questions `shp-tar.2`

Fixtures:
- pass: A team configured for tmux can start, observe, focus, and stop through the tmux adapter.
- fail: Shpherd provides no selectable tmux launcher or exposes a tmux option that cannot complete the retained lifecycle.

## ANC-010

Anchor: Shpherd's initial database port must establish scmux schema parity before adding Herdr-specific fields.

> We may need to upgrade the scmux database schema i.e. add additional fields for herdr launching, but starting w/ parity is the goal.

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Establish parity before Herdr fields

Scope: The database parity sprint and any later sprint adding Herdr-specific schema fields.

Deterministic check to pair with the development gate: The schema-parity commit and tests precede any migration that adds Herdr-specific columns or tables.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-10-dashboard`: B10 ports the client read experience and does not change the initial database schema or add Herdr-specific fields.
- `sprint-b-12-scheduling`: B12 integrates scheduled operations through sc-cron and does not port the initial database schema or add Herdr-specific fields.
- `sprint-b-2-integrate-workspace`: B2 adds no database schema objects or Herdr-specific fields; initial schema parity and later field changes belong to database sprints.
- `sprint-b-1-generate-baseline`: B1 generates and tests the runtime template baseline; schema parity and later Herdr-specific fields belong to database migration sprints.
- `sprint-b-3c-external-integration-contract`: B3C changes no database schema and owns neither the initial scmux parity port nor later Herdr-specific schema fields.
- `sprint-b-4b-postgres-projection-store`: B4B changes only the new PostgreSQL projection schema; it neither ports the initial scmux SQLite schema nor adds Herdr-specific local fields.
- `sprint-b-6-observation`: B6 implements read-side observation services and creates or migrates no database schema fields.
- `sprint-b-6a-atm-projection`: B6A maps ATM data through an adapter and adds no Herdr-specific fields to the Shpherd database schema.
- `sprint-b-7-herdr-launcher`: B7 implements a Herdr process adapter and adds no database schema field; schema parity ordering belongs to the database migration sprints.
- `sprint-b-9b-launch-leases`: B9B adds no Herdr-specific database schema fields and does not own initial schema parity.
- `sprint-b-9c-expand-roster`: B9C adds no Herdr-specific database schema field and does not own initial schema parity.
- `sprint-b-11-editor-actions`: B11 ports editor and command behavior after storage integration; B3 and B4A own schema parity before extensions.
- `sprint-b-5-definition-service`: B5 consumes the completed schema through DefinitionStore and adds no Herdr-specific database field or initial parity migration.
- `sprint-b-10a-daemon-api`: B10A consumes completed store configuration through APIs and adds no Herdr-specific database field or initial parity migration.
- `sprint-b-12a-daemon-supervision`: B12A supervises the completed daemon after storage integration and owns neither initial scmux schema parity nor Herdr-specific schema fields.

Beads: anchor `shp-4st`, plan questions `shp-4st.1`, dev questions `shp-4st.2`

Fixtures:
- pass: The SQLite parity commit and tests land before a later migration introduces Herdr-specific fields.
- fail: Herdr-specific columns or tables are introduced in the initial schema-parity commit.

## ANC-011

Anchor: Phase B must treat ATM as the source of truth for each running team instance.

> yes, the source of truth of teams is atm (where the actual team lives).

Said by randlee, Phase B architecture clarification in Codex, 2026-11-03. Status: locked. Version 3.

Summary: Use ATM as actual-state authority

Scope: Phase B beads that poll ATM or define team observation, roster reconciliation, and status reporting.

Deterministic check to pair with the development gate: ATM observation tests prove Shpherd reads the running team instance from ATM rather than treating the stored definition as actual state.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-2-integrate-workspace`: B2 freezes shared identity and registration primitives but does not poll ATM or define team observation, roster reconciliation, or status reporting.
- `sprint-b-5-definition-service`: B5 persists desired team definitions but does not observe running team instances, reconcile runtime rosters, or report ATM-derived runtime status.

Beads: anchor `shp-81l`, plan questions `shp-81l.1`, dev questions `shp-81l.2`

Fixtures:
- pass: ATM is the source of truth for the running team instance observed by Shpherd.
- fail: Shpherd treats its stored team definition as the actual running team state without consulting ATM.

## ANC-012

Anchor: Phase B PostgreSQL must provide a fleet-wide view of teams across all computers.

> The postgresdb is simply a view of all teams on all computers.

Said by randlee, Phase B architecture clarification in Codex, 2026-11-03. Status: locked. Version 5.

Summary: Keep PostgreSQL as fleet read model

Scope: Phase B beads that define PostgreSQL schema, host synchronization, fleet views, or launch coordination.

Deterministic check to pair with the development gate: PostgreSQL schema and boundary tests expose a fleet-wide team view and no launch-lease or launch-authority operation.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-6a-atm-projection`: B6A implements the ATM adapter boundary and explicitly defers fleet projection; it does not implement the PostgreSQL fleet-wide view.
- `sprint-b-2-integrate-workspace`: B2 defines shared primitives but no PostgreSQL schema, host synchronization, fleet view, or launch-coordination behavior.
- `sprint-b-3c-external-integration-contract`: B3C defines external ATM, hmux, and sc-cron contracts and no PostgreSQL schema, synchronization, fleet-view, or PostgreSQL launch-coordination behavior.
- `sprint-b-4c-static-adaptor`: B4C implements the static store adaptor and carries no PostgreSQL team-view behavior or fleet projection.
- `sprint-b-6-observation`: B6 implements host-local definition and observation queries and defines no PostgreSQL schema, synchronization, fleet view, or launch coordination.
- `sprint-b-5-definition-service`: B5 owns host-local definition behavior and no PostgreSQL schema, host synchronization, fleet view, or cross-host launch coordination.
- `sprint-b-8-tmux-launcher`: B8 implements the host-local tmux compatibility adapter and no PostgreSQL fleet projection or cross-host fleet view.

Beads: anchor `shp-a0j`, plan questions `shp-a0j.1`, dev questions `shp-a0j.2`

Fixtures:
- pass: PostgreSQL displays teams from rand-m4 and rand-m5 together in one fleet view.
- fail: PostgreSQL grants a global team launch lease and rejects a second computer running the same named team.

## ANC-013

Anchor: Phase B must permit identical team and agent names to run concurrently on different hosts.

> I would expect teams could move/be duplicated on multiple hosts. There is no problem running the same set of named agents on 2 computers and working on parallel non-intersecting work.

Said by randlee, Phase B architecture clarification in Codex, 2026-11-03. Status: locked. Version 3.

Summary: Permit host-qualified duplicate teams

Scope: Phase B beads that define team identity, host enrollment, PostgreSQL projection, or launcher eligibility.

Deterministic check to pair with the development gate: A multi-host fixture runs and displays identical team and agent names concurrently under distinct hosts.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-6a-atm-projection`: B6A implements the ATM adapter boundary and explicitly defers fleet projection; it does not implement concurrent multi-host team identity or display.
- `sprint-b-4a-local-schema-sqlite`: B4A implements a host-local SQLite store and does not implement fleet projection or concurrent same-name instances across hosts; B4B and the adaptor own the cross-host view.
- `sprint-b-6-observation`: B6 consumes already-frozen Team and member identities for read-only host-local observation; it does not define team identity, host enrollment, PostgreSQL projection, or launcher eligibility.

Beads: anchor `shp-m4p`, plan questions `shp-m4p.1`, dev questions `shp-m4p.2`

Fixtures:
- pass: rand-m4 and rand-m5 concurrently run atm-dev with identically named agents.
- fail: A global team-name uniqueness constraint prevents atm-dev from running on a second host.

## ANC-014

Anchor: Phase B must allow an operator connected over SSH to start a Herdr or tmux session with active agents.

> it allows anyone to start a herdr/tmux session with active agents over ssh.

Said by randlee, Phase B architecture clarification in Codex, 2026-11-03. Status: locked. Version 3.

Summary: Launch persisted teams over SSH

Scope: Phase B beads that implement the shpherd CLI, persisted definitions, or Herdr and tmux launch adapters.

Deterministic check to pair with the development gate: A noninteractive SSH-session integration test starts active agents through Herdr by default and tmux when selected.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-2-integrate-workspace`: B2 defines launcher-policy primitives but does not implement the shpherd CLI, persisted definitions, or Herdr/tmux launch adapters; SSH launch is closed by later launch/API sprints.
- `sprint-b-3a-schema-projection-contract`: B3A defines storage and projection contracts for launcher selection but does not implement SSH access or session start; those behaviors belong to later launch and authenticated API work.
- `sprint-b-3c-external-integration-contract`: B3C freezes ATM, hmux, and sc-cron external contracts but does not implement the shpherd CLI, persisted definitions, or either launch adapter; SSH launch is closed by later launch/API sprints.
- `sprint-b-3b-service-launch-api-contract`: B3B freezes CLI, daemon, and launcher contracts with doubles; B9B exclusively closes the real SSH-to-active-agent integration.
- `sprint-b-4a-local-schema-sqlite`: B4A implements local schema and SQLite storage only; B9B exclusively closes the real SSH-to-active-agent integration.
- `sprint-b-7-herdr-launcher`: B7 implements the guarded Herdr launcher adapter with doubles; B9B exclusively closes the real SSH-to-active-agent integration.
- `sprint-b-8-tmux-launcher`: B8 implements the guarded tmux compatibility adapter with doubles; B9B exclusively closes the real SSH-to-active-agent integration.
- `sprint-b-10a-daemon-api`: B10A proves SSH CLI-to-daemon wire mapping against stateful doubles; B9B exclusively composes real services, launch adapters, and active-agent start.

Beads: anchor `shp-izw`, plan questions `shp-izw.1`, dev questions `shp-izw.2`

Fixtures:
- pass: An operator connected over SSH starts active agents in Herdr by default and in tmux when selected.
- fail: Shpherd requires a local graphical client and cannot start active agents from an SSH session.

## ANC-015

Anchor: Phase B must use sc-cron as a heartbeat that polls ATM agent state.

> for mvp, cron would be heartbead for polling atm agent state.

Said by randlee, Phase B architecture clarification in Codex, 2026-11-03. Status: locked. Version 3.

Summary: Limit MVP cron to ATM heartbeat

Scope: Phase B beads that integrate sc-cron, poll ATM agent state, publish status, or define scheduled operations.

Deterministic check to pair with the development gate: The sc-cron registry and callback tests expose the ATM-state polling heartbeat and no scheduled launch or instruction job.

Excluded from (not judged; the cell passes as `excluded`):
- `sprint-b-9b-launch-leases`: B9B composes host-local launch safety and does not plan sc-cron wiring or ATM agent-state polling.
- `sprint-b-6a-atm-projection`: B6A supplies the ATM adapter consumed by the later B12 heartbeat but does not implement sc-cron heartbeat wiring.
- `sprint-b-3b-service-launch-api-contract`: B3B freezes service and launch API contracts but does not plan sc-cron wiring or ATM agent-state polling.
- `sprint-b-9c-expand-roster`: B9C implements an operator-triggered roster expansion workflow and does not integrate sc-cron, poll ATM on a heartbeat, publish scheduled status, or define a scheduled operation; its post-MVP sentence only excludes scheduling from this sprint.
- `sprint-b-11-editor-actions`: B11 implements editor and launch actions and does not implement the sc-cron ATM-state polling heartbeat.
- `sprint-b-10-dashboard`: B10 renders authenticated status snapshots and events but owns no sc-cron integration, ATM polling, status publication, timer, or scheduled operation.
- `sprint-b-4b-postgres-projection-store`: B4B implements the PostgreSQL projection store only; B12 owns sc-cron heartbeat polling of ATM agent state.
- `sprint-b-10a-daemon-api`: B10A maps injected readiness doubles to the health wire and owns no sc-cron registration or ATM polling; B12 owns the real heartbeat.

Beads: anchor `shp-atm`, plan questions `shp-atm.1`, dev questions `shp-atm.2`

Fixtures:
- pass: sc-cron runs a heartbeat that polls ATM agent state for Shpherd status.
- fail: An sc-cron job launches atm-dev at 2 a.m. and instructs atm-lead to begin a sprint during Phase B.
