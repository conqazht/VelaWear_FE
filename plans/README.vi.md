# Lộ trình triển khai Frontend

> Được tạo từ đợt audit của **shadcn/improve skill v1.0.0** ngày 2026-07-16.
> Các file tiếng Anh trong `plans/` là **canonical execution context** để Codex
> thực thi trực tiếp, không dùng `improve execute`. Bản tiếng Việt nằm trong
> [`plans/vi/`](vi/) để đọc và đối chiếu; các thuật ngữ IT quan trọng được giữ
> nguyên.

## Baseline lập kế hoạch

- Repository: `coqanklazy/VelaWear_FE`
- Planned at: commit `ff217af` trên `main`
- Planning branch: `docs/shadcn-improve-plans`
- Phải merge PR tài liệu này vào `main` trước khi tạo implementation branch.
- Trạng thái chỉ được cập nhật tại [`plans/README.md`](README.md) để tránh
  English/Vietnamese translation drift.
- Branch creation, commit, push và PR đều cần explicit operator authorization.
  Commit message/thứ tự trong plan chỉ là recommendation, không phải quyền ghi.
  Operator có thể authorize cả ordered workflow, nhưng executor phải xác nhận
  instruction đó vẫn còn hiệu lực trước Git/GitHub write.

Mỗi executor phải đọc trọn plan tiếng Anh, chạy drift check, tuân thủ STOP
conditions và dùng đúng branch đã chỉ định. Sau khi bạn merge một PR, Codex mới
fetch và fast-forward `main`, kiểm tra clean worktree rồi tạo branch kế tiếp.
Không stack dependent branch trên một PR chưa merge.

## Reconcile dependency drift bắt buộc

Plan sau cố ý phụ thuộc PR trước nên thường sẽ thấy thay đổi so với planned-at
SHA ban đầu. Trước khi sửa source, chạy drift check của plan trên `main` hiện
tại. Nếu in-scope path thay đổi, phải đối chiếu toàn bộ live symbol/citation rồi
cập nhật canonical English plan, mirror tiếng Việt, exact scope/test name và
`Planned at` SHA sang `main` hiện tại **trước khi code**. Commit phần reconcile
trong implementation PR trước source change, hoặc bằng docs-only commit ngay
trước đó. Hai file plan là ngoại lệ pre-implementation của source-file allowlist.
Trong mọi implementation PR, `docs/PROJECT_STATUS.md` là workflow-metadata
exception bắt buộc duy nhất theo repository `AGENTS.md`; chỉ cập nhật branch,
outcome và verification evidence thật của plan đó. Status trong
`plans/README.md` do reviewer/operator cập nhật sau khi xác nhận merge; executor
không sửa chỉ để tick Done criteria. Không execute stale plan hoặc mặc định
dependency drift là an toàn.

## Thứ tự thực hiện và trạng thái

| ID | Kế hoạch tiếng Việt | Branch | Priority | Effort | Dependency | Wave | Status canonical |
|---|---|---|---:|---:|---|---:|---|
| FE-001 | [Chuyển sang customer API self-scoped](vi/001-migrate-to-self-scoped-customer-apis.vi.md) | `fix/self-scoped-customer-apis` | P1 | L | BE-001 | 1 | [xem English index](README.md#execution-order-and-status) |
| FE-002 | [Bảo toàn review multipart request](vi/002-preserve-review-multipart-requests.vi.md) | `fix/review-multipart-transport` | P1 | M | FE-001 | 2 | [xem English index](README.md#execution-order-and-status) |
| FE-003 | [Cô lập cart theo account và harden logout](vi/003-isolate-cart-by-account-and-harden-logout.vi.md) | `fix/cart-session-isolation` | P1 | L | FE-002 | 2 | [xem English index](README.md#execution-order-and-status) |
| FE-004 | [Hợp nhất account settings và hydration](vi/004-consolidate-account-settings-and-hydration.vi.md) | `fix/account-settings-integrity` | P1 | L | FE-001 | 2 | [xem English index](README.md#execution-order-and-status) |
| FE-005 | [Tuân thủ rate-limit Retry-After](vi/005-honor-rate-limit-retry-after.vi.md) | `fix/rate-limit-retry-after` | P2 | M | FE-003 và BE-005 | 2 | [xem English index](README.md#execution-order-and-status) |
| FE-006 | [Giới hạn shop provider vào shop route](vi/006-scope-shop-providers-to-shop-routes.vi.md) | `perf/shop-provider-scope` | P2 | M | FE-003 | 3 | [xem English index](README.md#execution-order-and-status) |
| FE-007 | [Dùng wishlist product summary](vi/007-consume-wishlist-product-summaries.vi.md) | `perf/wishlist-summary-client` | P2 | M | FE-006 và BE-009 | 3 | [xem English index](README.md#execution-order-and-status) |
| FE-008 | [Load profile data theo nhu cầu](vi/008-load-profile-data-on-demand.vi.md) | `perf/profile-demand-loading` | P2 | M | FE-001, FE-004 | 3 | [xem English index](README.md#execution-order-and-status) |
| FE-009 | [Characterization hành vi profile page](vi/009-characterize-profile-page-behavior.vi.md) | `test/profile-characterization` | P2 | M | FE-004, FE-008 | 4 | [xem English index](README.md#execution-order-and-status) |
| FE-010 | [Tách nhỏ profile page](vi/010-decompose-profile-page.vi.md) | `refactor/profile-page` | P3 | L | FE-009 | 4 | [xem English index](README.md#execution-order-and-status) |
| FE-011 | [Tách i18n message namespace](vi/011-split-i18n-message-namespaces.vi.md) | `perf/i18n-message-splitting` | P3 | L | FE-001–FE-010 | 5 | [xem English index](README.md#execution-order-and-status) |
| FE-012 | [Dọn dependency và tài liệu Frontend](vi/012-clean-frontend-dependencies-and-docs.vi.md) | `chore/frontend-maintenance-docs` | P3 | M | FE-001–FE-011 và external BE-015 | 5 | [xem English index](README.md#execution-order-and-status) |

Xem trạng thái `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED` hoặc `REJECTED` tại
index tiếng Anh canonical.

## Cross-repository sequence bắt buộc

Phần authorization phải đi theo thứ tự **expand → migrate → revoke**:

1. BE-001 thêm endpoint `/me` có ownership binding và tạm giữ legacy route.
2. FE-001 chuyển customer call sang self-scoped contract mới.
3. BE-002 mới gỡ quyền `ROLE_USER` khỏi generic user-ID route.

Đảo thứ tự có thể làm Frontend hỏng hoặc tiếp tục để lại lỗ hổng IDOR.

## Các wave

| Wave | Thứ tự | Checkpoint bắt buộc |
|---:|---|---|
| 0 | PR plan Backend → PR plan Frontend | Cả hai đã merge; hai `main` clean và đồng bộ |
| 1 | BE-001 → FE-001 → BE-002 | Backend verify, Frontend CI suite, full-stack ownership smoke |
| 2 | FE-002 → BE-003 → FE-003 → BE-004 → BE-005 → FE-004 → FE-005 | Backend verify, Frontend CI suite, full-stack security/correctness smoke |
| 3 | BE-006 → BE-007 → BE-008 → BE-009 → FE-006 → FE-007 → FE-008 | Full test, full-stack smoke, query-count assertions |
| 4 | BE-010 → BE-011 → BE-012 → BE-013 → BE-014 → FE-009 → FE-010 | Full regression và full-stack smoke |
| 5 | FE-011 → BE-015 → FE-012 | Final Backend verify, Frontend CI suite, full-stack smoke |

## Preflight trước mỗi PR

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git switch -c <branch-trong-plan>
```

Kết quả bắt buộc: clean worktree, `HEAD` bằng `origin/main`, branch mới xuất
phát từ commit đó. Nếu sai, STOP; không tự stash, reset hoặc ghi đè.

## Verification gate chuẩn

```powershell
pnpm exec eslint . --max-warnings 25
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm test:unit
pnpm build
```

Tất cả lệnh phải exit 0, test pass và production build thành công. Cuối mỗi
wave phải dispatch `.github/workflows/fullstack-e2e.yml` với cả hai ref là
`main`; nếu merge cuối là Backend PR thì cần manual dispatch.

## Phân loại findings

Toàn bộ finding Frontend được shadcn/improve chấp nhận cùng companion migration
authorization đều đã được ánh xạ. Các phần dùng chung auth-state invariant được
gom; provider optimization và profile decomposition được tách thành phase có
verification độc lập.

Audit ban đầu có 12 nhóm finding Frontend và kết quả vẫn là 12 plan triển khai.
Sau khi thêm authorization-migration companion, số lượng được cân bằng bằng
việc gom cart/logout, settings/hydration, maintenance; đồng thời tách
provider/wishlist và profile characterization/decomposition thành phase có thể
verify độc lập.
