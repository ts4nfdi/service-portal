'use client'

import dynamic from "next/dynamic";

export const CollectionList = dynamic(() => import('@/app/ui/collection/collectionList'), {
    ssr: false,
});
