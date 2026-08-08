<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This project uses Next.js 16, which has breaking changes compared with older versions. Before changing framework-specific code, read the relevant local guide in `node_modules/next/dist/docs/` and follow any deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project: Vela Wear Frontend

## Product Context

Vela Wear is a premium fashion ecommerce application. The storefront presents a polished shopping journey for a minimalist clothing brand:

1. Homepage with brand story, seasonal hero, featured categories, and collection entry points.
2. Collection browsing with URL-driven state, multi-select category/color/size, effective-price range, four sort modes, facets, server pagination, and mobile draft/rollback.
3. Product detail with image gallery, size guide, variant selection, reviews, and add-to-cart flow.
4. Cart review with quantity updates, item removal, promo flow, and checkout entry.
5. Checkout with contact, shipping, payment, server preview with `pricingFingerprint`, `Idempotency-Key`, SePay deadline, and success state.
6. Sale and Flash Sale pages with server-clock countdown, campaign lifecycle, per-customer quota, and canonical pricing.
7. Authentication with challenge/proof OTP, Google OAuth, stale-session guard, and Web Lock session serialization.
8. Admin Management dashboard with product/variant/category/brand/color/size CRUD, sale campaign editor, order management, CRM, analytics, and role-based access.

Keep the experience refined, editorial, and purchase-focused. The storefront should feel like a premium fashion store, not a generic SaaS dashboard or QR food ordering app.

## Current Stack

Source of truth: `package.json` and `components.json`.

| Technology | Version / Config | Notes |
| :--- | :--- | :--- |
| Next.js | `16.2.9` | App Router |
| React | `19.2.4` | React Server Components capable |
| React DOM | `19.2.4` | DOM renderer |
| TypeScript | `^5` | Strict typed TS/TSX preferred |
| Tailwind CSS | `^4` | Uses `@tailwindcss/postcss` |
| shadcn CLI | `^4.11.0` | Build tooling in `devDependencies` |
| shadcn style | `base-nova` | Keep generated components consistent with this style |
| `@shadcn/react` | `0.2.1` | Runtime component library in `dependencies` |
| Base UI | `@base-ui/react ^1.5.0` | Headless primitives when needed |
| Icons | `lucide-react ^1.18.0` | Import only the icons used |
| Animation | `motion ^12.40.0` | Existing app uses `motion/react` |
| TanStack Query | `5.101.2` | Server state, cache, retry, `Retry-After` |
| Zustand | `5.0.14` | Client-side state (cart, auth, theme, locale) |
| Axios | `^1.18.1` | HTTP client with interceptors |
| Vitest | `^4.1.10` | Unit testing |
| Playwright | `^1.61.1` | E2E smoke and full-stack tests |
| Package manager | `pnpm` | Lockfile is `pnpm-lock.yaml` |

## Repository Shape

- `app/(shop)/page.tsx`: storefront homepage.
- `app/(shop)/`: storefront routes — collection, product detail, cart, checkout, sale, profile, favourites, coupons, reviews.
- `app/(admin)/dashboard/`: admin management dashboard routes.
- `app/(auth)/`: authentication routes — sign-in, sign-up, OAuth callback.
- `components/shop/`: storefront-scoped components (product card, collection client, home page, profile panels, sale cards, etc.).
- `components/ui/`: shadcn UI primitives.
- `components/providers/`: context providers (query, i18n, notification, cart, favourites).
- `lib/api/`: API client, types, helpers, and transport layer.
- `lib/api-client.ts`: Axios client with in-memory access token, Web Lock refresh, and session generation guard.
- `lib/queries/`: TanStack Query hooks and cache keys.
- `lib/i18n/`: EN/VI locale system with route-scoped catalog splitting.
- `lib/auth/`: post-auth redirect, OTP challenge/proof flow.
- `hooks/`: shared React hooks.
- `lib/utils.ts`: shared utilities such as `cn`.
- `app/globals.css`: global Tailwind theme and CSS.
- `styles/presets/`: theme presets.
- `scripts/`: development tooling (link checker, etc.).
- `docs/`: project documentation.
- `plans/`: shadcn/improve roadmap and plan files.

## Code Conventions

### Component Structure

- Prefer one meaningful component per file when adding new reusable UI.
- Keep component responsibilities clear: product card, cart row, checkout form section, navigation, filters, and similar units should each own a narrow job.
- Move reusable data or pure helpers into `lib/`; move stateful reusable logic into hooks only when it is actually shared or large enough to justify extraction.

### Type Safety

- STRICTLY FORBIDDEN: Do NOT use `any` under any circumstances, including in test files or mock setups (e.g. `as any`).
- Instead of `any`, define explicit interfaces/types for props, data models, callback payloads, and server responses.
- For mocking and tests, use exact type casting (e.g. `as unknown as ReturnType<typeof ...>`), `Parameters<...>`, `vi.mocked(...)`, or `unknown` when truly dynamic.
- Reuse existing types from `lib/api/types.ts` and domain-specific modules.

### Next.js 16 and React 19

- Read the relevant guide in `node_modules/next/dist/docs/` before editing Next.js framework behavior such as routing, layouts, metadata, data fetching, caching, images, or server actions.
- Treat dynamic APIs such as `params`, `searchParams`, `cookies`, and `headers` according to the local Next.js 16 docs.
- Prefer Server Components by default. Add `"use client"` only for components that need browser state, effects, event handlers, animation, or direct DOM/browser APIs.
- Use Server Actions and React form APIs when adding real mutations.
- Use Cache Components directives such as `"use cache"` only when the local docs and the data flow make the caching behavior clear.

### Imports and Bundle Hygiene

- Import only what is used.
- Do not use wildcard imports for large libraries.
- For `lucide-react`, import individual icons by name.
- Keep client components as small as practical. Avoid pulling server-only code, large datasets, or unnecessary libraries into `"use client"` files.

### UI/UX Direction

- Preserve the premium fashion aesthetic: restrained typography, high-quality product imagery, intentional whitespace, subtle motion, and clear purchase affordances.
- The app should remain responsive and pleasant on mobile, tablet, and desktop.
- Do not add marketing boilerplate where the app needs a usable shopping workflow.
- Use familiar controls: icon buttons for compact actions, tabs/segmented controls for category switching, selects/menus for option sets, and clear buttons for purchase actions.
- Keep cards for actual product/order/form group surfaces. Avoid nested cards and decorative section cards.
- Check that text fits within buttons, cards, nav, and checkout panels across viewport sizes.

## Workflow Rules

### Before Starting

- Read `docs/convention.md` first before starting any task to ensure full compliance with the integration guidelines, API standards, and coding conventions.
- Check the working tree with `git status --short` and avoid overwriting user changes.
- Read `docs/PROJECT_STATUS.md` before making changes so the current project state, recent work, and known follow-ups are understood before editing.
- Inspect the existing implementation before editing. Prefer `rg`/`rg --files` for search.

### During Changes

- Keep edits scoped to the requested task.
- Preserve existing behavior unless the task explicitly asks to change it.
- Do not remove code broadly just to simplify a change.
- Use `apply_patch` for manual file edits.
- Follow the existing formatting style and Tailwind conventions.

### Verification

Run the relevant checks before finishing:

- `pnpm lint` for syntax and linting.
- `pnpm build` when changing app structure, Next.js behavior, or anything likely to affect production build output.
- For visual/frontend changes, run the dev server and verify the affected screens in a browser. Capture or update artifacts when useful.

If a required check cannot run because the repo lacks a script or dependency, state that clearly in the final note.

### Processes

- Stop dev servers or long-running test processes started for the task before finishing, unless the user explicitly asks to keep them running.

### Project Status

- Update `docs/PROJECT_STATUS.md` after completing each meaningful task with:
  - date/time,
  - summary of changes,
  - verification performed,
  - known follow-ups.
- Keep entries concise and newest-first so future agents can quickly recover context.

### Git

- Do NOT automatically commit completed work. The user will review the changes first and explicitly instruct you to commit when ready.
- Use a clear commit message when instructed to commit, for example `docs: align agent instructions with vela wear app`.
- Do not include unrelated user changes in the commit.
- If only documentation instructions are changed, a documentation commit is appropriate after checks pass.

## Co-location-based structure

Keep feature code close to the route that owns it.

- Admin Dashboard routes: `app/(admin)/dashboard/<screen>/page.tsx`
- Shop/User routes: `app/(shop)/<screen>/page.tsx`
- Screen-specific components: `app/.../<screen>/_components/`
- Screen-specific data and schemas: `app/.../<screen>/_data/`
- Shared dashboard components: `app/(admin)/dashboard/_components/`
- Shared application components: `components/`
- Local shadcn components: `components/ui/`
- Shared hooks and utilities: `hooks/` and `lib/`
- Theme presets: `styles/presets/`

Keep a component inside its route until it is reused by another feature. Do not move screen-specific code into a shared directory preemptively.

## Creating or extending a screen

1. Inspect the closest current screen before writing code. Finance, Infrastructure, CRM, and Analytics are useful references for Admin.
2. When reproducing a UI from a screenshot or image, follow its visual direction closely. Implement it with the project's existing components and semantic theme tokens rather than copying raw color values. Do not use arbitrary hex, RGB, HSL, or OKLCH values unless explicitly requested.
3. Reuse the existing layouts, local components, and theme tokens.
4. Break each new page into focused components inside the route's `_components/` directory. Keep `page.tsx` small and focused on composing those pieces.
5. Never add `"use client"` to `page.tsx`. Move interactive or browser-dependent code into a dedicated Client Component.
6. Add the screen to `navigation/sidebar/sidebar-items.ts` when it should appear in the dashboard navigation.
7. Decide the information hierarchy before choosing widgets. Let the content determine the page structure.
8. Keep the established visual rhythm where it fits: compact spacing, clear typography hierarchy, responsive action rows, and grids that collapse cleanly on smaller screens.
9. Use semantic theme tokens so new screens work with light mode, dark mode, and the existing theme presets.
10. Handle relevant loading, empty, error, disabled, and overflow states.
11. Keep screens accessible with semantic HTML, keyboard support, visible focus states, labels, and appropriate ARIA attributes.
