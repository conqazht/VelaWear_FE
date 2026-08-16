# Plan FE-009: Characterization profile-page behavior và tách pure utility

> **Nguồn shadcn/improve**: Được tạo từ đợt audit của **shadcn/improve skill
> v1.0.0**. File tiếng Anh `plans/009-characterize-profile-page-behavior.md` là
> canonical executable context. Codex thực thi trực tiếp, **không** dùng
> `improve execute`; file này là bản tiếng Việt để đọc và đối chiếu.
>
> **Hướng dẫn executor**: Làm đúng từng bước và chạy mọi verification command.
> Đây là characterization plan giữ nguyên behavior, không phải redesign. Nếu gặp
> STOP condition, dừng và báo cáo — không tự suy đoán. Chỉ bắt đầu sau khi FE-004
> và FE-008 merge; chạy preflight chuẩn rồi tạo đúng branch.
>
> **Drift check (chạy đầu tiên)**:
> `git diff --stat ff217af..HEAD -- 'app/(shop)/profile/page.tsx' 'app/(shop)/profile/page.test.tsx' components/shop/profile/profile-formatters.ts components/shop/profile/profile-formatters.test.ts components/shop/profile/profile-loading.tsx`
> FE-004 và FE-008 dự kiến đổi profile file. Reconcile plan với merged behavior;
> semantic mismatch không được hai plan đó giải thích là STOP condition.

## Trạng thái

- **ID**: FE-009
- **Priority**: P2
- **Effort**: M
- **Wave**: 4
- **Risk**: MED
- **Depends on**: `plans/004-consolidate-account-settings-and-hydration.md`, `plans/008-load-profile-data-on-demand.md`
- **Category**: tests
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao việc này quan trọng

`MemberProfile` gộp routing, auth gate, server query, mutation, local form state,
năm top-level tab, năm profile panel và bốn loading renderer vào một file lớn.
Refactor không có behavioral safety net có thể đổi query timing, form semantics
hoặc visible error state dù diff trông sạch. Plan này capture merged behavior
bằng semantic test trước, rồi chỉ tách pure utility và loading UI để phase
decomposition sau có baseline ổn định.

## Trạng thái hiện tại

- `app/(shop)/profile/page.tsx` dài 1.314 dòng tại `ff217af`.
- `MemberProfile` bắt đầu dòng 106 và kết thúc dòng 1191. Nó import 23 module,
  giữ nhiều local state, gọi auth/cart/favorites/notification/query hook và
  render mọi profile tab.
- Pure helper đang nằm tại dòng 32–104:

  ```tsx
  const profileTabIds = ["profile", "orders", "favourites", "coupons", "reviews"] as const;
  const getProfileTabId = (tab: string | null): ProfileTabId =>
    profileTabIds.includes(tab as ProfileTabId) ? (tab as ProfileTabId) : "profile";
  const formatDisplayDate = (...) => { /* pure date formatting */ };
  const formatAddress = (address: UserAddress) => [/* fields */].filter(Boolean).join(", ");
  const orderStatusMeta = { /* status presentation */ };
  ```

- Loading-only component nằm sau route component tại dòng 1193–1314:
  `ProfileAddressesLoadingFallback`, `ProfileTabLoading`,
  `ProfileOverviewLoading`, `ProfileOrdersLoading` và
  `ProfileFavouritesLoading`.
- Orders render ở dòng 841–945; addresses ở delivery panel dòng 613–665;
  favorites bắt đầu dòng 947. FE-008 phải đã khóa request gating.
- FE-004 phải đã xóa deceptive mock settings và đặt `/profile/settings` làm
  canonical. Characterization test phải mô tả merged behavior, không khôi phục mock.
- Component test dùng hoisted Vitest mock và Testing Library semantics; theo
  `components/shop/checkout-page-client.test.tsx`. Test cần real translation có
  thể wrap `I18nProvider` như
  `app/(shop)/profile/orders/[code]/order-review-dialog.test.tsx`.

## Các lệnh cần dùng

| Mục đích         | Lệnh                                                                                                                                                                                                                                              | Kết quả thành công              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Cài dependency   | `pnpm install --frozen-lockfile`                                                                                                                                                                                                                  | exit 0; lockfile không đổi      |
| Characterization | `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx'`                                                                                                                                                                                         | mọi semantic behavior test pass |
| Utility test     | `pnpm exec vitest run components/shop/profile/profile-formatters.test.ts`                                                                                                                                                                         | mọi pure-helper test pass       |
| Lint             | `pnpm exec eslint 'app/(shop)/profile/page.tsx' 'app/(shop)/profile/page.test.tsx' components/shop/profile/profile-formatters.ts components/shop/profile/profile-formatters.test.ts components/shop/profile/profile-loading.tsx --max-warnings 0` | exit 0, không warning           |
| Typecheck        | `pnpm exec tsc --noEmit --pretty false --incremental false`                                                                                                                                                                                       | exit 0, không error             |
| Unit suite       | `pnpm test:unit`                                                                                                                                                                                                                                  | mọi test pass                   |
| Build            | `pnpm build`                                                                                                                                                                                                                                      | production build thành công     |
| Smoke            | `pnpm test:e2e:smoke`                                                                                                                                                                                                                             | mọi `@smoke` test pass          |

## Phạm vi

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong phạm vi** (chỉ được sửa các file này):

- `app/(shop)/profile/page.tsx`
- `app/(shop)/profile/page.test.tsx` (mở rộng file FE-008)
- `components/shop/profile/profile-formatters.ts` (tạo mới)
- `components/shop/profile/profile-formatters.test.ts` (tạo mới)
- `components/shop/profile/profile-loading.tsx` (tạo mới)

**Ngoài phạm vi** (KHÔNG sửa):

- API call, query key, enabled predicate, auth/session/cart state hoặc Backend contract.
- Route URL, translation message, visual styling, DOM semantics hoặc responsive layout.
- Tách live profile panel thành component; FE-010 quản lý phần đó.
- Context provider mới, Zustand store, feature behavior hoặc khôi phục mock settings.

## Git workflow

- **Authorization gate**: không commit, push hoặc mở PR nếu thiếu explicit current operator instruction; mọi commit example chỉ là recommendation.
- Branch: `test/profile-characterization`
- Chỉ branch từ `main` sạch, mới nhất sau FE-004 và FE-008 theo preflight trong
  `plans/README.md`.
- Ưu tiên hai logical commit: `test: characterize profile page behavior`, sau đó
  `refactor: extract profile utilities and loading states`.
- Không push hoặc mở PR nếu chưa được yêu cầu và mọi gate chưa pass.

## Các bước

### Bước 1: Capture merged profile behavior trước khi di chuyển code

Mở rộng `app/(shop)/profile/page.test.tsx` trước khi extract. Mock API-facing
hook/provider nhưng assert user-visible semantics và call, không assert component
internal hoặc broad snapshot. Cover auth loading, guest gate, default account
view, query gate từ FE-008, profile save success/failure, delivery loading/error/
empty/success, orders loading/error/empty/success, favorites loading/error/
success, valid URL tab và invalid-tab fallback. Cover FE-004 settings link và
absence/disabled state của unsupported settings nhưng không khôi phục chúng.

Chạy test trên file còn monolithic và chỉ commit khi pass. Đây là
characterization baseline.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx'` → mọi
behavior đã nêu pass trước khi extract.

### Bước 2: Tách pure profile formatter và metadata

Tạo `components/shop/profile/profile-formatters.ts`. Di chuyển `ProfileTabId`,
tab normalization, display/member date formatting, address formatting, order
status metadata, label-key mapping và status order nếu chúng vẫn pure. Export
dưới dạng typed deterministic function/constant; không thêm React, provider,
query hoặc mutation dependency. Cập nhật import trong `page.tsx` nhưng không đổi
call-site semantics.

Tạo `profile-formatters.test.ts` cho valid/invalid tab, null/invalid date,
locale-sensitive date, sparse address field và known/unknown order status.

**Verify**: chạy riêng lệnh sau; pure test và characterization không đổi đều pass.

```powershell
pnpm exec vitest run components/shop/profile/profile-formatters.test.ts 'app/(shop)/profile/page.test.tsx'
```

### Bước 3: Tách loading-only component

Tạo `components/shop/profile/profile-loading.tsx`, di chuyển năm loading component
ở cuối `page.tsx` mà không đổi markup, class, accessibility attribute hoặc branch.
Chỉ export component route dùng. Cập nhật import và xóa local definition cũ.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx'` → cùng
characterization suite pass mà không đổi assertion.

### Bước 4: Xác nhận extraction có ý nghĩa và trung lập về behavior

Dùng machine line count và review diff. Route phải nhỏ hơn đáng kể so với 1.314
dòng (target tối đa 1.150 ở phase này), không đổi request, mutation, translation
hoặc route contract.

**Verify**: chạy block PowerShell sau → exit 0 và in số không lớn hơn 1150.

```powershell
$lines = (Get-Content -LiteralPath 'app/(shop)/profile/page.tsx').Count
if ($lines -gt 1150) { exit 1 }
$lines
```

### Bước 5: Chạy Frontend gate cuối

Chạy scoped lint, full Frontend gate, smoke và whitespace validation.

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

- Mở rộng `app/(shop)/profile/page.test.tsx` bằng semantic characterization cho
  auth, routing, account save, delivery, orders, favorites và FE-004 settings.
- Tạo `components/shop/profile/profile-formatters.test.ts` cho pure edge case.
- Chạy characterization trước extract, sau utility và sau loading extraction;
  assertion không cần behavioral rewrite.
- Theo hoisted mocking trong `checkout-page-client.test.tsx`; dùng real
  `I18nProvider` từ order review dialog khi hữu ích.
- Verification:
  `pnpm exec vitest run 'app/(shop)/profile/page.test.tsx' components/shop/profile/profile-formatters.test.ts`
  → mọi test pass.

## Tiêu chí hoàn tất

- [ ] FE-004/FE-008 đã merge và plan được reconcile theo behavior của chúng.
- [ ] Characterization test pass trên monolith trước extraction.
- [ ] Pure helper/metadata ở `profile-formatters.ts` và có focused test.
- [ ] Năm loading-only component ở `profile-loading.tsx` không đổi.
- [ ] `page.tsx` tối đa 1.150 dòng sau phase này.
- [ ] Không đổi API, route, query, auth, visual hoặc translation behavior.
- [ ] Lint, TypeScript, full unit, build và smoke exit 0.
- [ ] `git diff --check` exit 0; chỉ file trong scope thay đổi.

## STOP conditions

Dừng và báo cáo (không tự suy đoán) nếu:

- FE-004 hoặc FE-008 chưa merge, hoặc merged behavior chưa được test trong plan.
- Characterization test phát hiện product requirement mơ hồ; document thay vì đoán.
- Extraction cần đổi route, API, query, auth, visual, i18n hoặc DOM behavior.
- Helper không thể pure nếu không truy cập provider/global state.
- Test chỉ pass khi assert implementation detail hoặc broad snapshot.
- Một verification command fail hai lần sau một lần sửa hợp lý.

## Ghi chú bảo trì

- Characterization test là contract cho FE-010; reviewer phải từ chối refactor
  làm yếu test chỉ để extraction dễ hơn.
- Giữ pure formatter không phụ thuộc React hoặc data fetching.
- Target 1.150 dòng là intermediate gate, không phải kiến trúc cuối; FE-010 quản
  lý panel decomposition và target route nhỏ hơn.
