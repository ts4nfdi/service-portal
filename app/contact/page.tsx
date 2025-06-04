'use client'

import { sendContactForm } from "../api/actions/contact";
import TextEditor from "../ui/commons/TextEditor/TextEditor";
import { highlightEditorIsEmpty, isTextEditorEmpty } from "../ui/commons/TextEditor/TextEditor";
import { useState } from "react";
import { ActionResponse, ContactForm } from "../api/actions/types";
import { Loading, SuccessAlert, ErrorAlert, TextInput } from "../ui/commons/snippets";
import { Captcha } from "../ui/commons/captcha";


export default function Contact() {
  const [formIsSubmitted, setFormIsSubmited] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    console.log("email sending started ....")
    let form = document.querySelector('form')!;
    let formData = new FormData(form);
    let contactFormData: ContactForm = {
      title: formData.get('title')! as string,
      email: formData.get('email')! as string,
      content: formData.get('content') as string,
      captcha: formData.get("frc-captcha-response") as string
    };
    if (isTextEditorEmpty()) {
      highlightEditorIsEmpty();
      return;
    }
    setFormIsSubmited(true);
    setLoading(true);
    console.log("email sending submiting ....")
    let res = await sendContactForm(contactFormData) as ActionResponse;
    console.log("email sent result: ", res)
    if (!res.status) {
      setError(true);
    }
    setLoading(false);
  }


  return (
    <div className="md:col-span-2">
      <p className="header-1">Contact us</p>
      {!formIsSubmitted &&
        <form onSubmit={submit}>
          <div className="grid grid-rows-1 form">
            <TextInput
              id="title-input"
              type="text"
              name="title"
              placeHolder="Please enter your topic"
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
              placeholder="Please describe your query..."
              wrapperId=""
              textSizeOptions={['Normal', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code']}
              labelText="Message"
              name="content"
              required={true}
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
          message="Thank you for your message! We will contact you as soon as possible."
        />
      }
      {formIsSubmitted && error && !loading &&
        <ErrorAlert
          message="Sorry! Something went wrong."
        />
      }
      {formIsSubmitted && !loading &&
        <a className="btn" href={'/contact'}>New message</a>
      }
    </div>
  );
}
