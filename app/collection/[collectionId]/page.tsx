import {getUserCollectionList} from "@/app/api/actions/collections";
import {Collection} from "@/app/api/actions/types";
import {ErrorAlert} from "@/app/ui/commons/snippets";
import Link from "next/link";
import {CollectionPageContent} from "@/app/clientExports";


//@ts-ignore
export default async function CollectionPage({params}) {

    const collectionsListResp = await getUserCollectionList();
    if (!collectionsListResp.status) {
        return renderNotFoundPage();
    }

    const collection = (collectionsListResp.content as Collection[]).find((col) => col.id === params.collectionId);

    if (!collection) {
        return renderNotFoundPage();
    }

    function renderNotFoundPage() {
        return (
            <div className="col-span-2">
                <Link href="/collection/myCollections" className="btn">Back to collection list</Link>
                <ErrorAlert message="Collection not found"/>
            </div>
        )
    }

    return (
        <>
            <div className="col-span-3 bg-white p-4 flex flex-col flex-wrap">
                <p className="header-2 font-bold">
                    {collection.label}
                </p>
                <CollectionPageContent collection={collection}/>
            </div>
        </>
    )
}