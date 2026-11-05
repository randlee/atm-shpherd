---
id: b-10a-daemon-api
bead: shp-phase-b.20
status: planned
closure_type: boundary
target_boundary: daemon-api
vertical_rationale: "The generated shpherd CLI is the thin first-party consumer used to prove the daemon wire boundary; it adds no policy or in-process service path, so API and CLI mapping close atomically with one implementer and one consumer."
requirements: [REQ-API, REQ-DEFINITION, REQ-LAUNCH]
adrs: [ADR-SHP-003, ADR-SHP-004, ADR-SHP-011, ADR-SHP-013]
owned_paths:
  - crates/shpherd-daemon/src/api/**
  - crates/shpherd-daemon/src/auth/**
  - crates/shpherd-daemon/src/events/**
  - crates/shpherd-daemon/tests/api/**
  - crates/shpherd-cli/src/**
  - crates/shpherd-cli/tests/**
relations:
  must_follow:
    - sprint: b-3b-service-launch-api-contract
      artifact: daemon-command-event-error-contract-and-service-doubles
  parallel_safe: []
recommended_agent: rust-api-developer
recommended_model: deep-reasoning
---

# B10A — Implement the authenticated daemon API

## Goal

Close the authenticated daemon/CLI wire boundary against B3B doubles without depending on unfinished service implementations.

## Required work and deliverables

- Implement the frozen `CommandEnvelope`/`ResponseEnvelope`, complete query surface, named commands, and ordered event/reconnect transport against B3B stateful service/host doubles. Runtime observations in daemon queries and responses come from ATM; stored Shpherd definitions remain desired state and never replace ATM runtime truth. The query surface exposes B3A's combined PostgreSQL fleet view of teams across all computers without granting PostgreSQL launch authority.
- Implement enrollment authentication, endpoint/origin/TLS, authorization, version negotiation, tagged completed/accepted/replayed/conflict/rejected outcomes, operation completion events, daemon/stream-bound resume tokens, cursor recovery/resync, stable error mapping, and redacted telemetry.
- Keep credential parsing and transport/session verification in daemon auth, convert only verified identity through the B2-owned composition `AuthorizationIssuer`, and inject the resulting borrowed, non-serializable `AuthenticatedPrincipal`; ignore/reject every caller/role/scope claim in request JSON. The daemon depends on `shpherd-auth`, while service/auth types never depend on daemon.
- Wire the thin `shpherd` CLI to this API; no CLI store or in-process service access. The noninteractive CLI works over SSH and starts active agents through Herdr by default or through tmux when explicitly selected, using this daemon API.
- Preserve both launcher selections on the wire: omitted selection resolves to Herdr in the service policy, while explicit tmux commands remain representable and route to the tmux adapter without fallback. Launch identity and idempotency are host-scoped, so the same team and agent names can run concurrently on different enrolled hosts without a global name lock.
- Compose B3B's `OperationJournal` double for boundary tests: persist accepted work before execution, commit terminal outcome plus pending event before publication, republish unmarked events after restart, and return the original outcome on request/idempotency replay. The real SQLite journal closes through B4A before real client composition.
- Freeze versioned resource limits and typed overload errors: request/body and page-size caps, per-principal and global concurrent-command limits, bounded accepted-operation queue, per-handler deadline/cancellation, connection caps, and bounded event retention. A slow consumer is disconnected with its last resumable cursor or `ResyncRequired`; no connection may grow an unbounded buffer.
- Before listener bind, parse and validate one effective configuration covering endpoint, TLS/origin/auth policy, credential-store references, every resource/queue/connection limit, SQLite/PostgreSQL URLs and B3A pool/timeout settings, migration compatibility, ATM-heartbeat/retry settings, and allowed filesystem roots. Invalid, missing, mutually inconsistent, or unavailable required configuration exits with a typed startup error and serves no traffic.
- Freeze `HealthState::{LiveNotReady, Ready, Degraded { reasons }, Draining}`. Liveness means the process/event loop responds; readiness remains false until configuration, credentials, required stores/migrations, journal recovery, and ATM-heartbeat registration succeed. The registered sc-cron callback is a heartbeat that periodically polls ATM agent state and feeds readiness/health; scheduled team launches and agent instructions remain outside Phase B. Degraded names typed optional-dependency reasons without claiming readiness for required dependency failure; shutdown publishes `Draining` and clears readiness before rejecting new intake.
- Emit allowlisted nonthrowing traces/metrics correlated by request/correlation/operation and, where safe, heartbeat-run/host/team IDs. Bound label cardinality. Counters/gauges/histograms cover admission rejection, queue depth, active commands/connections, handler latency/timeouts, event-retention/slow-consumer pressure, store pool saturation/acquisition latency, heartbeat lag/failures, host-local launch conflicts, child-process cleanup, and shutdown stages. Never emit credentials, prompt/mailbox/terminal content, raw paths, or raw error objects.

## Relationships

`must_follow` only B3B's daemon command/event/error contract and service doubles. Unique pair relations recorded on the sibling layer docs make it parallel-safe with service, external-adapter, and launcher work.

## This sprint does not close

No real B5/B6 service composition, feature requirement, browser/Tauri parity, or launcher UI action; B10/B11 own those integrations.

## Acceptance and validation

- `boundary:daemon-api` tests against B3B doubles cover every definition/roster/split-launch/query variant, request/correlation IDs, tagged completed/accepted/replayed/conflict/rejected responses, original replay outcome, exactly-one terminal outcome, typed errors, CLI exit mapping, version mismatch, daemon restart/stream mismatch reconnect-resync, stale cursor, absent token/genesis zero/first event one/MAX-overflow cursor behavior, ordering, host enrollment/project checkout validation, origin/TLS, forged-claim/escalation/scope mismatch, private-constructor compile failures, credential separation, and redaction.
- Saturation fixtures cover oversized bodies/pages, fair per-principal admission, full operation queues, handler timeout and cancellation, connection limits, slow event consumers, bounded retention, journal restart replay, and exactly-once terminal publication without starving unrelated principals.
- Startup/health fixtures prove invalid configuration never binds, required migration/store failure stays not-ready, optional dependency failure is typed degraded state, recovery transitions to ready, and shutdown clears readiness before stopping intake. Observability failure never changes command outcomes; saturation fixtures assert the matching bounded-cardinality metric/trace signals.
- Unauthorized requests fail closed; CLI/API share the frozen command semantics; daemon/CLI tests, lint/build, and boundary validation pass without linking B5 or B6 implementations.

Every deliverable is production-ready for the daemon API boundary.
