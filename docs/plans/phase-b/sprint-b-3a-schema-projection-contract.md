---
id: b-3a-schema-projection-contract
bead: shp-phase-b.15
status: planned
closure_type: contract
target_boundary: schema-projection-contract
requirements: [ANC-002, ANC-006, ANC-008, ANC-009, ANC-010, ANC-011, ANC-012, ANC-013, REQ-SCHEMA, REQ-SYNC, REQ-LAUNCH]
adrs: [ADR-SHP-002, ADR-SHP-004, ADR-SHP-012, ADR-SHP-013, ADR-SHP-014, ADR-SHP-015]
owned_paths:
  - docs/contracts/storage/**
  - crates/shpherd-schema/src/contracts/**
  - boundaries/shpherd-schema.yaml
  - boundaries/shpherd-store-sqlite.yaml
  - boundaries/shpherd-store-postgres.yaml
  - boundaries/shpherd-store-adaptor.yaml
  - docs/adr/ADR-SHP-002.md
  - docs/adr/ADR-SHP-012.md
  - docs/adr/ADR-SHP-015.md
relations:
  must_follow:
    - sprint: b-3-port-sqlite-parity
      artifact: sqlite-parity-fingerprint
  parallel_safe: [b-3b-service-launch-api-contract, b-3c-external-integration-contract]
recommended_agent: architecture-developer
recommended_model: deep-reasoning
---

# B3A — Freeze schema and projection contracts

## Goal

Freeze the complete storage/projection contract so all three implementation siblings can close independently without interface negotiation.

## Required work and deliverables

- Start only after B1's template installation and baseline tests, B2 integration, and B3's scmux parity fingerprint are complete; this contract is downstream migration work, never a parallel bootstrap.
- If the authoritative release check observes sc-runtime `v0.2.0`, the upgrade interrupt is the next Shpherd work started and completes before B3A starts or resumes; no other newly started work may intervene.
- Treat B3's pinned scmux schema and its complete parity fingerprint as the initial database baseline, documenting every intentional difference before this contract permits any Shpherd or Herdr-specific schema field.
- Approve the host-qualified fleet-view row allowlist, local-only exclusions, typed entity keys, provenance/tombstones, canonical bytes/digest, versions, conflicts, and reconciliation against that parity fingerprint. PostgreSQL is an aggregate read model, not a launch-authority or definition-ownership store.
- Normalize an omitted launcher to `LauncherPolicy::HerdrDefault` before persistence; it must never become tmux or require an operator choice. Preserve `TmuxExplicit` and the tmux backend through projection into launch preparation; contract fixtures prove both selections round-trip without loss, while B7/B8 implement the actual launchers.
- Fix the storage-row composites, static store, canonical projection batch, host report, and adaptor test-double interfaces used by B4A/B4B/B4C while importing every shared primitive from B2.

## Contract signatures

This is an abridged API view. The canonical B3A Rust modules are the compile authority and carry complete transitive derives/custom serde, imports, lifetimes, `Send + Sync` bounds, and typed errors. Async cross-crate ports use the workspace `BoxFuture<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>` convention so sqlx work never blocks an executor thread.

```rust
use serde::{Deserialize, Serialize};
use shpherd_types::foundation::{ArmadaId, CommandDigest, CorrelationId, DaemonInstanceId, DomainRevision,
    EntityRevision, EventCursor, FleetId, FlotillaId, GitRef, HostId, IdempotencyKey, LogicalConfigRef,
    LogicalProjectRef, OrderedPromptRefs, MemberId, MemberRole, OperationId, ProjectId,
    AtmBinding, AtmMemberBinding, LauncherPolicy, RequestId, RosterRegistrationEvidence, RosterRequestDigest, RuntimeBackend, StoreCursor, TeamId,
    TeamPlacementId, ValidParent, VariantId};
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct ProjectionVersion(u32);

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RequestedTeamState { Stopped, Running }

pub struct SharedHierarchyRow { pub id: SharedHierarchyId, pub parent: ValidParent,
    pub name: String, pub revision: EntityRevision }
pub enum SharedHierarchyId { Armada(ArmadaId), Fleet(FleetId), Flotilla(FlotillaId) }

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LocalTeamExtensionRow {
    pub team: TeamId,
    pub project: ProjectId,
    pub resolved_checkout_path: String,
    pub resolved_config_path: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedTeamRow {
    pub team: TeamId,
    pub name: String,
    pub revision: EntityRevision,
    pub project: LogicalProjectRef,
    pub launcher: LauncherPolicy,
    pub config: LogicalConfigRef,
    pub prompts: OrderedPromptRefs,
    pub atm: Option<AtmBinding>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedTeamPlacementRow {
    pub placement: TeamPlacementId,
    pub team: TeamId,
    pub parent: ValidParent,
    pub revision: EntityRevision,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedVariantRow {
    pub team: TeamId,
    pub variant: VariantId,
    pub revision: EntityRevision,
    pub name: String,
    pub eligible_host: Option<HostId>,
    pub config_override: Option<LogicalConfigRef>,
    pub git_ref_override: Option<GitRef>,
    pub backend: RuntimeBackend,
    pub runtime_binding: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedMemberRow {
    pub team: TeamId,
    pub variant: VariantId,
    pub member: MemberId,
    pub revision: EntityRevision,
    pub name: String,
    pub atm_member: Option<AtmMemberBinding>,
    pub role: MemberRole,
    pub agent_type: String,
    pub model: Option<String>,
    pub requested_host: Option<HostId>,
    pub target_tab: Option<String>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedAssignmentRow {
    pub team: TeamId,
    pub variant: VariantId,
    pub host: HostId,
    pub revision: EntityRevision,
    pub requested_state: RequestedTeamState,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedHostEnrollmentRow { pub host: HostId, pub daemon: DaemonInstanceId, pub capabilities_hash: String, pub healthy_at_unix_ms: u64, pub revision: EntityRevision }

pub enum SharedRow {
    Hierarchy(SharedHierarchyRow), Team(SharedTeamRow), TeamPlacement(SharedTeamPlacementRow), Variant(SharedVariantRow),
    Member(SharedMemberRow), Assignment(SharedAssignmentRow), Host(SharedHostEnrollmentRow),
}

pub enum SharedEntityKey {
    Armada(ArmadaId), Fleet(FleetId), Flotilla(FlotillaId), Team(TeamId), Variant(VariantId),
    TeamPlacement(TeamPlacementId),
    Member { team: TeamId, variant: VariantId, member: MemberId },
    Assignment { team: TeamId, variant: VariantId, host: HostId }, Host(HostId),
}

pub struct SourceCursor { pub source: HostId, pub position: StoreCursor }
pub struct CursorVector { pub cursors: std::collections::BTreeMap<HostId, StoreCursor> }
pub struct RowProvenance { pub source: HostId, pub source_cursor: StoreCursor,
    pub projection_version: ProjectionVersion }
pub struct Tombstone { pub key: SharedEntityKey, pub prior_revision: EntityRevision,
    pub provenance: RowProvenance, pub deleted_at_unix_ms: u64 }
pub enum RowMutation { Upsert(SharedRow), Delete(Tombstone) }
pub struct VersionedMutation { pub cursor: StoreCursor, pub mutation: RowMutation }
pub struct CanonicalDigest([u8; 32]);
pub struct BatchId(CanonicalDigest);

pub trait ProjectionStore: Send + Sync {
    fn read_projection<'a>(&'a self, source: &'a HostId, after: StoreCursor, limit: u32) -> BoxFuture<'a, Result<Option<ProjectionBatch>, StoreError>>;
    fn write_projection(&self, batch: ProjectionBatch) -> BoxFuture<'_, Result<WriteReceipt, StoreError>>;
    fn cursor_vector(&self) -> BoxFuture<'_, Result<CursorVector, StoreError>>;
    fn acknowledge<'a>(&'a self, consumer: &'a HostId, cursor: SourceCursor) -> BoxFuture<'a, Result<(), StoreError>>;
}

pub enum ProjectionStoreAdapter<Sqlite, Postgres> {
    Sqlite(Sqlite),
    Postgres(Postgres),
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ProjectionBatch {
    pub batch_id: BatchId,
    pub version: ProjectionVersion,
    pub source: HostId,
    pub from_exclusive: StoreCursor,
    pub through: StoreCursor,
    pub mutations: Vec<VersionedMutation>,
    pub digest: CanonicalDigest,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WriteReceipt { pub batch_id: BatchId, pub cursor: SourceCursor, pub rows_written: u64, pub replayed: bool }

pub enum DefinitionStoreQuery {
    Entity(SharedEntityKey), Children(ValidParent), TeamBundle(TeamId),
    Page { after: Option<SharedEntityKey>, limit: u16 },
}
pub struct DefinitionStoreSnapshot { pub rows: Vec<SharedRow>, pub revision: EntityRevision }
pub enum DefinitionStoreMutation { Upsert(SharedRow), Delete { key: SharedEntityKey, expected: EntityRevision } }
pub struct DefinitionStoreCommit { pub expected: Vec<(SharedEntityKey, EntityRevision)>,
    pub mutations: Vec<DefinitionStoreMutation>, pub key: IdempotencyKey }
pub struct DefinitionStoreReceipt { pub revision: EntityRevision, pub replayed: bool }
pub trait DefinitionStore: Send + Sync {
    fn read(&self, query: DefinitionStoreQuery) -> BoxFuture<'_, Result<DefinitionStoreSnapshot, StoreError>>;
    fn commit(&self, batch: DefinitionStoreCommit) -> BoxFuture<'_, Result<DefinitionStoreReceipt, StoreError>>;
}

pub struct LocalProjectBindingRow { pub project: ProjectId, pub checkout_path: String, pub allowed_root: String, pub verified_revision: EntityRevision }
pub struct LocalLaunchOperationRow { pub operation: OperationId, pub team: TeamId, pub variant: VariantId,
    pub host: HostId, pub key: IdempotencyKey, pub command_digest: CommandDigest,
    pub state: OperationJournalState, pub observed_at_unix_ms: u64 }
pub enum RosterExpansionStage { IntentPersisted, RosterRegistered, RegisteredNotRunning,
    Launching, Running, RemovalPending, ReconciliationRequired, Reconciled, Failed }
pub struct LocalRosterExpansionRow { pub operation: OperationId, pub key: IdempotencyKey,
    pub team: TeamId, pub member: MemberId, pub expected_revision: DomainRevision,
    pub canonical_intent_cbor: Vec<u8>, pub request_digest: RosterRequestDigest,
    pub stage: RosterExpansionStage,
    pub registration: Option<RosterRegistrationEvidence>, pub last_error_code: Option<String>,
    pub revision: EntityRevision }
pub enum OperationJournalState { Accepted, Running, Terminal }
pub struct LocalOperationJournalRow { pub request: RequestId, pub correlation: CorrelationId,
    pub operation: OperationId, pub key: Option<IdempotencyKey>, pub command_digest: CommandDigest,
    pub state: OperationJournalState, pub accepted_outcome_cbor: Vec<u8>,
    pub terminal_outcome_cbor: Option<Vec<u8>>, pub event_cbor: Option<Vec<u8>>,
    pub event_cursor: Option<EventCursor>, pub event_published: bool,
    pub created_at_unix_ms: u64, pub updated_at_unix_ms: u64, pub revision: EntityRevision }
pub trait OperationJournalStore: Send + Sync {
    fn insert_accepted(&self, row: LocalOperationJournalRow) -> BoxFuture<'_, Result<LocalOperationJournalRow, StoreError>>;
    fn commit_terminal(&self, row: LocalOperationJournalRow) -> BoxFuture<'_, Result<LocalOperationJournalRow, StoreError>>;
    fn pending_publication(&self, limit: u16) -> BoxFuture<'_, Result<Vec<LocalOperationJournalRow>, StoreError>>;
    fn mark_published(&self, operation: OperationId, expected: EntityRevision) -> BoxFuture<'_, Result<(), StoreError>>;
}
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum StoreError {
    UnsupportedVersion { received: ProjectionVersion, supported: ProjectionVersion },
    Conflict { key: SharedEntityKey, source: HostId, expected: EntityRevision, actual: EntityRevision },
    CursorGap { source: HostId, expected_next: StoreCursor, received: StoreCursor },
    CursorOverflow { source: HostId },
    InvalidEntityKey,
    NonCanonicalEncoding,
    BatchDigestMismatch,
    InvalidBatch { message: String },
    PoolSaturated { retry_after_ms: Option<u64> },
    Timeout { stage: StoreTimeoutStage, outcome_unknown: bool },
    Canceled { stage: StoreTimeoutStage, outcome_unknown: bool },
    Unavailable { retryable: bool, message: String },
}
pub enum StoreTimeoutStage { Connect, Acquire, Statement, TransactionCommit }
pub struct SqliteRuntimeConfig { pub read_connections: std::num::NonZeroU16,
    pub acquire_timeout_ms: std::num::NonZeroU64, pub busy_timeout_ms: std::num::NonZeroU64,
    pub statement_timeout_ms: std::num::NonZeroU64, pub transaction_timeout_ms: std::num::NonZeroU64,
    pub idle_lifetime_ms: std::num::NonZeroU64 }
pub struct PostgresRuntimeConfig { pub max_connections: std::num::NonZeroU16,
    pub connect_timeout_ms: std::num::NonZeroU64, pub acquire_timeout_ms: std::num::NonZeroU64,
    pub statement_timeout_ms: std::num::NonZeroU64, pub transaction_timeout_ms: std::num::NonZeroU64,
    pub idle_lifetime_ms: std::num::NonZeroU64, pub max_lifetime_ms: std::num::NonZeroU64 }
```

`SharedRow` is the allowlisted host report for the fleet view: typed Armada/Fleet/Flotilla containers, stable Team identity, explicit reference placements, Team and Variant identity, logical project plus typed branch/tag/commit ref, launcher policy, immutable ATM binding/provenance, an ordered nonempty prompt-ref list, per-variant backend/runtime binding, member name and stable ATM member binding, member-to-variant identity, requested state, and enrolled-host facts. Every PostgreSQL identity is qualified by `RowProvenance.source`; identical team and agent names on different hosts remain distinct fleet instances. It cannot represent resolved checkout/config paths, prompt bodies, terminal handles, logs, credentials, or mailbox content. ATM-observed state is the actual running-state fact; a Shpherd requested state is only a local definition preference. `DefinitionStore` is the only app-owned durable local definition seam: B4A implements its atomic typed read/commit contract in SQLite, B5 receives commit capability, and B6 receives read capability through static composition. `LocalTeamExtensionRow`, `LocalProjectBindingRow`, `LocalLaunchOperationRow`, `LocalRosterExpansionRow`, and `LocalOperationJournalRow` never enter a projection batch. The roster row persists canonical intent bytes/digest and expected revision before ATM mutation, enabling autonomous restart and mismatch detection. The general journal atomically binds accepted work, a domain-separated `CommandDigest`, terminal outcome, and exactly-once event publication state for B10A replay/restart semantics. B4A owns the transactional SQLite implementations and retention tests. PostgreSQL exposes no launch-authority operation.

`LogicalConfigRef` is a UTF-8-NFC POSIX-relative path with no empty, `.`/`..`, backslash, drive, scheme, or leading-slash segment. `LogicalPromptRef` is `prompt:<lowercase-slug>@<immutable-revision>` and never contains prompt text. The target host resolves both only beneath its validated `ProjectId` checkout and rejects traversal, missing files, or content that fails the local configuration validator.

Hierarchy parents must match their typed child kind, every Team bundle has at least one Variant, at least one ordered prompt reference, and exactly one captain member. Every member row names an existing variant in the same Team; every variant has a typed backend and nonempty logical runtime binding; an established ATM binding cannot change through an ordinary projection update. Invalid or incomplete bundles reject atomically rather than hydrating a partially launchable Team.

Canonical batch bytes are RFC 8949 deterministic CBOR arrays, never maps. The top-level field order is `[projection_version, source_ulid, from_exclusive, through, mutations]`; each mutation is `[source_cursor, mutation_tag, body]`. Mutation tags are `0=upsert`, `1=delete`; row/key tags are `0=armada`, `1=fleet`, `2=flotilla`, `3=team`, `4=variant`, `5=member`, `6=assignment`, `7=host`, `8=team_placement`.

Row bodies have these exact orders: hierarchy `[typed_id,parent,name,entity_revision]`; team `[team,name,entity_revision,[project,git_ref_tag,git_ref_value],launcher,config_ref,prompt_refs,atm_binding]`; team placement `[placement,team,parent,entity_revision]`; variant `[team,variant,entity_revision,name,eligible_host,config_override,git_ref_override,backend,runtime_binding]`; member `[team,variant,member,entity_revision,name,atm_member,role,agent_type,model,requested_host,target_tab]`; assignment `[team,variant,host,entity_revision,requested_state]`; host `[host,daemon,capabilities_hash,healthy_at,entity_revision]`. Keys are `[tag,id...]`, with member key `[5,team,variant,member]` and placement key `[8,placement]`; a delete body is `[key,prior_entity_revision,[source,source_cursor,projection_version],deleted_at]`. Git-ref tags are `0=branch`, `1=tag`, `2=commit`; backend tags are `0=herdr`, `1=tmux`. Parent, launcher, requested-state, member-role, and ATM tags retain their fixed values. Prompt refs preserve vector order and duplicates are rejected. Options use CBOR null/value, IDs use validated canonical text bytes, booleans use CBOR false/true, and strings are UTF-8 NFC. `CanonicalDigest` is SHA-256 over `b"shpherd-projection-v1\0" || canonical_bytes`; `BatchId` is exactly that digest and is rejected if either ID or digest differs. No serializer-specific struct/map ordering is accepted.

`ProjectionVersion` is an unsigned integer and unknown tags/fields or unsupported versions fail rather than being ignored. `EntityRevision` is nonzero and validates optimistic entity state; it is never a stream position. A missing source-vector entry means `StoreCursor::GENESIS` (`0`). An empty read is requested with `from_exclusive=0`; the first accepted mutation is cursor `1`. Batches contain strictly contiguous cursors through `through`; a nonempty batch may not end at genesis, and a producer at `u64::MAX` returns `CursorOverflow` rather than wrapping. Apply is one transaction: all upserts, tombstones, audit evidence, and the source cursor commit together or none do. Replaying the same `BatchId` and digest returns the original receipt; reusing an ID with another digest fails. A gap, conflict, noncanonical encoding, invalid typed key, zero entity revision, cursor overflow, or rejected tombstone advances no cursor.

Deletes are tombstones, never absence inference. Phase B retains every tombstone indefinitely in both stores: consumer acknowledgement advances source vectors but never authorizes tombstone removal, and no Phase B contract exposes a tombstone-removal operation. Concurrent incompatible entity revisions reject under the catalog-owner policy; they never last-write-win.

`DefinitionStore` and `ProjectionStore` are intentionally open cross-crate storage ports. Boundary manifests permit `DefinitionStore` production implementation only in `shpherd-store-sqlite`, consumption only inside `shpherd-service` B5/B6 composition, and contract doubles only in tests; compile-fail fixtures reject every other implementation or dependent edge. B9B cannot consume `DefinitionStore` directly and instead receives B6's sealed read-only `LaunchPreparationReader`. Projection manifests permit only the app-owned SQLite/PostgreSQL implementations and contract doubles. No PostgreSQL port grants a launch capability, transfers ownership, or enforces a global name constraint. B3B separately defines independent launcher adapter ports with host-local mutation guards.

## This sprint does not close

No engine, adaptor, reconciliation loop, timer, launch guard, or route implementation.

## Acceptance and validation

- B3A sets the storage-contract prerequisites for scmux schema and feature migration; dispatch validation rejects it unless B1 is complete with successful sc-runtime template-installation and baseline-test evidence.
- `boundary:shpherd-schema` and ADR-SHP-002/012/015 enumerate every fleet-view field, local-only exclusion, source-host/cursor/tombstone invariant, and project-binding separation while explicitly exposing no launch-authority row.
- Contract tests/doubles compile against the open `DefinitionStore`/`ProjectionStore` traits, closed static-adaptor enum, and parity fingerprint. Boundary manifests allow only the declared DefinitionStore implementation/B5-B6 consumer/test-double edges and compile-fail every other implementation or consumer, including direct B9B access.
- Storage conversion fixtures use only B2 foundation primitives and round-trip every typed parent, member role, variant binding, launcher, prompt list, and shared row without losing aggregate identity or permitting an invalid parent. B9A owns projection synchronization; B9B owns the service-level operation-journal adapter and host-local launch composition, while B5/B6 own definition write/read composition.
- Cross-store contract goldens prove exact canonical bytes/digest/`BatchId`, typed-key rejection, noncanonical encoding rejection, digest mismatch, contiguous source cursors, replay identity, tombstone prior-revision/provenance, indefinite Phase B retention across consumer acknowledgement and offline-host replay, and conflict-without-advance. Constructor/serde fixtures cover zero entity revisions, absent vector entries, empty `from_exclusive=0`, first cursor `1`, MAX cursor read, and checked-advance overflow; transactional apply/rollback remains B4/B9A-owned.
- Runtime-config constructors reject zero/unbounded pool sizes and invalid timeout/lifetime relationships. Store contracts propagate cancellation and distinguish connect/acquire/statement/commit timeout, pool saturation, and outcome-unknown commit without leaking engine errors.
- Empty-target contract doubles round-trip the hierarchy, Team reference placements, variants, named members and ATM member bindings, assignments, project, launcher, ATM/config/prompt references without local-only data. Definition-store doubles prove atomic expected-revision commit, rollback, idempotent replay, aligned bundle reads, pagination, and separation of read from commit capability. Goldens prove one Team may be referenced from two cloned containers, unlink targets one placement, and the last-reference rule is representable; B4/B5/B9/B11 own execution and UI behavior.
- Fleet projection fixtures prove two hosts can publish the same team and agent names as distinct host-qualified rows, and static checks prove PostgreSQL exposes no launch lease, ownership-transfer, or global-uniqueness API. Workspace build and boundary validation pass.
- The B3A fixture compiles at its declared prerequisite using only the B2 foundation plus the B3 parity fingerprint; imports from B3B/B3C are prohibited.

Every deliverable is production-ready for contract closure.
