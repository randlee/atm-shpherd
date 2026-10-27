import { describe, expect, it } from "vitest";
import { createMockDaemon } from "./index";
describe("fixture daemon", () => {
  it("provides independent deterministic catalog and detail snapshots", async () => {
    const port = createMockDaemon({ latencyMs: 0 });
    expect(await port.health()).toEqual({
      status: "ok",
      source: "fixture",
      apiVersion: "preview-1",
    });
    const catalog = await port.listTeams();
    expect(catalog).toHaveLength(3);
    expect(catalog[0]).not.toHaveProperty("members");
    const first = await port.getTeam("team-atlas");
    Object.assign(first.members[0] ?? {}, { name: "changed" });
    expect((await port.getTeam("team-atlas")).members[0]?.name).toBe("Juniper");
    expect(await createMockDaemon({ latencyMs: 0 }).listTeams()).toEqual(catalog);
  });
  it("reports unknown teams and isolates injected operation failure", async () => {
    const port = createMockDaemon({ latencyMs: 0, failures: ["getTeam"] });
    await expect(port.getTeam("team-atlas")).rejects.toMatchObject({ code: "unavailable" });
    expect(await port.listTeams()).toHaveLength(3);
    await expect(createMockDaemon({ latencyMs: 0 }).getTeam("missing")).rejects.toMatchObject({
      code: "not_found",
    });
  });
  it("cancels before and during requests", async () => {
    const port = createMockDaemon({ latencyMs: 100 });
    const controller = new AbortController();
    const pending = port.listTeams({ signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ code: "aborted" });
    await expect(port.health({ signal: controller.signal })).rejects.toMatchObject({
      code: "aborted",
    });
  });
});
