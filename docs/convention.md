# Hướng Dẫn Quy Ước Tích Hợp Frontend & Backend (Vela Wear)

Tài liệu này định nghĩa các quy ước và tiêu chuẩn tích hợp giữa **Frontend (Next.js 16)** và **Backend (Spring Boot)** nhằm đảm bảo tính đồng bộ, hiệu năng và bảo mật cho toàn bộ dự án **Vela Wear**.

---

## 1. Địa Chỉ API (Base URL) & Định Dạng Đường Dẫn

- **Địa chỉ gọi API (Base URL):**
  - Môi trường Phát triển (Development): `http://localhost:8080/api`
  - Môi trường Production: `https://api.example.com/api` (hoặc tên miền cấu hình thực tế)
- **Phiên bản API (Versioning):** Phiên bản hiện tại là `v1`. Do đó, tất cả các route gọi từ Frontend phải bắt đầu bằng `/api/v1/`.
  - Ví dụ: `http://localhost:8080/api/v1/products`
- **Quy ước đặt tên URL (URL Path Naming):**
  - Sử dụng **danh từ số nhiều** cho các tài nguyên (resources).
  - Sử dụng định dạng **kebab-case** (chữ thường, phân tách bằng dấu gạch ngang) cho các path gồm nhiều từ.
  - Ví dụ:
    - Danh sách sản phẩm: `/api/v1/products`
    - Biến thể sản phẩm: `/api/v1/product-variants`
    - Địa chỉ người dùng: `/api/v1/user-addresses`
    - Lịch sử trạng thái đơn hàng: `/api/v1/orders/{id}/status-histories`

---

## 2. Định Dạng Phản Hồi Chuẩn Của API (API Response Format)

Tất cả các API từ Backend đều trả về một cấu trúc bọc chung (`ApiResponse<T>`) ở dạng JSON. Frontend cần khai báo kiểu dữ liệu và xử lý đồng bộ theo cấu trúc này.

### 2.1. Cấu Trúc Khai Báo TypeScript (API Response Interface)
```typescript
interface ApiResponse<T> {
  statusCode: number;      // Mã trạng thái HTTP (200, 201, 400, 401, 403, 404, 500, v.v.)
  data: T | null;          // Dữ liệu payload thực tế, bằng null nếu có lỗi xảy ra
  message: string;         // Thông điệp phản hồi (ví dụ: "Success", "Created", hoặc thông báo lỗi)
  timestamp: string;       // Thời gian phản hồi theo định dạng ISO-8601 (LocalDateTime)
}
```

### 2.2. Phản Hồi Thành Công (Success Response)
- **Phương thức GET/PUT/PATCH/DELETE thành công (HTTP 200):**
  ```json
  {
    "statusCode": 200,
    "data": { ... }, // Payload dữ liệu tài nguyên
    "message": "Success",
    "timestamp": "2026-06-27T16:13:00.000"
  }
  ```
- **Phương thức POST tạo mới thành công (HTTP 201):**
  ```json
  {
    "statusCode": 201,
    "data": { ... }, // Tài nguyên vừa được tạo
    "message": "Created",
    "timestamp": "2026-06-27T16:13:00.000"
  }
  ```

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
interface PaginatedData<T> {
  meta: {
    page: number;        // Trang hiện tại (1-indexed)
    pageSize: number;    // Số lượng phần tử mỗi trang
    pages: number;       // Tổng số trang
    total: number;       // Tổng số bản ghi trên hệ thống
  };
  result: T[];           // Danh sách dữ liệu của trang hiện tại
}
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
| **401 Unauthorized** | `401` | Token hết hạn, không hợp lệ hoặc thiếu Token xác thực | Chuyển hướng người dùng sang trang Đăng nhập hoặc thực hiện tự động Refresh Token. |
| **403 Forbidden** | `403` | Người dùng không có quyền truy cập endpoint này | Hiển thị thông báo hoặc trang báo lỗi không có quyền truy cập. |
| **404 Not Found** | `404` | Tài nguyên không tồn tại hoặc đã bị xóa mềm | Hiển thị trang 404 hoặc thông báo không tìm thấy bản ghi. |
| **409 Conflict** | `409` | Trùng lặp dữ liệu (ví dụ trùng Email đăng ký) | Thông báo cho người dùng giá trị nhập vào đã tồn tại. |
| **500 Internal Error**| `500` | Lỗi máy chủ không mong muốn | Hiển thị thông báo "Đã có lỗi xảy ra từ máy chủ, vui lòng thử lại sau". |

---

## 5. Cơ Chế Xác Thực & Quản Lý Token (Authentication & JWT Flow)

Hệ thống xác thực của Vela Wear sử dụng hai loại token: **Access Token** (ngắn hạn - 15 phút) và **Refresh Token** (dài hạn - 3 ngày).

### 5.1. Luồng Đăng Nhập & Lưu Trữ Token
1. **Đăng nhập:** FE gửi yêu cầu đăng nhập qua `POST /api/v1/auth/login`.
2. **Nhận Token:** Backend phản hồi thành công và trả về thông tin token trong body đồng thời thiết lập Cookie:
   - **Access Token:** Nằm trong JSON body (`data.accessToken`). FE lưu trữ token này vào bộ nhớ (State/Context) hoặc trong Local Storage/Client-side Session để gửi kèm ở header các request tiếp theo.
   - **Refresh Token:**
     - Backend tự động thiết lập Cookie có tên là `refresh_token` trong tiêu đề phản hồi HTTP:
       `Set-Cookie: refresh_token=<token>; HttpOnly; Path=/api/v1/auth; SameSite=Lax; Max-Age=259200`
     - **Quan trọng:** Do cookie này có cấu hình `HttpOnly` và bị giới hạn đường dẫn truy cập (`Path=/api/v1/auth`), mã javascript phía Frontend **không thể đọc hoặc sửa** cookie này. Browser sẽ tự động đính kèm cookie này khi gửi các request tới các endpoint thuộc `/api/v1/auth/*` (như `/refresh` và `/logout`).
3. **Gọi API được bảo vệ:** Các API yêu cầu xác thực bắt buộc phải đính kèm Access Token vào header dưới định dạng:
   ```text
   Authorization: Bearer <accessToken>
   ```

### 5.2. Luồng Tự Động Làm Mới Token (Token Rotation)
Khi Access Token hết hạn (hoặc khi gọi API nhận lỗi `401 Unauthorized`), Frontend cần thực hiện luồng refresh token tự động trước khi thử lại request ban đầu:
1. Gửi request `POST /api/v1/auth/refresh` (Không cần đính kèm body nếu chạy trên browser vì trình duyệt sẽ tự động gửi cookie `refresh_token`).
2. Nếu thành công, Backend sẽ trả về cặp Access Token và Refresh Token mới trong JSON body và cập nhật lại HttpOnly cookie.
3. Frontend cập nhật Access Token mới vào State/Context và tiếp tục thực hiện request ban đầu đã bị gián đoạn.
4. Nếu refresh thất bại (lỗi `401` do Refresh Token đã hết hạn hoặc bị thu hồi), tiến hành đăng xuất người dùng và chuyển hướng về trang `/sign-in`.

### 5.3. Luồng Đăng Xuất (Logout)
- Gọi API `POST /api/v1/auth/logout`. Backend sẽ thu hồi token trong DB và thiết lập xóa Cookie `refresh_token` (`Max-Age=0`).
- Frontend xóa Access Token trong State/Context và chuyển hướng về trang chủ hoặc trang đăng nhập.

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

## 7. Khuyến Nghị Hiện Thực Mã Phía Frontend (Next.js Client Setup)

Để xử lý tối ưu, Frontend nên sử dụng **Axios** hoặc **Fetch API** được cấu hình interceptor để tự động hóa việc đính kèm Token và làm mới Token khi hết hạn.

### 7.1. Cấu hình Axios Client Tham Khảo (`lib/api-client.ts`)
```typescript
import axios from "axios";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true, // Bắt buộc để tự động gửi/nhận cookie chứa refresh_token
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor đính kèm Access Token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi và Refresh Token tự động
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu gặp lỗi 401 (Unauthorized) và chưa từng thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Thực hiện gọi API refresh token
        const refreshResponse = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = refreshResponse.data.data.accessToken;
        setAccessToken(newAccessToken);
        
        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại hoặc hết hạn -> Đăng xuất người dùng
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

*Tài liệu quy ước này là cơ sở duy nhất cho việc phát triển và tích hợp giao diện. Vui lòng thảo luận và cập nhật tài liệu này nếu có bất kỳ sự thay đổi nào từ phía API Backend.*
