# CW Empresa

Mobile-first web app (Spanish, Mexico) for car wash companies to manage their assigned bookings, schedule, packages, services, profile, and earnings.

> **Atención**: el backend (`artifacts/api-server`, `lib/db`, `lib/api-zod`, `lib/api-spec`, `scripts/seed.ts`) fue migrado a `../new-server/` y eliminado. Este folder ahora **sólo contiene el frontend** + el cliente HTTP generado.

## Run & Operate

- Backend único: ver `../new-server/` (puerto 8080). Stack completo: `../scripts/start-all.sh` / `../scripts/stop-all.sh`.
- Frontend empresa: `pnpm --filter @workspace/cw-company run dev` (puerto 5174)
- `pnpm run typecheck` — typecheck del frontend
- El proxy `/api → http://localhost:8080` está en `artifacts/cw-company/vite.config.ts` (override con `API_PROXY_TARGET`).

Test creds (bypass dev del new-server): `admin` / `12345`

## Stack

- pnpm workspace mini (sólo frontend + api-client-react), Node.js 24, TypeScript 5.9
- Web: React + Vite + wouter + react-query, Tailwind + shadcn/ui, sonner toasts
- API client: react-query hooks generados con Orval

## Where things live

- `lib/api-client-react/src/generated/` — generated React Query hooks
- `artifacts/cw-company/src/lib/auth.tsx` — auth context (lee `cw_token` de localStorage)
- `artifacts/cw-company/src/components/Layout.tsx` — shell + bottom nav
- `artifacts/cw-company/src/pages/*` — pantallas
- (Backend movido a `../new-server/src/routes/company/` y `../new-server/src/db/schema/`)

## Architecture decisions

- JWT bearer en `Authorization: Bearer <token>`; el cliente generado lo añade vía `setAuthTokenGetter`.
- App intencionalmente mobile-only: un `MobileFrame` (max-w 440) envuelve todo; en desktop muestra el frame centrado.

## Product

Logged-in company sees:
- **Dashboard**: today's stats, next booking, quick actions.
- **Bookings**: filterable list + detail with Accept / Reject / Start / Complete actions.
- **Schedule**: per-day slot availability and blocked dates.
- **Packages / Services**: company-specific pricing on catalog items.
- **Earnings**: 30-day totals, breakdown by payment type, per-service ledger.
- **Profile**: contact info, password change.

## User preferences

_None recorded yet._

## Gotchas

- Never use `Date.toISOString().slice(0,10)` for "today" — use the local helpers (`todayLocalIso` / `todayIso`).
- After editing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` before relying on new hooks/types.
- `scripts/` is typechecked with `noEmit` and a strict `rootDir`; don't import from `artifacts/*`. Duplicate small utilities or move them to a shared lib.
- Bookings query keys come from generated helpers (e.g. `getGetCompanyBookingQueryKey(id)`); don't hand-roll cache keys.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
