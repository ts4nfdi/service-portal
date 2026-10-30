"use client";

import { Loading } from "@/app/ui/commons/snippets";
import { useEffect } from "react";
import { getCodeUrl } from "@/app/libs/authUrl";
import { useGatewayUrl } from "@/app/ui/commons/gatewayProvider";

export default function LoginFormWrapper() {
  const gatewayUrl = useGatewayUrl();
  useEffect(() => {
    window.location.replace(getCodeUrl(gatewayUrl));
  }, [gatewayUrl]);

  return (
    <div className="md:col-span-1 md:col-start-2">
      <Loading />
    </div>
  );
}
