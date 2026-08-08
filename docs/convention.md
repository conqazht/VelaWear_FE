# Hướng Dẫn Quy Ước Tích Hợp Frontend & Backend (Vela Wear)

Tài liệu này định nghĩa các quy ước và tiêu chuẩn tích hợp giữa **Frontend (Next.js 16)** và **Backend (Spring Boot)** nhằm đảm bảo tính đồng bộ, hiệu năng và bảo mật cho toàn bộ dự án **Vela Wear**.

---

## 1. Địa Chỉ API (Base URL) & Định Dạng Đường Dẫn

- **Biến môi trường:** Frontend đọc base URL từ `NEXT_PUBLIC_API_URL`, mặc định `http://localhost:8080/api/v1`. Giá trị này **đã bao gồm** tiền tố `/api/v1`.
- **Cấu hình Axios client:** `lib/api-client.ts` dùng `baseURL` từ biến trên; mọi path tương đối (ví dụ `/products`, `/auth/login`) được nối vào base URL đã có `/api/v1`.
- **Quy ước đặt tên URL (URL Path Naming):**
  - Sử dụng **danh từ số nhiều** cho các tài nguyên (resources).
  - Sử dụng định dạng **kebab-case** (chữ thường, phân tách bằng dấu gạch ngang) cho các path gồm nhiều từ.
  - Ví dụ:
    - Danh sách sản phẩm: `/api/v1/products`
    - Biến thể sản phẩm: `/api/v1/product-variants`
    - Địa chỉ người dùng: `/api/v1/user-addresses`
    - Lịch sử trạng thái đơn hàng: `/api/v1/orders/{id}/status-histories`
- **Customer self-scoped API:** Các endpoint customer không truyền `userId`; backend xác định ownership từ access token. Ví dụ:
  - Profile: `PUT /users/me`
  - Đơn hàng: `GET /orders/me`, `GET /orders/me/{code}`
  - Địa chỉ: `GET /user-addresses/me`, `POST /user-addresses/me`, `PUT /user-addresses/me/{id}`

---

## 2. Định Dạng Phản Hồi Chuẩn Của API (API Response Format)

Tất cả các API từ Backend đều trả về một cấu trúc bọc chung (`ApiResponse<T>`) ở dạng JSON. Frontend khai báo type tại `lib/api/types.ts`.

### 2.1. Cấu Trúc Khai Báo TypeScript (API Response Interface)

```typescript
type ApiResponse<T> = {
  statusCode: number;      // Mã trạng thái HTTP (200, 201, 400, 401, 403, 404, 500, v.v.)
  data: T;                 // Dữ liệu payload thực tế
  message: string;         // Thông điệp hiển thị (display-only, không dùng để điều khiển logic)
  code?: string;           // Mã lỗi ổn định (stable error code) để điều khiển logic phía client
  error?: string;          // Chi tiết lỗi bổ sung (nếu có)
  timestamp?: string;      // Thời gian phản hồi theo định dạng ISO-8601
};
```

> **Lưu ý:** Trường `message` chỉ dùng để hiển thị cho người dùng. Luồng logic phía frontend (ví dụ: retry, redirect, hiển thị lỗi cụ thể) phải dựa vào `statusCode` và `code` (khi có) thay vì substring match trên `message`.

### 2.2. Phản Hồi Thành Công (Success Response)

- **Phương thức GET/PUT/PATCH/DELETE thành công (HTTP 200):**
  ```json
  {
    "statusCode": 200,
    "data": { "..." },
    "message": "Success",
    "timestamp": "2026-06-27T16:13:00.000"
  }
  ```
- **Phương thức POST tạo mới thành công (HTTP 201):**
  ```json
  {
    "statusCode": 201,
    "data": { "..." },
    "message": "Created",
    "timestamp": "2026-06-27T16:13:00.000"
  }
  ```

### 2.3. Unwrap helper

Frontend dùng `unwrapApiResponse()` từ `lib/api/client.ts` để trích xuất `data` từ `ApiResponse`. Mọi API helper (`apiGet`, `apiPost`, `apiPut`, `apiDelete`) đều tự động unwrap.

---

## 3. Phân Trang & Sắp Xếp Dữ Liệu (Pagination & Sorting)

Khi gọi các API lấy danh sách dạng trang (paginated list như `/api/v1/products`), Backend sử dụng cơ chế phân trang của Spring Data.

### 3.1. Tham Số Truy Vấn Phân Trang (Query Parameters)

Frontend gửi các query parameters sau lên Backend:

| Tham số | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | **Chỉ mục trang bắt đầu từ 1** (Trang 1 là trang đầu tiên). *Lưu ý: Backend đã cấu hình `one-indexed-parameters: true` nên Frontend tuyệt đối không gửi trang đầu là `0`.* |
| `size` | `number` | `10` | Số lượng phần tử hiển thị trên một trang. |
| `sort` | `string` | Không có | Cú pháp sắp xếp của Spring: `tênThuộcTính,hướngSắpXếp` (Ví dụ: `createdAt,desc` hoặc `price,asc`). Thuộc tính viết theo kiểu camelCase của Java. |

### 3.2. Cấu Trúc Phản Hồi Phân Trang (Paginated Response)

Khi dữ liệu được phân trang, thuộc tính `data` trong `ApiResponse` sẽ có cấu trúc `ResultPaginationDTO` như sau:

```typescript
type ResultPaginationDTO<T> = {
  meta: {
    page: number;        // Trang hiện tại (1-indexed)
    pageSize: number;    // Số lượng phần tử mỗi trang
    pages: number;       // Tổng số trang
    total: number;       // Tổng số bản ghi trên hệ thống
  };
  result: T[];           // Danh sách dữ liệu của trang hiện tại
};
```

**Ví dụ thực tế phản hồi phân trang:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "timestamp": "2026-06-27T16:13:00.000",
  "data": {
    "meta": {
      "page": 1,
      "pageSize": 10,
      "pages": 5,
      "total": 48
    },
    "result": [
      {
        "id": 1,
        "name": "Linen Blend Blazer",
        "slug": "linen-blend-blazer",
        "categoryId": 2,
        "brandId": 1,
        "status": "ACTIVE"
      }
    ]
  }
}
```

---

## 4. Xử Lý Lỗi & Xác Thực Dữ Liệu (Error & Validation Handling)

### 4.1. Lỗi Xác Thực Form (Validation Error - HTTP 400)

Khi Frontend gửi dữ liệu không hợp lệ (ví dụ: thiếu email, sai định dạng mật khẩu), Backend sẽ trả về mã `400 Bad Request` kèm theo chi tiết lỗi của từng trường trong trường `data`:

```json
{
  "statusCode": 400,
  "data": {
    "email": "Email must be a valid email address",
    "password": "Password must be at least 8 characters"
  },
  "message": "Validation failed",
  "timestamp": "2026-06-27T16:13:00.000"
}
```

**Quy tắc xử lý phía FE:** Đọc thuộc tính `data` khi nhận lỗi `400` để hiển thị thông báo lỗi tương ứng bên dưới từng ô nhập liệu của form.

### 4.2. Các Mã Lỗi Hệ Thống Phổ Biến

| HTTP Status | statusCode | Ý nghĩa | Cách xử lý phía Frontend |
| :--- | :--- | :--- | :--- |
| **400 Bad Request** | `400` | Sai cú pháp request hoặc Lỗi Validation dữ liệu | Hiển thị lỗi form hoặc thông báo lỗi chung từ trường `message`. |
| **401 Unauthorized** | `401` | Token hết hạn, không hợp lệ hoặc thiếu Token xác thực | Tự động thử refresh token (single-flight). Nếu refresh thất bại, chuyển hướng tới `/sign-in`. |
| **403 Forbidden** | `403` | Người dùng không có quyền truy cập endpoint này | Hiển thị thông báo hoặc trang báo lỗi không có quyền truy cập. |
| **404 Not Found** | `404` | Tài nguyên không tồn tại hoặc đã bị xóa mềm | Hiển thị trang 404 hoặc thông báo không tìm thấy bản ghi. |
| **409 Conflict** | `409` | Trùng lặp dữ liệu (ví dụ trùng Email đăng ký) | Thông báo cho người dùng giá trị nhập vào đã tồn tại. |
| **429 Too Many Requests** | `429` | Rate limit đã đạt | Đọc `Retry-After` từ response body hoặc header (đơn vị: **giây**). React Query tự động retry sau thời gian chỉ định; bỏ qua retry nếu chờ > 300 giây. |
| **500 Internal Error**| `500` | Lỗi máy chủ không mong muốn | Hiển thị thông báo "Đã có lỗi xảy ra từ máy chủ, vui lòng thử lại sau". |

### 4.3. Stable Error Codes (`code` field)

Một số response bao gồm trường `code` (stable error code) để frontend xử lý logic mà không phụ thuộc vào nội dung `message`. Ví dụ:

| `code` | Ngữ cảnh | Frontend action |
|---|---|---|
| `OTP_EXPIRED` | OTP verify | Hiển thị "Mã đã hết hạn, vui lòng yêu cầu mã mới" |
| `OTP_MAX_ATTEMPTS` | OTP verify | Disable form, hiển thị thông báo vượt giới hạn |
| `PRICING_CHANGED` | Checkout | Hiển thị giá mới, yêu cầu xác nhận lại |
| `ITEM_OUT_OF_STOCK` | Checkout | Refresh cart, hiển thị sản phẩm hết hàng |

---

## 5. Cơ Chế Xác Thực & Quản Lý Token (Authentication & JWT Flow)

Hệ thống xác thực của Vela Wear sử dụng hai loại token: **Access Token** (ngắn hạn - 15 phút) và **Refresh Token** (dài hạn - 3 ngày).

### 5.1. Luồng Đăng Nhập & Lưu Trữ Token

1. **Đăng nhập:** FE gửi yêu cầu đăng nhập qua `POST /auth/login`.
2. **Nhận Token:** Backend phản hồi thành công và trả về thông tin token trong body đồng thời thiết lập Cookie:
   - **Access Token:** Nằm trong JSON body (`data.accessToken`). FE lưu trữ token này **trong bộ nhớ JavaScript** (biến module-scope trong `lib/api-client.ts`). **Không dùng** localStorage, sessionStorage hay cookie phía client.
   - **Refresh Token:**
     - Backend tự động thiết lập Cookie có tên là `refresh_token` trong tiêu đề phản hồi HTTP:
       `Set-Cookie: refresh_token=<token>; HttpOnly; Path=/api/v1/auth; SameSite=Lax; Max-Age=259200`
     - **Quan trọng:** Do cookie này có cấu hình `HttpOnly` và bị giới hạn đường dẫn truy cập (`Path=/api/v1/auth`), mã JavaScript phía Frontend **không thể đọc hoặc sửa** cookie này. Browser sẽ tự động đính kèm cookie này khi gửi các request tới các endpoint thuộc `/auth/*` (như `/auth/refresh` và `/auth/logout`).
3. **Gọi API được bảo vệ:** Các API yêu cầu xác thực bắt buộc phải đính kèm Access Token vào header dưới định dạng:
   ```text
   Authorization: Bearer <accessToken>
   ```
4. **Axios client:** `lib/api-client.ts` cấu hình `withCredentials: true` để tự động gửi/nhận cookie chứa refresh token.

### 5.2. Luồng Tự Động Làm Mới Token (Single-flight Refresh)

Khi Access Token hết hạn (hoặc khi gọi API nhận lỗi `401 Unauthorized`):

1. Interceptor Axios bắt lỗi 401 và kiểm tra nếu đã có `refreshPromise` đang chạy thì tái sử dụng (single-flight) thay vì gửi nhiều request refresh đồng thời.
2. Gửi `POST /auth/refresh` (browser tự động gửi cookie `refresh_token`).
3. **Session generation guard:** Nếu auth session thay đổi trong khi refresh đang chạy (ví dụ: user đã logout ở tab khác), refresh bị reject để không ghi đè token mới.
4. Nếu thành công, Backend trả về Access Token mới; FE cập nhật biến in-memory và retry request ban đầu.
5. Nếu thất bại (401), chuyển hướng tới `/sign-in` với return path.

### 5.3. Web Lock Session Serialization

`lib/api-client.ts` sử dụng `navigator.locks.request("vela-auth-session", ...)` (Web Lock API) để tuần tự hóa login, refresh, và logout giữa các tab cùng origin. Điều này ngăn race condition khi nhiều tab đồng thời cố gắng refresh hoặc logout, tránh ghi đè refresh cookie của nhau.

### 5.4. Luồng Đăng Xuất (Logout)

- Gọi `POST /auth/logout` qua `logoutAuthSession()` trong `lib/api-client.ts`.
- Logout gửi Bearer hiện tại để backend blacklist access token. Nếu token đã hết hạn và bị chặn 401, retry đúng một lần không Bearer để vẫn thu hồi cookie/session.
- Frontend xóa Access Token in-memory, clear auth query cache, clear cart state, và chuyển hướng về `/sign-in`.

---

## 6. Định Dạng Casing & Kiểu Dữ Liệu (Casing & Data Models)

- **JSON Body:** Tất cả các thuộc tính truyền lên (Request Body) hoặc nhận về (Response Body) đều sử dụng **camelCase** (Ví dụ: `fullName`, `birthDate`, `categoryId`, `originalPrice`, `createdFrom`).
- **Thời gian (Date & Time):**
  - Ngày tháng không kèm giờ (Ví dụ: sinh nhật): Định dạng chuỗi `YYYY-MM-DD` (Ví dụ: `"2000-01-01"`).
  - Ngày giờ hệ thống (Ví dụ: ngày tạo, cập nhật): Định dạng chuỗi ISO-8601 UTC (Ví dụ: `"2026-06-27T16:13:00.000Z"`).
- **ID của thực thể:** Tất cả các ID của bản ghi dữ liệu (sản phẩm, người dùng, đơn hàng...) đều là kiểu **số nguyên dài (Long/number)**, không phải chuỗi ký tự (slug/string).
  - Ví dụ: `id: 12` thay vì `id: "linen-blazer"`. Slug chỉ dùng để tạo URL thân thiện người dùng và truy vấn động.

### 6.1. Một Số Kiểu Dữ Liệu TypeScript Tham Khảo (DTOs Mapping)

```typescript
// Tài khoản Người dùng (User Response)
interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  avatar: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  roles?: Array<{ id: number; name: string }>;
}

// Danh mục sản phẩm (Category Response)
interface CategoryResponse {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

// Sản phẩm (Product Response)
interface ProductResponse {
  id: number;
  categoryId: number;
  brandId: number;
  name: string;
  slug: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

// Địa chỉ giao hàng (User Address Response)
interface UserAddressResponse {
  id: number;
  userId: number;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}
```

---

## 7. Kiến Trúc Client HTTP (API Client Architecture)

Mã nguồn chính xác nằm tại `lib/api-client.ts` và `lib/api/client.ts`. Tài liệu này chỉ mô tả contract và flow; **không** chứa implementation thứ hai để tránh drift.

### 7.1. Cấu trúc module

| File | Vai trò |
|---|---|
| `lib/api-client.ts` | Axios instance, interceptor, in-memory token, Web Lock, refresh, logout |
| `lib/api/client.ts` | Helper `unwrapApiResponse`, `apiGet`, `apiPost`, `apiPut`, `apiDelete` |
| `lib/api/types.ts` | `ApiResponse<T>`, `ResultPaginationDTO<T>`, domain DTO types |
| `lib/api/errors.ts` | `extractRetryAfterSeconds`, `getQueryRetryDelayMs` |
| `lib/api/server.ts` | Server-side fetch wrapper (RSC data fetching) |

### 7.2. Nguyên tắc chính

- Access token **chỉ** lưu in-memory (biến module-scope), không localStorage/sessionStorage.
- Refresh token là HttpOnly cookie, JavaScript không đọc được.
- Single-flight refresh: chỉ một request refresh tại một thời điểm, các interceptor khác chờ cùng promise.
- Web Lock `vela-auth-session` tuần tự hóa login/refresh/logout giữa các tab.
- Session generation guard ngăn stale refresh response ghi đè token sau logout.
- `Retry-After` (đơn vị giây) từ response body hoặc header được React Query tự động xử lý trong `retryDelay`.

---

*Tài liệu quy ước này là cơ sở cho việc phát triển và tích hợp giao diện. Vui lòng thảo luận và cập nhật tài liệu này nếu có bất kỳ sự thay đổi nào từ phía API Backend.*
