import { getOntologyOptions } from "@/app/api/actions/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  const options = await getOntologyOptions();
  return Response.json(options, {
    status: options === null ? 502 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
