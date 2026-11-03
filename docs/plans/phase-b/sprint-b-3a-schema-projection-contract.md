---
id: b-3a-schema-projection-contract
bead: shp-phase-b.15
status: planned
closure_type: contract
target_boundary: schema-projection-contract
requirements: []
adrs: [ADR-SHP-002, ADR-SHP-012, ADR-SHP-015]
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

- Approve the complete minimum launchable cross-host row allowlist, local-only exclusions, typed entity keys, provenance/tombstones, canonical bytes/digest, versions, conflicts, and reconciliation against the parity fingerprint.
- Fix the storage-row composites, static store, canonical projection batch, explicit lease-operation, and adaptor test-double interfaces used by B4A/B4B/B4C while importing every shared primitive from B2.

## Contract signatures

```rust
use serde::{Deserialize, Serialize};
use shpherd_types::foundation::{ArmadaId, DaemonInstanceId, EntityRevision, FencingToken,
    FleetId, FlotillaId, GitRef, HostId, IdempotencyKey, LogicalConfigRef,
    LogicalProjectRef, OrderedPromptRefs, MemberId, MemberRole, OperationId, ProjectId,
    AtmBinding, LauncherPolicy, RuntimeBackend, StoreCursor, TeamId, ValidParent, VariantId};
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
    pub parent: ValidParent,
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
    Hierarchy(SharedHierarchyRow), Team(SharedTeamRow), Variant(SharedVariantRow),
    Member(SharedMemberRow), Assignment(SharedAssignmentRow), Host(SharedHostEnrollmentRow),
}

pub enum SharedEntityKey {
    Armada(ArmadaId), Fleet(FleetId), Flotilla(FlotillaId), Team(TeamId), Variant(VariantId),
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

pub trait ProjectionStore {
    fn read_projection(&self, source: &HostId, after: StoreCursor, limit: u32) -> Result<Option<ProjectionBatch>, StoreError>;
    fn write_projection(&self, batch: ProjectionBatch) -> Result<WriteReceipt, StoreError>;
    fn cursor_vector(&self) -> Result<CursorVector, StoreError>;
    fn acknowledge(&self, consumer: &HostId, cursor: SourceCursor) -> Result<(), StoreError>;
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

pub struct LocalProjectBindingRow { pub project: ProjectId, pub checkout_path: String, pub allowed_root: String, pub verified_revision: EntityRevision }
pub struct LocalLeaseEvidenceRow { pub team: TeamId, pub variant: VariantId, pub holder_host: HostId, pub holder_daemon: DaemonInstanceId, pub fencing: FencingToken, pub observed_at_unix_ms: u64 }
pub struct LaunchLeaseAuthorityRow { pub team: TeamId, pub variant: VariantId,
    pub holder_host: HostId, pub holder_daemon: DaemonInstanceId,
    pub expires_at_db_ms: u64, pub fencing: FencingToken, pub state: LeaseState }
pub enum LeaseState { Active, Released, Expired, Fenced }
pub struct LeaseHolder { pub host: HostId, pub daemon: DaemonInstanceId }
pub enum LeaseCommand {
    Acquire { team: TeamId, variant: VariantId, host: HostId, daemon: DaemonInstanceId,
        duration_ms: u64, key: IdempotencyKey },
    Renew { team: TeamId, variant: VariantId, expected_host: HostId,
        expected_daemon: DaemonInstanceId, expected_fencing: FencingToken,
        duration_ms: u64, key: IdempotencyKey },
    Release { team: TeamId, variant: VariantId, expected_host: HostId,
        expected_daemon: DaemonInstanceId, expected_fencing: FencingToken, key: IdempotencyKey },
    Transfer { team: TeamId, variant: VariantId, expected_host: HostId,
        expected_daemon: DaemonInstanceId, expected_fencing: FencingToken,
        new_host: HostId, new_daemon: DaemonInstanceId, duration_ms: u64, key: IdempotencyKey },
}
pub struct LeaseReceipt { pub operation: OperationId, pub key: IdempotencyKey,
    pub replayed: bool, pub authoritative_now_db_ms: u64, pub expires_at_db_ms: Option<u64>,
    pub prior_fencing: Option<FencingToken>, pub new_fencing: FencingToken,
    pub prior_holder: Option<LeaseHolder>, pub new_holder: Option<LeaseHolder>, pub state: LeaseState }
pub trait LeaseAuthorityStore {
    fn execute(&self, command: LeaseCommand) -> Result<LeaseReceipt, LeaseError>;
}

pub enum LeaseError { Absent, Expired { current: LaunchLeaseAuthorityRow },
    Released { current: LaunchLeaseAuthorityRow }, Fenced { current: LaunchLeaseAuthorityRow },
    HolderMismatch { current: LaunchLeaseAuthorityRow }, StaleFencing { current: LaunchLeaseAuthorityRow },
    InvalidDuration { minimum_ms: u64, maximum_ms: u64 },
    ReplayMismatch { prior_operation: OperationId }, Unavailable { outcome_unknown: bool, retryable: bool } }

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
    Unavailable { retryable: bool, message: String },
}
```

`SharedRow` is the complete minimum launchable cross-host definition: typed Armada/Fleet/Flotilla placement, Team and Variant identity, logical project plus typed branch/tag/commit ref, launcher policy, immutable ATM binding/provenance, an ordered nonempty prompt-ref list, per-variant backend/runtime binding, member-to-variant identity, assignment/requested state, and enrolled-host facts. It cannot represent resolved checkout/config paths, prompt bodies, terminal handles, logs, credentials, mailbox content, or machine observations. `LocalTeamExtensionRow`, `LocalProjectBindingRow`, and `LocalLeaseEvidenceRow` never enter a projection batch. Only PostgreSQL implements `LeaseAuthorityStore`; SQLite persists local evidence but cannot grant a multi-host lease.

`LogicalConfigRef` is a UTF-8-NFC POSIX-relative path with no empty, `.`/`..`, backslash, drive, scheme, or leading-slash segment. `LogicalPromptRef` is `prompt:<lowercase-slug>@<immutable-revision>` and never contains prompt text. The target host resolves both only beneath its validated `ProjectId` checkout and rejects traversal, missing files, or content that fails the local configuration validator.

Hierarchy parents must match their typed child kind, every Team bundle has at least one Variant, at least one ordered prompt reference, and exactly one captain member. Every member row names an existing variant in the same Team; every variant has a typed backend and nonempty logical runtime binding; an established ATM binding cannot change through an ordinary projection update. Invalid or incomplete bundles reject atomically rather than hydrating a partially launchable Team.

Canonical batch bytes are RFC 8949 deterministic CBOR arrays, never maps. The top-level field order is `[projection_version, source_ulid, from_exclusive, through, mutations]`; each mutation is `[source_cursor, mutation_tag, body]`. Mutation tags are `0=upsert`, `1=delete`; row/key tags are `0=armada`, `1=fleet`, `2=flotilla`, `3=team`, `4=variant`, `5=member`, `6=assignment`, `7=host`.

Row bodies have these exact orders: hierarchy `[typed_id,parent,name,entity_revision]`; team `[team,parent,name,entity_revision,[project,git_ref_tag,git_ref_value],launcher,config_ref,prompt_refs,atm_binding]`; variant `[team,variant,entity_revision,name,eligible_host,config_override,git_ref_override,backend,runtime_binding]`; member `[team,variant,member,entity_revision,role,agent_type,model,requested_host,target_tab]`; assignment `[team,variant,host,entity_revision,requested_state]`; host `[host,daemon,capabilities_hash,healthy_at,entity_revision]`. Keys are `[tag,id...]`, with member key `[5,team,variant,member]`; a delete body is `[key,prior_entity_revision,[source,source_cursor,projection_version],deleted_at]`. Git-ref tags are `0=branch`, `1=tag`, `2=commit`; backend tags are `0=herdr`, `1=tmux`. Parent, launcher, requested-state, member-role, and ATM tags retain their fixed values. Prompt refs preserve vector order and duplicates are rejected. Options use CBOR null/value, IDs use validated canonical text bytes, booleans use CBOR false/true, and strings are UTF-8 NFC. `CanonicalDigest` is SHA-256 over `b"shpherd-projection-v1\0" || canonical_bytes`; `BatchId` is exactly that digest and is rejected if either ID or digest differs. No serializer-specific struct/map ordering is accepted.

`ProjectionVersion` is an unsigned integer and unknown tags/fields or unsupported versions fail rather than being ignored. `EntityRevision` is nonzero and validates optimistic entity state; it is never a stream position. A missing source-vector entry means `StoreCursor::GENESIS` (`0`). An empty read is requested with `from_exclusive=0`; the first accepted mutation is cursor `1`. Batches contain strictly contiguous cursors through `through`; a nonempty batch may not end at genesis, and a producer at `u64::MAX` returns `CursorOverflow` rather than wrapping. Apply is one transaction: all upserts, tombstones, audit evidence, and the source cursor commit together or none do. Replaying the same `BatchId` and digest returns the original receipt; reusing an ID with another digest fails. A gap, conflict, noncanonical encoding, invalid typed key, zero entity revision, cursor overflow, or rejected tombstone advances no cursor.

Deletes are tombstones, never absence inference. Tombstones remain until every enrolled consumer's cursor vector acknowledges them or an approved retention record authorizes compaction. Concurrent incompatible entity revisions reject under the catalog-owner policy; they never last-write-win.

PostgreSQL lease commands use database time and one transaction. Acquire names team/variant/host/daemon/duration/key; renew/release/transfer also require the exact expected host, daemon, and fencing token. Duration must be within the versioned configured minimum/maximum and clients never submit an absolute expiry. PostgreSQL computes authoritative now/expiry, binds every idempotency key to canonical command bytes, and returns the prior receipt on a byte-identical replay. Acquire after absence/expiry and transfer increment fencing; renew preserves fencing; release records a released state. An unknown-outcome retry with the same key either returns the committed receipt or safely executes once. Host clocks cannot grant, renew, transfer, or expire ownership.

`ProjectionStore` is intentionally open because the app-owned SQLite and PostgreSQL crates implement it across crate boundaries. `GuardedLauncher` remains sealed in B3B; opening any launcher implementation point requires a later ADR.

## This sprint does not close

No engine, adaptor, reconciliation loop, timer, lease, or route implementation.

## Acceptance and validation

- `boundary:shpherd-schema` and ADR-SHP-002/012/015 enumerate every shared field, local-only exclusion, cursor/tombstone invariant, lease-authority row, and project-binding separation.
- Contract tests/doubles compile against the open `ProjectionStore`/`LeaseAuthorityStore` traits, closed static-adaptor enum, and parity fingerprint.
- Storage conversion fixtures use only B2 foundation primitives and round-trip every typed parent, member role, variant binding, launcher, prompt list, and shared row without losing aggregate identity or permitting an invalid parent; full service-to-store composition remains B9A-owned.
- Cross-store golden fixtures prove exact canonical bytes/digest/`BatchId`, typed-key rejection, noncanonical encoding rejection, digest mismatch, contiguous source cursors, atomic apply/rollback, replay identity, tombstone prior-revision/provenance, delete propagation/retention/compaction gates, and conflict-without-advance. Constructor/serde fixtures cover zero entity revisions, absent vector entries, empty `from_exclusive=0`, first cursor `1`, MAX cursor read, and checked-advance overflow.
- An empty-target second-host fixture hydrates the entire hierarchy/team/variant/member/assignment/project/launcher/ATM/config/prompt-reference definition and proves B9B can determine eligibility, resolve the local checkout, validate configuration, render the roster, and launch without origin-host local data. Lossless goldens cover two variants, multiple members assigned to distinct variants, multiple ordered prompts, and distinct branch/backend/runtime bindings across hydrate, edit, clone, launch preparation, and UI rendering.
- Lease fixtures prove every tagged operation/error, database-time duration, concurrent acquire/renew/release/transfer, idempotent unknown-outcome retry, monotonically increasing fencing, and SQLite inability to grant ownership; workspace build and boundary validation pass.
- The B3A fixture compiles at its declared prerequisite using only the B2 foundation plus the B3 parity fingerprint; imports from B3B/B3C are prohibited.

Every deliverable is production-ready for contract closure.
