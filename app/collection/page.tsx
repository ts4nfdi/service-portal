
import { getPublicCollectionList, getUserCollectionList } from "@/app/api/actions/collections";
import { CollectionListMessages } from "@/app/ui/collection/collectionListMessages";
import { Suspense } from "react";
import { CollectionList } from "@/app/clientExports";
import { getUserToken } from "@/app/libs/auth";
import Link from "next/link";
import { ActionResponse } from "@/app/api/actions/types";
import Image from "next/image";


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
        <p className="header-main-1 !mt-0 inline-block">TS4NFDI Terminology Collections</p>
      </div>
      <div className='grid md:grid-cols-9 md:gap-4'>
        <div className="card-background md:col-span-5">
            <h3 className='header-main-3'>What is a terminology collection?</h3>
            <p>
                A Terminology Collection is a set of terminologies that was created for a specific purpose or context in
                which this set is relevant. This terminology collection can be shared with the community and can contain
                ontologies, thesauri, etc, without any rating. A Terminology Collection can therefore be considered a
                grouping within the vast space of existing terminologies.
            </p>

            {token && <Link href="/collection/new/" className="btn !p-2 !text-sm mt-10 float-right">Create Collection</Link>}
        </div>
        <div className='md:col-span-4 card-background float-right'>
            <h4 className='header-main-3'> Figure of a Terminology Collection</h4>
            <Image
                src={"img/collections.png"}
                width={525}
                height={130}
                alt="example of a terminology collection"
                placeholder="blur"
                blurDataURL="/blur.webp"
                style={{ margin: 'auto' }}
            />
        </div>
      </div>
      <CollectionList collections={collectionsList} />
    </div>
  );
}
