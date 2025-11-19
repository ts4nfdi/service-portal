'use client'

import dynamic from "next/dynamic";
import { CardSkeleton, DefaultSkeleton } from "@/app/ui/commons/skeletons";

export const CollectionPageContent = dynamic(() => import("@/app/collection/[collectionId]/content"), {
  ssr: false,
});


export const MatomoTracker = dynamic(() => import('@/app/matomo/useMatomo'), {
  ssr: false,
});

export const TrackingConsentForm = dynamic(() => import('@/app/matomo/trackingConsent'), {
  ssr: false,
});


export const UserPrivacySection = dynamic(() => import('@/app/user/dashboard/privacySection'), {
  ssr: false,
});


export const CopyToClipboard = dynamic(() => import("@/app/ui/commons/snippets").then(mod => mod.CopyToClipboardCmp), {
  ssr: false,
});

export const InfoAlert = dynamic(() => import("@/app/ui/commons/snippets").then(mod => mod.InfoAlertCmp), {
  ssr: false,
  loading: () => <DefaultSkeleton lineCount={3} className="px-4 py-3 mb-4" />
});


export const CollectionList = dynamic(() => import('@/app/ui/collection/collectionList'), {
  ssr: false,
  loading: () => <CardSkeleton count={5} className="" />
});

export const PublicationCards = dynamic(() => import('@/app/ui/publication/publicationCard'), {
  ssr: false,
  loading: () => <CardSkeleton count={5} className="" />
});


