'use server'

import { promises as fs } from "fs";
import path from "path";

export async function getEntitySets() {
  const filePath = path.join(process.cwd(), "public/data", "entity-set-mockup.json");
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text);
}
