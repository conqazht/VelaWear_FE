# Plan FE-002: Giữ nguyên review multipart request qua Axios

> **Nguồn shadcn/improve**: Được tạo từ audit của **shadcn/improve skill v1.0.0**. English canonical file là `plans/002-preserve-review-multipart-requests.md`. Codex thực hiện trực tiếp; **không** gọi `improve execute`.
>
> **Hướng dẫn executor**: Làm đúng step/gate. Không tự tạo multipart boundary. Nếu transport hoặc backend contract khác, STOP.
>
> **Drift check (chạy đầu tiên)**: `git diff --stat ff217af..HEAD -- lib/api-client.ts lib/api/commerce.ts lib/api/commerce-review.test.ts lib/api-client.test.ts`

## Trạng thái

- **Priority**: P1
- **Effort**: M
- **Wave**: 2
- **Risk**: LOW — serialization dùng chung nên cần regression cho cả JSON và multipart.
- **Depends on**: FE-001
- **Category**: bug
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao quan trọng

Shared Axios instance ép JSON cho mọi request. Axios có thể biến `FormData` thành JSON trước khi browser tạo multipart boundary, làm mất binary image hoặc khiến Spring không parse được. Fix phải phục hồi content-type inference mà không phá JSON API.

## Trạng thái hiện tại

- `lib/api-client.ts:34-40`, `apiClient`: `headers: { "Content-Type": "application/json" }`.
- `lib/api/commerce.ts:247-266`, `createReview`, tạo `FormData` gồm JSON Blob `review` và `images`.
- `lib/api/commerce-review.test.ts:3-7` mock `apiClient.post`, nên Axios transform không chạy.
- `docs/STOREFRONT_CATALOG_UX_FRONTEND_VI.md:388-396` yêu cầu browser/Axios tạo boundary.

## Commands cần dùng

| Mục đích     | Command                                                                       | Kết quả mong đợi            |
| ------------ | ----------------------------------------------------------------------------- | --------------------------- |
| Target tests | `pnpm exec vitest run lib/api/commerce-review.test.ts lib/api-client.test.ts` | tất cả pass                 |
| Lint         | `pnpm exec eslint . --max-warnings 25`                                        | exit 0                      |
| Typecheck    | `pnpm exec tsc --noEmit --pretty false --incremental false`                   | exit 0                      |
| Unit         | `pnpm test:unit`                                                              | tất cả pass                 |
| Build        | `pnpm build`                                                                  | production build thành công |

## Scope

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong scope**:

- `lib/api-client.ts`
- `lib/api/commerce-review.test.ts`
- `lib/api-client.test.ts` nếu shared transport assertion phù hợp

**Ngoài scope**:

- Đổi review part names/payload/validation/backend storage.
- Upload quota hoặc generic upload.
- Thêm Axios client riêng cho review.
- Tự đặt `multipart/form-data` hoặc boundary.

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
  git switch -c fix/review-multipart-transport
  ```
- Worktree phải sạch và hai SHA phải bằng nhau trước khi tạo branch.
- Branch tồn tại hoặc main bẩn/lệch thì STOP; không stash/reset.
- Commit gợi ý: `fix: preserve multipart review uploads`.

## Các bước

### Bước 1: Thêm transport-level failing regression test

Dùng custom Axios adapter để transform chạy trước khi inspect. Assert adapter nhận `FormData`, có `review`/`images`, không gắn `application/json`. Giữ safe payload assertions và thêm JSON control case.

**Verify**: `pnpm exec vitest run lib/api/commerce-review.test.ts lib/api-client.test.ts` → FormData assertion mới fail đúng vì old forced JSON header trước Bước 2.

### Bước 2: Phục hồi Axios content-type inference

Bỏ explicit JSON header khỏi `axios.create`. Không thêm multipart header theo endpoint. Plain object vẫn phải serialize thành JSON.

**Verify**: `pnpm exec vitest run lib/api/commerce-review.test.ts lib/api-client.test.ts` → multipart và JSON đều pass.

### Bước 3: Chạy shared-client regression gates

Chạy TypeScript, full unit và production build vì mọi API dùng instance này.

**Verify**: chạy riêng `pnpm exec eslint . --max-warnings 25`, `pnpm exec tsc --noEmit --pretty false --incremental false`, `pnpm test:unit`, `pnpm build` → từng lệnh exit 0.

## Test plan

- Multipart một image và zero image.
- JSON review part trim comment, không có `userId`/image URL.
- Adapter nhận `FormData`, không phải serialized data.
- Plain JSON request vẫn JSON.
- Theo mẫu `lib/api-client.test.ts`; không mock layer đang kiểm tra.

## Done criteria

- [ ] `apiClient` không ép default `Content-Type`.
- [ ] Multipart sống qua Axios transform và browser sở hữu boundary.
- [ ] JSON regression pass.
- [ ] Targeted tests và mọi CI-equivalent gate pass.
- [ ] Chỉ file trong scope thay đổi; `git diff --check` pass.

## STOP conditions

- Backend không còn nhận `review` JSON Blob + `images`.
- Axios behavior/version đã drift.
- Fix cần hard-coded boundary hoặc client thứ hai.
- Shared JSON call regression hoặc verification fail hai lần.

## Maintenance notes

- Binary endpoint mới phải dùng cùng transport-level test pattern.
- Reviewer phải xác nhận test thực thi Axios transform; mock `.post` là chưa đủ.
