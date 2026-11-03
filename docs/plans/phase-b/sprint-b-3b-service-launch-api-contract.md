---
id: b-3b-service-launch-api-contract
bead: shp-phase-b.22
status: planned
closure_type: contract
target_boundary: service-launch-api-contract
requirements: []
adrs: [ADR-SHP-003, ADR-SHP-004, ADR-SHP-005]
owned_paths:
  - docs/contracts/service-api/**
  - crates/shpherd-types/src/identity.rs
  - crates/shpherd-types/src/error.rs
  - crates/shpherd-types/src/command.rs
  - crates/shpherd-types/src/launch.rs
  - boundaries/shpherd-service.yaml
  - boundaries/shpherd-daemon.yaml
  - boundaries/shpherd-cli.yaml
relations:
  must_follow:
    - sprint: b-2-integrate-workspace
      artifact: generated-package-and-boundary-registry
  parallel_safe: [b-3c-external-integration-contract]
recommended_agent: architecture-developer
recommended_model: deep-reasoning
---

# B3B — Freeze service, launcher, and daemon API contracts

## Deliverables

- Fix validated identities/revisions, stable errors, sealed/open traits, closed launcher dispatch, private lease guard, commands/events, and test doubles.
- Approve deterministic CLI exit, HTTP status, and event error mapping.

## Contract signatures

```rust
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct TeamId(String);
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct AgentId(String);
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct HostId(String);
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct RequestId(String);
#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd, Serialize, Deserialize)]
#[serde(transparent)]
pub struct EventCursor(u64);
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct ApiVersion(u16);
#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd, Serialize, Deserialize)]
#[serde(transparent)]
pub struct DomainRevision(u64);
#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub struct FencingToken(u64);
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct IdempotencyKey(String);

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RuntimeBackend { Herdr, Tmux }
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuntimeIdentity { pub backend: RuntimeBackend, pub workspace: String, pub pane: String }
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ActionEvidence { pub operation: RequestId, pub revision: DomainRevision, pub recorded_at_unix_ms: u64 }

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorCode { InvalidArgument, Unauthorized, NotFound, Conflict, Unavailable, UnsupportedVersion, Internal }
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum RecoveryAction { Retry, Reauthenticate, Refresh, SelectHost, UpgradeClient }
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DomainError { pub code: ErrorCode, pub message: String, pub retryable: bool }

pub struct HerdrLauncher;
pub struct TmuxLauncher;
pub struct LaunchLeaseGuard { team: TeamId, host: HostId, fencing: FencingToken, _private: () }
pub enum Launcher { Herdr(HerdrLauncher), Tmux(TmuxLauncher) }
pub struct LaunchRequest { pub team: TeamId, pub host: HostId, pub key: IdempotencyKey }
pub struct LaunchResult { pub reused: bool, pub runtime: RuntimeIdentity, pub evidence: ActionEvidence }
mod sealed { pub trait Sealed {} }
pub trait GuardedLauncher: sealed::Sealed {
    fn launch(&self, guard: &LaunchLeaseGuard, request: LaunchRequest) -> Result<LaunchResult, DomainError>;
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ErrorEnvelope { pub api_version: ApiVersion, pub code: ErrorCode, pub message: String, pub operation: String, pub retryable: bool, pub recovery: Vec<RecoveryAction>, pub docs: Option<String> }

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "operation", rename_all = "snake_case")]
pub enum DefinitionCommand { Create { team: TeamId }, Update { team: TeamId, expected: DomainRevision }, Import { team: TeamId } }
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "operation", rename_all = "snake_case")]
pub enum LaunchCommand { Start { team: TeamId, host: HostId, key: IdempotencyKey }, Stop { team: TeamId }, Focus { team: TeamId } }
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "operation", rename_all = "snake_case")]
pub enum RosterCommand { Add { team: TeamId, agent: AgentId }, Update { team: TeamId, agent: AgentId }, Remove { team: TeamId, agent: AgentId } }
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "domain", content = "command", rename_all = "snake_case")]
pub enum DaemonCommand { Definition(DefinitionCommand), Launch(LaunchCommand), Roster(RosterCommand) }

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "event", rename_all = "snake_case")]
pub enum DaemonEvent {
    DefinitionChanged { team: TeamId, revision: DomainRevision },
    RuntimeChanged { team: TeamId, runtime: RuntimeIdentity },
    CommandRejected { request_id: RequestId, error: ErrorEnvelope },
}
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CommandEnvelope { pub api_version: ApiVersion, pub request_id: RequestId, pub command: DaemonCommand }
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EventEnvelope { pub api_version: ApiVersion, pub cursor: EventCursor, pub event: DaemonEvent }
```

Only the private lease-validation module exposes `pub(crate) fn issue_launch_guard(...) -> LaunchLeaseGuard`; external code cannot construct or deserialize the guard, and no public unguarded spawn exists. Phase B service and launcher traits are sealed. Test doubles are created through crate-owned constructors; opening third-party implementations requires a later ADR.

All wire enums use explicit serde tags and stable casing; `ApiVersion` is required on commands, events, and errors, and an unsupported version maps to `UNSUPPORTED_VERSION` before dispatch. `EventCursor` is strictly increasing per daemon stream. A rejected command emits exactly one `CommandRejected` event carrying the same `RequestId`; `DomainError` maps deterministically to `ErrorEnvelope`, CLI exit code, and HTTP status, and only `Unavailable` may be retryable by default.

## This sprint does not close

No service behavior, launcher adapter, API route, client, or lease persistence.

## Acceptance and validation

- Named boundary manifests and ADR-SHP-003..005 fix every signature/error mapping and double consumed by B5/B6/B7/B8/B9B/B10A.
- Compile-fail tests prove sealed traits and unconstructible guards; contract tests, workspace build, and boundary validation pass.

Every deliverable is production-ready for contract closure.
