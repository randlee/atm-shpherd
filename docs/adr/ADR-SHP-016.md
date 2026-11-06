# ADR-SHP-016 — Evidence-based runtime release check

- **Status:** Approved
- **Owner:** B2
- **Amends:** ADR-SHP-001 release-governance mechanism only
- **Decision:** Use the authoritative sc-runtime tag/release source before feature dispatch and again at B13. Record tag or absence, release/asset digest when present, repository revision, timestamp, and routing decision in ordinary sprint evidence. An observed `v0.2.0` routes to the upgrade interrupt; an unavailable or ambiguous check blocks until retried. Beads chronology and sprint evidence are the audit record. Do not build a custom hash chain, repository lock, dispatch hook, or close interceptor.
- **Alternatives rejected:** a custom tamper-evident dispatch/closure subsystem; an unrecorded best-effort check; treating detector failure as release absence.
- **Consequences:** release priority remains deterministic and auditable without making Shpherd product code own a second workflow engine. B13 must repeat the check and match interrupt evidence to an observed digest.
- **Evidence:** absent/present/error detector fixtures, digest-matched interrupt evidence, and B13 certification-time release evidence.
