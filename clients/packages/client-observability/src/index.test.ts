import { describe, expect, it, vi } from "vitest";
import { ok, type ObservabilityClient } from "@synaptic-canvas/sc-observability";
import { createClientObservability, type ClientEvent } from "./index";
const accepted: ObservabilityClient["log"] = (_event) => ok({ kind: "scheduled" });
describe("nonthrowing redacted observability", () => {
  it("defaults to an inert browser adapter", () => {
    expect(() =>
      createClientObservability().record({ operation: "team_catalog", outcome: "success" }),
    ).not.toThrow();
  });
  it("passes only allowed values to the verified 1.5.0 host client API", () => {
    const log = vi.fn(accepted);
    const event = {
      operation: "team_detail",
      outcome: "success",
      credentials: "secret",
      terminal: "private output",
      mailbox: "private message",
      prompt: "private prompt",
      nested: { token: "secret" },
    } as const;
    createClientObservability({ log }).record(event);
    expect(log).toHaveBeenCalledOnce();
    const encoded = log.mock.calls[0]?.[0];
    expect(encoded).toMatchObject({
      action: "team_detail",
      outcome: "success",
      target: "shpherd.client",
      fields: {},
      message: null,
    });
    expect(JSON.stringify(encoded)).not.toMatch(/secret|private/);
  });
  it("drops invalid runtime enum values and catches accessor/sink errors", () => {
    const log = vi.fn(accepted);
    const adapter = createClientObservability({ log });
    adapter.record({ operation: "secret-token", outcome: "success" } as unknown as ClientEvent);
    adapter.record({ operation: "team_detail", outcome: "secret-token" } as unknown as ClientEvent);
    expect(log).not.toHaveBeenCalled();
    expect(() =>
      adapter.record({
        get operation() {
          throw new Error("secret");
        },
      } as unknown as ClientEvent),
    ).not.toThrow();
    expect(() =>
      createClientObservability({
        log() {
          throw new Error("host failed");
        },
      }).record({ operation: "team_catalog", outcome: "failure" }),
    ).not.toThrow();
  });
  it("absorbs a broken host's rejected thenable without altering caller control flow", async () => {
    const log = (() =>
      Promise.reject(new Error("host failed"))) as unknown as ObservabilityClient["log"];
    expect(() =>
      createClientObservability({ log }).record({ operation: "team_catalog", outcome: "success" }),
    ).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();
  });
});
