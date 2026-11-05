---
id: b-10-dashboard
bead: shp-phase-b.11
status: planned
closure_type: integration
target_boundary: client-read-experience
requirements: [ANC-007, REQ-API, REQ-UI-READ]
adrs: [ADR-SHP-003, ADR-SHP-008, ADR-SHP-011]
owned_paths:
  - clients/src/features/catalog/**
  - clients/src/platform/api/**
  - clients/src/platform/observability/**
  - clients/tests/catalog/**
  - clients/tests/performance/**
  - tests/integration/api-read/**
relations:
  must_follow:
    - sprint: b-10a-daemon-api
      artifact: authenticated-snapshot-and-event-client
    - sprint: b-5-definition-service
      artifact: real-definition-query-service
    - sprint: b-6-observation
      artifact: real-observation-projection-service
    - sprint: b-9a-sync-projection
      artifact: partial-host-snapshot-semantics
  parallel_safe: [b-9c-expand-roster, b-12-scheduling]
recommended_agent: typescript-ui-developer
recommended_model: workhorse
---

# B10 — Port the dashboard read experience

## Goal

Close the real read composition and shared browser/desktop dashboard with measurable large-team performance.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests, B2, and this sprint's service/API prerequisites must close before UI migration; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Replace fixtures with authenticated snapshots/events and port grouped/grid/list, hierarchy, search/filter, host/backend/status badges, team detail, and stale/disconnected states into the shared browser/Tauri app. Actual running-team, roster, and status values come from authoritative ATM observations rather than stored definitions. B10 consumes the existing authenticated snapshot/event contract but owns no ATM poller, sc-cron callback, timer, or scheduled action, so it remains parallel-safe with B12. PostgreSQL supplies one read-only fleet view combining host-qualified teams from all enrolled computers without launch authority, including concurrent same-named teams and agents on different hosts.
- Preserve icon/window/tray shell, browser independence, pinned observability adapter, redaction, and failure-noninterference.

```ts
export interface ShpherdReadClient {
  query(request: Query & { page?: PageRequest }): Promise<{ result: QueryResult; meta: ReadMeta }>;
  events(resume?: ResumeToken): AsyncIterable<EventEnvelope>;
}
```

Both browser and desktop inject this interface; neither imports a store, service crate, or required Tauri API.

## Relationships

`must_follow` B10A's authenticated snapshot/event boundary, the real B5 definition and B6 observation services, and B9A's partial-host snapshot semantics. Parallel-safe with B9B, B9C, and B12 through disjoint client paths.

## This sprint does not close

No mutations/editor/native mobile capabilities; B11/B11A own them.

## Acceptance and validation

- Real B5/B6 services compose through B10A without alternate in-process client access; typed hierarchy and lossless multi-variant Team bundles render every member association, ordered prompt, branch ref, and backend/runtime binding. A two-host fixture renders the combined PostgreSQL fleet view, preserves identical team and agent display names as distinct host-qualified instances, and proves ATM observations control actual runtime state. Every catalog/team/member/variant/discovery/host/backend/diagnostic read, pagination, provenance, stale/partial state, authenticated error, version, daemon/stream resume, restart mismatch, and reconnect/resync flow passes in the daemon/client integration harness.
- scmux oracle read workflows pass in browser and desktop. A deterministic 100-team/1,500-member fixture meets: initial interactive ≤2.0 s, search/filter p95 <100 ms, event reflection p95 <250 ms/1,000 events on recorded macOS arm64 reference hardware or equivalent.
- Browser import graph contains no required Tauri API; telemetry faults do not alter actions.

Every deliverable is production-ready for the read-experience integration.
