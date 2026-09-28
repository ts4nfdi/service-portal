'use server'

import { ActionResponse } from "./types";
import { getUserToken } from "@/app/libs/auth";
import { ACTION_NOT_ALLOWED_MESSAGE } from "@/app/libs/responseStrings";
import { getHttpHeaderForGateway } from "@/app/libs/server_utils";
import { safeGet } from "@/app/libs/safeHttp";

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

function validTerminologyResponse(response: Awaited<ReturnType<typeof safeGet>>) {
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
  const extension = /\.(owl|ttl|rdf|nt|nq|jsonld|trig)$/i;
  const ontologyFile = extension.test(new URL(response.url).pathname) ||
    /\.(owl|ttl|rdf|nt|nq|jsonld|trig)(?:$|["'])/i.test(response.contentDisposition);
  return rdfTypes.includes(contentType) || (genericTypes.includes(contentType) && ontologyFile);
}

async function runShapeTest(
  terminology: Awaited<ReturnType<typeof safeGet>>,
  deadline: number,
) {
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new Error("Request timed out");
  const shapeResponse = await fetch(process.env.ONTOLOGY_SHAPE_TEST_URL ?? DEFAULT_SHAPE_URL, {
    signal: AbortSignal.timeout(remaining),
  });
  if (!shapeResponse.ok) throw new Error("Shape could not be fetched");
  const shape = await readLimited(shapeResponse);
  const validatorTimeout = deadline - Date.now();
  if (validatorTimeout <= 0) throw new Error("Request timed out");
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
        ruleSet: shape,
        embeddingMethod: "STRING",
        ruleSyntax: "text/turtle",
      }],
      addInputToReport: false,
      addShapesToReport: false,
      addRdfReportToReport: false,
      rdfReportSyntax: "string",
      wrapReportDataInCDATA: false,
    }),
    signal: AbortSignal.timeout(validatorTimeout),
  });
  if (!response.ok) throw new Error("Shape validation failed");
  const report = JSON.parse(await readLimited(response));
  if (!Array.isArray(report["@graph"])) throw new Error("Invalid shape report");

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
  return result;
}

export async function validateTerminologySuggestion(purl: string): Promise<ActionResponse> {
  if (!await authenticatedHeaders()) {
    return { status: false, content: ACTION_NOT_ALLOWED_MESSAGE };
  }
  let terminology: Awaited<ReturnType<typeof safeGet>>;
  try {
    terminology = await safeGet(purl);
  } catch {
    return {
      status: true,
      content: { valid: false, reason: "PURL is not a resolvable public HTTPS URL" },
    };
  }
  if (!validTerminologyResponse(terminology)) {
    return {
      status: true,
      content: { valid: false, reason: "PURL is not returning a terminology file" },
    };
  }
  if (terminology.truncated) {
    return { status: true, content: { valid: true, shapeTestFailed: true } };
  }
  try {
    return {
      status: true,
      content: { valid: true, shapeResult: await runShapeTest(terminology, Date.now() + 30_000) },
    };
  } catch {
    return { status: true, content: { valid: true, shapeTestFailed: true } };
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

export async function submitTerminologySuggestion(
  _suggestion: TerminologySuggestionForm,
): Promise<ActionResponse> {
  if (!await getUserToken() && process.env.DEBUG_MODE !== "true") {
    return { status: false, content: ACTION_NOT_ALLOWED_MESSAGE };
  }
  return { status: true, content: "ok" };
}
