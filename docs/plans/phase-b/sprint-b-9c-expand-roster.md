---
id: b-9c-expand-roster
bead: shp-phase-b.18
status: planned
closure_type: integration
target_boundary: roster-expansion
requirements: [REQ-ATM]
adrs: [ADR-SHP-004, ADR-SHP-005, ADR-SHP-006, ADR-SHP-007]
owned_paths:
  - crates/shpherd-service/src/roster_expansion/**
  - crates/shpherd-service/tests/roster_expansion/**
  - tests/integration/roster-expansion/**
relations:
  must_follow:
    - sprint: b-6a-atm-projection
      artifact: versioned-atm-adapter
    - sprint: b-7-herdr-launcher
      artifact: guarded-dynamic-spawn-adapter
    - sprint: b-9a-sync-projection
      artifact: synchronized-roster-projection
    - sprint: b-9b-launch-leases
      artifact: verified-launch-lease-guard
  parallel_safe: [b-12-scheduling]
recommended_agent: rust-integration-developer
recommended_model: deep-reasoning
---

# B9C — Add and launch roster members on demand

## Goal

Close the idempotent operator workflow that registers, synchronizes, launches, observes, and reconciles one roster member.

## Required work and deliverables

- Implement durable idempotent expansion state across verified dispatch authorization, ATM mutation, typed roster-registration evidence, re-import, synchronization, lease guard, hmux spawn, observation, retry, update, member-scoped stop/reconcile, and removal reconciliation. Caller claims never enter wire/domain payloads.

```rust
pub enum ExpansionState { IntentPersisted, RosterRegistered, RegisteredNotRunning, Launching,
    Running, RemovalPending, ReconciliationRequired, Reconciled, Failed }
pub enum ExpansionIntent { Add(MemberSpec), Update(MemberSpec), Remove { team: TeamId, member: MemberId } }
pub struct ExpansionRequest { pub intent: ExpansionIntent, pub expected: DomainRevision,
    pub key: IdempotencyKey }
pub struct ExpansionResult { pub state: ExpansionState, pub runtime: Option<RuntimeIdentity>,
    pub registration: Option<RosterRegistrationEvidence>, pub evidence: ActionEvidence }
pub trait RosterExpansionService: sealed::Sealed {
    fn expand(&self, context: &DispatchContext<'_>, request: ExpansionRequest) -> Result<ExpansionResult, DomainError>;
}
```

State transitions are persisted before the next external side effect; retries resume from evidence and never skip reconciliation.

## Relationships

`must_follow` B6A, B7, B9A, and B9B because it consumes their contracts and real implementations.

## This sprint does not close

No general UI editor or scheduled launch; B11/B12 own those surfaces.

## Acceptance and validation

- Authorized `shpherd team add-agent` with variant/host/tab placement creates one member and one pane; every crash boundary converges without duplication and preserves existing sessions.
- Add/update/remove expected-revision conflicts, verified-principal authorization and scope mismatch, idempotent replay, `registered_not_running`, crash-after-registration, stale/digest-mismatched evidence, repeated spawn, member-scoped removal/reconcile, unrelated-session preservation, ATM evidence/redaction, sync, and retry behavior pass end-to-end.

Every deliverable is production-ready for the roster-expansion feature.
