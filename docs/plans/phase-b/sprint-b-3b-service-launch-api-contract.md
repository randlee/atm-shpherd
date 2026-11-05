---
id: b-3b-service-launch-api-contract
bead: shp-phase-b.22
status: planned
closure_type: contract
target_boundary: service-launch-api-contract
requirements: [ANC-002, ANC-008, ANC-009, ANC-011, ANC-012, ANC-013, REQ-DEFINITION, REQ-LAUNCH, REQ-API, REQ-OPERATE-SUPERVISION]
adrs: [ADR-SHP-003, ADR-SHP-004, ADR-SHP-005, ADR-SHP-011, ADR-SHP-013, ADR-SHP-014]
owned_paths:
  - docs/contracts/service-api/**
  - crates/shpherd-types/src/error.rs
  - crates/shpherd-types/src/command.rs
  - crates/shpherd-types/src/launch.rs
  - crates/shpherd-types/src/health.rs
  - crates/shpherd-service/src/contracts/definition.rs
  - crates/shpherd-service/src/contracts/observation.rs
  - crates/shpherd-service/src/contracts/launch.rs
  - crates/shpherd-service/src/contracts/host_project.rs
  - boundaries/shpherd-service.yaml
  - boundaries/shpherd-daemon.yaml
  - boundaries/shpherd-cli.yaml
  - docs/adr/ADR-SHP-005.md
  - docs/adr/ADR-SHP-011.md
  - docs/adr/ADR-SHP-013.md
  - docs/adr/ADR-SHP-014.md
relations:
  must_follow:
    - sprint: b-2-integrate-workspace
      artifact: compiled-foundation-types-auth-and-boundary-registry
  parallel_safe: [b-3c-external-integration-contract]
recommended_agent: architecture-developer
recommended_model: deep-reasoning
---

# B3B — Freeze service, launcher, and daemon API contracts

## Goal

Freeze the service, guarded-launch, command, event, error, and daemon health/readiness contracts consumed independently by the service, launcher, and API layers.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests and B2 must close before this contract; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this contract starts or resumes.
- Consume B2's canonical identities/revisions/cursors/auth/bridge evidence and fix stable errors, the closed Armada/Fleet/Flotilla/Team and atomic Team-bundle model, sealed/open traits, complete read/roster/split-launcher surfaces, host enrollment/project binding, private host-local operation guards, verified dispatch context, tagged command/response/event/resume envelopes, complete health/readiness wire types, typed readiness-dependency input, and stateful test doubles.
- Specify that omitted launcher selection resolves to Herdr by default while an explicit tmux policy remains supported, and require contract fixtures for both selections.
- Approve deterministic CLI exit, HTTP status, event/reconnect behavior, clone policy, guarded-launch semantics, and host enrollment decisions in the ADRs owned by this sprint; consume B2's identity/revision/cursor decision and B3A's fleet-view projection decision only at their documented seams.
- Define observation contracts so ATM supplies the actual running-team instance and roster/runtime state; Shpherd definitions are desired state and cannot replace ATM runtime truth.
- Expose B3A's PostgreSQL projection through a query seam that returns one combined fleet-wide team view across all computers.
- Define the noninteractive `shpherd` CLI command and daemon wire mapping usable over SSH, including Herdr-default and explicit-tmux selection. Contract doubles prove request/response mapping only; B9B exclusively closes real SSH-to-CLI-to-daemon-to-launcher execution and active-agent start.

## Contract signatures

This is an abridged API view; canonical contract modules own complete derives/serde and compilation. Potentially blocking service, host, and launcher operations return the workspace `BoxFuture<'a, T>` (`Send` future) convention; only immutable capability inspection stays synchronous.

```rust
use serde::{Deserialize, Serialize};
use shpherd_auth::AuthenticatedPrincipal;
use shpherd_types::foundation::{AggregateDigest, ArmadaId, CommandDigest, CorrelationId, DaemonInstanceId, DiscoveryId, DomainRevision,
    EventCursor, FleetId, FlotillaId, GitRef, HostId, IdempotencyKey,
    AtmBinding, LauncherPolicy, LogicalConfigRef, LogicalProjectRef, OrderedPromptRefs, MemberId,
    MemberRole, OperationId, ProjectId, RequestId, RosterRegistrationEvidence,
    RuntimeBackend, StreamId, TeamId, TeamParent, TeamPlacementId, ValidParent,
    VariantDraftKey, VariantId, AtmMemberBinding};

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct ApiVersion(pub u16);

pub enum ErrorCode { InvalidArgument, Unauthorized, NotFound, Conflict, Unavailable,
    UnsupportedVersion, StaleRevision, LaunchInProgress, CapabilityMissing, Internal }
pub enum ErrorCause { Validation, Authentication, Authorization, MissingResource, RevisionMismatch,
    LocalOperation, CapabilityNegotiation, DependencyUnavailable, InternalInvariant }
pub enum ErrorDetails {
    Field { name: String, reason: String },
    Revision { current: DomainRevision },
    Capability { required: String },
    Dependency { name: String, retry_after_ms: Option<u64> },
}
pub enum RecoveryAction { Retry, Reauthenticate, Refresh, SelectHost, InspectLocalOperation, UpgradeClient }
pub struct DomainError { pub code: ErrorCode, pub message: String, pub retryable: bool,
    pub cause: ErrorCause, pub details: Option<ErrorDetails> }
pub struct ErrorEnvelope { pub api_version: ApiVersion, pub request_id: RequestId,
    pub correlation_id: CorrelationId, pub code: ErrorCode, pub message: String,
    pub retryable: bool, pub cause: ErrorCause, pub details: Option<ErrorDetails>,
    pub recovery: Vec<RecoveryAction>, pub docs: Option<String> }

pub struct DispatchContext<'a> { pub principal: &'a AuthenticatedPrincipal,
    pub request_id: &'a RequestId, pub correlation_id: &'a CorrelationId }

pub enum DefinitionId { Armada(ArmadaId), Fleet(FleetId), Flotilla(FlotillaId), Team(TeamId) }
pub enum ContainerId { Armada(ArmadaId), Fleet(FleetId), Flotilla(FlotillaId) }
pub struct MemberDraft { pub name: String, pub variant: VariantDraftKey,
    pub role: MemberRole, pub agent_type: String,
    pub model: Option<String>, pub atm_member: Option<AtmMemberBinding>,
    pub requested_host: Option<HostId>, pub target_tab: Option<String> }
pub struct VariantDraft { pub key: VariantDraftKey, pub name: String,
    pub requested_host: Option<HostId>, pub config_override: Option<LogicalConfigRef>,
    pub git_ref_override: Option<GitRef>, pub backend: RuntimeBackend,
    pub runtime_binding: String }
pub struct TeamDraft { pub name: String, pub project: LogicalProjectRef,
    pub config: LogicalConfigRef, pub prompts: OrderedPromptRefs, pub launcher: LauncherPolicy,
    pub atm: Option<AtmBinding>, pub members: Vec<MemberDraft>, pub variants: Vec<VariantDraft> }
pub struct TeamPlacement { pub placement: TeamPlacementId, pub team: TeamId,
    pub parent: TeamParent, pub revision: DomainRevision }
pub struct TeamBundle { pub team: TeamId, pub name: String, pub placements: Vec<TeamPlacement>,
    pub project: LogicalProjectRef, pub config: LogicalConfigRef, pub prompts: OrderedPromptRefs,
    pub launcher: LauncherPolicy, pub atm: Option<AtmBinding>, pub members: Vec<MemberSpec>,
    pub variants: Vec<VariantSpec> }
pub struct TeamPatch { pub name: String, pub project: LogicalProjectRef,
    pub config: LogicalConfigRef, pub prompts: OrderedPromptRefs, pub launcher: LauncherPolicy,
    pub members: Vec<MemberSpec>, pub variants: Vec<VariantSpec> }
pub struct VariantSpec { pub id: VariantId, pub team: TeamId, pub name: String,
    pub requested_host: Option<HostId>, pub config_override: Option<LogicalConfigRef>,
    pub git_ref_override: Option<GitRef>, pub backend: RuntimeBackend,
    pub runtime_binding: String }
pub struct ContainerPatch { pub name: String }
pub struct AggregateRevision { pub target: DomainRevision, pub parent: DomainRevision,
    pub descendants_digest: AggregateDigest }
pub enum DefinitionCommand {
    CreateArmada { name: String, key: IdempotencyKey },
    CreateFleet { parent: ArmadaId, expected_parent: DomainRevision, name: String, key: IdempotencyKey },
    CreateFlotilla { parent: FleetId, expected_parent: DomainRevision, name: String, key: IdempotencyKey },
    CreateTeam { parent: TeamParent, expected_parent: DomainRevision, draft: TeamDraft, key: IdempotencyKey },
    EditContainer { target: ContainerId, expected: AggregateRevision,
        constraint: RunningConstraint, patch: ContainerPatch, key: IdempotencyKey },
    EditTeam { team: TeamId, expected: AggregateRevision,
        constraint: RunningConstraint, patch: TeamPatch, key: IdempotencyKey },
    MoveFleet { fleet: FleetId, new_parent: ArmadaId, expected: AggregateRevision,
        expected_destination: DomainRevision, constraint: RunningConstraint, key: IdempotencyKey },
    MoveFlotilla { flotilla: FlotillaId, new_parent: FleetId, expected: AggregateRevision,
        expected_destination: DomainRevision, constraint: RunningConstraint, key: IdempotencyKey },
    MoveTeam { placement: TeamPlacementId, new_parent: TeamParent, expected: AggregateRevision,
        expected_destination: DomainRevision, constraint: RunningConstraint, key: IdempotencyKey },
    CloneArmada { armada: ArmadaId, expected: AggregateRevision, key: IdempotencyKey },
    CloneFleet { fleet: FleetId, destination: ArmadaId, expected: AggregateRevision,
        expected_destination: DomainRevision, key: IdempotencyKey },
    CloneFlotilla { flotilla: FlotillaId, destination: FleetId, expected: AggregateRevision,
        expected_destination: DomainRevision, key: IdempotencyKey },
    CloneTeam { team: TeamId, destination: TeamParent, expected: AggregateRevision,
        expected_destination: DomainRevision, constraint: RunningConstraint, key: IdempotencyKey },
    UnlinkTeamPlacement { placement: TeamPlacementId, expected: AggregateRevision,
        constraint: RunningConstraint, key: IdempotencyKey },
    UnlinkDefinition { target: ContainerId, expected: AggregateRevision,
        constraint: RunningConstraint, key: IdempotencyKey },
    ImportTeam { source: DiscoveryId, destination: TeamParent,
        expected_destination: DomainRevision, key: IdempotencyKey },
}
pub enum DefinitionResult { Created { id: DefinitionId, revision: AggregateRevision },
    Edited { id: DefinitionId, revision: AggregateRevision }, Moved { id: DefinitionId, revision: AggregateRevision },
    Cloned { source: DefinitionId, clone: DefinitionId, revision: AggregateRevision },
    Unlinked { id: DefinitionId, revision: AggregateRevision }, Imported { team: TeamId, revision: AggregateRevision } }
pub enum RunningConstraint { MustBeStopped, PreserveRuntimeIdentity, RejectIfDescendantRunning }

pub struct MemberSpec { pub id: MemberId, pub team: TeamId, pub variant: VariantId,
    pub name: String, pub atm_member: Option<AtmMemberBinding>, pub role: MemberRole,
    pub agent_type: String, pub model: Option<String>,
    pub requested_host: Option<HostId>, pub target_tab: Option<String> }
pub enum RosterCommand {
    Add { member: MemberSpec, expected: DomainRevision, key: IdempotencyKey },
    Update { member: MemberSpec, expected: DomainRevision, key: IdempotencyKey },
    Remove { team: TeamId, member: MemberId, expected: DomainRevision, key: IdempotencyKey },
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
pub struct HierarchyView { pub id: DefinitionId, pub parent: ValidParent, pub name: String,
    pub aggregate_revision: AggregateRevision }
pub struct CatalogEntry { pub team: TeamId, pub name: String, pub members: u32 }
pub struct TeamView { pub definition: TeamBundle, pub revision: DomainRevision, pub state: ObservationState }
pub struct MemberView { pub member: MemberSpec, pub runtime: Option<RuntimeIdentity> }
pub struct VariantView { pub variant: VariantSpec }
pub struct DiscoveryView { pub discovery: DiscoveryId, pub host: HostId, pub importable: bool }
pub struct HostView { pub enrollment: HostEnrollment, pub health: HostHealth }
pub struct BackendView { pub backend: RuntimeBackend, pub capabilities: Vec<LauncherCapability> }
pub struct Diagnostic { pub code: String, pub message: String, pub retryable: bool }
pub enum QueryResult { Hierarchy(Page<HierarchyView>), Catalog(Page<CatalogEntry>), Team(TeamView),
    Member(MemberView), Variant(VariantView), Discovery(Page<DiscoveryView>), Host(HostView),
    Backend(BackendView), Diagnostics(Page<Diagnostic>) }

pub enum ObservationState { Stopped, Starting, Running, Idle, Done, Degraded, Unknown }
pub enum LauncherCapability { DryRun, Start, Stop, Observe, Focus, Relaunch, Repair,
    DynamicSpawn, Nudge, StopMember, ReconcileMember }
pub struct RuntimeIdentity { pub backend: RuntimeBackend, pub host: HostId, pub workspace: String,
    pub tab: Option<String>, pub pane: String }
pub struct ActionEvidence { pub operation: OperationId, pub request: RequestId,
    pub revision: DomainRevision, pub recorded_at_unix_ms: u64, pub backend_evidence: String }
// crates/shpherd-service/src/contracts/launch.rs; private construction stays with B9B.
pub struct HostLaunchGuard { team: TeamId, variant: VariantId, host: HostId,
    operation: OperationId, key: IdempotencyKey, _private: () }
pub enum LaunchReadAction { DryRun, Observe, Focus }
pub enum LaunchMutation { Start, StopTeam, Relaunch, Repair,
    SpawnAgent { member: MemberSpec, registration: RosterRegistrationEvidence },
    Nudge { member: MemberId, message: String },
    StopMember { member: MemberId, runtime: RuntimeIdentity },
    ReconcileMember { member: MemberId, runtime: RuntimeIdentity } }
pub struct LaunchReadRequest { pub team: TeamId, pub variant: VariantId, pub host: HostId,
    pub action: LaunchReadAction }
pub struct LaunchMutationRequest { pub team: TeamId, pub variant: VariantId, pub host: HostId,
    pub mutation: LaunchMutation, pub key: IdempotencyKey }
pub struct LaunchResult { pub reused: bool, pub runtime: Option<RuntimeIdentity>,
    pub state: ObservationState, pub evidence: ActionEvidence }
// crates/shpherd-service/src/contracts/launcher.rs; open port implemented only by allowlisted daemon adapters.
pub trait LauncherReader: Send + Sync {
    fn capabilities(&self) -> &[LauncherCapability];
    fn read(&self, request: LaunchReadRequest) -> BoxFuture<'_, Result<LaunchResult, DomainError>>;
}
pub trait GuardedLauncher: Send + Sync {
    fn mutate<'a>(&'a self, guard: &'a HostLaunchGuard, request: LaunchMutationRequest) -> BoxFuture<'a, Result<LaunchResult, DomainError>>;
}

pub struct HostEnrollment { pub host: HostId, pub daemon: DaemonInstanceId,
    pub key_fingerprint: String, pub capabilities: Vec<HostCapability>, pub enrolled_at_unix_ms: u64 }
pub struct HostHealth { pub host: HostId, pub healthy: bool, pub checked_at_unix_ms: u64,
    pub diagnostics: Vec<Diagnostic> }
pub enum ReadinessDependency { Configuration, Credentials, RequiredStores, Migrations,
    OperationJournalRecovery, AtmHeartbeatRegistration, AtmHeartbeatFreshness }
pub enum ReadinessDependencyState { Pending, Ready,
    Failed { code: String }, Stale { last_success_unix_ms: Option<u64> } }
pub struct ReadinessDependencyInput { pub dependency: ReadinessDependency,
    pub state: ReadinessDependencyState, pub observed_at_unix_ms: u64,
    pub required: bool }
pub enum HealthState { LiveNotReady { blocking: Vec<ReadinessDependencyInput> }, Ready,
    Degraded { reasons: Vec<ReadinessDependencyInput> }, Draining }
pub trait ReadinessSource: Send + Sync {
    fn snapshot(&self) -> BoxFuture<'_, Result<HealthState, DomainError>>;
}
pub struct ProjectBinding { pub project: ProjectId, pub host: HostId,
    pub logical_repository: String, pub local_checkout: String }
pub enum HostCapability { Herdr, Tmux, Shell, LocalCheckout }
pub struct EnrollmentRequest { pub host: HostId, pub daemon: DaemonInstanceId,
    pub public_key: String, pub proof: String, pub capabilities: Vec<HostCapability> }
pub trait HostProjectResolver: Send + Sync {
    fn enroll(&self, request: EnrollmentRequest) -> BoxFuture<'_, Result<HostEnrollment, DomainError>>;
    fn resolve<'a>(&'a self, project: &'a ProjectId, host: &'a HostId) -> BoxFuture<'a, Result<ProjectBinding, DomainError>>;
    fn validate_checkout<'a>(&'a self, binding: &'a ProjectBinding) -> BoxFuture<'a, Result<HostHealth, DomainError>>;
}

pub enum LaunchCommand { Read(LaunchReadRequest), Mutate(LaunchMutationRequest) }
pub enum DaemonCommand { Definition(DefinitionCommand), Query(Query), Launch(LaunchCommand), Roster(RosterCommand) }
pub enum CommandResult { Definition(DefinitionResult), Query { result: QueryResult, meta: ReadMeta },
    Launch(LaunchResult), Roster(RosterResult) }
pub enum TerminalOutcome { Completed { result: CommandResult },
    Conflict { error: ErrorEnvelope }, Rejected { error: ErrorEnvelope } }
pub enum OriginalOutcome { Accepted { operation: OperationId }, Terminal(TerminalOutcome) }
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum ResponseOutcome { Completed { result: CommandResult }, Accepted { operation: OperationId },
    Replayed { original_request: RequestId, original: Box<OriginalOutcome> },
    Conflict { error: ErrorEnvelope }, Rejected { error: ErrorEnvelope } }
pub struct CommandEnvelope { pub api_version: ApiVersion, pub request_id: RequestId,
    pub correlation_id: CorrelationId, pub command: DaemonCommand }
pub struct ResponseEnvelope { pub api_version: ApiVersion, pub request_id: RequestId,
    pub correlation_id: CorrelationId, pub outcome: ResponseOutcome }
pub enum DaemonEvent { DefinitionChanged { id: DefinitionId, revision: DomainRevision },
    RuntimeChanged { team: TeamId, runtime: Option<RuntimeIdentity> },
    OperationCompleted { operation: OperationId, outcome: TerminalOutcome },
    ResyncRequired { expected_daemon: DaemonInstanceId, expected_stream: StreamId,
        oldest_available: EventCursor } }
pub struct ResumeToken { pub daemon: DaemonInstanceId, pub stream: StreamId, pub after: EventCursor }
pub struct EventEnvelope { pub api_version: ApiVersion, pub daemon: DaemonInstanceId,
    pub stream: StreamId, pub cursor: EventCursor, pub correlation_id: CorrelationId,
    pub event: DaemonEvent }

pub struct OperationRecord { pub request: RequestId, pub correlation: CorrelationId,
    pub operation: OperationId, pub key: Option<IdempotencyKey>, pub command_digest: CommandDigest,
    pub original: OriginalOutcome, pub terminal: Option<TerminalOutcome>,
    pub event: Option<EventEnvelope>, pub event_published: bool, pub revision: DomainRevision }
pub trait OperationJournal: Send + Sync {
    fn accept(&self, record: OperationRecord) -> BoxFuture<'_, Result<OperationRecord, DomainError>>;
    fn complete(&self, record: OperationRecord) -> BoxFuture<'_, Result<OperationRecord, DomainError>>;
    fn pending_events(&self, limit: u16) -> BoxFuture<'_, Result<Vec<OperationRecord>, DomainError>>;
    fn mark_published(&self, operation: OperationId, expected: DomainRevision) -> BoxFuture<'_, Result<(), DomainError>>;
}

// crates/shpherd-service/src/contracts; sealed beside permitted service implementations.
mod sealed { pub trait Sealed {} }
pub trait DefinitionService: sealed::Sealed + Send + Sync {
    fn execute<'a>(&'a self, context: &'a DispatchContext<'a>, command: DefinitionCommand) -> BoxFuture<'a, Result<DefinitionResult, DomainError>>;
}
pub trait ObservationService: sealed::Sealed + Send + Sync {
    fn query<'a>(&'a self, context: &'a DispatchContext<'a>, query: Query, page: PageRequest) -> BoxFuture<'a, Result<(QueryResult, ReadMeta), DomainError>>;
}
pub trait RosterService: sealed::Sealed + Send + Sync {
    fn execute<'a>(&'a self, context: &'a DispatchContext<'a>, command: RosterCommand) -> BoxFuture<'a, Result<RosterResult, DomainError>>;
}
```

The B2 foundation owns the private-field ID/revision/cursor implementations, `TryFrom<&str>`, `FromStr`, `Display`, and custom serde. Persistent IDs accept only canonical uppercase ULID text; request IDs accept only canonical lowercase UUIDv7 text; `DomainRevision` begins at one, while `EventCursor::GENESIS` is zero and the first emitted event is cursor one. ATM IDs and revisions remain foreign strings and cross the application boundary only through explicit, fallible binding/conversion functions. There is no `From<String>` or lossy conversion.

The closed hierarchy is Armada → Fleet → optional Flotilla → Team-placement → Team. `ValidParent` makes every other placement unrepresentable, while stable `TeamPlacementId` values allow one Team aggregate to be referenced by more than one container. Creating or replacing a Team validates its entire bundle in one transaction: at least one placement, logical project plus typed git ref, config and ordered nonempty prompt references, launcher policy, at least one uniquely keyed variant, every named member's valid variant key/ID and optional stable ATM member binding, unique members, per-variant backend/runtime binding, and exactly one `MemberRole::Captain`. Create/import may establish the immutable ATM binding; `TeamPatch` deliberately cannot alter it. Every create/edit/move/clone/unlink/import checks the target placement or aggregate, source-parent, destination-parent, and descendants aggregate revisions it can invalidate; no partial member/variant commit or revision advance is allowed. ADR-SHP-014 makes Armada-view clones share references, Fleet/Flotilla clones create new placement IDs that preserve referenced Team IDs, unlink remove one placement and delete the Team only after its last reference, and explicit Team clones mint new Team/member/variant/placement IDs, remap every member variant reference, preserve member names, prompt order and branch/backend/runtime bindings, and drop ATM bindings.

The opaque `HostLaunchGuard`, its crate-private issuer, and open launcher port definitions live together in `shpherd-service::contracts`; B9B implements host-local single-flight and durable idempotency validation in that same crate. `shpherd-service` depends on no daemon type. Independent Herdr/tmux concrete adapters implement the boundary-allowlisted service port and receive only a borrowed guard; they cannot construct, clone, or deserialize it. `LauncherReader` exposes only dry-run/observe/focus; `GuardedLauncher` exposes only start/stop/relaunch/repair/spawn/nudge/member-stop/member-reconcile and requires both the local guard and idempotency key. The guard serializes duplicate work only for one host/team/variant operation and cannot block the same names on another host. Contract fixtures compile skeletal cross-crate port implementers and negative fixtures prove an adapter cannot manufacture a guard or mutate through the read port; B7/B8/B9B own the real implementations and composition. The stateful launcher double supports every capability, replay, injected failure, cross-host duplicate names, and evidence assertion.

Authentication claims never cross the wire in `CommandEnvelope`, `RosterCommand`, or ATM payloads. B10A parses and verifies transport credentials, then uses the B2-owned `shpherd-auth` issuer capability to obtain a non-serializable, private-constructor `AuthenticatedPrincipal`; the daemon injects a borrowed `DispatchContext` after checking request identity and scope. Domain/ATM authorization consume only that verified context, and neither depends on daemon. Fixtures reject forged JSON claims, expired principals, team-scope mismatch, confused-deputy ATM calls, principal/request substitution, and service/adaptor attempts to construct an issuer or principal.

Every wire enum uses explicit serde tags, `deny_unknown_fields`, and stable snake-case names. `ResponseOutcome` makes invalid result/error/status combinations unrepresentable. A synchronous request returns exactly one completed/conflict/rejected terminal outcome; durable queued work returns one accepted outcome and exactly one eventual terminal `OperationCompleted`. Replay names the original request and embeds either the same accepted operation or its original terminal outcome; it never reports work as newly executed. Events and resume tokens carry both `DaemonInstanceId` and `StreamId`. An absent resume token starts from `EventCursor::GENESIS` (`0`), the first event is cursor `1`, and `after=0` means no event has been consumed. Cursor `u64::MAX` can be compared/read but emission fails closed with overflow; it never wraps. A daemon restart, stream mismatch, expired cursor, cursor overflow, or cursor from another stream yields `ResyncRequired` and a fresh snapshot rather than cross-stream continuation. Unsupported versions fail before dispatch. `DomainError` maps deterministically to the envelope, CLI exit, and HTTP status.

`OperationJournal` is the service-level adapter: it commits request/idempotency digest and accepted outcome before dispatch, then atomically commits the domain state change, terminal outcome, and pending event before publish. Restart republishes only unmarked events; replay returns the original accepted or terminal outcome, and retention cannot remove an operation while its event is unpublished. B3A owns the lower `OperationJournalStore` DTO/error port, B4A owns its SQLite implementation, and B9A owns the service adapter from `OperationJournal` to that lower port. B10A uses the stateful service double; real composition closes transitively through B9A/B4A. Boundary fixtures prohibit `shpherd-store-sqlite -> shpherd-service` and `shpherd-service -> shpherd-store-sqlite` imports.

## This sprint does not close

No service behavior, launcher adapter, API route, client, heartbeat registration/poll, real readiness composition, or host-local operation persistence.

## Acceptance and validation

- This contract is a prerequisite for the scmux launcher and editor migrations; dispatch validation rejects B3B unless B1 is complete with successful sc-runtime template-installation and baseline-test evidence.
- Named boundary manifests and ADR-SHP-005/011/013/014 fix every full hierarchy/team bundle, roster, query, host, split launcher, guard, authenticated dispatch context, tagged envelope, stream/resume token, error, health/readiness state and dependency input, and double consumed by B5/B6/B7/B8/B9B/B9C/B10A/B12/B12A; B2/ADR-SHP-004 exclusively owns the imported identities, revisions, cursors, and bridge evidence.
- Each owned ADR is approved and contains decision, alternatives, consequences, and executable evidence; the architecture index links it to this sole owner.
- Compile and negative-boundary tests prove service traits are sealed beside their service implementations, independent launcher adapters implement only the allowlisted open ports, guards/principals are unconstructible outside their owner, and mutation is unavailable on the read launcher. Serialization/version/terminal-outcome/replay/restart-resync/auth-escalation and stateful-double contract tests, workspace build, and boundary validation pass. Health goldens cover every required/optional dependency, pending/ready/failed/stale input, deterministic `LiveNotReady`/`Ready`/`Degraded`/`Draining` mapping, and a readiness double that imports no B3C external type. Error-mapping goldens prove every code preserves a typed cause and applicable details (including current revision), supplies actionable recovery, and round-trips without raw causes or secrets. Cursor goldens cover absent token, `after=0`, first event `1`, MAX read, checked overflow, and serde rejection of invalid numeric forms.
- Team-bundle contract goldens cover multiple placements for one Team, two stable draft variant keys, named members with stable ATM bindings on distinct variants, multiple ordered prompts, and distinct branch/backend/runtime bindings. Clone/unlink goldens prove preserved Team references and last-reference cleanup are representable; B5/B9/B11 own execution, launch, query, and UI integration.
- The B3B fixture compiles at the B2 prerequisite commit using only `shpherd-types::foundation` and `shpherd-auth`; imports from B3A/B3C are prohibited.

Every deliverable is production-ready for contract closure.
