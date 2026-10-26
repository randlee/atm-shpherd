import { useCallback, useEffect, useState } from "react";
import { errorMessage, type DaemonPort, type TeamDetail } from "@shpherd/daemon-contract";
import type { PlatformCapabilities } from "@shpherd/platform-capabilities";
import type { ClientObservability } from "@shpherd/client-observability";

type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; data: T };
function useRequest<T>(read: (signal: AbortSignal) => Promise<T>, attempt: number): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt explicitly invalidates a failed or stale read.
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    void read(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: "ready", data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ status: "error", error });
      },
    );
    return () => controller.abort();
  }, [read, attempt]);
  return state;
}

function Failure({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="empty-state" role="alert">
      <h3>Something needs another try</h3>
      <p>{errorMessage(error)}</p>
      <button type="button" className="action" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
function TeamPanel({
  daemon,
  id,
  telemetry,
}: {
  daemon: DaemonPort;
  id: string;
  telemetry: ClientObservability;
}) {
  const [attempt, setAttempt] = useState(0);
  const read = useCallback(
    async (signal: AbortSignal) => {
      try {
        const team = await daemon.getTeam(id, { signal });
        if (!signal.aborted) telemetry.record({ operation: "team_detail", outcome: "success" });
        return team;
      } catch (error) {
        if (!signal.aborted) telemetry.record({ operation: "team_detail", outcome: "failure" });
        throw error;
      }
    },
    [daemon, id, telemetry],
  );
  const state = useRequest<TeamDetail>(read, attempt);
  if (state.status === "loading")
    return (
      <p className="empty-state" role="status">
        Loading team details…
      </p>
    );
  if (state.status === "error")
    return <Failure error={state.error} retry={() => setAttempt((n) => n + 1)} />;
  const team = state.data;
  return (
    <>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">{team.fleet} fleet</p>
          <h2>{team.name}</h2>
        </div>
        <span className={`badge ${team.state}`}>{team.state}</span>
      </div>
      <p className="description">{team.description}</p>
      <dl className="facts">
        <div>
          <dt>Project</dt>
          <dd>{team.project}</dd>
        </div>
        <div>
          <dt>Observed host</dt>
          <dd>{team.host}</dd>
        </div>
        <div>
          <dt>Catalog revision</dt>
          <dd>{team.revision}</dd>
        </div>
      </dl>
      <div className="roster-heading">
        <h3>Team members</h3>
        <span>{team.members.length} members</span>
      </div>
      <ul className="roster">
        {team.members.map((member) => (
          <li key={member.id}>
            <span className="avatar" aria-hidden="true">
              {member.name.slice(0, 1)}
            </span>
            <div className="member-name">
              <strong>{member.name}</strong>
              <span>{member.role}</span>
            </div>
            <span className={`member-state ${member.state}`}>{member.state}</span>
          </li>
        ))}
      </ul>
      <p className="detail-note">Preview catalog · Read-only fixture data</p>
    </>
  );
}
export interface AppProps {
  daemon: DaemonPort;
  capabilities: PlatformCapabilities;
  telemetry: ClientObservability;
}
export function App({ daemon, capabilities, telemetry }: AppProps) {
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<string>();
  const read = useCallback(
    async (signal: AbortSignal) => {
      try {
        const [health, teams] = await Promise.all([
          daemon.health({ signal }),
          daemon.listTeams({ signal }),
        ]);
        if (!signal.aborted) telemetry.record({ operation: "team_catalog", outcome: "success" });
        return { health, teams };
      } catch (error) {
        if (!signal.aborted) telemetry.record({ operation: "team_catalog", outcome: "failure" });
        throw error;
      }
    },
    [daemon, telemetry],
  );
  const state = useRequest(read, attempt);
  const teams = state.status === "ready" ? state.data.teams : [];
  const selectedId = teams.find((team) => team.id === selected)?.id ?? teams[0]?.id;
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to teams
      </a>
      <header className="topbar">
        <a className="brand" href="./">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          shpherd<span className="preview">Preview</span>
        </a>
        <span className="connection">
          <span className="connection-dot" />
          Fixture connection
        </span>
      </header>
      <main id="main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Your workspace, in view</p>
            <h1>Team overview</h1>
            <p className="subtitle">A shared view of the teams moving your work forward.</p>
          </div>
          <button
            type="button"
            className="action secondary"
            onClick={() => setAttempt((n) => n + 1)}
            disabled={state.status === "loading"}
          >
            Refresh catalog
          </button>
        </div>
        <div className="preview-banner">
          <span aria-hidden="true">◈</span>
          <p>
            Explore the Shpherd client preview. Teams and host activity are simulated; no daemon is
            connected.
          </p>
        </div>
        {state.status === "loading" ? (
          <p className="empty-state" role="status">
            Loading team catalog…
          </p>
        ) : state.status === "error" ? (
          <Failure error={state.error} retry={() => setAttempt((n) => n + 1)} />
        ) : (
          <>
            <section className="metrics" aria-label="Team summary">
              <div>
                <span>Total teams</span>
                <strong>{teams.length}</strong>
              </div>
              <div>
                <span>Running</span>
                <strong>{teams.filter((t) => t.state === "running").length}</strong>
              </div>
              <div>
                <span>Need attention</span>
                <strong>{teams.filter((t) => t.state === "attention").length}</strong>
              </div>
              <div>
                <span>Fixture health</span>
                <strong className="health">
                  {state.data.health.status === "ok" ? "Healthy" : "Degraded"}
                </strong>
              </div>
            </section>
            {teams.length === 0 ? (
              <div className="empty-state" role="status">
                <h2>No teams yet</h2>
                <p>The catalog is empty. Refresh when teams are available.</p>
              </div>
            ) : (
              <div className="workspace">
                <section className="catalog" aria-labelledby="catalog-heading">
                  <div className="section-heading">
                    <h2 id="catalog-heading">All teams</h2>
                    <span>{teams.length}</span>
                  </div>
                  <ul className="team-list">
                    {teams.map((team) => (
                      <li key={team.id}>
                        <button
                          type="button"
                          className={`team-card ${selectedId === team.id ? "selected" : ""}`}
                          aria-pressed={selectedId === team.id}
                          aria-label={`${team.name} ${team.state}, ${team.project}, ${team.fleet}, ${team.memberCount} members`}
                          onClick={() => setSelected(team.id)}
                        >
                          <span className="card-top">
                            <strong>{team.name}</strong>
                            <span className={`badge ${team.state}`}>{team.state}</span>
                          </span>
                          <span className="card-project">{team.project}</span>
                          <span className="card-footer">
                            {team.fleet} · {team.memberCount} members
                            <span aria-hidden="true">↗</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="detail" aria-label="Selected team details" aria-live="polite">
                  {selectedId && (
                    <TeamPanel
                      key={`${selectedId}:${attempt}`}
                      daemon={daemon}
                      id={selectedId}
                      telemetry={telemetry}
                    />
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </main>
      <footer>
        <span>Shpherd · Team control, thoughtfully connected.</span>
        <span>
          {capabilities.platform === "browser"
            ? "Browser-safe capabilities"
            : "Native presentation host"}
        </span>
      </footer>
    </div>
  );
}
