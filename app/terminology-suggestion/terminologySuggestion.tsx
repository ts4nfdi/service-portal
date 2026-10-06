'use client'

import { FormEvent, useCallback, useRef, useState } from "react";
import { PortalCollectionJsonData, PortalOntologyOption } from "@/app/concepts";
import {
  checkTerminologySuggestionExists,
  submitExistingTerminologiesRequest,
  submitTerminologySuggestion,
  TerminologyShapeResult,
  validateTerminologySuggestion,
} from "@/app/api/actions/terminologySuggestions";
import { getOntologyOptions } from "@/app/api/actions/providers";
import TextEditor, { highlightEditorIsEmpty, isTextEditorEmpty } from "@/app/ui/commons/TextEditor/TextEditor";
import { ErrorAlert, Loading, MultiSelectDropdown, SuccessAlert, TextInput } from "@/app/ui/commons/snippets";
import { TerminologySelectionField } from "@/app/ui/collection/collectionFormFields";
import { collectionUiMessages } from "@/app/ui/collection/messages";
import { useLocale } from "@/app/i18n";
import { terminologySuggestionMessages } from "./messages";

type Workflow = "existing" | "new";

type FormState = {
  name: string;
  purl: string;
  username: string;
  email: string;
};

type ExistingTerminology = {
  label: string;
  collections: string[];
  missingCollections: string[];
};

export default function TerminologySuggestion({ collections }: { collections: PortalCollectionJsonData[] }) {
  const locale = useLocale();
  const t = terminologySuggestionMessages[locale];
  const collectionMessages = collectionUiMessages[locale];
  const [workflow, setWorkflow] = useState<Workflow>();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ name: "", purl: "", username: "", email: "" });
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedTerminologies, setSelectedTerminologies] = useState<PortalOntologyOption[]>([]);
  const [ontologyOptions, setOntologyOptions] = useState<PortalOntologyOption[]>([]);
  const [ontologyOptionsLoaded, setOntologyOptionsLoaded] = useState(false);
  const [ontologyOptionsFailed, setOntologyOptionsFailed] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [shapeResult, setShapeResult] = useState<TerminologyShapeResult | null>(null);
  const [shapeTestFailed, setShapeTestFailed] = useState(false);
  const [existingTerminology, setExistingTerminology] = useState<ExistingTerminology | null>(null);
  const [terminalMessage, setTerminalMessage] = useState("");
  const [purlError, setPurlError] = useState("");
  const [requiredError, setRequiredError] = useState("");
  const [showWarnings, setShowWarnings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<boolean | null>(null);
  const ontologyRequestInFlight = useRef(false);
  const collectionOptions = collections.map((collection) => `${collection.label} (${collection.id})`);
  const lastStep = workflow === "existing" ? 2 : 4;
  const progress = submitted === true ? 100 : Math.max(1, step / lastStep * 100);

  const loadOntologyOptions = useCallback(async () => {
    if (ontologyRequestInFlight.current || ontologyOptionsLoaded) return;
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
  }, [ontologyOptionsLoaded]);

  function update(field: keyof FormState, value: string) {
    setRequiredError("");
    setPurlError("");
    if (field === "purl") {
      setShapeResult(null);
      setShapeTestFailed(false);
      setExistingTerminology(null);
      setMetadata({});
    }
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectWorkflow(value: Workflow) {
    setWorkflow(value);
    setRequiredError("");
    if (value === "existing") void loadOntologyOptions();
  }

  function selectCollections(values: string[]) {
    setSelectedCollections(values);
    setRequiredError("");
  }

  function selectedCollectionIds() {
    return selectedCollections.map((selected) =>
      collections.find((collection) => `${collection.label} (${collection.id})` === selected)?.id ?? selected,
    );
  }

  function existingCollectionMemberships() {
    const targetCollections = collections.filter((collection) => selectedCollectionIds().includes(collection.id));
    return selectedTerminologies.flatMap((option) => targetCollections
      .filter((collection) => collection.terminologies.some((terminology) => terminology.uri === option.uri))
      .map((collection) => `${option.ontologyId} (${collection.label})`));
  }

  async function validateTerminology() {
    const matchingCollections = collections.filter((collection) =>
      collection.terminologies.some((terminology) => terminology.uri === form.purl),
    );
    if (matchingCollections.length) {
      const collectionIds = matchingCollections.map((collection) => collection.id);
      const missingCollections = selectedCollectionIds().filter((id) => !collectionIds.includes(id));
      setExistingTerminology({
        label: matchingCollections[0].terminologies.find((terminology) => terminology.uri === form.purl)?.label ?? form.name,
        collections: collectionIds,
        missingCollections,
      });
      if (!missingCollections.length) {
        setTerminalMessage(t.alreadyExists);
        return false;
      }
      return true;
    }

    const suggestionResponse = await checkTerminologySuggestionExists(form.purl);
    if (!suggestionResponse.status) {
      setPurlError(t.validationUnavailable);
      return false;
    }
    if (suggestionResponse.content) {
      setTerminalMessage(t.suggestionExists);
      return false;
    }

    const validationResponse = await validateTerminologySuggestion(form.purl);
    if (!validationResponse.status || !validationResponse.content?.valid) {
      setPurlError(validationResponse.content?.reason || t.validationUnavailable);
      return false;
    }
    setShapeResult(validationResponse.content.shapeResult ?? null);
    setShapeTestFailed(!!validationResponse.content.shapeTestFailed);
    return true;
  }

  async function next() {
    if (!workflow) {
      setRequiredError(t.required);
      return;
    }
    if (workflow === "existing" && step === 1 && (!selectedTerminologies.length || !selectedCollections.length)) {
      setRequiredError(t.selectionRequired);
      return;
    }
    if (workflow === "existing" && step === 1) {
      const memberships = existingCollectionMemberships();
      if (memberships.length) {
        setRequiredError(`${t.alreadyInTargetCollections} ${memberships.join(", ")}`);
        return;
      }
    }
    if (workflow === "new" && step === 2 && (!form.name.trim() || !form.purl.trim())) {
      setRequiredError(t.required);
      return;
    }
    setRequiredError("");
    if (workflow === "new" && step === 2) {
      setLoading(true);
      const canContinue = await validateTerminology();
      setLoading(false);
      if (!canContinue) return;
    }
    setStep((current) => Math.min(current + 1, lastStep));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== contactStep) return;
    if (workflow === "existing") {
      const memberships = existingCollectionMemberships();
      if (memberships.length) {
        setRequiredError(`${t.alreadyInTargetCollections} ${memberships.join(", ")}`);
        return;
      }
    }
    if (!form.username.trim() || !form.email.trim() || isTextEditorEmpty()) {
      setRequiredError(t.required);
      if (isTextEditorEmpty()) highlightEditorIsEmpty();
      return;
    }

    setRequiredError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = workflow === "existing"
      ? await submitExistingTerminologiesRequest({
        terminologies: selectedTerminologies,
        collectionIds: selectedCollectionIds(),
        username: form.username,
        email: form.email,
        description: formData.get("description") as string,
      })
      : await submitTerminologySuggestion({
        ...form,
        reason: formData.get("reason") as string,
        collectionIds: existingTerminology?.missingCollections ?? selectedCollectionIds(),
        metadata,
      });
    setSubmitted(response.status);
    setLoading(false);
  }

  function reset() {
    setWorkflow(undefined);
    setStep(0);
    setForm({ name: "", purl: "", username: "", email: "" });
    setSelectedCollections([]);
    setSelectedTerminologies([]);
    setMetadata({});
    setShapeResult(null);
    setShapeTestFailed(false);
    setExistingTerminology(null);
    setTerminalMessage("");
    setPurlError("");
    setRequiredError("");
    setSubmitted(null);
  }

  const contactStep = workflow === "existing" ? 2 : 4;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="header-main-1 !mt-0">{t.title}</h1>
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-[var(--siteMainColor)] transition-all dark:bg-blue-500" style={{ width: `${progress}%` }} />
      </div>

      {submitted === true && <SuccessAlert message={workflow === "existing" ? t.existingSuccess : t.success} />}
      {submitted === false && <ErrorAlert message={t.error} />}
      {terminalMessage && <div className="mb-4 rounded-lg bg-blue-50 p-4 text-center font-bold text-blue-800 dark:bg-gray-800 dark:text-blue-300" role="status">{terminalMessage}</div>}

      {submitted === null && !terminalMessage && (
        <form onSubmit={submit} className="form rounded-lg shadow-sm">
          {requiredError && <ErrorAlert message={requiredError} />}
          {purlError && <ErrorAlert message={`${t.invalidPurl}: ${purlError}`} />}

          {step === 0 && (
            <fieldset className="space-y-3">
              <legend className="header-main-3">{t.workflowQuestion}</legend>
              {(["existing", "new"] as const).map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-4 text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800">
                  <input type="radio" name="workflow" value={value} checked={workflow === value} onChange={() => selectWorkflow(value)} />
                  <span>{value === "existing" ? t.addExisting : t.addNew}</span>
                </label>
              ))}
            </fieldset>
          )}

          {workflow === "new" && step === 1 && (
            <section>
              <p>{t.intro}</p>
              <ul className="mb-6 ml-6">
                <li>{t.introName}</li>
                <li>{t.introTerminology}</li>
                <li>{t.introReason}</li>
              </ul>
              <div className="rounded-lg border-l-4 border-[var(--siteMainColor)] bg-gray-50 p-4 dark:border-blue-500 dark:bg-gray-800">
                <h2 className="font-bold">{t.attention}</h2>
                <p className="!px-0">{t.validationNotice}</p>
              </div>
              <p className="mt-6">{t.start}</p>
            </section>
          )}

          {workflow === "existing" && step === 1 && (
            <section>
              <h2 className="header-main-3">{t.existingSelection}</h2>
              <p>{t.existingSelectionHelp}</p>
              <TerminologySelectionField
                messages={collectionMessages}
                options={ontologyOptions}
                selected={selectedTerminologies}
                loaded={ontologyOptionsLoaded}
                failed={ontologyOptionsFailed}
                onRetry={() => void loadOntologyOptions()}
                onChange={(options) => { setSelectedTerminologies(options); setRequiredError(""); }}
              />
              <div className="mt-5">
                <label htmlFor="terminology-collections_input" className="block">{t.targetCollections}</label>
                <MultiSelectDropdown id="terminology-collections" placeholder={t.collectionsPlaceholder} options={collectionOptions} selectedValues={selectedCollections} onSelect={selectCollections} onRemove={selectCollections} />
              </div>
            </section>
          )}

          {workflow === "new" && step === 2 && (
            <section className="space-y-5">
              <h2 className="header-main-3">{t.details}</h2>
              <TextInput id="terminology-name" name="name" type="text" labelText={t.terminologyName} placeHolder={t.terminologyNamePlaceholder} required defaultValue={form.name} onChange={(event) => update("name", event.target.value)} />
              <TextInput id="terminology-purl" name="purl" type="text" labelText={t.purl} placeHolder={t.purlPlaceholder} required defaultValue={form.purl} onChange={(event) => update("purl", event.target.value)} />
              <div>
                <label htmlFor="terminology-collections_input" className="block">{t.collections}</label>
                <MultiSelectDropdown id="terminology-collections" placeholder={t.collectionsPlaceholder} options={collectionOptions} selectedValues={selectedCollections} onSelect={selectCollections} onRemove={selectCollections} />
              </div>
            </section>
          )}

          {workflow === "new" && step === 3 && (
            <section>
              <h2 className="header-main-3">{t.review}</h2>
              {existingTerminology ? (
                <div className="rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-gray-800 dark:text-blue-300">
                  <p className="!px-0">{t.existsInCollections}</p>
                  <p className="!px-0 font-bold">{existingTerminology.collections.join(", ")}</p>
                  <p className="!px-0">{t.addToCollections}</p>
                  <p className="!px-0 font-bold">{existingTerminology.missingCollections.join(", ")}</p>
                </div>
              ) : shapeTestFailed ? (
                <div className="rounded-lg bg-yellow-50 p-4 text-gray-900 dark:bg-gray-700 dark:text-white" role="alert">{t.shapeTestFailed}</div>
              ) : (
                <>
                  <p className="!px-0">{t.reviewText}</p>
                  {!shapeResult?.error.length && <SuccessAlert message={t.noMetadataIssues} />}
                  {shapeResult?.error.map((issue) => (
                    <div className="mb-5" key={issue.about}>
                      <div className="mb-2 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-gray-700 dark:text-red-300">{issue.text}</div>
                      <TextInput id={`metadata-${issue.about}`} name={issue.about} type="text" labelText={issue.about} placeHolder={issue.about} required={false} onChange={(event) => setMetadata((current) => ({ ...current, [issue.about]: event.target.value }))} />
                    </div>
                  ))}
                  {!!shapeResult?.info.length && (
                    <div>
                      <button type="button" className="btn !p-2 !text-sm" onClick={() => setShowWarnings((current) => !current)}>{showWarnings ? t.less : t.more}</button>
                      {showWarnings && <div><h3 className="font-bold">{t.warnings}</h3><ul className="ml-6">{shapeResult.info.map((info) => <li key={info}>{info}</li>)}</ul></div>}
                    </div>
                  )}
                </>
              )}
              <dl className="mt-6 grid gap-4 rounded-lg bg-gray-50 p-5 dark:bg-gray-800">
                <div><dt className="font-bold">{t.terminologyName}</dt><dd>{form.name}</dd></div>
                <div><dt className="font-bold">{t.purl}</dt><dd className="break-all">{form.purl}</dd></div>
                <div><dt className="font-bold">{t.collections}</dt><dd>{selectedCollections.length ? selectedCollections.join(", ") : t.noCollections}</dd></div>
              </dl>
            </section>
          )}

          {workflow && step === contactStep && (
            <section className="space-y-5">
              <h2 className="header-main-3">{t.contact}</h2>
              <TextInput id="suggestion-username" name="username" type="text" labelText={t.username} placeHolder={t.usernamePlaceholder} required defaultValue={form.username} onChange={(event) => update("username", event.target.value)} />
              <div>
                <TextInput id="suggestion-email" name="email" type="email" labelText={t.email} placeHolder={t.emailPlaceholder} required defaultValue={form.email} onChange={(event) => update("email", event.target.value)} />
                <small>{t.emailHint}</small>
              </div>
              <TextEditor
                placeholder={workflow === "existing" ? t.descriptionPlaceholder : t.reasonPlaceholder}
                wrapperId="suggestion-description"
                textSizeOptions={["Normal"]}
                textEditorTranslations={t.textEditorTranslations}
                labelText={workflow === "existing" ? t.description : t.reason}
                name={workflow === "existing" ? "description" : "reason"}
                required
              />
            </section>
          )}

          {loading && <Loading />}
          {!loading && <div className="mt-8 flex justify-end gap-2">
            {step > 0 && <button type="button" className="btn" onClick={() => { setRequiredError(""); setPurlError(""); setStep((current) => current - 1); }}>{t.previous}</button>}
            {step < lastStep && <button type="button" className="btn" onClick={() => void next()}>{t.next}</button>}
            {step === lastStep && <button type="submit" className="btn">{t.submit}</button>}
          </div>}
        </form>
      )}

      {(submitted !== null || terminalMessage) && <button type="button" className="btn" onClick={reset}>{workflow === "existing" ? t.newRequest : t.newSuggestion}</button>}
    </div>
  );
}
