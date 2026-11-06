# ADR-SHP-009 — Injectable sc-cron handler

- **Status:** Approved
- **Owner:** B3C
- **Decision:** Shpherd registers one injectable `Send + Sync` handler with cancellation through sc-cron's public API. Registration returns a typed heartbeat identity/time/expression fingerprint, and execution publishes typed never-succeeded/fresh/stale/failed freshness state. In Phase B that handler is only a heartbeat that polls authoritative ATM agent/team state and refreshes local observations and the host-qualified fleet projection. sc-cron owns heartbeat parsing/storage; independent Shpherd components own the poll and projection behavior. B12 maps registration/freshness semantics into B3B's independent readiness-dependency input without either contract importing the other, and B12A composes real daemon readiness.
- **Alternatives rejected:** bare function pointer, detached tasks, duplicate parser, or sc-cron importing Shpherd rows.
- **Consequences:** handler cancellation, registration, freshness, and restart behavior are testable independently of daemon-wide readiness. Scheduled launches, roster changes, ATM messages, overnight instructions, and a general schedule editor are outside Phase B.
- **Evidence:** typed registration/freshness, heartbeat cancellation/concurrency doubles, readiness-input mapping, and parser/callback fixtures proving every successful tick polls ATM before refreshing the fleet view and never launches a team.
