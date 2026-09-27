#!/usr/bin/env bash
# Gera os PDFs do currículo (PT e EN) a partir de curriculo.html, usando o Chrome em modo headless.
# Uso: com o servidor local rodando (python3 -m http.server 8000), execute:
#   ./scripts/gerar-pdf-curriculo.sh
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
BASE="${BASE:-http://localhost:8000}"

if ! curl -sf "$BASE/curriculo.html" >/dev/null; then
  echo "Servidor não encontrado em $BASE. Rode antes: python3 -m http.server 8000" >&2
  exit 1
fi

mkdir -p assets/docs
for spec in "pt:curriculo-larissa-galeno.pdf" "en:resume-larissa-galeno.pdf"; do
  lang="${spec%%:*}"
  file="${spec#*:}"
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=8000 \
    --print-to-pdf="assets/docs/$file" "$BASE/curriculo.html?lang=$lang" 2>/dev/null
  echo "✓ assets/docs/$file"
done
