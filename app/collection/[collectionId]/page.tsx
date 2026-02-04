import { getPublicCollectionList, getUserCollectionList } from "@/app/api/actions/collections";
import { ErrorAlert } from "@/app/ui/commons/snippets";
import Link from "next/link";
import { CollectionPageContent } from "@/app/clientExports";
import { PortalCollectionJsonData } from "@/app/concepts";
import { getUserToken } from "@/app/libs/auth";
import { ActionResponse } from "@/app/api/actions/types";
import "../../ui/collection/styles.css";


export default async function CollectionPage({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;

  let token = await getUserToken();
  let publicCollectionsListResp: ActionResponse = { status: false, content: [] };
  let userCollectionsListResp: ActionResponse = { status: false, content: [] };
  publicCollectionsListResp = await getPublicCollectionList();
  if (token) {
    userCollectionsListResp = await getUserCollectionList();
  }
  if (!publicCollectionsListResp.status && !userCollectionsListResp.status) {
    return renderNotFoundPage();
  }
  let collectionList = [...publicCollectionsListResp.content, ...userCollectionsListResp.content];

  const collection = collectionList.find((data: PortalCollectionJsonData) => data.id === collectionId);

  if (!collection) {
    return renderNotFoundPage();
  }

  function renderNotFoundPage() {
    return (
      <div className="col-span-2">
        <Link href="/collection/myCollections" className="btn">Back to collection list</Link>
        <ErrorAlert message="Collection not found" />
      </div>
    )
  }

  return (
    <>
      <div className="collection-card col-span-3 bg-white p-4 flex flex-col flex-wrap">
        <p className="header-2 font-bold">
          {collection.label}
          <p
            className="badge inline-block ml-2 bg-black !text-white !font-bold px-1 py-1 dark:!bg-white dark:!text-black"
            title="collection visibility"
            aria-label="collection visibility"
          >
            {collection.isPublic ? "public" : "private"}
          </p>
        </p>
        <CollectionPageContent collection={collection} />
      </div>
    </>
  )
}