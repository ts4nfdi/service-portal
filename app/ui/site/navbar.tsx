'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type NavbarItem = {
  href: string,
  text: string,
  children?: NavbarItem[]
}

const navItems: NavbarItem[] = [
  { href: "/tss/comp/latest/", text: "Terminology Service Suite" },
  { href: "/databases", text: "API Gateway" },
  { href: "/collection/collections", text: "Collections" },
  { href: "/incubators", text: "Incubators" },
  {
    href: "", text: "Info", children: [
      { href: "/publications", text: "Publications" },
      { href: "/events", text: "Events" },
      { href: "/documentation", text: "Documentation" },
      { href: "/about", text: "About" }
    ]
  },
  { href: "/contact", text: "Contact" },
];


export default function NavBarOptions() {
  const currentPath = usePathname();
  const [path, setPath] = useState(currentPath);


  useEffect(() => {
    setPath(currentPath);
  }, [currentPath]);


  return (
    <>
      <div className="flex flex-1 items-center sm:items-stretch justify-start">
        <div className="flex shrink-0 items-center">
          <Link href={'/'}>
            <Image width={100} height={100} alt="logo" src={'/TS4NFDI-small-white.svg'} />
          </Link>
        </div>
        <div className="hidden sm:ml-6 sm:block">
          <div className="flex-row item-start space-x-2">
            <Link
              href={'/'}
              className={"navbar-links " + (path === "/home" || path === '/' ? "navbar-link-active" : "")}
            >Home
            </Link>
            {
              navItems.map((item) => {
                if (!item.children) {
                  return (
                    <Link
                      href={item.href}
                      className={"navbar-links " + (path.includes(item.href) ? "navbar-link-active" : "")}
                      key={item.text}
                    >{item.text}
                    </Link>
                  )
                }
                return (<>{renderAsDropdown(item, !!item.children.find((rec: NavbarItem) => path.includes(rec.href)))}</>);

              })
            }
          </div>
        </div>
      </div>

    </>
  );
}


export function NavBarOptionsMobile() {
  const currentPath = usePathname();
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    setPath(currentPath);
  }, [currentPath]);
  return (
    <>
      <div className="hidden" id="mobile-menu">
        <div className="space-y-1 px-2 pt-2 pb-3">
          <Link
            href={'/'}
            className={"navbar-links-mobile " + (path === "/home" || path === '/' ? "navbar-link-active" : "")}
          >Home
          </Link>
          {
            navItems.map((item) => {
              if (!item.children) {
                return (
                  <Link
                    href={item.href}
                    className={"navbar-links-mobile " + (path.includes(item.href) ? "navbar-link-active" : "")}
                    key={item.text}
                  >{item.text}
                  </Link>
                )
              }
              return (
                <>
                  {renderAsDropdown(
                    item,
                    !!item.children.find((rec: NavbarItem) => path.includes(rec.href)),
                    true
                  )}
                </>
              );

            })
          }
        </div>
      </div>
    </>
  );
}


function renderAsDropdown(navItem: NavbarItem, selected: boolean, isMobile: boolean = false) {

  const [isOpen, setIsOpen] = useState(false);

  const navbarClass = isMobile ? "navbar-links-mobile " : "navbar-links ";

  return (
    <div className="relative inline-block text-left">
      <Link href={""} id="dropdownNavbarLink" className={navbarClass + (selected ? "navbar-link-active" : "")} onClick={() => setIsOpen(!isOpen)}>
        {navItem.text}
        <svg className="w-2.5 h-2.5 ms-2.5 inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
        </svg>
      </Link>
      <div
        id="dropdownNavbar"
        className={"absolute mt-2 z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600" + (isOpen ? "" : " hidden")}
      >
        {navItem.children!.map((item: NavbarItem) => {
          return (
            <Link
              href={item.href}
              className="block text-sm px-4 py-2 hover:rounded hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
              key={"dropdown-item-" + item.text}
            >
              {item.text}
            </Link>
          );
        })}
      </div>

    </div >
  );
}
