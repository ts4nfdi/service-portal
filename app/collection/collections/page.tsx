
import { getPublicCollectionList, getUserCollectionList } from "@/app/api/actions/collections";
import { CollectionListMessages } from "@/app/ui/collection/collectionListMessages";
import { Suspense } from "react";
import { CollectionList } from "@/app/clientExports";
import { getUserToken } from "@/app/libs/auth";
import Link from "next/link";
import { ActionResponse } from "@/app/api/actions/types";


export default async function Collections() {

  let token = await getUserToken();

  let publicCollectionsListResp: ActionResponse = { status: false, content: [] };
  let userCollectionsListResp: ActionResponse = { status: false, content: [] };
  publicCollectionsListResp = await getPublicCollectionList();
  if (token) {
    userCollectionsListResp = await getUserCollectionList();
  }
  if (!publicCollectionsListResp.status && !userCollectionsListResp.status) {
    return "";
  }
  let collectionsList = [...publicCollectionsListResp.content, ...userCollectionsListResp.content];

  return (
    <div className="md:col-span-3" key={"my_collection"}>
      <Suspense> <CollectionListMessages /> </Suspense>
      <div className="">
        <p className="header-2 !mt-0 inline-block">TS4NFDI Collections</p>
        {token && <Link href="/collection/new/" className="btn !p-1 !text-sm ml-2">Create Collection</Link>}
      </div>
      <CollectionList collections={collectionsList} />
    </div>
  );
}
