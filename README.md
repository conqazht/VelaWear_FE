# Vela Wear Frontend

Giao diện thương mại điện tử thời trang cao cấp — xây dựng trên **Next.js 16 App Router**, **React 19**, **TypeScript**, **TanStack Query**, **Zustand**, **Tailwind CSS 4**, **Vitest** và **Playwright**.

## Yêu cầu hệ thống (Prerequisites)

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | **24** | Đồng bộ CI |
| pnpm | **11.5.2** | Đồng bộ CI |

## Cài đặt và khởi chạy

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
```

File `.env.local` cần khai báo hai biến public:

- `NEXT_PUBLIC_API_URL` — URL gốc của Backend API (bao gồm `/api/v1`)
- `NEXT_PUBLIC_BACKEND_ORIGIN` — Origin của Backend (dùng cho CORS/cookie)

> **Lưu ý:** Không commit giá trị thật vào repository. Xem `.env.example` để biết tên biến.

Khởi chạy development server:

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Cấu trúc route chính (Entrypoints)

| Route group | Entrypoint | Mô tả |
|---|---|---|
| Storefront (shop) | `app/(shop)/page.tsx` | Trang chủ cửa hàng |
| Admin dashboard | `app/(admin)/dashboard/` | Bảng điều khiển quản lý |
| Authentication | `app/(auth)/` | Đăng nhập, đăng ký, OAuth |

## Kiểm tra chất lượng (CI-equivalent)

Các lệnh dưới đây tương đương pipeline CI trên GitHub Actions:

```bash
# Lint (ESLint)
pnpm exec eslint . --max-warnings 25

# Kiểm tra kiểu TypeScript
pnpm exec tsc --noEmit

# Unit test (Vitest)
pnpm test:unit

# Production build
pnpm build
```

## Kiểm thử Playwright

### Smoke test (không cần backend)

```bash
pnpm test:e2e:smoke
```

### Full-stack test (cần backend)

Full-stack test yêu cầu Backend Spring Boot, PostgreSQL và Redis đang chạy:

```bash
pnpm test:e2e:fullstack
```

Xem [hướng dẫn Playwright và CI full-stack bằng tiếng Việt](./docs/PLAYWRIGHT_CI_VI.md) để biết cách cấu hình hai repository chạy đồng thời và thiết lập GitHub Actions.

## Tài liệu dự án

| Tài liệu | Mô tả |
|---|---|
| [Quy ước tích hợp Frontend & Backend](./convention.md) | API contract, auth flow, chuẩn request/response |
| [Trạng thái dự án](./docs/PROJECT_STATUS.md) | Lịch sử thay đổi và trạng thái hiện tại |
| [Playwright và CI](./docs/PLAYWRIGHT_CI_VI.md) | Hướng dẫn test E2E và CI hai repository |
| [Hướng dẫn i18n Admin](./docs/I18N_ADMIN_GUIDE_VI.md) | Quản lý nội dung đa ngôn ngữ phía Admin |
| [Sale Campaign Frontend](./docs/SALE_CAMPAIGN_FRONTEND.md) | Nghiệp vụ và cấu trúc code Sale/Flash Sale |
| [Storefront Catalog UX](./docs/STOREFRONT_CATALOG_UX_FRONTEND_VI.md) | Collection, Search, Size Guide, review, lỗi |
| [Lộ trình shadcn/improve](./plans/README.vi.md) | Roadmap cải tiến theo đợt (wave) |
