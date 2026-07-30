'use client';

import { SuccessAlert, ErrorAlert } from "../commons/snippets";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { deleteParamsFromUrl } from "@/app/libs/urlFactory";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "./messages";


export function CollectionListMessages() {
  const t = collectionUiMessages[useLocale()];

  const searchParams = useSearchParams();
  const router = useRouter();

  const [collectionCreated, setCollectionCreated] = useState<string | null>(searchParams.get('created'));
  const [collectionDeleted, setCollectionDeleted] = useState<string | null>(searchParams.get('deleted'));
  const [collectionEdited, setCollectionEdited] = useState<string | null>(searchParams.get('edited'));

  useEffect(() => {
    setTimeout(() => {
      setCollectionCreated("");
      setCollectionDeleted("");
      setCollectionEdited("");
      deleteParamsFromUrl(router, ['created', 'deleted', 'edited']);
    }, 3000);
  }, []);

  return (
    <>
      {collectionCreated === "true" &&
        <SuccessAlert message={t.createdSuccess} />
      }
      {collectionCreated === "false" &&
        <ErrorAlert message={t.createdError} />
      }
      {collectionEdited === "true" &&
        <SuccessAlert message={t.editedSuccess} />
      }
      {collectionEdited === "false" &&
        <ErrorAlert message={t.editedError} />
      }
      {collectionDeleted === "true" &&
        <SuccessAlert message={t.deletedSuccess} />
      }
      {collectionDeleted === "false" &&
        <ErrorAlert message={t.deletedError} />
      }
    </>
  );
}
