"use client";

import { useCallback, useRef, useState } from "react";
import type { PortalTerminologyOption } from "@/app/concepts";
import { getCachedTerminologyOptions } from "./terminologyOptionsCache";

export function useTerminologyOptions() {
  const [terminologyOptions, setTerminologyOptions] = useState<PortalTerminologyOption[]>([]);
  const [terminologyOptionsLoaded, setTerminologyOptionsLoaded] = useState(false);
  const [terminologyOptionsLoading, setTerminologyOptionsLoading] = useState(false);
  const [terminologyOptionsFailed, setTerminologyOptionsFailed] = useState(false);
  const requestInFlight = useRef(false);

  const loadTerminologyOptions = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setTerminologyOptionsLoading(true);
    setTerminologyOptionsFailed(false);
    try {
      const options = await getCachedTerminologyOptions();
      if (!options) {
        setTerminologyOptionsFailed(true);
        return;
      }
      setTerminologyOptions(options);
      setTerminologyOptionsLoaded(true);
    } catch {
      setTerminologyOptionsFailed(true);
    } finally {
      requestInFlight.current = false;
      setTerminologyOptionsLoading(false);
    }
  }, []);

  return { terminologyOptions, terminologyOptionsLoaded, terminologyOptionsLoading, terminologyOptionsFailed, loadTerminologyOptions };
}
