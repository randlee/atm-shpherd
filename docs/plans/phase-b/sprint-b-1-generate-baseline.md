---
id: b-1-generate-baseline
bead: shp-phase-b.1
status: planned
closure_type: integration
target_boundary: runtime-workspace
requirements: [ANC-001, ANC-002]
adrs: [ADR-SHP-001, ADR-SHP-003]
owned_paths:
  - config/generator/shpherd-0.1.1.json
  - docs/evidence/b-1/**
relations:
  must_follow: []
  parallel_safe: []
recommended_agent: background-rust-developer
recommended_model: workhorse
---

# B1 — Generate and prove the 0.1.1 baseline

## Goal

Prove the released generator baseline is reproducible and usable before any product migration begins.

## Required work and deliverables

- Generate an untouched sc-runtime `v0.1.1` `sqlite-postgres` release workspace in an absent staging destination using a retained Shpherd answers file.
- Prove published crates resolve without local patches and record setup/lint/test/CLI/daemon results.
- Do not start B2 or any scmux schema, feature, or UI migration until this template installation and every recorded baseline gate pass.

## Relationships

`parallel_safe`: none; this is the phase root. Successful B1 generation and all
baseline setup, lint, test, CLI, and daemon gates are an explicit tracker
prerequisite for B2 and every scmux schema, feature, and UI migration sprint.
B2 `must_follow` because it consumes the proven generated tree and evidence
digest; every later migration inherits that dependency transitively through B2.

## This sprint does not close

No generated code is integrated and no scmux schema, UI, or feature migration begins; B2 owns integration.

## Acceptance and validation

- `req:ANC-001`: release generation identifies `v0.1.1` and `sqlite-postgres`.
- `req:ANC-002`: all baseline gates pass before any migration diff exists.
- No generated manifest contains a local `[patch.crates-io]` sc-runtime path.
- Run the generated `just setup --check`, lint, tests, CLI build, daemon build, and `cargo metadata`.

Every deliverable is production-ready integration evidence for the released generator baseline: reproducible inputs and complete evidence, with no product implementation hidden in staging.
