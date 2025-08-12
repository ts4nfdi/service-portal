//@ts-nocheck
'use client'

import {useEffect, useState} from 'react';


export function Captcha() {

    const [sdk, setSdk] = useState<any>(null);

    useEffect(() => {
        import('@friendlycaptcha/sdk').then((mod) => {
            setSdk(new mod.FriendlyCaptchaSDK())
        });
    }, []);

    useEffect(() => {
        const mount = document.getElementById("captcha")!;
        sdk?.createWidget({element: mount, sitekey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY as string});
    }, [sdk]);

    return (
        <div className="text-left" id="captcha"></div>
    );

}

