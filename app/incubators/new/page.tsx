'use client'

import { useState } from "react";
import TextEditor from "../../ui/commons/TextEditor/TextEditor";
import { highlightEditorIsEmpty, isTextEditorEmpty } from "../../ui/commons/TextEditor/TextEditor";
import { Loading, SuccessAlert, ErrorAlert, TextInput, FileInput } from "../../ui/commons/snippets";
import { sendIncubatorRequest } from "@/app/api/actions/incubators";
import { NewIncubatorForm } from "@/app/api/actions/types";
import { Captcha } from "@/app/ui/commons/captcha";
import { useLocale } from "@/app/i18n";
import { newIncubatorMessages } from "./messages";
import { localizePath } from "@/app/libs/localePath";
import IncubatorRequestInfo from "@/app/ui/incubators/requestInfo";


export default function AddIncubator() {
  const locale = useLocale();
  const t = newIncubatorMessages[locale];
  const [step, setStep] = useState<1 | 2>(1);
  const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const acceptedFileExt = [".jpg", ".jpeg", ".png", ".PNG", ".svg"];


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    let form = document.querySelector('form')!;
    let formData = new FormData(form);
    let newIncubatorFormData: NewIncubatorForm = {
      title: formData.get('title')! as string,
      email: formData.get('email')! as string,
      description: formData.get('description')! as string,
      logo: formData.get('logo')! as File,
      captcha: formData.get("frc-captcha-response") as string
    };
    if (isTextEditorEmpty()) {
      highlightEditorIsEmpty();
      return;
    }
    setFormIsSubmited(true);
    setLoading(true);
    let result = await sendIncubatorRequest(newIncubatorFormData);
    if (!result.status) {
      setError(true);
    }
    setLoading(false);

    return;
  }


  return (
    <div className="relative md:col-span-3 content-panel">
      <p className="header-2">{t.title}</p>
      {!loading &&
        <a className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded text-2xl font-normal text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ts4nfdi-brand-color dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white" href={localizePath("/incubators/", locale)} aria-label={t.cancel} title={t.cancel}>
          <span aria-hidden="true">×</span>
        </a>
      }
      {!formIsSubmitted &&
        <>
          <div className="mt-8" aria-label={t.creationProgress}>
            <div className="mb-2 flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200 md:flex-row md:justify-between">
              {[t.explanationStep, t.formStep].map((label, index) => (
                <span key={label} aria-current={index === step - 1 ? "step" : undefined} className={index === step - 1 ? "font-bold" : undefined}>{label}</span>
              ))}
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div className={`${step === 1 ? "w-1/2" : "w-full"} h-2.5 rounded-full bg-ts4nfdi-brand-color transition-all dark:bg-ts4nfdi-brand-color`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={step * 50} aria-valuetext={step === 1 ? t.explanationStep : t.formStep} aria-label={t.creationProgress} />
            </div>
          </div>
          {step === 1 && (
            <div className="mt-10">
              <IncubatorRequestInfo />
              <div className="flex justify-end">
                <button type="button" className="btn" onClick={() => setStep(2)}>{t.continueToForm}</button>
              </div>
            </div>
          )}
        </>
      }
      {!formIsSubmitted &&
        <form className="mt-10" onSubmit={submit} hidden={step !== 2}>
          <div className="grid grid-rows-1 form-input-group">
            <div className="mb-2">
              <TextInput
                id="title-input"
                type="text"
                name="title"
                placeHolder={t.titlePlaceholder}
                labelText={t.projectTitle}
                required={true}
              />
            </div>
            <div className="mb-4">
              <TextInput
                id="email-input"
                type="email"
                name="email"
                placeHolder={t.emailPlaceholder}
                labelText={t.email}
                required={true}
              />
            </div>
            <TextEditor
              placeholder={t.descriptionPlaceholder}
              wrapperId=""
              textSizeOptions={['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code']}
              textEditorTranslations={t.textEditorTranslations}
              labelText={t.description}
              name="description"
              required={true}
            />
            <div className="mb-4 mt-2">
              <FileInput
                id="logo-input"
                name="logo"
                placeHolder={t.logoPlaceholder}
                labelText={`${t.logo} <small>(${t.logoHint}: ${acceptedFileExt.join(", ")})</small>`}
                required={false}
                accept={acceptedFileExt.join(", ")}
              />
            </div>

            <Captcha />
          </div>
          <div className="flex justify-between gap-2">
            <button type="button" className="btn !bg-gray-200 !text-gray-900 hover:!bg-gray-300 dark:!bg-gray-600 dark:!text-white dark:hover:!bg-gray-500" onClick={() => setStep(1)}>{t.backToExplanation}</button>
            <button type="submit" className="btn">{t.submit}</button>
          </div>
        </form>
      }

      {loading && <Loading />}
      {formIsSubmitted && !error && !loading &&
        <SuccessAlert
          message={t.success}
        />
      }
      {formIsSubmitted && error && !loading &&
        <ErrorAlert
          message={t.error}
        />
      }
      {formIsSubmitted && !loading &&
        <a className="btn" href={localizePath("/incubators/new/", locale)}>{t.newRequest}</a>
      }

    </div>
  );
}
