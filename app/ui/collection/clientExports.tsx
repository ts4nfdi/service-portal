'use client'

import dynamic from "next/dynamic";
import {CardSkeleton} from "@/app/ui/commons/skeletons";

export const CollectionList = dynamic(() => import('@/app/ui/collection/collectionList'), {
    ssr: false,
    loading: () => <CardSkeleton count={5} className=""/>
});
