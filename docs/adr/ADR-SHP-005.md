# ADR-SHP-005 — Closed guarded launcher lifecycle

- **Status:** Approved
- **Owner:** B3B
- **Decision:** launcher selection is the closed Herdr/tmux enum. Every mutating lifecycle operation requires an unforgeable lease guard plus idempotency key; read-only observe/focus/dry-run operations do not.
- **Alternatives rejected:** public spawn helpers, dynamic launcher plugins, or adapter-owned lease policy.
- **Consequences:** new launchers require an ADR and exhaustive dispatch update.
- **Evidence:** compile-fail guard tests and shared Herdr/tmux lifecycle simulator suite.
