'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";


const navItems = [
  { href: "/widgets", text: "Lookup Service" },
  { href: "/databases", text: "Databases" },
  { href: "/incubators", text: "Incubators" },
  { href: "/publications", text: "Publications" },
  { href: "/events", text: "Events" },
  { href: "/documentation", text: "Documentation" },
  { href: "/about", text: "About" },
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
          <div className="flex space-x-4">
            <Link
              href={'/'}
              className={"navbar-links " + (path === "/home" || path === '/' ? "navbar-link-active" : "")}
            >Home
            </Link>
            {
              navItems.map((item) => {
                return (
                  <Link
                    href={item.href}
                    className={"navbar-links " + (path.includes(item.href) ? "navbar-link-active" : "")}
                    key={item.text}
                  // prefetch={true}
                  >{item.text}
                  </Link>
                )
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
              return (
                <Link
                  href={item.href}
                  className={"navbar-links-mobile " + (path.includes(item.href) ? "navbar-link-active" : "")}
                  key={item.text}
                >{item.text}
                </Link>
              )
            })
          }
        </div>
      </div>
    </>
  );
}
