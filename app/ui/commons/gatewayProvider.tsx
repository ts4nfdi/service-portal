"use client";

import { createContext, useContext, type ReactNode } from "react";

const GatewayContext = createContext<string | undefined>(undefined);

export function GatewayProvider({ value, children }: {
  value?: string;
  children: ReactNode;
}) {
  return <GatewayContext.Provider value={value}>{children}</GatewayContext.Provider>;
}

export function useGatewayUrl() {
  return useContext(GatewayContext);
}
