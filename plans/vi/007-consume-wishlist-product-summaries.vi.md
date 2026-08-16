# Plan FE-007: Dùng wishlist product summary mà không request từng product

> **Nguồn shadcn/improve**: Được tạo từ đợt audit của **shadcn/improve skill
> v1.0.0**. File tiếng Anh `plans/007-consume-wishlist-product-summaries.md` là
> canonical executable context. Codex thực thi trực tiếp, **không** dùng
> `improve execute`; file này là bản tiếng Việt để đọc và đối chiếu.
>
> **Hướng dẫn executor**: Làm đúng từng bước trong plan. Chạy mọi verification
> command và xác nhận kết quả mong đợi trước khi chuyển bước. Nếu xảy ra điều
> kiện trong mục "STOP conditions", dừng và báo cáo — không tự suy đoán. Chỉ bắt
> đầu sau khi FE-006 và BE-009 trong repository `coqanklazy/VelaWear_BE`, plan
> `plans/009-add-wishlist-product-summary-contract.md`, branch
> `feature/wishlist-product-summary`, đã merge. Trước khi sửa, chạy branch
> preflight trong `plans/README.md` và tạo đúng branch bên dưới. Status do
> reviewer/operator quản lý sau khi xác nhận merge.
>
> **Drift check (chạy đầu tiên)**:
> `git diff --stat ff217af..HEAD -- lib/api/types.ts lib/api/commerce.ts lib/queries/commerce.ts lib/queries/keys.ts components/shop/favorites-provider.tsx components/shop/favorites-provider.test.tsx`
> Dependency merge dự kiến sẽ tạo output. So sánh mọi excerpt trong "Trạng thái
> hiện tại" với code live và reconcile plan trước khi thực thi. Mọi semantic
> mismatch không giải thích được là STOP condition.

## Trạng thái

- **ID**: FE-007
- **Priority**: P2
- **Effort**: M
- **Wave**: 3
- **Risk**: MED
- **Depends on**: `plans/006-scope-shop-providers-to-shop-routes.md` và BE-009 của `coqanklazy/VelaWear_BE` (`plans/009-add-wishlist-product-summary-contract.md`, branch `feature/wishlist-product-summary`)
- **Category**: perf
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao việc này quan trọng

Wishlist hiện load một page rồi fan-out thành một product-detail request cho mỗi
product khác nhau. Người dùng lưu 100 product vì thế có thể tạo khoảng 101
request, làm chậm page và nhân lượng việc của Backend. BE-009 chịu trách nhiệm
trả localized product-card summary trong từng wishlist item; plan này dùng
contract đó trong một request, đồng thời giữ account-scoped cache và optimistic
add/remove.

## Trạng thái hiện tại

- `components/shop/favorites-provider.tsx` quản lý việc load wishlist và chuyển
  dữ liệu thành storefront `Product`. Tại dòng 51–82, code request 100 wishlist
  row rồi tạo product-detail query cho từng ID:

  ```tsx
  const wishlistsQuery = useWishlistsQuery(wishlistUserId, { size: 100 }, isAuthenticated);
  // ...
  const wishlistProductQueries = useQueries({
    queries: wishlistProductIds.map((productId) => ({
      queryKey: queryKeys.products.detail(productId, activeLocale),
      queryFn: () => getProduct(productId, activeLocale),
    })),
  });
  ```

- `components/shop/favorites-provider.tsx:84-109` gộp loading, error và response
  của mọi detail query vào provider. `retry()` refetch list và từng detail
  request thất bại.
- `lib/api/types.ts:252-258` có nested product optional nhưng chưa được contract
  chứng minh:

  ```ts
  export type Wishlist = {
    id: number;
    userId: number;
    productId: number;
    product?: Product;
    createdAt?: string;
  };
  ```

- `lib/api/commerce.ts:122-124` gọi `GET /wishlists/me`; Axios interceptor gửi
  active locale qua `Accept-Language`.
- `lib/queries/commerce.ts:41-50` cache response qua `useWishlistsQuery`, còn
  `lib/queries/keys.ts:27-30` tạo key theo user và params nhưng chưa có locale:

  ```ts
  list: (userId: number | undefined, params?: unknown) =>
    ["wishlists", "user", userId ?? "anonymous", params] as const,
  ```

- Việc chuyển đổi storefront phải tiếp tục dùng
  `mapBackendProduct(product, activeLocale)` trong `lib/vela-data.ts`; không tạo
  mapper thứ hai.
- Backend contract nằm ngoài repository này. Invariant mong đợi của BE-009 là:
  mỗi row `/wishlists/me` chứa localized, product-card-ready `product` summary
  cho `productId`, gồm chính xác `id`, localized `slug`, localized `name`,
  localized `description`, `categoryId`, `originalSlug`, localized
  `shortDescription`, `status`, `image`, `thumbnail`, localized `categoryName`,
  `categorySlug`, base `price`, và effective `pricing`. Executor phải kiểm tra
  đúng merged name/shape trước khi đổi Frontend type; SEO/material/care/full
  images/color images cố ý không nằm trong contract.
- Unavailable-product policy đã thống nhất của BE-009 là exact: `/wishlists/me`
  chỉ trả wishlist row có product đang `ACTIVE` và chưa soft-delete. Product bị
  thiếu, `INACTIVE` hoặc deleted được Backend lọc ngay trong paginated query
  trước khi tính metadata, nên `result`, `totalElements`, `totalPages` luôn nhất
  quán. Backend không trả null/partial summary, không làm fail cả list và không
  xóa stored wishlist row; row có thể xuất hiện lại khi product active. Frontend
  chỉ render row được trả về, không tạo placeholder hay lookup bổ sung.

## Các lệnh cần dùng

| Mục đích       | Lệnh                                                                                                                                                                                                    | Kết quả thành công          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Cài dependency | `pnpm install --frozen-lockfile`                                                                                                                                                                        | exit 0; lockfile không đổi  |
| Target test    | `pnpm exec vitest run components/shop/favorites-provider.test.tsx`                                                                                                                                      | mọi test pass               |
| Lint           | `pnpm exec eslint components/shop/favorites-provider.tsx components/shop/favorites-provider.test.tsx lib/api/types.ts lib/api/commerce.ts lib/queries/commerce.ts lib/queries/keys.ts --max-warnings 0` | exit 0, không warning       |
| Typecheck      | `pnpm exec tsc --noEmit --pretty false --incremental false`                                                                                                                                             | exit 0, không error         |
| Unit suite     | `pnpm test:unit`                                                                                                                                                                                        | mọi test pass               |
| Build          | `pnpm build`                                                                                                                                                                                            | production build thành công |

## Phạm vi

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong phạm vi** (chỉ được sửa các file này):

- `lib/api/types.ts`
- `lib/api/commerce.ts`
- `lib/queries/commerce.ts`
- `lib/queries/keys.ts`
- `components/shop/favorites-provider.tsx`
- `components/shop/favorites-provider.test.tsx` (tạo mới)

**Ngoài phạm vi** (KHÔNG sửa):

- Backend code hoặc BE-009 response contract.
- Product-detail query dùng bởi product page hay consumer ngoài wishlist.
- Cart ownership, authentication hoặc logout; FE-003 quản lý phần này.
- Visual redesign, pagination/infinite scroll hoặc đổi page size 100.
- Placeholder product để che backend summary thiếu hoặc sai.

## Git workflow

- **Authorization gate**: không commit, push hoặc mở PR nếu thiếu explicit current operator instruction; mọi commit example chỉ là recommendation.
- Branch: `perf/wishlist-summary-client`
- Chạy preflight chuẩn trong `plans/README.md`; chỉ tạo branch từ `main` mới
  nhất, sạch sau khi dependency đã merge.
- Commit theo logical unit với conventional style của repository, ví dụ
  `perf: consume wishlist product summaries`.
- Không push hoặc mở PR nếu operator chưa yêu cầu hoặc verification gate chưa pass.

## Các bước

### Bước 1: Khóa wishlist-summary contract đã merge vào Frontend type

Kiểm tra BE-009 đã merge trong `coqanklazy/VelaWear_BE` cùng API document/test. Sửa `Wishlist` trong
`lib/api/types.ts` để summary field là required và có đúng tên/shape đã merge.
Chỉ reuse Backend `Product` transport type nếu contract thật sự trả shape đầy
đủ đó; nếu không, tạo `WishlistProductSummary` transport type có tên hẹp và đủ
mọi field `mapBackendProduct` cần. Không dùng `?`, `unknown`, cast hoặc fallback
object để che contract drift. Giữ `getMyWishlists` ở `/wishlists/me` và chỉ thêm
locale argument nếu merged contract yêu cầu rõ; thông thường locale vẫn đi qua
`Accept-Language` header.

**Verify**: `pnpm exec tsc --noEmit --pretty false --incremental false` → exit 0;
không thêm `any`/`unknown` escape hatch.

### Bước 2: Làm wishlist cache nhận biết locale

Sửa `queryKeys.wishlists.list` trong `lib/queries/keys.ts` để có locale ở vị trí
ổn định. Mở rộng `useWishlistsQuery` trong `lib/queries/commerce.ts` bằng locale
argument rõ ràng và dùng nó trong key; giữ account ID, params và `enabled` gate
hiện tại. Provider phải truyền `activeLocale`.

**Verify**: `pnpm exec tsc --noEmit --pretty false --incremental false` → exit 0
sau khi mọi caller được cập nhật.

### Bước 3: Xóa product-detail fan-out

Trong `AccountFavoritesProvider`, xóa `useQueries`, `getProduct`, product detail
query key, `wishlistProductIds`, `wishlistProductQueries` và các nhánh loading/
error/retry theo từng query. Map trực tiếp required summary của từng wishlist row
chưa bị optimistic remove bằng `mapBackendProduct(summary, activeLocale)`. Giữ
account-key remount, optimistic favorites/removal, mutation invalidation, policy
Backend lọc missing/inactive/deleted trước pagination và notification.
`isLoading`, `error`, `retry` giờ chỉ phản ánh một wishlist query.

**Verify**: chạy block PowerShell sau → exit 0, không có match.

```powershell
rg -n "useQueries|getProduct|wishlistProductQueries" components/shop/favorites-provider.tsx
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

### Bước 4: Thêm provider regression test

Tạo `components/shop/favorites-provider.test.tsx` với deterministic mock cho
auth, i18n, notification và wishlist hook. Render consumer nhỏ của
`useFavorites`. Cover ba server summary tạo ba favorite từ một query result,
locale propagation/query-key behavior, optimistic add/remove, rollback và list
retry. Dùng response thể hiện exact active-only contract và chứng minh product
unavailable đã bị omit không tạo card hoặc placeholder. Assert không có
product-detail API nào được gọi; không mock `useQueries` vì production code
không còn import nó.

**Verify**:
`pnpm exec vitest run components/shop/favorites-provider.test.tsx` → mọi case
mới pass.

### Bước 5: Chạy Frontend gate cuối

Chạy scoped lint và toàn bộ Frontend gate chuẩn. Kiểm tra `git diff --check` và
xác nhận chỉ file trong Scope thay đổi.

**Verify**: chạy riêng từng lệnh; mọi lệnh exit 0.

```powershell
pnpm exec eslint . --max-warnings 25
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm test:unit
pnpm build
git diff --check
```

## Test plan

- Tạo `components/shop/favorites-provider.test.tsx`.
- Happy path: ba wishlist summary thành ba mapped favorite qua một wishlist
  query và không có product-detail request.
- Regression: locale nằm trong query identity; đổi locale remap hoặc refetch
  localized summary.
- Mutation path: optimistic add, successful reconciliation, optimistic remove
  và rollback khi mutation fail giữ behavior hiện tại.
- Error path: list loading/error/retry deterministic; product thiếu, `INACTIVE`
  hoặc deleted không có trong response/UI, không placeholder hay request thứ hai;
  page metadata do Backend quản lý.
- Dùng hoisted-mock/render style của
  `components/shop/checkout-page-client.test.tsx`; chỉ dùng real React Query
  wrapper khi test query key.
- Verification:
  `pnpm exec vitest run components/shop/favorites-provider.test.tsx` → mọi test pass.

## Tiêu chí hoàn tất

- [ ] Backend BE-009 và FE-006 đã merge trước khi tạo branch.
- [ ] `/wishlists/me` trả required, typed product-card summary trong mỗi row.
- [ ] Active-only omission policy được mã hóa: không unavailable row, null
      summary, placeholder, list-wide error hay client detail fallback.
- [ ] `favorites-provider.tsx` không còn `useQueries` hay `getProduct` fan-out.
- [ ] Wishlist query identity có account, params và active locale.
- [ ] Test optimistic add/remove, retry và unavailable-product tồn tại và pass.
- [ ] `pnpm exec eslint . --max-warnings 25` exit 0.
- [ ] TypeScript, `pnpm test:unit` và `pnpm build` exit 0.
- [ ] `git diff --check` exit 0; `git status --short` chỉ liệt kê file trong scope.

## STOP conditions

Dừng và báo cáo (không tự suy đoán) nếu:

- FE-006 hoặc Backend BE-009 chưa merge vào `main` tương ứng.
- Backend response đã merge không có summary đủ cho `mapBackendProduct`, vẫn
  cần một request mỗi product hoặc locale semantics không được document.
- BE-009 không thực hiện exact active-only pre-pagination omission policy ở trên,
  hoặc xóa stored wishlist row trong lúc đọc list.
- Current excerpt khác về semantics sau khi reconcile dependency.
- Fix đòi đổi Backend contract, product-detail behavior, authentication, cart
  state hoặc file ngoài scope.
- Summary phải giữ optional hoặc cần fabricated placeholder mới compile.
- Một verification command fail hai lần sau một lần sửa hợp lý.

## Ghi chú bảo trì

- Nếu wishlist sau này dùng infinite pagination, giữ summary embedded trong mỗi
  page và giữ pagination params trong cùng locale/account cache key.
- Reviewer cần kiểm tra chính xác type alignment BE/FE, locale trong query key,
  optimistic rollback và việc không còn hidden product-detail request.
- Mở rộng product-card summary phải bắt đầu từ Backend contract; Frontend không
  được âm thầm phụ thuộc detail-only field.
