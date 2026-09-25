'use client'

import { FormEvent, useState } from "react";
import { PortalCollectionJsonData } from "@/app/concepts";
import {
  checkTerminologySuggestionExists,
  runTerminologyShapeTest,
  submitTerminologySuggestion,
  TerminologyShapeResult,
  validateTerminologyPurl,
} from "@/app/api/actions/terminologySuggestions";
import TextEditor, { highlightEditorIsEmpty, isTextEditorEmpty } from "@/app/ui/commons/TextEditor/TextEditor";
import { ErrorAlert, Loading, MultiSelectDropdown, SuccessAlert, TextInput } from "@/app/ui/commons/snippets";
import { useLocale } from "@/app/i18n";
import { terminologySuggestionMessages } from "./messages";

const LAST_STEP = 3;

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
  const t = terminologySuggestionMessages[useLocale()];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ name: "", purl: "", username: "", email: "" });
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [shapeResult, setShapeResult] = useState<TerminologyShapeResult | null>(null);
  const [shapeTestFailed, setShapeTestFailed] = useState(false);
  const [existingTerminology, setExistingTerminology] = useState<ExistingTerminology | null>(null);
  const [terminalMessage, setTerminalMessage] = useState("");
  const [purlError, setPurlError] = useState("");
  const [requiredError, setRequiredError] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<boolean | null>(null);
  const collectionOptions = collections.map((collection) => `${collection.label} (${collection.id})`);
  const progress = submitted === true ? 100 : Math.max(1, step * 25);

  function update(field: keyof FormState, value: string) {
    setRequiredError(false);
    setPurlError("");
    if (field === "purl") {
      setShapeResult(null);
      setShapeTestFailed(false);
      setExistingTerminology(null);
      setMetadata({});
    }
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectedCollectionIds() {
    return selectedCollections.map((selected) =>
      collections.find((collection) => `${collection.label} (${collection.id})` === selected)?.id ?? selected,
    );
  }

  async function validateTerminology() {
    const purlResponse = await validateTerminologyPurl(form.purl);
    if (!purlResponse.status || !purlResponse.content?.valid) {
      setPurlError(purlResponse.content?.reason || t.validationUnavailable);
      return false;
    }

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

    const shapeResponse = await runTerminologyShapeTest(form.purl);
    if (shapeResponse.status) {
      setShapeResult(shapeResponse.content);
    } else {
      setShapeTestFailed(true);
    }
    return true;
  }

  async function next() {
    if (step === 1 && (!form.name.trim() || !form.purl.trim())) {
      setRequiredError(true);
      return;
    }
    setRequiredError(false);
    if (step === 1) {
      setLoading(true);
      const canContinue = await validateTerminology();
      setLoading(false);
      if (!canContinue) return;
    }
    setStep((current) => Math.min(current + 1, LAST_STEP));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.username.trim() || !form.email.trim() || isTextEditorEmpty()) {
      setRequiredError(true);
      if (isTextEditorEmpty()) highlightEditorIsEmpty();
      return;
    }

    setRequiredError(false);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await submitTerminologySuggestion({
      ...form,
      reason: formData.get("reason") as string,
      collectionIds: existingTerminology?.missingCollections ?? selectedCollectionIds(),
      metadata,
    });
    setSubmitted(response.status);
    setLoading(false);
  }

  function reset() {
    setStep(0);
    setForm({ name: "", purl: "", username: "", email: "" });
    setSelectedCollections([]);
    setMetadata({});
    setShapeResult(null);
    setShapeTestFailed(false);
    setExistingTerminology(null);
    setTerminalMessage("");
    setPurlError("");
    setSubmitted(null);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="header-main-1 !mt-0">{t.title}</h1>
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-[var(--siteMainColor)] transition-all dark:bg-blue-500" style={{ width: `${progress}%` }} />
      </div>

      {submitted === true && <SuccessAlert message={t.success} />}
      {submitted === false && <ErrorAlert message={t.error} />}
      {terminalMessage && <div className="mb-4 rounded-lg bg-blue-50 p-4 text-center font-bold text-blue-800 dark:bg-gray-800 dark:text-blue-300" role="status">{terminalMessage}</div>}

      {submitted === null && !terminalMessage && (
        <form onSubmit={submit} className="form rounded-lg shadow-sm">
          {requiredError && <ErrorAlert message={t.required} />}
          {purlError && <ErrorAlert message={`${t.invalidPurl}: ${purlError}`} />}

          {step === 0 && (
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

          {step === 1 && (
            <section className="space-y-5">
              <h2 className="header-main-3">{t.details}</h2>
              <TextInput id="terminology-name" name="name" type="text" labelText={t.terminologyName} placeHolder={t.terminologyNamePlaceholder} required defaultValue={form.name} onChange={(event) => update("name", event.target.value)} />
              <TextInput id="terminology-purl" name="purl" type="text" labelText={t.purl} placeHolder={t.purlPlaceholder} required defaultValue={form.purl} onChange={(event) => update("purl", event.target.value)} />
              <div>
                <label htmlFor="terminology-collections_input" className="block">{t.collections}</label>
                <MultiSelectDropdown id="terminology-collections" placeholder={t.collectionsPlaceholder} options={collectionOptions} selectedValues={selectedCollections} onSelect={setSelectedCollections} onRemove={setSelectedCollections} />
              </div>
            </section>
          )}

          {step === 2 && (
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

          {step === 3 && (
            <section className="space-y-5">
              <h2 className="header-main-3">{t.contact}</h2>
              <TextInput id="suggestion-username" name="username" type="text" labelText={t.username} placeHolder={t.usernamePlaceholder} required defaultValue={form.username} onChange={(event) => update("username", event.target.value)} />
              <div>
                <TextInput id="suggestion-email" name="email" type="email" labelText={t.email} placeHolder={t.emailPlaceholder} required defaultValue={form.email} onChange={(event) => update("email", event.target.value)} />
                <small>{t.emailHint}</small>
              </div>
              <TextEditor placeholder={t.reasonPlaceholder} wrapperId="suggestion-reason" textSizeOptions={["Normal"]} textEditorTranslations={t.textEditorTranslations} labelText={t.reason} name="reason" required />
            </section>
          )}

          {loading && <Loading />}
          {!loading && <div className="mt-8 flex justify-end gap-2">
            {step > 0 && <button type="button" className="btn" onClick={() => { setRequiredError(false); setPurlError(""); setStep((current) => current - 1); }}>{t.previous}</button>}
            {step < LAST_STEP && <button type="button" className="btn" onClick={() => void next()}>{t.next}</button>}
            {step === LAST_STEP && <button type="submit" className="btn">{t.submit}</button>}
          </div>}
        </form>
      )}

      {(submitted !== null || terminalMessage) && <button type="button" className="btn" onClick={reset}>{t.newSuggestion}</button>}
    </div>
  );
}
