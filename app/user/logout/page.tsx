'use client'

import {WarningAlert} from "@/app/ui/commons/snippets";
import {signOut} from "next-auth/react";


export default function Logout() {

    function logout() {
        signOut({callbackUrl: "https://terminology.services.base4nfdi.de/"});
    }

    return (
        <>
            <div className="md:col-span-1 md:col-start-2">
                <WarningAlert message="Are you sure you want to logout?"/>
                <button className="btn" onClick={() => {
                    logout()
                }}>Yes
                </button>
                <button className="btn" onClick={() => {
                    window.location.href = "/"
                }}>Bring me back to the homepage
                </button>
            </div>
        </>
    );
}
