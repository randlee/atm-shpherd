---
id: b-10a-daemon-api
bead: shp-phase-b.20
status: planned
closure_type: boundary
target_boundary: daemon-api
vertical_rationale: "The generated shpherd CLI is the thin first-party consumer used to prove the daemon wire boundary; it adds no policy or in-process service path, so API and CLI mapping close atomically with one implementer and one consumer."
requirements: []
adrs: [ADR-SHP-003, ADR-SHP-004]
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

## Deliverables

- Implement versioned authenticated snapshots, named commands, and ordered event/reconnect transport against the B3B service doubles.
- Define enrollment, endpoint/origin/TLS, authorization, version negotiation, cursor recovery, stable error mapping, and redacted telemetry.
- Wire the thin `shpherd` CLI to this API; no CLI store or in-process service access.

## Relationships

`must_follow` only B3B's daemon command/event/error contract and service doubles. Unique pair relations recorded on the sibling layer docs make it parallel-safe with service, external-adapter, and launcher work.

## This sprint does not close

No real B5/B6 service composition, feature requirement, browser/Tauri parity, or launcher UI action; B10/B11 own those integrations.

## Acceptance and validation

- `boundary:daemon-api` contract tests against B3B doubles cover authenticated definition/observation command mapping, typed errors, CLI exit mapping, version mismatch, reconnect/resume, stale cursor, ordering, origin/TLS, and redaction.
- Unauthorized requests fail closed; CLI/API share the frozen command semantics; daemon/CLI tests, lint/build, and boundary validation pass without linking B5 or B6 implementations.

Every deliverable is production-ready for the daemon API boundary.
