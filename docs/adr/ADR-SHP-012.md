# ADR-SHP-012 — PostgreSQL fleet read model and host-local launch safety

- **Status:** Approved
- **Owner:** B3A
- **Decision:** PostgreSQL is a host-qualified, fleet-wide read model of Shpherd definitions and ATM-observed team/agent state across all enrolled computers. It grants no launch authority, ownership, lease, fencing token, or global name uniqueness. Each host prevents duplicate local side effects with a host-local single-flight guard plus durable idempotency/operation evidence. Identically named teams and agents may run concurrently on different hosts.
- **Alternatives rejected:** PostgreSQL as a distributed launch authority, cross-host ownership transfer, global team-name uniqueness, or an advisory-lock/lease protocol.
- **Consequences:** host launch remains available without PostgreSQL; a fleet view may be stale and reports each observation with source host, revision, and observation time. Operators explicitly create or import a local definition before launching it on another host.
- **Evidence:** B4B host-qualified projection tests, B9A multi-host aggregation/replay tests, and B9B host-local duplicate suppression plus concurrent cross-host same-name launch simulations.
