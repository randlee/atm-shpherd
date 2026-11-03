# ADR-SHP-012 — PostgreSQL lease authority

- **Status:** Approved
- **Owner:** B3A
- **Decision:** PostgreSQL is the durable multi-host launch-lease authority. Tagged acquire/renew/release/transfer commands name team/variant, expected holder/fencing, daemon, duration, and idempotency key. Receipts expose replay/operation, database now/expiry, prior/new fencing, holder, and state; SQLite stores local evidence only.
- **Alternatives rejected:** host clock authority, SQLite-granted multi-host lease, advisory locks without durable rows, or token reuse.
- **Consequences:** launch requires PostgreSQL authority availability; expired ownership transfers increment fencing.
- **Evidence:** B4B concurrent operation/error/replay tests and B9B unknown-outcome/crash/partition/stale-clock/transfer simulations.
