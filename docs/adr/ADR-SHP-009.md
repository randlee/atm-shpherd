# ADR-SHP-009 — Injectable sc-cron handler

- **Status:** Approved
- **Owner:** B3C
- **Decision:** Shpherd registers one injectable `Send + Sync` handler with cancellation through sc-cron's public API. In Phase B that handler is only a heartbeat that polls authoritative ATM agent/team state and refreshes local observations and the host-qualified fleet projection. sc-cron owns heartbeat parsing/storage; independent Shpherd components own the poll and projection behavior.
- **Alternatives rejected:** bare function pointer, detached tasks, duplicate parser, or sc-cron importing Shpherd rows.
- **Consequences:** handler cancellation and restart behavior are testable. Scheduled launches, roster changes, ATM messages, overnight instructions, and a general schedule editor are outside Phase B.
- **Evidence:** heartbeat cancellation/concurrency doubles and parser/callback fixtures proving every successful tick polls ATM before refreshing the fleet view and never launches a team.
