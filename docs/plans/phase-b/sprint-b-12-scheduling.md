---
id: b-12-scheduling
bead: shp-phase-b.13
status: planned
closure_type: integration
target_boundary: atm-state-heartbeat
requirements: [ANC-011, ANC-012, ANC-015, REQ-ATM, REQ-SYNC]
adrs: [ADR-SHP-009, ADR-SHP-012, ADR-SHP-015]
owned_paths:
  - crates/shpherd-daemon/src/heartbeat/runtime/**
  - crates/shpherd-daemon/tests/heartbeat/**
relations:
  must_follow:
    - sprint: b-1-generate-baseline
      artifact: proven-installed-and-tested-runtime-template
    - sprint: b-3c-external-integration-contract
      artifact: sc-cron-atm-heartbeat-registration-freshness-contract-and-double
    - sprint: b-3b-service-launch-api-contract
      artifact: typed-readiness-dependency-input-contract
    - sprint: b-6a-atm-projection
      artifact: authoritative-atm-observation-adapter
    - sprint: b-9a-sync-projection
      artifact: host-report-projection-service
  parallel_safe: [b-11-editor-actions]
recommended_agent: rust-service-developer
recommended_model: deep-reasoning
---

# B12 — Register the ATM-state polling heartbeat

## Goal

Use sc-cron for one Phase B heartbeat that polls ATM agent state and refreshes Shpherd's local observations and host-qualified fleet report.

## Required work and deliverables

- Per phase policy, B1's sc-runtime `v0.1.1` template installation and baseline tests and B2 must close before this integration; if `v0.2.0` is observed, its interrupt is the next Shpherd work started and completes before this sprint starts or resumes.
- Register exactly one application callback through the pinned sc-cron public API. The callback delegates to the independent ATM observation and fleet-projection components; sc-cron imports no Shpherd row or store trait. Persist/publish B3C's typed registration result and freshness snapshot, then map them at the daemon heartbeat boundary into B3B's `AtmHeartbeatRegistration` and `AtmHeartbeatFreshness` readiness-dependency inputs without either contract crate importing the other.
- On each successful tick, poll ATM first, persist the host-local observation and definition drift, then publish a host-qualified report to PostgreSQL. PostgreSQL combines these reports from every enrolled computer into one fleet-wide team view. ATM is authoritative for actual team/member state; a failed or stale poll must not be presented as fresh truth.
- Propagate cancellation and bounded timeout/retry behavior. Retry only typed transient ATM/projection failures, never authorization, validation, revision, or capability failures. One host/report failure is recorded without tight-looping or launching any work.
- Keep all scheduled launches, roster changes, ATM messages, overnight instructions, general schedule CRUD, and schedule-editor policy outside Phase B.

## Relationships

`must_follow` B3C's heartbeat registration/freshness contract, B3B's independent readiness-input contract, B6A's ATM adapter, and B9A's host-report projection. It has no dependency on launcher mutation or ownership state.

## This sprint does not close

No OS service lifecycle, real daemon-wide readiness decision, or arbitrary scheduled action; B12A owns supervision and composes B12's typed heartbeat state with the other real readiness dependencies. Future phases may compose scheduled launches from existing commands.

## Acceptance and validation

- B12 is the Phase B ATM-state heartbeat integration; it cannot start until B1 is complete with successful sc-runtime template-installation and baseline-test evidence.
- Dependency validation proves every B12 dispatch follows B1 template install/test and B2 integration transitively through B3C, B6A, and B9A.
- Dispatch fails unless the dependency graph contains a transitive `must_follow` path to completed B1 evidence proving the sc-runtime template was installed and every baseline test passed.
- One heartbeat is registered and no scheduled launch/instruction job exists; contract tests cover the typed registration result plus never-succeeded/fresh/stale/failed freshness transitions and their B3B readiness-input mapping. Static checks find no general Shpherd schedule CRUD or scheduled-operation service.
- A tick polls the authoritative ATM adapter before updating SQLite observations and PostgreSQL; source host, source revision, and observation time are retained. A two-host heartbeat fixture proves identically named teams and agents remain distinct host-qualified rows and are both visible concurrently.
- Cancellation before/during work is terminal, restart resumes the heartbeat without duplicating a report, and transient retry stays within configured attempt/elapsed budgets.
- ATM failure preserves the previous observation as explicitly stale; PostgreSQL failure does not alter ATM/local authority and is retried on a later heartbeat.
- sc-cron and `shpherd-store-adaptor` import no Shpherd application row, ATM adapter, launcher, or timer policy.

Every deliverable is production-ready for the Phase B ATM-state heartbeat.
