import { getUserCollectionList } from "@/app/api/actions/collections";
import { CollectionListMessages } from "@/app/ui/collection/collectionListMessages";
import { Suspense } from "react";
import { getUserToken } from "@/app/libs/auth";
import { CollectionList } from "@/app/clientExports";
import LoginFormWrapper from "@/app/user/login/page";
import Link from "next/link";
import { CardSkeleton } from "@/app/ui/commons/skeletons";


export default async function MyCollections() {
  let token = await getUserToken();
  if (!token) {
    return <LoginFormWrapper />;
  }

  return (
    <div className="md:col-span-3" key={"my_collection"}>
      <Suspense> <CollectionListMessages /> </Suspense>
      <p className="header-2 !mt-0 inline-block">My Collections</p>
      <Link href="/collection/new?from=my-collections" className="btn !p-1 !text-sm ml-2">Create Collection</Link>
      <Suspense fallback={<CollectionListLoading />}>
        <CollectionListSection />
      </Suspense>
    </div>
  );
}

async function CollectionListSection() {
  const collectionsResp = await getUserCollectionList();
  if (!collectionsResp.status) {
    return "";
  }

  return <CollectionList collections={collectionsResp.content} showDownloadButton={true} />;
}

function CollectionListLoading() {
  return (
    <div className="mt-4">
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">Loading your collections...</p>
      <CardSkeleton count={4} />
    </div>
  );
}
