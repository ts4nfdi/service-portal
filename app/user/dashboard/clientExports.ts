'use client'

import dynamic from "next/dynamic";

export const UserPrivacySection = dynamic(() => import('@/app/user/dashboard/privacySection'), {
    ssr: false,
});

