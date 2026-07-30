'use client'

import { useLocale } from "@/app/i18n";
import { commonMessages } from "@/app/ui/commons/messages";

export default function HamburgerBtn() {
  const t = commonMessages[useLocale()];
  function handleClick() {
    let mobileMenu = document.getElementById("mobile-menu") as HTMLDivElement;
    if (!mobileMenu) {
      return;
    }
    if (window.getComputedStyle(mobileMenu).display === "none") {
      mobileMenu.classList.remove("hidden");
    } else {
      mobileMenu.classList.add("hidden");
    }
    return;
  }


  return (
    <div className="inset-y-0 flex-1 items-center md:hidden" key={"hamburger-btn"} id="btn-holder">
      <button type="button" className="relative inline-flex bg-black items-center justify-center rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset" aria-controls="mobile-menu" aria-expanded="false" onClick={handleClick}>
        <span className="absolute -inset-0.5"></span>
        <span className="sr-only">{t.openMainMenu}</span>
        <svg className="block size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <svg className="hidden size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
