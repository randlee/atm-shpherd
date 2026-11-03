# ADR-SHP-008 — Shared responsive UI with native shells

- **Status:** Approved
- **Owner:** B2
- **Decision:** one responsive web application is served to browsers and bundled in desktop/mobile Tauri shells through optional capability adapters.
- **Alternatives rejected:** separate native product logic or desktop-only UI.
- **Consequences:** browser capability remains the baseline; native failures cannot alter daemon results.
- **Evidence:** browser/desktop parity tests plus iOS/Android build and simulator/emulator smoke evidence.
