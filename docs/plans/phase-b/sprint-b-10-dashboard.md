---
id: b-10-dashboard
bead: shp-phase-b.11
status: planned
closure_type: integration
target_boundary: client-read-experience
requirements: [ANC-007, REQ-UI-READ]
adrs: [ADR-SHP-003, ADR-SHP-008]
owned_paths:
  - clients/src/features/catalog/**
  - clients/src/platform/api/**
  - clients/src/platform/observability/**
  - clients/tests/catalog/**
  - clients/tests/performance/**
relations:
  must_follow:
    - sprint: b-10a-daemon-api
      artifact: authenticated-snapshot-and-event-client
    - sprint: b-9a-sync-projection
      artifact: partial-host-snapshot-semantics
  parallel_safe: [b-9b-launch-leases, b-9c-expand-roster, b-12-scheduling]
recommended_agent: typescript-ui-developer
recommended_model: workhorse
---

# B10 — Port the dashboard read experience

## Deliverables

- Replace fixtures with authenticated snapshots/events and port grouped/grid/list, hierarchy, search/filter, host/backend/status badges, team detail, and stale/disconnected states into the shared browser/Tauri app.
- Preserve icon/window/tray shell, browser independence, pinned observability adapter, redaction, and failure-noninterference.

## Relationships

`must_follow` B10A's authenticated snapshot/event client and B9A's partial-host snapshot semantics. Parallel-safe with B9B, B9C, and B12 through disjoint client paths.

## This sprint does not close

No mutations/editor/native mobile capabilities; B11/B11A own them.

## Acceptance and validation

- scmux oracle read workflows pass in browser and desktop. A deterministic 100-team/1,500-member fixture meets: initial interactive ≤2.0 s, search/filter p95 <100 ms, event reflection p95 <250 ms/1,000 events on recorded macOS arm64 reference hardware or equivalent.
- Browser import graph contains no required Tauri API; telemetry faults do not alter actions.

Every deliverable is production-ready for the read-experience integration.
