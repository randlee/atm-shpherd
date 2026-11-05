---
id: b-9c-expand-roster
bead: shp-phase-b.18
status: planned
closure_type: integration
target_boundary: roster-expansion
requirements: [REQ-ATM]
adrs: [ADR-SHP-003, ADR-SHP-004, ADR-SHP-005, ADR-SHP-006, ADR-SHP-007]
owned_paths:
  - crates/shpherd-service/src/roster_expansion/**
  - crates/shpherd-service/tests/roster_expansion/**
  - tests/integration/roster-expansion/**
relations:
  must_follow:
    - sprint: b-1-generate-baseline
      artifact: proven-installed-and-tested-runtime-template
    - sprint: b-6a-atm-projection
      artifact: versioned-atm-roster-authority-implementation
    - sprint: b-4a-local-schema-sqlite
      artifact: durable-roster-expansion-operation-store
    - sprint: b-7-herdr-launcher
      artifact: guarded-dynamic-spawn-adapter
    - sprint: b-9a-sync-projection
      artifact: synchronized-roster-projection
    - sprint: b-9b-launch-leases
      artifact: verified-host-local-launch-guard
  parallel_safe: [b-12-scheduling]
recommended_agent: rust-integration-developer
recommended_model: deep-reasoning
---

# B9C — Add and launch roster members on demand

## Goal

Close the idempotent operator workflow that registers, synchronizes, launches, observes, and reconciles one roster member.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests must close before this sprint; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Implement durable idempotent expansion state across verified dispatch authorization, the injected B3C `AtmRosterAuthority` port, ATM mutation, typed roster-registration evidence, re-import, synchronization, host-local launch guard, hmux spawn, observation, retry, update, member-scoped stop/reconcile, and removal reconciliation. Each reconciled roster change publishes its host-qualified team/member update into PostgreSQL's all-computers fleet view. Thin daemon composition injects the independent B6A ATM implementation; `shpherd-service` never imports a daemon crate. Caller claims never enter wire/domain payloads.
- Dispatch the launch step through B9B's normalized policy: omitted launcher selection uses the Herdr adapter, while explicit tmux selection uses the tmux adapter. No path makes tmux the default or substitutes tmux when launcher selection is omitted. End-to-end add-agent fixtures prove both routes remain supported without fallback or backend merging.

```rust
pub enum ExpansionState { IntentPersisted, RosterRegistered, RegisteredNotRunning, Launching,
    Running, RemovalPending, ReconciliationRequired, Reconciled, Failed }
pub enum ExpansionIntent { Add(MemberSpec), Update(MemberSpec), Remove { team: TeamId, member: MemberId } }
pub struct ExpansionRequest { pub intent: ExpansionIntent, pub expected: DomainRevision,
    pub key: IdempotencyKey }
pub struct ExpansionResult { pub state: ExpansionState, pub runtime: Option<RuntimeIdentity>,
    pub registration: Option<RosterRegistrationEvidence>, pub evidence: ActionEvidence }
pub trait RosterExpansionService: sealed::Sealed + Send + Sync {
    fn expand<'a>(&'a self, context: &'a DispatchContext<'a>, request: ExpansionRequest) -> BoxFuture<'a, Result<ExpansionResult, DomainError>>;
}
```

State transitions use B4A's local operation store and are committed before the next external side effect. The first transition stores canonical intent CBOR, request digest, expected revision, variant/host/tab placement, operation, and idempotency key, so restart before ATM mutation can resume without a caller reconstructing the request. Operation/idempotency uniqueness returns the prior state on byte-identical replay and rejects mismatched reuse. Registration evidence is stored transactionally with its transition; retries resume from evidence and never skip reconciliation. Terminal records have a versioned retention policy and cannot be pruned while reconciliation is pending.

## Relationships

`must_follow` B4A, B6A, B7, B9A, and B9B because it consumes the durable operation store and their contracts/implementations through lower-layer ports.

## This sprint does not close

No general UI editor or scheduled launch; B11 owns the editor surface, while scheduled launches are post-MVP.

## Acceptance and validation

- Dispatch fails unless the dependency graph contains a transitive `must_follow` path to completed B1 evidence proving the sc-runtime template was installed and every baseline test passed.
- Authorized `shpherd team add-agent` with variant/host/tab placement creates one member and one pane; every crash boundary converges without duplication and preserves existing sessions. A noninteractive SSH invocation launches the new active agent through Herdr by default and through tmux only when explicitly selected. A two-host fixture adds and launches an identically named team and agent concurrently on each host as distinct host-qualified instances.
- Add/update/remove expected-revision conflicts, verified-principal authorization and scope mismatch, idempotent replay, `registered_not_running`, crash-after-registration, stale/digest-mismatched evidence, repeated spawn, member-scoped removal/reconcile, unrelated-session preservation, ATM evidence/redaction, sync, and retry behavior pass end-to-end.
- Restart fixtures cover every stage, including immediately after intent persistence and before ATM mutation, and prove autonomous resume plus rejection of changed intent under a reused key.

Every deliverable is production-ready for the roster-expansion feature.
