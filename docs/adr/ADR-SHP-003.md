# ADR-SHP-003 — Thin authenticated clients

- **Status:** Approved
- **Owner:** B2
- **Decision:** CLI, browser, and Tauri clients use the authenticated daemon API; only daemon composition calls services. B2 freezes a non-serializable principal minted only from verified transport context; request payload claims never authorize domain or ATM work.
- **Alternatives rejected:** in-process CLI services, direct client stores, or Tauri IPC as remote protocol.
- **Consequences:** API version/auth availability gates every client action.
- **Evidence:** dependency/import checks, principal compile-fail/serde/escalation fixtures, and B10/B11 real-service API integration tests.
