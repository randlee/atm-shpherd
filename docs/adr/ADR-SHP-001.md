# ADR-SHP-001 — Runtime/application boundary

- **Status:** Approved
- **Owner:** B2
- **Decision:** sc-runtime remains generic; all Shpherd schema, policy, stores, adapters, services, and UI live in app-named packages.
- **Alternatives rejected:** copy/rename scmux crates; place application stores or team policy in sc-runtime.
- **Consequences:** runtime upgrades remain dependency/template changes; Shpherd owns compatibility work.
- **Evidence:** boundary manifests, dependency checks, and absence of Shpherd imports in sc-runtime packages.
