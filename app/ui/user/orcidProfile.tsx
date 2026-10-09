"use client";

import { FormEvent, useState } from "react";
import { updateUserOrcid } from "@/app/api/auth/orcid";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "@/app/user/messages";
import OrcidField from "./orcidField";

export default function OrcidProfile() {
  const t = userPageMessages[useLocale()];
  const [orcid, setOrcid] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orcid) return;
    setUnavailable(!await updateUserOrcid(orcid));
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p>{t.orcidMissing}</p>
      <OrcidField onConfirm={(value) => { setOrcid(value); setUnavailable(false); }} />
      <button className="btn self-start" type="submit" disabled={!orcid}>{t.orcidSave}</button>
      {unavailable && <p role="alert" className="text-red-700 dark:text-red-300">{t.orcidUnavailable}</p>}
    </form>
  );
}
