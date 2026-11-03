---
id: b-9c-expand-roster
bead: shp-phase-b.18
status: planned
closure_type: integration
target_boundary: roster-expansion
requirements: [REQ-ATM]
adrs: [ADR-SHP-004, ADR-SHP-005, ADR-SHP-006, ADR-SHP-007]
owned_paths:
  - crates/shpherd-service/src/roster_expansion/**
  - crates/shpherd-service/tests/roster_expansion/**
  - tests/integration/roster-expansion/**
relations:
  must_follow:
    - sprint: b-6a-atm-projection
      artifact: versioned-atm-adapter
    - sprint: b-7-herdr-launcher
      artifact: guarded-dynamic-spawn-adapter
    - sprint: b-9a-sync-projection
      artifact: synchronized-roster-projection
    - sprint: b-9b-launch-leases
      artifact: verified-launch-lease-guard
  parallel_safe: [b-12-scheduling]
recommended_agent: rust-integration-developer
recommended_model: deep-reasoning
---

# B9C — Add and launch roster members on demand

## Deliverables

- Implement durable idempotent expansion state across ATM mutation, re-import, synchronization, lease guard, hmux spawn, observation, retry, update, and removal reconciliation.

## Relationships

`must_follow` B6A, B7, B9A, and B9B because it consumes their contracts and real implementations.

## This sprint does not close

No general UI editor or scheduled launch; B11/B12 own those surfaces.

## Acceptance and validation

- Authorized `shpherd team add-agent` creates one member and one pane; every crash boundary converges without duplication and preserves existing sessions.
- `registered_not_running`, update/remove, audit/redaction, and retry behavior pass end-to-end.

Every deliverable is production-ready for the roster-expansion feature.
