"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCodeUrl } from "@/app/api/auth/route";

export default function OAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      return;
    }
    signIn("credentials", { code, redirect: false })
      .then((result) => {
        if (result?.ok) {
          window.history.replaceState({}, "", window.location.pathname);
          router.refresh();
          return;
        }
        setHasError(true);
      })
      .catch(() => setHasError(true));
  }, [code, router]);

  if (!code) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-white text-[#445669] dark:bg-gray-900 dark:text-white">
      {hasError ? (
        <>
          <p>We could not complete your login.</p>
          <a className="btn" href={getCodeUrl()}>
            Try again
          </a>
        </>
      ) : (
        <>
          <div
            className="h-12 w-12 animate-spin rounded-full border-4 border-[#445669] border-t-transparent dark:border-white dark:border-t-transparent"
            aria-label="Logging in"
          />
          <p>Logging you in...</p>
        </>
      )}
    </div>
  );
}
