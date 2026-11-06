'use client';

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { getCachedTerminologyOptions } from "@/app/ui/collection/terminologyOptionsCache";

export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void getCachedTerminologyOptions();
  }, []);

  return <SessionProvider>
    <ReauthenticationHandler />
    {children}
  </SessionProvider>;
}

function ReauthenticationHandler() {
  const { data, status } = useSession();
  const signingOut = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !data?.reauthenticate || signingOut.current) {
      return;
    }
    signingOut.current = true;
    void signOut({ redirect: false });
  }, [data?.reauthenticate, status]);

  return null;
}
