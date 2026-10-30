#!/usr/bin/env bash
set +x
set -euo pipefail

mask() {
  local value="$1"
  value="${value//%/%25}"
  value="${value//$'\r'/%0D}"
  value="${value//$'\n'/%0A}"
  printf '::add-mask::%s\n' "$value"
}

mask "$SECRET_VALUE"
mask "$(printf '%s' "$SECRET_VALUE" | base64 -w 0)"

if ! kubectl create secret generic "$1" \
  --from-literal="$2=$SECRET_VALUE" \
  --namespace=ts4nfdi --dry-run=client -o yaml 2>/dev/null |
  kubectl apply -f - >/dev/null 2>&1; then
  printf '::error::Failed to apply Kubernetes Secret %s\n' "$1" >&2
  exit 1
fi
