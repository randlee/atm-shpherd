---
id: b-13-release-certification
bead: shp-phase-b.14
status: planned
closure_type: docs
target_boundary: release-evidence
requirements: [REQ-RELEASE-EVIDENCE]
adrs: [ADR-SHP-001, ADR-SHP-002, ADR-SHP-003, ADR-SHP-004, ADR-SHP-005, ADR-SHP-006, ADR-SHP-007, ADR-SHP-008, ADR-SHP-009, ADR-SHP-010, ADR-SHP-011, ADR-SHP-012, ADR-SHP-013, ADR-SHP-014, ADR-SHP-015]
owned_paths:
  - docs/evidence/phase-b/**
  - docs/releases/phase-b.md
relations:
  must_follow:
    - sprint: b-9c-expand-roster
      artifact: roster-expansion-evidence
    - sprint: b-11a-mobile
      artifact: mobile-build-and-simulator-evidence
    - sprint: b-12a-daemon-supervision
      artifact: desktop-supervision-evidence
  parallel_safe: []
recommended_agent: release-qa-developer
recommended_model: deep-reasoning
---

# B13 — Certify parity and release readiness

## Goal

Close bounded release evidence for already-owned track integrations without becoming a late product-code integration sprint.

## Required work and deliverables

- Collect the already-owned track-integration results for oracle, migration, sync, launcher, API, client, mobile, scheduler, supervision, security, upgrade, and platform gates.
- Record exact performance hardware/tools and anchor development-gate reports. Invoke B2's `tools/runtime-release-gate/validate-close` at certification cutoff; B13 owns no detector or validator implementation.
- Record gaps as separately owned fix beads/branches; this sprint never edits product code.

## Relationships

The structured relations name the final evidence artifacts; all feature tracks close independently before certification consumes their results.

## This sprint does not close

No new feature or deferred redesign; AI/context graph work remains out of scope.

## Acceptance and validation

- `req:REQ-RELEASE-EVIDENCE`: every feature criterion has one prior integration owner and a passing artifact; this sprint only verifies completeness, hashes, platform identity, and approved exclusions.
- Every Phase B anchor development report is present and passing; no open P0/P1 defect remains. Any defect creates a separate fix owner and blocks this evidence close.
- B2 release-history validation proves every dispatch check was recorded and either the release was absent at cutoff or the digest-bound 0.2.0 interrupt passed; when 0.2.0 was available, the evidence proves its upgrade was the next Shpherd work started before any other Phase B work. Direct, tampered, or ambiguous certification or epic close fails closed.
- Upgrade evidence proves that the sc-runtime 0.2.0 upgrade applied every dependency update supplied by the release and left sc-lint 0.8.4 or newer fully installed in the consumer repository.
- Launcher evidence proves that an unset launcher selects Herdr by default and that an explicitly selected tmux backend can launch, observe, focus, and stop a team.

Every deliverable is production-ready for release-evidence closure.
