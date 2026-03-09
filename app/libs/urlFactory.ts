'use client'

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";


export function deleteParamsFromUrl(router: AppRouterInstance, paramsToDelete: string[]) {
  let url = new URLSearchParams(window.location.search);
  for (let param of paramsToDelete) {
    url.delete(param);
  }
  router.push(window.location.origin + window.location.pathname + '?' + url.toString());
}

