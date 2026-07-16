# Plan FE-003: Isolate persisted carts by account and harden logout transitions

> **shadcn/improve provenance**: Generated from the **shadcn/improve skill v1.0.0** audit. This English file is canonical. Codex implements it directly; do **not** invoke `improve execute`. Vietnamese copy: `plans/vi/003-isolate-cart-by-account-and-harden-logout.vi.md`.
>
> **Executor instructions**: Treat cart ownership and auth settlement as one state-machine change. Add tests before switching persistence. Run each gate and STOP on an unresolved product/security policy.
>
> **Drift check (run first)**: `git diff --stat ff217af..HEAD -- store/cart-store.ts components/shop/cart-provider.tsx components/shop/cart-provider.test.tsx components/auth/auth-provider.tsx lib/api-client.ts lib/queries/auth.ts components/shop/site-header.tsx components/shop/site-header.test.tsx 'app/(admin)/dashboard/_components/sidebar/app-sidebar.tsx' 'app/(admin)/dashboard/_components/sidebar/nav-user.tsx' 'app/(admin)/dashboard/_components/sidebar/app-sidebar.test.tsx' lib/i18n/messages/storefront.ts lib/i18n/messages/admin-shell.ts e2e/fullstack/auth-session.spec.ts`

## Status

- **Priority**: P1
- **Effort**: L
- **Wave**: 2
- **Risk**: HIGH — persistence migration and logout races can lose carts or cross account boundaries.
- **Depends on**: FE-002
- **Category**: security
- **Planned at**: commit `ff217af`, 2026-07-16

## Why this matters

One browser-wide cart key has no owner. After expiry/revocation, persisted items from account A can be treated as guest items and synchronized into account B. Logout also clears the in-memory token in `finally` while React Query identity/cart are cleared only on success, and header buttons navigate without awaiting the result. One explicit state machine must make account transitions deterministic.

## Current state

- `store/cart-store.ts:17-95` persists only `{ cart }` under `vela-cart-v1`.
- `components/shop/cart-provider.tsx:302-336` captures persisted cart and merges it when any authenticated user appears.
- `lib/api-client.ts:70-105`, `logoutAuthSession`, clears local auth in `finally`, including server failure.
- `lib/queries/auth.ts:47-55` clears identity only in `onSuccess`.
- `components/auth/auth-provider.tsx:61-64` clears cart only after `mutateAsync` resolves.
- `components/shop/site-header.tsx:650` and `:766-771` call `signOut()` without `await`, then navigate immediately.
- `app/(admin)/dashboard/_components/sidebar/app-sidebar.tsx:47-49,81` has an async handler but passes it through `() => void handleLogout()`; `nav-user.tsx:27,86` exposes only a synchronous callback and has no pending/disabled state or failure UI.
- `components/auth/auth-provider.tsx:68-76` is the existing revoked-session cleanup exemplar.
- `docs/PLAYWRIGHT_CI_VI.md:118-126` records the Web Lock `vela-auth-session` and bearer-then-cookie logout behavior; preserve it.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Store/provider/auth tests | `pnpm exec vitest run store/cart-store.test.ts components/shop/cart-provider.test.tsx components/auth/auth-provider.test.tsx lib/api-client.test.ts` | all pass |
| Logout caller tests | `pnpm exec vitest run components/shop/site-header.test.tsx 'app/(admin)/dashboard/_components/sidebar/app-sidebar.test.tsx'` | desktop/mobile/admin callers await, disable duplicates, and do not navigate on failure |
| A-to-B full-stack case | `pnpm exec playwright test e2e/fullstack/auth-session.spec.ts --grep "cart ownership survives account transitions"` | named flow passes against disposable BE/DB/Redis |
| Lint | `pnpm exec eslint . --max-warnings 25` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit --pretty false --incremental false` | exit 0 |
| Unit | `pnpm test:unit` | all tests pass |
| Build | `pnpm build` | production build succeeds |
| Full stack | `pnpm test:e2e:fullstack` | auth/session cases pass with disposable BE/DB/Redis |

## Scope

> **Workflow-metadata exception**: In addition to the source allowlist below, update `docs/PROJECT_STATUS.md` with this plan ID, branch, actual outcome, and exact verification evidence. Canonical EN/VI plan files may be reconciled before source edits under `plans/README.md`; the reviewer/operator owns index status. No other out-of-scope file is allowed.

**In scope**:
- `store/cart-store.ts`
- `components/shop/cart-provider.tsx`
- `components/auth/auth-provider.tsx`
- `lib/api-client.ts`
- `lib/queries/auth.ts`
- `components/shop/site-header.tsx`
- `app/(admin)/dashboard/_components/sidebar/app-sidebar.tsx`
- `app/(admin)/dashboard/_components/sidebar/nav-user.tsx`
- `lib/i18n/messages/storefront.ts` and `lib/i18n/messages/admin-shell.ts` only for visible logout error/loading labels
- `store/cart-store.test.ts` (create)
- `components/shop/cart-provider.test.tsx` (create)
- `components/auth/auth-provider.test.tsx` (create)
- `components/shop/site-header.test.tsx` (create)
- `app/(admin)/dashboard/_components/sidebar/app-sidebar.test.tsx` (create)
- `lib/api-client.test.ts`
- `e2e/fullstack/auth-session.spec.ts`

**Out of scope**:
- Reading or deleting the `HttpOnly` refresh cookie in JavaScript.
- Backend logout/session changes.
- Moving providers between layouts (FE-006).
- Cart pricing/stock behavior, wishlist state, or UI redesign.
- Preserving ownerless `vela-cart-v1` data at the expense of isolation.

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
  git switch -c fix/cart-session-isolation
  ```
- The worktree must be clean and both SHAs must match before branch creation.
- STOP on dirty/diverged main or an existing branch; never stash/reset.
- Suggested commits: tests/state schema first, then logout UI settlement.

## Steps

### Step 1: Define and test the ownership state machine

Add an explicit persisted owner discriminator (`anonymous` or `user:<id>`) and operations for claim, replace and clear. Use a new version/key or a safe Zustand migration that discards ownerless v1 data. Test anonymous reload, anonymous-to-A claim, A reload, A-to-B transition, logout and revocation.

**Verify**: `pnpm exec vitest run store/cart-store.test.ts` → all ownership transitions pass; legacy ownerless data is not assigned to a user.

### Step 2: Make CartProvider validate ownership before merge/sync

While auth is loading, do not expose an account-owned cart as anonymous. Merge a guest cart only into the first authenticated owner; clear mismatched owner data before fetching/syncing the next account. Keep locale refresh and in-flight edit protections.

**Verify**: `pnpm exec vitest run components/shop/cart-provider.test.tsx` → A's item is never sent during B's first sync and a genuine guest cart is claimed once.

### Step 3: Make logout settlement internally consistent

Implement the API/session portion of this explicit logout settlement matrix
inside the existing Web Lock, then preserve the current layer boundaries:

| Server outcome | Settlement |
|---|---|
| Initial bearer request returns 401 | retry exactly once without Bearer, using the refresh cookie |
| Either request returns 2xx | `lib/api-client.ts` clears only the in-memory access token inside the lock and resolves; `useLogoutMutation.onSuccess` then clears auth query cache, and `AuthProvider.signOut` clears the owned cart before the caller navigates |
| Final response is 401 with stable `SESSION_REVOKED` or `AUTHENTICATION_REQUIRED` | treat the server session as already gone; perform the same token-clear-and-resolve path, then let the existing success chain clear query/cart and navigate to sign-in |
| Network/timeout, 5xx, or any other final 4xx/code | API client rejects without clearing the token; success callbacks do not run, so query/cart/local auth remain and the caller exposes a retryable error without navigation |

Move local token clearing out of the unconditional `finally`. Do not import
React Query or cart state into `lib/api-client.ts`, and do not classify the final
401 by raw message text. Preserve the single cookie-only retry and Web Lock ordering.

**Verify**: `pnpm exec vitest run components/auth/auth-provider.test.tsx lib/api-client.test.ts` → separate tests pass for initial 2xx, bearer 401→cookie 2xx, final stable `SESSION_REVOKED`, final stable `AUTHENTICATION_REQUIRED`, network error, 5xx, other 4xx, duplicate call, and stale-refresh race.

### Step 4: Await logout in every UI caller

Desktop and mobile handlers in `site-header.tsx` must await `signOut`, share one pending guard, disable both logout controls while pending, navigate only on success, and show the localized storefront failure copy. `AppSidebar` must catch failure, use a localized `sonner` error, navigate only after success, and pass an explicit `isLoggingOut` flag to `NavUser`; `NavUser` disables the menu item while pending. No render-time `void` wrapper may hide an unhandled rejected promise. Reuse a small handler where the component boundary permits it.

**Verify**: `pnpm exec vitest run components/shop/site-header.test.tsx 'app/(admin)/dashboard/_components/sidebar/app-sidebar.test.tsx'` → desktop/mobile/admin cases show one request per click, disabled duplicate triggers, success-only navigation, and visible failure feedback.

### Step 5: Run full regression and A-to-B smoke

Run all frontend gates and the full-stack auth suite. Reuse the typed primary/
secondary account login helpers added to `e2e/fixtures/fullstack.ts` by merged
FE-001; do not add another credential source. Extend
`e2e/fullstack/auth-session.spec.ts` with a test titled `cart ownership survives account transitions` and `{ tag: "@fullstack" }`: guest cart → A → logout/revoke → B; no A item appears or syncs for B.

**Verify**: run `pnpm exec eslint . --max-warnings 25`, `pnpm exec tsc --noEmit --pretty false --incremental false`, `pnpm test:unit`, `pnpm build`, and `pnpm test:e2e:fullstack` separately → each exits 0 and the tagged account-transition case runs.

## Test plan

- Persistence: v1 discard, anonymous reload, matching/mismatched owner.
- Provider: guest claim once, server merge, locale refresh, in-flight edit, A→B isolation.
- Logout: initial success, bearer 401 then cookie success, final stable revoked/unauthenticated settlement, network/5xx/other-4xx retention, duplicate click, Web Lock ordering, and desktop/mobile/admin caller settlement.
- Revocation: token/query/cart cleared and stale refresh cannot restore state.
- Model Web Lock tests after `lib/api-client.test.ts:177-230`; model QueryClient wrappers after `lib/queries/admin-commerce.test.tsx`.

## Done criteria

- [ ] Persisted cart always has an explicit owner/schema version.
- [ ] Ownerless legacy data cannot cross into an account.
- [ ] A-to-B isolation tests pass.
- [ ] CartProvider, storefront header, admin sidebar, and the tagged full-stack account-transition test exist and pass directly and under `pnpm test:e2e:fullstack`.
- [ ] Logout success and failure leave token/query/cart/navigation consistent.
- [ ] Final stable revoked/unauthenticated responses clear locally; transport/5xx/other errors retain local auth and allow retry.
- [ ] Web Lock and 401 fallback invariants remain covered.
- [ ] Targeted, full unit, lint, TypeScript, build and full-stack tests pass.
- [ ] Only in-scope files changed; `git diff --check` passes.

## STOP conditions

- The operator chooses a different legacy-cart or logout-failure policy.
- The fix requires JavaScript access to the refresh cookie.
- Web Lock/session-generation behavior must change beyond the declared state machine.
- Account identity is unavailable when ownership must be decided.
- Any verification fails twice or an in-scope file drifted semantically.

## Maintenance notes

- Review the persistence migration as a privacy boundary, not just UX state.
- Future auth transitions (OAuth, account switch, session revocation) must use the same owner-reset primitives.
- FE-006 must preserve the provider order and this state machine when relocating providers.
