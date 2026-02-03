
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
    <div className="md:col-span-3 p-4" key={"my_collection"}>
      <Suspense> <CollectionListMessages /> </Suspense>
      <p className="header-2">TS4NFDI Collections</p>
      {token && <Link href="/collection/new/" className="btn">Create Collection</Link>}
      <CollectionList collections={collectionsList} />
    </div>
  );
}
