'use client'

import dynamic from "next/dynamic";
import {DefaultSkeleton} from "@/app/ui/commons/skeletons";

export const CopyToClipboard = dynamic(() => import("@/app/ui/commons/snippets").then(mod => mod.CopyToClipboardCmp), {
    ssr: false,
});

export const InfoAlert = dynamic(() => import("@/app/ui/commons/snippets").then(mod => mod.InfoAlertCmp), {
    ssr: false,
    loading: () => <DefaultSkeleton lineCount={3}/>
});
