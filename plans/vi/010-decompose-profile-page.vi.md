# Plan FE-010: Tách profile page thành typed presentation panel

> **Nguồn shadcn/improve**: Được tạo từ đợt audit của **shadcn/improve skill
> v1.0.0**. File tiếng Anh `plans/010-decompose-profile-page.md` là canonical
> executable context. Codex thực thi trực tiếp, **không** dùng `improve execute`;
> file này là bản tiếng Việt để đọc và đối chiếu.
>
> **Hướng dẫn executor**: Làm đúng từng bước và mọi verification gate. Đây là
> behavior-preserving refactor; không redesign UI hoặc đổi data flow. Nếu gặp
> STOP condition, dừng và báo cáo — không tự suy đoán. Chỉ bắt đầu sau khi FE-009
> merge; chạy preflight chuẩn và tạo đúng branch bên dưới.
>
> **Drift check (chạy đầu tiên)**:
> `git diff --stat ff217af..HEAD -- 'app/(shop)/profile/page.tsx' 'app/(shop)/profile/page.test.tsx' components/shop/profile/profile-formatters.ts components/shop/profile/profile-formatters.test.ts components/shop/profile/profile-loading.tsx components/shop/profile/profile-shell.tsx components/shop/profile/profile-account-panel.tsx components/shop/profile/profile-addresses-panel.tsx components/shop/profile/profile-orders-tab.tsx components/shop/profile/profile-favorites-tab.tsx`
> FE-009 chắc chắn đổi các path này. Reconcile plan với merged characterization
> suite và excerpt; semantic mismatch không giải thích được là STOP condition.

## Trạng thái

- **ID**: FE-010
- **Priority**: P3
- **Effort**: L
- **Wave**: 4
- **Risk**: HIGH
- **Depends on**: `plans/009-characterize-profile-page-behavior.md`
- **Category**: tech-debt
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao việc này quan trọng

Ngay cả sau khi pure helper và loading renderer được tách, `MemberProfile` vẫn
điều phối account, delivery, orders và favorites UI không liên quan trong một
module. Điều này làm thay đổi nhỏ có rủi ro, tăng review scope và tạo coupling
ngẫu nhiên giữa panel-local state. Plan giữ routing, provider, query và mutation
ở route orchestrator, đồng thời tách typed presentation panel dưới safety net
của FE-009.

## Trạng thái hiện tại

- Ở baseline gốc, `app/(shop)/profile/page.tsx` dài 1.314 dòng và
  `MemberProfile` ở dòng 106–1191. FE-009 phải giảm xuống tối đa 1.150 dòng bằng
  cách tách pure utility và loading UI.
- Top-level tab contract gồm `profile`, `orders`, `favourites`, `coupons`,
  `reviews`; URL dùng `/profile?tab=<id>`. Giữ British spelling `favourites` vì
  đây là một phần current URL contract.
- Tại `app/(shop)/profile/page.tsx:106-124`, route component hiện sở hữu provider,
  mutation và query trước khi render mọi panel:

  ```tsx
  export default function MemberProfile() {
    const { user, isAuthenticated, isLoading: isAuthLoading, checkSession } = useAuth();
    const { locale, t } = useI18n();
    const updateProfileMutation = useUpdateProfileMutation();
    const userId = user?.id;
    const ordersQuery = useOrdersByUserQuery(userId, { size: 100, sort: "createdAt,desc" });
    const addressesQuery = useUserAddressesQuery({ userId, size: 100 });
  ```

  Dependency plan sẽ rename/gate một số hook; giữ ownership của merged
  orchestrator, không khôi phục legacy signature này.

- Profile tab có sidebar panel account, delivery, visibility, communication và
  privacy. FE-004 phải đã xóa/disable mock action và đặt `/profile/settings`
  làm canonical.
- Orders UI ban đầu ở dòng 841–945; favorites bắt đầu dòng 947; delivery bắt đầu
  dòng 613. FE-008 phải đã gate request theo active panel.
- FE-009 tạo và quản lý:
  - `components/shop/profile/profile-formatters.ts` — pure formatting/metadata.
  - `components/shop/profile/profile-loading.tsx` — loading-only component.
  - `app/(shop)/profile/page.test.tsx` — semantic characterization contract.
- UI convention hiện tại dùng Card/Skeleton/Select/Popover, Tailwind class và
  `useI18n`; plan phải reuse mà không visual redesign.

## Các lệnh cần dùng

| Mục đích         | Lệnh                                                                                                                         | Kết quả thành công             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Cài dependency   | `pnpm install --frozen-lockfile`                                                                                             | exit 0; lockfile không đổi     |
| Characterization | `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx' components/shop/profile/profile-formatters.test.ts`                 | mọi FE-009 test pass không đổi |
| Scoped lint      | `pnpm exec eslint 'app/(shop)/profile/page.tsx' 'app/(shop)/profile/page.test.tsx' components/shop/profile --max-warnings 0` | exit 0, không warning          |
| Typecheck        | `pnpm exec tsc --noEmit --pretty false --incremental false`                                                                  | exit 0, không error            |
| Unit suite       | `pnpm test:unit`                                                                                                             | mọi test pass                  |
| Build            | `pnpm build`                                                                                                                 | production build thành công    |
| Smoke            | `pnpm test:e2e:smoke`                                                                                                        | mọi `@smoke` test pass         |

## Phạm vi

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong phạm vi** (chỉ được sửa các file này):

- `app/(shop)/profile/page.tsx`
- `app/(shop)/profile/page.test.tsx`
- `components/shop/profile/profile-formatters.ts`
- `components/shop/profile/profile-formatters.test.ts`
- `components/shop/profile/profile-loading.tsx`
- `components/shop/profile/profile-shell.tsx` (tạo mới)
- `components/shop/profile/profile-account-panel.tsx` (tạo mới)
- `components/shop/profile/profile-addresses-panel.tsx` (tạo mới)
- `components/shop/profile/profile-orders-tab.tsx` (tạo mới)
- `components/shop/profile/profile-favorites-tab.tsx` (tạo mới)

**Ngoài phạm vi** (KHÔNG sửa):

- Backend/API contract, query hook, query key hoặc request enabling.
- Auth, cart, favorites-provider, notification-provider hoặc global state behavior.
- Route/query-parameter name, translation, CSS token, visual design hoặc DOM semantics.
- Context provider mới, Zustand store, generic design-system abstraction hoặc barrel file.
- Implementation coupon/review feature; giữ placeholder/route behavior hiện tại.

## Git workflow

- **Authorization gate**: không commit, push hoặc mở PR nếu thiếu explicit current operator instruction; mọi commit example chỉ là recommendation.
- Branch: `refactor/profile-page`
- Chạy preflight trong `plans/README.md`; chỉ branch từ `main` sạch, mới nhất
  sau khi FE-009 merge.
- Dùng commit nhỏ, behavior-neutral như
  `refactor: extract profile account panels` và
  `refactor: extract profile order and favorites tabs`.
- Không push hoặc mở PR nếu chưa được yêu cầu và mọi gate chưa pass.

## Các bước

### Bước 1: Chạy lại và đóng băng FE-009 safety net

Chạy FE-009 characterization/formatter test trước khi đổi production code. Review
assertion theo merged page. Chỉ thêm assertion có scope hẹp nếu extracted boundary
thiếu coverage; không rewrite hoặc xóa test để phù hợp refactor.

**Verify**: chạy lệnh sau → mọi test pass trước extraction.

```powershell
pnpm exec vitest run 'app/(shop)/profile/page.test.tsx' components/shop/profile/profile-formatters.test.ts
```

### Bước 2: Tách profile shell và navigation presentation

Tạo `profile-shell.tsx` cho shared profile-page frame và top-level tab navigation.
Dùng explicit typed props cho active tab, translated label và children; không đọc
URL state, auth, query hoặc global store trong component. Giữ link, `?tab=` value,
markup, class và accessibility semantics. `MemberProfile` vẫn derive
`activeSubTab`.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx'` → mọi shell/navigation assertion pass không đổi.

### Bước 3: Tách account và address panel

Tạo `profile-account-panel.tsx` và `profile-addresses-panel.tsx`. Chỉ di chuyển
presentation cùng UI state thật sự local khi state lifetime không đổi. Truyền
user data, form value, validation result, mutation status, addresses query state
và action callback qua named TypeScript props. Không gọi commerce/auth hook trong
panel và không tạo context mới để tránh props. Giữ canonical settings navigation
của FE-004 và request gating của FE-008 ở route orchestrator.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx'` → account
save, settings, delivery loading/error/empty/success và panel switching pass.

### Bước 4: Tách orders và favorites tab

Tạo `profile-orders-tab.tsx` và `profile-favorites-tab.tsx`. Truyền query/provider
state đã resolve, localized formatting input và callback qua typed props. Giữ
`MemberProfile` chịu trách nhiệm gọi orders/favorites/cart/notification hook. Giữ
order link, stale warning/retry, product card mapping, add-to-cart và
toggle-favorite behavior.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx'` → orders và
favorites loading/error/empty/success/action case pass không đổi.

### Bước 5: Giảm route về orchestration

Xóa dead import và duplicate markup. `MemberProfile` chỉ còn auth/URL derivation,
provider/query/mutation call, request enabling, minimal derived data và composition
typed panel. Không biến nó thành pass-through cho global context mới. Target
`app/(shop)/profile/page.tsx` tối đa 350 dòng; nếu truthful orchestrator không
đạt mà không đổi behavior hoặc bịa abstraction, STOP và báo cáo.

**Verify**:

```powershell
$lines = (Get-Content -LiteralPath 'app/(shop)/profile/page.tsx').Count
if ($lines -gt 350) { exit 1 }
$lines
```

Kết quả: exit 0 và in tối đa 350.

### Bước 6: Chạy Frontend gate cuối

Chạy scoped lint, full Frontend gate, smoke và whitespace check. Review diff để
phát hiện thay đổi query count, hook ownership, markup hoặc translation.

**Verify**: chạy riêng từng lệnh; mọi lệnh exit 0.

```powershell
pnpm exec eslint . --max-warnings 25
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm test:unit
pnpm build
pnpm test:e2e:smoke
git diff --check
```

## Test plan

- `app/(shop)/profile/page.test.tsx` từ FE-009 vẫn là primary regression suite,
  phải pass trước/sau mọi extraction.
- Chỉ thêm boundary assertion khi cần: chính xác `?tab=` navigation, account
  callback wiring, address retry, order retry/link, favorite toggle, add-to-cart.
- Giữ `profile-formatters.test.ts` không đổi trừ khi export di chuyển mà semantics không đổi.
- Không thay semantic test bằng snapshot của component tree mới.
- Verification:
  `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx' components/shop/profile/profile-formatters.test.ts`
  → mọi test pass không đổi.

## Tiêu chí hoàn tất

- [ ] FE-009 đã merge và characterization suite pass trước refactor.
- [ ] Năm typed panel/shell module tồn tại, không có data-fetch/global-store hook.
- [ ] `MemberProfile` vẫn là auth/URL/query/mutation orchestration boundary.
- [ ] `app/(shop)/profile/page.tsx` tối đa 350 dòng.
- [ ] URL, API, query count, auth, visual, i18n và user-action behavior không đổi.
- [ ] Không thêm Context/global store hoặc generic abstraction.
- [ ] Lint, TypeScript, full unit, build và smoke exit 0.
- [ ] `git diff --check` exit 0; chỉ file trong scope thay đổi.

## STOP conditions

Dừng và báo cáo (không tự suy đoán) nếu:

- FE-009 chưa merge, test fail trước edit hoặc live behavior khác characterization.
- Extraction cần đổi API, query, auth, URL, translation, styling hoặc DOM behavior.
- Đạt target 350 dòng cần giấu behavior trong context/store mới, chuyển data
  fetching vào presentation panel hoặc làm yếu test.
- Panel cần file ngoài scope hoặc shared design-system abstraction mới.
- Request count tăng hoặc hook thành conditional sau extraction.
- Một verification command fail hai lần sau một lần sửa hợp lý.

## Ghi chú bảo trì

- Giữ panel prop explicit; nếu nhiều route tương lai thật sự reuse behavior,
  lúc đó mới extract hook kèm test riêng.
- Reviewer phải so sánh network call, query enabling và semantic DOM trước/sau,
  không đánh giá chỉ bằng line-count giảm.
- Target 350 dòng là guardrail cho thin route, không phải quyền di chuyển
  complexity vào opaque helper.
