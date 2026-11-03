# ADR-SHP-013 — Enrolled hosts and local project bindings

- **Status:** Approved
- **Owner:** B3B
- **Decision:** hosts enroll with stable HostId, daemon instance, auth-key fingerprint, capabilities, and health. Shared definitions carry logical ProjectId; each host resolves it through a local-only checkout binding validated under configured roots. Secrets remain in platform credential stores.
- **Alternatives rejected:** synchronizing absolute paths/credentials, implicit hostname trust, or clients choosing unchecked paths.
- **Consequences:** eligibility requires valid enrollment, health, capabilities, and resolved checkout evidence.
- **Evidence:** enrollment/auth, resolver traversal, capability, health, missing checkout, and credential-redaction tests.
