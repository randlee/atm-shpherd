# Phase B testing and platform guidance

This document is the shared validation contract for Phase B. Sprint acceptance criteria remain authoritative for feature ownership; this guide defines the common gates and evidence shape so independent sprint QA is comparable.

## Common gates

Every Rust sprint runs formatting, workspace lint, affected crate tests, workspace build, and machine-readable boundary validation. Every TypeScript sprint runs formatting, lint/typecheck, unit tests, the affected browser/Tauri integration tests, and production builds. Contract sprints additionally compile their public fixtures and test doubles. A skipped gate requires a recorded unsupported-platform reason; a passing sprint cannot silently defer a supported gate.

## Platform matrix

| Surface | Required Phase B evidence | Owner |
|---|---|---|
| Rust workspace | Linux, macOS, and Windows build/test evidence for portable crates; platform-specific exclusions are explicit | affected Rust sprint |
| Browser client | Production browser build plus authenticated read/command integration against the daemon API; no required Tauri import | B10/B11 |
| Desktop Tauri | macOS, Linux, and Windows package/build smoke evidence; icon/window/tray/deep-link/notification capability differences recorded | B10/B11/B12A |
| iOS | Project generation, build, and supported simulator smoke for authenticated reads/commands and native adapters | B11A |
| Android | Project generation, build, and supported emulator smoke for authenticated reads/commands and native adapters | B11A |
| Daemon supervision | Install/start/stop/restart/crash/reboot/upgrade/uninstall evidence on each supported desktop supervision mechanism | B12A |

Signing keys, enrollment credentials, API tokens, database URLs, and platform secrets never enter fixtures, logs, screenshots, or committed service definitions.

## Integration and failure evidence

- B9A records two-host synchronization under disconnect, reconnect, version skew, conflict, exclusion, and partial failure.
- B9B records lease/fencing behavior under crash, partition, stale clock, retry race, and ownership transfer.
- B9C records every crash boundary between intent, ATM mutation, re-import, synchronization, guarded spawn, and observation.
- B10 records the exact hardware, fixture, sample count, and tool versions for the 100-team/1,500-member performance budgets.
- B10A/B10/B11 record authentication, authorization, version mismatch, error mapping, event ordering, reconnect, and redaction evidence.
- B12 records parser, due-run, missed-run, restart, eligible-host, single-execution, and aggregate-isolation evidence.

## Release evidence

B13 consumes, hashes, and indexes the already-owned sprint artifacts under `docs/evidence/phase-b/**`. It does not repair product code. A failed gate opens a separately owned fix bead and certification reruns only after that fix closes.
