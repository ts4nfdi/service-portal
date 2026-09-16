'use client'

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getUserCollectionList, updateCollection } from "@/app/api/actions/collections";
import { ActionResponse } from "@/app/api/actions/types";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { Loading, TextArea, TextInput, ToggleButton, MultiSelectDropdown } from "@/app/ui/commons/snippets";
import { PortalCollection, PortalCollectionJsonData, PortalOntologyOption, PortalTerminology } from "@/app/concepts";
import { getUserList } from "@/app/api/actions/users";
import { getOntologyOptions } from "@/app/api/actions/providers";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { localizePath } from "@/app/libs/localePath";
import TerminologyMultiSelect from "@/app/ui/collection/terminologyMultiSelect";

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
  const [ontologyOptionsLoading, setOntologyOptionsLoading] = useState(false);
  const [ontologyOptionsFailed, setOntologyOptionsFailed] = useState(false);
  const [selectedTerminologies, setSelectedTerminologies] = useState<PortalOntologyOption[]>([]);
  const [terminologySelectionReady, setTerminologySelectionReady] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const ontologyRequestInFlight = useRef(false);
  const terminologySelectionInitialized = useRef(false);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onSelect(selectedList: string[], _selectedItem: string) {
    setSelectedCollaborators(selectedList);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onRemove(selectedList: string[], _removedItem: string) {
    setSelectedCollaborators(selectedList);
  }

  const loadOntologyOptions = useCallback(async () => {
    if (ontologyRequestInFlight.current) {
      return;
    }
    ontologyRequestInFlight.current = true;
    setOntologyOptionsLoading(true);
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
      setOntologyOptionsLoading(false);
    }
  }, []);

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
    const optionsById = new Map(ontologyOptions.map((option) => [`${option.providerId}:${option.ontologyId}`, option]));
    setSelectedTerminologies(collection.terminologies.map((terminology) =>
      optionsById.get(`${terminology.source}:${terminology.label}`) ?? {
        ontologyId: terminology.label,
        providerId: terminology.source,
        description: "",
        uri: terminology.uri,
      }
    ));
    terminologySelectionInitialized.current = true;
    setTerminologySelectionReady(true);
  }, [collection, collectionId, loadedCollectionId, ontologyOptions, ontologyOptionsLoaded]);

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
              <div className="form-input-group">
                <p className="mb-4 text-gray-700 dark:text-gray-200">{t.terminologySelectionHelp}</p>
                {ontologyOptionsLoading && <Loading />}
                {ontologyOptionsFailed &&
                  <div className="text-center" role="alert">
                    <p className="text-red-700 dark:text-red-400">{t.terminologyLoadError}</p>
                    <button type="button" className="btn !p-1 !text-sm" onClick={loadOntologyOptions}>{t.retry}</button>
                  </div>
                }
                {ontologyOptionsLoaded &&
                  <TerminologyMultiSelect
                    label={t.terminologies}
                    options={ontologyOptions}
                    selected={selectedTerminologies}
                    providerDescriptions={t.providerDescriptions}
                    searchPlaceholder={t.terminologySearchPlaceholder}
                    providerFilterLabel={t.providerFilter}
                    allProvidersLabel={t.allProviders}
                    additionalProvidersLabel={t.additionalProviders}
                    clearProvidersLabel={t.clearProviders}
                    noResults={t.noTerminologiesFound}
                    limitedResults={t.limitedTerminologyResults}
                    removeLabel={t.removeTerminology}
                    onChange={setSelectedTerminologies}
                  />
                }
              </div>
              <div className="form-input-group">
                <TextInput
                  id="collection-title"
                  name="collection-title"
                  type="text"
                  labelText={t.title}
                  placeHolder={t.titlePlaceholder}
                  defaultValue={collection.label}
                  required
                />
              </div>
              <div className="form-input-group">
                <TextArea
                  id="description"
                  required
                  name="collection-desc"
                  placeholder={t.descriptionPlaceholder}
                  labelText={t.description}
                  rows={10}
                  defaultValue={collection.description}
                />
              </div>
              <div className="form-input-group">
                <div className="flex items-center gap-3">
                  <span className={`text-sm capitalize ${isPublic ? "text-gray-500 dark:text-gray-400" : "font-semibold text-ts4nfdi-brand-color dark:text-white"}`}>
                    {t.private}
                  </span>
                  <ToggleButton
                    id="visibility"
                    label={t.public}
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                    brandColor
                    labelClassName={isPublic
                      ? "!font-semibold !text-ts4nfdi-brand-color dark:!text-white"
                      : "!font-normal !text-gray-500 dark:!text-gray-400"}
                  />
                </div>
              </div>
              <div className="form-input-group">
                <label htmlFor="collection-collaborators" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  {t.collaboratorsFull}
                </label>
                <MultiSelectDropdown
                  id="collection-collaborators"
                  placeholder={t.usersPlaceholder}
                  options={users}
                  selectedValues={selectedCollaborators}
                  onSelect={onSelect}
                  onRemove={onRemove}
                />
              </div>
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
