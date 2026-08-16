# Plan FE-001: Migrate customer flows to ownership-bound self-service APIs

> **shadcn/improve provenance**: Generated from the **shadcn/improve skill v1.0.0** audit. This English file is the canonical execution context. Codex implements it directly; do **not** invoke `improve execute`. The complete Vietnamese reader copy is `plans/vi/001-migrate-to-self-scoped-customer-apis.vi.md`.
>
> **Executor instructions**: Read this file completely. Follow the steps in order and run every verification command. Start only after backend BE-001 from repository `coqanklazy/VelaWear_BE`, plan `plans/001-expand-customer-self-service-contract.md`, branch `feature/customer-self-service-contract`, is merged. If a STOP condition occurs, stop and report; do not invent a contract. Do not update `plans/README.md` unless the operator explicitly asks.
>
> **Drift check (run first)**:
> `git diff --stat ff217af..HEAD -- lib/api/commerce.ts lib/queries/commerce.ts lib/queries/keys.ts 'app/(shop)/profile/page.tsx' 'app/(shop)/profile/orders/[code]/order-details-client.tsx' 'app/(shop)/profile/orders/[code]/order-details-client.test.tsx' e2e/fixtures/fullstack.ts e2e/fullstack/customer-self-scope.spec.ts`
> If an in-scope file changed, compare the excerpts below with live code. A semantic mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Wave**: 1
- **Risk**: HIGH — an endpoint mismatch can break customer account flows or preserve an IDOR path.
- **Depends on**: `coqanklazy/VelaWear_BE` BE-001 (`plans/001-expand-customer-self-service-contract.md`, branch `feature/customer-self-service-contract`) merged
- **Unblocks**: backend BE-002 after this plan merges and the ownership smoke passes
- **Category**: security
- **Planned at**: commit `ff217af`, 2026-07-16

## Why this matters

Customer screens still construct several requests from a client-known `userId` or call generic resource routes. Client-supplied ownership is not an authorization boundary. Backend BE-001 adds additive `/me` contracts; this plan moves every customer caller to them so BE-002 can safely revoke `ROLE_USER` access to legacy routes without downtime.

## Current state

- `lib/api/commerce.ts:47-57` — address request DTOs accept ownership from the browser:
  ```ts
  export type CreateUserAddressRequest = {
    userId: number;
    receiverName: string;
  };
  ```
- `lib/api/commerce.ts:166-167` — order history uses a path user ID:
  ```ts
  return apiGet<ResultPaginationDTO<Order>>(`/orders/user/${userId}`, params);
  ```
- `lib/api/commerce.ts:216-232` — address list and mutations use generic routes.
- `lib/api/commerce.ts:212-213` — profile editing calls generic `/users/{id}`.
- `lib/queries/commerce.ts:117-165` — hooks require `userId` to fetch orders and addresses.
- `app/(shop)/profile/page.tsx:118-124` — profile passes the authenticated user's ID back into those hooks.
- `app/(shop)/profile/orders/[code]/order-details-client.tsx:80-105` — order detail calls both generic `getOrderByCode(code)` and generic `getOrderStatusHistories(order.id, ...)` contracts.
- The merged BE-001 contract is: `PUT /users/me`; `GET /orders/me`; `GET /orders/me/code/{orderCode}`; `GET /orders/me/{id}`; `GET /orders/me/{id}/status-histories`; and `GET/POST /user-addresses/me` plus `GET/PUT/DELETE /user-addresses/me/{id}`. Existing cart, wishlist and review `/me` contracts remain. Cross-account order code/ID/status-history and address ID lookups return `404`, without revealing whether the resource belongs to another account.
- `PUT /users/me` accepts a dedicated `UpdateMyProfileRequest` JSON body containing exactly `fullName`, `birthDate`, and `gender`. It must never send or mutate `avatar`; the only customer avatar mutation is deferred to BE-004 (`PUT /api/v1/files/avatar`).
- Self-scoped cart, wishlist and review list exemplars already exist at `lib/api/commerce.ts:122-159`: `/wishlists/me`, `/wishlists/me/{productId}`, `/carts/me`, `/carts/me/items`; `getMyReviews` is at `:243-244`.
- Admin traffic is isolated in files such as `lib/api/admin-orders.ts`; do not migrate admin callers to customer `/me` routes.

## Commands you will need

| Purpose              | Command                                                                                                                         | Expected on success                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Fetch                | `git fetch origin`                                                                                                              | exit 0                                                                                                         |
| Switch base          | `git switch main`                                                                                                               | on local `main`                                                                                                |
| Fast-forward         | `git pull --ff-only origin main`                                                                                                | exit 0; no merge commit                                                                                        |
| Cleanliness          | `git status --short`                                                                                                            | no output                                                                                                      |
| Base SHA             | run `git rev-parse HEAD`, then `git rev-parse origin/main`                                                                      | both outputs are identical                                                                                     |
| Branch collision     | `git branch --list fix/self-scoped-customer-apis`                                                                               | no output                                                                                                      |
| Target tests         | `pnpm exec vitest run lib/api/commerce-self-service.test.ts lib/queries/commerce-self-service.test.tsx`                         | all tests pass                                                                                                 |
| Order-detail caller  | `pnpm exec vitest run 'app/(shop)/profile/orders/[code]/order-details-client.test.tsx'`                                         | detail and status-history callers use only `/orders/me/**` helpers                                             |
| Ownership full stack | `pnpm exec playwright test e2e/fullstack/customer-self-scope.spec.ts --grep "two accounts cannot cross self-service ownership"` | the `{ tag: "@fullstack" }` case runs; configured A/B own reads succeed; copied foreign identifiers return 404 |
| Lint                 | `pnpm exec eslint . --max-warnings 25`                                                                                          | exit 0, at most 25 warnings                                                                                    |
| Typecheck            | `pnpm exec tsc --noEmit --pretty false --incremental false`                                                                     | exit 0                                                                                                         |
| Unit suite           | `pnpm test:unit`                                                                                                                | all tests pass                                                                                                 |
| Build                | `pnpm build`                                                                                                                    | production build succeeds                                                                                      |

## Scope

> **Workflow-metadata exception**: In addition to the source allowlist below, update `docs/PROJECT_STATUS.md` with this plan ID, branch, actual outcome, and exact verification evidence. Canonical EN/VI plan files may be reconciled before source edits under `plans/README.md`; the reviewer/operator owns index status. No other out-of-scope file is allowed.

**In scope**:

- `lib/api/commerce.ts`
- `lib/queries/commerce.ts`
- `lib/queries/keys.ts`
- `app/(shop)/profile/page.tsx`
- `app/(shop)/profile/orders/[code]/order-details-client.tsx`
- `lib/api/commerce-self-service.test.ts` (create)
- `lib/queries/commerce-self-service.test.tsx` (create)
- `app/(shop)/profile/orders/[code]/order-details-client.test.tsx` (create)
- `e2e/fixtures/fullstack.ts`
- `e2e/fullstack/customer-self-scope.spec.ts` (create)

**Out of scope**:

- Backend source or a different endpoint contract from merged BE-001.
- Admin API modules and admin routes.
- Revoking legacy backend permissions; that is BE-002.
- Cart ownership persistence, logout behavior, multipart, wishlist summaries, or profile refactoring.
- Customer avatar mutation or file upload; that is BE-004.
- UI redesign or response-shape expansion.

## Git workflow

- **Authorization gate**: do not commit, push, or open a PR without an explicit current operator instruction; all commit examples are recommendations only.
- Run the preflight above, then run `git switch -c fix/self-scoped-customer-apis`.
- If the branch exists, worktree is dirty, or `HEAD != origin/main`, STOP. Do not stash/reset.
- Use focused conventional commits, for example `fix: migrate customer APIs to self-scoped routes`.
- Push/open a PR only after all gates pass and only when the operator requested delivery.

## Steps

### Step 1: Freeze the merged BE-001 contract in API tests

Read merged BE-001 in `coqanklazy/VelaWear_BE` and its API documentation. Add request-level tests that assert the exact self-scoped methods, paths, query parameters and bodies. Ownership fields such as `userId` must not appear in customer mutation DTOs. Define the frontend `UpdateMyProfileRequest` transport as exactly `{ fullName: string; birthDate: string; gender: Gender }`; prove the serialized `/users/me` body cannot contain `avatar`. Cover order list/detail/status histories, address CRUD and profile update, plus existing cart/wishlist/review self routes. Encode BE-001's `404` response for cross-account order code/ID/status-history and address ID access without message-text matching.

**Verify**: `pnpm exec vitest run lib/api/commerce-self-service.test.ts` → tests reproduce the old generic calls before implementation, then pass after Step 2.

### Step 2: Replace customer generic helpers with self-scoped helpers

In `lib/api/commerce.ts`, introduce names that state ownership: `getMyOrders`, `getMyOrderByCode`, `getMyOrderById`, `getMyOrderStatusHistories`, `getMyAddresses`, `createMyAddress`, `updateMyAddress`, `deleteMyAddress`, and `updateMyProfile`, using the exact BE-001 paths. Give `updateMyProfile` the dedicated `UpdateMyProfileRequest` type rather than `Partial<User>`, so neither `id` nor `avatar` is accepted. Route existing cart/review callers through `getMyCart`/`getMyReviews`. Remove `userId` from address request DTOs. Remove unused customer-facing generic helpers only after `rg` proves admin code has separate clients.

**Verify**: run the negative search below; exit 0 with no output means no customer legacy ownership pattern remains. Intentional admin APIs live outside this file.

```powershell
rg -n 'orders/user|userId.*CreateUserAddressRequest|getCartByUser|getReviewsByUser' lib/api/commerce.ts
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

### Step 3: Migrate query hooks and account callers

Rename hooks to self-scoped semantics and remove user ID only from URLs, request bodies and query-function arguments. **Keep the authenticated account ID in React Query keys** so cached customer data cannot cross an account transition. Keep authentication-based `enabled` gates, update the profile caller to omit `avatar`, migrate both order-detail and order-status-history calls in `order-details-client.tsx`, and preserve mutation invalidation.

**Verify**: `pnpm exec vitest run lib/queries/commerce-self-service.test.tsx 'app/(shop)/profile/orders/[code]/order-details-client.test.tsx'` → unauthenticated hooks stay disabled; authenticated hooks, order detail, and status history call only self routes.

### Step 4: Prove no storefront caller uses a legacy ownership contract

Search `app/(shop)`, `components/shop`, `lib/queries/commerce.ts`, and `lib/api/commerce.ts` for generic customer routes and ownership fields. Do not alter admin modules merely to make the search empty.

**Verify**: run these supported searches separately; each must return no storefront customer legacy match:

```powershell
rg -n 'orders/user/|getOrdersByUser|getOrderByCode|getOrderStatusHistories|getUserAddresses|updateUser\(' 'app/(shop)' components/shop lib/api/commerce.ts lib/queries/commerce.ts
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
rg -n -F '"/user-addresses"' lib/api/commerce.ts
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
rg -n -F '/users/${' lib/api/commerce.ts
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

### Step 5: Run full frontend and cross-repository verification

Extend `e2e/fixtures/fullstack.ts` with primary/secondary disposable account fixtures. Prefer `E2E_USER_EMAIL`/`E2E_USER_PASSWORD` and `E2E_SECOND_USER_EMAIL`/`E2E_SECOND_USER_PASSWORD` when configured, while retaining deterministic dev-seed fallbacks because the existing full-stack workflow does not inject these variables. Never copy credential values into this plan, test output or logs. Create `e2e/fullstack/customer-self-scope.spec.ts` with the exact title `two accounts cannot cross self-service ownership` and `{ tag: "@fullstack" }`. Use independent APIRequestContext instances so the accounts do not overwrite each other's refresh cookie. Log in both disposable accounts, fetch an A order/code/address from A's self lists, prove each account's own reads succeed, then request A's order ID/code/status-history and address ID with B's token and assert HTTP `404`. The test must fail with an explicit seed-prerequisite message if the configured A fixture lacks an order/address; it must not create persistent cross-account fixtures. Run all standard gates. Component/API tests prove a profile update cannot send `avatar`. Existing cart, wishlist and reviews still work.

**Verify**: `pnpm exec playwright test e2e/fullstack/customer-self-scope.spec.ts --grep "two accounts cannot cross self-service ownership"` → own reads are 2xx and every copied foreign identifier is 404; then all standard commands exit 0.

## Test plan

- API contract tests for every self-scoped path, ownership-free body, exact profile DTO without `avatar`, and cross-account `404` propagation.
- Hook tests for disabled guest state, authenticated fetch, cache key and invalidation.
- Exact `order-details-client.test.tsx` coverage for self-scoped detail/status-history helpers and denial propagation.
- Full-stack two-account test proving data isolation.
- Model API assertions after `lib/api/commerce-review.test.ts`; model QueryClient wrappers after `lib/queries/admin-commerce.test.tsx`.

## Done criteria

- [ ] Backend BE-001 is merged and its exact contract is encoded in tests.
- [ ] No customer request sends `userId` to select ownership.
- [ ] `/users/me` sends only `fullName`, `birthDate`, and `gender`; it cannot send or mutate `avatar`.
- [ ] No storefront caller uses generic order/address/profile routes.
- [ ] Self-scoped React Query keys still include authenticated account identity.
- [ ] Admin clients remain unchanged.
- [ ] Targeted tests and all four frontend CI gates pass.
- [ ] Full-stack two-account ownership smoke passes.
- [ ] The exact order-detail component test and tagged `customer-self-scope.spec.ts` gates pass directly and under `pnpm test:e2e:fullstack`.
- [ ] `git diff --check` passes and only in-scope files changed.

## STOP conditions

- BE-001 is not merged, its routes differ from the plan, or its tests/docs disagree.
- Any required self-scoped operation is missing; do not fall back to a generic route.
- Merged BE-001 accepts `avatar` in its self-profile DTO, does not return `404` for the cross-account cases above, or fails to preserve the BE-004 avatar boundary.
- A supposedly unused generic helper has an active non-admin caller.
- Query-key changes can expose one account's cached data to another account.
- An in-scope file drifted semantically from the excerpts.
- A verification command fails twice after a reasonable fix.

## Maintenance notes

- Reviewers should search for both URL user IDs and body `userId`; renaming alone is insufficient.
- BE-002 must not merge until this PR is in frontend `main` and the full-stack ownership smoke is green.
- Future customer endpoints should derive identity from JWT/session server-side; keep explicit IDs only in admin contracts.
