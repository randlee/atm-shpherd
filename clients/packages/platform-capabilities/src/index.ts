/** Optional presentation enhancements; ordinary team reads never require native APIs. */
export interface PlatformCapabilities {
  readonly platform: "browser" | "tauri";
  readonly notifications: boolean;
  notify(title: string): Promise<"unsupported" | "sent">;
}
export const browserCapabilities: PlatformCapabilities = Object.freeze({
  platform: "browser",
  notifications: false,
  async notify(_title: string) {
    return "unsupported" as const;
  },
});
/** Parse only the preview team route. Never execute URLs or accept credentials. */
export function parseTeamDeepLink(input: string): string | undefined {
  try {
    const url = new URL(input);
    if (
      url.protocol !== "shpherd:" ||
      url.hostname !== "team" ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash
    )
      return undefined;
    const id = url.pathname.slice(1);
    return /^team-[a-z0-9-]{1,64}$/.test(id) ? id : undefined;
  } catch {
    return undefined;
  }
}
