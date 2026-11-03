# ADR-SHP-007 — hmux capability-negotiated lifecycle

- **Status:** Approved
- **Owner:** B3C
- **Decision:** Shpherd uses the typed hmux capability and full lifecycle client; unsupported major versions or missing requested capabilities fail before mutation.
- **Alternatives rejected:** shell-text scraping, recreating agent command construction, or silent tmux fallback.
- **Consequences:** hmux upgrades require fixture compatibility; fallback is explicit launcher selection.
- **Evidence:** stateful lifecycle double covering dry-run/start/stop/observe/focus/relaunch/repair/spawn/nudge.
