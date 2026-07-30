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
      <Link href={localizePath("/collection/new?from=my-collections", locale)} className="btn !p-1 !text-sm ml-2">{t.createCollection}</Link>
      <Suspense fallback={<CollectionListLoading label={t.loadingMyCollections} />}>
        <CollectionListSection />
      </Suspense>
    </div>
  );
}

async function CollectionListSection() {
  const collectionsResp = await getUserCollectionList();
  if (!collectionsResp.status) {
    return "";
  }

  return <CollectionList collections={collectionsResp.content} showDownloadButton={true} />;
}

function CollectionListLoading({ label }: { label: string }) {
  return (
    <div className="mt-4">
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{label}</p>
      <CardSkeleton count={4} />
    </div>
  );
}
