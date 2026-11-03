# ADR-SHP-009 — Injectable sc-cron handler

- **Status:** Approved
- **Owner:** B3C
- **Decision:** Shpherd registers an injectable `Send + Sync` handler with cancellation through sc-cron's public API; sc-cron owns parsing/storage while Shpherd owns job policy.
- **Alternatives rejected:** bare function pointer, detached tasks, duplicate parser, or sc-cron importing Shpherd rows.
- **Consequences:** handler cancellation and restart behavior are testable; schedule reads use typed get/list pagination.
- **Evidence:** handler cancellation/concurrency doubles and CRUD/parser/callback fixtures.
