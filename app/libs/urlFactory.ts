'use client'

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";


export function deleteParamsFromUrl(router: AppRouterInstance, paramsToDelete: string[]) {
  let url = new URLSearchParams(window.location.search);
  for (let param of paramsToDelete) {
    url.delete(param);
  }
  const query = url.toString();
  router.replace(window.location.pathname + (query ? '?' + query : ''), {scroll: false});
}
