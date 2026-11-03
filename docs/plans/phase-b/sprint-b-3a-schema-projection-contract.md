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

## Deliverables

- Approve row ownership, exclusions, provenance, versions, conflicts, and reconciliation against the parity fingerprint.
- Fix the row/newtype, static store, projection batch, and adaptor test-double interfaces used by B4A/B4B/B4C.

## Contract signatures

```rust
pub struct TeamKey(String);
pub struct HostKey(String);
pub struct StoreRevision(u64);
pub struct ProjectionVersion(u32);
pub struct LocalTeamExtensionRow {
    pub team: TeamKey,
    pub launcher: LauncherKind,
    pub repository_binding: String,
    pub atm_team: Option<String>,
    pub eligible_host: Option<HostKey>,
}
pub struct SharedTeamRow {
    pub team: TeamKey,
    pub revision: StoreRevision,
    pub requested_state: RequestedTeamState,
    pub eligible_host: Option<HostKey>,
}
pub enum SharedRow { Team(SharedTeamRow), Member(SharedMemberRow), Assignment(SharedAssignmentRow) }
pub trait ProjectionStore: sealed::Sealed {
    fn read_projection(&self, since: StoreRevision) -> Result<ProjectionBatch, StoreError>;
    fn write_projection(&self, batch: ProjectionBatch) -> Result<WriteReceipt, StoreError>;
}
pub struct ProjectionBatch {
    pub version: ProjectionVersion,
    pub source: HostKey,
    pub from: StoreRevision,
    pub through: StoreRevision,
    pub rows: Vec<SharedRow>,
}
pub struct WriteReceipt { pub through: StoreRevision, pub rows_written: u64 }
```

`SharedRow` is allowlisted and cannot represent paths, terminal handles, logs, credentials, prompts, or mailbox content.
`ProjectionStore` is intentionally sealed because Phase B supports exactly the SQLite and PostgreSQL engines plus the static adaptor; adding an engine requires a later ADR.

## This sprint does not close

No engine, adaptor, reconciliation loop, timer, lease, or route implementation.

## Acceptance and validation

- `boundary:shpherd-schema` and ADR-SHP-002 enumerate every shared field and local-only exclusion.
- Contract tests/doubles compile against sealed static interfaces and the parity fingerprint; workspace build and boundary validation pass.

Every deliverable is production-ready for contract closure.
