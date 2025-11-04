
import { getPublicCollectionList } from "@/app/api/actions/collections";
import { CollectionListMessages } from "@/app/ui/collection/collectionListMessages";
import { Suspense } from "react";
import { CollectionList } from "@/app/clientExports";


export default async function Collections() {

  let collectionsResp = await getPublicCollectionList();
  if (!collectionsResp.status) {
    return "";
  }

  return (
    <div className="md:col-span-3 p-4" key={"my_collection"}>
      <Suspense> <CollectionListMessages /> </Suspense>
      <p className="header-2">TS4NFDI Collections</p>
      <a href="/collection/new/" className="btn">Create Collection</a>
      <CollectionList collections={collectionsResp.content} />
    </div>
  );
}
