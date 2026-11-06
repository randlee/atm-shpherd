# ADR-SHP-001 — Runtime/application boundary

- **Status:** Approved
- **Owner:** B2
- **Decision:** sc-runtime remains generic; all Shpherd schema, policy, stores, adapters, services, and UI live in app-named packages. The original custom release-governance portion is superseded by ADR-SHP-016; the interrupt still owns only the triggered runtime upgrade.
- **Alternatives rejected:** copy/rename scmux crates; place application stores or team policy in sc-runtime.
- **Consequences:** runtime upgrades remain dependency/template changes; Shpherd owns compatibility work.
- **Evidence:** boundary manifests, dependency checks, absence of Shpherd imports in sc-runtime packages, plus ADR-SHP-016 release-check evidence.
