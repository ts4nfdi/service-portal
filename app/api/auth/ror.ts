"use server";

import { normalizeRorId, toLinkedRors, toRorIdentity, type RorIdentity } from "@/app/concepts/ror";
import { getUserToken } from "@/app/libs/auth";
import { getHttpHeaderForGateway } from "@/app/libs/server_utils";

export async function getRorIdentity(value: string): Promise<RorIdentity | null> {
  const id = normalizeRorId(value);
  if (!id) return null;
  try {
    const response = await fetch(`https://api.ror.org/v2/organizations/${id.split("/").pop()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const identity = toRorIdentity(await response.json());
    return identity?.id === id ? identity : null;
  } catch {
    return null;
  }
}

export async function getUserRors(token: string): Promise<string[]> {
  try {
    const response = await fetch(process.env.GATEWAY_BASE_URL! + "/auth/me", {
      headers: await getHttpHeaderForGateway(token),
      cache: "no-store",
    });
    return response.ok ? toLinkedRors(await response.json()) : [];
  } catch {
    return [];
  }
}

export async function updateUserRor(value: string): Promise<boolean> {
  try {
    const token = await getUserToken();
    if (!token) return false;
    const identity = await getRorIdentity(value);
    if (!identity) return false;
    const response = await fetch(process.env.GATEWAY_BASE_URL! + "/users/me/externalIdentifiers", {
      method: "POST",
      headers: { "Content-Type": "text/plain", Authorization: `Bearer ${token}` },
      body: identity.id,
    });
    return response.ok;
  } catch {
    return false;
  }
}
