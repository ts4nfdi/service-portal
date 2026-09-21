'use client'

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserCollectionList, updateCollection } from "@/app/api/actions/collections";
import { ActionResponse } from "@/app/api/actions/types";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { Loading } from "@/app/ui/commons/snippets";
import { PortalCollection, PortalCollectionJsonData, PortalOntologyOption, PortalTerminology } from "@/app/concepts";
import { getUserList } from "@/app/api/actions/users";
import { getOntologyOptions } from "@/app/api/actions/providers";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { localizePath } from "@/app/libs/localePath";
import { getTerminologyOptionKey } from "@/app/ui/collection/terminologyOptions";
import {
  CollaboratorField,
  CollectionDetailsFields,
  CollectionVisibilityField,
  TerminologySelectionField,
} from "@/app/ui/collection/collectionFormFields";

export default function CollectionEdit() {
  const locale = useLocale();
  const t = collectionUiMessages[locale];
  const params = useParams();
  const slug = params?.slug;
  const collectionId = Array.isArray(slug) ? slug[0] : slug;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(new PortalCollection());
  const [loadedCollectionId, setLoadedCollectionId] = useState<string>();
  const [formIsSubmitted, setFormIsSubmited] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [ontologyOptions, setOntologyOptions] = useState<PortalOntologyOption[]>([]);
  const [ontologyOptionsLoaded, setOntologyOptionsLoaded] = useState(false);
  const [ontologyOptionsFailed, setOntologyOptionsFailed] = useState(false);
  const [selectedTerminologies, setSelectedTerminologies] = useState<PortalOntologyOption[]>([]);
  const [terminologySelectionReady, setTerminologySelectionReady] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const ontologyRequestInFlight = useRef(false);
  const terminologySelectionInitialized = useRef(false);
  const collectionTerminologyOptions = useMemo(() => {
    const optionsByKey = new Map(ontologyOptions.map((option) => [getTerminologyOptionKey(option), option]));
    return collection.terminologies.map((terminology) => {
      const option = {
        ontologyId: terminology.label,
        providerId: terminology.source,
        description: "",
        uri: terminology.uri,
      };
      return optionsByKey.get(getTerminologyOptionKey(option)) ?? option;
    });
  }, [collection.terminologies, ontologyOptions]);

  const loadOntologyOptions = useCallback(async () => {
    if (ontologyRequestInFlight.current) {
      return;
    }
    ontologyRequestInFlight.current = true;
    setOntologyOptionsFailed(false);
    try {
      const options = await getOntologyOptions();
      if (!options) {
        setOntologyOptionsFailed(true);
        return;
      }
      setOntologyOptions(options);
      setOntologyOptionsLoaded(true);
    } catch {
      setOntologyOptionsFailed(true);
    } finally {
      ontologyRequestInFlight.current = false;
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      if (!terminologySelectionReady) {
        return;
      }
      const formData = new FormData(event.currentTarget);
      const editedCollection = new PortalCollection();
      editedCollection.id = collection.id;
      editedCollection.description = formData.get("collection-desc") as string;
      editedCollection.label = formData.get("collection-title") as string;
      editedCollection.collaborators = selectedCollaborators.map((username) => ({ username, role: "ADMIN" }));
      editedCollection.isPublic = isPublic;
      editedCollection.terminologies = selectedTerminologies.map((option) => {
        const terminology = new PortalTerminology();
        terminology.label = option.ontologyId;
        terminology.source = option.providerId;
        terminology.type = "DATABASE";
        terminology.uri = option.uri;
        return terminology;
      });
      setFormIsSubmited(true);
      setLoading(true);
      const response = await updateCollection(editedCollection.toJson());
      window.location.href = localizePath(`/collection/myCollections?edited=${response.status}`, locale);
    } catch {
      return;
    }
  }

  useEffect(() => {
    loadOntologyOptions();
    getUserList().then((response) => {
      if (response.status) {
        setUsers(response.content.map((user: { username: string }) => user.username));
      }
    });
  }, [loadOntologyOptions]);

  useEffect(() => {
    let active = true;
    terminologySelectionInitialized.current = false;
    setTerminologySelectionReady(false);
    setSelectedTerminologies([]);
    setCollection(new PortalCollection());
    setLoadedCollectionId(undefined);
    setError("");
    setLoading(true);
    getUserCollectionList().then((response: ActionResponse) => {
      if (!active) {
        return;
      }
      if (!response.status) {
        setError(response.content);
        return;
      }
      const targetCollection = response.content.find((item: PortalCollectionJsonData) => item.id === collectionId);
      if (!targetCollection) {
        setError("not allowed");
        return;
      }
      const portalCollection = PortalCollection.toObject(targetCollection);
      setCollection(portalCollection);
      setLoadedCollectionId(collectionId);
      setSelectedCollaborators(portalCollection.collaborators.map((user) => user.username));
      setIsPublic(portalCollection.isPublic);
    }).finally(() => {
      if (active) {
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [collectionId]);

  useEffect(() => {
    if (!collection.id || loadedCollectionId !== collectionId || !ontologyOptionsLoaded || terminologySelectionInitialized.current) {
      return;
    }
    setSelectedTerminologies(collectionTerminologyOptions);
    terminologySelectionInitialized.current = true;
    setTerminologySelectionReady(true);
  }, [collection.id, collectionId, collectionTerminologyOptions, loadedCollectionId, ontologyOptionsLoaded]);

  return (
    <>
      {loading && <Loading />}
      {error && !loading && <p>{error}</p>}
      {!error && !loading &&
        <div className="md:col-span-2 content-panel">
          <a className="btn" href={localizePath("/collection/myCollections/", locale)}><LeftArrowIcon />{t.collectionList}</a>
          <p className="header-2">{t.edit}{collection.label}</p>
          {!formIsSubmitted &&
            <form
              className="mt-10"
              onSubmit={submit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
            >
              <CollectionDetailsFields messages={t} title={collection.label} description={collection.description} />
              <CollectionVisibilityField messages={t} isPublic={isPublic} onChange={setIsPublic} />
              <CollaboratorField messages={t} users={users} selected={selectedCollaborators} onChange={setSelectedCollaborators} />
              <TerminologySelectionField table messages={t} options={ontologyOptions} selected={selectedTerminologies} loaded={ontologyOptionsLoaded} failed={ontologyOptionsFailed} onRetry={loadOntologyOptions} onChange={setSelectedTerminologies} />
              <div className="text-end">
                <button
                  type="submit"
                  className="btn disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!terminologySelectionReady}
                >
                  {t.save}
                </button>
              </div>
            </form>
          }
        </div>
      }
    </>
  );
}
