import { Resolver } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { request } from "node:https";
import { checkServerIdentity } from "node:tls";

const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;
const blockedAddresses = new BlockList();
const globalIpv6Addresses = new BlockList();

globalIpv6Addresses.addSubnet("2000::", 3, "ipv6");

[
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
].forEach(([address, prefix]) => blockedAddresses.addSubnet(address as string, prefix as number, "ipv4"));

[
  ["::", 128],
  ["::1", 128],
  ["::ffff:0:0:0", 96],
  ["64:ff9b::", 96],
  ["64:ff9b:1::", 48],
  ["100::", 64],
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
  ["5f00::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
].forEach(([address, prefix]) => blockedAddresses.addSubnet(address as string, prefix as number, "ipv6"));

type SafeResponse = {
  content: string;
  contentDisposition: string;
  contentType: string;
  location?: string;
  status: number;
  url: string;
};

function isPublicAddress(address: string) {
  const embeddedIpv4 = getEmbeddedIpv4(address);
  if (embeddedIpv4) {
    return !blockedAddresses.check(embeddedIpv4, "ipv4");
  }
  const family = isIP(address);
  if (family === 4) return !blockedAddresses.check(address, "ipv4");
  return family === 6 &&
    globalIpv6Addresses.check(address, "ipv6") &&
    !blockedAddresses.check(address, "ipv6");
}

function getEmbeddedIpv4(address: string) {
  const normalized = isIP(address) === 6
    ? new URL(`https://[${address}]/`).hostname.slice(1, -1).toLowerCase()
    : address.toLowerCase();
  const suffix = normalized.startsWith("::ffff:")
    ? normalized.slice(7)
    : normalized.startsWith("::")
      ? normalized.slice(2)
      : "";
  if (!suffix) return null;
  if (isIP(suffix) === 4) return suffix;

  const parts = suffix.split(":");
  if (parts.length > 2 || parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) {
    return null;
  }
  const high = parts.length === 2 ? Number.parseInt(parts[0], 16) : 0;
  const low = Number.parseInt(parts.at(-1)!, 16);
  return [high >> 8, high & 255, low >> 8, low & 255].join(".");
}

function resolveAddresses(hostname: string, deadline: number) {
  return new Promise<string[]>((resolve, reject) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      reject(new Error("Request timed out"));
      return;
    }
    const resolver = new Resolver();
    let settled = false;
    const finish = (addresses?: string[], error?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(addresses!);
    };
    const timer = setTimeout(() => {
      resolver.cancel();
      finish(undefined, new Error("Request timed out"));
    }, remaining);
    Promise.allSettled([
      resolver.resolve4(hostname),
      resolver.resolve6(hostname),
    ]).then((results) => {
      const addresses = results.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      );
      if (!addresses.length) {
        finish(undefined, new Error("Host could not be resolved"));
        return;
      }
      finish(addresses);
    });
  });
}

async function resolveUrl(value: string, deadline: number) {
  const url = new URL(value);
  const hostname = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (url.protocol !== "https:" || !hostname || url.username || url.password) {
    throw new Error("Only public HTTPS URLs are allowed");
  }

  const addresses = isIP(hostname)
    ? [hostname]
    : await resolveAddresses(hostname, deadline);
  if (!addresses.length || addresses.some((address) => !isPublicAddress(address))) {
    throw new Error("Host does not resolve exclusively to public addresses");
  }
  return { url, hostname, address: addresses[0] };
}

function hostHeader(hostname: string, port: number) {
  const host = hostname.includes(":") ? `[${hostname}]` : hostname;
  return port === 443 ? host : `${host}:${port}`;
}

function pinnedRequest(
  url: URL,
  hostname: string,
  address: string,
  deadline: number,
  method: "GET" | "HEAD",
  metadataOnly = false,
): Promise<SafeResponse> {
  const port = Number(url.port) || 443;
  return new Promise((resolve, reject) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      reject(new Error("Request timed out"));
      return;
    }
    let settled = false;
    let activeResponse: import("node:http").IncomingMessage | undefined;
    const finish = (response?: SafeResponse, error?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadlineTimer);
      if (error) reject(error);
      else resolve(response!);
    };
    const req = request({
      host: address,
      port,
      path: `${url.pathname || "/"}${url.search}`,
      method,
      family: isIP(address),
      servername: isIP(hostname) ? undefined : hostname,
      rejectUnauthorized: true,
      checkServerIdentity: (_host, certificate) => checkServerIdentity(hostname, certificate),
      headers: {
        Host: hostHeader(hostname, port),
        "Accept-Encoding": "identity",
        ...(method === "GET" && metadataOnly ? { Range: "bytes=0-0" } : {}),
      },
      timeout: remaining,
      agent: false,
    }, async (response) => {
      activeResponse = response;
      try {
        const status = response.statusCode ?? 0;
        const location = response.headers.location;
        if (status >= 300 && status < 400) {
          response.destroy();
          finish({ content: "", contentDisposition: "", contentType: "", location, status, url: url.toString() });
          return;
        }
        if (method === "HEAD" && (status < 200 || status >= 300)) {
          response.destroy();
          finish({ content: "", contentDisposition: "", contentType: "", status, url: url.toString() });
          return;
        }
        if (status < 200 || status >= 300) {
          response.destroy();
          finish(undefined, new Error("Remote content could not be fetched"));
          return;
        }
        if (method === "HEAD" || metadataOnly) {
          response.destroy();
          finish({
            content: "",
            contentDisposition: String(response.headers["content-disposition"] ?? ""),
            contentType: String(response.headers["content-type"] ?? ""),
            status,
            url: url.toString(),
          });
          return;
        }
        if (Number(response.headers["content-length"]) > MAX_RESPONSE_SIZE) {
          response.destroy();
          finish(undefined, new Error("Response is too large"));
          return;
        }

        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of response) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += buffer.byteLength;
          if (size > MAX_RESPONSE_SIZE) {
            response.destroy();
            throw new Error("Response is too large");
          }
          chunks.push(buffer);
        }
        finish({
          content: Buffer.concat(chunks).toString("utf8"),
          contentDisposition: String(response.headers["content-disposition"] ?? ""),
          contentType: String(response.headers["content-type"] ?? ""),
          status,
          url: url.toString(),
        });
      } catch (error) {
        finish(undefined, error);
      }
    });
    const deadlineTimer = setTimeout(() => {
      const error = new Error("Request timed out");
      activeResponse?.destroy(error);
      req.destroy(error);
      finish(undefined, error);
    }, remaining);
    req.on("timeout", () => req.destroy(new Error("Request timed out")));
    req.on("error", (error) => finish(undefined, error));
    req.end();
  });
}

async function safeRequest(
  value: string,
  method: "GET" | "HEAD",
  metadataOnly = false,
  deadline = Date.now() + 30_000,
) {
  let currentUrl = value;
  for (let redirects = 0; redirects <= 3; redirects++) {
    const target = await resolveUrl(currentUrl, deadline);
    const response = await pinnedRequest(target.url, target.hostname, target.address, deadline, method, metadataOnly);
    if (response.status < 300 || response.status >= 400) return response;
    if (!response.location || redirects === 3) throw new Error("Too many redirects");
    currentUrl = new URL(response.location, target.url).toString();
  }
  throw new Error("Too many redirects");
}

export async function safeGet(value: string, deadline = Date.now() + 30_000) {
  return safeRequest(value, "GET", false, deadline);
}

export async function safeHead(value: string) {
  const deadline = Date.now() + 30_000;
  const response = await safeRequest(value, "HEAD", true, deadline);
  if (response.status < 200 || response.status >= 300 || !response.contentType) {
    return safeRequest(value, "GET", true, deadline);
  }
  return response;
}
