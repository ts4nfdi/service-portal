'use server'

import { ActionResponse } from "./types";
import { getUserToken } from "@/app/libs/auth";
import { ACTION_NOT_ALLOWED_MESSAGE } from "@/app/libs/responseStrings";
import { getHttpHeaderForGateway } from "@/app/libs/server_utils";
import { safeGet, safeHead } from "@/app/libs/safeHttp";

export type TerminologySuggestionForm = {
  name: string;
  purl: string;
  collectionIds: string[];
  username: string;
  email: string;
  reason: string;
  metadata: Record<string, string>;
};

export type TerminologyShapeIssue = { about: string; text: string };

export type TerminologyShapeResult = {
  error: TerminologyShapeIssue[];
  info: string[];
};

const SHACL_VALIDATOR_URL = "https://www.itb.ec.europa.eu/shacl/shacl/api/validate";
const DEFAULT_SHAPE_URL = "https://www.purl.org/ontologymetadata/shape/20240502";
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;

async function readLimited(response: Response) {
  if (Number(response.headers.get("content-length")) > MAX_RESPONSE_SIZE) {
    throw new Error("Response is too large");
  }
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let size = 0;
  let content = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) return content + decoder.decode();
    size += value.byteLength;
    if (size > MAX_RESPONSE_SIZE) {
      await reader.cancel();
      throw new Error("Response is too large");
    }
    content += decoder.decode(value, { stream: true });
  }
}

function errorTarget(message: string) {
  return message.match(/Recommended property:\s*([^\n]+)/)?.[1]?.trim() ?? "";
}

function terminologySyntax(terminology: Awaited<ReturnType<typeof safeGet>>) {
  const contentType = terminology.contentType.split(";", 1)[0].trim().toLowerCase();
  const source = `${new URL(terminology.url).pathname} ${terminology.contentDisposition}`.toLowerCase();
  const syntaxByType: Record<string, string> = {
    "text/turtle": "text/turtle",
    "application/x-turtle": "text/turtle",
    "application/n-triples": "application/n-triples",
    "application/n-quads": "application/n-quads",
    "application/ld+json": "application/ld+json",
    "application/trig": "application/trig",
    "application/rdf+xml": "application/rdf+xml",
    "application/owl+xml": "application/rdf+xml",
  };
  if (syntaxByType[contentType]) return syntaxByType[contentType];
  if (/\.ttl(?:$|["'])/.test(source)) return "text/turtle";
  if (/\.nt(?:$|["'])/.test(source)) return "application/n-triples";
  if (/\.nq(?:$|["'])/.test(source)) return "application/n-quads";
  if (/\.jsonld(?:$|["'])/.test(source)) return "application/ld+json";
  if (/\.trig(?:$|["'])/.test(source)) return "application/trig";
  return "application/rdf+xml";
}

async function authenticatedHeaders() {
  const token = await getUserToken();
  if (!token && process.env.DEBUG_MODE !== "true") return null;
  return getHttpHeaderForGateway(token);
}

function suggestionUrl(path: string, purl: string) {
  return `${process.env.GATEWAY_BASE_URL}/ontologysuggestion/${path}?purl=${encodeURIComponent(purl)}`;
}

export async function validateTerminologyPurl(purl: string): Promise<ActionResponse> {
  if (!await authenticatedHeaders()) {
    return { status: false, content: ACTION_NOT_ALLOWED_MESSAGE };
  }
  try {
    const response = await safeHead(purl);
    const contentType = response.contentType.split(";", 1)[0].trim().toLowerCase();
    const rdfTypes = [
      "text/turtle",
      "application/x-turtle",
      "application/rdf+xml",
      "application/owl+xml",
      "application/n-triples",
      "application/n-quads",
      "application/ld+json",
      "application/trig",
    ];
    const genericTypes = [
      "application/octet-stream",
      "application/xml",
      "text/xml",
      "text/plain",
      "application/json",
    ];
    const ontologyFile = /\.(owl|ttl|rdf|nt|nq|jsonld|trig)(?:$|["'])/i.test(
      `${new URL(response.url).pathname} ${response.contentDisposition}`,
    );
    const valid = rdfTypes.includes(contentType) ||
      (genericTypes.includes(contentType) && ontologyFile);
    return {
      status: true,
      content: valid
        ? { valid: true }
        : { valid: false, reason: "PURL is not returning a terminology file" },
    };
  } catch {
    return {
      status: true,
      content: { valid: false, reason: "PURL is not a resolvable public HTTPS URL" },
    };
  }
}

export async function checkTerminologySuggestionExists(purl: string): Promise<ActionResponse> {
  try {
    const token = await getUserToken();
    if (!token) {
      return process.env.DEBUG_MODE === "true"
        ? { status: true, content: false }
        : { status: false, content: ACTION_NOT_ALLOWED_MESSAGE };
    }
    const headers = await getHttpHeaderForGateway(token);
    const response = await fetch(suggestionUrl("suggestion_exist", purl), { headers });
    if (!response.ok) return { status: false, content: false };
    const data = await response.json();
    return { status: true, content: !!(data._result?.exist ?? data.exist) };
  } catch {
    return { status: false, content: false };
  }
}

export async function runTerminologyShapeTest(purl: string): Promise<ActionResponse> {
  try {
    if (!await authenticatedHeaders()) {
      return { status: false, content: ACTION_NOT_ALLOWED_MESSAGE };
    }
    const deadline = Date.now() + 30_000;
    const [terminology, shape] = await Promise.all([
      safeGet(purl, deadline),
      safeGet(process.env.ONTOLOGY_SHAPE_TEST_URL ?? DEFAULT_SHAPE_URL, deadline),
    ]);
    const remaining = deadline - Date.now();
    if (remaining <= 0) return { status: false, content: null };
    const response = await fetch(SHACL_VALIDATOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentToValidate: terminology.content,
        contentSyntax: terminologySyntax(terminology),
        embeddingMethod: "STRING",
        validationType: "extended",
        reportSyntax: "application/ld+json",
        externalRules: [{
          ruleSet: shape.content,
          embeddingMethod: "STRING",
          ruleSyntax: "text/turtle",
        }],
        addInputToReport: false,
        addShapesToReport: false,
        addRdfReportToReport: false,
        rdfReportSyntax: "string",
        wrapReportDataInCDATA: false,
      }),
      signal: AbortSignal.timeout(remaining),
    });
    if (!response.ok) return { status: false, content: null };
    const report = JSON.parse(await readLimited(response));
    if (!Array.isArray(report["@graph"])) return { status: false, content: null };
    const result: TerminologyShapeResult = { error: [], info: [] };
    for (const item of report["@graph"]) {
      const severity = item["sh:resultSeverity"]?.["@id"];
      const message = item["sh:resultMessage"]?.["@value"];
      if (typeof message !== "string") continue;
      if (severity === "sh:Warning") {
        const text = message.split("Need help?")[0];
        result.error.push({ text, about: errorTarget(text) });
      } else if (severity === "sh:Info") {
        result.info.push(message);
      }
    }
    return {
      status: true,
      content: result,
    };
  } catch {
    return { status: false, content: null };
  }
}

export async function submitTerminologySuggestion(
  _suggestion: TerminologySuggestionForm,
): Promise<ActionResponse> {
  if (!await getUserToken() && process.env.DEBUG_MODE !== "true") {
    return { status: false, content: ACTION_NOT_ALLOWED_MESSAGE };
  }
  return { status: true, content: "ok" };
}
