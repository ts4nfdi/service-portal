"use client";

import { useEffect, useState } from "react";
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
  useEffect(() => {
    if (!orcid.trim()) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const result = await getOrcidIdentity(orcid);
        if (cancelled) return;
        setIdentity(result);
        setError(!result);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [orcid]);

  return (
    <div>
      <label htmlFor="orcid-id" className="block">{t.orcid}</label>
      <div className="flex gap-2">
        <input id="orcid-id" type="text" value={orcid} required
          placeholder={t.orcidPlaceholder}
          onChange={(event) => {
            setOrcid(event.target.value);
            setChecking(!!event.target.value.trim());
            setIdentity(null);
            setError(false);
            setConfirmed(false);
            onConfirm("");
          }} />
      </div>
      {checking && <p role="status">{t.orcidChecking}</p>}
      {error && <p role="alert" className="text-red-700 dark:text-red-300">{t.orcidInvalid}</p>}
      {identity && (
        <label className="mt-2 flex items-start gap-2">
          <input type="checkbox" className="mt-1" checked={confirmed} onChange={(event) => {
            setConfirmed(event.target.checked);
            onConfirm(event.target.checked ? identity.id : "");
          }} />
          <span>{t.orcidConfirm} <strong>{identity.name}</strong> ({identity.id})</span>
        </label>
      )}
    </div>
  );
}
