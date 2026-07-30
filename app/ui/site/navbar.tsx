'use client'

import Link from "next/link";
import Image from "next/image";
import {useState, useEffect} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import { useTranslations } from "@/app/i18n";

type NavbarItem = {
    href: string,
    text: string,
    children?: NavbarItem[]
}

function getNavItems(t: ReturnType<typeof useTranslations>): NavbarItem[] {
  return [
    {
        href: "", text: t("tools"), children: [
            {href: "https://coli-conc.gbv.de/cocoda/ts4nfdi/", text: t("mappingService")},
            {href: "https://terminology.services.base4nfdi.de/tss/comp/latest/", text: t("terminologyServiceSuite")}
        ]
    },
    {href: "/provider", text: t("providers")},
    {href: "/collection", text: t("collections")},
    {href: "/incubators", text: t("incubators")},
    {
        href: "", text: t("info"), children: [
            {href: "/about", text: t("about")}, {href: "/documentation", text: t("documentation")},
            {href: "/events", text: t("events")}, {href: "/publications", text: t("publications")}, {href: "/contact", text: t("contact")},
        ]
    },
  ];
}

function localePrefix(pathname: string) {
    return pathname === "/de" || pathname.startsWith("/de/") ? "/de" : "";
}

function localizedHref(href: string, prefix: string) {
    return href.startsWith("http") ? href : `${prefix}${href}`;
}


export default function NavBarOptions() {
    const t = useTranslations("Navigation");
    const currentPath = usePathname();
    const [path, setPath] = useState(currentPath);
    const prefix = localePrefix(path);
    const navItems = getNavItems(t);


    useEffect(() => {
        setPath(currentPath);
    }, [currentPath]);


    return (
        <>
            <div className="flex flex-1 items-center sm:items-stretch justify-start">
                <div className="flex shrink-0 items-center">
                    <Link href={localizedHref('/', prefix)}>
                        <Image width={100} height={100} alt="logo" src={'/TS4NFDI-small-white.svg'}/>
                    </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                    <div className="flex-row item-start space-x-2">
                        <Link
                        href={localizedHref('/', prefix)}
                        className={"navbar-links " + (path === "/home" || path === '/' || path === '/de' ? "navbar-link-active" : "")}
                    >{t("home")}
                        </Link>
                        {
                            navItems.map((item) => {
                                if (!item.children) {
                                    return (
                                        <Link
                                            href={localizedHref(item.href, prefix)}
                                            className={"navbar-links " + (path.replace(/^\/de/, "").includes(item.href) ? "navbar-link-active" : "")}
                                            key={item.text}
                                        >{item.text}
                                        </Link>
                                    )
                                }
                                return (
                                        <RenderAsDropdown
                                            navItem={item}
                                            selected={!!item.children.find((rec: NavbarItem) => path.replace(/^\/de/, "").includes(rec.href))}
                                            isMobile={false}
                                            prefix={prefix}
                                            key={item.text}
                                        />
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    );
}


export function NavBarOptionsMobile() {
    const t = useTranslations("Navigation");
    const currentPath = usePathname();
    const [path, setPath] = useState(currentPath);
    const prefix = localePrefix(path);
    const navItems = getNavItems(t);

    useEffect(() => {
        setPath(currentPath);
    }, [currentPath]);
    return (
        <>
            <div className="hidden" id="mobile-menu">
                <div className="space-y-1 px-2 pt-2 pb-3">
                    <Link
                        href={localizedHref('/', prefix)}
                        className={"navbar-links-mobile " + (path === "/home" || path === '/' || path === '/de' ? "navbar-link-active" : "")}
                    >{t("home")}
                    </Link>
                    {
                        navItems.map((item: NavbarItem) => {
                            if (!item.children) {
                                return (
                                    <Link
                                        href={localizedHref(item.href, prefix)}
                                        className={"navbar-links-mobile " + (path.replace(/^\/de/, "").includes(item.href) ? "navbar-link-active" : "")}
                                        key={item.text}
                                    >{item.text}
                                    </Link>
                                )
                            }
                            return (
                                    <RenderAsDropdown
                                        navItem={item}
                                        selected={!!item.children.find((rec: NavbarItem) => path.replace(/^\/de/, "").includes(rec.href))}
                                        isMobile={true}
                                        prefix={prefix}
                                        key={item.text}
                                    />
                            );
                        })
                    }
                </div>
            </div>
        </>
    );
}


function RenderAsDropdown(props: { navItem: NavbarItem, selected: boolean, isMobile: boolean, prefix: string }) {
    const {navItem, selected, isMobile, prefix} = props;
    const [isOpen, setIsOpen] = useState(false);

    const navbarClass = isMobile ? "navbar-links-mobile " : "navbar-links ";

    useEffect(() => {
        document.addEventListener("click", (e: MouseEvent) => {
            if (e.target instanceof HTMLElement && e.target.closest("#dropdownNavbarLink")) {
                return;
            }
            setIsOpen(false);
        });

    }, []);


    return (
        <div className="relative inline-block text-left">
            <Link href={""} id="dropdownNavbarLink" className={navbarClass + (selected ? "navbar-link-active" : "")}
                  onClick={() => setIsOpen(!isOpen)}>
                {navItem.text}
                <svg className="w-2.5 h-2.5 ms-2.5 inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                     fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="m1 1 4 4 4-4"/>
                </svg>
            </Link>
            <div
                id="dropdownNavbar"
                className={"absolute mt-2 z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600" + (isOpen ? "" : " hidden")}
            >
                {navItem.children!.map((item: NavbarItem) => {
                    return (
                        <Link
                            href={localizedHref(item.href, prefix)}
                            className="block text-sm px-4 py-2 hover:rounded hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => setIsOpen(!isOpen)}
                            key={"dropdown-item-" + item.text}
                        >
                            {item.text}
                        </Link>
                    );
                })}
            </div>

        </div>
    );
}

export function LanguageSwitcher() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations("Navigation");
    const [isOpen, setIsOpen] = useState(false);
    const isGerman = localePrefix(pathname) === "/de";
    const path = pathname.replace(/^\/de/, "") || "/";
    const englishParams = new URLSearchParams(searchParams.toString());
    const germanParams = new URLSearchParams(searchParams.toString());

    englishParams.set("locale", "en");
    germanParams.delete("locale");

    const englishQuery = englishParams.toString();
    const germanQuery = germanParams.toString();
    const englishHref = `${path}${englishQuery ? `?${englishQuery}` : ""}`;
    const germanHref = `/de${path === "/" ? "" : path}${germanQuery ? `?${germanQuery}` : ""}`;

    return (
        <div className="relative">
            <button
                type="button"
                className="btn !bg-[#F8F8F8] !text-[#445669] !m-0 !p-1 !px-2 !text-base !leading-none"
                aria-expanded={isOpen}
                aria-label={t("languageMenu")}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isGerman ? "🇩🇪" : "🇬🇧"}
            </button>
            {isOpen && (
                <div className="absolute right-0 z-10 mt-1 min-w-0 rounded bg-white p-1 shadow-sm dark:bg-gray-700">
                    <a className="block p-1 text-base leading-none hover:rounded hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" href={englishHref} aria-label="English">🇬🇧</a>
                    <a className="block p-1 text-base leading-none hover:rounded hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" href={germanHref} aria-label="Deutsch">🇩🇪</a>
                </div>
            )}
        </div>
    );
}
