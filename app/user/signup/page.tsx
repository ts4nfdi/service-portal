'use client'

import {TextInput} from "@/app/ui/commons/snippets";
import {useState} from "react";
import {ErrorAlert} from "@/app/ui/commons/snippets";
import {Captcha} from "@/app/ui/commons/captcha";
import {SignUpFormProps} from "@/app/api/auth/types";
import {signUpUser} from "@/app/api/auth/actions";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "../messages";


export default function SignupForm() {
    const t = userPageMessages[useLocale()];

    const [internalError, setInternalError] = useState<boolean>(false);
    const [passNotMatch, setPassNotMatch] = useState<boolean>(false);

    //const [passIsShort, setPassIsShort] = useState<boolean>(false);

    async function submit(e: React.FormEvent) {
        try {
            e.preventDefault();
            let formData = new FormData(document.querySelector('form')!);
            let signUpForm: SignUpFormProps = {
                username: formData.get('username')! as string,
                passoword: formData.get('password')! as string,
                captcha: formData.get("frc-captcha-response") as string
            };

            if (signUpForm.passoword !== formData.get('password-repeat')) {
                setPassNotMatch(true);
                return;
            }

            let res = await signUpUser(signUpForm);
            if (!res.status) {
                setInternalError(true);
                return;
            }
            window.location.href = '/user/login?signup=true';

        } catch {
            setInternalError(true);
        }
    }


    return (
        <>
            <div className="md:col-span-1 md:col-start-2">
                {internalError &&
                  <ErrorAlert message={t.signupInternalError}/>
                }
                {!internalError && passNotMatch &&
                  <ErrorAlert message={t.signupPasswordMismatch}/>
                }
                <p className="header-2">{t.signupTitle}</p>
                <form onSubmit={submit}>
                    <TextInput
                        id="username"
                        type="text"
                        placeHolder={t.usernamePlaceholder}
                        key={"username"}
                        labelText={t.username}
                        name="username"
                        required
                    />
                    <div className="mt-4">
                        <TextInput
                            id="password"
                            type="password"
                            placeHolder={t.passwordPlaceholder}
                            key={"password"}
                            labelText={t.password}
                            name="password"
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <TextInput
                            id="repeat-password"
                            type="password"
                            placeHolder={t.repeatPasswordPlaceholder}
                            key={"password-repeat"}
                            labelText={t.repeatPassword}
                            name="password-repeat"
                            required
                        />
                    </div>
                    <div className="mt-4 mb-2">
                        <Captcha/>
                    </div>
                    <div className="mt-4 text-center">
                        <button type="submit" className="btn mx-auto">{t.signup}</button>
                    </div>
                </form>
            </div>
        </>
    );
}
