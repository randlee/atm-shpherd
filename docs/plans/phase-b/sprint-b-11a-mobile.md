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
    - sprint: b-10-dashboard
      artifact: authenticated-read-application
    - sprint: b-11-editor-actions
      artifact: authenticated-command-application
  parallel_safe: [b-12-scheduling, b-12a-daemon-supervision]
recommended_agent: tauri-mobile-developer
recommended_model: workhorse
---

# B11A — Deliver native Tauri mobile capabilities

## Goal

Close installable iOS and Android shells around the proven shared application without introducing a mobile-local control plane.

## Required work and deliverables

- Native packaging starts only after B1's sc-runtime `v0.1.1` template installation and every baseline test gate have passed.
- B2, B10's read application, and B11's command application must also close before native UI packaging starts.
- If sc-runtime `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Generate/build iOS and Android projects around the shared application and authenticated API.
- Implement platform capability adapters for deep links, notifications where supported, observability binding, secure credential use, and signing configuration outside source control.

```ts
export interface NativeCapabilities {
  openDeepLink(url: string): Promise<void>;
  notify(input: { title: string; body: string; route?: string }): Promise<"shown" | "unsupported">;
  readCredential(key: string): Promise<string | null>;
}
```

The browser supplies an explicit unsupported/no-op adapter. Mobile capability failure cannot alter the daemon command result.

## Relationships

`must_follow` B10's authenticated read application and B11's authenticated command application. Parallel-safe with B12/B12A where paths do not overlap.

## This sprint does not close

No mobile-local daemon or store; browser/desktop behavior is not weakened to match platform gaps.

## Acceptance and validation

- Dispatch fails unless the dependency graph contains a transitive `must_follow` path to completed B1 evidence proving the sc-runtime template was installed and every baseline test passed.
- iOS/Android projects build; supported simulator/emulator smoke tests cover authenticated reads/commands, deep links, notifications, and observability.
- Signing guidance commits no secret; credential-store success/denial and native-adapter failure are tested without changing daemon command results; platform differences are explicit.

Every deliverable is production-ready for the supported native-mobile boundary.
