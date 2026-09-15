import NewCollection from "@/app/collection/new/newCollection";
import { Suspense } from "react";

export default function NewCollectionPage() {
  return (
    <div className="relative md:col-span-3 content-panel">
      <Suspense>
        <NewCollection debugMode={process.env.debug_mode === "true"} />
      </Suspense>
    </div>
  );
}
