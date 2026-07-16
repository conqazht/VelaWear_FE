# Plan FE-001: Chuyển các luồng customer sang self-service API có ownership

> **Nguồn shadcn/improve**: Được tạo từ audit của **shadcn/improve skill v1.0.0**. File English `plans/001-migrate-to-self-scoped-customer-apis.md` là execution context chuẩn. Codex thực hiện trực tiếp; **không** gọi `improve execute`.
>
> **Hướng dẫn executor**: Đọc hết plan, làm đúng thứ tự và chạy mọi verification. Chỉ bắt đầu sau khi backend BE-001 trong repository `coqanklazy/VelaWear_BE`, plan `plans/001-expand-customer-self-service-contract.md`, branch `feature/customer-self-service-contract`, đã merge. Nếu gặp STOP condition, dừng và báo cáo; không tự sáng tạo contract. Không cập nhật `plans/README.md` nếu operator chưa yêu cầu.
>
> **Drift check (chạy đầu tiên)**:
> `git diff --stat ff217af..HEAD -- lib/api/commerce.ts lib/queries/commerce.ts lib/queries/keys.ts 'app/(shop)/profile/page.tsx' 'app/(shop)/profile/orders/[code]/order-details-client.tsx' 'app/(shop)/profile/orders/[code]/order-details-client.test.tsx' e2e/fixtures/fullstack.ts e2e/fullstack/customer-self-scope.spec.ts`
> Nếu file trong scope đã đổi, so excerpt bên dưới với live code. Semantic mismatch là STOP condition.

## Trạng thái

- **Priority**: P1
- **Effort**: L
- **Wave**: 1
- **Risk**: HIGH — sai endpoint có thể làm hỏng account flow hoặc giữ lại đường IDOR.
- **Depends on**: BE-001 của `coqanklazy/VelaWear_BE` (`plans/001-expand-customer-self-service-contract.md`, branch `feature/customer-self-service-contract`) đã merge
- **Unblocks**: backend BE-002 sau khi plan này merge và ownership smoke pass
- **Category**: security
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao quan trọng

Một số màn customer vẫn tạo request từ `userId` mà client biết hoặc gọi generic resource route. Ownership do client gửi không phải authorization boundary. BE-001 thêm additive `/me` contract; plan này chuyển toàn bộ customer caller sang contract đó để BE-002 có thể thu hồi quyền `ROLE_USER` trên legacy route mà không gây downtime.

## Trạng thái hiện tại

- `lib/api/commerce.ts:47-57` — address DTO nhận ownership từ browser:
  ```ts
  export type CreateUserAddressRequest = {
    userId: number;
    receiverName: string;
  };
  ```
- `lib/api/commerce.ts:166-167` — order history dùng user ID trong path:
  ```ts
  return apiGet<ResultPaginationDTO<Order>>(`/orders/user/${userId}`, params);
  ```
- `lib/api/commerce.ts:216-232` dùng generic address routes; `:212-213` cập nhật profile qua `/users/{id}`.
- `lib/queries/commerce.ts:117-165` yêu cầu `userId` cho order/address hooks.
- `app/(shop)/profile/page.tsx:118-124` truyền ID của authenticated user trở lại hooks.
- `app/(shop)/profile/orders/[code]/order-details-client.tsx:80-105` gọi cả generic `getOrderByCode(code)` và generic `getOrderStatusHistories(order.id, ...)`.
- Contract BE-001: `PUT /users/me`; `GET /orders/me`; `GET /orders/me/code/{orderCode}`; `GET /orders/me/{id}`; `GET /orders/me/{id}/status-histories`; `GET/POST /user-addresses/me`; `GET/PUT/DELETE /user-addresses/me/{id}`. Cart, wishlist, review `/me` hiện tại được giữ nguyên. Order code/ID/status-history và address ID thuộc account khác trả `404`, không tiết lộ ownership.
- `PUT /users/me` nhận dedicated `UpdateMyProfileRequest` chỉ gồm `fullName`, `birthDate`, `gender`; tuyệt đối không gửi hoặc mutate `avatar`. Customer avatar mutation duy nhất được để cho BE-004 (`PUT /api/v1/files/avatar`).
- Self-scoped exemplar nằm tại `lib/api/commerce.ts:122-159` và `:243-244`. Admin traffic có client riêng như `lib/api/admin-orders.ts`.

## Commands cần dùng

| Mục đích | Command | Kết quả mong đợi |
|---|---|---|
| Fetch | `git fetch origin` | exit 0 |
| Chuyển base | `git switch main` | đang ở local `main` |
| Fast-forward | `git pull --ff-only origin main` | exit 0; không có merge commit |
| Worktree | `git status --short` | không có output |
| Base SHA | chạy `git rev-parse HEAD`, rồi `git rev-parse origin/main` | hai output giống nhau |
| Branch collision | `git branch --list fix/self-scoped-customer-apis` | không có output |
| Target tests | `pnpm exec vitest run lib/api/commerce-self-service.test.ts lib/queries/commerce-self-service.test.tsx` | tất cả pass |
| Order-detail caller | `pnpm exec vitest run 'app/(shop)/profile/orders/[code]/order-details-client.test.tsx'` | detail/status-history chỉ dùng `/orders/me/**` helper |
| Ownership full stack | `pnpm exec playwright test e2e/fullstack/customer-self-scope.spec.ts --grep "two accounts cannot cross self-service ownership"` | case `{ tag: "@fullstack" }` chạy; configured A/B own read pass, foreign identifier 404 |
| Lint | `pnpm exec eslint . --max-warnings 25` | exit 0, tối đa 25 warning |
| Typecheck | `pnpm exec tsc --noEmit --pretty false --incremental false` | exit 0 |
| Unit suite | `pnpm test:unit` | tất cả pass |
| Build | `pnpm build` | production build thành công |

## Scope

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong scope**:
- `lib/api/commerce.ts`
- `lib/queries/commerce.ts`
- `lib/queries/keys.ts`
- `app/(shop)/profile/page.tsx`
- `app/(shop)/profile/orders/[code]/order-details-client.tsx`
- `lib/api/commerce-self-service.test.ts` (tạo mới)
- `lib/queries/commerce-self-service.test.tsx` (tạo mới)
- `app/(shop)/profile/orders/[code]/order-details-client.test.tsx` (tạo mới)
- `e2e/fixtures/fullstack.ts`
- `e2e/fullstack/customer-self-scope.spec.ts` (tạo mới)

**Ngoài scope**:
- Backend source hoặc contract khác BE-001 đã merge.
- Admin API/module/route.
- Thu hồi legacy permission (BE-002).
- Cart persistence/logout, multipart, wishlist summary hoặc profile refactor.
- Customer avatar mutation hoặc file upload; phần này thuộc BE-004.
- UI redesign hay mở rộng response shape.

## Git workflow

- **Authorization gate**: không commit, push hoặc mở PR nếu thiếu explicit current operator instruction; mọi commit example chỉ là recommendation.
- Chạy preflight rồi chạy `git switch -c fix/self-scoped-customer-apis`.
- Branch đã tồn tại, worktree bẩn hoặc `HEAD != origin/main` thì STOP; không stash/reset.
- Commit gợi ý: `fix: migrate customer APIs to self-scoped routes`.
- Chỉ push/mở PR sau khi mọi gate pass và operator yêu cầu delivery.

## Các bước

### Bước 1: Khóa contract BE-001 đã merge bằng API tests

Đọc BE-001 đã merge trong `coqanklazy/VelaWear_BE` và API docs. Test chính xác method/path/query/body cho order list/detail/status histories, address CRUD, profile update và self routes cart/wishlist/review. Customer mutation DTO không được có ownership field như `userId`. Định nghĩa Frontend `UpdateMyProfileRequest` chính xác là `{ fullName: string; birthDate: string; gender: Gender }`; chứng minh serialized body `/users/me` không thể chứa `avatar`. Mã hóa HTTP `404` cho cross-account order code/ID/status-history và address ID mà không match message text.

**Verify**: `pnpm exec vitest run lib/api/commerce-self-service.test.ts` → trước implementation fail đúng legacy call, sau Bước 2 pass.

### Bước 2: Thay generic customer helper bằng self-scoped helper

Trong `lib/api/commerce.ts`, dùng các tên thể hiện ownership: `getMyOrders`, `getMyOrderByCode`, `getMyOrderById`, `getMyOrderStatusHistories`, `getMyAddresses`, `createMyAddress`, `updateMyAddress`, `deleteMyAddress`, `updateMyProfile`, với đúng path BE-001. `updateMyProfile` phải nhận dedicated `UpdateMyProfileRequest`, không dùng `Partial<User>`, để không nhận `id` hay `avatar`. Chuyển caller cart/review hiện tại sang `getMyCart`/`getMyReviews`. Bỏ `userId` khỏi address DTO. Chỉ xóa unused generic helper sau khi `rg` chứng minh admin có client riêng.

**Verify**: chạy negative search dưới đây; exit 0 và không output nghĩa là không còn legacy customer ownership pattern.

```powershell
rg -n 'orders/user|userId.*CreateUserAddressRequest|getCartByUser|getReviewsByUser' lib/api/commerce.ts
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

### Bước 3: Chuyển query hooks và account callers

Đổi hook sang self-scoped semantics; bỏ user ID khỏi URL/body/query-function argument. **Giữ authenticated account ID trong React Query key** để cache không đi qua account transition. Giữ `enabled` gate, sửa profile caller để không gửi `avatar`, chuyển cả order-detail lẫn order-status-history trong `order-details-client.tsx`, và giữ mutation invalidation.

**Verify**: `pnpm exec vitest run lib/queries/commerce-self-service.test.tsx 'app/(shop)/profile/orders/[code]/order-details-client.test.tsx'` → guest disabled; authenticated hooks, order detail và status history chỉ gọi self routes.

### Bước 4: Chứng minh storefront không còn legacy ownership contract

Search storefront và commerce layers. Không sửa admin chỉ để search rỗng.

**Verify**: chạy từng search được hỗ trợ dưới đây; mỗi command phải không trả customer legacy match:

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

### Bước 5: Chạy full frontend và cross-repository verification

Mở rộng `e2e/fixtures/fullstack.ts` bằng primary/secondary disposable account fixture. Ưu tiên `E2E_USER_EMAIL`/`E2E_USER_PASSWORD` và `E2E_SECOND_USER_EMAIL`/`E2E_SECOND_USER_PASSWORD` khi được cấu hình, đồng thời giữ deterministic dev-seed fallback vì full-stack workflow hiện tại không inject các biến này. Tuyệt đối không copy credential value vào plan, test output hoặc log. Tạo `e2e/fullstack/customer-self-scope.spec.ts` có exact title `two accounts cannot cross self-service ownership` và `{ tag: "@fullstack" }`. Dùng APIRequestContext độc lập để hai account không ghi đè refresh cookie của nhau. Login hai disposable account, lấy A order/code/address từ self lists, chứng minh own read thành công, rồi dùng token B request order ID/code/status-history và address ID của A, tất cả HTTP `404`. Test fail với seed-prerequisite message rõ ràng nếu configured A fixture không có order/address và không tạo persistent cross-account fixture. Component/API tests chứng minh profile update không gửi `avatar`. Cart/wishlist/reviews vẫn hoạt động.

**Verify**: `pnpm exec playwright test e2e/fullstack/customer-self-scope.spec.ts --grep "two accounts cannot cross self-service ownership"` → own read 2xx, mọi foreign identifier 404; sau đó mọi standard command exit 0.

## Test plan

- API contract test cho mọi self-scoped path, ownership-free body, exact profile DTO không có `avatar`, và cross-account `404` propagation.
- Hook tests cho guest disabled, authenticated fetch, cache key và invalidation.
- Exact `order-details-client.test.tsx` cho self-scoped detail/status-history helper và denial propagation.
- Full-stack hai account chứng minh isolation.
- Theo mẫu `lib/api/commerce-review.test.ts` và `lib/queries/admin-commerce.test.tsx`.

## Done criteria

- [ ] BE-001 đã merge và exact contract nằm trong tests.
- [ ] Customer request không gửi `userId` để chọn ownership.
- [ ] `/users/me` chỉ gửi `fullName`, `birthDate`, `gender`; không thể gửi hoặc mutate `avatar`.
- [ ] Storefront không dùng generic order/address/profile routes.
- [ ] Self-scoped React Query keys vẫn chứa account identity.
- [ ] Admin clients không đổi.
- [ ] Targeted tests, bốn CI gate và full-stack ownership smoke pass.
- [ ] Exact order-detail component test và tagged `customer-self-scope.spec.ts` pass trực tiếp lẫn trong `pnpm test:e2e:fullstack`.
- [ ] `git diff --check` pass; chỉ file trong scope thay đổi.

## STOP conditions

- BE-001 chưa merge, route khác plan, hoặc test/docs mâu thuẫn.
- Thiếu self-scoped operation; không fallback generic route.
- BE-001 đã merge vẫn nhận `avatar` trong self-profile DTO, không trả `404` cho cross-account case nêu trên, hoặc phá ranh giới avatar của BE-004.
- Generic helper tưởng unused nhưng có active non-admin caller.
- Query-key change có thể lộ cache giữa accounts.
- In-scope code drift hoặc verification fail hai lần.

## Maintenance notes

- Reviewer phải search cả URL user ID lẫn body `userId`.
- BE-002 chỉ được merge sau khi PR này vào FE `main` và ownership smoke xanh.
- Customer endpoint mới phải derive identity từ JWT/session; explicit ID chỉ dành cho admin contract.
