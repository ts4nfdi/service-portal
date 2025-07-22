'use client';

import {useEffect} from 'react';
import {usePathname} from "next/navigation";
import {generateRandomNumber, generateRandomString} from "@/app/libs/toolkit";

const MATOMO_USER_ID_FIELD = "matomoUserId";
export const MATOMO_IS_ENABLED_FIELD = "matomoIsEnabled";

export default function MatomoTrackerComponent() {
    let pathName = usePathname();
    let matomoUserId = localStorage.getItem(MATOMO_USER_ID_FIELD);
    let matomoIsEnabled = localStorage.getItem(MATOMO_IS_ENABLED_FIELD) === "true";
    let newVisitor = matomoUserId ? '0' : '1';
    if (matomoIsEnabled && !matomoUserId) {
        matomoUserId = generateRandomString(16);
        localStorage.setItem(MATOMO_USER_ID_FIELD, matomoUserId);
    }

    function sendMatomoQuery() {
        if (!matomoIsEnabled) {
            return;
        }
        const now = new Date();
        const currentUrl = document.location.href;
        const params = new URLSearchParams({
            action_name: pathName,
            idsite: process.env.NEXT_PUBLIC_MATOMO_TRACKER_ID as string,
            rec: '1',
            r: generateRandomNumber(true) as string,
            h: now.getHours().toString(),
            m: now.getMinutes().toString(),
            s: now.getSeconds().toString(),
            url: currentUrl,
            _id: matomoUserId as string,
            _idn: newVisitor,
            send_image: '0',
            _refts: '0',
            pv_id: generateRandomString(6),
            // pf_net: '0',
            // pf_srv: '76',
            // pf_tfr: '8',
            // pf_dm1: '210',
            uadata: '{}',
            pdf: '1',
            qt: '0',
            realp: '0',
            wma: '0',
            fla: '0',
            java: '0',
            ag: '0',
            cookie: '1',
            res: `${screen.width}x${screen.height}`,
        });
        fetch(`${process.env.NEXT_PUBLIC_MATOMO_TRACKER_URL as string}${params.toString()}`, {method: "POST"});
    }

    useEffect(() => {
        sendMatomoQuery();
    }, [pathName]);
    return "";
}

