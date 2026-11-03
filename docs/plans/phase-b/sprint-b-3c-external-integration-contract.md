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
  - crates/shpherd-daemon/src/adapters/contracts/**
  - boundaries/external-integrations.yaml
  - docs/adr/ADR-SHP-006.md
  - docs/adr/ADR-SHP-007.md
  - docs/adr/ADR-SHP-009.md
  - docs/adr/ADR-SHP-010.md
relations:
  must_follow:
    - sprint: b-2-integrate-workspace
      artifact: compiled-foundation-types-auth-bridge-and-daemon-adapter-boundary
  parallel_safe: []
recommended_agent: integration-contract-developer
recommended_model: deep-reasoning
---

# B3C — Freeze ATM, hmux, and sc-cron contracts

## Goal

Freeze evidence-backed external integration contracts and stateful doubles before any external process adapter is implemented.

## Required work and deliverables

- Capture versioned ATM projection/verified-principal command fixtures, operation-bound roster-registration evidence, split hmux read/guarded lifecycle and stable member-identity schemas, cron grammar/registry/callback/error schema, redaction rules, and MCP-disabled decision.
- Supply simulators/test doubles independently consumed by B6A, B7, and B12.

## Contract schemas

```rust
use serde::{Deserialize, Serialize};
use shpherd_auth::AuthenticatedPrincipal;
use shpherd_types::foundation::{IdempotencyKey, MemberId, OperationId,
    RosterRegistrationEvidence};

#[serde(transparent)] pub struct AtmRosterRevision(pub String);
#[serde(transparent)] pub struct AtmMemberId(pub String);
#[serde(transparent)] pub struct AtmProjectionVersion(pub u16);
pub struct AtmSourceFingerprint { pub cli_version: String, pub help_sha256: String,
    pub schema_version: String, pub fixture_sha256: String }
pub struct AtmMemberRecord { pub atm_id: AtmMemberId, pub name: String, pub role: String,
    pub agent_type: String, pub model: Option<String>, pub host: Option<String>,
    pub backend: Option<String>, pub target: Option<String>, pub session: Option<String>,
    pub alias: Option<String>, pub target_tab: Option<String> }
pub struct AtmCatalogSnapshot { pub projection: AtmProjectionVersion,
    pub fingerprint: AtmSourceFingerprint, pub revision: AtmRosterRevision,
    pub members: Vec<AtmMemberRecord>, pub excluded_fields: Vec<String> }
pub enum AtmMutation { Add(AtmMemberRecord), Update(AtmMemberRecord), Remove(AtmMemberId) }
pub struct AtmMutationRequest { pub team: String, pub mutation: AtmMutation,
    pub expected: AtmRosterRevision, pub operation: OperationId, pub idempotency_key: IdempotencyKey }
pub struct AtmCommandEvidence { pub operation: OperationId, pub idempotency_key: IdempotencyKey,
    pub team: String, pub member: AtmMemberId, pub plural_command: Vec<String>, pub redacted_stdout_sha256: String,
    pub before: AtmRosterRevision, pub after: AtmRosterRevision, pub replayed: bool }
pub struct AtmMutationResult { pub revision: AtmRosterRevision,
    pub member: Option<AtmMemberRecord>, pub evidence: AtmCommandEvidence }
pub fn registration_evidence(result: &AtmMutationResult) -> Result<RosterRegistrationEvidence, AtmAdapterError>;
mod sealed { pub trait Sealed {} }
pub trait AtmAdapter: sealed::Sealed {
    fn catalog(&self, principal: &AuthenticatedPrincipal, team: &str) -> Result<AtmCatalogSnapshot, AtmAdapterError>;
    fn mutate(&self, principal: &AuthenticatedPrincipal, request: AtmMutationRequest) -> Result<AtmMutationResult, AtmAdapterError>;
}
pub enum AtmAdapterError { UnsupportedVersion, FingerprintMismatch, RevisionConflict { current: AtmRosterRevision },
    Unauthorized, Unavailable { retryable: bool }, InvalidResponse, RedactionFailure }

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SemVer { pub major: u64, pub minor: u64, pub patch: u64 }
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Shell { Bash, PowerShell }
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub enum HmuxCapability { DryRun, Start, Stop, Observe, Focus, Relaunch, Repair,
    DynamicSpawn, Nudge, StopMember, ReconcileMember }
pub struct HmuxCapabilities { pub version: SemVer, pub supported: Vec<HmuxCapability>, pub shells: Vec<Shell> }
pub struct HmuxRuntimeIdentity { pub workspace: String, pub tab: String, pub pane: String,
    pub agent: String }
pub enum HmuxReadAction { DryRun, Observe, Focus }
pub enum HmuxMutation { Start, StopTeam, Relaunch, Repair,
    Spawn { member: AtmMemberRecord, registration: RosterRegistrationEvidence,
        target_tab: Option<String> },
    Nudge { member: AtmMemberId, message: String },
    StopMember { member: MemberId, runtime: HmuxRuntimeIdentity },
    ReconcileMember { member: MemberId, runtime: HmuxRuntimeIdentity } }
pub struct HmuxReadRequest { pub team: String, pub action: HmuxReadAction, pub shell: Option<Shell> }
pub struct HmuxMutationRequest { pub team: String, pub mutation: HmuxMutation, pub shell: Option<Shell>,
    pub lease_fencing: u64, pub idempotency_key: IdempotencyKey }
pub struct HmuxResult { pub reused: bool, pub workspace: String, pub tab: Option<String>,
    pub pane: Option<String>, pub state: String, pub evidence_sha256: String }
pub enum HmuxError { UnsupportedVersion, MissingCapability(HmuxCapability), LeaseRejected,
    MissingRegistrationEvidence, StaleRegistrationEvidence { observed: AtmRosterRevision },
    RegistrationDigestMismatch, RuntimeIdentityMismatch, Conflict,
    Unavailable { retryable: bool }, InvalidResponse }
pub trait HmuxClient: sealed::Sealed {
    fn capabilities(&self) -> Result<HmuxCapabilities, HmuxError>;
    fn read(&self, request: HmuxReadRequest) -> Result<HmuxResult, HmuxError>;
    fn mutate(&self, request: HmuxMutationRequest) -> Result<HmuxResult, HmuxError>;
}
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ScCronSource { pub repository: String, pub revision_or_version: String, pub api_version: String }
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ScheduleId(pub String);
pub struct CronCallbackPayload { pub schedule: ScheduleId, pub run_id: String,
    pub scheduled_at_unix_ms: u64, pub payload: serde_json::Value }
pub struct CronRunResult { pub completed_at_unix_ms: u64, pub evidence_sha256: String }
#[derive(Clone)] pub struct CancellationToken(std::sync::Arc<std::sync::atomic::AtomicBool>);
impl CancellationToken {
    pub fn is_canceled(&self) -> bool { self.0.load(std::sync::atomic::Ordering::Acquire) }
    pub(crate) fn cancel(&self) { self.0.store(true, std::sync::atomic::Ordering::Release) }
}
pub struct ScheduleRecord { pub id: ScheduleId, pub expression: String,
    pub payload: serde_json::Value, pub enabled: bool, pub revision: u64 }
pub struct ScheduleQuery { pub enabled: Option<bool>, pub after: Option<String>, pub limit: u16 }
pub struct SchedulePage { pub items: Vec<ScheduleRecord>, pub next: Option<String> }
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum CronError { InvalidExpression, NotFound, RevisionConflict, CallbackFailed { retryable: bool }, Canceled }
pub trait CronHandler: Send + Sync {
    fn handle(&self, cancel: &CancellationToken, payload: CronCallbackPayload) -> Result<CronRunResult, CronError>;
}
pub trait ScheduleRegistry: sealed::Sealed {
    fn upsert(&self, record: ScheduleRecord, expected: Option<u64>) -> Result<ScheduleRecord, CronError>;
    fn get(&self, id: &ScheduleId) -> Result<ScheduleRecord, CronError>;
    fn list(&self, query: ScheduleQuery) -> Result<SchedulePage, CronError>;
    fn remove(&self, id: &ScheduleId, expected: u64) -> Result<(), CronError>;
    fn register_handler(&self, handler: std::sync::Arc<dyn CronHandler>) -> Result<(), CronError>;
}
```

Fixtures freeze exact plural ATM commands (`atm teams add-member|update-member|remove-member ... --json` and `atm members --team ... --json`), every hmux lifecycle action, the pinned `ScCronSource`, five-field minute-first cron input, and six-field seconds-first compatibility input. The callback receives only schedule/run metadata and opaque JSON; no ATM team, phase, store trait, or Shpherd row enters the sc-cron boundary.

ATM projection v1 explicitly captures `id/name/role/agent_type/model/host/backend/target/session/alias/target_tab`. `target/session/alias` are sanitized host-local launch references and are excluded from the shared projection and telemetry; credentials, mailbox/inbox data, prompt bodies, absolute checkout paths, process handles, and unknown fields are excluded entirely. The snapshot records source fingerprint and roster revision. Mutation payloads contain no caller claims: B10A parses/verifies transport credentials and exchanges verified identity through the B2 `shpherd-auth` issuer; ATM catalog/mutation methods accept only a borrowed principal plus operation/revision/idempotency data. Successful add/update evidence binds operation/key/team/member, before/after roster revision, exact plural argv, and redacted result digest; `registration_evidence` produces the B2-owned bridge type and is the sole conversion to spawn evidence. Foreign ATM IDs/revisions never deserialize as Shpherd IDs/revisions. Forged claims, scope mismatch, unsupported versions/fingerprints, stale revisions, and unauthorized principals fail before process invocation. The stateful ATM double proves replay, escalation rejection, evidence conversion, and redaction without importing B3B.

hmux capability negotiation rejects unsupported major versions and any requested capability absent from `supported`. Dry-run/observe/focus use `HmuxReadRequest` with no fencing and remain available when lease authority is unavailable. Start/stop/relaunch/repair/spawn/nudge/member-stop/member-reconcile use `HmuxMutationRequest` with fencing and idempotency. Spawn requires `RosterRegistrationEvidence` matching operation/key, ATM team/member, current roster revision, and redacted digest; stale/missing/mismatched evidence fails before process mutation. Member-scoped stop/reconcile require the stable runtime identity and never stop unrelated panes. The stateful double covers crash-after-registration, stale evidence, repeated spawn, remove/reconcile, unrelated-session preservation, reuse, stale fencing, retries, and injected failures. sc-cron pins source/API version, accepts an injected `Arc<dyn CronHandler + Send + Sync>`, exposes CRUD plus get/list reads, and checks cancellation before and after callback execution; cancellation is terminal and never converted into success.

## This sprint does not close

No ATM import/mutation, hmux process call, scheduler registration, or MCP surface.

## Acceptance and validation

- `boundary:external-integrations` and ADR-SHP-006/007/009/010 fix projection/command versions, verified-principal-only ATM calls, split read/mutating hmux requests, roster-registration evidence, stable runtime identity, lifecycle capabilities, callback injection, stable failures, ownership, redaction, and fallbacks.
- Each owned ADR is approved and contains decision, alternatives, consequences, and executable evidence; fixtures validate, stateful doubles compile, and workspace/boundary validation pass.
- The B3C fixture compiles at the B2 prerequisite commit using only `shpherd-types::foundation` and `shpherd-auth`; imports from B3A/B3B are prohibited.

Every deliverable is production-ready for contract closure.
