---
id: b-3c-external-integration-contract
bead: shp-phase-b.23
status: planned
closure_type: contract
target_boundary: external-integration-contract
requirements: [ANC-002, ANC-008, ANC-009, ANC-011, ANC-013, ANC-015, REQ-ATM, REQ-LAUNCH]
adrs: [ADR-SHP-003, ADR-SHP-006, ADR-SHP-007, ADR-SHP-009, ADR-SHP-010]
owned_paths:
  - docs/contracts/atm/**
  - docs/contracts/hmux/**
  - docs/contracts/sc-cron/**
  - crates/shpherd-types/src/external/**
  - crates/shpherd-service/src/contracts/atm.rs
  - crates/shpherd-atm/src/contracts/**
  - crates/shpherd-launchers/src/contracts/**
  - crates/shpherd-daemon/src/heartbeat/contracts/**
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

- B3C is scmux external-integration feature-migration work. It cannot begin until B1 has installed the sc-runtime `v0.1.1` template and every B1 baseline test has passed, and B2 must also be closed. If `v0.2.0` is observed, its interrupt is the next Shpherd work started and must complete before this contract starts or resumes.
- Capture versioned ATM projection/verified-principal command fixtures, operation-bound roster-registration evidence, split hmux read/guarded lifecycle and stable member-identity schemas, the single sc-cron ATM-heartbeat callback/error schema, redaction rules, and MCP-disabled decision. ATM catalog data is the authority for actual running-team membership and agent state. ATM and hmux contract identity is host-qualified and never treats team or agent display names as globally unique; fixtures permit identical team and member names concurrently on two hosts.
- Supply simulators/test doubles independently consumed by B6A, B7, and B12.

## Contract schemas

This is an abridged API view; the canonical contract modules carry complete transitive derives/custom serde and compile as fixtures. Potentially blocking ATM, process, and scheduler operations use the workspace object-safe `BoxFuture<'a, T>` convention with `Send` futures. `RuntimeCancellationToken` is the B2-generated runtime cancellation primitive, not a Shpherd-local duplicate.

```rust
use serde::{Deserialize, Serialize};
use shpherd_auth::AuthenticatedPrincipal;
use shpherd_types::foundation::{IdempotencyKey, MemberId, OperationId,
    RosterRegistrationEvidence};

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct AtmRosterRevision(pub String);
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct AtmMemberId(pub String);
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)] #[serde(transparent)] pub struct AtmProjectionVersion(pub u16);
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
pub struct ProcessCallContext { pub deadline: std::time::Instant,
    pub cancel: RuntimeCancellationToken, pub max_output_bytes: usize }
pub fn registration_evidence(result: &AtmMutationResult) -> Result<RosterRegistrationEvidence, AtmAdapterError>;
mod sealed { pub trait Sealed {} }
// Service-owned open roster-authority port; boundary manifest allowlists the independent shpherd-atm adapter.
pub trait AtmRosterAuthority: Send + Sync {
    fn catalog<'a>(&'a self, call: &'a ProcessCallContext, principal: &'a AuthenticatedPrincipal, team: &'a str) -> BoxFuture<'a, Result<AtmCatalogSnapshot, AtmAdapterError>>;
    fn mutate<'a>(&'a self, call: &'a ProcessCallContext, principal: &'a AuthenticatedPrincipal, request: AtmMutationRequest) -> BoxFuture<'a, Result<AtmMutationResult, AtmAdapterError>>;
}
pub enum AtmAdapterError { UnsupportedVersion, FingerprintMismatch, RevisionConflict { current: AtmRosterRevision },
    Unauthorized, DeadlineExceeded { outcome_unknown: bool }, Canceled { outcome_unknown: bool },
    OutputLimitExceeded, ChildCleanupFailed, Unavailable { retryable: bool }, InvalidResponse, RedactionFailure }

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
    pub operation: OperationId, pub idempotency_key: IdempotencyKey }
pub struct HmuxResult { pub reused: bool, pub workspace: String, pub tab: Option<String>,
    pub pane: Option<String>, pub state: String, pub evidence_sha256: String }
pub enum HmuxError { UnsupportedVersion, MissingCapability(HmuxCapability), LocalOperationConflict,
    MissingRegistrationEvidence, StaleRegistrationEvidence { observed: AtmRosterRevision },
    RegistrationDigestMismatch, RuntimeIdentityMismatch, Conflict,
    DeadlineExceeded { outcome_unknown: bool }, Canceled { outcome_unknown: bool },
    OutputLimitExceeded, ChildCleanupFailed, Unavailable { retryable: bool }, InvalidResponse }
pub trait HmuxClient: sealed::Sealed + Send + Sync {
    fn capabilities<'a>(&'a self, call: &'a ProcessCallContext) -> BoxFuture<'a, Result<HmuxCapabilities, HmuxError>>;
    fn read<'a>(&'a self, call: &'a ProcessCallContext, request: HmuxReadRequest) -> BoxFuture<'a, Result<HmuxResult, HmuxError>>;
    fn mutate<'a>(&'a self, call: &'a ProcessCallContext, request: HmuxMutationRequest) -> BoxFuture<'a, Result<HmuxResult, HmuxError>>;
}
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ScCronSource { pub repository: String, pub revision_or_version: String, pub api_version: String }
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HeartbeatId(pub String);
pub struct CronCallbackPayload { pub heartbeat: HeartbeatId, pub run_id: String,
    pub scheduled_at_unix_ms: u64, pub payload: serde_json::Value }
pub struct CronRunResult { pub completed_at_unix_ms: u64, pub evidence_sha256: String }
pub use sc_cron::CancellationToken;
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum CronError { InvalidExpression, RegistrationFailed, CallbackFailed { retryable: bool }, Canceled }
pub trait CronHandler: Send + Sync {
    fn handle<'a>(&'a self, cancel: &'a CancellationToken, payload: CronCallbackPayload) -> BoxFuture<'a, Result<CronRunResult, CronError>>;
}
pub trait HeartbeatRegistrar: sealed::Sealed + Send + Sync {
    fn register_atm_state_heartbeat(&self, expression: String,
        handler: std::sync::Arc<dyn CronHandler>) -> BoxFuture<'_, Result<(), CronError>>;
}
```

Fixtures freeze exact plural ATM commands (`atm teams add-member|update-member|remove-member ... --json` and `atm members --team ... --json`), every hmux lifecycle action, the pinned `ScCronSource`, and the configured heartbeat expression. The callback receives only heartbeat/run metadata and opaque JSON; no ATM team, phase, store trait, or Shpherd row enters the sc-cron boundary.

ATM projection v1 explicitly captures `id/name/role/agent_type/model/host/backend/target/session/alias/target_tab`. `target/session/alias` are sanitized host-local launch references and are excluded from the shared projection and telemetry; credentials, mailbox/inbox data, prompt bodies, absolute checkout paths, process handles, and unknown fields are excluded entirely. The snapshot records source fingerprint and roster revision. Mutation payloads contain no caller claims: B10A parses/verifies transport credentials and exchanges verified identity through the B2 `shpherd-auth` issuer; ATM catalog/mutation methods accept only a borrowed principal plus operation/revision/idempotency data. Successful add/update evidence binds operation/key/team/member, before/after roster revision, exact plural argv, and redacted result digest; `registration_evidence` produces the B2-owned bridge type and is the sole conversion to spawn evidence. Foreign ATM IDs/revisions never deserialize as Shpherd IDs/revisions. Forged claims, scope mismatch, unsupported versions/fingerprints, stale revisions, and unauthorized principals fail before process invocation. The stateful ATM double proves replay, escalation rejection, evidence conversion, and redaction without importing B3B.

hmux capability negotiation rejects unsupported major versions and any requested capability absent from `supported`. Dry-run/observe/focus use `HmuxReadRequest` with no mutation capability. Start/stop/relaunch/repair/spawn/nudge/member-stop/member-reconcile use `HmuxMutationRequest` with a host-local operation ID and idempotency key. Spawn requires `RosterRegistrationEvidence` matching operation/key, ATM team/member, current roster revision, and redacted digest; stale/missing/mismatched evidence fails before process mutation. Member-scoped stop/reconcile require the stable runtime identity and never stop unrelated panes. The stateful double covers crash-after-registration, stale evidence, repeated spawn, remove/reconcile, unrelated-session preservation, reuse, local operation conflicts, retries, and injected failures. sc-cron pins source/API version, uses its pinned public `sc_cron::CancellationToken`, accepts one injected `Arc<dyn CronHandler + Send + Sync>` for the ATM-state heartbeat, and checks cancellation before start, during awaited work, and after callback execution; cancellation is terminal and never converted into success. The callback contract has no launch, roster-mutation, ATM-message, or arbitrary scheduled-action variant.

The daemon process executor enforces per-action deadlines, bounded stdout/stderr capture, streaming redaction before evidence persistence, cancellation propagation, graceful terminate followed by bounded kill escalation, and whole-process-group cleanup. Typed failures distinguish not-started from outcome-unknown mutation. B6A/B7/B8 simulators cover timeout before spawn, cancellation during execution, oversized output, ignored termination, daemon crash/orphan cleanup, and idempotent retry after unknown outcome.

## This sprint does not close

No ATM import/mutation, hmux process call, heartbeat registration, scheduled-action surface, or MCP surface.

## Acceptance and validation

- This contract is a prerequisite for the scmux launcher and ATM-heartbeat integration; dispatch validation rejects B3C unless B1 is complete with successful sc-runtime template-installation and baseline-test evidence.
- `boundary:external-integrations` and ADR-SHP-006/007/009/010 fix projection/command versions, verified-principal-only ATM calls, split read/mutating hmux requests, roster-registration evidence, stable runtime identity, lifecycle capabilities, callback injection, stable failures, ownership, redaction, and fallbacks.
- Each owned ADR is approved and contains decision, alternatives, consequences, and executable evidence; fixtures validate, stateful doubles compile, and workspace/boundary validation pass.
- The B3C fixture compiles at the B2 prerequisite commit using only `shpherd-types::foundation` and `shpherd-auth`; imports from B3A/B3B are prohibited.

Every deliverable is production-ready for contract closure.
