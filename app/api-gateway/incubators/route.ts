// Endpoint for serving data of the incubators via API.

import { promises as fs } from 'fs';

import path from 'path';

export async function GET() {
    const filePath = path.join(process.cwd(), 'app/ui/incubators', 'projects.json');
    const text = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(text);
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
