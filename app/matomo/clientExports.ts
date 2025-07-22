'use client'

import dynamic from "next/dynamic";

export const MatomoTracker = dynamic(() => import('@/app/matomo/useMatomo'), {
    ssr: false,
});

export const TrackingConsentForm = dynamic(() => import('@/app/matomo/trackingConsent'), {
    ssr: false,
});

