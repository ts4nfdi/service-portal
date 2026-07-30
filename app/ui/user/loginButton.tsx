"use client";

import Link from "next/link";
import { useTranslations } from "@/app/i18n";

export default function LoginButton({ href }: { href: string }) {
  const t = useTranslations("User");
  return <Link href={href} className="btn !bg-[#F8F8F8] !text-[#445669]">{t("login")}</Link>;
}
