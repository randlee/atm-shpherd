import {
  DaemonError,
  type DaemonPort,
  type RequestOptions,
  type TeamDetail,
} from "@shpherd/daemon-contract";
const fixtures: readonly TeamDetail[] = [
  {
    id: "team-atlas",
    name: "Atlas",
    fleet: "Platform",
    project: "Runtime foundations",
    state: "running",
    memberCount: 3,
    host: "studio-mac",
    revision: "fixture-001",
    description: "Building the foundations for reliable agent workflows.",
    members: [
      { id: "atlas-lead", name: "Juniper", role: "Lead", state: "working" },
      { id: "atlas-build", name: "Cedar", role: "Engineer", state: "working" },
      { id: "atlas-review", name: "Willow", role: "Reviewer", state: "ready" },
    ],
  },
  {
    id: "team-harbor",
    name: "Harbor",
    fleet: "Product",
    project: "Operator experience",
    state: "idle",
    memberCount: 2,
    host: "workstation-west",
    revision: "fixture-002",
    description: "Making multi-team work clear, calm, and approachable.",
    members: [
      { id: "harbor-lead", name: "Sage", role: "Lead", state: "ready" },
      { id: "harbor-design", name: "Fern", role: "Designer", state: "ready" },
    ],
  },
  {
    id: "team-beacon",
    name: "Beacon",
    fleet: "Platform",
    project: "Release confidence",
    state: "attention",
    memberCount: 2,
    host: "build-node",
    revision: "fixture-003",
    description: "Watching release quality across the platform. One fixture member is offline.",
    members: [
      { id: "beacon-lead", name: "Ash", role: "Lead", state: "working" },
      { id: "beacon-qa", name: "Birch", role: "QA", state: "offline" },
    ],
  },
];
export interface MockOptions {
  readonly latencyMs?: number;
  readonly failures?: readonly ("health" | "listTeams" | "getTeam")[];
  readonly teams?: readonly TeamDetail[];
}
function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DaemonError("aborted"));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DaemonError("aborted"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
export function createMockDaemon(options: MockOptions = {}): DaemonPort {
  const teams = structuredClone(options.teams ?? fixtures);
  const before = async (
    operation: "health" | "listTeams" | "getTeam",
    request?: RequestOptions,
  ) => {
    await wait(options.latencyMs ?? 180, request?.signal);
    if (options.failures?.includes(operation)) throw new DaemonError("unavailable");
  };
  return {
    async health(request) {
      await before("health", request);
      return { status: "ok", source: "fixture", apiVersion: "preview-1" };
    },
    async listTeams(request) {
      await before("listTeams", request);
      return teams.map(
        ({
          members: _members,
          description: _description,
          host: _host,
          revision: _revision,
          ...team
        }) => ({ ...team }),
      );
    },
    async getTeam(id, request) {
      await before("getTeam", request);
      const team = teams.find((entry) => entry.id === id);
      if (!team) throw new DaemonError("not_found");
      return structuredClone(team);
    },
  };
}
