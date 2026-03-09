'use client'

import NewCollection from "@/app/collection/new/newCollection";
import { Suspense } from "react";

export default function NewCollectionPage() {
  return (
    <div className="md:col-span-2 content-panel">
      <Suspense>
        <NewCollection />
      </Suspense>
    </div>
  );
}
