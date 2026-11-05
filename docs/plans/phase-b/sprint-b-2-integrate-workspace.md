---
id: b-2-integrate-workspace
bead: shp-phase-b.2
status: planned
closure_type: contract
target_boundary: generated-workspace
requirements: [ANC-001, ANC-002, ANC-003, ANC-004, ANC-005, ANC-008, ANC-009, ANC-013, REQ-BOOTSTRAP, REQ-API, REQ-LAUNCH]
adrs: [ADR-SHP-001, ADR-SHP-003, ADR-SHP-004, ADR-SHP-008, ADR-SHP-016]
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
  - docs/adr/ADR-SHP-016.md
  - crates/shpherd-types/src/foundation/**
  - crates/shpherd-types/tests/foundation_contract.rs
  - crates/shpherd-auth/**
  - crates/shpherd-service/src/contracts/mod.rs
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

- Integrate only B1's proven workspace generated from sc-runtime `v0.1.1`, retaining its generation record and digest; B1 template installation and every baseline test gate must pass before B2 or any scmux schema, feature, or UI migration starts.
- If the authoritative release check observes sc-runtime `v0.2.0`, the upgrade interrupt is the next Shpherd work started: no other newly started work may intervene, and already-running work may only reach one safe checkpoint before the interrupt begins.
- Require that interrupt to apply every dependency update supplied by `v0.2.0` and leave the complete consumer sc-lint installation at version `0.8.4` or newer.
- Define `LauncherPolicy::HerdrDefault` as selecting Herdr when no launcher is set, retain `TmuxExplicit` as the selectable tmux contract, and compile-test both variants before B7/B8 implement their launch lifecycles.
- Reconcile the proven generated workspace with existing PRD, oracle, browser/Tauri client, tests, and history without wholesale replacement.
- Establish app-named crates, binaries `shpherd`/`atm-shpherd`, bundle id `com.synapticcanvas.shpherd`, `.shpherd/` runtime paths, and machine-readable boundary manifests.
- Predeclare B3A/B3B/B3C contract-module Cargo features and a B2-owned `shpherd-service::contracts` registry. Each leaf declaration is feature-gated, so an independently owned leaf compiles against B2 without either parallel contract sprint editing the registry.
- Remove generated widget/general-database production commands; retain only named Shpherd surfaces.
- Preserve desktop icon/window/tray/deep-link/notification scaffolding and pin `@synaptic-canvas/sc-observability` with a nonthrowing browser/no-op adapter.
- Seed each app crate README with its responsibility, allowed dependencies, prohibited policy, and boundary-manifest link; retain the shared Phase B platform/test matrix.
- Record the authoritative sc-runtime release check in ordinary sprint evidence. If `v0.2.0` is present, the interrupt takes priority; if it is absent or the check fails, record that result rather than building a second dispatch/closure subsystem.
- Freeze the app-owned foundation consumed by B3A/B3B/B3C: canonical IDs, nonzero entity revisions, genesis-capable cursors, domain-separated fixed-width digests, logical references, launcher/member primitives, cross-adapter registration evidence, and the verification-independent authorization capability. Team and member display names are not globally unique; host-qualified placement permits identical team and agent names to run concurrently on multiple hosts. This foundation lands and compiles before any contract sprint dispatches.
- Keep credential parsing and transport extraction in `shpherd-daemon`; place policy evaluation and the non-serializable authorized principal in lower `shpherd-auth`, which both daemon composition and `shpherd-service` may depend on without a dependency cycle.

The release check queries the authoritative sc-runtime release/tag source and records timestamp, observed tag or absence, release/asset digest when present, repository revision, and decision in the sprint evidence that consumed it. The check runs before feature dispatch and again at B13 certification. A published `v0.2.0` routes directly to the interrupt; a detector/network/parse failure blocks the attempted dispatch until an authoritative result is available. Beads history and the interrupt evidence are the audit record; Phase B does not implement custom hash chaining, repository locks, hooks, or close interception.

```rust
// crates/shpherd-types/src/foundation/identity.rs
id_newtype!(ArmadaId); id_newtype!(FleetId); id_newtype!(FlotillaId); id_newtype!(TeamId);
id_newtype!(VariantId); id_newtype!(MemberId); id_newtype!(TeamPlacementId); id_newtype!(HostId); id_newtype!(ProjectId);
id_newtype!(DaemonInstanceId); id_newtype!(StreamId); id_newtype!(DiscoveryId);
request_newtype!(RequestId); request_newtype!(CorrelationId); request_newtype!(OperationId);

// Entity revisions start at one. Zero and overflowed construction/serde fail.
pub struct DomainRevision(std::num::NonZeroU64);
pub struct EntityRevision(std::num::NonZeroU64);
pub struct IdempotencyKey(String); // 16..=128 ASCII token, no whitespace/control bytes
pub struct CommandDigest([u8; 32]); // domain-separated canonical command bytes
pub struct AggregateDigest([u8; 32]); // domain-separated ordered descendant identity/revision set
pub struct RosterRequestDigest([u8; 32]); // domain-separated canonical roster intent
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
pub struct AtmMemberBinding { pub team: String, pub member: String,
    pub source_fingerprint: String, pub bound_revision: String }
pub struct RosterRegistrationEvidence { pub operation: OperationId, pub key: IdempotencyKey,
    pub atm_team: String, pub atm_member: String, pub roster_revision: String,
    pub redacted_result_digest: String }

// crates/shpherd-auth: no serde derives; principal fields and constructors are private.
pub struct AuthenticatedPrincipal { /* subject, roles, scopes, expiry, audit source */ }
pub struct AuthorizationIssuer { /* non-clone verifier/policy capability held only by composition */ }
pub struct AuthorizationPolicy { pub policy_version: String, pub rules_digest: String }
pub struct VerifiedTransportEvidence { pub signed_claims: Vec<u8> } // transportable but untrusted until verified
pub trait EvidenceVerifier: Send + Sync { fn verify(&self, evidence: &VerifiedTransportEvidence) -> Result<(), AuthorizationError>; }
pub enum AuthorizationError { InvalidPolicy, InvalidEvidence, Expired, Unauthorized }
pub fn authorization_boundary(policy: AuthorizationPolicy, verifier: std::sync::Arc<dyn EvidenceVerifier>)
    -> Result<AuthorizationIssuer, AuthorizationError>;
impl AuthorizationIssuer {
    pub fn authorize(&self, evidence: VerifiedTransportEvidence, now_unix_ms: u64)
        -> Result<AuthenticatedPrincipal, AuthorizationError>;
}
impl AuthenticatedPrincipal {
    pub fn permits(&self, action: &str, canonical_resource: &str, now_unix_ms: u64) -> bool;
}
```

`shpherd-daemon` owns credential parsing and transport/session verification. At composition it creates the non-clone `AuthorizationIssuer` with the production `Arc<dyn EvidenceVerifier + Send + Sync>` and policy, exchanges opaque verifier evidence for an `AuthenticatedPrincipal`, and passes only a borrowed principal into service/adaptor calls. This boundary does not rely on Cargo features or Rust friend-crate privacy: the manifest and sc-lint rules forbid issuer construction or evidence-verifier implementations in `shpherd-service` and adapters, and runtime minting additionally requires the daemon-held verifier capability. The full workspace is tested with Cargo's unified feature graph, static `Send + Sync` assertions for issuer/Axum state, concurrent authorization, and a negative service fixture that attempts issuer construction, verifier injection, direct principal construction, and forged evidence. The package graph is `shpherd-types <- shpherd-auth <- {shpherd-service, shpherd-daemon}` and `shpherd-service` never depends on daemon.

The B2 foundation is the single canonical definition site for every primitive shared across contract tracks. B3A owns storage/projection composites, B3B owns service/launch/API composites, and B3C owns external integration composites; none may redeclare IDs, revisions/cursors, logical refs, launcher/member primitives, authorization, or `RosterRegistrationEvidence`. A compile matrix builds each B3A/B3B/B3C contract fixture against the B2 commit independently, before any sibling implementation exists.

## Relationships

`must_follow` B1: consumes the generated-tree digest. All later Rust sprints consume B2 package and manifest paths.

## This sprint does not close

Crate skeletons contain no migrated product behavior. B3/B3A and later boundary sprints own implementations. B2 closes workspace integration plus foundational types/auth contracts only; the interrupt owns the actual runtime upgrade.

## Acceptance and validation

- One coherent workspace passes generated setup/lint/test/build gates and existing client checks.
- Boundary manifests encode the dependency graph in `docs/architecture.md`.
- No production raw-row command, local sc-runtime patch, scmux config path, or committed secret remains.
- Desktop identity and observability package/no-op browser adapter have smoke tests; telemetry failure cannot fail an action.
- Every generated app crate has ownership/dependency documentation, and the platform matrix names a concrete owner and evidence gate for every supported surface.
- Release-check fixtures cover absent release, present release, matching interrupt evidence, digest mismatch, and detector/network/parse failure. The recorded result deterministically selects feature dispatch, blocks for authoritative retry, or routes to the interrupt.
- Foundation constructor/serde goldens prove entity revisions reject zero, cursors accept genesis/first/MAX but fail checked advance at MAX, and UUID/ULID/logical-ref/idempotency values reject noncanonical input. Auth serde/boundary fixtures prove JSON cannot construct a principal, service/adaptor crates cannot construct or receive an issuer/evidence verifier under the complete unified workspace graph, verified daemon composition can authorize evidence, forged evidence fails, expiration is enforced, and action/resource scopes cannot be elevated by request data.
- The declared-prerequisite compile matrix checks B3A, B3B, and B3C separately against this exact B2 foundation and rejects sibling-contract imports or duplicate primitive definitions. Digest goldens reject wrong width/domain/encoding.

Every deliverable is production-ready for contract closure: skeletons compile, manifests validate, and retained product assets remain usable.
