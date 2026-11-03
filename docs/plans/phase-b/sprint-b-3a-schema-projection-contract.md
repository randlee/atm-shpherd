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

- Approve row ownership, exclusions, provenance, versions, conflicts, and reconciliation against the parity fingerprint.
- Fix the row/newtype, static store, projection batch, and adaptor test-double interfaces used by B4A/B4B/B4C.

## Contract signatures

```rust
use serde::{Deserialize, Serialize};
use shpherd_types::{DaemonInstanceId, FencingToken, HostId, MemberId, ProjectId, StoreRevision, TeamId, VariantId};
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct ProjectionVersion(u32);

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LauncherKind { Herdr, Tmux }

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RequestedTeamState { Stopped, Running }

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LocalTeamExtensionRow {
    pub team: TeamId,
    pub launcher: LauncherKind,
    pub project: ProjectId,
    pub atm_team: Option<String>,
    pub eligible_host: Option<HostId>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedTeamRow {
    pub team: TeamId,
    pub revision: StoreRevision,
    pub requested_state: RequestedTeamState,
    pub eligible_host: Option<HostId>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedMemberRow {
    pub team: TeamId,
    pub member: MemberId,
    pub revision: StoreRevision,
    pub role: String,
    pub model: Option<String>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedAssignmentRow {
    pub team: TeamId,
    pub variant: VariantId,
    pub host: HostId,
    pub revision: StoreRevision,
    pub requested_state: RequestedTeamState,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedHostEnrollmentRow { pub host: HostId, pub daemon: DaemonInstanceId, pub capabilities_hash: String, pub healthy_at_unix_ms: u64, pub revision: StoreRevision }

pub enum SharedRow { Team(SharedTeamRow), Member(SharedMemberRow), Assignment(SharedAssignmentRow), Host(SharedHostEnrollmentRow) }

pub struct SourceCursor { pub source: HostId, pub revision: StoreRevision }
pub struct CursorVector { pub cursors: std::collections::BTreeMap<HostId, StoreRevision> }
pub struct Tombstone { pub source: HostId, pub entity_kind: String, pub entity_id: String, pub revision: StoreRevision, pub deleted_at_unix_ms: u64 }
pub enum RowMutation { Upsert(SharedRow), Delete(Tombstone) }
pub struct VersionedMutation { pub revision: StoreRevision, pub mutation: RowMutation }
pub struct BatchId(String);

pub trait ProjectionStore {
    fn read_projection(&self, source: &HostId, after: StoreRevision, limit: u32) -> Result<Option<ProjectionBatch>, StoreError>;
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
    pub from_exclusive: StoreRevision,
    pub through: StoreRevision,
    pub mutations: Vec<VersionedMutation>,
    pub content_hash: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WriteReceipt { pub batch_id: BatchId, pub cursor: SourceCursor, pub rows_written: u64, pub replayed: bool }

pub struct LocalProjectBindingRow { pub project: ProjectId, pub checkout_path: String, pub allowed_root: String, pub verified_revision: StoreRevision }
pub struct LocalLeaseEvidenceRow { pub team: TeamId, pub variant: VariantId, pub holder_host: HostId, pub holder_daemon: DaemonInstanceId, pub fencing: FencingToken, pub observed_at_unix_ms: u64 }
pub struct LaunchLeaseAuthorityRow { pub team: TeamId, pub variant: VariantId, pub holder: HostId, pub daemon: DaemonInstanceId, pub expires_at_db_ms: u64, pub fencing: FencingToken }
pub struct LeaseCas { pub expected_holder: Option<DaemonInstanceId>, pub expected_fencing: Option<FencingToken>, pub replacement: LaunchLeaseAuthorityRow }
pub trait LeaseAuthorityStore {
    fn compare_and_swap(&self, request: LeaseCas) -> Result<LaunchLeaseAuthorityRow, StoreError>;
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum StoreError {
    UnsupportedVersion { received: ProjectionVersion, supported: ProjectionVersion },
    Conflict { source: HostId, expected: StoreRevision, actual: StoreRevision },
    CursorGap { source: HostId, expected_next: StoreRevision, received: StoreRevision },
    BatchHashMismatch,
    InvalidBatch { message: String },
    Unavailable { retryable: bool, message: String },
}
```

`SharedRow` is allowlisted and cannot represent checkout paths, terminal handles, logs, credentials, prompts, or mailbox content. `LocalProjectBindingRow` and `LocalLeaseEvidenceRow` never enter a projection batch. Only PostgreSQL implements `LeaseAuthorityStore`; SQLite persists local evidence but cannot grant a multi-host lease.

`ProjectionVersion` is serialized as an unsigned integer and every row/mutation enum uses an explicit snake-case tag; unknown fields and unsupported versions fail rather than being ignored. `StoreRevision` is monotonic independently for each source. A batch must start at the stored source cursor plus one, contain contiguous mutations through `through`, and match its content hash. Apply is one transaction: all upserts, tombstones, audit evidence, and the source cursor commit together or none do. Replaying the same `BatchId` and hash returns the original receipt; reusing an ID with another hash fails. A gap, conflict, or rejected tombstone advances no cursor.

Deletes are tombstones, never absence inference. Tombstones remain until every enrolled consumer's cursor vector acknowledges them or an approved retention record authorizes compaction. Concurrent incompatible entity revisions reject under the catalog-owner policy; they never last-write-win.

PostgreSQL lease CAS uses database time. Acquire after absence/expiry or explicit transfer increments fencing; renew/release require exact holder daemon and fencing token. Host clocks cannot grant, renew, or expire ownership.

`ProjectionStore` is intentionally open because the app-owned SQLite and PostgreSQL crates implement it across crate boundaries. `GuardedLauncher` remains sealed in B3B; opening any launcher implementation point requires a later ADR.

## This sprint does not close

No engine, adaptor, reconciliation loop, timer, lease, or route implementation.

## Acceptance and validation

- `boundary:shpherd-schema` and ADR-SHP-002/012/015 enumerate every shared field, local-only exclusion, cursor/tombstone invariant, lease-authority row, and project-binding separation.
- Contract tests/doubles compile against the open `ProjectionStore`/`LeaseAuthorityStore` traits, closed static-adaptor enum, and parity fingerprint.
- Fixtures prove contiguous source cursors, atomic apply/rollback, replay identity/hash mismatch, delete propagation/compaction gate, conflict-without-advance, PostgreSQL database-time CAS, monotonically increasing fencing, and SQLite inability to grant ownership; workspace build and boundary validation pass.

Every deliverable is production-ready for contract closure.
