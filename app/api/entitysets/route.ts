import { getEntitySets } from "@/app/api/actions/entitysets";

export async function GET() {
  const data = await getEntitySets();
  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}
