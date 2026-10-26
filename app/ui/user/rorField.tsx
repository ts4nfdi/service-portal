"use client";

import { useEffect, useState } from "react";
import { getRorIdentity } from "@/app/api/auth/ror";
import type { RorIdentity } from "@/app/concepts/ror";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "@/app/user/messages";

export default function RorField({ onConfirm }: { onConfirm: (ror: string) => void }) {
  const t = userPageMessages[useLocale()];
  const [ror, setRor] = useState("");
  const [identity, setIdentity] = useState<RorIdentity | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!ror.trim()) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const result = await getRorIdentity(ror);
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
  }, [ror]);

  return (
    <div>
      <label htmlFor="ror-id" className="block">{t.ror}</label>
      <input id="ror-id" type="text" value={ror} required placeholder={t.rorPlaceholder}
        onChange={(event) => {
          setRor(event.target.value);
          setChecking(!!event.target.value.trim());
          setIdentity(null);
          setError(false);
          setConfirmed(false);
          onConfirm("");
        }} />
      {checking && <p role="status">{t.orcidChecking}</p>}
      {error && <p role="alert" className="text-red-700 dark:text-red-300">{t.rorInvalid}</p>}
      {identity && (
        <label className="mt-2 flex items-start gap-2">
          <input type="checkbox" className="mt-1" checked={confirmed} onChange={(event) => {
            setConfirmed(event.target.checked);
            onConfirm(event.target.checked ? identity.id : "");
          }} />
          <span>{t.rorConfirm} <strong>{identity.name}</strong> (<a href={identity.id} target="_blank" rel="noopener noreferrer">{identity.id}</a>)</span>
        </label>
      )}
    </div>
  );
}
