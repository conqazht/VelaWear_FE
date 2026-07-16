# Plan FE-006: Scope shop providers to shop routes

> **shadcn/improve provenance**: Generated from the **shadcn/improve skill v1.0.0** audit. This English file is canonical. Codex implements it directly; do **not** invoke `improve execute`. Vietnamese copy: `plans/vi/006-scope-shop-providers-to-shop-routes.vi.md`.
>
> **Executor instructions**: Measure/verify route boundaries, preserve provider order, and do not move global auth/query/i18n providers. STOP if any non-shop route consumes a shop context.
>
> **Drift check (run first)**: `git diff --stat ff217af..HEAD -- app/layout.tsx 'app/(shop)/layout.tsx' app/provider-boundaries.test.ts components/shop/shop-providers.tsx components/shop/cart-provider.tsx components/shop/notification-provider.tsx components/shop/favorites-provider.tsx e2e/provider-boundaries.spec.ts`

## Status

- **Priority**: P2
- **Effort**: M
- **Wave**: 3
- **Risk**: MED — a missing or misordered context breaks whole route groups at runtime.
- **Depends on**: FE-003
- **Category**: perf
- **Planned at**: commit `ff217af`, 2026-07-16

## Why this matters

The root layout mounts cart, notification and favorites state for storefront, auth and Management routes. These client providers and their dependencies enlarge unrelated route trees and can trigger customer data work in authenticated admin sessions. All current consumers live under the shop route group, so their lifetime should match that boundary.

## Current state

- `app/layout.tsx:48-59` wraps every route with:
  ```tsx
  <AuthProvider>
    <CartProvider><NotificationProvider><FavoritesProvider>{children}</FavoritesProvider></NotificationProvider></CartProvider>
  </AuthProvider>
  ```
- `app/(shop)/layout.tsx:6-17` currently renders only cached header, main and footer.
- `components/shop/notification-provider.tsx:34` consumes Cart; `components/shop/favorites-provider.tsx:48` consumes Notification, so order is load-bearing.
- Repository search at planning time found `useCart`, `useFavorites` and `useNotification` only in shop components/routes. `AuthProvider` imports the Zustand cart store directly and does not need `CartProvider`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Consumer audit | `rg -n 'useCart\(|useFavorites\(|useNotification\(' app components --glob '*.tsx'` | every runtime caller is in the shop tree/components used by it |
| Boundary unit | `pnpm exec vitest run app/provider-boundaries.test.ts` | consumer allowlist, root exclusions, and Cart → Notification → Favorites order pass |
| Boundary E2E | `pnpm exec playwright test e2e/provider-boundaries.spec.ts --grep "authenticated admin performs no shop data request"` | admin shell renders; zero cart/wishlist/shop-provider request is observed |
| Lint | `pnpm exec eslint . --max-warnings 25` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit --pretty false --incremental false` | exit 0 |
| Unit | `pnpm test:unit` | all tests pass |
| Build | `pnpm build` | production build succeeds |
| Smoke | `pnpm test:e2e:smoke` | all smoke tests pass |

## Scope

> **Workflow-metadata exception**: In addition to the source allowlist below, update `docs/PROJECT_STATUS.md` with this plan ID, branch, actual outcome, and exact verification evidence. Canonical EN/VI plan files may be reconciled before source edits under `plans/README.md`; the reviewer/operator owns index status. No other out-of-scope file is allowed.

**In scope**:
- `app/layout.tsx`
- `app/(shop)/layout.tsx`
- `components/shop/shop-providers.tsx` (create)
- `app/provider-boundaries.test.ts` (create)
- `e2e/provider-boundaries.spec.ts` (create)

**Out of scope**:
- Changing cart/session behavior from FE-003.
- Wishlist response/query optimization (FE-007).
- Moving `QueryProvider`, `I18nProvider` or `AuthProvider` out of root.
- Reordering shop chrome or redesigning layouts.
- i18n namespace splitting (FE-011).

## Git workflow

- **Authorization gate**: do not commit, push, or open a PR without an explicit current operator instruction; all commit examples are recommendations only.
- Run each command separately and stop on the first failure:
  ```powershell
  git fetch origin
  git switch main
  git pull --ff-only origin main
  git status --short --branch
  git rev-parse HEAD
  git rev-parse origin/main
  git switch -c perf/shop-provider-scope
  ```
- The worktree must be clean and both SHAs must match before branch creation.
- STOP on dirty/diverged main or branch collision.
- Suggested commit: `perf: scope shop providers to storefront routes`.

## Steps

### Step 1: Re-audit all context consumers

Before any source edit, run `pnpm exec next build --experimental-analyze` on the clean branch baseline and record, in temporary operator/PR work notes outside the repository, the same available measures for `/sign-in`, `/dashboard/default`, and `/`: client JS/chunk bytes and whether cart/notification/favorites provider modules appear. Then create `app/provider-boundaries.test.ts`. The test reads the relevant source tree, fails when a `useCart`, `useFavorites`, or `useNotification` consumer is reachable from a non-shop route, and asserts the root layout contains no shop-provider import/tag. Keep a small explicit allowlist of shared `components/shop/**` consumers that are reached only from `app/(shop)`; every allowlist entry must be traceable from that route group.

**Verify**: baseline `pnpm exec next build --experimental-analyze` exits 0 and the three-route measures/module-presence observations are recorded before edits; then `pnpm exec vitest run app/provider-boundaries.test.ts` → all consumer paths are accepted by the explicit shop-only allowlist; any auth/admin/non-shop consumer fails with its path and causes STOP.

### Step 2: Relocate providers while preserving dependency order

Keep root order `QueryProvider → I18nProvider → AuthProvider`. Create `components/shop/shop-providers.tsx` as the client boundary and move `CartProvider → NotificationProvider → FavoritesProvider` into it; import that wrapper only from `app/(shop)/layout.tsx`. It must wrap shop header, page content and footer consumers.

**Verify**: run the root-layout negative search and guards first:

```powershell
rg -n 'CartProvider|NotificationProvider|FavoritesProvider' app/layout.tsx
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

Then run the positive test separately:

```powershell
pnpm exec vitest run app/provider-boundaries.test.ts
```

Expected: the negative search exits 0 with no output; the test exits 0 and proves the wrappers appear exactly once in Cart → Notification → Favorites nesting order under the shop route.

### Step 3: Verify every route group

Create `e2e/provider-boundaries.spec.ts` with a deterministic authenticated-admin API fixture: fulfill refresh and `/auth/me`, record all other API requests, navigate to `/dashboard/default`, and fail on cart, wishlist, or other customer shop-provider endpoints. Reuse the existing smoke console/page-error assertions. Run the normal shop smoke to exercise home, cart, favorites, and profile provider consumers.

**Verify**: run `pnpm exec playwright test e2e/provider-boundaries.spec.ts --grep "authenticated admin performs no shop data request"` → admin shell renders with zero forbidden shop-data requests and no console/page error; then `pnpm test:e2e:smoke` → all shop smoke cases pass without missing-provider errors.

### Step 4: Record measurable bundle/runtime evidence

Rerun the identical `pnpm exec next build --experimental-analyze` command and compare `/sign-in`, `/dashboard/default`, and `/` using the exact measures recorded before Step 1. Do not claim a byte reduction unless the tool reports comparable bytes; provider lifetime reduction and the zero-admin-request E2E are the required outcomes. Copying the observed comparison into the PR description is a non-code review note, not a source gate.

**Verify**: `pnpm exec next build --experimental-analyze` → exit 0 and produces the analyzer/build output; `pnpm build` → exit 0. Human PR-description capture is explicitly non-gating, but any performance claim must quote the same-command comparison.

## Test plan

- Static consumer audit.
- Shop route smoke for header/cart/favorites/profile contexts.
- Auth and admin route smoke proving no missing context and no shop provider work.
- Deterministic authenticated-admin request capture proving zero cart/wishlist/shop-provider traffic.
- Production build to validate Server/Client boundaries.
- Preserve FE-003 A→B cart isolation tests.

## Done criteria

- [ ] Root contains only global Query/I18n/Auth providers.
- [ ] Shop provider order is Cart → Notification → Favorites.
- [ ] No non-shop consumer depends on those contexts.
- [ ] Build, unit, lint, typecheck and smoke pass.
- [ ] Before/after evidence is reported without unsupported performance claims.
- [ ] Only in-scope files changed; `git diff --check` passes.

## STOP conditions

- A real auth/admin/non-shop route consumes a shop context.
- Provider relocation requires changing FE-003 state semantics.
- Server/Client boundary or cache behavior cannot be preserved.
- Shop header/footer fall outside the provider tree.
- Drift or repeated verification failure occurs.

## Maintenance notes

- New route-only providers belong at the narrowest shared route layout.
- FE-007 assumes FavoritesProvider remains within this shop scope.
- FE-011 may add route-scoped message providers later but must preserve the global locale state.
