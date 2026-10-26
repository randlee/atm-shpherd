import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMockDaemon } from "@shpherd/mock-daemon";
import { browserCapabilities } from "@shpherd/platform-capabilities";
import { createClientObservability } from "@shpherd/client-observability";
import { App } from "./App";
afterEach(cleanup);
function mount(daemon = createMockDaemon({ latencyMs: 0 })) {
  return render(
    <App
      daemon={daemon}
      capabilities={browserCapabilities}
      telemetry={createClientObservability()}
    />,
  );
}
describe("team overview", () => {
  it("shows loading then supports selecting different teams", async () => {
    mount();
    expect(screen.getByText("Loading team catalog…")).toBeDefined();
    await screen.findByRole("heading", { name: "Atlas" });
    expect(screen.getByText("Juniper")).toBeDefined();
    await userEvent.click(screen.getByRole("button", { name: /Harbor idle/ }));
    await screen.findByRole("heading", { name: "Harbor" });
    expect(screen.getByText("Sage")).toBeDefined();
    expect(screen.queryByText("Juniper")).toBeNull();
    expect(screen.getByText(/no daemon is connected/)).toBeDefined();
  });
  it("retries catalog failure and never displays raw error content", async () => {
    const port = createMockDaemon({ latencyMs: 0 });
    const list = vi.spyOn(port, "listTeams").mockRejectedValueOnce(new Error("credential=secret"));
    mount(port);
    await screen.findByRole("alert");
    expect(screen.queryByText(/credential=secret/)).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByRole("heading", { name: "Atlas" });
    expect(list).toHaveBeenCalledTimes(2);
  });
  it("isolates detail failures from the catalog and supports retry", async () => {
    const port = createMockDaemon({ latencyMs: 0 });
    vi.spyOn(port, "getTeam").mockRejectedValueOnce(new Error("private prompt"));
    mount(port);
    await screen.findByRole("alert");
    expect(screen.getByRole("button", { name: /Beacon attention/ })).toBeDefined();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText("Juniper");
  });
  it("renders an empty catalog", async () => {
    mount(createMockDaemon({ latencyMs: 0, teams: [] }));
    await screen.findByRole("heading", { name: "No teams yet" });
    expect(screen.queryByLabelText("Selected team details")).toBeNull();
  });
  it("ignores a stale detail response even if a transport ignores cancellation", async () => {
    const port = createMockDaemon({ latencyMs: 0 });
    const atlas = await port.getTeam("team-atlas");
    let release: (value: typeof atlas) => void = () => {};
    const get = vi.spyOn(port, "getTeam").mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    mount(port);
    await waitFor(() => expect(get).toHaveBeenCalled());
    await userEvent.click(screen.getByRole("button", { name: /Harbor idle/ }));
    await screen.findByRole("heading", { name: "Harbor" });
    release(atlas);
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Atlas" })).toBeNull());
    expect(screen.getByText("Sage")).toBeDefined();
  });
});
