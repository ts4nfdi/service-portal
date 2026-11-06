import { getIncubators } from "@/app/api/actions/incubators";

export async function GET() {
  const data = await getIncubators();
  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}
