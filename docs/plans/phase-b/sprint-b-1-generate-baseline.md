---
id: b-1-generate-baseline
bead: shp-phase-b.1
status: planned
closure_type: contract
target_boundary: runtime-workspace
recommended_agent: background-rust-developer
recommended_model: workhorse
---

# B1 — Generate and prove the 0.1.1 baseline

requirements: ANC-001, ANC-002, REQ-BOOTSTRAP; PRD §§4.1-4.2, 12.
adrs: ADR-SHP-001, ADR-SHP-003.

## Deliverables and owned paths

- Generate an untouched sc-runtime `v0.1.1` `sqlite-postgres` release workspace in an absent staging destination using a retained Shpherd answers file.
- Prove published crates resolve without local patches and record setup/lint/test/CLI/daemon results.
- Owned paths: `docs/evidence/b-1/**`, `config/generator/shpherd-0.1.1.json`. The generated staging directory stays outside the repository.

## Relationships

`parallel_safe`: none; this is the phase root. B2 `must_follow` because it consumes the proven generated tree and evidence digest.

## This sprint does not close

No generated code is integrated and no scmux schema, UI, or feature migration begins; B2 owns integration.

## Acceptance and validation

- `req:ANC-001`: release generation identifies `v0.1.1` and `sqlite-postgres`.
- `req:ANC-002`: all baseline gates pass before any migration diff exists.
- No generated manifest contains a local `[patch.crates-io]` sc-runtime path.
- Run the generated `just setup --check`, lint, tests, CLI build, daemon build, and `cargo metadata`.

Every deliverable lands production-ready for a contract baseline: reproducible inputs and complete evidence, with no product implementation hidden in staging.
