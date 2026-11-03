---
id: b-11a-mobile
bead: shp-phase-b.21
status: planned
closure_type: integration
target_boundary: tauri-mobile
requirements: [REQ-UI-MOBILE]
adrs: [ADR-SHP-003, ADR-SHP-008]
owned_paths:
  - clients/src-tauri/gen/apple/**
  - clients/src-tauri/gen/android/**
  - clients/src/platform/mobile/**
  - clients/tests/mobile/**
  - docs/mobile/**
relations:
  must_follow:
    - sprint: b-11-editor-actions
      artifact: shared-authenticated-read-command-application
  parallel_safe: [b-12-scheduling, b-12a-daemon-supervision]
recommended_agent: tauri-mobile-developer
recommended_model: workhorse
---

# B11A — Deliver native Tauri mobile capabilities

## Deliverables

- Generate/build iOS and Android projects around the shared application and authenticated API.
- Implement platform capability adapters for deep links, notifications where supported, observability binding, secure credential use, and signing configuration outside source control.

## Relationships

`must_follow` B11's shared authenticated read/command application. Parallel-safe with B12/B12A where paths do not overlap.

## This sprint does not close

No mobile-local daemon or store; browser/desktop behavior is not weakened to match platform gaps.

## Acceptance and validation

- iOS/Android projects build; supported simulator/emulator smoke tests cover authenticated reads/commands, deep links, notifications, and observability.
- Signing guidance commits no secret; platform differences are explicit and tested.

Every deliverable is production-ready for the supported native-mobile boundary.
