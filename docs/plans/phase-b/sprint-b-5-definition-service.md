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

# B5 — Port definition management and command contracts

## Deliverables

- Implement hierarchy and atomic create/edit/move/clone/unlink/import domain behavior in `shpherd-service` with typed command inputs/results.
- Define transport-independent command contracts and machine errors; do not wire the thin CLI before B10A.

## Relationships

`must_follow` only B3B's definition command types, error envelope, and service double. B5 is parallel-safe with the other layer sprints named in frontmatter.

## This sprint does not close

No HTTP route, CLI transport, dashboard editor, PostgreSQL sync, or runtime launcher is claimed.

## Acceptance and validation

- Golden tests cover hierarchy, exactly one Captain, concrete prompts, variants, identity, running-edit guards, atomic rollback, clone policy, and reference-counted unlink.
- Definition writer is the sole durable mutation capability; poller test doubles cannot obtain it.
- Service crate lint/test, workspace build, and boundary validation pass.

Every deliverable is production-ready for the service boundary with no transport placeholder or stub.
