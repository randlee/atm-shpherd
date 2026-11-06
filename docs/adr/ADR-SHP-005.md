# ADR-SHP-005 — Closed guarded launcher lifecycle

- **Status:** Approved
- **Owner:** B3B
- **Decision:** launcher selection is the closed Herdr/tmux enum. Separate read and mutation traits make dry-run/observe/focus unguarded. Start/stop/relaunch/repair/spawn/nudge/member-stop/member-reconcile require an unforgeable host-local operation guard plus idempotency key so retries cannot duplicate side effects on one host. Spawn also requires typed current ATM roster-registration evidence.
- **Alternatives rejected:** public spawn helpers, dynamic launcher plugins, adapter-owned concurrency policy, or a PostgreSQL/global launch lease.
- **Consequences:** new launchers require an ADR and exhaustive dispatch update.
- **Evidence:** compile-fail mutation-without-local-guard tests, host-local duplicate-request tests, cross-host same-name launch tests, and the shared Herdr/tmux lifecycle/registration-evidence simulator suite.
