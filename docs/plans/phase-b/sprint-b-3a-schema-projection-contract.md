---
id: b-3a-schema-projection-contract
bead: shp-phase-b.15
status: planned
closure_type: contract
target_boundary: schema-projection-contract
requirements: []
adrs: [ADR-SHP-002, ADR-SHP-004]
owned_paths:
  - docs/contracts/storage/**
  - crates/shpherd-schema/src/contracts/**
  - boundaries/shpherd-schema.yaml
  - boundaries/shpherd-store-sqlite.yaml
  - boundaries/shpherd-store-postgres.yaml
  - boundaries/shpherd-store-adaptor.yaml
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

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct TeamKey(String);
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct MemberKey(String);
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct HostKey(String);
#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd, Serialize, Deserialize)]
#[serde(transparent)]
pub struct StoreRevision(u64);
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
    pub team: TeamKey,
    pub launcher: LauncherKind,
    pub repository_binding: String,
    pub atm_team: Option<String>,
    pub eligible_host: Option<HostKey>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedTeamRow {
    pub team: TeamKey,
    pub revision: StoreRevision,
    pub requested_state: RequestedTeamState,
    pub eligible_host: Option<HostKey>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedMemberRow {
    pub team: TeamKey,
    pub member: MemberKey,
    pub revision: StoreRevision,
    pub role: String,
    pub model: Option<String>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SharedAssignmentRow {
    pub team: TeamKey,
    pub host: HostKey,
    pub revision: StoreRevision,
    pub requested_state: RequestedTeamState,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "row_type", content = "row", rename_all = "snake_case")]
pub enum SharedRow { Team(SharedTeamRow), Member(SharedMemberRow), Assignment(SharedAssignmentRow) }

pub trait ProjectionStore {
    fn read_projection(&self, since: StoreRevision) -> Result<ProjectionBatch, StoreError>;
    fn write_projection(&self, batch: ProjectionBatch) -> Result<WriteReceipt, StoreError>;
}

pub enum ProjectionStoreAdapter<Sqlite, Postgres> {
    Sqlite(Sqlite),
    Postgres(Postgres),
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ProjectionBatch {
    pub version: ProjectionVersion,
    pub source: HostKey,
    pub from: StoreRevision,
    pub through: StoreRevision,
    pub rows: Vec<SharedRow>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WriteReceipt { pub through: StoreRevision, pub rows_written: u64 }

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum StoreError {
    UnsupportedVersion { received: ProjectionVersion, supported: ProjectionVersion },
    Conflict { expected: StoreRevision, actual: StoreRevision },
    InvalidBatch { message: String },
    Unavailable { retryable: bool, message: String },
}
```

`SharedRow` is allowlisted and cannot represent paths, terminal handles, logs, credentials, prompts, or mailbox content.
`ProjectionVersion` is serialized as an unsigned integer and every row enum uses an explicit snake-case tag; unknown fields and unsupported versions fail rather than being ignored. `StoreRevision` is monotonic per source host, batches are ordered by `(source, through)`, and conflicts return `StoreError::Conflict` without partial writes.

`ProjectionStore` is intentionally open because the app-owned SQLite and PostgreSQL crates implement it across crate boundaries. `GuardedLauncher` remains sealed in B3B; opening any launcher implementation point requires a later ADR.

## This sprint does not close

No engine, adaptor, reconciliation loop, timer, lease, or route implementation.

## Acceptance and validation

- `boundary:shpherd-schema` and ADR-SHP-002 enumerate every shared field and local-only exclusion.
- Contract tests/doubles compile against the open `ProjectionStore` trait, closed static-adaptor enum, and parity fingerprint; workspace build and boundary validation pass.

Every deliverable is production-ready for contract closure.
