# Playwright, race condition và CI full-stack

Tài liệu này giải thích cách VelaWear kiểm thử từ hàm frontend đến luồng trình duyệt
thật, vì sao frontend và backend vẫn giữ ở hai repository, và cách GitHub Actions
checkout cả hai repository trong cùng một runner.

## 1. Chọn đúng loại test

| Rủi ro cần bảo vệ | Công cụ chính | Chạy ở đâu |
| --- | --- | --- |
| Hàm mapping, validation, hook và state React | Vitest + Testing Library | FE PR |
| Nhiều request `401` dùng chung một lần refresh | Vitest với Axios interceptor thật | FE PR |
| Search cũ trả về sau search mới | Vitest với deferred promise | FE PR |
| Hai lần submit trong cùng browser tick | Vitest + Playwright | FE PR và full-stack |
| Hard reload chỉ refresh một lần, logout chặn token cũ | Playwright full-stack | FE `main`, nightly, manual |
| Hai tab cùng bootstrap không refresh chồng nhau | Web Locks + Playwright full-stack | FE `main`, nightly, manual |
| Oversell, quota, coupon, idempotency transaction | JUnit + PostgreSQL/Redis Testcontainers | BE PR |
| FE, cookie, Spring Boot và database hoạt động cùng nhau | Playwright full-stack | FE `main`, nightly, manual |

Playwright không thay thế test transaction ở backend. Trình duyệt chỉ chứng minh
hành vi người dùng và contract FE–BE; tính đúng đắn của row lock, atomic update hoặc
Redis CAS phải được kiểm tra trực tiếp bằng integration test backend.

## 2. Các bộ Playwright

### Smoke

```bash
pnpm test:e2e:smoke
```

Smoke test có tag `@smoke`, tự khởi động Next.js và không yêu cầu Spring Boot.
Mục tiêu là phát hiện route không render, lỗi JavaScript nghiêm trọng và nội dung
cốt lõi biến mất. Bộ này chạy trên mọi pull request FE.

Sáu case hiện tại kiểm tra:

1. trang chủ, header và điều hướng tìm kiếm;
2. validation đăng nhập chặn form rỗng trước khi gọi API;
3. thêm sản phẩm từ UI, cập nhật badge và giữ guest cart sau reload;
4. nội dung nghiệp vụ của trang Standard Sale;
5. cảnh báo giỏ hàng không giữ suất của Flash Sale;
6. chuyển VI sang EN bằng switcher thật, giữ locale và metadata sau reload.

Fixture smoke chặn API VelaWear ở tầng browser: refresh của khách trả `401`, catalog
và Sale trả dữ liệu rỗng để UI dùng fixture deterministic. Vì vậy job không phụ
thuộc backend hoặc dữ liệu mạng, nhưng vẫn thất bại nếu trang phát sinh JavaScript
exception không được xử lý hoặc gọi một endpoint VelaWear chưa được allowlist rõ ràng.

### Full-stack

```bash
pnpm test:e2e:fullstack
```

Full-stack test có tag `@fullstack`, chạy Chromium với một worker và dùng backend
thật tại `http://localhost:8080`. Năm case hiện tại gồm session reload, bootstrap
hai tab, refresh-vs-logout, logout/replay và checkout race.

Bốn test auth:

1. đăng nhập qua API để tạo cookie `HttpOnly`, mở profile rồi hard reload; xác nhận
   reload chỉ gọi một `POST /auth/refresh`, cookie được rotate và UI vẫn nhận diện
   người dùng;
2. giữ request refresh của tab thứ nhất bằng barrier, mở tab thứ hai và xác nhận nó
   chờ Web Lock thay vì gửi request chồng lên; sau khi nhả barrier, cả hai request
   tuần tự đều nhận `200`, cookie tiếp tục rotate và cả hai tab vẫn đăng nhập;
3. giữ refresh của tab A, logout từ tab B và xác nhận logout còn ở hàng đợi, chưa ra
   network; sau khi refresh hoàn tất, logout chạy cuối, xóa cookie và thu hồi session;
4. logout từ UI, xác nhận cookie bị xóa, access token bị blacklist, refresh không
   cookie và replay token cũ
   đều nhận `401`.

`refreshPromise` vẫn gộp nhiều `401` trong cùng một tab thành một request. Web Lock
`vela-auth-session` tuần tự hóa các thao tác đổi session cookie giữa các tab cùng origin:
login/OAuth, refresh và logout không thể ghi đè cookie của nhau. Vì access token
chỉ nằm trong memory của từng tab nên hai tab vẫn cần hai request nối tiếp
`R0 → R1 → R2`, không phải dùng chung một access token. Redis CAS và integration
test backend vẫn bắt buộc cho client khác origin, browser profile hoặc thiết bị khác.
Logout thử gửi Bearer hiện tại để backend blacklist access token; nếu token đã hết
hạn và Spring Security trả `401` trước controller, FE retry đúng một lần không Bearer
để controller vẫn thu hồi refresh cookie/session HttpOnly.

Test checkout:

1. đăng nhập bằng tài khoản seed `user@velawear.local`;
2. đặt một variant seed cố định vào cart qua API;
3. chỉ mock API tỉnh/phường bên ngoài VelaWear;
4. gọi `requestSubmit()` hai lần trong cùng một browser tick;
5. xác nhận chỉ có một `POST /api/v1/checkout` và UI nhận một đơn hàng;
6. hủy đơn trong teardown để trả lại tài nguyên.

Không tạo endpoint reset dữ liệu trong production. PostgreSQL/Redis của CI là
disposable, còn fixture dùng các API nghiệp vụ hiện có.

## 3. Chạy full-stack ở local với hai worktree

Ví dụ cấu trúc được dùng cho đợt hardening này:

```text
worktrees/
├── commercial-fe-race-ci/
└── commercial-be-race-ci/
```

### Khởi động PostgreSQL và Redis

Từ worktree backend, cấu hình các biến tương ứng với `docker-compose.yml`, sau đó:

```powershell
$env:DB_NAME = "velawear_e2e"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "postgres"
$env:REDIS_PORT = "6379"

docker compose up -d --wait
```

### Khởi động backend

Backend full-stack dùng profile `test`. Profile này chạy Flyway schema và dev seed
trên database disposable:

```powershell
$env:SPRING_PROFILES_ACTIVE = "test"
$env:SPRING_DOCKER_COMPOSE_ENABLED = "false"
$env:SERVER_PORT = "8080"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/velawear_e2e"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "postgres"
$env:SPRING_DATA_REDIS_HOST = "localhost"
$env:SPRING_DATA_REDIS_PORT = "6379"
$env:JWT_ACCESS_TOKEN_SECRET_KEY = "local-e2e-access-secret-key-must-be-at-least-64-characters-long!"
$env:JWT_REFRESH_TOKEN_SECRET_KEY = "local-e2e-refresh-secret-key-must-be-at-least-64-characters-long"
$env:JWT_ACCESS_TOKEN_EXPIRATION = "900"
$env:JWT_REFRESH_TOKEN_EXPIRATION = "259200"
$env:RESEND_API_KEY = "test-resend-api-key"
$env:SEPAY_ENABLED = "false"

.\mvnw.cmd spring-boot:run
```

Không dùng credential production cho môi trường này.

### Chạy frontend

Từ worktree frontend:

```powershell
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test:e2e:fullstack
```

Khi hoàn tất, dừng backend và chạy `docker compose down -v` để xóa database test.

## 4. Vì sao phải dùng `localhost` thống nhất

Frontend chạy tại `http://localhost:3000`, API chạy tại
`http://localhost:8080`. Không trộn `127.0.0.1` và `localhost`: refresh token nằm
trong cookie HttpOnly `SameSite=Lax`, nên hai hostname khác nhau có thể làm browser
không gửi cookie như mong đợi dù chúng cùng trỏ về máy local.

## 5. GitHub Actions

### Fast PR checks

`.github/workflows/frontend-pr-checks.yml` chạy:

1. ESLint;
2. TypeScript;
3. Vitest;
4. production build;
5. Playwright smoke ở một job riêng.

Các bước này không checkout hoặc khởi động backend.

### Full-stack E2E

`.github/workflows/fullstack-e2e.yml` chạy khi:

- push vào FE `main`;
- lịch nightly lúc 02:00 Asia/Ho_Chi_Minh;
- chạy tay với hai input `frontend_ref` và `backend_ref`.

Một runner checkout source vào hai thư mục:

```text
$GITHUB_WORKSPACE/frontend
$GITHUB_WORKSPACE/backend
```

Runner tạo PostgreSQL 16 và Redis 8.8 service containers, khởi động Spring Boot,
chờ `/actuator/health`, rồi chạy Playwright. SHA thực tế của hai repository được
ghi vào Job Summary. HTML report và `backend.log` luôn được upload; trace và
screenshot được kèm khi test fail. Các artifact được giữ bảy ngày để debug.
Full-stack race test đặt `PLAYWRIGHT_RETRIES=0`: nếu invariant hỏng thì job phải đỏ
ngay, không được biến thành một kết quả xanh nhờ retry.

Backend `backend-ci.yml` không cần sửa: `clean verify` đã chạy JUnit và
Testcontainers. Full-stack workflow thuộc FE vì Playwright và hành vi người dùng
được sở hữu ở FE.

### Vì sao chưa tạo repository thứ ba

Hiện chỉ có một FE và một BE, còn suite browser phụ thuộc trực tiếp vào UI nên đặt
cùng FE giúp refactor selector/luồng checkout và test trong cùng pull request. Một
repository E2E riêng sẽ thêm một version cần đồng bộ, thêm quyền checkout/CI và làm
mờ người chịu trách nhiệm khi contract thay đổi, nhưng không giải quyết thêm vấn
đề kỹ thuật nào mà workflow checkout hai repository chưa giải quyết được.

Chỉ nên cân nhắc repository test riêng khi cùng một bộ acceptance test phục vụ
nhiều frontend/mobile và nhiều service, có lịch phát hành độc lập, hoặc có một đội
QA/platform sở hữu hẳn môi trường và pipeline đó.

## 6. Token checkout repository private

`GITHUB_TOKEN` chỉ có quyền với repository đang chạy workflow. Tạo một fine-grained
personal access token:

1. chỉ chọn repository backend `VelaWear_BE` (workflow đã checkout FE bằng quyền sẵn có của chính repository FE);
2. cấp duy nhất quyền `Contents: read`;
3. lưu vào secret `CROSS_REPO_READ_TOKEN` của repository FE;
4. không đưa token vào `.env`, source code, log hoặc Playwright artifact.

Không dùng `pull_request_target` để chạy source không tin cậy. Full-stack suite
không chạy trên mọi PR; khi cần kiểm tra hai branch phối hợp, dùng workflow manual
và truyền rõ hai ref.

## 7. Đọc lỗi CI

| Triệu chứng | Nơi kiểm tra đầu tiên |
| --- | --- |
| Backend không lên `UP` | `backend.log`, datasource/Redis/JWT environment |
| Login được nhưng refresh thất bại | FE/API có cùng hostname `localhost`, cookie trong trace |
| Login trả `500`, signer không hỗ trợ HS512 | JWT secret phải dài tối thiểu 64 byte; dùng đúng key local trong mục 3 |
| Không checkout được BE | Secret `CROSS_REPO_READ_TOKEN` và quyền `Contents: read` |
| Test checkout không thấy cart | API fixture, SKU seed và access token |
| Test tỉnh/phường gọi internet | Playwright route fixture cho `provinces.open-api.vn` |
| Smoke chỉ pass sau retry | Tìm nguồn flaky; full-stack race suite cố ý không retry và chạy `workers=1` |

Không sửa test bằng cách tăng timeout hoặc thêm `sleep` trước khi xác định nguyên
nhân. Race test phải dùng barrier/deferred promise và assert trạng thái cuối cùng.

## 8. Checklist khi thêm test mới

- Xác định invariant thuộc FE, BE hay contract full-stack.
- Ưu tiên Vitest/JUnit cho logic; chỉ dùng Playwright cho hành vi browser có giá trị.
- Không gọi payment, email, OAuth hoặc API bên thứ ba thật trong CI.
- Dùng fixture deterministic và cleanup được.
- Gắn tag `@smoke` hoặc `@fullstack` rõ ràng.
- Kiểm tra cả số lần gọi API lẫn kết quả người dùng nhìn thấy.
- Cập nhật tài liệu này và `docs/PROJECT_STATUS.md` sau khi verification thực sự pass.

Chi tiết các invariant transaction, Redis CAS, checkout idempotency và SePay IPN
được ghi ở tài liệu `docs/RACE_CONDITION_TESTING_VI.md` của repository backend.
