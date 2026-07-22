"use client";

import { Loading } from "@/app/ui/commons/snippets";
import { useEffect } from "react";
import { getCodeUrl } from "@/app/api/auth/route";

export default function LoginFormWrapper() {
  useEffect(() => {
    window.location.replace(getCodeUrl());
  }, []);

  return (
    <div className="md:col-span-1 md:col-start-2">
      <Loading />
    </div>
  );
}
