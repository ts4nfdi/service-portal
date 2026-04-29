import {getPublicCollectionList, getUserCollectionList} from "@/app/api/actions/collections";
import {CollectionListMessages} from "@/app/ui/collection/collectionListMessages";
import {cache, Suspense} from "react";
import {CollectionList} from "@/app/clientExports";
import {getUserToken} from "@/app/libs/auth";
import Link from "next/link";
import {ActionResponse} from "@/app/api/actions/types";
import Image from "next/image";
import DownloadCollectionsButton from "@/app/ui/collection/downloadCollectionsButton";
import {PortalCollectionJsonData} from "@/app/concepts";

const getCollectionsData = cache(async (token: string | null): Promise<PortalCollectionJsonData[] | null> => {
    let publicCollectionsListResp: ActionResponse = await getPublicCollectionList();
    let userCollectionsListResp: ActionResponse = {status: false, content: []};

    if (token) {
        userCollectionsListResp = await getUserCollectionList();
    }

    return [
        ...(publicCollectionsListResp.status ? publicCollectionsListResp.content : []),
        ...(userCollectionsListResp.status ? userCollectionsListResp.content : []),
    ];
});

async function DownloadCollectionsButtonSection({token}: { token: string | null }) {
    const collectionsList = await getCollectionsData(token);
    if (!collectionsList) {
        return null;
    }

    return <DownloadCollectionsButton collections={collectionsList}/>;
}

async function CollectionsSection({token}: { token: string | null }) {
    const collectionsList = await getCollectionsData(token);
    if (!collectionsList) {
        return null;
    }

    return <CollectionList collections={collectionsList}/>;
}

function DownloadButtonLoading() {
    return <div className="btn !p-2 !text-sm mt-10 opacity-60">Loading collections...</div>;
}

function CollectionListLoading() {
    return (
        <div className="mt-6 space-y-3">
            <div className="h-24 w-full animate-pulse rounded-md bg-gray-200"/>
            <div className="h-24 w-full animate-pulse rounded-md bg-gray-200"/>
            <div className="h-24 w-full animate-pulse rounded-md bg-gray-200"/>
        </div>
    );
}

export default async function Collections() {

    let token = await getUserToken();

    return (
        <div className="md:col-span-3" key={"my_collection"}>
            <Suspense> <CollectionListMessages/> </Suspense>
            <div className="">
                <p className="header-main-1 !mt-0 inline-block">TS4NFDI Terminology Collections</p>
            </div>
            <div className='grid md:grid-cols-9 md:gap-4'>
                <div className="card-background md:col-span-5">
                    <h3 className='header-main-3'>What is a Terminology Collection?</h3>
                    <p className='text-justify'>
                        A <b>Terminology Collection</b> is a set of terminologies that was created for a specific
                        purpose or
                        context in which this set is relevant. This terminology collection can be shared with the
                        community and
                        can contain ontologies, thesauri, etc, without any rating. A Terminology Collection can
                        therefore be
                        considered a grouping within the vast space of existing terminologies.
                    </p>

                    <div className="mt-10 flex flex-col flex-wrap justify-start gap-2 w-1/2">
                        <Suspense fallback={<DownloadButtonLoading/>}>
                            <DownloadCollectionsButtonSection token={token}/>
                        </Suspense>
                        {token && <Link href="/collection/new/" className="btn !p-2 !text-sm text-center">Create
                          Collection</Link>}
                    </div>
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
                        style={{margin: 'auto'}}
                    />
                </div>
            </div>
            <Suspense fallback={<CollectionListLoading/>}>
                <CollectionsSection token={token}/>
            </Suspense>
        </div>
    );
}
