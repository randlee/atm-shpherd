# Shpherd client preparation workspace

This independently runnable preview exercises a provisional read-only daemon port.
It does not depend on sc-runtime generation or implement a daemon. The catalog
contains three deterministic fixture teams and never connects to a real host.

## Run and verify

Use Node 22.12+ on the Node 22 LTS line (used in CI), Node 24, or Node 26+,
and Corepack. From this directory:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm dev
corepack pnpm check
corepack pnpm tauri:fmt
corepack pnpm tauri:check
corepack pnpm tauri:dev
corepack pnpm tauri:debug
```

Corepack reads the pinned pnpm version from package.json. If pnpm shims are not
enabled, run `corepack enable` first, or invoke scripts through Corepack with
Corepack's shims on PATH. Vite binds loopback port 1420. The debug build produces
a local native executable without installers/signing. Tauri requires the
[platform prerequisites](https://v2.tauri.app/start/prerequisites/), including
Xcode command-line tools on macOS. Android/iOS toolchains and signed distribution
are follow-up work; this sprint does not claim mobile acceptance.

## Boundaries

- `apps/shpherd-ui`: React/Vite responsive team catalog and member detail,
  independent loading/error/retry states and cancellation of obsolete requests.
- `apps/shpherd-tauri`: Tauri 2 presentation host, identity
  `com.synapticcanvas.shpherd`, desktop scheme `shpherd`, no command handlers,
  sidecars, store/ATM access, or daemon transport through IPC.
- `packages/daemon-contract`: typed read port and safe display errors. This is
  preview shape `preview-1`, **not an agreed HTTP/OpenAPI contract**.
- `packages/mock-daemon`: isolated snapshots, cancellable latency, operation
  failure injection, empty catalogs, and deterministic multi-team fixtures.
- `packages/platform-capabilities`: browser no-op enhancements and strict team
  deep-link parser. Ordinary team reads do not require native APIs.
- `packages/client-observability`: wrapper around the verified published 1.5.0
  TypeScript `encodeEvent`/`ObservabilityClient.log` API. Browser and current
  Tauri preview composition deliberately use the tested no-op transport.
  Only fixed operation/outcome enums can leave the wrapper. Raw IDs, errors,
  credentials, URLs, terminal output, ATM mailbox data, and prompts are excluded.
  Host errors and rejected thenables are swallowed and never awaited by the UI.

The shared UI currently uses browser-safe capabilities even when bundled into
Tauri. Scheme registration is prepared, but OS delivery and navigation are not
yet wired; notifications/tray/mobile packaging are also follow-up native work.
No production connection, authentication, mutation buttons, or endpoint selector
are implied by this preview. Connect the same read port to the authenticated
daemon after its API is reviewed; do not turn the mock into a second domain layer.

The Tauri CSP and empty capability list intentionally expose no privileged IPC
to the page. Future native bindings require explicit scoped capabilities and
tests. Production daemon origin policy and authentication remain daemon/client
integration work.

## Test surfaces

`pnpm check` checks formatting, lint, strict TypeScript, Vitest adapter/UI behavior,
and the browser production bundle. Tauri checks are separate because they require
native toolchains. CI checks the web workspace and host on Linux, macOS, and
Windows; generated installers, signing, and mobile builds are not included.

Initial verification on macOS, 2026-10-25, Node 22.23.1 / pnpm 10.34.9:

- `pnpm check` passed: format, lint, strict types, 14 tests, production Vite build.
- `pnpm tauri:fmt`, `pnpm tauri:check`, and `pnpm tauri:debug` passed.
  The last command uses the embedded-asset custom protocol and locked Cargo graph.
- Browser interaction verified Atlas → Harbor member detail, and a 390px viewport
  had a 390px document width (no horizontal overflow).
- The standalone native executable started without stderr with Vite stopped; its
  window was not exposed by the available UI automation, so native rendering is
  not claimed as visually verified. Linux/Windows CI and mobile builds were not
  run locally.

The icon source is `apps/shpherd-tauri/src-tauri/icons/source.svg`; regenerate the
committed platform variants with `pnpm --filter @shpherd/tauri tauri icon
src-tauri/icons/source.svg --output src-tauri/icons` from this directory.
Follow-up work is tracked in Beads: `shpherd-8ss` (daemon transport/authentication)
and `shpherd-75v` (native capabilities/mobile validation).
