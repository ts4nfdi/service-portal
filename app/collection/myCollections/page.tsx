import { getUserCollectionList } from "@/app/api/actions/collections";
import { CollectionListMessages } from "@/app/ui/collection/collectionListMessages";
import { Suspense } from "react";
import { getUserToken } from "@/app/libs/auth";
import { CollectionList } from "@/app/clientExports";
import LoginFormWrapper from "@/app/user/login/page";
import Link from "next/link";
import { CardSkeleton } from "@/app/ui/commons/skeletons";
import { getRequestLocale } from "@/app/libs/locale";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { localizePath } from "@/app/libs/localePath";


export default async function MyCollections() {
  const locale = await getRequestLocale();
  const t = collectionUiMessages[locale];
  let token = await getUserToken();
  if (!token) {
    return <LoginFormWrapper />;
  }

  return (
    <div className="md:col-span-3" key={"my_collection"}>
      <Suspense> <CollectionListMessages /> </Suspense>
      <p className="header-2 !mt-0 inline-block">{t.myCollections}</p>
      <Suspense fallback={<CollectionListLoading label={t.loadingMyCollections} />}>
        <CollectionListSection
          emptyMessage={t.noMyCollections}
          createCollectionHref={localizePath("/collection/new?from=my-collections", locale)}
          createCollectionLabel={t.createCollection}
        />
      </Suspense>
    </div>
  );
}

async function CollectionListSection({
  emptyMessage,
  createCollectionHref,
  createCollectionLabel,
}: {
  emptyMessage: string;
  createCollectionHref: string;
  createCollectionLabel: string;
}) {
  const collectionsResp = await getUserCollectionList();
  if (!collectionsResp.status) {
    return <div className="my-5 flex justify-start">
      <Link href={createCollectionHref} className="btn !mb-0 !me-0 !p-2 !text-sm">{createCollectionLabel}</Link>
    </div>;
  }
  if (collectionsResp.content.length === 0) {
    return <>
      <div className="my-5 flex justify-start">
        <Link href={createCollectionHref} className="btn !mb-0 !me-0 !p-2 !text-sm">{createCollectionLabel}</Link>
      </div>
      <p className="text-gray-700 dark:text-gray-200">{emptyMessage}</p>
    </>;
  }

  return <CollectionList collections={collectionsResp.content} showDownloadButton createCollectionHref={createCollectionHref} createCollectionLabel={createCollectionLabel} />;
}

function CollectionListLoading({ label }: { label: string }) {
  return (
    <div className="mt-4">
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{label}</p>
      <CardSkeleton count={4} />
    </div>
  );
}
