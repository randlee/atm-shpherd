---
id: b-10-dashboard
bead: shp-phase-b.11
status: planned
closure_type: integration
target_boundary: client-read-experience
recommended_agent: typescript-ui-developer
recommended_model: workhorse
---

# B10 — Port the dashboard read experience

requirements: ANC-007, REQ-UI, REQ-API, REQ-OPERATE.
adrs: ADR-SHP-003, ADR-SHP-008.

## Deliverables and owned paths

- Replace fixtures with authenticated snapshots/events and port grouped/grid/list, hierarchy, search/filter, host/backend/status badges, team detail, and stale/disconnected states into the shared browser/Tauri app.
- Preserve icon/window/tray shell, browser independence, pinned observability adapter, redaction, and failure-noninterference.
- Owned paths: `clients/src/features/catalog/**`, client API/observability adapters, catalog tests and performance fixtures.

## Relationships

`must_follow` B10A API, B6 observation, and B9A partial-host projection. Parallel-safe with launcher/lease service work through disjoint client paths.

## This sprint does not close

No mutations/editor/native mobile capabilities; B11/B11A own them.

## Acceptance and validation

- scmux oracle read workflows pass in browser and desktop. A deterministic 100-team/1,500-member fixture meets: initial interactive ≤2.0 s, search/filter p95 <100 ms, event reflection p95 <250 ms/1,000 events on recorded macOS arm64 reference hardware or equivalent.
- Browser import graph contains no required Tauri API; telemetry faults do not alter actions.

Every deliverable is production-ready for the read-experience integration.
