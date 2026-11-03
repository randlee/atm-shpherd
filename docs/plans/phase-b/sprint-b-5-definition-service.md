---
id: b-5-definition-service
bead: shp-phase-b.6
status: planned
closure_type: boundary
target_boundary: shpherd-service-definitions
requirements: []
adrs: [ADR-SHP-003, ADR-SHP-004]
owned_paths:
  - crates/shpherd-service/src/definitions/**
  - crates/shpherd-service/tests/definitions/**
relations:
  must_follow:
    - sprint: b-3b-service-launch-api-contract
      artifact: definition-command-types-error-envelope-and-service-double
  parallel_safe: [b-6-observation, b-6a-atm-projection, b-7-herdr-launcher, b-8-tmux-launcher, b-10a-daemon-api]
recommended_agent: rust-domain-developer
recommended_model: deep-reasoning
---

# B5 — Port definition management and service command behavior

## Goal

Close the sole durable definition-writer boundary with atomic hierarchy behavior and typed transport-independent commands.

## Required work and deliverables

- Implement hierarchy and atomic create/edit/move/clone/unlink/import domain behavior in `shpherd-service` with typed command inputs/results.
- Implement the frozen B3B transport-independent commands/results and machine-error mapping; do not wire the thin CLI before B10A.

The production implementation closes the frozen B3B seam without adding a second writer:

```rust
pub trait DefinitionService: sealed::Sealed {
    fn execute(&self, command: DefinitionCommand) -> Result<DefinitionResult, DomainError>;
}
```

Create/edit/move/clone/unlink/import all enter this method, validate the whole bundle, commit once, and publish only the post-commit revision. B5 records the retained per-object clone/reference policy in its golden fixtures before implementing clone mutations; no route or UI chooses policy independently.

## Relationships

`must_follow` only B3B's definition command types, error envelope, and service double. B5 is parallel-safe with the other layer sprints named in frontmatter.

## This sprint does not close

No HTTP route, CLI transport, dashboard editor, PostgreSQL sync, or runtime launcher is claimed.

## Acceptance and validation

- Golden tests cover hierarchy, exactly one Captain, concrete prompts, variants, identity, running-edit guards, atomic rollback, clone policy, and reference-counted unlink.
- Contract tests cover every B3B definition command/result and stable validation/conflict/not-found error mapping; clone fixtures record the per-object shared-reference or copy policy before clone code lands.
- Definition writer is the sole durable mutation capability; poller test doubles cannot obtain it.
- Service crate lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the service boundary with no transport placeholder or stub.
