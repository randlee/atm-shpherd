/** Preparation-only read port. This is not a committed wire/API schema. */
export type TeamState = "running" | "idle" | "attention";
export interface Health {
  readonly status: "ok" | "degraded";
  readonly source: "fixture";
  readonly apiVersion: "preview-1";
}
export interface TeamSummary {
  readonly id: string;
  readonly name: string;
  readonly fleet: string;
  readonly project: string;
  readonly state: TeamState;
  readonly memberCount: number;
}
export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly state: "working" | "ready" | "offline";
}
export interface TeamDetail extends TeamSummary {
  readonly description: string;
  readonly host: string;
  readonly revision: string;
  readonly members: readonly TeamMember[];
}
export interface RequestOptions {
  readonly signal?: AbortSignal;
}
export interface DaemonPort {
  health(options?: RequestOptions): Promise<Health>;
  listTeams(options?: RequestOptions): Promise<readonly TeamSummary[]>;
  getTeam(id: string, options?: RequestOptions): Promise<TeamDetail>;
}
export type DaemonErrorCode = "unavailable" | "not_found" | "aborted";
export class DaemonError extends Error {
  constructor(readonly code: DaemonErrorCode) {
    super(code);
    this.name = "DaemonError";
  }
}
export function errorMessage(error: unknown): string {
  if (error instanceof DaemonError && error.code === "not_found")
    return "This team is no longer available. Refresh the catalog.";
  return "We couldn’t load this data. Please try again.";
}
