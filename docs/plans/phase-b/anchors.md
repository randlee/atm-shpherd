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

## ANC-001

Anchor: Shpherd's initial runtime workspace must be generated from sc-runtime version 0.1.1.

> install the sc-runtime templates at 0.1.1 (latest release)

Said by randlee, Phase B sprint planning in Codex, 2026-11-02. Status: locked. Version 2.

Summary: Generate from sc-runtime 0.1.1

Scope: The first Phase B bead that installs or generates the Shpherd runtime workspace.

Deterministic check to pair with the development gate: Cargo metadata and the generation record identify sc-runtime 0.1.1 for the initial Shpherd scaffold.

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

Beads: anchor `shp-4st`, plan questions `shp-4st.1`, dev questions `shp-4st.2`

Fixtures:
- pass: The SQLite parity commit and tests land before a later migration introduces Herdr-specific fields.
- fail: Herdr-specific columns or tables are introduced in the initial schema-parity commit.
