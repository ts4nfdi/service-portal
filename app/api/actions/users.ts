'use server'

import { ActionResponse } from "./types";
import { getHttpHeaderForGateway } from "@/app/libs/server_utils";
import { REQUEST_FAILED_MESSAGE, SERVER_ERROR_MESSAGE, ACTION_NOT_ALLOWED_MESSAGE } from "@/app/libs/responseStrings";
import { getUserToken } from "@/app/libs/auth";


export async function getUserList(): Promise<ActionResponse> {
  try {
    let token = await getUserToken();
    if (!token) {
      return { status: false, content: ACTION_NOT_ALLOWED_MESSAGE }
    }
    let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/users/", {
      headers: await getHttpHeaderForGateway(token)
    });
    if (!resp.ok) {
      return { status: false, content: REQUEST_FAILED_MESSAGE }
    }
    let res: { username: string }[] = await resp.json();
    return { status: true, content: res }

  } catch {
    return { status: false, content: SERVER_ERROR_MESSAGE }
  }
}
