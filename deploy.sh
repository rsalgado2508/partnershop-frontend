#!/bin/bash

set -e

echo "🚀 Iniciando proceso de build y despliegue..."
echo "================================================"

# ── BUILD ──────────────────────────────────────────
echo ""
echo "🔨 [1/3] Compilando la versión productiva..."
npx ng build --configuration production

echo ""
echo "✅ Build completado exitosamente."

# ── SYNC S3 ────────────────────────────────────────
echo ""
echo "☁️  [2/3] Sincronizando archivos con S3..."
aws s3 sync dist/partnershop-frontend/browser/ s3://web.admin.partnershopcol.com \
  --delete \
  --profile partnershop

echo ""
echo "✅ Archivos sincronizados en S3."

# ── INVALIDATE CLOUDFRONT ──────────────────────────
echo ""
echo "🌐 [3/3] Invalidando caché de CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id E2N0R47PIMPSRT \
  --paths "/*" \
  --profile partnershop

echo ""
echo "================================================"
echo "🎉 ¡Despliegue completado exitosamente!"
