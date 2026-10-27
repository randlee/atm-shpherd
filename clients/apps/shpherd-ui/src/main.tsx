import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createMockDaemon } from "@shpherd/mock-daemon";
import { browserCapabilities } from "@shpherd/platform-capabilities";
import { createClientObservability } from "@shpherd/client-observability";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(
  <StrictMode>
    <App
      daemon={createMockDaemon()}
      capabilities={browserCapabilities}
      telemetry={createClientObservability()}
    />
  </StrictMode>,
);
