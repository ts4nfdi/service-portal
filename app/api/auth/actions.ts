'use server'

import { SignUpFormProps } from "./types";
import { ActionResponse } from "../actions/types";
import { captchaIsValid } from "@/app/libs/captcha";


export async function signUpUser(formData: SignUpFormProps): Promise<ActionResponse> {
  try {
    let username = formData.username;
    let password = formData.passoword;
    let captcha = formData.captcha;

    if (!username || !await captchaIsValid(captcha)) {
      return { status: false, content: "form is not valid" };
    }

    let data = { username: username, password: password };

    let res = await fetch(process.env.GATEWAY_BASE_URL! as string + "/auth/register", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    let response = await res.json();

    if (res.ok && response?.status === "success") {
      return { status: true, content: "success" }
    }

    return { status: false, content: "something went wrong" }

  } catch (e) {
    console.log("Error while sign up: ", e);
    return { status: false, content: "something went wrong" }
  }

}
