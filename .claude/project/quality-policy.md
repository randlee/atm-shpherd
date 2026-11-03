# atm-shpherd quality policy

## Repository baseline

- Comparison branch: `develop`.
- Requirements: `docs/requirements.md`, `docs/atm-shpherd-prd.md`, and the locked records in `docs/plans/phase-b/anchors.json`.
- Architecture and ADR index: `docs/architecture.md`.
- Phase plan: `docs/plans/phase-b/phase-b-plan.md`.
- Boundary definitions are introduced by B2 under `boundaries/`; until B2 lands, the intended boundary map in the Phase B plan is the review authority.

## Plan naming

- Phase id: `phase-b`; plan directory: `docs/plans/phase-b/`.
- Sprint documents: `sprint-b-<sequence>-<slug>.md` using lower-case ASCII slugs.
- Phase integration branch: `integrate/phase-b` after the plan PR lands. Existing `codex/phase-b-plan` is retained as pre-rule history.
- Sprint branches and worktrees: `sprint/b-<sequence>-<slug>`; fix branches: `fix/b-<sequence>-<slug>`.

## Boundary and validation policy

B2 creates machine-readable manifests for each `shpherd-*` crate and the client boundary. A manifest owns its public types, allowed dependencies, allowed dependents, and test-double paths. Contract sprints own shared registries and manifest changes; boundary sprints may not edit another boundary's manifest.

Required validation after B2 exists:

- `just setup --check`
- `just lint`
- `cargo test --workspace --all-features`
- `cargo build --workspace`
- repository boundary validation installed by the sc-runtime template
- `pnpm --dir clients check`
- `pnpm --dir clients tauri:fmt`
- `pnpm --dir clients tauri:check`

Before B2, document-only work runs Markdown/link checks when available, `git diff --check`, Beads cycle checks, and plan-anchor validation.

## Plan QA

Docs-only plan QA uses requirements, architecture, Rust best-practices, and service-hardening reviewers, then the Cursor quality-manager evidence gate. Implementation QA adds Rust build/test/lint review and platform checks appropriate to the sprint closure type.
