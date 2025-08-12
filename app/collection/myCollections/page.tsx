import {getUserCollectionList} from "@/app/api/actions/collections";
import {Collection} from "@/app/api/actions/types";
import {notFound} from "next/navigation";
import CollectionCard from "@/app/ui/collection/collectionCard";
import {CollectionListMessages} from "@/app/ui/collection/collectionListMessages";
import {Suspense} from "react";
import {getUserToken} from "@/app/libs/auth";


export default async function MyCollections() {
    let token = await getUserToken();
    if (!token) {
        notFound();
    }

    let collectionsResp = await getUserCollectionList();
    if (!collectionsResp.status) {
        return "";
    }

    let collections = collectionsResp.content as Collection[];


    return (
        <div className="md:col-span-3 p-4" key={"my_collection"}>
            <Suspense> <CollectionListMessages/> </Suspense>
            <p className="header-2">My Collections</p>
            <a href="/collection/new/" className="btn">Create Collection</a>
            {collections.map((col: Collection) => {
                return (
                    <>
                        <div className="pt-5" key={"collections-list-container"}>
                            <CollectionCard collection={col}/>
                        </div>
                    </>
                )
            })}
        </div>
    );
}
