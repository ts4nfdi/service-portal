'use client'

import {WarningAlert} from "@/app/ui/commons/snippets";
import {signOut} from "next-auth/react";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "../messages";
import { localizePath } from "@/app/libs/localePath";


export default function Logout() {
    const locale = useLocale();
    const t = userPageMessages[locale];

    function logout() {
        signOut({redirect: false}).then(() => {
            window.location.replace(localizePath("/", locale));
        });
    }

    return (
        <>
            <div className="md:col-span-1 md:col-start-2">
                <WarningAlert message={t.logoutWarning}/>
                <button className="btn" onClick={() => {
                    logout()
                }}>{t.yes}
                </button>
                <button className="btn" onClick={() => {
                    window.location.href = "/"
                }}>{t.backHome}
                </button>
            </div>
        </>
    );
}
