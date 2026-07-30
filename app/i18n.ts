"use client";

import { createContext, createElement, useContext, type ReactNode } from "react";
import { homeMessages } from "./home.messages";
import { aboutMessages } from "./ui/about/messages";
import { siteMessages } from "./ui/site/messages";
import { userMessages } from "./ui/user/messages";

export const messages = {
  en: {...siteMessages.en, ...userMessages.en, ...homeMessages.en, ...aboutMessages.en},
  de: {...siteMessages.de, ...userMessages.de, ...homeMessages.de, ...aboutMessages.de},
} as const;

export type Locale = keyof typeof messages;

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ children, locale }: { children: ReactNode, locale: Locale }) {
  return createElement(LocaleContext.Provider, { value: locale }, children);
}

export function useTranslations(namespace: string) {
  const locale = useContext(LocaleContext);
  return (key: string) => messages[locale][namespace as keyof typeof messages.en][key as never] as string;
}

export function useLocale() {
  return useContext(LocaleContext);
}
