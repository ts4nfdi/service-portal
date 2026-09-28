import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { request } from "node:https";

const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const RDF_ACCEPT = [
  "text/turtle",
  "application/x-turtle",
  "application/rdf+xml",
  "application/owl+xml",
  "application/ld+json",
  "application/n-triples",
  "application/n-quads",
  "application/trig",
].join(", ");

const blocked = new BlockList();
const publicIpv6 = new BlockList();

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
].forEach(([address, prefix]) => blocked.addSubnet(address as string, prefix as number, "ipv4"));

publicIpv6.addSubnet("2000::", 3, "ipv6");
blocked.addSubnet("2001::", 32, "ipv6");
blocked.addSubnet("2002::", 16, "ipv6");

export type SafeResponse = {
  content: string;
  contentDisposition: string;
  contentType: string;
  truncated: boolean;
  url: string;
};

function safeResponse(
  response: import("node:http").IncomingMessage,
  url: URL,
  content = "",
  truncated = false,
): SafeResponse {
  return {
    content,
    contentDisposition: String(response.headers["content-disposition"] ?? ""),
    contentType: String(response.headers["content-type"] ?? ""),
    truncated,
    url: url.toString(),
  };
}

function isPublic(address: string) {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  return family === 6 && publicIpv6.check(address, "ipv6") && !blocked.check(address, "ipv6");
}

async function resolvePublicAddress(hostname: string, deadline: number) {
  const timeout = deadline - Date.now();
  if (timeout <= 0) throw new Error("Request timed out");
  let timer: ReturnType<typeof setTimeout>;
  const addresses = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await Promise.race([
      lookup(hostname, { all: true }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Request timed out")), timeout);
      }),
    ]).finally(() => clearTimeout(timer));
  if (!addresses.length || addresses.some(({ address }) => !isPublic(address))) {
    throw new Error("URL must resolve only to public addresses");
  }
  return addresses[0];
}

function readResponse(
  url: URL,
  address: string,
  family: number,
  deadline: number,
): Promise<{ response?: SafeResponse; redirect?: string }> {
  return new Promise((resolve, reject) => {
    const timeout = deadline - Date.now();
    if (timeout <= 0) {
      reject(new Error("Request timed out"));
      return;
    }

    const req = request(url, {
      agent: false,
      family,
      headers: { Accept: RDF_ACCEPT, "Accept-Encoding": "identity" },
      lookup: (_hostname, _options, callback) => callback(null, address, family),
      signal: AbortSignal.timeout(timeout),
    }, async (response) => {
      const status = response.statusCode ?? 0;
      if (status >= 300 && status < 400) {
        response.destroy();
        resolve({ redirect: response.headers.location });
        return;
      }
      if (status < 200 || status >= 300) {
        response.destroy();
        reject(new Error("Remote content could not be fetched"));
        return;
      }
      if (Number(response.headers["content-length"]) > MAX_RESPONSE_SIZE) {
        resolve({ response: safeResponse(response, url, "", true) });
        response.destroy();
        return;
      }

      try {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of response) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += buffer.byteLength;
          if (size > MAX_RESPONSE_SIZE) {
            resolve({ response: safeResponse(response, url, "", true) });
            response.destroy();
            return;
          }
          chunks.push(buffer);
        }
        resolve({ response: safeResponse(response, url, Buffer.concat(chunks).toString("utf8")) });
      } catch (error) {
        response.destroy();
        reject(error);
      }
    });

    req.on("error", reject);
    req.end();
  });
}

export async function safeGet(value: string, deadline = Date.now() + 30_000) {
  let url = new URL(value);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new Error("Only public HTTPS URLs are allowed");
    }
    const hostname = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "");
    const { address, family } = await resolvePublicAddress(hostname, deadline);
    const result = await readResponse(url, address, family, deadline);
    if (result.response) return result.response;
    if (!result.redirect || redirects === MAX_REDIRECTS) throw new Error("Too many redirects");
    url = new URL(result.redirect, url);
  }
  throw new Error("Too many redirects");
}
