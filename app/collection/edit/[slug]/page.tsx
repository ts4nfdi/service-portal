'use client'

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserCollectionList, updateCollection } from "@/app/api/actions/collections";
import { ActionResponse } from "@/app/api/actions/types";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { Loading } from "@/app/ui/commons/snippets";
import { isOrcidId, PortalCollection, PortalCollectionJsonData, PortalTerminologyOption, PortalTerminology, PortalUser } from "@/app/concepts";
import { getUserList } from "@/app/api/actions/users";
import { getCachedTerminologyOptions } from "@/app/ui/collection/terminologyOptionsCache";
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
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const collaboratorsHaveOrcids = selectedCollaborators.every(isOrcidId);
  const [terminologyOptions, setTerminologyOptions] = useState<PortalTerminologyOption[]>([]);
  const [terminologyOptionsLoaded, setTerminologyOptionsLoaded] = useState(false);
  const [terminologyOptionsFailed, setTerminologyOptionsFailed] = useState(false);
  const [selectedTerminologies, setSelectedTerminologies] = useState<PortalTerminologyOption[]>([]);
  const [terminologySelectionReady, setTerminologySelectionReady] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const terminologyRequestInFlight = useRef(false);
  const userOrcids = useRef(new Map<string, string>());
  const terminologySelectionInitialized = useRef(false);
  const collectionTerminologyOptions = useMemo(() => {
    const optionsByKey = new Map(terminologyOptions.map((option) => [getTerminologyOptionKey(option), option]));
    return collection.terminologies.map((terminology) => {
      const option = {
        terminologyId: terminology.label,
        providerId: terminology.source,
        description: "",
        uri: terminology.uri,
      };
      return optionsByKey.get(getTerminologyOptionKey(option)) ?? option;
    });
  }, [collection.terminologies, terminologyOptions]);

  const loadTerminologyOptions = useCallback(async () => {
    if (terminologyRequestInFlight.current) {
      return;
    }
    terminologyRequestInFlight.current = true;
    setTerminologyOptionsFailed(false);
    try {
      const options = await getCachedTerminologyOptions();
      if (!options) {
        setTerminologyOptionsFailed(true);
        return;
      }
      setTerminologyOptions(options);
      setTerminologyOptionsLoaded(true);
    } catch {
      setTerminologyOptionsFailed(true);
    } finally {
      terminologyRequestInFlight.current = false;
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      if (!terminologySelectionReady || !collaboratorsHaveOrcids) {
        return;
      }
      const formData = new FormData(event.currentTarget);
      const editedCollection = new PortalCollection();
      editedCollection.id = collection.id;
      editedCollection.description = formData.get("collection-desc") as string;
      editedCollection.label = formData.get("collection-title") as string;
      editedCollection.collaborators = selectedCollaborators.map((orcid) => {
        const user = users.find((user) => user.orcid === orcid)
          ?? collection.collaborators.find((user) => (user.orcid || userOrcids.current.get(user.username)) === orcid);
        if (!user) throw new Error("Collaborator not found");
        return { username: user.username, orcid, role: "ADMIN" };
      });
      editedCollection.isPublic = isPublic;
      editedCollection.terminologies = selectedTerminologies.map((option) => {
        const terminology = new PortalTerminology();
        terminology.label = option.terminologyId;
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
    loadTerminologyOptions();
    getUserList().then((response) => {
      if (response.status) {
        const people = response.content as PortalUser[];
        userOrcids.current = new Map(people.filter((user) => user.orcid).map((user) => [user.username, user.orcid]));
        setUsers(people);
        setSelectedCollaborators((selected) => selected.map((value) => userOrcids.current.get(value) ?? value));
      }
    });
  }, [loadTerminologyOptions]);

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
      setSelectedCollaborators(portalCollection.collaborators.map((user) => user.orcid || userOrcids.current.get(user.username) || user.username));
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
    if (!collection.id || loadedCollectionId !== collectionId || !terminologyOptionsLoaded || terminologySelectionInitialized.current) {
      return;
    }
    setSelectedTerminologies(collectionTerminologyOptions);
    terminologySelectionInitialized.current = true;
    setTerminologySelectionReady(true);
  }, [collection.id, collectionId, collectionTerminologyOptions, loadedCollectionId, terminologyOptionsLoaded]);

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
              {!collaboratorsHaveOrcids && <p role="alert" className="text-red-700 dark:text-red-400">{t.collaboratorOrcidRequired}</p>}
              <TerminologySelectionField table messages={t} options={terminologyOptions} selected={selectedTerminologies} loaded={terminologyOptionsLoaded} failed={terminologyOptionsFailed} onRetry={loadTerminologyOptions} onChange={setSelectedTerminologies} />
              <div className="text-end">
                <button
                  type="submit"
                  className="btn disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!terminologySelectionReady || !collaboratorsHaveOrcids}
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
