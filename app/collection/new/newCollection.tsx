
'use client'

import { Loading } from "@/app/ui/commons/snippets";
import { useCallback, useEffect, useRef, useState } from "react";
import { AutoCompleteSelectedTermType } from "@/app/ui/widgets/types";
import { createCollection } from "@/app/api/actions/collections";
import { getOntologyOptions } from "@/app/api/actions/providers";
import { PortalCollection, PortalOntologyOption, PortalTerminology } from "@/app/concepts";
import { useSession } from "next-auth/react";
import LoginFormWrapper from "@/app/user/login/page";
import { getUserList } from "@/app/api/actions/users";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { localizePath } from "@/app/libs/localePath";
import BulkProviderSelection from "@/app/ui/collection/bulkProviderSelection";
import BulkTerminologyTable from "@/app/ui/collection/bulkTerminologyTable";
import { filterOptionsByProviders } from "@/app/ui/collection/terminologyOptions";
import {
  CollaboratorField,
  CollectionDetailsFields,
  CollectionVisibilityField,
  TerminologySelectionField,
} from "@/app/ui/collection/collectionFormFields";

type CreationMethod = "manual" | "bulk";
type ManualStep = 1 | 2 | 3;
type BulkStep = 1 | 2 | 3 | 4;

export default function NewCollection({ debugMode = false }: { debugMode?: boolean }) {
  const locale = useLocale();
  const t = collectionUiMessages[locale];

  const session = useSession();

  const searchParams = useSearchParams();

  const [selectedTerminologies, setSelectedTerminologies] = useState<AutoCompleteSelectedTermType[]>([]);
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
      pCollection.terminologies = selectedTerminologies.map((terminology: AutoCompleteSelectedTermType) => {
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
      if (!res.status) {
        console.error("Collection creation outcome", res);
        setFormIsSubmited(false);
        setLoading(false);
        return;
      }
      console.log("Collection creation outcome", res);
      if (searchParams.get('from') === "my-collections") {
        window.location.href = localizePath(`/collection/myCollections?created=${res.status}`, locale);
      } else {
        window.location.href = localizePath(`/collection/?created=${res.status}`, locale);
      }
    } catch (error) {
      console.error("Collection creation failed", error);
      setFormIsSubmited(false);
      setLoading(false);
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
    const options = filterOptionsByProviders(ontologyOptions, selectedBulkProviders);
    selectBulkTerminologies(options);
    setBulkStep(2);
  }

  function goToVisibility(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;
    const description = form?.elements.namedItem("collection-desc") as HTMLTextAreaElement | null;
    description?.setCustomValidity(collectionDescription.trim() ? "" : t.descriptionRequired);
    if (form?.reportValidity()) {
      if (creationMethod === "manual") {
        setManualStep(3);
      } else {
        setBulkStep(4);
      }
    }
  }

  function resetCreationMethod() {
    setCreationMethod(undefined);
    setManualStep(1);
    setBulkStep(1);
    setSelectedTerminologies([]);
    setSelectedManualTerminologies([]);
    setSelectedBulkProviders([]);
    setSelectedBulkTerminologies([]);
  }

  function renderCreationMethodSelection() {
    return <div className="mt-10">
      <p className="mb-5 text-gray-700 dark:text-gray-200">{t.creationIntro}</p>
      <p className="mb-5 text-lg font-medium text-gray-900 dark:text-white">{t.chooseCreationMethod}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <button type="button" className="min-h-32 rounded-lg border-2 border-gray-300 bg-white p-6 text-left text-lg font-semibold text-gray-900 transition-colors hover:border-ts4nfdi-brand-color hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-ts4nfdi-brand-color/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-ts4nfdi-brand-color dark:hover:bg-gray-700 dark:focus:ring-ts4nfdi-brand-color" onClick={() => setCreationMethod("manual")}>{t.addTerminologiesMyself}</button>
        <button type="button" className="min-h-32 rounded-lg border-2 border-gray-300 bg-white p-6 text-left text-lg font-semibold text-gray-900 transition-colors hover:border-ts4nfdi-brand-color hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-ts4nfdi-brand-color/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-ts4nfdi-brand-color dark:hover:bg-gray-700 dark:focus:ring-ts4nfdi-brand-color" onClick={() => setCreationMethod("bulk")}>{t.bulkImportTerminologies}</button>
      </div>
    </div>;
  }

  function renderBulkProviderStep() {
    return <div className="form-input-group">
      <p className="mb-4 text-gray-700 dark:text-gray-200">{t.bulkProviderSelectionHelp}</p>
      {ontologyOptionsLoading && <Loading />}
      {ontologyOptionsFailed && <OntologyLoadError onRetry={loadOntologyOptions} />}
      {ontologyOptionsLoaded && <BulkProviderSelection options={ontologyOptions} selected={selectedBulkProviders} descriptions={t.providerDescriptions} label={t.selectProviders} countLabel={t.providerTerminologyCount} countSingularLabel={t.providerTerminologyCountSingular} onChange={setSelectedBulkProviders} />}
    </div>;
  }

  function renderCurrentStep() {
    if (creationMethod === "manual" && manualStep === 1) {
      return <TerminologySelectionField messages={t} options={ontologyOptions} selected={selectedManualTerminologies} loaded={ontologyOptionsLoaded} loading={ontologyOptionsLoading} failed={ontologyOptionsFailed} onRetry={loadOntologyOptions} onChange={selectManualTerminologies} />;
    }
    if (creationMethod === "bulk" && bulkStep === 1) {
      return renderBulkProviderStep();
    }
    if (creationMethod === "bulk" && bulkStep === 2) {
      return <div className="form-input-group">
        <p className="mb-4 text-gray-700 dark:text-gray-200">{t.bulkTerminologySelectionHelp}</p>
        <BulkTerminologyTable options={selectedBulkOptions} selected={selectedBulkTerminologies} searchLabel={t.searchTerminologies} searchPlaceholder={t.terminologySearchPlaceholder} selectAllLabel={t.selectAllTerminologies} terminologyIdLabel={t.terminologyId} providerLabel={t.provider} descriptionLabel={t.description} selectedCountLabel={t.selectedTerminologyCount} previousPageLabel={t.previousPage} nextPageLabel={t.nextPage} pageLabel={t.pageOf} noResults={t.noTerminologiesFound} onChange={selectBulkTerminologies} />
      </div>;
    }
    if (isDetailsStep) {
      return <CollectionDetailsFields messages={t} title={collectionTitle} description={collectionDescription} onTitleChange={setCollectionTitle} onDescriptionChange={setCollectionDescription} />;
    }
    if (isVisibilityStep) {
      return <><CollectionVisibilityField messages={t} isPublic={isPublic} onChange={setIsPublic} /><CollaboratorField messages={t} users={users} selected={selectedCollaborators} onChange={setSelectedCollaborators} /></>;
    }
  }

  function renderNextAction() {
    if (creationMethod === "manual" && manualStep === 1) return <button type="button" className="btn" onClick={goToManualDetails}>{t.next}</button>;
    if (creationMethod === "manual" && manualStep === 2) return <button type="button" className="btn" onClick={goToVisibility}>{t.next}</button>;
    if (creationMethod === "bulk" && bulkStep === 1) return <button type="button" className="btn disabled:cursor-not-allowed disabled:opacity-50" disabled={selectedBulkProviders.length === 0} onClick={goToBulkTerminologies}>{t.next}</button>;
    if (creationMethod === "bulk" && bulkStep === 2) return <button type="button" className="btn" onClick={() => setBulkStep(3)}>{t.next}</button>;
    if (creationMethod === "bulk" && bulkStep === 3) return <button type="button" className="btn" onClick={goToVisibility}>{t.next}</button>;
    return <button type="submit" className="btn">{t.create}</button>;
  }

  function OntologyLoadError({ onRetry }: { onRetry: () => void }) {
    return <div className="text-center" role="alert">
      <p className="text-red-700 dark:text-red-400">{t.terminologyLoadError}</p>
      <button type="button" className="btn !p-1 !text-sm" onClick={onRetry}>{t.retry}</button>
    </div>;
  }

  useEffect(() => {
    if ((!debugMode && !session.data?.user.token) || ontologyOptionsLoaded || ontologyOptionsLoading || ontologyOptionsFailed) {
      return;
    }
    loadOntologyOptions();
  }, [debugMode, loadOntologyOptions, ontologyOptionsFailed, ontologyOptionsLoaded, ontologyOptionsLoading, session.data?.user.token]);

  useEffect(() => {
    getUserList().then((resp) => {
      if (resp.status) {
        setUsers(resp.content.map((user: { username: string }) => user.username));
      }
    });
  }, []);

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
  const isDetailsStep = (creationMethod === "manual" && manualStep === 2) || (creationMethod === "bulk" && bulkStep === 3);
  const isVisibilityStep = (creationMethod === "manual" && manualStep === 3) || (creationMethod === "bulk" && bulkStep === 4);
  const selectedBulkOptions = filterOptionsByProviders(ontologyOptions, selectedBulkProviders);

  if (!debugMode && !session?.data?.user.token && session.status !== "loading") {
    return <><LoginFormWrapper /></>;
  }
  if (!debugMode && session.status === "loading") {
    return <div className="md:col-span-2"><Loading /></div>;
  }

  return <div>
    <a className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded text-2xl font-normal text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ts4nfdi-brand-color dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white" href={localizePath(searchParams.get('from') === "my-collections" ? "/collection/myCollections/" : "/collection/", locale)} aria-label={t.cancel} title={t.cancel}><span aria-hidden="true">×</span></a>
    <p className="header-2">{t.defineNew}</p>
    <div className="mt-8" aria-label={t.creationProgress}>
      <div className="mb-2 flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200 md:flex-row md:justify-between">{progressSteps.map((step) => <span key={step}>{step}</span>)}</div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700"><div className={`${progressWidth} h-2.5 rounded-full bg-ts4nfdi-brand-color transition-all dark:bg-ts4nfdi-brand-color`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent} aria-valuetext={progressSteps[progressStep - 1]} aria-label={t.creationProgress} /></div>
    </div>
    {loading && <Loading />}
    {!creationMethod && renderCreationMethodSelection()}
    {creationMethod && !formIsSubmitted && <form className="mt-10" onSubmit={submit} onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}>
      {renderCurrentStep()}
      <div className="flex justify-between gap-2">
        <button type="button" className="btn !bg-gray-200 !text-gray-900 hover:!bg-gray-300 dark:!bg-gray-600 dark:!text-white dark:hover:!bg-gray-500" onClick={goBack}>{t.back}</button>
        {renderNextAction()}
      </div>
    </form>}
  </div>;
}
