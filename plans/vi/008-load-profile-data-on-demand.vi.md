# Plan FE-008: Chỉ load profile data khi panel tương ứng active

> **Nguồn shadcn/improve**: Được tạo từ đợt audit của **shadcn/improve skill
> v1.0.0**. File tiếng Anh `plans/008-load-profile-data-on-demand.md` là
> canonical executable context. Codex thực thi trực tiếp, **không** dùng
> `improve execute`; file này là bản tiếng Việt để đọc và đối chiếu.
>
> **Hướng dẫn executor**: Làm theo từng bước, chạy mọi verification command và
> xác nhận kết quả trước khi tiếp tục. Nếu gặp STOP condition, dừng và báo cáo —
> không tự suy đoán. Chỉ bắt đầu sau khi FE-001 và FE-004 đã merge. Chạy branch
> preflight trong `plans/README.md` và tạo đúng branch bên dưới. Status FE-008 do
> reviewer/operator quản lý sau khi xác nhận merge.
>
> **Drift check (chạy đầu tiên)**:
> `git diff --stat ff217af..HEAD -- 'app/(shop)/profile/page.tsx' lib/queries/commerce.ts lib/queries/commerce-profile.test.tsx 'app/(shop)/profile/page.test.tsx'`
> Dependency change là dự kiến; reconcile excerpt với live symbol trước khi làm.
> Semantic mismatch không giải thích được là STOP condition.

## Trạng thái

- **ID**: FE-008
- **Priority**: P2
- **Effort**: M
- **Wave**: 3
- **Risk**: MED
- **Depends on**: `plans/001-migrate-to-self-scoped-customer-apis.md`, `plans/004-consolidate-account-settings-and-hydration.md`
- **Category**: perf
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao việc này quan trọng

Mở `/profile` hiện request tối đa 100 order và 100 address dù người dùng không
xem section nào trong hai phần đó. Việc này tốn network, database, rendering và
làm default profile view cạnh tranh với request không cần thiết. Plan giữ hook
unconditional nhưng dùng query `enabled` gate rõ ràng để chỉ fetch data khi panel
sở hữu nó active, đồng thời vẫn reuse cache khi người dùng quay lại.

## Trạng thái hiện tại

- `app/(shop)/profile/page.tsx:106-135` định nghĩa `MemberProfile`. Trước khi đọc
  URL tab hoặc profile sidebar state, code chạy cả hai query:

  ```tsx
  const userId = user?.id;
  const ordersQuery = useOrdersByUserQuery(userId, {
    size: 100,
    sort: "createdAt,desc",
  });
  const addressesQuery = useUserAddressesQuery({ userId, size: 100 });
  // ...
  const activeSubTab = getProfileTabId(searchParams.get("tab"));
  const [activeProfileSidebarTab, setActiveProfileSidebarTab] = useState("account");
  ```

- Order chỉ render khi `activeSubTab === "orders"` tại
  `app/(shop)/profile/page.tsx:841-945`.
- Address chỉ render trong delivery panel khi
  `activeProfileSidebarTab === "delivery"` tại dòng 613–665.
- Ở planning baseline, `lib/queries/commerce.ts:117-125` chỉ gate order bằng
  numeric user ID; dòng 158–165 cũng chỉ gate address bằng user ID:

  ```ts
  enabled: typeof userId === "number",
  // ...
  enabled: typeof params.userId === "number",
  ```

- FE-001 dự kiến thay legacy user-ID API bằng self-scoped customer hook; FE-004
  làm account settings thành canonical. Dùng symbol đã merge và giữ invariant
  của plan này, không khôi phục legacy `/users/{id}` call.
- Query-hook test phải dùng `QueryClientProvider` với retry disabled theo
  `lib/queries/admin-commerce.test.tsx:1-60`.

## Các lệnh cần dùng

| Mục đích       | Lệnh                                                                                                                                                               | Kết quả thành công          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| Cài dependency | `pnpm install --frozen-lockfile`                                                                                                                                   | exit 0; lockfile không đổi  |
| Hook test      | `pnpm exec vitest run lib/queries/commerce-profile.test.tsx`                                                                                                       | mọi test pass               |
| Profile test   | `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx'`                                                                                                          | mọi test pass               |
| Lint           | `pnpm exec eslint 'app/(shop)/profile/page.tsx' 'app/(shop)/profile/page.test.tsx' lib/queries/commerce.ts lib/queries/commerce-profile.test.tsx --max-warnings 0` | exit 0, không warning       |
| Typecheck      | `pnpm exec tsc --noEmit --pretty false --incremental false`                                                                                                        | exit 0, không error         |
| Unit suite     | `pnpm test:unit`                                                                                                                                                   | mọi test pass               |
| Build          | `pnpm build`                                                                                                                                                       | production build thành công |

## Phạm vi

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong phạm vi** (chỉ được sửa các file này):

- `app/(shop)/profile/page.tsx`
- `lib/queries/commerce.ts`
- `lib/queries/commerce-profile.test.tsx` (tạo mới)
- `app/(shop)/profile/page.test.tsx` (tạo hoặc mở rộng nếu FE-004 đã tạo)

**Ngoài phạm vi** (KHÔNG sửa):

- API response shape, Backend pagination hoặc page size.
- Product favorites loading; FE-007 quản lý wishlist summary.
- Hợp nhất account settings, mock control hoặc email hydration; FE-004 quản lý.
- Profile page decomposition; FE-009 và FE-010 quản lý refactor này.
- Conditional React hook, prefetch hidden panel hoặc global store mới.

## Git workflow

- **Authorization gate**: không commit, push hoặc mở PR nếu thiếu explicit current operator instruction; mọi commit example chỉ là recommendation.
- Branch: `perf/profile-demand-loading`
- Chạy preflight chuẩn trong `plans/README.md`; chỉ branch từ `main` mới nhất,
  sạch sau khi FE-001 và FE-004 merge.
- Commit theo conventional style, ví dụ `perf: load profile data on demand`.
- Không push hoặc mở PR nếu chưa được yêu cầu và mọi gate chưa pass.

## Các bước

### Bước 1: Thêm enabled option rõ ràng vào merged profile query hook

Trong `lib/queries/commerce.ts`, mở rộng self-scoped orders và addresses hook đã
merge bằng boolean/options argument có default giữ behavior của caller hiện tại.
Kết hợp argument này với auth/user eligibility trong React Query `enabled`.
Không gọi hook có điều kiện, đổi query key hay đưa user ID trở lại self-scoped
endpoint.

Tạo `lib/queries/commerce-profile.test.tsx` với `QueryClient` mới cho từng test.
Chứng minh `enabled: false` không gọi API, đổi sang true gọi đúng một lần, và
rerender rời/quay lại reuse valid cache theo stale policy hiện tại.

**Verify**: `pnpm exec vitest run lib/queries/commerce-profile.test.tsx` → mọi
hook case pass.

### Bước 2: Derive visibility trước khi cấu hình query

Trong `MemberProfile`, giữ `useSearchParams`, `useState` và mọi data hook ở top
level với thứ tự ổn định. Derive `activeSubTab` và
`activeProfileSidebarTab` trước khi tạo query options. Chỉ enable orders khi
authenticated profile route ở tab `orders`; chỉ enable addresses khi top-level
tab là `profile` và sidebar panel là `delivery`. Giữ loading, stale-warning,
retry, empty và success rendering khi panel active.

**Verify**: `pnpm exec tsc --noEmit --pretty false --incremental false` → exit 0,
không hook-order hoặc type error.

### Bước 3: Thêm component request-gating regression

Tạo hoặc mở rộng `app/(shop)/profile/page.test.tsx`. Mock merged query hook tại
public boundary và capture enabled option. Cover default `profile/account`,
`profile/delivery`, `orders`, unauthenticated và loading state. Assert hidden
resource disabled, active resource enabled và switch panel không render stale
content của panel sai.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx'` → mọi case pass.

### Bước 4: Chạy Frontend gate cuối

Chạy scoped lint, toàn bộ Frontend check và whitespace validation. Xác nhận không
có file ngoài Scope thay đổi.

**Verify**: chạy riêng từng lệnh; mọi lệnh exit 0.

```powershell
pnpm exec eslint . --max-warnings 25
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm test:unit
pnpm build
git diff --check
```

## Test plan

- `lib/queries/commerce-profile.test.tsx`: disabled hook tạo zero request;
  false→true tạo một request; valid cache được reuse; auth ineligibility vẫn ưu tiên.
- `app/(shop)/profile/page.test.tsx`: default account enable neither; delivery
  chỉ enable addresses; orders chỉ enable orders; auth-loading/guest enable neither.
- Giữ loading, error/retry, empty và success UI của visible panel.
- Dùng query wrapper theo `lib/queries/admin-commerce.test.tsx`, component mock
  theo `components/shop/checkout-page-client.test.tsx`.
- Verification:
  `pnpm exec vitest run lib/queries/commerce-profile.test.tsx 'app/(shop)/profile/page.test.tsx'`
  → mọi test pass.

## Tiêu chí hoàn tất

- [ ] FE-001 và FE-004 đã merge trước khi tạo branch.
- [ ] Profile data hook vẫn unconditional, có enabled gate rõ ràng.
- [ ] Default account view không request orders hoặc addresses.
- [ ] Orders/delivery panel chỉ enable query của chính nó.
- [ ] Query và component regression test tồn tại và pass.
- [ ] Không đổi API contract, query key, pagination hoặc page size.
- [ ] ESLint, TypeScript, unit test và build exit 0.
- [ ] `git diff --check` exit 0; status chỉ có file trong scope.

## STOP conditions

Dừng và báo cáo (không tự suy đoán) nếu:

- FE-001 hoặc FE-004 chưa merge, hoặc plan vẫn trỏ vào legacy user-ID hook đã bị xóa.
- Live profile cần orders/addresses để render default-view summary chưa được audit.
- Query library không thể disable request nếu không gọi hook có điều kiện.
- Fix cần đổi Backend contract, query key, pagination, FE-004 UI hoặc file ngoài scope.
- Current excerpt khác về semantics sau khi reconcile dependency.
- Một verification command fail hai lần sau một lần sửa hợp lý.

## Ghi chú bảo trì

- Nếu profile summary sau này cần count, thêm lightweight summary endpoint riêng;
  không bật lại list query 100 row trên toàn page.
- Reviewer cần kiểm tra hook order, enabled predicate và request-count test, không
  chỉ nhìn rendered UI.
- Prefetch-on-hover chỉ xem xét sau khi đo và vẫn phải giữ cache identity này.
