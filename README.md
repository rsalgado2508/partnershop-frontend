# PartnerShop Frontend

Base inicial del admin dashboard de PartnerShop construida con Angular 21, standalone components, routing lazy y TypeScript estricto.

## Stack de la base actual

- Angular 21 + standalone API
- Angular Router con lazy loading por feature
- Tailwind CSS 4 como capa base de layout y theming
- Angular Material/CDK instalado como base funcional
- ESLint con `angular-eslint` en formato flat config
- Environments `development`, `qa` y `production`

## Estructura inicial

```text
src/
  app/
    core/
      auth/
      config/
      http/
    shared/
      models/
      ui/
      utils/
    layout/
      shell/
    features/
      auth/
      dashboard/
      orders/
      users/
      reports/
      settings/
  environments/
```

## Scripts

```bash
npm start
npm run build
npm run build:qa
npm run lint
npm test
```

## Desarrollo local

```bash
npm install
npm start
```

La app queda disponible en `http://localhost:4200`.

## Notas de diseño

- La marca objetivo de esta base es PartnerShop.
- `src/styles.css` es la fuente oficial de tokens del sistema de diseño y usa `@theme` de Tailwind CSS 4.
- Paleta inspirada en PartnerShop: azul confianza como color principal, verde operativo para estados y énfasis cálido en dorado para acciones y highlights.
- Layout enterprise en light mode con sidebar colapsable, header superior y superficies con profundidad suave.
- Componentes base reutilizables en `shared/ui`: botón, card, badge, input, empty state, skeleton e iconografía.

## Notas de avance

- El shell ya es responsive para desktop, tablet y móvil.
- La autenticación base ya soporta sesión persistida, guard, interceptor y callback Cognito con Authorization Code Flow + PKCE.
- El flujo principal en `/login` redirige al Hosted UI de Cognito; el modo `mock` queda como alternativa opcional de desarrollo.

## Cognito objetivo

- `region`: `us-east-1`
- `userPoolId`: `us-east-1_3SQYBzOz0`
- `clientId`: `2ig3klijhql6udsbkh3hjr615l`
- `domain`: `https://us-east-1vytpzdjb4.auth.us-east-1.amazoncognito.com`
- Rutas públicas preparadas: `/login` y `/auth/callback`
- Callback local: `http://localhost:4200/auth/callback`
- Logout local: `http://localhost:4200/login`
- Callback productivo previsto: `https://admin.partnershopcol.com/auth/callback`
- Logout productivo previsto: `https://admin.partnershopcol.com/login`

## Diferencia entre mock auth y Cognito real

- Cognito real: flujo principal. La app redirige al Hosted UI, procesa el `code` en `/auth/callback` y persiste la sesión controlada.
- Mock auth: solo para desarrollo local. No usa credenciales reales ni Hosted UI; crea una sesión local simulada para avanzar en frontend sin depender de AWS.

## Pendiente para activar Cognito real

- Registrar en Cognito los callback/logout URLs locales y productivos.
- Verificar que el App Client tenga habilitado `Authorization code grant` con PKCE.
- Confirmar que el Hosted UI final mantenga este dominio o reemplazar `cognito.domain` por el definitivo antes de salir a producción.

## Integración de órdenes

- Pantalla operativa conectada a `GET http://localhost:3000/api/ordenes`.
- Parámetros soportados por la UI: `page`, `limit`, `estatus`, `busqueda`, `plataforma`.
- La respuesta del backend se tipa exactamente en:
  `src/app/features/orders/data-access/orders-api.models.ts`
- El desacople backend → tabla se resuelve en:
  `src/app/features/orders/data-access/orders.mapper.ts`
- La capa de acceso a datos vive en:
  `src/app/features/orders/data-access/orders.repository.ts`
- El backend devuelve los registros en `data.data` y la paginación en `data.total`, `data.page`, `data.limit`, `data.totalPages`; la pantalla ya consume esa estructura.
- Los `null` se muestran como `—`.
- El mapeo de `estatus` es temporal y visual; queda listo para sustituirse por catálogo real sin tocar la tabla.

## Comando para desplegar el frontend:
aws s3 sync dist/partnershop-frontend/browser/ s3://web.admin.partnershopcol.com --delete --profile partnershop && aws cloudfront create-invalidation --distribution-id E2N0R47PIMPSRT --paths "/*" --profile partnershop