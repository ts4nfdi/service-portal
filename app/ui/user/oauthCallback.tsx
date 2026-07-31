"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getCodeUrl } from "@/app/libs/authUrl";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "@/app/user/messages";

type LoginStatus = "loading" | "needsRegistration" | "error";

export default function OAuthCallback() {
  const t = userPageMessages[useLocale()];
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<LoginStatus>("loading");
  const [username, setUsername] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      return;
    }
    signIn("credentials", { code, redirect: false })
      .then((result) => {
        if (result?.ok) {
          finishLogin();
          return;
        }
        const nextRegistrationId = getRegistrationId(result?.error);
        if (nextRegistrationId) {
          setRegistrationId(nextRegistrationId);
          setStatus("needsRegistration");
          return;
        }
        setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [code]);

  if (!code) {
    return null;
  }

  const registerUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    signIn("credentials", { registrationId, username, redirect: false })
      .then((result) => {
        if (result?.ok) {
          finishLogin();
          return;
        }
        setStatus("error");
      })
      .catch(() => setStatus("error"));
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-white text-[#445669] dark:bg-gray-900 dark:text-white">
      {status === "needsRegistration" ? (
        <form
          className="flex w-full max-w-sm flex-col gap-4 px-4"
          onSubmit={registerUser}
        >
          <p className="px-0 text-center">{t.registerSsoUser}</p>
          <div>
            <label htmlFor="oauth-username" className="block">
              {t.username}
            </label>
            <input
              id="oauth-username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={t.usernamePlaceholder}
              required
            />
          </div>
          <button className="btn" type="submit">
            {t.signup}
          </button>
        </form>
      ) : status === "error" ? (
        <>
          <p>{t.loginFailed}</p>
          <a className="btn" href={getCodeUrl()}>
            {t.tryAgain}
          </a>
        </>
      ) : (
        <>
          <div
            className="h-12 w-12 animate-spin rounded-full border-4 border-[#445669] border-t-transparent dark:border-white dark:border-t-transparent"
            aria-label={t.loggingIn}
          />
          <p>{t.loggingIn}</p>
        </>
      )}
    </div>
  );
}

function finishLogin() {
  window.location.replace(window.location.pathname);
}

function getRegistrationId(error?: string | null) {
  return error?.startsWith("UserNotRegistered:")
    ? error.replace("UserNotRegistered:", "")
    : "";
}
