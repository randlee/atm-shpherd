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
  parallel_safe: [b-3a-schema-projection-contract, b-3c-external-integration-contract]
recommended_agent: architecture-developer
recommended_model: deep-reasoning
---

# B3B — Freeze service, launcher, and daemon API contracts

## Deliverables

- Fix validated identities/revisions, stable errors, sealed/open traits, closed launcher dispatch, private lease guard, commands/events, and test doubles.
- Approve deterministic CLI exit, HTTP status, and event error mapping.

## Contract signatures

```rust
pub struct TeamId(String);
pub struct AgentId(String);
pub struct HostId(String);
pub struct RequestId(String);
pub struct EventCursor(u64);
pub struct ApiVersion(u16);
pub struct DomainRevision(u64);
pub struct FencingToken(u64);
pub struct IdempotencyKey(String);
pub struct LaunchLeaseGuard { team: TeamId, host: HostId, fencing: FencingToken, _private: () }
pub enum Launcher { Herdr(HerdrLauncher), Tmux(TmuxLauncher) }
pub struct LaunchRequest { pub team: TeamId, pub host: HostId, pub key: IdempotencyKey }
pub struct LaunchResult { pub reused: bool, pub runtime: RuntimeIdentity, pub evidence: ActionEvidence }
pub trait GuardedLauncher: sealed::Sealed {
    fn launch(&self, guard: &LaunchLeaseGuard, request: LaunchRequest) -> Result<LaunchResult, DomainError>;
}
pub struct ErrorEnvelope { pub code: ErrorCode, pub message: String, pub operation: String, pub retryable: bool, pub recovery: Vec<RecoveryAction>, pub docs: Option<String> }
pub enum DaemonCommand { Definition(DefinitionCommand), Launch(LaunchCommand), Roster(RosterCommand) }
pub struct CommandEnvelope { pub api_version: ApiVersion, pub request_id: RequestId, pub command: DaemonCommand }
pub struct EventEnvelope { pub api_version: ApiVersion, pub cursor: EventCursor, pub event: DaemonEvent }
```

Only the private lease-validation module exposes `pub(crate) fn issue_launch_guard(...) -> LaunchLeaseGuard`; external code cannot construct or deserialize the guard, and no public unguarded spawn exists. Phase B service and launcher traits are sealed. Test doubles are created through crate-owned constructors; opening third-party implementations requires a later ADR.

## This sprint does not close

No service behavior, launcher adapter, API route, client, or lease persistence.

## Acceptance and validation

- Named boundary manifests and ADR-SHP-003..005 fix every signature/error mapping and double consumed by B5/B6/B7/B8/B9B/B10A.
- Compile-fail tests prove sealed traits and unconstructible guards; contract tests, workspace build, and boundary validation pass.

Every deliverable is production-ready for contract closure.
