# Plan FE-003: Cô lập persisted cart theo account và gia cố logout transition

> **Nguồn shadcn/improve**: Được tạo từ audit của **shadcn/improve skill v1.0.0**. English canonical file là `plans/003-isolate-cart-by-account-and-harden-logout.md`. Codex thực hiện trực tiếp; **không** gọi `improve execute`.
>
> **Hướng dẫn executor**: Xem cart ownership và auth settlement như một state-machine change. Viết test trước khi đổi persistence. STOP nếu chưa chốt product/security policy.
>
> **Drift check (chạy đầu tiên)**: `git diff --stat ff217af..HEAD -- store/cart-store.ts components/shop/cart-provider.tsx components/shop/cart-provider.test.tsx components/auth/auth-provider.tsx lib/api-client.ts lib/queries/auth.ts components/shop/site-header.tsx components/shop/site-header.test.tsx 'app/(admin)/dashboard/_components/sidebar/app-sidebar.tsx' 'app/(admin)/dashboard/_components/sidebar/nav-user.tsx' 'app/(admin)/dashboard/_components/sidebar/app-sidebar.test.tsx' lib/i18n/messages/storefront.ts lib/i18n/messages/admin-shell.ts e2e/fullstack/auth-session.spec.ts`

## Trạng thái

- **Priority**: P1
- **Effort**: L
- **Wave**: 2
- **Risk**: HIGH — persistence migration và logout race có thể làm mất cart hoặc vượt account boundary.
- **Depends on**: FE-002
- **Category**: security
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao quan trọng

Một browser-wide cart key không có owner. Sau expiry/revocation, item của A có thể bị coi là guest rồi sync sang B. Logout cũng clear in-memory token trong `finally`, trong khi React Query identity/cart chỉ clear khi success và header navigate mà không await. Cần một state machine rõ ràng.

## Trạng thái hiện tại

- `store/cart-store.ts:17-95` chỉ persist `{ cart }` với `vela-cart-v1`.
- `components/shop/cart-provider.tsx:302-336` merge persisted cart khi bất kỳ user nào authenticated.
- `lib/api-client.ts:70-105` clear local auth trong `finally` dù server logout lỗi.
- `lib/queries/auth.ts:47-55` và `components/auth/auth-provider.tsx:61-64` chỉ clear identity/cart khi success.
- `components/shop/site-header.tsx:650`, `:766-771` không await `signOut()`.
- `app/(admin)/dashboard/_components/sidebar/app-sidebar.tsx:47-49,81` có async handler nhưng truyền qua `() => void handleLogout()`; `nav-user.tsx:27,86` chỉ nhận synchronous callback, không pending/disabled state hay failure UI.
- Revoked-session cleanup exemplar: `components/auth/auth-provider.tsx:68-76`.
- Web Lock invariant: `docs/PLAYWRIGHT_CI_VI.md:118-126`.

## Commands cần dùng

| Mục đích | Command | Kết quả mong đợi |
|---|---|---|
| Store/provider/auth tests | `pnpm exec vitest run store/cart-store.test.ts components/shop/cart-provider.test.tsx components/auth/auth-provider.test.tsx lib/api-client.test.ts` | tất cả pass |
| Logout caller tests | `pnpm exec vitest run components/shop/site-header.test.tsx 'app/(admin)/dashboard/_components/sidebar/app-sidebar.test.tsx'` | desktop/mobile/admin await, chặn duplicate và không navigate khi fail |
| A-to-B full-stack | `pnpm exec playwright test e2e/fullstack/auth-session.spec.ts --grep "cart ownership survives account transitions"` | named flow pass với disposable BE/DB/Redis |
| Lint | `pnpm exec eslint . --max-warnings 25` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit --pretty false --incremental false` | exit 0 |
| Unit | `pnpm test:unit` | tất cả pass |
| Build | `pnpm build` | production build thành công |
| Full stack | `pnpm test:e2e:fullstack` | auth/session cases pass với disposable BE/DB/Redis |

## Scope

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong scope**:
- `store/cart-store.ts`
- `components/shop/cart-provider.tsx`
- `components/auth/auth-provider.tsx`
- `lib/api-client.ts`
- `lib/queries/auth.ts`
- `components/shop/site-header.tsx`
- `app/(admin)/dashboard/_components/sidebar/app-sidebar.tsx`
- `app/(admin)/dashboard/_components/sidebar/nav-user.tsx`
- `lib/i18n/messages/storefront.ts`, `lib/i18n/messages/admin-shell.ts` chỉ cho logout error/loading label
- `store/cart-store.test.ts`, `components/shop/cart-provider.test.tsx`, `components/auth/auth-provider.test.tsx` (tạo mới)
- `components/shop/site-header.test.tsx` (tạo mới)
- `app/(admin)/dashboard/_components/sidebar/app-sidebar.test.tsx` (tạo mới)
- `lib/api-client.test.ts`
- `e2e/fullstack/auth-session.spec.ts`

**Ngoài scope**:
- JavaScript đọc/xóa `HttpOnly` refresh cookie.
- Backend logout/session change.
- Di chuyển provider (FE-006).
- Cart pricing/stock, wishlist state hoặc redesign.
- Giữ ownerless v1 data nếu làm giảm isolation.

## Git workflow

- **Authorization gate**: không commit, push hoặc mở PR nếu thiếu explicit current operator instruction; mọi commit example chỉ là recommendation.
- Chạy từng command và dừng ngay khi có lỗi:
  ```powershell
  git fetch origin
  git switch main
  git pull --ff-only origin main
  git status --short --branch
  git rev-parse HEAD
  git rev-parse origin/main
  git switch -c fix/cart-session-isolation
  ```
- Worktree phải sạch và hai SHA phải bằng nhau trước khi tạo branch.
- Main bẩn/lệch hoặc branch tồn tại thì STOP; không stash/reset.
- Commit logic theo tests/state schema rồi logout settlement.

## Các bước

### Bước 1: Định nghĩa và test ownership state machine

Persist explicit owner (`anonymous` hoặc `user:<id>`) cùng operation claim/replace/clear. Dùng key/version mới hoặc safe Zustand migration bỏ ownerless v1. Test anonymous reload, anonymous→A, A reload, A→B, logout, revocation.

**Verify**: `pnpm exec vitest run store/cart-store.test.ts` → mọi transition pass; legacy data không được gán cho user.

### Bước 2: Bắt CartProvider validate ownership trước merge/sync

Khi auth loading, không expose account cart như anonymous. Chỉ merge guest cart vào owner đầu tiên; clear mismatched owner trước khi fetch/sync account kế. Giữ locale refresh và in-flight edit protection.

**Verify**: `pnpm exec vitest run components/shop/cart-provider.test.tsx` → item A không được gửi trong first sync của B, guest cart chỉ claim một lần.

### Bước 3: Làm logout settlement nhất quán

Thực hiện phần API/session của exact logout settlement matrix trong Web Lock hiện
có, rồi giữ nguyên layer boundary:

| Server outcome | Settlement |
|---|---|
| Initial Bearer request trả 401 | retry đúng một lần không Bearer, dùng refresh cookie |
| Một trong hai request trả 2xx | `lib/api-client.ts` chỉ clear in-memory access token trong lock rồi resolve; `useLogoutMutation.onSuccess` clear auth query cache, `AuthProvider.signOut` clear owned cart trước khi caller navigate |
| Final response là 401 với stable `SESSION_REVOKED` hoặc `AUTHENTICATION_REQUIRED` | xem server session đã mất; dùng cùng token-clear-and-resolve path, rồi success chain hiện có clear query/cart và navigate sign-in |
| Network/timeout, 5xx hoặc final 4xx/code khác | API client reject, không clear token; success callback không chạy nên query/cart/local auth giữ nguyên, caller báo retryable error và không navigate |

Bỏ local token clear khỏi unconditional `finally`. Không import React Query/cart
state vào `lib/api-client.ts`; không classify final 401 bằng raw message. Giữ
single cookie-only retry và Web Lock ordering.

**Verify**: `pnpm exec vitest run components/auth/auth-provider.test.tsx lib/api-client.test.ts` → test riêng cho initial 2xx, Bearer 401→cookie 2xx, final stable `SESSION_REVOKED`, final stable `AUTHENTICATION_REQUIRED`, network, 5xx, other 4xx, duplicate và stale-refresh race đều pass.

### Bước 4: Await logout ở mọi UI caller

Handler desktop/mobile trong `site-header.tsx` phải await `signOut`, dùng chung pending guard, disable cả hai logout control khi pending, chỉ navigate khi success và hiển thị localized storefront failure. `AppSidebar` phải catch failure, dùng localized `sonner` error, chỉ navigate sau success và truyền explicit `isLoggingOut` cho `NavUser`; `NavUser` disable menu item khi pending. Không dùng render-time `void` wrapper để che rejected promise. Reuse handler nhỏ khi component boundary cho phép.

**Verify**: `pnpm exec vitest run components/shop/site-header.test.tsx 'app/(admin)/dashboard/_components/sidebar/app-sidebar.test.tsx'` → desktop/mobile/admin chỉ có một request/click, duplicate trigger bị disable, chỉ success mới navigate và failure feedback hiển thị.

### Bước 5: Chạy full regression và A-to-B smoke

Chạy mọi gate và full-stack auth. Reuse typed primary/secondary account login
helper do FE-001 đã merge thêm vào `e2e/fixtures/fullstack.ts`; không tạo thêm
credential source. Mở rộng `e2e/fullstack/auth-session.spec.ts` bằng test tên
`cart ownership survives account transitions` với `{ tag: "@fullstack" }`:
guest cart → A → logout/revoke → B; item A không xuất hiện hoặc sync sang B.

**Verify**: chạy riêng `pnpm exec eslint . --max-warnings 25`, `pnpm exec tsc --noEmit --pretty false --incremental false`, `pnpm test:unit`, `pnpm build`, `pnpm test:e2e:fullstack` → từng lệnh exit 0 và tagged account-transition case chạy.

## Test plan

- Persistence v1 discard, anonymous reload, owner match/mismatch.
- Provider guest claim, server merge, locale refresh, in-flight edit, A→B.
- Logout initial success, Bearer 401→cookie success, final stable revoked/unauthenticated settlement, network/5xx/other-4xx retention, duplicate, Web Lock và desktop/mobile/admin caller settlement.
- Revocation clear token/query/cart và stale refresh không phục hồi state.
- Theo mẫu `lib/api-client.test.ts:177-230` và `lib/queries/admin-commerce.test.tsx`.

## Done criteria

- [ ] Persisted cart luôn có explicit owner/schema version.
- [ ] Ownerless legacy data không đi vào account.
- [ ] A→B isolation tests pass.
- [ ] CartProvider, storefront header, admin sidebar và tagged full-stack account-transition test tồn tại, pass trực tiếp lẫn trong `pnpm test:e2e:fullstack`.
- [ ] Logout success/failure giữ token/query/cart/navigation nhất quán.
- [ ] Final stable revoked/unauthenticated clear local; transport/5xx/other error giữ local auth và cho retry.
- [ ] Web Lock và 401 fallback vẫn được test.
- [ ] Targeted/full unit/lint/TypeScript/build/full-stack pass.
- [ ] Chỉ file trong scope thay đổi; `git diff --check` pass.

## STOP conditions

- Operator chọn policy khác cho legacy cart hoặc logout failure.
- Fix cần JavaScript truy cập refresh cookie.
- Phải đổi Web Lock/session-generation ngoài scope.
- Không có account identity lúc quyết định ownership.
- Code drift hoặc verification fail hai lần.

## Maintenance notes

- Persistence migration là privacy boundary, không chỉ UX state.
- OAuth/account switch/session revocation phải dùng cùng owner-reset primitives.
- FE-006 phải giữ provider order và state machine này.
