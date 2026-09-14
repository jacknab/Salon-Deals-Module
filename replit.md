# Salon Deals

A drop-in mini deals marketplace for salon directories, connecting local clients with limited-time salon offers and digital vouchers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/salon-deals` — the customer marketplace, voucher wallet, deal detail flow, and salon redemption console.
- `artifacts/salon-deals/src/data` — seeded deals and voucher state persisted in local storage for the first module build.
- `artifacts/salon-deals/src/index.css` — shared visual tokens and app styling.
- `attached_assets` — original Groupon-era screenshots supplied as UX references only.

## Architecture decisions

- The first version is frontend-only with local storage so it can be embedded and wired into an existing salon directory without requiring a payment provider, auth system, or database migration.
- Customer and salon experiences share one shell and can be switched without creating separate products.
- Voucher issuance and redemption are modeled as local state now; the integration seam is the deal/voucher data layer rather than hard-coding the flows into the page layout.

## Product

- Customers can discover, search, filter, favorite, and purchase limited-time salon deals.
- Customers receive active, used, and expired vouchers in a wallet with a scannable voucher view.
- Salons can review active deals, monitor sales and redemption metrics, look up voucher codes, and mark visits as redeemed.

## User preferences

- The user wants a mini Groupon-style system that can be dropped into their existing salon marketplace/directory.

## Gotchas

- The first build uses local seeded data and local storage; production wiring should replace that layer with the host marketplace's auth, database, and checkout services.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
