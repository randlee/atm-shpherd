---
id: b-10a-daemon-api
bead: shp-phase-b.20
status: planned
closure_type: boundary
target_boundary: daemon-api
vertical_rationale: "The generated shpherd CLI is the thin first-party consumer used to prove the daemon wire boundary; it adds no policy or in-process service path, so API and CLI mapping close atomically with one implementer and one consumer."
requirements: []
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

- Implement the frozen `CommandEnvelope`/`ResponseEnvelope`, complete query surface, named commands, and ordered event/reconnect transport against B3B stateful service/host doubles.
- Implement enrollment authentication, endpoint/origin/TLS, authorization, version negotiation, tagged completed/accepted/replayed/conflict/rejected outcomes, operation completion events, daemon/stream-bound resume tokens, cursor recovery/resync, stable error mapping, and redacted telemetry.
- Keep credential parsing and transport/session verification in daemon auth, convert only verified identity through the B2-owned composition `AuthorizationIssuer`, and inject the resulting borrowed, non-serializable `AuthenticatedPrincipal`; ignore/reject every caller/role/scope claim in request JSON. The daemon depends on `shpherd-auth`, while service/auth types never depend on daemon.
- Wire the thin `shpherd` CLI to this API; no CLI store or in-process service access.

## Relationships

`must_follow` only B3B's daemon command/event/error contract and service doubles. Unique pair relations recorded on the sibling layer docs make it parallel-safe with service, external-adapter, and launcher work.

## This sprint does not close

No real B5/B6 service composition, feature requirement, browser/Tauri parity, or launcher UI action; B10/B11 own those integrations.

## Acceptance and validation

- `boundary:daemon-api` tests against B3B doubles cover every definition/roster/split-launch/query variant, request/correlation IDs, tagged completed/accepted/replayed/conflict/rejected responses, original replay outcome, exactly-one terminal outcome, typed errors, CLI exit mapping, version mismatch, daemon restart/stream mismatch reconnect-resync, stale cursor, absent token/genesis zero/first event one/MAX-overflow cursor behavior, ordering, host enrollment/project checkout validation, origin/TLS, forged-claim/escalation/scope mismatch, private-constructor compile failures, credential separation, and redaction.
- Unauthorized requests fail closed; CLI/API share the frozen command semantics; daemon/CLI tests, lint/build, and boundary validation pass without linking B5 or B6 implementations.

Every deliverable is production-ready for the daemon API boundary.
