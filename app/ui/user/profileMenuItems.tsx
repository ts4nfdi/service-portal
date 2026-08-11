'use client'

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "@/app/i18n";
import { localizePath } from "@/app/libs/localePath";

export default function UserProfileMenuItems(props: { username: string, email: string }) {
  const locale = useLocale();
  const t = useTranslations("User");

  function closeOrOpen() {
    let menu = document.getElementById("user-dropdown")! as HTMLDivElement;
    if (menu.classList.contains("hidden")) {
      menu.classList.remove("hidden");
      return;
    }
    menu.classList.add("hidden");
    return;
  }

  return (
    <div className="relative flex items-center">
      <button type="button" className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" id="user-menu-button" aria-expanded="false" onClick={closeOrOpen} key={"profilemenu-btn"}>
        <span className="sr-only">{t("openMenu")}</span>
        <Image className="rounded-full" width={35} height={35} src="/img/blank.jpg" alt="user photo" />
      </button>
      <div className="absolute right-0 top-full z-50 hidden mt-2 w-56 text-base list-none bg-gray-200 divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600" id="user-dropdown" key={"profileMenu-options"}>
        <div className="px-4 py-3">
          <span className="block text-sm text-gray-900 dark:text-white">{props.username}</span>
          <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">{props.email}</span>
        </div>
        <ul role="menu" aria-orientation="vertical" className="pl-0 m-0 list-none [&>li]:list-none [&>li::before]:content-none">
          <li>
            <Link href={localizePath("/user/dashboard/", locale)} className="profile-menu-item" onClick={closeOrOpen}>{t("dashboard")}</Link>
          </li>
          <li>
            <Link href={localizePath("/collection/myCollections/", locale)} className="profile-menu-item" onClick={closeOrOpen}>{t("myCollections")}</Link>
          </li>
          <li>
            <Link href={localizePath("/user/logout/", locale)} className="profile-menu-item" onClick={closeOrOpen}>{t("signOut")}</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
