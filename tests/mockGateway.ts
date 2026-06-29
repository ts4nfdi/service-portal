import { createServer } from "node:http";
import ProvidersJson from "../app/provider/provider.json";
import { MOCK_COLLECTIONS } from "./fixtures/collections";

export const MOCK_GATEWAY_PORT = 32123;
export const MOCK_GATEWAY_BASE_URL = `http://127.0.0.1:${MOCK_GATEWAY_PORT}`;

const mockProviders = Object.entries(ProvidersJson).map(([name, provider]) => ({
  type: provider.type,
  name,
  url: provider.api,
  searchUrl: `${provider.api}/search`,
  artefactsUrl: `${provider.api}/artefacts`,
}));

export function startMockGateway() {
  const mockGateway = createServer((request, response) => {
    if (
      request.url === "/collections/" ||
      request.url === "/users/collections/"
    ) {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(MOCK_COLLECTIONS));
      return;
    }

    if (request.url === "/config/databases") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(mockProviders));
      return;
    }

    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Not found" }));
  });

  mockGateway.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code !== "EADDRINUSE") {
      throw error;
    }
  });
  mockGateway.listen(MOCK_GATEWAY_PORT, "127.0.0.1").unref();
}
