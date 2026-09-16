import { createServer } from "node:http";
import ProvidersJson from "../app/provider/provider.json";
import { MOCK_COLLECTIONS } from "./fixtures/collections";

export const MOCK_GATEWAY_PORT = 32123;
export const MOCK_GATEWAY_BASE_URL = `http://127.0.0.1:${MOCK_GATEWAY_PORT}`;

export const MOCK_ONTOLOGIES = [
  {
    ontologyId: "alpha",
    provider: { provider_name: "tib" },
    description: ["Alpha terminology"],
    URI: "https://example.test/alpha",
  },
  {
    ontologyId: "beta",
    provider: { provider_name: "tib" },
    description: [],
    URI: "https://example.test/beta",
  },
  {
    ontologyId: "gamma",
    provider: { provider_name: "ebi" },
    description: ["Gamma terminology"],
    URI: "https://example.test/gamma",
  },
];

const createdCollections = new Map<string, unknown>();

const mockProviders = Object.entries(ProvidersJson).map(([name, provider]) => ({
  type: provider.type,
  name,
  url: provider.api,
  searchUrl: `${provider.api}/search`,
  artefactsUrl: `${provider.api}/artefacts`,
}));

export function startMockGateway() {
  const mockGateway = createServer((request, response) => {
    const requestUrl = new URL(request.url!, MOCK_GATEWAY_BASE_URL);
    if (requestUrl.pathname === "/api-gateway/auth/sso/authorize") {
      const redirectUri = new URL(requestUrl.searchParams.get("redirect_uri")!);
      redirectUri.searchParams.set("code", "mock-oauth-code");
      response.writeHead(302, { Location: redirectUri.toString() });
      response.end();
      return;
    }

    if (requestUrl.pathname === "/auth/sso/token" && request.method === "POST") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({
        access_token: "mock-access-token",
        id_token: "header.eyJwcmVmZXJyZWRfdXNlcm5hbWUiOiJPQXV0aCBVc2VyIn0.signature",
        scope: "oidc",
        expires_in: "3600"
      }));
      return;
    }

    if (requestUrl.pathname === "/auth/sso/login" && request.method === "POST") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({
        token: "mock-jwt",
        username: "OAuth User",
        expiration: "2099-01-01T00:00:00.000Z",
      }));
      return;
    }

    if (
      request.method === "GET" &&
      (request.url === "/collections/" ||
        request.url === "/users/collections/")
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

    if (requestUrl.pathname === "/api-gateway/ols4/api/ontologies") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({
        _embedded: { ontologies: MOCK_ONTOLOGIES },
      }));
      return;
    }

    if (requestUrl.pathname === "/__test__/created-collection" && request.method === "POST") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (requestUrl.pathname === "/__test__/created-collection" && request.method === "GET") {
      const label = requestUrl.searchParams.get("label") ?? "";
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(createdCollections.get(label) ?? null));
      return;
    }

    if (requestUrl.pathname === "/users/collections/" && request.method === "POST") {
      let body = "";
      request.on("data", (chunk) => { body += chunk; });
      request.on("end", () => {
        const createdCollection = JSON.parse(body) as { label?: string };
        createdCollections.set(createdCollection.label ?? "", createdCollection);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({
          ...createdCollection,
          id: "created-test-collection",
        }));
      });
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
