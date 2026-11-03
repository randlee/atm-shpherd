# ADR-SHP-005 — Closed guarded launcher lifecycle

- **Status:** Approved
- **Owner:** B3B
- **Decision:** launcher selection is the closed Herdr/tmux enum. Separate read and mutation traits make dry-run/observe/focus unguarded and available during lease outage; start/stop/relaunch/repair/spawn/nudge/member-stop/member-reconcile require an unforgeable lease guard plus idempotency key. Spawn also requires typed current roster-registration evidence.
- **Alternatives rejected:** public spawn helpers, dynamic launcher plugins, or adapter-owned lease policy.
- **Consequences:** new launchers require an ADR and exhaustive dispatch update.
- **Evidence:** compile-fail mutation-without-guard tests, read-during-lease-outage tests, and shared Herdr/tmux lifecycle/registration-evidence simulator suite.
