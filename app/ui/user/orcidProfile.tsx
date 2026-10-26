"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateUserOrcid } from "@/app/api/auth/orcid";
import { updateUserRor } from "@/app/api/auth/ror";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "@/app/user/messages";
import OrcidField from "./orcidField";
import RorField from "./rorField";
import { Modal } from "@/app/ui/commons/modal";
import type { LinkedOrcid } from "@/app/concepts/orcid";

export default function OrcidProfile({ orcids, rors }: { orcids: LinkedOrcid[]; rors: string[] }) {
  const t = userPageMessages[useLocale()];
  const [identityType, setIdentityType] = useState<"orcid" | "ror">();
  const [identity, setIdentity] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!identity || !identityType || saving) return;
    setSaving(true);
    setUnavailable(false);
    try {
      if (!await (identityType === "orcid" ? updateUserOrcid(identity) : updateUserRor(identity))) {
        setUnavailable(true);
        return;
      }
      await update();
      setIsOpen(false);
      router.refresh();
    } catch {
      setUnavailable(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="my-4 w-fit max-w-full rounded-lg border border-gray-300 p-3 dark:border-gray-600" aria-labelledby="orcid-ids-title">
      <h3 id="orcid-ids-title" className="font-semibold text-gray-900 dark:text-white">{t.orcidIds}</h3>
      {orcids.length ? (
        <ul className="mt-3 space-y-2">
          {orcids.map(({ id, isPrimary }) => (
            <li key={id} className="flex flex-wrap items-baseline gap-1">
              <a href={`https://orcid.org/${id}`} target="_blank" rel="noopener noreferrer">{id}</a>
              {isPrimary && <span className="rounded bg-gray-200 px-1 text-[10px] leading-tight text-gray-800 dark:bg-gray-600 dark:text-gray-100">{t.orcidPrimary}</span>}
            </li>
          ))}
        </ul>
      ) : <p>{t.orcidMissing}</p>}
      {rors.length > 0 && <>
        <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{t.rorIds}</h3>
        <ul className="mt-3 space-y-2">
          {rors.map((id) => <li key={id}><a href={id} target="_blank" rel="noopener noreferrer">{id}</a></li>)}
        </ul>
      </>}
      <button className="btn mt-3 !mb-0 !me-0 !px-2 !py-0.5 !text-[11px] !leading-tight" type="button" onClick={() => {
        setIdentity("");
        setIdentityType(undefined);
        setUnavailable(false);
        setIsOpen(true);
      }} disabled={saving}>{t.identityAdd}</button>
      <Modal
        id="update-orcid-modal"
        title={t.identityAdd}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        withCloseBtn
        content={isOpen && (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <fieldset disabled={saving}>
              <legend className="mb-2 font-medium text-gray-900 dark:text-white">{t.identityType}</legend>
              <div className="flex gap-4">
                {(["orcid", "ror"] as const).map((type) => <label key={type} className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <input type="radio" name="identity-type" value={type} checked={identityType === type}
                    onChange={() => { setIdentityType(type); setIdentity(""); setUnavailable(false); }} />
                  {type.toUpperCase()}
                </label>)}
              </div>
            </fieldset>
            {identityType === "orcid" && <>
              <p>{t.orcidAddInstructions}</p>
              <OrcidField onConfirm={(value) => { setIdentity(value); setUnavailable(false); }} />
            </>}
            {identityType === "ror" && <>
              <p>{t.rorAddInstructions}</p>
              <RorField onConfirm={(value) => { setIdentity(value); setUnavailable(false); }} />
            </>}
            {identityType && <button className="btn self-start disabled:cursor-not-allowed disabled:opacity-50 dark:disabled:opacity-50" type="submit" disabled={!identity || saving}>{t.identityAdd}</button>}
            {unavailable && <p role="alert" className="text-red-700 dark:text-red-300">{identityType === "ror" ? t.rorUnavailable : t.orcidUnavailable}</p>}
          </form>
        )}
      />
    </section>
  );
}
