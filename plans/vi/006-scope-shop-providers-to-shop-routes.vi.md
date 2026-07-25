# Plan FE-006: Giới hạn shop providers vào shop routes

> **Nguồn shadcn/improve**: Được tạo từ audit của **shadcn/improve skill v1.0.0**. English canonical file là `plans/006-scope-shop-providers-to-shop-routes.md`. Codex thực hiện trực tiếp; **không** gọi `improve execute`.
>
> **Hướng dẫn executor**: Đo/verify route boundary, giữ provider order và không di chuyển global auth/query/i18n providers. STOP nếu non-shop route dùng shop context.
>
> **Drift check (chạy đầu tiên)**: `git diff --stat 3d556e0..HEAD -- app/layout.tsx 'app/(shop)/layout.tsx' app/provider-boundaries.test.ts components/shop/shop-providers.tsx components/shop/cart-provider.tsx components/shop/notification-provider.tsx components/shop/favorites-provider.tsx e2e/provider-boundaries.spec.ts`

## Trạng thái

- **Priority**: P2
- **Effort**: M
- **Wave**: 3
- **Risk**: MED — thiếu/sai thứ tự context có thể làm hỏng cả route group.
- **Depends on**: FE-003
- **Category**: perf
- **Planned at**: commit `3d556e0`, 2026-07-25

## Vì sao quan trọng

Root layout mount cart/notification/favorites cho storefront, auth và Management. Client providers/dependencies làm nặng route không liên quan và có thể thực hiện customer data work trong admin session. Mọi consumer hiện nằm dưới shop route group nên lifetime phải khớp boundary đó.

## Trạng thái hiện tại

- `app/layout.tsx:48-59` wrap mọi route bằng Cart → Notification → Favorites bên trong Auth.
- `app/(shop)/layout.tsx:6-17` chỉ render cached header/main/footer.
- `notification-provider.tsx:34` dùng Cart; `favorites-provider.tsx:48` dùng Notification nên order là load-bearing.
- Search lúc planning cho thấy `useCart`, `useFavorites`, `useNotification` chỉ được dùng trong shop. AuthProvider dùng Zustand store trực tiếp.

## Commands cần dùng

| Mục đích | Command | Kết quả mong đợi |
|---|---|---|
| Consumer audit | `rg -n 'useCart\(|useFavorites\(|useNotification\(' app components --glob '*.tsx'` | mọi runtime caller thuộc shop tree |
| Boundary unit | `pnpm exec vitest run app/provider-boundaries.test.ts` | consumer allowlist, root exclusions và Cart → Notification → Favorites order pass |
| Boundary E2E | `pnpm exec playwright test e2e/provider-boundaries.spec.ts --grep "authenticated admin performs no shop data request"` | admin shell render; không có cart/wishlist/shop-provider request |
| Lint | `pnpm exec eslint . --max-warnings 25` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit --pretty false --incremental false` | exit 0 |
| Unit | `pnpm test:unit` | tất cả pass |
| Build | `pnpm build` | production build thành công |
| Smoke | `pnpm test:e2e:smoke` | smoke pass |

## Scope

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong scope**:
- `app/layout.tsx`
- `app/(shop)/layout.tsx`
- `components/shop/shop-providers.tsx` (tạo mới)
- `app/provider-boundaries.test.ts` (tạo mới)
- `e2e/provider-boundaries.spec.ts` (tạo mới)

**Ngoài scope**:
- Đổi cart/session behavior FE-003.
- Wishlist query optimization FE-007.
- Di chuyển Query/I18n/Auth khỏi root.
- Reorder shop chrome/redesign.
- i18n splitting FE-011.

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
  git switch -c perf/shop-provider-scope
  ```
- Worktree phải sạch và hai SHA phải bằng nhau trước khi tạo branch.
- Dirty/diverged main hoặc branch collision thì STOP.
- Commit gợi ý: `perf: scope shop providers to storefront routes`.

## Các bước

### Bước 1: Audit lại mọi context consumer

Trước khi sửa source, chạy `pnpm exec next build --experimental-analyze` trên clean branch baseline và ghi vào temporary operator/PR work notes ngoài repository cùng một bộ measure khả dụng cho `/sign-in`, `/dashboard/default`, `/`: client JS/chunk bytes và việc cart/notification/favorites provider module có xuất hiện không. Sau đó tạo `app/provider-boundaries.test.ts`. Test đọc relevant source tree, fail nếu consumer của `useCart`, `useFavorites`, `useNotification` reachable từ non-shop route, và assert root layout không chứa shop-provider import/tag. Giữ explicit allowlist nhỏ cho shared `components/shop/**` chỉ reachable từ `app/(shop)`; từng entry phải trace được từ route group đó.

**Verify**: baseline `pnpm exec next build --experimental-analyze` exit 0 và measure/module-presence của ba route được ghi trước khi edit; rồi `pnpm exec vitest run app/provider-boundaries.test.ts` → mọi consumer path được shop-only allowlist chấp nhận; auth/admin/non-shop consumer làm test fail kèm path và gây STOP.

### Bước 2: Di chuyển providers và giữ dependency order

Root giữ `QueryProvider → I18nProvider → AuthProvider`. Tạo client boundary `components/shop/shop-providers.tsx` với `CartProvider → NotificationProvider → FavoritesProvider`, chỉ import wrapper này từ `app/(shop)/layout.tsx`, bao cả header/content/footer.

**Verify**: chạy negative search ở root layout và guard trước:

```powershell
rg -n 'CartProvider|NotificationProvider|FavoritesProvider' app/layout.tsx
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

Sau đó chạy positive test riêng:

```powershell
pnpm exec vitest run app/provider-boundaries.test.ts
```

Expected: negative search exit 0, không output; test exit 0 và chứng minh ba wrapper xuất hiện đúng một lần theo nesting Cart → Notification → Favorites dưới shop route.

### Bước 3: Verify mọi route group

Tạo `e2e/provider-boundaries.spec.ts` với deterministic authenticated-admin API fixture: fulfill refresh và `/auth/me`, record API request khác, navigate `/dashboard/default`, fail nếu có cart/wishlist/customer shop-provider endpoint. Reuse console/page-error assertions của smoke. Chạy normal shop smoke cho home/cart/favorites/profile consumers.

**Verify**: chạy `pnpm exec playwright test e2e/provider-boundaries.spec.ts --grep "authenticated admin performs no shop data request"` → admin shell render, zero forbidden shop-data request, không console/page error; rồi `pnpm test:e2e:smoke` → mọi shop smoke pass, không missing-provider error.

### Bước 4: Ghi nhận bundle/runtime evidence đo được

Chạy lại đúng `pnpm exec next build --experimental-analyze` và so `/sign-in`, `/dashboard/default`, `/` bằng exact measure đã ghi trước Bước 1. Không claim byte reduction nếu tool không cho comparable bytes; provider lifetime reduction và zero-admin-request E2E là outcome bắt buộc. Ghi comparison vào PR description là non-code review note, không phải source gate.

**Verify**: `pnpm exec next build --experimental-analyze` → exit 0 và có analyzer/build output; `pnpm build` → exit 0. PR-description capture là non-gating nhưng performance claim phải dùng same-command comparison.

## Test plan

- Static consumer audit.
- Shop smoke cho header/cart/favorites/profile.
- Auth/admin smoke không missing context hoặc shop work.
- Deterministic authenticated-admin request capture chứng minh zero cart/wishlist/shop-provider traffic.
- Production build kiểm tra Server/Client boundary.
- FE-003 A→B cart tests tiếp tục pass.

## Done criteria

- [ ] Root chỉ còn global Query/I18n/Auth providers.
- [ ] Shop order là Cart → Notification → Favorites.
- [ ] Không non-shop consumer phụ thuộc context này.
- [ ] Build/unit/lint/typecheck/smoke pass.
- [ ] Có before/after evidence, không unsupported performance claim.
- [ ] Chỉ file trong scope thay đổi; `git diff --check` pass.

## STOP conditions

- Có auth/admin/non-shop route thật dùng shop context.
- Relocation cần đổi FE-003 state semantics.
- Không giữ được Server/Client boundary hoặc cache behavior.
- Header/footer nằm ngoài provider tree.
- Drift hoặc verification fail lặp lại.

## Maintenance notes

- Route-only provider phải ở narrowest shared layout.
- FE-007 giả định FavoritesProvider giữ trong shop scope.
- FE-011 có thể thêm route-scoped messages nhưng phải giữ global locale state.
