---
id: b-11a-mobile
bead: shp-phase-b.21
status: planned
closure_type: integration
target_boundary: tauri-mobile
recommended_agent: tauri-mobile-developer
recommended_model: workhorse
---

# B11A — Deliver native Tauri mobile capabilities

requirements: REQ-UI, REQ-API, REQ-OPERATE.
adrs: ADR-SHP-003, ADR-SHP-008.

## Deliverables and owned paths

- Generate/build iOS and Android projects around the shared application and authenticated API.
- Implement platform capability adapters for deep links, notifications where supported, observability binding, secure credential use, and signing configuration outside source control.
- Owned paths: Tauri mobile projects/config, mobile capability adapters, simulator/emulator tests and docs.

## Relationships

`must_follow` B11 shared command experience and B10A API. Parallel-safe with B12/B12A where paths do not overlap.

## This sprint does not close

No mobile-local daemon or store; browser/desktop behavior is not weakened to match platform gaps.

## Acceptance and validation

- iOS/Android projects build; supported simulator/emulator smoke tests cover authenticated reads/commands, deep links, notifications, and observability.
- Signing guidance commits no secret; platform differences are explicit and tested.

Every deliverable is production-ready for the supported native-mobile boundary.
