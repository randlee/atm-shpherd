---
id: b-2-integrate-workspace
bead: shp-phase-b.2
status: planned
closure_type: contract
target_boundary: generated-workspace
requirements: []
adrs: [ADR-SHP-001, ADR-SHP-003, ADR-SHP-004, ADR-SHP-008]
owned_paths:
  - Cargo.toml
  - Cargo.lock
  - crates/*/Cargo.toml
  - crates/*/src/lib.rs
  - boundaries/index.yaml
  - boundaries/_schema/**
  - clients/package.json
  - clients/pnpm-lock.yaml
  - clients/src/platform/shell/**
  - .sc-lint/**
  - crates/*/README.md
  - docs/testing-and-platforms.md
  - docs/issues-inventory.md
  - docs/architecture.md
  - docs/adr/README.md
  - docs/adr/ADR-SHP-001.md
  - docs/adr/ADR-SHP-003.md
  - docs/adr/ADR-SHP-004.md
  - docs/adr/ADR-SHP-008.md
  - tools/runtime-release-gate/**
  - tests/governance/runtime-release-gate/**
  - .github/workflows/runtime-release-gate.yml
  - docs/evidence/runtime-release-gate/history.jsonl
  - crates/shpherd-types/src/foundation/**
  - crates/shpherd-types/tests/foundation_contract.rs
  - crates/shpherd-auth/**
  - tests/compile-fail/foundation-contract/**
relations:
  must_follow:
    - sprint: b-1-generate-baseline
      artifact: proven-generated-tree-digest
  parallel_safe: []
recommended_agent: rust-integration-developer
recommended_model: workhorse
---

# B2 — Integrate the generated workspace

## Goal

Establish one buildable generated Shpherd workspace without losing the recovered product assets or crossing the sc-runtime boundary.

## Required work and deliverables

- Reconcile the proven generated workspace with existing PRD, oracle, browser/Tauri client, tests, and history without wholesale replacement.
- Establish app-named crates, binaries `shpherd`/`atm-shpherd`, bundle id `com.synapticcanvas.shpherd`, `.shpherd/` runtime paths, and machine-readable boundary manifests.
- Remove generated widget/general-database production commands; retain only named Shpherd surfaces.
- Preserve desktop icon/window/tray/deep-link/notification scaffolding and pin `@synaptic-canvas/sc-observability` with a nonthrowing browser/no-op adapter.
- Seed each app crate README with its responsibility, allowed dependencies, prohibited policy, and boundary-manifest link; retain the shared Phase B platform/test matrix.
- Maintain the deterministic Phase B child/sprint inventory classification and bijection check in `docs/issues-inventory.md`.
- Install the always-executed sc-runtime release governance boundary before feature dispatch: authoritative detector, append-only hash-chained history, serialized dispatch hook, and B13/epic-close validator under the exact owned paths above.
- Freeze the app-owned foundation consumed by B3A/B3B/B3C: canonical IDs, nonzero entity revisions, genesis-capable cursors, logical references, launcher/member primitives, cross-adapter registration evidence, and the verification-independent authorization capability. This foundation lands and compiles before any contract sprint dispatches.
- Keep credential parsing and transport extraction in `shpherd-daemon`; place policy evaluation and the non-serializable authorized principal in lower `shpherd-auth`, which both daemon composition and `shpherd-service` may depend on without a dependency cycle.

`tools/runtime-release-gate/check` queries the authoritative sc-runtime release/tag source and records checked timestamp, tag/absence, immutable release/asset digest, repository commit, previous-entry hash, and decision. `tools/runtime-release-gate/dispatch <bead>` takes one repository lock, rechecks, atomically appends history, and refuses non-interrupt feature dispatch after 0.2.0 appears. `tools/runtime-release-gate/validate-close` rechecks and refuses B13 or epic closure unless history is intact and either the release is absent at cutoff or the interrupt evidence binds the observed release digest. Detection/network/parse/history/lock failures fail closed.

```rust
// crates/shpherd-types/src/foundation/identity.rs
id_newtype!(ArmadaId); id_newtype!(FleetId); id_newtype!(FlotillaId); id_newtype!(TeamId);
id_newtype!(VariantId); id_newtype!(MemberId); id_newtype!(HostId); id_newtype!(ProjectId);
id_newtype!(DaemonInstanceId); id_newtype!(StreamId); id_newtype!(DiscoveryId);
request_newtype!(RequestId); request_newtype!(CorrelationId); request_newtype!(OperationId);

// Entity revisions start at one. Zero and overflowed construction/serde fail.
pub struct DomainRevision(std::num::NonZeroU64);
pub struct EntityRevision(std::num::NonZeroU64);
pub struct FencingToken(std::num::NonZeroU64);
pub struct IdempotencyKey(String); // 16..=128 ASCII token, no whitespace/control bytes
// Stream positions have a real genesis position zero; MAX is readable but cannot advance.
pub struct StoreCursor(u64);
pub struct EventCursor(u64);
impl StoreCursor { pub const GENESIS: Self = Self(0); pub fn checked_next(self) -> Result<Self, CursorOverflow>; }
impl EventCursor { pub const GENESIS: Self = Self(0); pub fn checked_next(self) -> Result<Self, CursorOverflow>; }

pub struct VariantDraftKey(String); // NFC slug, unique and stable within one TeamDraft/TeamPatch
pub enum MemberRole { Captain, Named(String) }
pub enum RuntimeBackend { Herdr, Tmux }
pub enum LauncherPolicy { HerdrDefault, TmuxExplicit }
pub enum ValidParent { ArmadaRoot, FleetInArmada(ArmadaId), FlotillaInFleet(FleetId),
    TeamInFleet(FleetId), TeamInFlotilla(FlotillaId) }
pub enum TeamParent { Fleet(FleetId), Flotilla(FlotillaId) }
pub struct LogicalConfigRef(String);
pub struct LogicalPromptRef(String);
pub struct OrderedPromptRefs(Vec<LogicalPromptRef>); // TryFrom rejects empty or duplicate refs
pub enum GitRef { Branch(String), Tag(String), Commit(String) }
pub struct LogicalProjectRef { pub project: ProjectId, pub git_ref: GitRef }
pub struct AtmBinding { pub team: String, pub source_fingerprint: String,
    pub bound_revision: String }
pub struct RosterRegistrationEvidence { pub operation: OperationId, pub key: IdempotencyKey,
    pub atm_team: String, pub atm_member: String, pub roster_revision: String,
    pub redacted_result_digest: String }

// crates/shpherd-auth: no serde derives; all fields and constructors are private.
pub struct AuthenticatedPrincipal { /* subject, roles, scopes, expiry, audit source */ }
#[cfg(feature = "issuer")]
pub struct VerifiedIdentity { /* daemon-produced verified identity, no raw credential */ }
#[cfg(feature = "issuer")]
pub struct AuthorizationIssuer { /* non-clone policy capability held only by composition */ }
#[cfg(feature = "issuer")]
pub struct AuthorizationPolicy { pub policy_version: String, pub rules_digest: String }
#[cfg(feature = "issuer")]
pub struct VerificationEvidence { pub verifier: String, pub evidence_digest: String }
pub enum AuthorizationError { InvalidPolicy, InvalidEvidence, Expired, Unauthorized }
#[cfg(feature = "issuer")]
pub fn authorization_boundary(policy: AuthorizationPolicy)
    -> Result<AuthorizationIssuer, AuthorizationError>;
#[cfg(feature = "issuer")]
impl VerifiedIdentity {
    pub fn from_verified_transport(subject: String, roles: Vec<String>,
        scopes: Vec<String>, verifier_evidence: VerificationEvidence,
        expires_at_unix_ms: u64) -> Result<Self, AuthorizationError>;
}
#[cfg(feature = "issuer")]
impl AuthorizationIssuer {
    pub fn authorize(&self, identity: VerifiedIdentity, now_unix_ms: u64)
        -> Result<AuthenticatedPrincipal, AuthorizationError>;
}
impl AuthenticatedPrincipal {
    pub fn permits(&self, action: &str, canonical_resource: &str, now_unix_ms: u64) -> bool;
}
```

`shpherd-daemon` alone enables the `shpherd-auth/issuer` feature. It owns credential parsing, signature/session verification, and construction of `VerifiedIdentity`; it immediately exchanges that value through its composition-owned `AuthorizationIssuer`. The default consumer feature exposes only principal inspection/permission checks, so service/adaptor code cannot name `VerifiedIdentity`, construct an issuer, or mint a principal. `shpherd-service` and the ATM adapter receive only a borrowed `AuthenticatedPrincipal`. The package graph is `shpherd-types <- shpherd-auth <- {shpherd-service, shpherd-daemon}` and `shpherd-service` never depends on daemon.

The B2 foundation is the single canonical definition site for every primitive shared across contract tracks. B3A owns storage/projection composites, B3B owns service/launch/API composites, and B3C owns external integration composites; none may redeclare IDs, revisions/cursors, logical refs, launcher/member primitives, authorization, or `RosterRegistrationEvidence`. A compile matrix builds each B3A/B3B/B3C contract fixture against the B2 commit independently, before any sibling implementation exists.

## Relationships

`must_follow` B1: consumes the generated-tree digest. All later Rust sprints consume B2 package and manifest paths.

## This sprint does not close

Crate skeletons contain no migrated product behavior. B3/B3A and later boundary sprints own implementations. B2 closes governance enforcement plus foundational types/auth contracts only; the interrupt owns the actual runtime upgrade.

## Acceptance and validation

- One coherent workspace passes generated setup/lint/test/build gates and existing client checks.
- Boundary manifests encode the dependency graph in `docs/architecture.md`.
- No production raw-row command, local sc-runtime patch, scmux config path, or committed secret remains.
- Desktop identity and observability package/no-op browser adapter have smoke tests; telemetry failure cannot fail an action.
- Every generated app crate has ownership/dependency documentation, and the platform matrix names a concrete owner and evidence gate for every supported surface.
- The issue-inventory check proves exactly 25 unique current implementation children and separately classifies historical titles and plan-anchor governance records.
- Release-gate fixtures cover absent release, newly published release between checks, matching upgrade evidence, tampered/truncated/reordered history, digest substitution, two concurrent dispatches, stale lock recovery, detector/network failure, and direct B13/epic close attempts; only one dispatch wins and every ambiguous case fails closed.
- Foundation constructor/serde goldens prove entity revisions/fencing reject zero, cursors accept genesis/first/MAX but fail checked advance at MAX, and UUID/ULID/logical-ref/idempotency values reject noncanonical input. Auth compile-fail/serde fixtures prove JSON cannot construct a principal, service/adaptor crates cannot enable the issuer feature or mint an issuer/principal, verified daemon composition can authorize an identity, expiration is enforced, and action/resource scopes cannot be elevated by request data.
- The declared-prerequisite compile matrix checks B3A, B3B, and B3C separately against this exact B2 foundation and rejects sibling-contract imports or duplicate primitive definitions.

Every deliverable is production-ready for contract closure: skeletons compile, manifests validate, and retained product assets remain usable.
