---
id: b-3b-service-launch-api-contract
bead: shp-phase-b.22
status: planned
closure_type: contract
target_boundary: service-launch-api-contract
requirements: []
adrs: [ADR-SHP-004, ADR-SHP-005, ADR-SHP-011, ADR-SHP-013, ADR-SHP-014]
owned_paths:
  - docs/contracts/service-api/**
  - crates/shpherd-types/src/identity.rs
  - crates/shpherd-types/src/error.rs
  - crates/shpherd-types/src/command.rs
  - crates/shpherd-types/src/launch.rs
  - boundaries/shpherd-service.yaml
  - boundaries/shpherd-daemon.yaml
  - boundaries/shpherd-cli.yaml
  - docs/adr/ADR-SHP-004.md
  - docs/adr/ADR-SHP-005.md
  - docs/adr/ADR-SHP-011.md
  - docs/adr/ADR-SHP-013.md
  - docs/adr/ADR-SHP-014.md
relations:
  must_follow:
    - sprint: b-2-integrate-workspace
      artifact: generated-package-and-boundary-registry
  parallel_safe: [b-3c-external-integration-contract]
recommended_agent: architecture-developer
recommended_model: deep-reasoning
---

# B3B — Freeze service, launcher, and daemon API contracts

## Goal

Freeze the service, guarded-launch, command, event, and error contracts consumed independently by the service, launcher, and API layers.

## Required work and deliverables

- Fix canonical validated identities/revisions, stable errors, sealed/open traits, the complete hierarchy/read/roster/launcher surfaces, host enrollment and project binding, private lease guards, command/response/event envelopes, and stateful test doubles.
- Approve deterministic CLI exit, HTTP status, event/reconnect behavior, clone policy, guarded-launch semantics, and host enrollment decisions in the ADRs owned by this sprint; consume B3A's independent lease-authority decision only at B9B composition.

## Contract signatures

```rust
use serde::{Deserialize, Serialize};

// All persistent application IDs are canonical 26-character uppercase ULIDs.
macro_rules! id_newtype { ($name:ident) => {
    #[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd, Serialize, Deserialize)]
    #[serde(try_from = "String", into = "String")] pub struct $name(String);
    impl TryFrom<String> for $name { type Error = IdentityError;
        fn try_from(value: String) -> Result<Self, Self::Error> { validate_ulid(&value)?; Ok(Self(value)) } }
    impl TryFrom<&str> for $name { type Error = IdentityError;
        fn try_from(value: &str) -> Result<Self, Self::Error> { Self::try_from(value.to_owned()) } }
    impl std::str::FromStr for $name { type Err = IdentityError;
        fn from_str(value: &str) -> Result<Self, Self::Err> { Self::try_from(value) } }
    impl std::fmt::Display for $name { fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { f.write_str(&self.0) } }
    impl From<$name> for String { fn from(value: $name) -> String { value.0 } }
}; }
macro_rules! request_newtype { ($name:ident) => {
    #[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd, Serialize, Deserialize)]
    #[serde(try_from = "String", into = "String")] pub struct $name(String);
    impl TryFrom<String> for $name { type Error = IdentityError;
        fn try_from(value: String) -> Result<Self, Self::Error> { validate_uuid_v7(&value)?; Ok(Self(value)) } }
    impl TryFrom<&str> for $name { type Error = IdentityError;
        fn try_from(value: &str) -> Result<Self, Self::Error> { Self::try_from(value.to_owned()) } }
    impl std::str::FromStr for $name { type Err = IdentityError;
        fn from_str(value: &str) -> Result<Self, Self::Err> { Self::try_from(value) } }
    impl std::fmt::Display for $name { fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { f.write_str(&self.0) } }
    impl From<$name> for String { fn from(value: $name) -> String { value.0 } }
}; }
#[derive(Debug)] pub struct IdentityError { pub value: String, pub reason: String }
impl std::fmt::Display for IdentityError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { write!(f, "{}: {}", self.reason, self.value) }
}
impl std::error::Error for IdentityError {}
fn validate_ulid(value: &str) -> Result<(), IdentityError> {
    let alphabet = b"0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    if value.len() == 26 && value.as_bytes()[0] <= b'7'
        && value.bytes().all(|byte| alphabet.contains(&byte)) { return Ok(()); }
    Err(IdentityError { value: value.into(), reason: "expected canonical uppercase ULID".into() })
}
fn validate_uuid_v7(value: &str) -> Result<(), IdentityError> {
    let parsed = uuid::Uuid::parse_str(value).map_err(|_| IdentityError {
        value: value.into(), reason: "expected canonical lowercase UUIDv7".into() })?;
    if parsed.get_version_num() == 7 && parsed.hyphenated().to_string() == value { return Ok(()); }
    Err(IdentityError { value: value.into(), reason: "expected canonical lowercase UUIDv7".into() })
}
id_newtype!(OrganizationId); id_newtype!(FlotillaId); id_newtype!(TeamId);
id_newtype!(MemberId); id_newtype!(VariantId); id_newtype!(HostId);
id_newtype!(ProjectId); id_newtype!(DaemonInstanceId);
// RequestId, CorrelationId, and OperationId are canonical lowercase UUIDv7 strings.
request_newtype!(RequestId); request_newtype!(CorrelationId); request_newtype!(OperationId);
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct ApiVersion(pub u16);
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct DomainRevision(pub u64);
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct StoreRevision(pub u64);
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct EventCursor(pub u64);
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct FencingToken(pub u64);
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct IdempotencyKey(pub String);

pub enum ErrorCode { InvalidArgument, Unauthorized, NotFound, Conflict, Unavailable,
    UnsupportedVersion, StaleRevision, LeaseLost, CapabilityMissing, Internal }
pub enum RecoveryAction { Retry, Reauthenticate, Refresh, SelectHost, ReacquireLease, UpgradeClient }
pub struct DomainError { pub code: ErrorCode, pub message: String, pub retryable: bool,
    pub current_revision: Option<DomainRevision> }
pub struct ErrorEnvelope { pub api_version: ApiVersion, pub request_id: RequestId,
    pub correlation_id: CorrelationId, pub code: ErrorCode, pub message: String,
    pub retryable: bool, pub recovery: Vec<RecoveryAction>, pub docs: Option<String> }

pub enum DefinitionId { Organization(OrganizationId), Flotilla(FlotillaId), Team(TeamId) }
pub enum DefinitionParent { Root, Organization(OrganizationId), Flotilla(FlotillaId) }
pub struct DefinitionDraft { pub name: String, pub kind: String, pub project: Option<ProjectId> }
pub struct DefinitionPatch { pub name: Option<String>, pub project: Option<ProjectId> }
id_newtype!(DiscoveryId);
pub struct CallerIdentity { pub subject: String, pub roles: Vec<String>, pub authenticated_at_unix_ms: u64 }

pub enum DefinitionCommand {
    Create { parent: DefinitionParent, definition: DefinitionDraft, key: IdempotencyKey },
    Edit { target: DefinitionId, expected: DomainRevision, constraint: RunningConstraint, patch: DefinitionPatch, key: IdempotencyKey },
    Move { target: DefinitionId, new_parent: DefinitionParent, expected: DomainRevision, constraint: RunningConstraint, key: IdempotencyKey },
    Clone { target: DefinitionId, destination: DefinitionParent, expected: DomainRevision, constraint: RunningConstraint, key: IdempotencyKey },
    Unlink { target: DefinitionId, expected: DomainRevision, constraint: RunningConstraint, key: IdempotencyKey },
    Import { source: DiscoveryId, destination: DefinitionParent, key: IdempotencyKey },
}
pub enum DefinitionResult { Created { id: DefinitionId, revision: DomainRevision },
    Edited { id: DefinitionId, revision: DomainRevision }, Moved { id: DefinitionId, revision: DomainRevision },
    Cloned { source: DefinitionId, clone: DefinitionId, revision: DomainRevision },
    Unlinked { id: DefinitionId, revision: DomainRevision }, Imported { team: TeamId, revision: DomainRevision } }
pub enum RunningConstraint { MustBeStopped, PreserveRuntimeIdentity, RejectIfDescendantRunning }

pub struct MemberSpec { pub id: MemberId, pub team: TeamId, pub variant: VariantId,
    pub role: String, pub agent_type: String, pub model: Option<String>,
    pub requested_host: Option<HostId>, pub target_tab: Option<String> }
pub enum RosterCommand {
    Add { member: MemberSpec, expected: DomainRevision, caller: CallerIdentity, key: IdempotencyKey },
    Update { member: MemberSpec, expected: DomainRevision, caller: CallerIdentity, key: IdempotencyKey },
    Remove { team: TeamId, member: MemberId, expected: DomainRevision, caller: CallerIdentity, key: IdempotencyKey },
}
pub enum RosterResult { Added { member: MemberSpec, revision: DomainRevision },
    Updated { member: MemberSpec, revision: DomainRevision }, Removed { member: MemberId, revision: DomainRevision },
    ReconciliationPending { member: MemberId, operation: OperationId, revision: DomainRevision } }

pub enum Query { Hierarchy(HierarchyQuery), Catalog(CatalogQuery), Team(TeamQuery), Member(MemberQuery),
    Variant(VariantQuery), Discovery(DiscoveryQuery), Host(HostQuery), Backend(BackendQuery), Diagnostics(DiagnosticsQuery) }
pub struct PageRequest { pub limit: u16, pub after: Option<String> }
pub struct Page<T> { pub items: Vec<T>, pub next: Option<String>, pub complete: bool }
pub struct Provenance { pub source: String, pub observed_revision: String, pub observed_at_unix_ms: u64 }
pub struct ReadMeta { pub revision: DomainRevision, pub stale: bool, pub partial: bool,
    pub omissions: Vec<String>, pub provenance: Vec<Provenance> }
pub struct HierarchyQuery { pub root: Option<DefinitionId>, pub depth: u16 }
pub struct CatalogQuery { pub text: Option<String>, pub host: Option<HostId> }
pub struct TeamQuery { pub team: TeamId }
pub struct MemberQuery { pub team: TeamId, pub member: MemberId }
pub struct VariantQuery { pub variant: VariantId }
pub struct DiscoveryQuery { pub host: Option<HostId> }
pub struct HostQuery { pub host: Option<HostId> }
pub struct BackendQuery { pub backend: Option<RuntimeBackend> }
pub struct DiagnosticsQuery { pub host: Option<HostId>, pub team: Option<TeamId> }
pub struct HierarchyView { pub id: DefinitionId, pub parent: DefinitionParent, pub name: String }
pub struct CatalogEntry { pub team: TeamId, pub name: String, pub members: u32 }
pub struct TeamView { pub team: TeamId, pub revision: DomainRevision, pub state: ObservationState }
pub struct MemberView { pub member: MemberSpec, pub runtime: Option<RuntimeIdentity> }
pub struct VariantView { pub variant: VariantId, pub team: TeamId, pub requested_host: Option<HostId> }
pub struct DiscoveryView { pub discovery: DiscoveryId, pub host: HostId, pub importable: bool }
pub struct HostView { pub enrollment: HostEnrollment, pub health: HostHealth }
pub struct BackendView { pub backend: RuntimeBackend, pub capabilities: Vec<LauncherCapability> }
pub struct Diagnostic { pub code: String, pub message: String, pub retryable: bool }
pub enum QueryResult { Hierarchy(Page<HierarchyView>), Catalog(Page<CatalogEntry>), Team(TeamView),
    Member(MemberView), Variant(VariantView), Discovery(Page<DiscoveryView>), Host(HostView),
    Backend(BackendView), Diagnostics(Page<Diagnostic>) }

pub enum RuntimeBackend { Herdr, Tmux }
pub enum ObservationState { Stopped, Starting, Running, Idle, Done, Degraded, Unknown }
pub enum LauncherCapability { DryRun, Start, Stop, Observe, Focus, Relaunch, Repair, DynamicSpawn, Nudge }
pub struct RuntimeIdentity { pub backend: RuntimeBackend, pub host: HostId, pub workspace: String,
    pub tab: Option<String>, pub pane: String }
pub struct ActionEvidence { pub operation: OperationId, pub request: RequestId,
    pub revision: DomainRevision, pub recorded_at_unix_ms: u64, pub backend_evidence: String }
pub struct LaunchLeaseGuard { team: TeamId, variant: VariantId, host: HostId, holder: DaemonInstanceId,
    fencing: FencingToken, expires_at_unix_ms: u64, _private: () }
pub(crate) struct ValidatedLeaseGrant { pub team: TeamId, pub variant: VariantId,
    pub host: HostId, pub holder: DaemonInstanceId, pub fencing: FencingToken, pub expires_at_unix_ms: u64 }
pub enum LaunchAction { DryRun, Start, Stop, Observe, Focus, Relaunch, Repair,
    SpawnAgent { member: MemberSpec }, Nudge { member: MemberId, message: String } }
pub struct LaunchRequest { pub team: TeamId, pub variant: VariantId, pub host: HostId, pub action: LaunchAction,
    pub key: IdempotencyKey }
pub struct LaunchResult { pub reused: bool, pub runtime: Option<RuntimeIdentity>,
    pub state: ObservationState, pub evidence: ActionEvidence }
pub struct HerdrLauncher { /* crate-owned adapter */ }
pub struct TmuxLauncher { /* crate-owned adapter */ }
pub enum Launcher { Herdr(HerdrLauncher), Tmux(TmuxLauncher) }
mod sealed { pub trait Sealed {} }
pub trait GuardedLauncher: sealed::Sealed {
    fn capabilities(&self) -> &[LauncherCapability];
    fn execute(&self, guard: &LaunchLeaseGuard, request: LaunchRequest) -> Result<LaunchResult, DomainError>;
}

pub struct HostEnrollment { pub host: HostId, pub daemon: DaemonInstanceId,
    pub key_fingerprint: String, pub capabilities: Vec<HostCapability>, pub enrolled_at_unix_ms: u64 }
pub struct HostHealth { pub host: HostId, pub healthy: bool, pub checked_at_unix_ms: u64,
    pub diagnostics: Vec<Diagnostic> }
pub struct ProjectBinding { pub project: ProjectId, pub host: HostId,
    pub logical_repository: String, pub local_checkout: String }
pub enum HostCapability { Herdr, Tmux, Shell, LocalCheckout }
pub struct EnrollmentRequest { pub host: HostId, pub daemon: DaemonInstanceId,
    pub public_key: String, pub proof: String, pub capabilities: Vec<HostCapability> }
pub trait HostProjectResolver: sealed::Sealed {
    fn enroll(&self, request: EnrollmentRequest) -> Result<HostEnrollment, DomainError>;
    fn resolve(&self, project: &ProjectId, host: &HostId) -> Result<ProjectBinding, DomainError>;
    fn validate_checkout(&self, binding: &ProjectBinding) -> Result<HostHealth, DomainError>;
}

pub enum LaunchCommand { Execute(LaunchRequest) }
pub enum DaemonCommand { Definition(DefinitionCommand), Query(Query), Launch(LaunchCommand), Roster(RosterCommand) }
pub enum CommandResult { Definition(DefinitionResult), Query { result: QueryResult, meta: ReadMeta },
    Launch(LaunchResult), Roster(RosterResult), Accepted { operation: OperationId } }
pub enum ResponseStatus { Completed, Accepted, Replayed, Conflict }
pub struct CommandEnvelope { pub api_version: ApiVersion, pub request_id: RequestId,
    pub correlation_id: CorrelationId, pub caller: CallerIdentity, pub command: DaemonCommand }
pub struct ResponseEnvelope { pub api_version: ApiVersion, pub request_id: RequestId,
    pub correlation_id: CorrelationId, pub status: ResponseStatus,
    pub result: Option<CommandResult>, pub error: Option<ErrorEnvelope> }
pub enum DaemonEvent { DefinitionChanged { id: DefinitionId, revision: DomainRevision },
    RuntimeChanged { team: TeamId, runtime: Option<RuntimeIdentity> },
    OperationCompleted { operation: OperationId, result: CommandResult },
    CommandRejected { request_id: RequestId, error: ErrorEnvelope },
    ResyncRequired { oldest_available: EventCursor } }
pub struct EventEnvelope { pub api_version: ApiVersion, pub cursor: EventCursor,
    pub correlation_id: CorrelationId, pub event: DaemonEvent }

pub trait DefinitionService: sealed::Sealed {
    fn execute(&self, command: DefinitionCommand) -> Result<DefinitionResult, DomainError>;
}
pub trait ObservationService: sealed::Sealed {
    fn query(&self, query: Query, page: PageRequest) -> Result<(QueryResult, ReadMeta), DomainError>;
}
```

The macros above expand to private fields plus `TryFrom<&str>`, `FromStr`, `Display`, and custom serde. Persistent IDs accept only canonical uppercase ULID text; request IDs accept only canonical lowercase UUIDv7 text; revisions are nonzero unsigned decimal integers. ATM IDs and revisions remain foreign strings and cross the application boundary only through explicit, fallible binding/conversion functions. There is no `From<String>` or lossy conversion.

All definition mutations apply ADR-SHP-014: Armada-view clones share referenced flotillas, organization clones preserve contained team IDs, and explicit team clones mint new team/member IDs and drop ATM bindings. Move, clone, unlink, and import enforce expected revisions and the declared `RunningConstraint` before one atomic commit.

Only the private lease-validation module exposes `pub(crate) fn issue_launch_guard(validated: ValidatedLeaseGrant) -> LaunchLeaseGuard`; B9B alone creates that crate-private grant after validating B3A's authoritative CAS receipt. External code cannot construct, clone, deserialize, or renew the guard. Every mutating launcher action requires the guard and an idempotency key; dry-run/observe still validate host/project eligibility. The stateful launcher double supports every capability, replay, injected failure, and evidence assertion. Phase B service and launcher traits are sealed; opening implementations requires a later ADR.

Every wire enum uses explicit serde tags, `deny_unknown_fields`, and stable snake-case names. Unsupported versions fail before dispatch. A completed synchronous command returns `Completed`; durable queued work returns `Accepted` plus one eventual `OperationCompleted`; a repeated request returns the byte-equivalent prior result as `Replayed`; stale expected revisions return `Conflict` and the current revision. Event cursors increase per daemon instance, reconnect resumes strictly after a cursor, and an expired cursor yields `ResyncRequired` followed by a snapshot. Exactly one terminal response/event exists per request. `DomainError` maps deterministically to the envelope, CLI exit, and HTTP status.

## This sprint does not close

No service behavior, launcher adapter, API route, client, host persistence, or lease persistence.

## Acceptance and validation

- Named boundary manifests and ADR-SHP-004/005/011/013/014 fix every identity, hierarchy, roster, query, host, launcher, guard, envelope, error, and double consumed by B5/B6/B7/B8/B9B/B9C/B10A.
- Each owned ADR is approved and contains decision, alternatives, consequences, and executable evidence; the architecture index links it to this sole owner.
- Compile-fail tests prove sealed traits and unconstructible guards; serialization/version/replay/reconnect and stateful-double contract tests, workspace build, and boundary validation pass.

Every deliverable is production-ready for contract closure.
