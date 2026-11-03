# ADR-SHP-006 — Versioned ATM projection and command mutation

- **Status:** Approved
- **Owner:** B3C
- **Decision:** ATM catalog import is a versioned read-only projection with source fingerprint; roster mutations use only exact plural JSON commands under the B2 `shpherd-auth` non-serializable principal issued after daemon transport verification, followed by revision reconciliation. Caller claims never appear in wire/domain payloads and the ATM seam never imports daemon or B3B.
- **Alternatives rejected:** raw ATM writes, singular commands, mailbox import, or treating runtime status as definition truth.
- **Consequences:** unsupported projection/command versions fail typed; every command stores redacted request/result evidence.
- **Evidence:** pinned help/version/schema fixtures plus forged-claim, scope-mismatch, add/update/remove/reconcile simulator tests.
