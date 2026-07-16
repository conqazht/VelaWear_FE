# Plan FE-004: Hợp nhất account settings và hydrate form an toàn

> **Nguồn shadcn/improve**: Được tạo từ audit của **shadcn/improve skill v1.0.0**. English canonical file là `plans/004-consolidate-account-settings-and-hydration.md`. Codex thực hiện trực tiếp; **không** gọi `improve execute`.
>
> **Hướng dẫn executor**: Giữ nguyên real OTP/password flows và làm unsupported controls trung thực. Viết behavior tests trước khi xóa duplicate UI. STOP thay vì tự tạo backend preference/delete API.
>
> **Drift check (chạy đầu tiên)**: `git diff --stat ff217af..HEAD -- 'app/(shop)/profile/page.tsx' 'app/(shop)/profile/settings/page.tsx' components/shop/profile-navigation.tsx lib/i18n/messages/account.ts`

## Trạng thái

- **Priority**: P1
- **Effort**: L
- **Wave**: 2
- **Risk**: MED — hai settings surface cạnh tranh và chứa sensitive-account UI.
- **Depends on**: FE-001
- **Category**: bug
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao quan trọng

Profile chính hiển thị privacy/communication state chỉ nằm local, Save/Delete button không handler và password modal không submit. `/profile/settings` có real OTP email/password mutation nhưng không có navigation tới; email form lại khởi tạo trước async auth hydration. User có thể tưởng security/privacy action đã thành công dù không có gì xảy ra.

## Trạng thái hiện tại

- `app/(shop)/profile/page.tsx:234-242` ghi `// Mock settings state`.
- Save không handler tại `:742-746`, `:769-773`, `:829-833`; Delete tại `:580-585`.
- Password modal mở tại `:450-460`, final button `:1166-1182` không submit.
- Real `changePassword` + reauthentication ở `app/(shop)/profile/settings/page.tsx:145-169`; email OTP cùng component.
- `components/shop/profile-navigation.tsx:9-17` thiếu settings; route chỉ tự link chính nó tại `settings/page.tsx:200-205`.
- Dù `app/(shop)/profile/layout.tsx` đã render `CachedProfileNavigation`, `settings/page.tsx:200-240` vẫn render thêm local account-tab navigation. Khi thêm Settings vào shared navigation, phải xóa block duplicate này để route chỉ có đúng một account navigation và Settings active.
- `settings/page.tsx:77-86` dùng initial-only `defaultValues`; `:177-198` không chờ auth loading.

## Commands cần dùng

| Mục đích | Command | Kết quả mong đợi |
|---|---|---|
| Target tests | `pnpm exec vitest run 'app/(shop)/profile/settings/page.test.tsx' components/shop/profile-navigation.test.tsx` | tất cả pass |
| Lint | `pnpm exec eslint . --max-warnings 25` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit --pretty false --incremental false` | exit 0 |
| Unit | `pnpm test:unit` | tất cả pass |
| Build | `pnpm build` | production build thành công |
| Smoke | `pnpm test:e2e:smoke` | smoke pass |

## Scope

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong scope**:
- `app/(shop)/profile/page.tsx`
- `app/(shop)/profile/settings/page.tsx`
- `components/shop/profile-navigation.tsx`
- `lib/i18n/messages/account.ts`
- `app/(shop)/profile/settings/page.test.tsx`, `components/shop/profile-navigation.test.tsx` (tạo mới)

**Ngoài scope**:
- Backend preference/privacy/location/delete-account API mới.
- Đổi OTP/proof-token contract hoặc reauthentication cleanup.
- Broad profile decomposition (FE-009/FE-010).
- Visual redesign hoặc localStorage cho mock preferences.

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
  git switch -c fix/account-settings-integrity
  ```
- Worktree phải sạch và hai SHA phải bằng nhau trước khi tạo branch.
- Branch collision, dirty worktree hoặc diverged main thì STOP; không stash/reset.
- Commit gợi ý: `fix: consolidate account settings flows`.

## Các bước

### Bước 1: Characterize real settings flows

Tạo tests cho auth loading, guest prompt, hydrated/dirty email, password submit, OTP callback và reauthentication redirect. Mock API/hook boundary, không mock React Hook Form behavior đang kiểm tra.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/settings/page.test.tsx' components/shop/profile-navigation.test.tsx` → existing OTP/password cases pass; case loading, hydration, duplicate navigation và Settings-active mới fail đúng gap trước implementation.

### Bước 2: Làm settings reachable và canonical

Thêm `settings` vào shared profile tab/navigation với `/profile/settings`. Xóa local top-level account-tab block tại `settings/page.tsx:200-240`; chỉ giữ settings-specific content/sidebar bên dưới single shared navigation từ `profile/layout.tsx`. Fake password editor trên profile phải dẫn tới canonical route. Desktop/mobile active semantics đúng.

**Verify**: `pnpm exec vitest run components/shop/profile-navigation.test.tsx 'app/(shop)/profile/settings/page.test.tsx'` → `/profile/settings` chỉ render một account navigation, đúng một Settings item active và password edit đi canonical route.

### Bước 3: Xóa hoặc disable rõ unsupported actions

Xóa duplicate local-only panels/dead password state. Nếu product muốn giữ control để báo trước, phải `disabled`, có `aria-disabled` và localized “Coming soon”. Cấm enabled button không handler.

**Verify**: chạy negative search và guard trước:

```powershell
rg -n 'Mock settings state|setReviewVisibility|setLocationSharing|setPrivacySettings|setIsEditPasswordOpen' 'app/(shop)/profile/page.tsx'
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

Sau đó chạy positive test riêng:

```powershell
pnpm exec vitest run 'app/(shop)/profile/settings/page.test.tsx'
```

Expected: negative search exit 0, không output; test exit 0, không còn enabled unsupported action và real settings cases pass.

### Bước 4: Hydrate email mà không overwrite user edit

Dùng `isLoading` từ `useAuth`. Khi user resolve/change, reset email/default chỉ khi form pristine; cache refetch không overwrite dirty value. Giữ validation và requested OTP email.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/settings/page.test.tsx'` → named pending→authenticated và dirty-refetch cases pass; email chỉ init một lần, cache refresh sau đó không overwrite edit.

### Bước 5: Chạy full account regression

Chạy mọi gate/smoke; test email OTP, password change/create, cancel, validation, reauthentication và hai locale.

**Verify**: chạy riêng `pnpm exec eslint . --max-warnings 25`, `pnpm exec tsc --noEmit --pretty false --incremental false`, `pnpm test:unit`, `pnpm build`, `pnpm test:e2e:smoke` → từng lệnh exit 0.

## Test plan

- Loading không flash guest prompt.
- Hydration set email; refetch không overwrite dirty input.
- Settings navigation active/href.
- Settings route có đúng một account navigation và đúng một active Settings item.
- Real password/OTP payload và redirect không đổi.
- Unsupported controls absent hoặc disabled/labeled.
- Theo mẫu `components/shop/checkout-page-client.test.tsx`; dùng real
  `I18nProvider` khi phù hợp như trong
  `app/(shop)/profile/orders/[code]/order-review-dialog.test.tsx`.

## Done criteria

- [ ] `/profile/settings` reachable từ shared navigation.
- [ ] Duplicate account tabs trong settings page đã xóa; đúng một shared navigation đánh dấu Settings active.
- [ ] Chỉ còn một real email/password implementation.
- [ ] Không có enabled Save/Delete/password action thiếu behavior.
- [ ] Auth loading/hydration tests pass, không overwrite dirty field.
- [ ] OTP/password/reauthentication regressions pass.
- [ ] Full lint/typecheck/unit/build/smoke pass.
- [ ] Chỉ file trong scope thay đổi; `git diff --check` pass.

## STOP conditions

- Main đã có backend API cho control từng là mock; phải re-plan real contract.
- Product bắt buộc giữ enabled unsupported control.
- Hydration cần overwrite dirty field.
- Xóa duplicate UI làm đổi OTP/password contract.
- Drift hoặc verification fail hai lần.

## Maintenance notes

- Sensitive setting không được biểu diễn bằng local-only state.
- FE-008/FE-009/FE-010 phải build trên canonical route này và không được khôi
  phục duplicate password logic.
- Reviewer test cả account `hasPassword=true` và OAuth-only account
  `hasPassword=false`.
