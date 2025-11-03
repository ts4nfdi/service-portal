
import { ActionResponse, ContactForm } from './types';
import { sendEmail } from '@/app/libs/email';
import { captchaIsValid } from '@/app/libs/captcha';
import {
  MANDATORY_FIELDS_MISSING_MESSAGE,
  SERVER_ERROR_MESSAGE
} from '@/app/libs/responseStrings';


export async function sendContactForm(formData: ContactForm): Promise<ActionResponse> {
  try {
    let title = formData.title;
    let content = formData.content;
    let email = formData.email;
    let captcha = formData.captcha;

    if (!title || !content || !email || !await captchaIsValid(captcha)) {
      return { status: false, content: MANDATORY_FIELDS_MISSING_MESSAGE };
    }

    let result = await sendEmail({ subject: title, html: content, senderEmail: email });
    if (result) {
      return { status: true, content: "sent" };
    }
    return { status: false, content: SERVER_ERROR_MESSAGE };
  } catch (e) {
    console.log(e)
    return { status: false, content: SERVER_ERROR_MESSAGE };
  }
}
