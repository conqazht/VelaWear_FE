# Plan FE-011: Tách runtime i18n catalog theo route namespace

> **Nguồn shadcn/improve**: Được tạo từ đợt audit của **shadcn/improve skill
> v1.0.0**. File tiếng Anh `plans/011-split-i18n-message-namespaces.md` là
> canonical executable context. Codex thực thi trực tiếp, **không** dùng
> `improve execute`; file này là bản tiếng Việt để đọc và đối chiếu.
>
> **Hướng dẫn executor**: Làm đúng từng bước và mọi verification command. Đo
> production bundle trước khi đổi architecture. Nếu gặp STOP condition, dừng và
> báo cáo — không tự suy đoán. Chỉ bắt đầu sau khi FE-001 đến FE-010 merge; chạy
> preflight chuẩn và tạo đúng branch bên dưới.
>
> **Drift check (chạy đầu tiên)**:
> `git diff --stat ff217af..HEAD -- components/providers/i18n-provider.tsx components/providers/i18n-provider.test.tsx components/shop/review-comment.test.tsx components/shop/sale-landing.test.tsx 'app/(shop)/profile/orders/[code]/order-review-dialog.test.tsx' 'app/(admin)/dashboard/sales/_components/campaign-interaction-lock.test.tsx' 'app/(admin)/dashboard/_components/management/content-locale-tabs.test.tsx' 'app/(admin)/dashboard/_components/management/english-content-generator.test.tsx' lib/i18n/messages/index.ts lib/i18n/messages/catalog-core.ts lib/i18n/messages/catalog-shop.ts lib/i18n/messages/catalog-admin.ts lib/i18n/messages/types.ts lib/i18n/messages/catalog-audit.test.ts app/layout.tsx 'app/(shop)/layout.tsx' 'app/(admin)/layout.tsx'`
> Mười Frontend plan trước có thể đổi caller/key. Reconcile namespace inventory
> và excerpt theo merged `main`; semantic mismatch không giải thích được là STOP.

## Trạng thái

- **ID**: FE-011
- **Priority**: P3
- **Effort**: L
- **Wave**: 5
- **Risk**: HIGH
- **Depends on**: FE-001 đến FE-010
- **Category**: perf
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao việc này quan trọng

Root client provider hiện import mọi English/Vietnamese message module, khiến
auth, storefront và Management route cùng chia sẻ toàn bộ runtime catalog. Điều
này tăng client JavaScript và coupling giữa route group không liên quan. Plan giữ
một locale source of truth và global `TranslationKey` type, nhưng root chỉ load
core message; nested shop/admin layout augment catalog tương ứng.

## Trạng thái hiện tại

- `lib/i18n/messages/index.ts:1-64` import 19 message module và spread tất cả vào
  cả hai locale:

  ```ts
  import { adminShellMessages } from "./admin-shell";
  // ... 18 more runtime imports
  export const messages = {
    en: { ...adminShellMessages.en /* every module */ },
    vi: { ...adminShellMessages.vi /* every module */ },
  } as const;
  export type TranslationKey = keyof (typeof messages)["en"];
  ```

- `components/providers/i18n-provider.tsx:26` import aggregate đó. Callback `t`
  tại dòng 110–116 đọc `messages[locale][key]`, fallback English rồi raw key.
- Cùng provider quản lý locale persistence và cross-tab synchronization tại
  dòng 48–107. Nested catalog không được duplicate các effect này.
- `app/layout.tsx:48-59` mount một root `I18nProvider` quanh Auth và mọi route
  group. `app/(shop)/layout.tsx` chỉ thêm shop chrome;
  `app/(admin)/layout.tsx` chỉ thêm Management preferences/auth UI.
- `lib/i18n.ts` là locale source of truth. `lib/api-client.ts:119-127` đọc
  `getActiveLocale()` cho `Accept-Language`; không đổi contract này.
- `docs/PROJECT_STATUS.md:131-135` ghi invariant: locale persist qua localStorage
  và cookie, sync giữa tab, cập nhật document language, điều khiển
  `Accept-Language`, formatting và locale-aware query key.
- Root `not-found.tsx`/`error.tsx` dùng `errors.root*` và `errors.common.*` trong
  `auth-errors.ts`, nên core catalog phải chứa chúng.
- Direct import từng message module cho typed key/non-provider utility phải tiếp
  tục hoạt động. Error component import `TranslationKey` dạng type và type này
  phải bao phủ mọi namespace.

## Các lệnh cần dùng

| Mục đích                     | Lệnh                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Kết quả thành công                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Cài dependency               | `pnpm install --frozen-lockfile`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | exit 0; lockfile không đổi                                         |
| Baseline/analyze             | `pnpm exec next build --experimental-analyze`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | exit 0; tạo route/client bundle report                             |
| Catalog audit                | `pnpm exec vitest run lib/i18n/messages/catalog-audit.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | parity, duplicate, placeholder, static-key check pass              |
| Provider test                | `pnpm exec vitest run components/providers/i18n-provider.test.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | locale/nested-catalog test pass                                    |
| Catalog-using component test | `pnpm exec vitest run components/shop/review-comment.test.tsx components/shop/sale-landing.test.tsx 'app/(shop)/profile/orders/[code]/order-review-dialog.test.tsx' 'app/(admin)/dashboard/sales/_components/campaign-interaction-lock.test.tsx' 'app/(admin)/dashboard/_components/management/content-locale-tabs.test.tsx' 'app/(admin)/dashboard/_components/management/english-content-generator.test.tsx'`                                                                                                                                                                                                                                                                                                                                                                      | cả sáu existing test render translated text với đúng route catalog |
| Lint                         | `pnpm exec eslint components/providers/i18n-provider.tsx components/providers/i18n-provider.test.tsx components/shop/review-comment.test.tsx components/shop/sale-landing.test.tsx 'app/(shop)/profile/orders/[code]/order-review-dialog.test.tsx' 'app/(admin)/dashboard/sales/_components/campaign-interaction-lock.test.tsx' 'app/(admin)/dashboard/_components/management/content-locale-tabs.test.tsx' 'app/(admin)/dashboard/_components/management/english-content-generator.test.tsx' lib/i18n/messages/index.ts lib/i18n/messages/catalog-core.ts lib/i18n/messages/catalog-shop.ts lib/i18n/messages/catalog-admin.ts lib/i18n/messages/types.ts lib/i18n/messages/catalog-audit.test.ts app/layout.tsx 'app/(shop)/layout.tsx' 'app/(admin)/layout.tsx' --max-warnings 0` | exit 0, không warning                                              |
| Typecheck                    | `pnpm exec tsc --noEmit --pretty false --incremental false`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | exit 0, không error                                                |
| Unit suite                   | `pnpm test:unit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | mọi test pass                                                      |
| Build                        | `pnpm build`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | production build thành công                                        |
| Smoke                        | `pnpm test:e2e:smoke`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | mọi `@smoke` test pass                                             |

## Phạm vi

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong phạm vi** (chỉ được sửa các file này):

- `components/providers/i18n-provider.tsx`
- `components/providers/i18n-provider.test.tsx` (tạo mới)
- `lib/i18n/messages/index.ts`
- `lib/i18n/messages/catalog-core.ts` (tạo mới)
- `lib/i18n/messages/catalog-shop.ts` (tạo mới)
- `lib/i18n/messages/catalog-admin.ts` (tạo mới)
- `lib/i18n/messages/types.ts` (tạo mới)
- `lib/i18n/messages/catalog-audit.test.ts` (tạo mới)
- `app/layout.tsx`
- `app/(shop)/layout.tsx`
- `app/(admin)/layout.tsx`
- `components/shop/review-comment.test.tsx`
- `components/shop/sale-landing.test.tsx`
- `app/(shop)/profile/orders/[code]/order-review-dialog.test.tsx`
- `app/(admin)/dashboard/sales/_components/campaign-interaction-lock.test.tsx`
- `app/(admin)/dashboard/_components/management/content-locale-tabs.test.tsx`
- `app/(admin)/dashboard/_components/management/english-content-generator.test.tsx`

**Ngoài phạm vi** (KHÔNG sửa):

- Nội dung hoặc key name của 19 message source file hiện tại.
- `lib/i18n.ts`, `lib/api-client.ts`, locale cookie/storage name hoặc
  `Accept-Language` behavior.
- Route URL, visual copy, locale-addressable routing hoặc server-rendered `lang`
  metadata; crawler/no-JavaScript limitation vẫn là documented follow-up.
- Chuyển mọi message sang Server Component hoặc thêm external i18n library.
- Broad component call-site rewrite ngoài ba layout và provider; chỉ sáu test
  trong allowlist được thêm matching route catalog wrapper.

## Git workflow

- **Authorization gate**: không commit, push hoặc mở PR nếu thiếu explicit current operator instruction; mọi commit example chỉ là recommendation.
- Branch: `perf/i18n-message-splitting`
- Chạy preflight trong `plans/README.md`; chỉ branch từ `main` sạch, mới nhất sau
  khi FE-001 đến FE-010 merge.
- Dùng logical conventional commit, ví dụ `test: audit i18n catalog namespaces`
  và `perf: split i18n catalogs by route scope`.
- Không push hoặc mở PR nếu chưa được yêu cầu và mọi gate chưa pass.

## Các bước

### Bước 1: Đo runtime catalog và route chunk hiện tại

Trên production code chưa sửa, chạy analyzer và ghi vào PR description: shared
client chunk chứa distinctive admin-only/shop-only message string, size liên
quan và auth/shop/admin route đại diện. Chỉ dùng stable distinctive string trong
catalog hiện tại để inspect; không sửa message content. Nếu aggregate catalog
không nằm trong shared client output hoặc route chunking đã loại nó, STOP vì
finding không đúng.

**Verify**: `pnpm exec next build --experimental-analyze` → exit 0 và tạo baseline
xác định aggregate catalog placement/size.

### Bước 2: Thêm executable catalog audit trước khi tách

Tạo `catalog-audit.test.ts`. Import cả 19 source catalog và assert cho từng
namespace cùng global union: EN/VI key parity, không duplicate key giữa namespace,
interpolation placeholder giống nhau và không thiếu literal `t("...")` key trong
tracked `.ts`/`.tsx` source. Chỉ in finite count khi fail. Test này là machine
guard chống silent raw-key fallback.

Dùng ownership map sau trừ khi merged route inventory chứng minh scope tối thiểu khác:

- Core: `common`, `auth-errors`.
- Shop: `account`, `customer-activity`, `help`, `sales-checkout`,
  `sales-storefront`, `shopping`, `storefront`, `testimonials`.
- Admin: mọi `admin-*`, `sales-admin-editor`, `sales-admin-management`.

Document mọi điều chỉnh scope trong test và PR. Mỗi key chỉ có một runtime owner;
duplicate spreading bị cấm.

**Verify**: `pnpm exec vitest run lib/i18n/messages/catalog-audit.test.ts` → mọi
audit assertion pass trên current catalog trước architecture change.

### Bước 3: Tạo catalog riêng nhưng giữ global key type

Tạo `catalog-core.ts`, `catalog-shop.ts`, `catalog-admin.ts` với runtime import
chỉ cho module chúng sở hữu. Tạo `types.ts` dùng type-only import để derive global
`TranslationKey` union và shared catalog dictionary type mà không tạo runtime
import. Chuyển `index.ts` thành compatibility type/barrel không còn construct hoặc
export all-messages runtime object. Runtime consumer phải import concrete catalog
module trực tiếp, không dùng barrel kéo mọi namespace vào một chunk.

**Verify**: chạy riêng hai block. Assertion đầu exit 0 chỉ khi không còn runtime
aggregate pattern bị cấm; TypeScript sau đó exit 0.

```powershell
rg -n "export const messages|\.\.\.admin|\.\.\.storefront" lib/i18n/messages/index.ts
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

```powershell
pnpm exec tsc --noEmit --pretty false --incremental false
```

### Bước 4: Tách locale ownership khỏi nested catalog augmentation

Refactor `I18nProvider` để load `coreMessages` và vẫn là owner duy nhất của
`useSyncExternalStore`, storage/cookie persistence, cross-tab event và
`setActiveLocale`. Thêm exported `I18nCatalogProvider` (hoặc tên tương đương trong
cùng file) đọc parent context, overlay đúng một route catalog cho `t`, fallback
về parent/core translator. Nó không được chạy persistence effect, sở hữu locale
store thứ hai hoặc duplicate key.

Tạo `i18n-provider.test.tsx` cover core translation, EN fallback, raw-key
fallback, shop/admin overlay, locale switch, storage-event synchronization và
invariant một locale change chỉ tạo một persistence transition dù có nested catalog.

Sáu existing component test trong scope hiện mount non-core component bằng bare
`I18nProvider`. Wrap ba shop test bằng `I18nCatalogProvider` + `shopMessages`, và
ba admin test bằng `I18nCatalogProvider` + `adminMessages`; giữ nguyên assertion.

**Verify**: `pnpm exec vitest run components/providers/i18n-provider.test.tsx components/shop/review-comment.test.tsx components/shop/sale-landing.test.tsx 'app/(shop)/profile/orders/[code]/order-review-dialog.test.tsx' 'app/(admin)/dashboard/sales/_components/campaign-interaction-lock.test.tsx' 'app/(admin)/dashboard/_components/management/content-locale-tabs.test.tsx' 'app/(admin)/dashboard/_components/management/english-content-generator.test.tsx'` → mọi locale/catalog-overlay case và cả sáu translated-text test pass, không raw key.

### Bước 5: Gắn catalog ở route-group layout

Giữ `I18nProvider` với `coreMessages` trong `app/layout.tsx`. Trong shop layout,
đặt shop `I18nCatalogProvider` ngoài cùng quanh `ShopProviders` và toàn bộ subtree
header/main/footer. Trong admin layout, đặt admin catalog ngoài cùng quanh toàn bộ
subtree preferences/auth/toaster hiện có, giữ nguyên internal provider order.
Không đưa shop/admin catalog trở lại root.

Mở rộng `catalog-audit.test.ts` bằng static layout assertion: mỗi nested layout
import đúng một matching concrete catalog, mount đúng một `I18nCatalogProvider`,
không import opposite catalog; root không import route catalog.

**Verify**: chạy block sau → exit 0 chỉ khi root không import shop/admin catalog;
sau đó chạy positive catalog-audit để chứng minh exact-one layout composition.

```powershell
rg -n "catalogShop|catalogAdmin|shopMessages|adminMessages" app/layout.tsx
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

```powershell
pnpm exec vitest run lib/i18n/messages/catalog-audit.test.ts
```

### Bước 6: Chứng minh bundle separation và behavior

Chạy cùng analyzer command và so sánh cùng route/chunk. Auth/core output không
còn distinctive admin-only/shop-only message; shop không chứa admin-only, admin
không chứa shop-only. Ghi before/after size vào PR. Sau đó chạy catalog audit,
provider test, full Frontend gate và smoke locale switch.

**Verify**: chạy riêng từng lệnh; mọi lệnh exit 0 và documented chunk assertion đúng.

```powershell
pnpm exec next build --experimental-analyze
pnpm exec vitest run lib/i18n/messages/catalog-audit.test.ts components/providers/i18n-provider.test.tsx components/shop/review-comment.test.tsx components/shop/sale-landing.test.tsx 'app/(shop)/profile/orders/[code]/order-review-dialog.test.tsx' 'app/(admin)/dashboard/sales/_components/campaign-interaction-lock.test.tsx' 'app/(admin)/dashboard/_components/management/content-locale-tabs.test.tsx' 'app/(admin)/dashboard/_components/management/english-content-generator.test.tsx'
pnpm exec eslint . --max-warnings 25
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm test:unit
pnpm build
pnpm test:e2e:smoke
git diff --check
```

## Test plan

- `catalog-audit.test.ts`: EN/VI parity, một namespace owner mỗi key,
  interpolation placeholder parity và mọi literal `t(...)` key tồn tại.
- `i18n-provider.test.tsx`: core lookup, route overlay, English/raw fallback,
  locale persistence, storage sync và không duplicate side effect.
- `catalog-audit.test.ts` còn chứng minh exact-one matching catalog composition
  ở từng route layout và root không import route catalog.
- Sáu allowlisted component test mount đúng shop/admin catalog và tiếp tục assert
  translated behavior thay vì raw key.
- Smoke: VI→EN, reload persistence, shop navigation đúng; Management route render
  translated chrome mà không có raw key.
- Bundle evidence: attach before/after route report với distinctive namespace
  string và size vào PR.
- Verification: chạy hai targeted Vitest file và full unit/build/smoke gate.

## Tiêu chí hoàn tất

- [ ] FE-001 đến FE-010 đã merge; plan reconcile với latest main.
- [ ] Baseline chứng minh aggregate catalog nằm trong shared client output.
- [ ] Mỗi message key có đúng một runtime namespace với EN/VI/placeholder parity.
- [ ] Root chỉ load core; shop/admin layout chỉ load catalog của mình.
- [ ] Shop catalog wrap toàn bộ ShopProviders/header/main/footer; admin catalog
      wrap toàn bộ preferences/auth/toaster subtree đúng một lần.
- [ ] Cả sáu existing catalog-using component test pass với matching wrapper.
- [ ] Một provider sở hữu locale persistence; nested catalog không duplicate effect.
- [ ] Global `TranslationKey` type-safe mà không all-catalog runtime import.
- [ ] Analyzer chứng minh auth/core loại shop/admin copy và route group đã tách.
- [ ] Catalog/provider test, lint, TypeScript, unit, build, smoke exit 0.
- [ ] `git diff --check` exit 0; chỉ file trong scope thay đổi.

## STOP conditions

Dừng và báo cáo (không tự suy đoán) nếu:

- Baseline analyzer không có aggregate catalog trong shared client output, nên
  optimization mong đợi không chứng minh được.
- Literal translation key không thể gán vào một route/core namespace mà không
  đổi out-of-scope caller hoặc duplicate runtime ownership.
- EN/VI parity, placeholder parity hoặc static-key completeness đã hỏng trước;
  báo chính xác pre-existing key, không tự sửa source catalog.
- Nested composition gây duplicate locale persistence, flicker, hydration
  mismatch, missing raw key hoặc `Accept-Language` desync.
- Fix cần sửa existing message copy, `lib/i18n.ts`, API header, route URL hoặc
  component ngoài scope.
- Một verification command fail hai lần sau một lần sửa hợp lý.

## Ghi chú bảo trì

- Message module mới phải khai báo một owner (core/shop/admin) và pass catalog
  audit; tránh runtime import compatibility barrel.
- Reviewer cần xem bundle evidence và locale side effect, không chấp nhận chỉ
  tách file nhưng vẫn bundle mọi catalog chung.
- Locale-addressable URL và chính xác `html[lang]` cho no-JavaScript/crawler vẫn
  được defer có chủ đích.
