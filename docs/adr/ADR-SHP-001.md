# ADR-SHP-001 — Runtime/application boundary

- **Status:** Approved
- **Owner:** B2
- **Decision:** sc-runtime remains generic; all Shpherd schema, policy, stores, adapters, services, and UI live in app-named packages. B2 installs the always-executed release detector/history/dispatch/close gate; the interrupt owns only the triggered runtime upgrade.
- **Alternatives rejected:** copy/rename scmux crates; place application stores or team policy in sc-runtime.
- **Consequences:** runtime upgrades remain dependency/template changes; Shpherd owns compatibility work.
- **Evidence:** boundary manifests, dependency checks, absence of Shpherd imports in sc-runtime packages, and absent/new/tampered/concurrent/fail-closed release-gate fixtures.
