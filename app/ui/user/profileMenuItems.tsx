'use client'

import Image from "next/image";
import Link from "next/link";

export default function UserProfileMenuItems(props: { username: string, email: string }) {

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
    <>
      <div className="z-50 hidden mt-[13rem] mr-[-3rem] text-base list-none bg-gray-200 divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600" id="user-dropdown" key={"profileMenu-options"}>
        <div className="px-4 py-3">
          <span className="block text-sm text-gray-900 dark:text-white">{props.username}</span>
          <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">{props.email}</span>
        </div>
        <ul className="list-none p-0 m-0" aria-labelledby="user-menu-button">
          <li>
            <Link href="/user/dashboard/" className="profile-menu-item" onClick={closeOrOpen}>Dashboard</Link>
          </li>
          <li>
            <Link href="/collection/myCollections/" className="profile-menu-item" onClick={closeOrOpen}>My Collections</Link>
          </li>
          <li>
            <Link href="/api/auth/signout" className="profile-menu-item" onClick={closeOrOpen}>Sign out</Link>
          </li>
        </ul>
      </div>
      <button type="button" className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" id="user-menu-button" aria-expanded="false" onClick={closeOrOpen} key={"profilemenu-btn"}>
        <span className="sr-only">Open user menu</span>
        <Image className="rounded-full" width={35} height={35} src="/img/blank.jpg" alt="user photo" />
      </button>
    </>
  );
}
