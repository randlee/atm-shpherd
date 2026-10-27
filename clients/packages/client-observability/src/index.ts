import { encodeEvent, type ObservabilityClient } from "@synaptic-canvas/sc-observability";
export interface ClientEvent {
  readonly operation: "team_catalog" | "team_detail";
  readonly outcome: "success" | "failure";
}
export interface ClientObservability {
  record(event: ClientEvent): void;
}
/**
 * Browser default: deliberately no host transport. A native composition may
 * inject a verified sc-observability client after its host bindings are wired.
 * Redaction uses a closed allowlist: no IDs, URLs, text, errors, or arbitrary fields.
 */
export function createClientObservability(
  client?: Pick<ObservabilityClient, "log">,
): ClientObservability {
  return Object.freeze({
    record(event: ClientEvent): void {
      try {
        if (!client) return;
        const operation = event.operation;
        const outcome = event.outcome;
        if (operation !== "team_catalog" && operation !== "team_detail") return;
        if (outcome !== "success" && outcome !== "failure") return;
        const encoded = encodeEvent({
          level: "info",
          target: "shpherd.client",
          action: operation,
          outcome,
        });
        if (encoded.kind === "ok") {
          // Never await telemetry on an application read/action path.
          void Promise.resolve(client.log(encoded.value)).catch(() => {});
        }
      } catch {
        // Host exceptions and hostile input accessors must never affect the UI.
      }
    },
  });
}
