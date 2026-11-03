---
id: b-10a-daemon-api
bead: shp-phase-b.20
status: planned
closure_type: integration
target_boundary: daemon-api
requirements: [REQ-API, REQ-DEFINITION]
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
  parallel_safe: [b-5-definition-service, b-6-observation, b-6a-atm-projection, b-7-herdr-launcher, b-8-tmux-launcher]
recommended_agent: rust-api-developer
recommended_model: deep-reasoning
---

# B10A — Implement the authenticated daemon API

## Deliverables

- Implement versioned authenticated snapshots, named commands, and ordered event/reconnect transport over the same services used by workers.
- Define enrollment, endpoint/origin/TLS, authorization, version negotiation, cursor recovery, stable error mapping, and redacted telemetry.
- Wire the thin `shpherd` CLI to this API; no CLI store or in-process service access.

## Relationships

`must_follow` only B3B's daemon command/event/error contract and service doubles. It is parallel-safe with the service, external adapter, launcher, and storage tracks named in frontmatter.

## This sprint does not close

No browser/Tauri feature parity or launcher UI action; B10/B11 own clients.

## Acceptance and validation

- Contract tests first pass against B3B service doubles; integration tests then bind the real B5/B6 services before this sprint closes and cover authenticated definition/observation commands, typed errors, CLI exit mapping, version mismatch, reconnect/resume, stale cursor, ordering, origin/TLS, and redaction.
- Unauthorized requests fail closed; CLI/API share command semantics; daemon/CLI tests, lint/build, and boundary validation pass.

Every deliverable is production-ready for the API integration boundary.
