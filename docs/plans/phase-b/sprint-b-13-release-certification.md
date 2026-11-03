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
- Record exact performance hardware/tools and anchor development-gate reports. Run the authoritative release detection check at certification cutoff; if sc-runtime 0.2.0 existed at or before that cutoff, the interrupt must have passing digest-linked evidence.
- Record gaps as separately owned fix beads/branches; this sprint never edits product code.

## Relationships

The structured relations name the final evidence artifacts; all feature tracks close independently before certification consumes their results.

## This sprint does not close

No new feature or deferred redesign; AI/context graph work remains out of scope.

## Acceptance and validation

- `req:REQ-RELEASE-EVIDENCE`: every feature criterion has one prior integration owner and a passing artifact; this sprint only verifies completeness, hashes, platform identity, and approved exclusions.
- Every Phase B anchor development report is present and passing; no open P0/P1 defect remains. Any defect creates a separate fix owner and blocks this evidence close.
- Release history audit proves every dispatch check was recorded and either the release was absent at cutoff or the 0.2.0 interrupt passed; the certification/epic close command fails closed otherwise.

Every deliverable is production-ready for release-evidence closure.
