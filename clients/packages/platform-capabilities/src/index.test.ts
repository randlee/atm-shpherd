import { describe, expect, it } from "vitest";
import { browserCapabilities, parseTeamDeepLink } from "./index";
describe("browser capabilities", () => {
  it("provides a safe unsupported notification capability without native imports", async () => {
    expect(browserCapabilities.notifications).toBe(false);
    await expect(browserCapabilities.notify("Preview")).resolves.toBe("unsupported");
  });
  it("accepts only credential-free team links", () => {
    expect(parseTeamDeepLink("shpherd://team/team-atlas")).toBe("team-atlas");
    for (const value of [
      "https://team/team-atlas",
      "shpherd://user:secret@team/team-atlas",
      "shpherd://team/team-atlas?token=x",
      "shpherd://team/team-atlas#secret",
      "shpherd://team/../../etc",
      "bad",
      "shpherd://team/team-%61tlas",
    ])
      expect(parseTeamDeepLink(value)).toBeUndefined();
  });
});
