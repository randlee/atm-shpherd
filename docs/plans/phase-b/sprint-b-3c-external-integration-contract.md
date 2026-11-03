---
id: b-3c-external-integration-contract
bead: shp-phase-b.23
status: planned
closure_type: contract
target_boundary: external-integration-contract
requirements: []
adrs: [ADR-SHP-006, ADR-SHP-007, ADR-SHP-009, ADR-SHP-010]
owned_paths:
  - docs/contracts/atm/**
  - docs/contracts/hmux/**
  - docs/contracts/sc-cron/**
  - crates/shpherd-types/src/external/**
  - boundaries/external-integrations.yaml
relations:
  must_follow:
    - sprint: b-2-integrate-workspace
      artifact: generated-daemon-adapter-boundary
  parallel_safe: [b-3a-schema-projection-contract, b-3b-service-launch-api-contract]
recommended_agent: integration-contract-developer
recommended_model: deep-reasoning
---

# B3C — Freeze ATM, hmux, and sc-cron contracts

## Deliverables

- Capture versioned ATM fixtures, hmux capability/result schema, cron grammar/callback/error schema, redaction rules, and MCP-disabled decision.
- Supply simulators/test doubles independently consumed by B6A, B7, and B12.

## Contract schemas

```rust
pub struct AtmRosterRevision(String);
pub enum AtmMutation { Add(MemberSpec), Update(MemberSpec), Remove(MemberId) }
pub struct HmuxCapabilities { pub version: SemVer, pub dry_run: bool, pub relaunch: bool, pub shells: Vec<Shell>, pub dynamic_spawn: bool, pub nudge: bool }
pub struct HmuxSpawnResult { pub reused: bool, pub workspace: String, pub tab: String, pub pane: String, pub agent: String }
pub struct ScCronSource { pub repository: String, pub revision_or_version: String, pub api_version: String }
pub struct CronCallbackPayload { pub schedule_name: String, pub row: serde_json::Value }
pub enum CronError { InvalidExpression, CallbackFailed { retryable: bool }, Canceled }
pub type CronCallback = fn(CronCallbackPayload) -> Result<(), CronError>;
```

Fixtures freeze exact plural ATM commands (`atm teams add-member|update-member|remove-member ... --json` and `atm members --team ... --json`), hmux discovery/dry-run/spawn, the pinned `ScCronSource`, five-field minute-first cron input, and six-field seconds-first compatibility input. The callback receives only `schedule_name` and `row`; no ATM team, phase, store trait, or Shpherd row enters the sc-cron boundary.

## This sprint does not close

No ATM import/mutation, hmux process call, scheduler registration, or MCP surface.

## Acceptance and validation

- `boundary:external-integrations` and ADR-SHP-006/007/009/010 fix versions, schemas, stable failures, ownership, redaction, and fallbacks.
- Fixtures validate, doubles compile, and workspace/boundary validation pass.

Every deliverable is production-ready for contract closure.
