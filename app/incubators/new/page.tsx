'use client'

import { useState } from "react";
import TextEditor from "../../ui/commons/TextEditor/TextEditor";
import { highlightEditorIsEmpty, isTextEditorEmpty } from "../../ui/commons/TextEditor/TextEditor";
import { Loading, SuccessAlert, ErrorAlert, TextInput, FileInput } from "../../ui/commons/snippets";
import { sendIncubatorRequest } from "@/app/api/actions/incubators";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { NewIncubatorForm } from "@/app/api/actions/types";
import { Captcha } from "@/app/ui/commons/captcha";
import { useLocale } from "@/app/i18n";
import { newIncubatorMessages } from "./messages";
import { localizePath } from "@/app/libs/localePath";


export default function AddIncubator() {
  const locale = useLocale();
  const t = newIncubatorMessages[locale];
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
    <div className="md:col-span-2">
      <p className="header-1">{t.title}</p>
      {!loading &&
        <a className="btn" href={localizePath("/incubators/", locale)}>
          <LeftArrowIcon />
          {t.back}
        </a>
      }
      <br /> <br />
      {!formIsSubmitted &&
        <form onSubmit={submit}>
          <div className="grid grid-rows-1 form">
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
            <div className="text-right">
              <button type="submit" className="btn">{t.submit}</button>
            </div>
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
