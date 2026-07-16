# Plan FE-005: Tôn trọng Retry-After của rate limit từ server

> **Nguồn shadcn/improve**: Được tạo từ audit của **shadcn/improve skill v1.0.0**. English canonical file là `plans/005-honor-rate-limit-retry-after.md`. Codex thực hiện trực tiếp; **không** gọi `improve execute`.
>
> **Hướng dẫn executor**: Centralize parser, giữ one-retry query policy và zero-retry mutation policy, dùng deterministic time trong tests. Chỉ bắt đầu sau khi BE-005 trong repository `coqanklazy/VelaWear_BE`, plan `plans/005-stabilize-api-error-contract.md`, branch `fix/api-error-contract`, đã merge. STOP nếu merged contract đó khác.
>
> **Drift check (chạy đầu tiên)**: `git diff --stat ff217af..HEAD -- lib/api/errors.ts lib/api/errors.test.ts components/providers/query-provider.tsx components/providers/query-provider.test.tsx lib/auth-otp-api.ts lib/auth-otp-api.test.ts`

## Trạng thái

- **Priority**: P2
- **Effort**: M
- **Wave**: 2
- **Risk**: LOW — delay dùng chung nhưng retry count vẫn bounded.
- **Depends on**: FE-003 và BE-005 của `coqanklazy/VelaWear_BE` (`plans/005-stabilize-api-error-contract.md`, branch `fix/api-error-contract`)
- **Category**: bug
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao quan trọng

Query xem HTTP 429 là retryable nhưng dùng default delay thay vì `Retry-After`/`retryAfterSeconds`. Retry quá sớm tiếp tục tốn quota và fail. OTP đã parse contract đúng; generic query nên reuse một parser.

## Trạng thái hiện tại

- `lib/api/errors.ts:50-78` đánh dấu 429 retryable, giới hạn `failureCount < 1`, không có delay.
- `components/providers/query-provider.tsx:13-18` có `retry`, không `retryDelay`.
- `lib/auth-otp-api.ts:128-154` parse seconds/HTTP-date/AxiosHeaders/body nhưng private.
- `lib/auth-otp-api.ts:157-174,241-245` fallback bằng substring trong raw message (`rate`, `retry`, `expired`, `invalid`, ...). BE-005 biến message thành display-only nên phải xóa machine classification này.
- `lib/auth-otp-api.test.ts:128-149` test body precedence/header.
- `docs/STOREFRONT_CATALOG_UX_FRONTEND_VI.md:405-417` quy định một retry cho 408/429/5xx, zero cho mutation/deterministic 4xx.

Sau khi BE-005 merge, khóa code/status matrix sau trong tests; response message không bao giờ là machine identifier:

| HTTP status | Stable code | Machine behavior ở Frontend |
|---|---|---|
| 400 | `REQUEST_BODY_INVALID`, `INVALID_REQUEST`, cùng OTP validation code hiện hữu | không auto-retry; OTP kind chỉ đến từ known code |
| 401 | `AUTHENTICATION_REQUIRED`, `SESSION_REVOKED` | không auto-retry; giữ auth/session-revoked handling hiện tại |
| 403 | `ACCESS_DENIED` | không auto-retry |
| 405 | `METHOD_NOT_ALLOWED` | không auto-retry |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | không auto-retry |
| 429 | `OTP_RATE_LIMITED`, `AUTH_RATE_LIMITED`, hoặc finite rate-limit code đã document | parse `data.retryAfterSeconds` trước, rồi `Retry-After`; known code có thể chọn OTP copy, còn status quyết định retry eligibility |
| 500 | `INTERNAL_SERVER_ERROR` | query có thể dùng một fallback retry hiện tại; mutation vẫn zero-retry |

Mapping `OTP_INVALID_OR_EXPIRED`, `OTP_ATTEMPTS_EXHAUSTED`, `OTP_PROOF_INVALID_OR_EXPIRED`, `OTP_SERVICE_UNAVAILABLE`, `OTP_DELIVERY_UNAVAILABLE` vẫn dựa trên code. Nếu code thiếu/unknown, chỉ suy ra generic behavior từ HTTP/network status; tuyệt đối không đọc message substring.

## Commands cần dùng

| Mục đích | Command | Kết quả mong đợi |
|---|---|---|
| Target tests | `pnpm exec vitest run lib/api/errors.test.ts lib/auth-otp-api.test.ts components/providers/query-provider.test.tsx` | tất cả pass |
| Lint | `pnpm exec eslint . --max-warnings 25` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit --pretty false --incremental false` | exit 0 |
| Unit | `pnpm test:unit` | tất cả pass |
| Build | `pnpm build` | production build thành công |

## Scope

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong scope**:
- `lib/api/errors.ts`, `lib/api/errors.test.ts`
- `components/providers/query-provider.tsx`
- `components/providers/query-provider.test.tsx` (tạo mới)
- `lib/auth-otp-api.ts`, `lib/auth-otp-api.test.ts`

**Ngoài scope**:
- Tăng retry count hoặc mutation retry.
- Đổi backend threshold/error code.
- UI countdown ngoài OTP.
- Persist rate limit/CAPTCHA/edge tooling.

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
  git switch -c fix/rate-limit-retry-after
  ```
- Worktree phải sạch và hai SHA phải bằng nhau trước khi tạo branch.
- Dirty/diverged main hoặc branch tồn tại thì STOP.
- Commit gợi ý: `fix: honor rate limit retry delays`.

## Các bước

### Bước 1: Mã hóa generic delay contract trong tests

Thêm deterministic case cho exact BE-005 matrix, body `data.retryAfterSeconds`, numeric header, HTTP-date, AxiosHeaders `.get`, malformed/past/negative, non-429 fallback và automatic-retry ceiling năm phút. Khóa unit rõ ràng: `extractRetryAfterSeconds(error, nowMs)` trả positive integer **seconds** cho OTP/UI; `getQueryRetryDelayMs(attemptIndex, error, nowMs)` trả **milliseconds** cho TanStack Query; `shouldRetryApiError(failureCount, error, nowMs)` từ chối 429 có valid delay quá 300 giây. Test `300 giây → 300_000 ms` và được retry, `301 giây → adapter trả 301_000 ms` nhưng retry bị từ chối, deterministic HTTP-date rounding và OTP seconds không đổi. Thêm adversarial message cases như trên.

**Verify**: `pnpm exec vitest run lib/api/errors.test.ts` → case mới fail đúng vì thiếu helper.

### Bước 2: Extract một shared Retry-After parser

Chuyển OTP delay logic vào `lib/api/errors.ts` hoặc narrow sibling với exact pure API `extractRetryAfterSeconds(error, nowMs = Date.now()): number | undefined`. Body `data.retryAfterSeconds` ưu tiên header; HTTP-date thành positive ceiling seconds. OTP tiếp tục dùng seconds không đổi. Thêm `getQueryRetryDelayMs(attemptIndex, error, nowMs = Date.now()): number`, gọi parser và nhân valid server value với `1_000` đúng một lần; chỉ missing/invalid delay hoặc non-429 retryable failure mới dùng bounded exponential millisecond fallback. Thay `getFallbackErrorKind(message)` bằng finite code lookup cộng HTTP/network-status fallback; message không chọn behavior.

**Verify**: `pnpm exec vitest run lib/api/errors.test.ts lib/auth-otp-api.test.ts` → parser/unit/code-matrix cases pass; không duplicate delay parser hay message-substring classifier trong `auth-otp-api.ts`.

### Bước 3: Wire React Query retryDelay, không đổi eligibility

Đặt `queries.retryDelay` thành `getQueryRetryDelayMs`. Sửa `shouldRetryApiError(failureCount, error, nowMs = Date.now())` để 429 có valid delay lớn hơn `300` giây không eligible; tối đa 300 giây vẫn theo giới hạn một retry. Giữ `mutations.retry: 0`, stale/gc/focus behavior. Adapter có thể trả đủ `301_000` ms cho deterministic test nhưng eligibility phải ngăn scheduling.

**Verify**: `pnpm exec vitest run lib/api/errors.test.ts components/providers/query-provider.test.tsx` → 429 tối đa năm phút dùng exact millisecond delay; delay dài hơn ineligible; 5xx/network fallback; deterministic 4xx/cancel không retry.

### Bước 4: Chạy shared error regression

Chạy full CI-equivalent suite; OTP cooldown output phải tương thích tests hiện tại.

**Verify**: chạy riêng `pnpm exec eslint . --max-warnings 25`, `pnpm exec tsc --noEmit --pretty false --incremental false`, `pnpm test:unit`, `pnpm build` → từng lệnh exit 0.

## Test plan

- Header seconds/HTTP-date với deterministic clock.
- Body-over-header precedence.
- AxiosHeaders/plain object.
- Malformed/zero/negative/past; boundary chính xác `300`/`301` giây và `300_000`/`301_000` ms.
- Tối đa một retry cho 408/429/5xx/network; không auto-retry nếu valid 429 delay quá năm phút hoặc với cancel/400/401/403/404/mutation.
- Giữ OTP normalization tests.
- Code/status matrix tests chứng minh display-message change không thể đổi retry/auth/session-revoked/OTP behavior.

## Done criteria

- [ ] Một shared parser phục vụ OTP và generic queries.
- [ ] Seconds/milliseconds rõ ràng: OTP giữ seconds, TanStack nhận đúng seconds × 1.000 một lần.
- [ ] Mọi framework/security status-code pair của BE-005 được test; raw message không điều khiển behavior.
- [ ] 429 dùng đúng server delay đến năm phút và không bao giờ retry sớm hơn một valid delay dài hơn.
- [ ] Retry count/mutation policy không đổi.
- [ ] Targeted và CI-equivalent gates pass.
- [ ] Chỉ file trong scope thay đổi; `git diff --check` pass.

## STOP conditions

- BE-005 dùng milliseconds hoặc response shape khác.
- Merged consumer còn phụ thuộc raw exception/message substring; phải coordinate migration thay vì giữ fallback.
- Active product requirement cần automatic wait dài hơn năm phút; revise policy rõ ràng thay vì âm thầm đổi ceiling.
- Extraction tạo import cycle.
- OTP output/precedence đổi ngoài ý muốn.
- Drift hoặc verification fail lặp lại.

## Maintenance notes

- Parser phải side-effect free và test độc lập.
- Feature code không được thêm ad-hoc timer cho rate-limited query.
