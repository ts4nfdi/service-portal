'use client'

import { useState } from "react";
import TextEditor from "../../ui/commons/TextEditor/TextEditor";
import { highlightEditorIsEmpty, isTextEditorEmpty } from "../../ui/commons/TextEditor/TextEditor";
import { Loading, SuccessAlert, ErrorAlert, TextInput, FileInput } from "../../ui/commons/snippets";
import { sendIncubatorRequest } from "@/app/api/actions/incubators";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { NewIncubatorForm } from "@/app/api/actions/types";
import { Captcha } from "@/app/ui/commons/captcha";



export default function AddIncubator() {
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
      <p className="header-1">New incubator request</p>
      {!loading &&
        <a className="btn" href="/incubators/">
          <LeftArrowIcon />
          incubators list
        </a>
      }
      <br /> <br />
      {!formIsSubmitted &&
        <form onSubmit={submit}>
          <div className="grid grid-rows-1 form">
            <TextInput
              id="title-input"
              type="text"
              name="title"
              placeHolder="Please enter your project title"
              labelText="Title"
              required={true}
            />
            <TextInput
              id="email-input"
              type="email"
              name="email"
              placeHolder="Please enter your email"
              labelText="E-mail"
              required={true}
            />
            <TextEditor
              placeholder="Please describe your project..."
              wrapperId=""
              textSizeOptions={['Normal', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code']}
              labelText="Description"
              name="description"
              required={true}
            />
            <FileInput
              id="logo-input"
              name="logo"
              placeHolder={"Please submit a logo image for your project"}
              labelText={`Project Logo <small>(only image file: ${acceptedFileExt.join(", ")})</small>`}
              required={false}
              accept={acceptedFileExt.join(", ")}
            />
            <Captcha />
            <div className="text-center">
              <button type="submit" className="btn">Submit</button>
            </div>
          </div>
        </form>
      }

      {loading && <Loading />}
      {formIsSubmitted && !error && !loading &&
        <SuccessAlert
          message="Thank you for your query! We will contact you as soon as possible."
        />
      }
      {formIsSubmitted && error && !loading &&
        <ErrorAlert
          message="Sorry! Something went wrong."
        />
      }
      {formIsSubmitted && !loading &&
        <a className="btn" href={'/incubators/new/'}>New request</a>
      }

    </div>
  );
}
