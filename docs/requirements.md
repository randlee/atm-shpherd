# atm-shpherd requirements index

The normative product requirements are in `docs/atm-shpherd-prd.md`. Phase B also carries fifteen immutable user-approved requirements in `docs/plans/phase-b/anchors.json` (`ANC-001` through `ANC-015`). Sprint documents list the applicable anchors and PRD sections directly.

## Phase B requirement groups

| ID | Requirement group | Authority |
|---|---|---|
| REQ-BOOTSTRAP | Generate and prove sc-runtime 0.1.1 before migration; interrupt for 0.2.0 | ANC-001..ANC-005; PRD §§4, 12 |
| REQ-SCHEMA | Port scmux SQLite schema at parity before target extensions | ANC-006, ANC-010; PRD §§6-7 |
| REQ-DEFINITION | Preserve hierarchy and one durable definition writer | PRD §6; scmux behavior oracle |
| REQ-LAUNCH | Herdr/hmux default with explicit tmux compatibility | ANC-008, ANC-009; PRD §§10-11 |
| REQ-ATM | Versioned read-only ATM import and command-only roster mutation | PRD §§9-11; ATM/hmux contract |
| REQ-SYNC | App-owned SQLite/PostgreSQL projection and deterministic reconciliation | PRD §7 |
| REQ-LAUNCH-SAFETY | Host-local eligibility, single-flight guard, durable operation journal, idempotency, and crash convergence; no distributed lease or fencing | PRD §§7, 11 |
| REQ-API | Versioned authenticated daemon API; thin CLI/browser/Tauri clients | PRD §§4.2-4.3 |
| REQ-UI-READ | Port retained scmux catalog/dashboard read behavior | ANC-007; PRD §§2, 4.3, 6 |
| REQ-UI-COMMAND | Port editor and team command behavior to browser/desktop | PRD §§4.3, 6, 10-11 |
| REQ-UI-MOBILE | Deliver the shared command surface in native iOS/Android shells | PRD §4.3 |
| REQ-SCHEDULE | App-owned sc-cron registration and recurring guarded operations | PRD §8 |
| REQ-OPERATE-SUPERVISION | Supervision, observability, reboot, and upgrade safety | PRD §§4.3, 5, 12 |
| REQ-RELEASE-EVIDENCE | Assemble immutable evidence for every already-owned feature and platform gate | PRD §§12-13 |

These IDs are traceability labels, not replacements for the underlying acceptance text.
