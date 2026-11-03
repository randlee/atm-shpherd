# ADR-SHP-007 — hmux capability-negotiated lifecycle

- **Status:** Approved
- **Owner:** B3C
- **Decision:** Shpherd uses split typed hmux read/mutation clients; read requests carry no fencing, mutations carry fencing/idempotency, spawn carries typed roster-registration evidence, and member stop/reconcile uses stable runtime identity. Unsupported versions/capabilities or stale evidence fail before mutation.
- **Alternatives rejected:** shell-text scraping, recreating agent command construction, or silent tmux fallback.
- **Consequences:** hmux upgrades require fixture compatibility; fallback is explicit launcher selection.
- **Evidence:** stateful lifecycle double covering dry-run/start/stop/observe/focus/relaunch/repair/spawn/nudge/member-stop/member-reconcile, crash-after-registration, stale/repeated evidence, and unrelated-session preservation.
