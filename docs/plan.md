# FE API Integration Plan

## Summary

Tài liệu này định hướng migration frontend để match với các API đã xây dựng ở backend, đồng thời tích hợp đúng vai trò các thư viện mới nhất:

- `Next.js`: render, SSR/RSC, SEO, cached public catalog data.
- `TanStack Query`: server state, auth/session, refetch, mutation, invalidation, optimistic update.
- `Zustand`: local/client state như guest cart, UI state, temporary filters.
- `React Hook Form + Zod`: form state và validation theo request DTO của backend.

Một câu chốt dễ nhớ:

```text
Next.js để render.
TanStack Query để sync dữ liệu server.
Zustand để giữ state local.
React Hook Form + Zod để quản lý và validate form.
```

## Key Changes

Cài dependencies latest đã kiểm tra từ npm:

```bash
pnpm add @tanstack/react-query@5.101.2 zustand@5.0.14 react-hook-form@7.81.0 zod@4.4.3 @hookform/resolvers@5.4.0
```

Giữ `axios` client hiện tại cho client-side authenticated API, vì FE đã có `api-client.ts` với `baseURL`, `withCredentials`, access token memory và refresh token interceptor.

Bổ sung server-side API helper dùng native `fetch` cho dữ liệu public cần Next.js cache:

- `products`
- `categories`
- `brands`
- `colors`
- `sizes`
- `product-variants`

Tạo type nền chung cho response backend:

```ts
type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
  error?: string;
};

type ResultPaginationDTO<T> = {
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
};
```

Tạo API modules theo backend controllers:

- `auth`
- `products`
- `categories`
- `brands`
- `colors`
- `sizes`
- `productVariants`
- `carts`
- `wishlists`
- `orders`
- `payments`
- `users`
- `userAddresses`
- `reviews`

## Implementation Plan

Thêm `QueryProvider` vào root layout và cấu hình `QueryClient`:

```ts
staleTime: 5 * 60 * 1000;
gcTime: 30 * 60 * 1000;
retry: 1;
refetchOnWindowFocus: false;
```

Migrate auth sang TanStack Query:

- Dùng `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`, `/auth/me`.
- Không persist access token hoặc user trong Zustand.
- Sau login, register, logout, profile update phải invalidate session query.

Migrate form sang `React Hook Form + Zod`:

- Login form.
- Register form.
- Checkout form.
- Profile settings form.
- Address form.
- Review form.
- Schema FE phải mirror các request DTO từ backend ở mức field, required rule và error message UX.

Xử lý catalog:

- Product listing/detail render ban đầu bằng Next.js server fetch để tốt cho SEO.
- Filter/sort/pagination động trên client dùng TanStack Query.
- Query key phải stable, ví dụ `["products", filters]`, `["product", id]`.

Xử lý cart:

- Guest cart dùng Zustand persist với key `vela-cart-v1`.
- Authenticated cart chỉ sync với backend khi endpoint đủ dữ liệu cần thiết.
- Hiện backend có `/api/v1/carts`, `/api/v1/carts/user/{userId}`, nhưng chưa thấy cart item mutation endpoint rõ ràng, nên không ép toàn bộ cart vào TanStack Query ở phase đầu.

Xử lý favorites/wishlist:

- Vì backend đã có `/api/v1/wishlists`, favorites là server state và yêu cầu đăng nhập.
- Dùng TanStack Query cho list/add/remove wishlist.
- Zustand chỉ giữ UI state nếu cần, không giữ wishlist chính.

Xử lý checkout:

- Form checkout dùng React Hook Form + Zod.
- Tạo order qua `/api/v1/orders`.
- Tạo payment qua `/api/v1/payments` nếu flow backend yêu cầu tách payment.
- Sau checkout success invalidate `orders`, `cart`, `payments` liên quan.

## API Mapping

Nhóm auth/session:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

Nhóm catalog public:

- `GET /api/v1/products`
- `GET /api/v1/products/{id}`
- `GET /api/v1/categories`
- `GET /api/v1/brands`
- `GET /api/v1/colors`
- `GET /api/v1/sizes`
- `GET /api/v1/product-variants`

Nhóm user commerce:

- `GET /api/v1/carts/user/{userId}`
- `POST /api/v1/carts`
- `DELETE /api/v1/carts/{id}`
- `GET /api/v1/wishlists`
- `POST /api/v1/wishlists`
- `DELETE /api/v1/wishlists/{id}`
- `POST /api/v1/orders`
- `GET /api/v1/orders/user/{userId}`
- `GET /api/v1/orders/code/{orderCode}`
- `POST /api/v1/payments`
- `GET /api/v1/user-addresses`
- `POST /api/v1/user-addresses`
- `PUT /api/v1/user-addresses/{id}`
- `DELETE /api/v1/user-addresses/{id}`
- `POST /api/v1/reviews`

## State Ownership Rules

`Next.js` dùng cho dữ liệu cần có ngay khi page load từ server, tốt cho SEO hoặc có thể cache ở tầng render/server.

`TanStack Query` dùng cho dữ liệu đến từ backend và thay đổi trong lúc người dùng tương tác, đặc biệt là auth session, profile, wishlist, orders, checkout mutations, refetch và invalidate sau mutation.

`Zustand` dùng cho state local không nhất thiết map trực tiếp với API response, ví dụ guest cart, notification UI, drawer state, temporary filters.

`React Hook Form + Zod` dùng cho form input state, validation, schema parsing và message lỗi trước khi gửi request lên backend.

## Test Plan

- Chạy `pnpm lint`.
- Chạy `pnpm build`.
- Test login, register, logout, refresh session và reload page.
- Test `/auth/me` không refetch liên tục khi remount trong `staleTime`.
- Test product listing/detail render được khi JS client chưa tương tác.
- Test filter/sort/pagination refetch đúng query key.
- Test guest cart persist sau reload.
- Test wishlist bắt login và invalidate đúng sau add/remove.
- Test checkout tạo order thành công và UI cập nhật không cần hard refresh.

## Assumptions

- Scope phase đầu là customer storefront của `commercial-fe`, chưa làm admin/RBAC UI dù backend có roles, permissions, users management.
- Backend base URL tiếp tục dùng `NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"`.
- Refresh token nằm trong HttpOnly cookie, access token chỉ giữ trong memory qua `api-client.ts`.
- `plan.md` nằm tại `D:\CANH\Java\side project\commercial-fe\plan.md`.
