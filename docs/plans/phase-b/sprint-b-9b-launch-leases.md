---
id: b-9b-launch-leases
bead: shp-phase-b.17
status: planned
closure_type: integration
target_boundary: host-local-launch-safety
requirements: [ANC-008, ANC-009, ANC-011, ANC-013, ANC-014, REQ-LAUNCH]
adrs: [ADR-SHP-002, ADR-SHP-004, ADR-SHP-005, ADR-SHP-012, ADR-SHP-013]
owned_paths:
  - crates/shpherd-service/src/launch/**
  - crates/shpherd-service/src/host_eligibility/**
  - crates/shpherd-service/tests/launch/**
  - crates/shpherd-service/tests/host_eligibility/**
  - tests/integration/host-local-launch/**
relations:
  must_follow:
    - sprint: b-1-generate-baseline
      artifact: proven-installed-and-tested-runtime-template
    - sprint: b-3b-service-launch-api-contract
      artifact: host-launch-guard-and-launcher-test-doubles
    - sprint: b-7-herdr-launcher
      artifact: guarded-herdr-adapter
    - sprint: b-8-tmux-launcher
      artifact: guarded-tmux-adapter
  parallel_safe: [b-10-dashboard, b-10a-daemon-api]
recommended_agent: rust-service-developer
recommended_model: deep-reasoning
---

# B9B — Compose host-local launch safety and SSH operation

## Goal

Compose Herdr-first and explicit tmux launch through host-local idempotency/single-flight, while allowing the same team and agent names to run concurrently on other hosts.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests, B2, and B7/B8 must close before this sprint; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Validate the selected host's local project binding, checkout, configuration, and launcher capability before mutation. A fleet row may inform an explicit local import, but PostgreSQL never grants or denies launch and is not required for host-local launch.
- Issue an opaque `HostLaunchGuard` from a host-local single-flight registry only after durable operation/idempotency evidence is accepted. A byte-identical retry returns the prior local result; a different command using the same key fails without a side effect. Unknown outcomes reconcile against ATM and launcher observations before retry.
- Compose the same service path for authenticated API calls and noninteractive `shpherd` CLI calls over SSH. Omitted backend selects Herdr; an explicit tmux selection remains supported.
- Treat ATM observation as authoritative for the actual running team instance. Shpherd records desired definition and launch evidence, reports drift, and never replaces ATM roster/runtime truth.

The local guard is scoped by `(host, team, variant, operation)` and is neither serialized to PostgreSQL nor transferable to another host. It prevents duplicate panes/processes from concurrent requests on one host. It deliberately does not prevent another computer from running an identically named team or agents.

## Relationships

`must_follow` B3B's host-operation guard/launcher doubles and the independent B7/B8 adapters. B9A fleet projection is not a launch prerequisite.

## This sprint does not close

No roster mutation workflow, scheduled launch, global ownership, or UI action; B9C/B11 own roster/UI integration and scheduled launches are post-MVP.

## Acceptance and validation

- Dependency validation proves every B9B dispatch follows B1 template install/test and B2 integration transitively through the frozen contracts and B7/B8 prerequisites.
- Dispatch fails unless the dependency graph contains a transitive `must_follow` path to completed B1 evidence proving the sc-runtime template was installed and every baseline test passed.
- Concurrent and repeated local requests produce one side effect and stable replay evidence; mismatched idempotency reuse, crash/restart, unknown outcome, and stale local evidence converge through ATM/launcher observation.
- PostgreSQL presents one combined fleet-wide view of teams from all enrolled computers; in the acceptance fixture, two simulated hosts concurrently launch the same team and agent names and both remain valid, host-qualified rows in that view.
- With PostgreSQL unavailable, an enrolled host with a valid local definition still launches through Herdr or explicit tmux.
- A noninteractive SSH invocation of `shpherd team start` reaches the same guarded command path, returns typed output/exit status, and starts active agents.
- `req:ANC-008,ANC-009`: unset selection launches through Herdr and explicit tmux launches through tmux across the real guarded composition; aggregate failures remain isolated.
- Public APIs cannot call side effects without `HostLaunchGuard`; static checks prove no PostgreSQL lease, fencing, ownership-transfer, or global-name lock is introduced.

Every deliverable is production-ready for host-local launch integration.
