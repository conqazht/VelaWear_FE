# Kế hoạch bổ sung race-condition tests và Playwright CI

## 1. Tạo worktree an toàn từ `main`

Không stash hoặc checkout hai thư mục đang code. Tạo hai worktree riêng vì FE/BE là hai Git repo độc lập:

```powershell
$root = "D:\CANH\Java\side project"

git -C "$root\commercial-fe" fetch origin main
git -C "$root\commercial" fetch origin main

git -C "$root\commercial-fe" worktree add `
  -b test/playwright-race-ci `
  "$root\worktrees\commercial-fe-race-ci" `
  origin/main

git -C "$root\commercial" worktree add `
  -b test/concurrency-race-gaps `
  "$root\worktrees\commercial-be-race-ci" `
  origin/main
```

Trước và sau khi làm, lưu lại `git status` và SHA của cả bốn thư mục để xác nhận nhánh feature hiện tại không bị thay đổi.

## 2. Backend: lấp các khoảng trống race condition

- Sửa refresh-token rotation thành Redis Lua CAS nguyên tử:

  - Đổi `rotate(oldJti, newSession)` thành `rotateIfCurrent(expectedOld, replacement)`.
  - Lua kiểm tra toàn bộ session cũ, tạo session mới với TTL và xóa session cũ trong một thao tác.
  - Chỉ một request concurrent được thành công; request còn lại nhận `401` với thông báo hiện tại `Refresh session is expired or revoked`.
  - Không dùng `synchronized` vì không bảo vệ được khi chạy nhiều backend instance.
  - Không thay đổi HTTP API, cookie, database schema hoặc response contract.

- Bổ sung test với PostgreSQL và Redis Testcontainers thật:

  - Hai request cùng refresh token: đúng một thành công, một `401`, chỉ một successor tồn tại trong Redis/PostgreSQL.
  - Hai checkout đồng thời cùng user, request và `Idempotency-Key`: trả cùng order/payment, chỉ trừ stock/quota một lần.
  - Hai SePay IPN đồng thời có cùng `transaction_id`: cả hai xử lý idempotent, chỉ một transaction, không chuyển nhầm sang `REFUND_PENDING`.
  - Dùng `ready latch + start latch + timeout 10 giây`, không dùng `sleep`.
  - Thêm test Lua destination-collision để đảm bảo session cũ không bị mất.

- Cập nhật unit test auth cho kết quả CAS thành công/thất bại.

- Giữ nguyên [backend-ci.yml](<D:/CANH/Java/side project/commercial/.github/workflows/backend-ci.yml>). `clean verify` hiện tại đã tự chạy toàn bộ test mới.

## 3. Frontend: Vitest và chống double-submit thật sự

- Shared refresh khi nhiều request cùng `401`:

  - Giữ nguyên production logic `refreshPromise`.
  - Thêm Vitest dùng real Axios interceptor và deferred promise.
  - Chứng minh hai request chỉ gọi `/auth/refresh` một lần, cùng retry bằng access token mới.
  - Chứng minh request `401` sau khi promise hoàn tất có thể tạo lượt refresh tiếp theo.

- Stale search:

  - Tách logic thành hook `useSearchSuggestions(query, locale)`.
  - Mỗi query/locale mới tăng generation ngay lập tức, kể cả khi query bị xóa.
  - Cleanup debounce khi rerender/unmount; response cũ không được ghi đè response mới.
  - Test trường hợp query mới trả về trước query cũ và trường hợp xóa query khi request cũ còn chạy.

- Rapid/double checkout:

  - Thêm promise-ref mutex được gán đồng bộ trước lần `await` đầu tiên.
  - Hai submit cùng lúc trả cùng một promise, chỉ tạo một preview, một idempotency key và một checkout request.
  - Vẫn giữ `idempotencyRef` để retry sau network failure dùng lại đúng request/key.
  - Component test gửi hai `submit` trong cùng tick và xác nhận API chỉ được gọi một lần; sau failure có thể retry bình thường.

## 4. Playwright và CI hai repo

- Chuẩn hóa FE và API cùng hostname:

  - FE: `http://localhost:3000`
  - BE: `http://localhost:8080`
  - Không dùng lẫn `127.0.0.1` để tránh lỗi refresh cookie `SameSite=Lax`.

- Thêm scripts:

  - `test:e2e:smoke`: chỉ chạy test `@smoke`.
  - `test:e2e:fullstack`: chỉ chạy `@fullstack`, `workers=1`.

- Playwright full-stack checkout:

  - Login bằng seed account `user@velawear.local`.
  - Reset cart qua API với SKU cố định.
  - Chỉ mock API tỉnh/phường bên ngoài; checkout gọi backend thật.
  - Gọi `form.requestSubmit()` hai lần trong cùng browser tick.
  - Xác nhận đúng một `POST /api/v1/checkout`, response `201`, UI hiển thị thành công và chỉ có một order.
  - Hủy order ở teardown để hoàn stock; database CI vẫn là disposable.

- Cập nhật `frontend-pr-checks.yml`:

  - Job validate: lint, typecheck, Vitest, build.
  - Job Playwright smoke riêng trong cùng workflow.
  - Hai job chạy trên PR nhưng không cần backend.

- Tạo `fullstack-e2e.yml` riêng trong repo FE:

  - Chạy khi push `main`.
  - Nightly lúc 02:00 giờ Việt Nam.
  - `workflow_dispatch` nhận `frontend_ref` và `backend_ref`.
  - Checkout FE vào `frontend/`, BE vào `backend/`.
  - PostgreSQL 16 và Redis 8.8 dùng GitHub Actions service containers.
  - Chạy Spring Boot profile `test`, chờ `/actuator/health`, sau đó chạy Playwright full-stack.
  - Upload HTML report, trace, screenshot và `backend.log`; luôn dọn backend process.
  - Không chạy full-stack trên mọi PR theo lựa chọn đã chốt.

- Tạo secret `CROSS_REPO_READ_TOKEN` tại repo FE: fine-grained PAT chỉ có `Contents: read` cho hai private repo.

## 5. Tài liệu tiếng Việt

- FE: tạo `docs/PLAYWRIGHT_CI_VI.md`, gồm:

  - Khi nào dùng Vitest, Playwright smoke, Playwright full-stack và backend integration test.
  - Cách chạy local.
  - Luồng CI checkout hai repo.
  - Cách cấu hình token, refs và đọc artifacts.
  - Fixture/seed được sử dụng và hướng xử lý lỗi thường gặp.

- BE: tạo `docs/RACE_CONDITION_TESTING_VI.md`, gồm:

  - Ma trận từng race condition, cơ chế bảo vệ và test tương ứng.
  - Giải thích Redis Lua CAS và failure semantics.
  - Cách viết test concurrent deterministic.
  - Cách chạy targeted test và full `clean verify`.
  - Ghi chú Lua hai-key hiện dựa trên Redis standalone; nếu chuyển Redis Cluster phải dùng cùng hash-tag.

- Cập nhật tài liệu refresh-token strategy, README và `PROJECT_STATUS` của cả hai repo; ghi kết quả test thực tế sau khi chạy, không ghi trước kết quả giả định.

## 6. Kiểm chứng và bàn giao

- Backend:

  - Chạy targeted refresh/checkout/IPN tests.
  - Chạy `.\mvnw.cmd clean verify`.

- Frontend:

  - `pnpm test:unit`
  - ESLint và TypeScript.
  - `pnpm build`
  - `pnpm test:e2e:smoke`
  - `pnpm test:e2e:fullstack` với backend/PostgreSQL/Redis thật.

- Đảm bảo không có flaky test qua nhiều lần chạy targeted concurrency tests.
- Tạo hai PR riêng; merge backend trước, sau đó frontend để lần chạy `fullstack-e2e` đầu tiên trên FE `main` sử dụng backend đã hoàn chỉnh.
- Không tạo repo thứ ba, không thêm production test endpoint, không thay đổi backend CI hiện tại.
