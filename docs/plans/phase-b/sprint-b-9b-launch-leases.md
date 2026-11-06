---
id: b-9b-launch-leases
bead: shp-phase-b.17
status: planned
closure_type: integration
target_boundary: host-local-launch-safety
requirements: [ANC-008, ANC-009, ANC-011, ANC-013, ANC-014, REQ-API, REQ-LAUNCH]
adrs: [ADR-SHP-002, ADR-SHP-003, ADR-SHP-004, ADR-SHP-005, ADR-SHP-011, ADR-SHP-012, ADR-SHP-013]
owned_paths:
  - crates/shpherd-service/src/launch/**
  - crates/shpherd-service/src/host_eligibility/**
  - crates/shpherd-service/src/operation_journal/**
  - crates/shpherd-service/tests/launch/**
  - crates/shpherd-service/tests/host_eligibility/**
  - crates/shpherd-service/tests/operation_journal/**
  - tests/integration/host-local-launch/**
relations:
  must_follow:
    - sprint: b-1-generate-baseline
      artifact: proven-installed-and-tested-runtime-template
    - sprint: b-3b-service-launch-api-contract
      artifact: launch-preparation-reader-host-launch-guard-operation-journal-and-launcher-test-doubles
    - sprint: b-4a-local-schema-sqlite
      artifact: sqlite-operation-journal-store-implementation-and-stateful-double
    - sprint: b-6-observation
      artifact: production-read-only-launch-preparation-reader
    - sprint: b-7-herdr-launcher
      artifact: guarded-herdr-adapter
    - sprint: b-8-tmux-launcher
      artifact: guarded-tmux-adapter
    - sprint: b-10a-daemon-api
      artifact: authenticated-cli-daemon-launch-command-boundary
  parallel_safe: [b-10-dashboard]
recommended_agent: rust-service-developer
recommended_model: deep-reasoning
---

# B9B — Compose host-local launch safety and SSH operation

## Goal

Solely close the real SSH-to-`shpherd`-CLI-to-daemon-to-guarded-launcher composition for Herdr-first and explicit tmux launch through host-local idempotency/single-flight, while allowing the same team and agent names to run concurrently on other hosts.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests, B2, B4A, B6, B7/B8, and B10A must close before this sprint; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Consume B6's production `LaunchPreparationReader`, never `DefinitionStore` or PostgreSQL, to obtain the complete revision-bound Team/Variant launch input. Resolve the selected host's local project binding and validate checkout, effective configuration, requested host, and launcher capabilities before mutation. A fleet row may inform a separate explicit import, but it never supplies a runtime launch input.
- Implement the service-level `OperationJournal` adapter over B4A's injected `OperationJournalStore`. Persist accepted request/idempotency evidence before dispatch, atomically commit terminal outcome plus pending event, republish only unmarked events after restart, and return the original outcome on replay. Issue an opaque `HostLaunchGuard` from a host-local single-flight registry only after durable acceptance. A byte-identical retry returns the prior local result; a different command using the same key fails without a side effect. Unknown outcomes reconcile against ATM and launcher observations before retry.
- Compose the same service path for authenticated API calls and noninteractive `shpherd` CLI calls over SSH. Omitted backend selects Herdr; an explicit tmux selection remains supported.
- Treat ATM observation as authoritative for the actual running team instance. Shpherd records desired definition and launch evidence, reports drift, and never replaces ATM roster/runtime truth.

The local guard is scoped by `(host, team, variant, operation)` and is neither serialized to PostgreSQL nor transferable to another host. It prevents duplicate panes/processes from concurrent requests on one host. It deliberately does not prevent another computer from running an identically named team or agents.

## Relationships

`must_follow` B3B's launch-preparation/host-operation/journal contracts, B4A's SQLite `OperationJournalStore`, B6's production launch-preparation reader, the independent B7/B8 adapters, and B10A's authenticated CLI/daemon launch-command boundary. B9A fleet projection is not a launch prerequisite; B9B is the sole real launch integration closure.

## This sprint does not close

No roster mutation workflow, scheduled launch, global ownership, or UI action; B9C/B11 own roster/UI integration and scheduled launches are post-MVP.

## Acceptance and validation

- Dependency validation proves every B9B dispatch follows B1 template install/test and B2 integration transitively through the frozen contracts plus B4A/B6/B7/B8/B10A prerequisites.
- Dispatch fails unless the dependency graph contains a transitive `must_follow` path to completed B1 evidence proving the sc-runtime template was installed and every baseline test passed.
- Concurrent and repeated local requests produce one side effect and stable journal replay evidence; accepted-before-dispatch, atomic terminal-plus-event commit, unpublished-event recovery, mismatched idempotency reuse, crash/restart, unknown outcome, and stale local evidence converge through the B4A store plus ATM/launcher observation.
- Two independent host-local compositions, each with its own B4A SQLite stores, B6 production launch reader, journal adapter, guard, and launcher, concurrently launch the same team and agent names without a PostgreSQL process or shared lock; both remain valid.
- With PostgreSQL unavailable, an enrolled host with a valid local definition still launches through Herdr or explicit tmux.
- A real noninteractive SSH invocation of `shpherd team start` crosses the B10A CLI/daemon boundary, is proven to call B6's production `LaunchPreparationReader` rather than a B3B double, reaches the same journaled and guarded B7/B8 command path, returns typed output/exit status, and starts active agents; no other sprint claims this end-to-end proof.
- `req:ANC-008,ANC-009`: unset selection launches through Herdr and explicit tmux launches through tmux across the real guarded composition; aggregate failures remain isolated.
- Public APIs cannot call side effects without `HostLaunchGuard`; static checks prove no PostgreSQL lease, fencing, ownership-transfer, or global-name lock is introduced.

Every deliverable is production-ready for host-local launch integration.
