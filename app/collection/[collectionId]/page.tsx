import { getPublicCollectionList, getUserCollectionList } from "@/app/api/actions/collections";
import { ErrorAlert } from "@/app/ui/commons/snippets";
import Link from "next/link";
import { CollectionPageContent } from "@/app/clientExports";
import { getAuthenticatedUser } from "@/app/libs/auth";
import "../../ui/collection/styles.css";
import { getRequestLocale } from "@/app/libs/locale";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { localizePath } from "@/app/libs/localePath";


export default async function CollectionPage({ params }: { params: Promise<{ collectionId: string }> }) {
  const locale = await getRequestLocale();
  const t = collectionUiMessages[locale];
  const { collectionId } = await params;

  const { token } = await getAuthenticatedUser();
  const publicCollectionsListResp = await getPublicCollectionList();
  const userCollectionsListResp = token ? await getUserCollectionList() : null;
  if (!publicCollectionsListResp.status && !userCollectionsListResp?.status) {
    return renderNotFoundPage();
  }
  const collectionList = [
    ...(userCollectionsListResp?.status ? userCollectionsListResp.content : []),
    ...(publicCollectionsListResp.status ? publicCollectionsListResp.content : []),
  ];

  const collection = collectionList.find((data) => data.id === collectionId);

  if (!collection) {
    return renderNotFoundPage();
  }

  function renderNotFoundPage() {
    return (
      <div className="col-span-2">
        <Link href={localizePath("/collection/myCollections", locale)} className="btn">{t.backToList}</Link>
        <ErrorAlert message={t.notFound} />
      </div>
    )
  }

  return (
    <>
      <div className="collection-card col-span-3 bg-white p-4 flex flex-col flex-wrap">
        <CollectionPageContent collection={collection} />
      </div>
    </>
  )
}
