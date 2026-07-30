'use client'

import {WarningAlert} from "@/app/ui/commons/snippets";
import {signOut} from "next-auth/react";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "../messages";


export default function Logout() {
    const t = userPageMessages[useLocale()];

    function logout() {
        // signOut({callbackUrl: "https://terminology.services.base4nfdi.de/"});
        signOut({redirect: false}).then(() => {
            window.location.href = "https://terminology.services.base4nfdi.de/";
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
