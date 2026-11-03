# Phase B approved anchor fixtures

Approved by the user on 2026-11-03. The canonical fixture records live in
`anchors.json`; this table is the human-readable review copy.

These pass/fail examples calibrate the plan and development gates. They do not add requirements; each pair demonstrates how the corresponding approved anchor should be judged.

| Anchor | Pass fixture | Fail fixture |
| --- | --- | --- |
| ANC-001 | B1 generates Shpherd from the sc-runtime `v0.1.1` tag in release mode and resolves published 0.1.1 runtime crates. | B1 generates Shpherd from an unreleased sc-runtime checkout or any template version other than 0.1.1. |
| ANC-002 | Every scmux schema, behavior, and UI migration bead depends transitively on the completed B1 template installation and test gates. | A scmux schema, behavior, or UI migration starts before B1 template installation and testing pass. |
| ANC-003 | After the sc-runtime `v0.2.0` tag appears, the 0.2.0 interrupt is the next newly started Shpherd bead. | After the sc-runtime `v0.2.0` tag appears, a different ready feature bead starts before the upgrade interrupt. |
| ANC-004 | The 0.2.0 upgrade applies every managed dependency-version change shown by an equivalent fresh v0.2.0 generation. | The upgrade leaves a managed dependency at its 0.1.1 version despite the fresh v0.2.0 generation changing it. |
| ANC-005 | The consumer repository contains all v0.2.0-managed `.sc-lint` assets, requires sc-lint 0.8.4 or newer, and passes setup/lint compatibility checks. | The repository reports an sc-lint binary version but omits managed `.sc-lint` assets or permits a version older than 0.8.4. |
| ANC-006 | B3 ports and fingerprints the pinned scmux SQLite schema, with every difference explicitly excluded before target extensions begin. | B3 replaces the scmux schema with a newly designed Shpherd schema without first establishing parity. |
| ANC-007 | UI migration beads map each retained scmux dashboard/editor behavior to a Shpherd implementation and parity test. | The Shpherd UI is rebuilt without identifying or testing the retained scmux UI behavior it replaces. |
| ANC-008 | A team launch with no launcher setting selects the Herdr adapter. | A team launch with no launcher setting selects tmux or requires the operator to choose a backend. |
| ANC-009 | A team configured for tmux can start, observe, focus, and stop through the tmux adapter. | Shpherd provides no selectable tmux launcher or exposes a tmux option that cannot complete the retained lifecycle. |
| ANC-010 | The SQLite parity commit and tests land before a later migration introduces Herdr-specific fields. | Herdr-specific columns or tables are introduced in the initial schema-parity commit. |
