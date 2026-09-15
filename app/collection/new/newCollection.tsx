
'use client'

import { CheckBox, TextInput, MultiSelectDropdown } from "@/app/ui/commons/snippets";
import AutoCompleteTSS from "@/app/ui/widgets/autocomplete";
import { useCallback, useEffect, useRef, useState } from "react";
import { AutoCompleteSelectedTermType } from "@/app/ui/widgets/types";
import { createCollection } from "@/app/api/actions/collections";
import { Loading, TextArea } from "@/app/ui/commons/snippets";
import { ToggleButton } from "@/app/ui/commons/snippets";
import { getAllProviders, getOntologyOptions, getSourcesListOfTerminologies } from "@/app/api/actions/providers";
import { PortalCollection, PortalOntologyOption, PortalTerminology, PortalProvider, PortalSourcesJsonData } from "@/app/concepts";
import { useSession } from "next-auth/react";
import LoginFormWrapper from "@/app/user/login/page";
import { getUserList } from "@/app/api/actions/users";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { localizePath } from "@/app/libs/localePath";
import TerminologyMultiSelect from "@/app/ui/collection/terminologyMultiSelect";

type CreationMethod = "manual" | "bulk";
type ManualStep = 1 | 2 | 3;

export default function NewCollection({ debugMode = false }: { debugMode?: boolean }) {
  const locale = useLocale();
  const t = collectionUiMessages[locale];

  const session = useSession();

  const searchParams = useSearchParams();

  const [selectedTermonologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
  const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [sources, setSources] = useState<PortalProvider[]>([]);
  const [preselectedTerminologies, setPreselectedTerminologies] = useState<{
    "label": string,
    "iri": string,
    source: string
  }[]>([]);
  const [autocompleteIsLoaded, setAutocompleteIsLoaded] = useState<boolean>(true);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [creationMethod, setCreationMethod] = useState<CreationMethod>();
  const [manualStep, setManualStep] = useState<ManualStep>(1);
  const [ontologyOptions, setOntologyOptions] = useState<PortalOntologyOption[]>([]);
  const [ontologyOptionsLoaded, setOntologyOptionsLoaded] = useState(false);
  const [ontologyOptionsLoading, setOntologyOptionsLoading] = useState(false);
  const [ontologyOptionsFailed, setOntologyOptionsFailed] = useState(false);
  const [selectedManualTerminologies, setSelectedManualTerminologies] = useState<PortalOntologyOption[]>([]);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const bulkRequestGeneration = useRef(0);
  const sourceRequestGenerations = useRef<Record<string, number>>({});
  const activeSourceRequests = useRef(new Map<string, number>());
  const ontologyRequestInFlight = useRef(false);


  async function submit(e: React.FormEvent) {
    try {
      e.preventDefault();
      if (creationMethod === "bulk" && selectedTermonologies.length === 0) {
        (document.getElementsByClassName('autocomplete-in-form')[0]! as HTMLDivElement).style.border = "1px solid #445669";
        return;
      }
      let pCollection = new PortalCollection();
      pCollection.description = collectionDescription;
      pCollection.label = collectionTitle;
      pCollection.collaborators = selectedCollaborators.map((username: string) => {
        return { username: username, role: "ADMIN" };
      });
      pCollection.isPublic = isPublic;
      pCollection.terminologies = selectedTermonologies.map((terminology: AutoCompleteSelectedTermType) => {
        let t = new PortalTerminology();
        t.label = terminology.label ?? "";
        t.uri = terminology.iri ?? "";
        t.source = terminology.source ?? "";
        t.type = "DATABASE";
        return t;
      });

      setFormIsSubmited(true);
      setLoading(true);

      let res = await createCollection(pCollection.toJson());
      if (searchParams.get('from') === "my-collections") {
        window.location.href = localizePath(`/collection/myCollections?created=${res.status}`, locale);
      } else {
        window.location.href = localizePath(`/collection/?created=${res.status}`, locale);
      }

    } catch {
      return;
    }
  }

  async function loadTerminologies(e: React.ChangeEvent<HTMLInputElement>) {
    let source = e.target.id;
    const requestGeneration = bulkRequestGeneration.current;
    const sourceRequestGeneration = (sourceRequestGenerations.current[source] ?? 0) + 1;
    sourceRequestGenerations.current[source] = sourceRequestGeneration;
    setAutocompleteIsLoaded(false);
    if (e.target.checked) {
      activeSourceRequests.current.set(source, sourceRequestGeneration);
      try {
        const terminologies = await getSourcesListOfTerminologies(source);
        if (requestGeneration !== bulkRequestGeneration.current ||
          sourceRequestGeneration !== sourceRequestGenerations.current[source]) {
          return;
        }
        let preselected = [];
        for (let terminology of terminologies) {
          preselected.push({ label: terminology.label, iri: terminology.iri, source: source });
        }
        setPreselectedTerminologies((current) => [...current, ...preselected]);
      } catch {
        return;
      } finally {
        if (activeSourceRequests.current.get(source) === sourceRequestGeneration) {
          activeSourceRequests.current.delete(source);
        }
        if (requestGeneration === bulkRequestGeneration.current && activeSourceRequests.current.size === 0) {
          setAutocompleteIsLoaded(true);
        }
      }
    } else {
      activeSourceRequests.current.delete(source);
      const importedIris = new Set(
        preselectedTerminologies.filter((item) => item.source === source).map((item) => item.iri),
      );
      setPreselectedTerminologies((current) => current.filter((item) => item.source != source));
      setSelectedTerminologies((current) => current.filter((item) => !importedIris.has(item.iri ?? "")));
      if (activeSourceRequests.current.size === 0) {
        setAutocompleteIsLoaded(true);
      }
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

  function selectManualTerminologies(options: PortalOntologyOption[]) {
    setSelectedManualTerminologies(options);
    setSelectedTerminologies(options.map((option) => ({
      label: option.ontologyId,
      iri: option.uri,
      source: option.providerId,
    })));
  }

  function goBack() {
    if (creationMethod === "manual" && manualStep > 1) {
      setManualStep((manualStep - 1) as ManualStep);
      return;
    }
    resetCreationMethod();
  }

  function goToManualDetails() {
    setManualStep(2);
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

  function resetCreationMethod() {
    bulkRequestGeneration.current += 1;
    activeSourceRequests.current.clear();
    setCreationMethod(undefined);
    setManualStep(1);
    setPreselectedTerminologies([]);
    setSelectedTerminologies([]);
    setSelectedManualTerminologies([]);
    setAutocompleteIsLoaded(true);
  }

  useEffect(() => {
    if (activeSourceRequests.current.size === 0) {
      setAutocompleteIsLoaded(true);
    }
  }, [preselectedTerminologies]);

  useEffect(() => {
    if ((!debugMode && !session.data?.user.token) || ontologyOptionsLoaded || ontologyOptionsLoading || ontologyOptionsFailed) {
      return;
    }
    loadOntologyOptions();
  }, [debugMode, loadOntologyOptions, ontologyOptionsFailed, ontologyOptionsLoaded, ontologyOptionsLoading, session.data?.user.token]);

  useEffect(() => {
    getAllProviders().then((sources: PortalSourcesJsonData[]) => {
      let providers = [];
      for (let source of sources) {
        providers.push(PortalProvider.toObject(source));
      }
      setSources(providers);
    });
    getUserList().then((resp) => {
      if (!resp.status) {
        return;
      }
      let users = resp.content.map((user: { username: string }) => user.username);
      setUsers(users);

    });
  }, []);

  if (!debugMode && !session?.data?.user.token && session.status !== "loading") {
    return <><LoginFormWrapper /></>;
  } else if (!debugMode && session.status === "loading") {
    return <div className="md:col-span-2"><Loading /></div>;
  }

  const progressSteps = creationMethod === "manual"
    ? [t.terminologySelectionStep, t.nameDescriptionStep, t.visibilityCollaboratorsStep]
    : [t.creationMethodStep, t.collectionDetailsStep];
  const progressStep = creationMethod === "manual" ? manualStep : creationMethod ? 2 : 1;
  const progressWidth = creationMethod === "manual"
    ? manualStep === 1 ? "w-1/3" : manualStep === 2 ? "w-2/3" : "w-full"
    : creationMethod ? "w-full" : "w-1/2";

  return (
    <div className="">
      <a
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded text-2xl font-normal text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ts4nfdi-brand-color dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        href={localizePath(
          searchParams.get('from') === "my-collections" ? "/collection/myCollections/" : "/collection/",
          locale,
        )}
        aria-label={t.cancel}
        title={t.cancel}
      >
        <span aria-hidden="true">×</span>
      </a>
      <p className="header-2" key={"heading"}>{t.defineNew}</p>
      <div className="mt-8" aria-label={t.creationProgress}>
        <div className="mb-2 flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200 md:flex-row md:justify-between">
          {progressSteps.map((step) => <span key={step}>{step}</span>)}
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`${progressWidth} h-2.5 rounded-full bg-ts4nfdi-brand-color transition-all dark:bg-ts4nfdi-brand-color`}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={progressSteps.length}
            aria-valuenow={progressStep}
            aria-valuetext={progressSteps[progressStep - 1]}
            aria-label={t.creationProgress}
          />
        </div>
      </div>
      {loading && <Loading />}
      {!creationMethod &&
        <div className="mt-10">
          <p className="mb-5 text-gray-700 dark:text-gray-200">{t.creationIntro}</p>
          <p className="mb-5 text-lg font-medium text-gray-900 dark:text-white">{t.chooseCreationMethod}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              className="min-h-32 rounded-lg border-2 border-gray-300 bg-white p-6 text-left text-lg font-semibold text-gray-900 transition-colors hover:border-ts4nfdi-brand-color hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-ts4nfdi-brand-color/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-ts4nfdi-brand-color dark:hover:bg-gray-700 dark:focus:ring-ts4nfdi-brand-color"
              onClick={() => setCreationMethod("manual")}
            >
              {t.addTerminologiesMyself}
            </button>
            <button
              type="button"
              className="min-h-32 rounded-lg border-2 border-gray-300 bg-white p-6 text-left text-lg font-semibold text-gray-900 transition-colors hover:border-ts4nfdi-brand-color hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-ts4nfdi-brand-color/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-ts4nfdi-brand-color dark:hover:bg-gray-700 dark:focus:ring-ts4nfdi-brand-color"
              onClick={() => setCreationMethod("bulk")}
            >
              {t.bulkImportTerminologies}
            </button>
          </div>
        </div>
      }
      {creationMethod && !formIsSubmitted &&
        <>
          <form
            key={"collection-form"}
            className="mt-10"
            onSubmit={submit}
            onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          >
          {(creationMethod === "bulk" || manualStep === 3) &&
            <div className="form-input-group">
              {creationMethod === "manual"
                ? <div className="flex items-center gap-3">
                    <span className={`text-sm capitalize ${isPublic ? "text-gray-500 dark:text-gray-400" : "font-semibold text-ts4nfdi-brand-color dark:text-white"}`}>
                      {t.private}
                    </span>
                    <ToggleButton
                      id={"visibility"}
                      label={t.public}
                      checked={isPublic}
                      onChange={(event) => setIsPublic(event.target.checked)}
                      brandColor
                      labelClassName={isPublic
                        ? "!font-semibold !text-ts4nfdi-brand-color dark:!text-white"
                        : "!font-normal !text-gray-500 dark:!text-gray-400"}
                    />
                  </div>
                : <ToggleButton
                    id={"visibility"}
                    label={t.public}
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                  />
              }
            </div>
          }
          {(creationMethod === "bulk" || manualStep === 2) &&
            <div className="form-input-group">
            <TextInput
              id="collection-title"
              name="collection-title"
              type="text"
              labelText={t.title}
              placeHolder={t.titlePlaceholder}
              key={"collection-title"}
              required
              defaultValue={collectionTitle}
              onChange={(event) => setCollectionTitle(event.target.value)}
            />
            </div>
          }
          {creationMethod === "bulk" &&
            <div className="form-input-group">
              <p className="" key={"title"}>{t.importHelp}</p>
              <ul
                className="flex md:flex-row flex-col flex-wrap  items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                {sources.map((db: PortalProvider) => {
                  return (
                    <li className="list-item w-1/5 ml-0 mr-0 list-none p-2 border-b border-gray-200 sm:border-b-0  dark:border-gray-600 dark:bg-gray-700"
                      key={db.name}>
                      <CheckBox id={db.name} label={db.name} onChange={loadTerminologies} />
                    </li>
                  );
                })
                }
              </ul>
            </div>
          }
          {creationMethod === "manual" && manualStep === 1 &&
            <div className="form-input-group" key={"manual-terminology-list"}>
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
                  selected={selectedManualTerminologies}
                  searchPlaceholder={t.terminologySearchPlaceholder}
                  providerFilterLabel={t.providerFilter}
                  allProvidersLabel={t.allProviders}
                  additionalProvidersLabel={t.additionalProviders}
                  clearProvidersLabel={t.clearProviders}
                  noResults={t.noTerminologiesFound}
                  limitedResults={t.limitedTerminologyResults}
                  removeLabel={t.removeTerminology}
                  onChange={selectManualTerminologies}
                />
              }
            </div>
          }
          {creationMethod === "bulk" &&
            <div className="form-input-group" key={"terminology-list"}>
              {autocompleteIsLoaded &&
              <AutoCompleteTSS
                setSelectedTerm={(terms: AutoCompleteSelectedTermType[]) => {
                  let selected = terms.filter((term) => !preselectedTerminologies.find((preSelectedTerm) => preSelectedTerm.iri === term.iri));
                  setSelectedTerminologies([...preselectedTerminologies, ...selected]);
                  (document.getElementsByClassName('autocomplete-in-form')[0]! as HTMLDivElement).style.border = "";
                }}
                label={t.terminologies}
                placeholder={t.terminologyPlaceholder}
                parameter="type=ontology"
                required
                preselected={preselectedTerminologies}
              />
              }
            </div>
          }
          {(creationMethod === "bulk" || manualStep === 2) &&
            <div className="form-input-group" key="description">
            <TextArea
              id="description"
              required
              name="collection-desc"
              placeholder={t.descriptionPlaceholder}
              labelText={t.description}
              rows={10}
              defaultValue={collectionDescription}
              onChange={(event) => {
                event.target.setCustomValidity("");
                setCollectionDescription(event.target.value);
              }}
            />
            </div>
          }
          {(creationMethod === "bulk" || manualStep === 3) &&
            <div className="form-input-group" key={"collaborators-list"}>
            <label htmlFor="collection-collaborators" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
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
          }
          <div className="flex justify-between gap-2" key={"submit-btn"}>
            <button
              type="button"
              className="btn !bg-gray-200 !text-gray-900 hover:!bg-gray-300 dark:!bg-gray-600 dark:!text-white dark:hover:!bg-gray-500"
              onClick={goBack}
            >
              {t.back}
            </button>
            {creationMethod === "manual" && manualStep === 1 &&
              <button type="button" className="btn" onClick={goToManualDetails}>{t.next}</button>
            }
            {creationMethod === "manual" && manualStep === 2 &&
              <button
                type="button"
                className="btn"
                onClick={(event) => {
                  const form = event.currentTarget.form;
                  const description = form?.elements.namedItem("collection-desc") as HTMLTextAreaElement | null;
                  description?.setCustomValidity(collectionDescription.trim() ? "" : t.descriptionRequired);
                  if (form?.reportValidity()) {
                    setManualStep(3);
                  }
                }}
              >
                {t.next}
              </button>
            }
            {(creationMethod === "bulk" || manualStep === 3) &&
              <button type="submit" className="btn">{t.create}</button>
            }
          </div>
          </form>
        </>
      }
    </div>
  );
}
