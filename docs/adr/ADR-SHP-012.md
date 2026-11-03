# ADR-SHP-012 — PostgreSQL lease authority

- **Status:** Approved
- **Owner:** B3A
- **Decision:** PostgreSQL is the durable multi-host launch-lease authority. Acquire/renew/release/transfer use transactional compare-and-swap, database time, holder daemon instance, expiry, and monotonically increasing fencing token. SQLite stores local evidence only.
- **Alternatives rejected:** host clock authority, SQLite-granted multi-host lease, advisory locks without durable rows, or token reuse.
- **Consequences:** launch requires PostgreSQL authority availability; expired ownership transfers increment fencing.
- **Evidence:** B4B CAS contract tests and B9B crash/partition/stale-clock/transfer simulations.
