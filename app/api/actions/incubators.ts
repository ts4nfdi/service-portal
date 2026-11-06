'use server'

import { promises as fs } from "fs";
import path from "path";
import { NewIncubatorForm } from "./types";
import { sendEmail } from "@/app/libs/email";
import { ActionResponse } from "./types";
import { captchaIsValid } from "@/app/libs/captcha";
import {
	MANDATORY_FIELDS_MISSING_MESSAGE,
	SERVER_ERROR_MESSAGE,
	FILE_TYPE_NOT_ALLOWED_MESSAGE
} from "@/app/libs/responseStrings";

export async function getIncubators() {
	const filePath = path.join(process.cwd(), "app/ui/incubators/", "projects.json");
	const text = await fs.readFile(filePath, "utf8");
	return JSON.parse(text);
}


export async function sendIncubatorRequest(formData: NewIncubatorForm): Promise<ActionResponse> {
	try {
		let title = formData.title;
		let desc = formData.description;
		let logo = formData.logo;
		let email = formData.email;
		let captcha = formData.captcha;

		let fileIsAttached = logo && logo.size !== 0;

		const acceptableMimeTypes = ["image/png", "image/jpeg", "image/svg+xml"]
		//@ts-ignore
		if (fileIsAttached && !acceptableMimeTypes.includes(logo.type)) {
			return { status: false, content: FILE_TYPE_NOT_ALLOWED_MESSAGE };
		}

		if (!title || !desc || !email || !await captchaIsValid(captcha)) {
			return { status: false, content: MANDATORY_FIELDS_MISSING_MESSAGE };
		}

		let result = await sendEmail({ subject: title, html: desc, file: (fileIsAttached ? logo : undefined), senderEmail: email });

		if (result) {
			return { status: true, content: "sent" };
		}
		return { status: false, content: SERVER_ERROR_MESSAGE };
	} catch {

		return { status: false, content: SERVER_ERROR_MESSAGE };
	}
}
