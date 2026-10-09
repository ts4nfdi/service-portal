"use client";

import { useRef, useState } from "react";
import { getOrcidIdentity } from "@/app/api/auth/orcid";
import type { OrcidIdentity } from "@/app/concepts/orcid";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "@/app/user/messages";

export default function OrcidField({ onConfirm }: { onConfirm: (orcid: string) => void }) {
  const t = userPageMessages[useLocale()];
  const [orcid, setOrcid] = useState("");
  const [identity, setIdentity] = useState<OrcidIdentity | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const currentOrcid = useRef("");

  async function verify() {
    setChecking(true);
    setError(false);
    setConfirmed(false);
    onConfirm("");
    const checkedOrcid = orcid.trim();
    const result = await getOrcidIdentity(checkedOrcid);
    if (currentOrcid.current !== orcid) {
      setChecking(false);
      return;
    }
    setIdentity(result);
    setError(!result);
    setChecking(false);
  }

  return (
    <div>
      <label htmlFor="orcid-id" className="block">{t.orcid}</label>
      <div className="flex gap-2">
        <input id="orcid-id" type="text" value={orcid} required
          placeholder="0000-0000-0000-0000"
          onChange={(event) => {
            currentOrcid.current = event.target.value;
            setOrcid(event.target.value);
            setIdentity(null);
            setError(false);
            setConfirmed(false);
            onConfirm("");
          }} />
        <button className="btn" type="button" disabled={checking || !orcid.trim()} onClick={verify}>
          {checking ? t.orcidChecking : t.orcidVerify}
        </button>
      </div>
      {error && <p role="alert" className="text-red-700 dark:text-red-300">{t.orcidInvalid}</p>}
      {identity && (
        <label className="mt-2 flex items-start gap-2">
          <input type="checkbox" className="mt-1" checked={confirmed} onChange={(event) => {
            setConfirmed(event.target.checked);
            onConfirm(event.target.checked ? orcid.trim() : "");
          }} />
          <span>{t.orcidConfirm} <strong>{identity.name}</strong> ({identity.id})</span>
        </label>
      )}
    </div>
  );
}
