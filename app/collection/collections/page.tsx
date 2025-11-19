
import { getPublicCollectionList } from "@/app/api/actions/collections";
import { CollectionListMessages } from "@/app/ui/collection/collectionListMessages";
import { Suspense } from "react";
import { CollectionList } from "@/app/clientExports";
import { getUserToken } from "@/app/libs/auth";
import Link from "next/link";


export default async function Collections() {

  let token = await getUserToken();

  let collectionsResp = await getPublicCollectionList();
  if (!collectionsResp.status) {
    return "";
  }

  return (
    <div className="md:col-span-3 p-4" key={"my_collection"}>
      <Suspense> <CollectionListMessages /> </Suspense>
      <p className="header-2">TS4NFDI Collections</p>
      {token && <Link href="/collection/new/" className="btn">Create Collection</Link>}
      <CollectionList collections={collectionsResp.content} />
    </div>
  );
}
