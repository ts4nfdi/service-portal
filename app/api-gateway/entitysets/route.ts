// Mockup API endpoint for serving data of entity sets.
// This can be removed in the future when a real data is provided in the API Gateway.

import { promises as fs } from 'fs';

import path from 'path';

export async function GET() {
    const filePath = path.join(process.cwd(), 'public/data', 'entity-set-mockup.json');
    const text = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(text);
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
