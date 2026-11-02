"use client";

import { useTranslations } from "@/app/i18n";

export default function LoginButton({ href }: { href: string }) {
  const t = useTranslations("User");
  return <a href={href} className="btn !bg-[#F8F8F8] !text-[#445669]">{t("login")}</a>;
}
