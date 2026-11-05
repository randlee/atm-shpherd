# atm-shpherd — User Stories

> **Lineage:** migrated 2026-10-27 from `randlee/scmux` (`hendrix/alpha-prime/scmux/user-stories.md`).
> `atm-shpherd` supersedes scmux as the ATM team control plane, but the PRD is explicit that it is
> **not** a scmux fork: it ports scmux's team-definition, launch, observation and web-UI behaviour
> onto `sc-runtime`. Personas 1–3 are inherited and re-scoped to shpherd's nouns; personas 4–5 are
> new surfaces the scmux product never had (Tauri clients, second-computer launch).

Audience personas are the stable segments every feature must address. Each is expressed as
"As a &lt;role&gt;, I want &lt;capability&gt; so that &lt;benefit&gt;". Every new feature must address an existing
persona below, or explicitly add a new one here.

## Persona 1: Fleet Operator (Agent Orchestrator)

**As a fleet operator, I want to define and launch many agent teams declaratively, so that I can orchestrate every session from one seat.**

The primary consumer. Drives the team-definition plane (teams, members, roles, variants),
launch through the hmux/Herdr/tmux adapters, and the cross-host dashboard. In shpherd this is
the `shpherd` CLI plus the `atm-shpherd` daemon: the CLI never opens SQLite or PostgreSQL
directly, and every operator mutation goes through a named service command.

### Supporting evidence

- Team / member / variant definition: validated create, edit, move, clone, unlink, import
- Host-local single-flight guards and durable operation journals prevent duplicate panes on one host without claiming cross-host ownership
- Host-local SQLite plus shared PostgreSQL aggregate as the product's required shape
- Runtime pollers and adapters that cannot mutate definitions
- Stable cross-host team identity with immutable-by-default ATM identity

## Persona 2: Agent Ops Engineer

**As an agent-ops engineer, I want observability and management over agent teams, so that I can see what each agent is doing and intervene when needed.**

Inherited from scmux, re-scoped: the observability surface is the daemon's authenticated
HTTP/WebSocket API plus the dashboard, and diagnostics are one command. Day-to-day operations
must not be blind, and one team's error must not stop or rewrite another team.

### Supporting evidence

- Live team/session state projected from runtime adapters
- Structured logs with stable team/session/member identifiers
- Diagnostics comparable to `scmux doctor`, covering both the ATM messaging backbone and the
  session graph in one pass
- Discovery of runtime sessions that exist outside the definitions
- Isolation: an error for one team cannot stop or rewrite another

## Persona 3: Agent Scheduler (post-Phase-B)

**As a scheduler, I want agent teams to start on a schedule, so that recurring agent work runs without me launching windows by hand.**

This is a post-Phase-B capability. Phase B registers only the sc-cron heartbeat that polls ATM agent state; it registers no scheduled launch or instruction job. The later scheduling registration surface lives on sc-runtime primitives: a registered job is either an
in-process Rust hook or the documented `python3 &lt;module&gt; cron.tick` / `cron.stop` hook, receiving
one JSON object containing the schedule name and row payload only — never ATM team or phase fields.

### Supporting evidence

- Cron-style scheduling with minute-first expressions (six-field seconds-first is compatibility only)
- Misconfiguration fails at definition time, not by spawning a broken window later
- Persistent, restartable agent sessions that come up on their own cadence

## Persona 4: Desktop / Mobile Operator (Tauri client) — new in shpherd

**As an operator away from a terminal, I want the same product UI as an installed desktop or phone application, so that I can check and steer teams without a browser tab or an SSH session.**

`shpherd-ui` is one responsive TypeScript client over the daemon's authenticated HTTP/WebSocket
API, served to browsers and bundled by Tauri for macOS, Windows, Linux, iOS and Android. Tauri is
a first-class client target, not a replacement transport. Desktop and phone builds are
presentation shells only: they never open shpherd stores, run hmux, or issue host-local launch guards.

### Supporting evidence

- Durable desktop identity: icon, Dock/task-switcher presence, dedicated window, tray surface
- Native notifications and deep links
- Mobile: installed client with deep links, notifications, optional biometric unlock
- Identical versioned API, authorization policy, command semantics and event stream across form factors

## Persona 5: Multi-host Launcher — new in shpherd

**As an operator with more than one machine, I want to launch a synchronized ATM-backed team from an eligible second computer, so that capacity is not tied to the box I happen to be sitting at.**

This is the capability scmux never had. A host may explicitly import synchronized desired-state
data, but launch authority remains local: each eligible host resolves its own definition and may
run the same named team independently. The host-local guard prevents duplicate side effects on
that host without imposing cross-host ownership.

### Supporting evidence

- Host-aggregate synchronization between local SQLite and the shared PostgreSQL read model
- Host-local launch guard and durable idempotency gated on local eligibility
- ATM catalog importer as the read-only upstream source for launchable teams and rosters
- No duplicate ATM members or panes from replaying one host-local launch request; same-named teams may run independently on different hosts

---

## Migration note

The scmux source document listed 3 personas with supporting evidence collected for the `ap-sz7`
research beads. Personas 1–3 here keep that evidence, translated to shpherd's nouns; nothing was
dropped. Personas 4–5 come from the atm-shpherd PRD (goals 2 and 6, section 4.3) and have no
scmux predecessor.
