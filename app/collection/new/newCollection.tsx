
'use client'

import { TextInput, MultiSelectDropdown } from "@/app/ui/commons/snippets";
import { useCallback, useEffect, useRef, useState } from "react";
import { AutoCompleteSelectedTermType } from "@/app/ui/widgets/types";
import { createCollection } from "@/app/api/actions/collections";
import { Loading, TextArea } from "@/app/ui/commons/snippets";
import { ToggleButton } from "@/app/ui/commons/snippets";
import { getOntologyOptions } from "@/app/api/actions/providers";
import { PortalCollection, PortalOntologyOption, PortalTerminology } from "@/app/concepts";
import { useSession } from "next-auth/react";
import LoginFormWrapper from "@/app/user/login/page";
import { getUserList } from "@/app/api/actions/users";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { localizePath } from "@/app/libs/localePath";
import TerminologyMultiSelect from "@/app/ui/collection/terminologyMultiSelect";
import BulkProviderSelection from "@/app/ui/collection/bulkProviderSelection";
import BulkTerminologyTable from "@/app/ui/collection/bulkTerminologyTable";

type CreationMethod = "manual" | "bulk";
type ManualStep = 1 | 2 | 3;
type BulkStep = 1 | 2 | 3 | 4;

export default function NewCollection({ debugMode = false }: { debugMode?: boolean }) {
  const locale = useLocale();
  const t = collectionUiMessages[locale];

  const session = useSession();

  const searchParams = useSearchParams();

  const [selectedTermonologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
  const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [creationMethod, setCreationMethod] = useState<CreationMethod>();
  const [manualStep, setManualStep] = useState<ManualStep>(1);
  const [bulkStep, setBulkStep] = useState<BulkStep>(1);
  const [ontologyOptions, setOntologyOptions] = useState<PortalOntologyOption[]>([]);
  const [ontologyOptionsLoaded, setOntologyOptionsLoaded] = useState(false);
  const [ontologyOptionsLoading, setOntologyOptionsLoading] = useState(false);
  const [ontologyOptionsFailed, setOntologyOptionsFailed] = useState(false);
  const [selectedManualTerminologies, setSelectedManualTerminologies] = useState<PortalOntologyOption[]>([]);
  const [selectedBulkProviders, setSelectedBulkProviders] = useState<string[]>([]);
  const [selectedBulkTerminologies, setSelectedBulkTerminologies] = useState<PortalOntologyOption[]>([]);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const ontologyRequestInFlight = useRef(false);


  async function submit(e: React.FormEvent) {
    try {
      e.preventDefault();
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
    setCollectionTerminologies(options);
  }

  function selectBulkTerminologies(options: PortalOntologyOption[]) {
    setSelectedBulkTerminologies(options);
    setCollectionTerminologies(options);
  }

  function setCollectionTerminologies(options: PortalOntologyOption[]) {
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
    if (creationMethod === "bulk" && bulkStep > 1) {
      setBulkStep((bulkStep - 1) as BulkStep);
      return;
    }
    resetCreationMethod();
  }

  function goToManualDetails() {
    setManualStep(2);
  }

  function goToBulkTerminologies() {
    const options = ontologyOptions.filter((option) => selectedBulkProviders.includes(option.providerId));
    selectBulkTerminologies(options);
    setBulkStep(2);
  }

  function goToVisibility(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    const description = form?.elements.namedItem("collection-desc") as HTMLTextAreaElement | null;
    description?.setCustomValidity(collectionDescription.trim() ? "" : t.descriptionRequired);
    if (form?.reportValidity()) {
      creationMethod === "manual" ? setManualStep(3) : setBulkStep(4);
    }
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
    setCreationMethod(undefined);
    setManualStep(1);
    setBulkStep(1);
    setSelectedTerminologies([]);
    setSelectedManualTerminologies([]);
    setSelectedBulkProviders([]);
    setSelectedBulkTerminologies([]);
  }

  useEffect(() => {
    if ((!debugMode && !session.data?.user.token) || ontologyOptionsLoaded || ontologyOptionsLoading || ontologyOptionsFailed) {
      return;
    }
    loadOntologyOptions();
  }, [debugMode, loadOntologyOptions, ontologyOptionsFailed, ontologyOptionsLoaded, ontologyOptionsLoading, session.data?.user.token]);

  useEffect(() => {
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
    ? [t.creationMethodStep, t.terminologySelectionStep, t.nameDescriptionStep, t.visibilityCollaboratorsStep]
    : creationMethod === "bulk"
      ? [t.creationMethodStep, t.providerSelectionStep, t.terminologySelectionStep, t.nameDescriptionStep, t.visibilityCollaboratorsStep]
      : [t.creationMethodStep];
  const progressStep = creationMethod === "manual" ? manualStep + 1 : creationMethod === "bulk" ? bulkStep + 1 : 1;
  const progressPercent = creationMethod === "manual"
    ? [50, 75, 100][manualStep - 1]
    : creationMethod === "bulk"
      ? [40, 60, 80, 100][bulkStep - 1]
      : 20;
  const progressWidth = creationMethod === "manual"
    ? manualStep === 1 ? "w-1/2" : manualStep === 2 ? "w-3/4" : "w-full"
    : creationMethod === "bulk"
      ? bulkStep === 1 ? "w-2/5" : bulkStep === 2 ? "w-3/5" : bulkStep === 3 ? "w-4/5" : "w-full"
      : "w-1/5";

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
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
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
          {((creationMethod === "manual" && manualStep === 3) || (creationMethod === "bulk" && bulkStep === 4)) &&
            <div className="form-input-group">
              <div className="flex items-center gap-3">
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
            </div>
          }
          {((creationMethod === "manual" && manualStep === 2) || (creationMethod === "bulk" && bulkStep === 3)) &&
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
          {creationMethod === "bulk" && bulkStep === 1 &&
            <div className="form-input-group">
              <p className="mb-4 text-gray-700 dark:text-gray-200">{t.bulkProviderSelectionHelp}</p>
              {ontologyOptionsLoading && <Loading />}
              {ontologyOptionsFailed &&
                <div className="text-center" role="alert">
                  <p className="text-red-700 dark:text-red-400">{t.terminologyLoadError}</p>
                  <button type="button" className="btn !p-1 !text-sm" onClick={loadOntologyOptions}>{t.retry}</button>
                </div>
              }
              {ontologyOptionsLoaded &&
                <BulkProviderSelection
                  options={ontologyOptions}
                  selected={selectedBulkProviders}
                  descriptions={t.providerDescriptions}
                  label={t.selectProviders}
                  countLabel={t.providerTerminologyCount}
                  countSingularLabel={t.providerTerminologyCountSingular}
                  onChange={setSelectedBulkProviders}
                />
              }
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
                  providerDescriptions={t.providerDescriptions}
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
          {creationMethod === "bulk" && bulkStep === 2 &&
            <div className="form-input-group" key={"terminology-list"}>
              <p className="mb-4 text-gray-700 dark:text-gray-200">{t.bulkTerminologySelectionHelp}</p>
              <BulkTerminologyTable
                options={ontologyOptions.filter((option) => selectedBulkProviders.includes(option.providerId))}
                selected={selectedBulkTerminologies}
                searchLabel={t.searchTerminologies}
                searchPlaceholder={t.terminologySearchPlaceholder}
                selectAllLabel={t.selectAllTerminologies}
                terminologyIdLabel={t.terminologyId}
                providerLabel={t.provider}
                descriptionLabel={t.description}
                selectedCountLabel={t.selectedTerminologyCount}
                previousPageLabel={t.previousPage}
                nextPageLabel={t.nextPage}
                pageLabel={t.pageOf}
                noResults={t.noTerminologiesFound}
                onChange={selectBulkTerminologies}
              />
            </div>
          }
          {((creationMethod === "manual" && manualStep === 2) || (creationMethod === "bulk" && bulkStep === 3)) &&
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
          {((creationMethod === "manual" && manualStep === 3) || (creationMethod === "bulk" && bulkStep === 4)) &&
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
                onClick={goToVisibility}
              >
                {t.next}
              </button>
            }
            {creationMethod === "bulk" && bulkStep === 1 &&
              <button
                type="button"
                className="btn disabled:cursor-not-allowed disabled:opacity-50"
                disabled={selectedBulkProviders.length === 0}
                onClick={goToBulkTerminologies}
              >
                {t.next}
              </button>
            }
            {creationMethod === "bulk" && bulkStep === 2 &&
              <button type="button" className="btn" onClick={() => setBulkStep(3)}>{t.next}</button>
            }
            {creationMethod === "bulk" && bulkStep === 3 &&
              <button type="button" className="btn" onClick={goToVisibility}>{t.next}</button>
            }
            {((creationMethod === "manual" && manualStep === 3) || (creationMethod === "bulk" && bulkStep === 4)) &&
              <button type="submit" className="btn">{t.create}</button>
            }
          </div>
          </form>
        </>
      }
    </div>
  );
}
