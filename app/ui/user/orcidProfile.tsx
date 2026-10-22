"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateUserOrcid } from "@/app/api/auth/orcid";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "@/app/user/messages";
import OrcidField from "./orcidField";
import { Modal } from "@/app/ui/commons/modal";
import type { LinkedOrcid } from "@/app/concepts/orcid";

export default function OrcidProfile({ orcids }: { orcids: LinkedOrcid[] }) {
  const t = userPageMessages[useLocale()];
  const [orcid, setOrcid] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orcid || saving) return;
    setSaving(true);
    setUnavailable(false);
    try {
      if (!await updateUserOrcid(orcid)) {
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
      <button className="btn mt-3 !mb-0 !me-0 !px-2 !py-0.5 !text-[11px] !leading-tight" type="button" onClick={() => {
        setOrcid("");
        setUnavailable(false);
        setIsOpen(true);
      }} disabled={saving}>{t.orcidAdd}</button>
      <Modal
        id="update-orcid-modal"
        title={t.orcidAdd}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        withCloseBtn
        content={isOpen && (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <p>{t.orcidAddInstructions}</p>
            <OrcidField onConfirm={(value) => { setOrcid(value); setUnavailable(false); }} />
            <button className="btn self-start disabled:cursor-not-allowed disabled:opacity-50 dark:disabled:opacity-50" type="submit" disabled={!orcid || saving}>{t.orcidAdd}</button>
            {unavailable && <p role="alert" className="text-red-700 dark:text-red-300">{t.orcidUnavailable}</p>}
          </form>
        )}
      />
    </section>
  );
}
