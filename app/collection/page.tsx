import {
  getPublicCollectionList,
  getUserCollectionList,
} from "@/app/api/actions/collections";
import { CollectionListMessages } from "@/app/ui/collection/collectionListMessages";
import { cache, Suspense } from "react";
import { CollectionList } from "@/app/clientExports";
import { getUserToken } from "@/app/libs/auth";
import Link from "next/link";
import { ActionResponse } from "@/app/api/actions/types";
import Image from "next/image";
import DownloadCollectionsButton from "@/app/ui/collection/downloadCollectionsButton";
import { PortalCollectionJsonData } from "@/app/concepts";
import { CopyToClipboard } from "@/app/clientExports";
import { getRequestLocale } from "../libs/locale";
import { collectionMessages } from "./messages";
import { localizePath } from "../libs/localePath";

const getCollectionsData = cache(
  async (token: string | null): Promise<PortalCollectionJsonData[] | null> => {
    let publicCollectionsListResp: ActionResponse =
      await getPublicCollectionList();
    let userCollectionsListResp: ActionResponse = {
      status: false,
      content: [],
    };

    if (token) {
      userCollectionsListResp = await getUserCollectionList();
    }

    return [
      ...(publicCollectionsListResp.status
        ? publicCollectionsListResp.content
        : []),
      ...(userCollectionsListResp.status
        ? userCollectionsListResp.content
        : []),
    ];
  },
);

async function DownloadCollectionsButtonSection({
  token,
}: {
  token: string | null;
}) {
  const collectionsList = await getCollectionsData(token);
  if (!collectionsList) {
    return null;
  }

  return <DownloadCollectionsButton collections={collectionsList} />;
}

async function CollectionsSection({ token }: { token: string | null }) {
  const collectionsList = await getCollectionsData(token);
  if (!collectionsList) {
    return null;
  }

  return <CollectionList collections={collectionsList} />;
}

function DownloadButtonLoading({ label }: { label: string }) {
  return (
    <div className="btn !p-2 !text-sm mt-10 opacity-60">
      {label}
    </div>
  );
}

function CollectionListLoading() {
  return (
    <div className="mt-6 space-y-3">
      <div className="h-24 w-full animate-pulse rounded-md bg-gray-200" />
      <div className="h-24 w-full animate-pulse rounded-md bg-gray-200" />
      <div className="h-24 w-full animate-pulse rounded-md bg-gray-200" />
    </div>
  );
}

export default async function Collections() {
  let token = await getUserToken();
  const locale = await getRequestLocale();
  const t = collectionMessages[locale];

  return (
    <div className="md:col-span-3" key={"my_collection"}>
      <Suspense>
        {" "}
        <CollectionListMessages />{" "}
      </Suspense>
      <div className="">
        <p className="header-main-1 !mt-0 inline-block">
          {t.title}
        </p>
      </div>
      <div className="grid md:grid-cols-9 md:gap-4">
        <div className="card-background md:col-span-5">
          <h3 className="header-main-3">{t.what}</h3>
          <p className="text-justify">
            {t.descriptionStart}<b>{t.collection}</b>{t.descriptionEnd}
          </p>

          <div className="mt-10 flex flex-col flex-wrap justify-start gap-2 w-1/2">
            <Suspense fallback={<DownloadButtonLoading label={t.loading} />}>
              <DownloadCollectionsButtonSection token={token} />
            </Suspense>
            {token && (
              <Link
                href={localizePath("/collection/new/", locale)}
                className="btn !p-2 !text-sm text-center"
              >
                {t.create}
              </Link>
            )}
          </div>
          <div className="flex flex-row flex-wrap justify-start px-1 mt-2">
            <div>
              <p className="bg-ts4nfdi-brand-color text-white inline font-bold p-1 mr-1 rounded">
                {t.apiEndpoint}
              </p>
              {(process.env.GATEWAY_BASE_URL! as string) + "/collections/"}
            </div>
            <CopyToClipboard
              textToCopy={
                (process.env.GATEWAY_BASE_URL! as string) + "/collections/"
              }
            />
          </div>
        </div>
        <div className="md:col-span-4 card-background float-right">
          <h4 className="header-main-3">{t.figure}</h4>
          <Image
            src={"/img/collections.png"}
            width={525}
            height={130}
            alt={t.alt}
            placeholder="blur"
            blurDataURL="/blur.webp"
            style={{ margin: "auto" }}
          />
        </div>
      </div>
      <Suspense fallback={<CollectionListLoading />}>
        <CollectionsSection token={token} />
      </Suspense>
    </div>
  );
}
