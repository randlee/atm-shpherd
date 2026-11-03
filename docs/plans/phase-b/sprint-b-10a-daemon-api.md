---
id: b-10a-daemon-api
bead: shp-phase-b.20
status: planned
closure_type: integration
target_boundary: daemon-api
recommended_agent: rust-api-developer
recommended_model: deep-reasoning
---

# B10A — Implement the authenticated daemon API

requirements: REQ-API, REQ-DEFINITION; PRD §§4.2-4.3.
adrs: ADR-SHP-003, ADR-SHP-004.

## Deliverables and owned paths

- Implement versioned authenticated snapshots, named commands, and ordered event/reconnect transport over the same services used by workers.
- Define enrollment, endpoint/origin/TLS, authorization, version negotiation, cursor recovery, stable error mapping, and redacted telemetry.
- Wire the thin `shpherd` CLI to this API; no CLI store or in-process service access.
- Owned paths: daemon API/routes/auth/events, CLI transport/formatting, wire contract tests.

## Relationships

`must_follow` B5 definition command contracts, B6 observation projections, and B3A auth/error contracts. Parallel-safe with B9A.

## This sprint does not close

No browser/Tauri feature parity or launcher UI action; B10/B11 own clients.

## Acceptance and validation

- Contract tests cover authenticated read/commands, typed errors, CLI exit mapping, version mismatch, reconnect/resume, stale cursor, event ordering, origin/TLS, and redaction.
- Unauthorized requests fail closed; CLI/API share command semantics; daemon/CLI tests, lint/build, and boundary validation pass.

Every deliverable is production-ready for the API integration boundary.
