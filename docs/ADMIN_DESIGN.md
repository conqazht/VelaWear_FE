# Vela Wear Admin — Design System Specification

> **Phiên bản:** 1.0.0  
> **Cập nhật:** 2026-08-28  
> **Đối tượng áp dụng:** Toàn bộ phân hệ Quản trị / Dashboard (`app/(admin)/*`)  
> **Mục tiêu thẩm mỹ:** Nordic Studio & Crisp Precision (Tông màu sáng, sắc nét, tối ưu vận hành dữ liệu, độ tương phản cao, phong cách tối giản cao cấp).

---

## 1. Tổng Quan & Khí Chất Giao Diện (Visual Atmosphere & Design Dials)

Nếu như Storefront của Vela Wear ([`docs/DESIGN.md`](./DESIGN.md)) mang đậm phong cách **Editorial Lookbook ấm áp** với canvas màu kem và đất nung terracotta dành cho trải nghiệm thưởng lãm mua sắm, thì **Vela Wear Admin** được kiến tạo như một **không gian làm việc chuyên nghiệp (Precision Studio & Data Cockpit)**.

Hệ thống được thiết kế theo nguyên tắc **Light-First Architecture**, lấy cảm hứng từ các dashboard chuẩn mực toàn cầu (Linear, Stripe Dashboard, Apple Developer Console, Raycast): sạch sẽ, tinh giản, sắc nét, mật độ thông tin cao và tốc độ quét mắt tối ưu cho người vận hành cửa hàng thời trang (Sản phẩm, Tồn kho, Chiến dịch Sale, Đơn hàng, CRM, Dòng tiền và Báo cáo Analytics).

### 1.1. Bộ Ba Chỉ Số Thiết Kế (The Three Dials)

| Chỉ số               | Mức độ (1–10) | Định nghĩa & Ý nghĩa thiết kế                                                                                                                                                                                                            |
| :------------------- | :-----------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **VISUAL DENSITY**   | **6.5 / 10**  | **Balanced Data Cockpit:** Mật độ thông tin cao vừa phải. Bảng dữ liệu và form nhập liệu gọn gàng, khoảng cách chuẩn xác, không lãng phí diện tích màn hình nhưng vẫn giữ khoảng thở thị giác.                                           |
| **LAYOUT VARIANCE**  | **3.0 / 10**  | **Structured & Predictable:** Bố cục dạng lưới có tính kỷ luật cao. Ưu tiên cấu trúc chuẩn: KPI Cards → Toolbar Lọc/Tìm kiếm → Bảng Dữ liệu (Data Table) → Drawer/Modal chi tiết. Không dùng bố cục bất đối xứng nghệ thuật gây rối mắt. |
| **MOTION INTENSITY** | **3.0 / 10**  | **Snappy & Restrained:** Chuyển động siêu nhanh, dứt khoát (150ms–200ms), hỗ trợ phản hồi thao tác tức thì. Không sử dụng hiệu ứng chuyển động trang rườm rà hay scroll-hijack.                                                          |

### 1.2. Nguyên Tắc Cốt Lõi (Core Principles)

1. **One Color, One Meaning:** Mỗi màu sắc đảm nhiệm đúng một vai trò chức năng (Xanh Cobalt = Hành động chính/Active, Lục Emerald = Thành công/Đang bán, Hổ phách = Cảnh báo/Chờ duyệt, Đỏ Crimson = Lỗi/Hết hàng/Hủy đơn). Không sử dụng màu sắc ngẫu hứng mang tính trang trí.
2. **Numbers Are First-Class Citizens:** Mọi con số (doanh thu, đơn giá, số lượng tồn kho, phần trăm khuyến mãi, mã đơn hàng, ngày giờ) bắt buộc phải sử dụng định dạng **Tabular Numbers** (`tabular-nums`) để căn thẳng hàng tuyệt đối theo chiều dọc.
3. **Flat Surfaces & Layered Hairlines:** Chiều sâu của giao diện được xây dựng thông qua **đường viền hairline 1px siêu nét** (`#e2e8f0`) kết hợp độ tương phản giữa các lớp nền (Canvas `#f8fafc` vs Surface `#ffffff`), hạn chế tối đa đổ bóng (shadow) đậm.
4. **No Serif in Cockpit:** Tuyệt đối cấm sử dụng font Serif trong phân hệ Admin. Toàn bộ tiêu đề, nhãn bảng, controls và dữ liệu sử dụng họ font Sans-Serif nhân văn (`Geist Sans` / `Inter`) kết hợp `Space Grotesk` / `Geist Mono` cho số liệu.
5. **Concentric & Multi-Tier Radii:** Bo góc được tính toán chính xác theo cấp bậc từ ngoài vào trong, đảm bảo giao diện sắc sảo, không bị cảm giác "tròn trịa kiểu đồ chơi".

---

## 2. Hệ Thống Màu Sắc & Vai Trò Ngữ Nghĩa (Color Palette & Semantic Tokens)

Bảng màu Admin sử dụng thang màu **Muted Espresso & Nordic Canvas** trên nền sáng tinh khiết (`#f8fafc`). Phân hệ Admin áp dụng **kiến trúc Light-Mode duy nhất**, loại bỏ các nút chuyển đổi theme để tối ưu sự tập trung và đồng bộ thương hiệu. Tất cả các cặp màu chữ / nền đều đạt chuẩn tiếp cận **WCAG 2.1 AAA (>= 7:1)** cho văn bản chính và **WCAG AA (>= 4.5:1)** cho văn bản phụ.

### 2.1. Bảng Màu Nền & Cấu Trúc (Surfaces & Structural Borders)

| Token CSS / Role         | Giá trị Hex | Giá trị OKLCH            | Mục đích sử dụng & Phân tầng                                                                 |
| :----------------------- | :---------- | :----------------------- | :------------------------------------------------------------------------------------------- |
| `--admin-canvas`         | `#f8fafc`   | `oklch(0.985 0.004 240)` | **Nền tổng thể toàn trang (App Canvas).** Sáng mát dịu, giảm mỏi mắt khi làm việc nhiều giờ. |
| `--admin-surface`        | `#ffffff`   | `oklch(1.000 0.000 0)`   | **Bề mặt thẻ chứa (Card / Data Table / Panel).** Nổi bật rõ trên nền Canvas.                 |
| `--admin-surface-subtle` | `#f1f5f9`   | `oklch(0.965 0.008 240)` | Nền Header của bảng dữ liệu, nền Search input, dải trạng thái phụ.                           |
| `--admin-surface-hover`  | `#f8fafc`   | `oklch(0.985 0.004 240)` | Trạng thái hover trên hàng bảng (Table Row Hover), hover trên menu dropdown.                 |
| `--admin-surface-active` | `#e2e8f0`   | `oklch(0.925 0.012 240)` | Trạng thái active/selected của row, tab con đang chọn.                                       |
| `--admin-border`         | `#e2e8f0`   | `oklch(0.925 0.012 240)` | **Đường viền kết cấu chuẩn 1px.** Bao quanh card, ngăn cách các cột, viền input.             |
| `--admin-border-subtle`  | `#f1f5f9`   | `oklch(0.965 0.008 240)` | Đường kẻ phân cách ngang nhẹ bên trong các hàng của bảng dữ liệu.                            |
| `--admin-border-focus`   | `#735639`   | `oklch(0.450 0.070 55)`  | Đường viền khi active/focus form controls, kết hợp ring 2px ở 20% alpha.                     |

### 2.2. Bảng Màu Chữ & Biểu Tượng (Typography & Content Ink)

| Token CSS / Role         | Giá trị Hex | Giá trị OKLCH            | Độ tương phản | Mục đích sử dụng                                                        |
| :----------------------- | :---------- | :----------------------- | :-----------: | :---------------------------------------------------------------------- |
| `--admin-ink-primary`    | `#0f172a`   | `oklch(0.190 0.020 250)` | **14.2 : 1**  | Tiêu đề trang, số liệu KPI chính, tên sản phẩm, nhãn cột bảng dữ liệu.  |
| `--admin-ink-body`       | `#334155`   | `oklch(0.350 0.025 250)` |  **8.6 : 1**  | Nội dung mô tả, giá trị ô dữ liệu bảng, văn bản form nhập liệu.         |
| `--admin-ink-muted`      | `#64748b`   | `oklch(0.530 0.025 250)` |  **4.8 : 1**  | Nhãn phụ, breadcrumbs, timestamp, SKU, pagination counter.              |
| `--admin-ink-subtle`     | `#94a3b8`   | `oklch(0.700 0.020 250)` |  **2.6 : 1**  | Placeholder text, icon vô hiệu hóa (disabled), phím tắt bàn phím (Kbd). |
| `--admin-ink-on-primary` | `#ffffff`   | `oklch(1.000 0.000 0)`   |  **7.5 : 1**  | Chữ/icon màu trắng hiển thị trên nút bấm CTA chính.                     |

### 2.3. Màu Thương Hiệu Quản Trị & Điểm Nhấn (Brand Accent & Action)

| Token CSS / Role         | Giá trị Hex | Giá trị OKLCH           | Mục đích sử dụng                                                                      |
| :----------------------- | :---------- | :---------------------- | :------------------------------------------------------------------------------------ |
| `--admin-primary`        | `#735639`   | `oklch(0.450 0.070 55)` | **CTA chính duy nhất:** Nút "Tạo mới", "Lưu thay đổi", "Xuất file", Active indicator. |
| `--admin-primary-hover`  | `#60462c`   | `oklch(0.380 0.060 55)` | Trạng thái hover của nút CTA chính (đậm hơn 1 tone).                                  |
| `--admin-primary-active` | `#4f3823`   | `oklch(0.320 0.050 55)` | Trạng thái nhấn giữ (pressed / active) của nút CTA chính.                             |
| `--admin-primary-subtle` | `#f7f3ee`   | `oklch(0.960 0.018 55)` | Nền badge active, nền highlight của hàng dữ liệu đang chọn.                           |

### 2.4. Màu Ngữ Nghĩa Trạng Thái Nghiệp Vụ, Vai Trò & API (Semantic Status & Role Matrix)

Mỗi trạng thái bao gồm 3 cấp độ: **Badge Solid**, **Badge Soft (Nền nhạt + Chữ đậm)** và **Border Ring**:

| Nhóm / Trạng thái                | Nền Soft (`bg`)                                                                    | Viền (`border`)                                        | Chữ/Icon (`text`) | Hex đại diện | Ứng dụng thực tế trong Quản trị Vela Wear                                          |
| :------------------------------- | :--------------------------------------------------------------------------------- | :----------------------------------------------------- | :---------------- | :----------: | :--------------------------------------------------------------------------------- |
| **SUCCESS / ACTIVE / LIVE**      | `#ecfdf5` (emerald-50)                                                             | `#a7f3d0`                                              | `#065f46`         |  `#059669`   | Sản phẩm "Đang bán" (Active), Đơn "Đã thanh toán", Campaign "LIVE" (có dot pulse). |
| **WARNING / UPCOMING / PENDING** | `#fffbeb` (amber-50)                                                               | `#fde68a`                                              | `#92400e`         |  `#d97706`   | Trạng thái "Chờ duyệt", "Sắp hết hàng" (Low stock), Chiến dịch "UPCOMING".         |
| **DANGER / ERROR / CANCELLED**   | `#fef2f2` (rose-50)                                                                | `#fecaca`                                              | `#991b1b`         |  `#dc2626`   | Trạng thái "Hết hàng" (Out of stock), Đơn "Đã hủy", Method `DELETE`.               |
| **DRAFT / INACTIVE (Xám nhạt)**  | `#f4f4f5` (zinc-100)                                                               | `#e4e4e7`                                              | `#3f3f46`         |  `#71717a`   | Trạng thái "Bản nháp" (Draft), Sản phẩm "Ngừng kinh doanh" (Inactive / Archived).  |
| **FLASH SALE (Tím Accent)**      | `#faf5ff` (purple-50)                                                              | `#e9d5ff`                                              | `#6b21a8`         |  `#9333ea`   | Chiến dịch "FLASH SALE" độc quyền.                                                 |
| **STANDARD SALE (Nâu Espresso)** | `#f7f3ee` (espresso-subtle)                                                        | `#e8ded2`                                              | `#735639`         |  `#735639`   | Chiến dịch "STANDARD SALE" định kỳ.                                                |
| **ROLE ADMIN (Indigo)**          | `#eef2ff` (indigo-50)                                                              | `#c7d2fe`                                              | `#3730a3`         |  `#4f46e5`   | Quyền quản trị tối cao (Superadmin, Admin).                                        |
| **ROLE STAFF (Sky Cyan)**        | `#f0f9ff` (sky-50)                                                                 | `#bae6fd`                                              | `#0369a1`         |  `#0284c7`   | Nhân viên vận hành, Quản lý kho (Staff, Manager).                                  |
| **ROLE USER (Slate)**            | `#f1f5f9` (slate-100)                                                              | `#cbd5e1`                                              | `#334155`         |  `#64748b`   | Người dùng, Khách hàng thành viên (Customer, User).                                |
| **HTTP GET / POST / PUT**        | Blue-50 (`GET`), Emerald-50 (`POST`), Amber-50 (`PUT`/`PATCH`), Rose-50 (`DELETE`) | Phân quyền API endpoints trong Permissions Management. |

### 2.5. Bảng Màu Biểu Đồ Thống Kê (Analytics & Chart Palette)

Dành cho các biểu đồ trong phân hệ **Analytics**, **Doanh thu Ecommerce**, **Phân tích Khách hàng (CRM)**:

- **Chart 1 (Chính - Doanh thu/Sản lượng):** `oklch(0.450 0.070 55)` (`#735639` - Muted Espresso)
- **Chart 2 (Thứ cấp - Lưu lượng/Đơn hàng):** `oklch(0.600 0.100 150)` (`#2e8555` - Muted Sage Green)
- **Chart 3 (Thứ ba - Khách hàng mới):** `oklch(0.650 0.120 35)` (`#c25e2e` - Terracotta Clay)
- **Chart 4 (Thứ tư - Kênh Social/Marketing):** `oklch(0.700 0.100 85)` (`#b89028` - Warm Sand)
- **Chart 5 (Thứ năm - Khác/Hoàn trả):** `oklch(0.600 0.030 55)` (`#82786e` - Warm Taupe Slate)

---

## 3. Kiến Trúc Typography & Quy Tắc Số Liệu (Typography & Numeric Architecture)

### 3.1. Phân Bổ Font Family

- **Font UI Chính (Primary Sans):** `Geist Sans` (hoặc fallback `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).  
  _Ứng dụng:_ Navigation, Tiêu đề trang, Nhãn Form, Tiêu đề cột bảng, Nội dung thông báo.
- **Font Số Liệu & Mã Kỹ Thuật (Numeric & Monospace):** `"Space Grotesk", "Geist Mono", SFMono-Regular, Consolas, monospace`.  
  _Ứng dụng bắt buộc:_ Mọi ô hiển thị Giá tiền (VND / USD), Số lượng tồn, Mã SKU, Mã Đơn hàng (#ORD-8823), Tỉ lệ phần trăm, Ngày giờ tạo.
- **Quy tắc Tabular Numbers Bắt Buộc:**  
  Mọi nơi có hiển thị số phải áp dụng class Tailwind `tabular-nums` (tương đương CSS `font-variant-numeric: tabular-nums`). Điều này ngăn hiện tượng layout bị giật khi các con số nhảy tự động hoặc khi so sánh các hàng trong Data Table.

### 3.2. Bảng Phân Cấp Typography (Type Scale Matrix)

| Token Type Scale  | Kích thước | Weight  | Line Height | Letter Spacing | Font Family | Phạm vi sử dụng                                                          |
| :---------------- | :--------: | :-----: | :---------: | :------------: | :---------- | :----------------------------------------------------------------------- |
| `text-display-sm` |    24px    |   600   |    1.20     |     -0.5px     | Sans UI     | Tiêu đề màn hình chính (`h1`: "Quản lý Sản phẩm", "Tổng quan Doanh thu") |
| `text-title-md`   |    18px    |   600   |    1.25     |     -0.3px     | Sans UI     | Tiêu đề thẻ dữ liệu KPI, Tiêu đề Drawer / Modal Dialog                   |
| `text-title-sm`   |    15px    |   600   |    1.30     |     -0.2px     | Sans UI     | Tiêu đề nhóm bộ lọc, Tên phân đoạn bảng (Table Sub-header)               |
| `text-body-md`    |    14px    | 400/500 |    1.45     |       0        | Sans UI     | Dữ liệu bảng mặc định, Nội dung ô nhập liệu form, Breadcrumbs            |
| `text-body-sm`    |    13px    |   400   |    1.40     |       0        | Sans UI     | Mô tả phụ bên dưới tiêu đề, Ghi chú hướng dẫn (Helper text)              |
| `text-caption`    |    12px    |   500   |    1.30     |     +0.2px     | Sans UI     | Nhãn trạng thái (Badge), Header cột bảng (`uppercase tracking-wider`)    |
| `text-kpi-metric` |    28px    |   700   |    1.10     |     -0.8px     | Numeric     | Con số thống kê lớn trong KPI Cards (Doanh thu: `₫ 128.450.000`)         |
| `text-table-num`  |    14px    |   500   |    1.40     |       0        | Numeric     | Giá niêm yết, số lượng tồn kho trong ô dữ liệu (`tabular-nums`)          |
| `text-code-sku`   |    12px    |   500   |    1.30     |     +0.5px     | Mono        | Mã SKU (`VELA-TSHIRT-BLK-M`), Mã Coupon, Hash Idempotency                |

### 3.3. Giới Hạn Chiều Dài Dòng Đọc (Measure Constraint)

- Các đoạn văn bản mô tả, ghi chú đơn hàng hoặc nhật ký thay đổi (Audit Log) không được vượt quá **`65ch`** (`max-w-2xl` hoặc `max-w-[65ch]`) để đảm bảo mắt quét dòng dễ dàng mà không bị mất dấu dòng tiếp theo.

---

## 4. Phân Tầng Độ Sâu & Bo Góc Đồng Tâm (Elevation & Concentric Radii)

Khác với Storefront dùng nhiều nút bo tròn kiểu Pill (`rounded-full`), giao diện Admin ưu tiên **bo góc cấu trúc đồng tâm (Concentric Radii)** để tạo sự ngay ngắn, chuyên nghiệp và tối ưu diện tích cho dữ liệu.

```
Công thức bo góc đồng tâm:
outerRadius = innerRadius + padding
(Ví dụ: Card ngoài rounded-xl [12px], padding bên trong 8px [2rem] => Item bên trong rounded-md [6px] hoặc rounded-lg [8px])
```

### 4.1. Hệ Thống 4 Tầng Bo Góc (Radii Tiers)

| Cấp bậc                           | Giá trị Token  | Quy cách          | Thành phần áp dụng                                                                                             |
| :-------------------------------- | :------------: | :---------------- | :------------------------------------------------------------------------------------------------------------- |
| **Tier 1 (Macro Containers)**     |  `rounded-xl`  | **12px – 14px**   | Khung bao ngoài của Modal Dialog, Sheet/Drawer trượt, Thẻ KPI tổng quan lớn, Container chứa Data Table.        |
| **Tier 2 (Cards & Panels)**       |  `rounded-lg`  | **8px – 10px**    | Thẻ con (Sub-card), Toolbar bộ lọc, Khối xem trước hình ảnh biến thể sản phẩm, Khối biểu đồ Analytics.         |
| **Tier 3 (Interactive Controls)** |  `rounded-md`  | **6px**           | Nút bấm (Button), Ô nhập liệu (Input), Menu Dropdown (Select), Ô tìm kiếm, Ô chọn ngày (DatePicker), Checkbox. |
| **Tier 4 (Status & Micro UI)**    | `rounded-full` | **9999px (Pill)** | Badge trạng thái đơn hàng/kho, Chấm chỉ báo màu swatch, Avatar người dùng, Phím tắt bàn phím (`Kbd`).          |

### 4.2. Nguyên Tắc Đổ Bóng & Viền (Elevation & Depth)

Admin tuân thủ nguyên tắc: **Borders for Structure, Whisper Shadows for Elevation**:

- **Bề mặt phẳng mặc định (Default Surface):** `bg-white border border-[#e2e8f0]` — Hoàn toàn không đổ bóng. Phân tách thị giác bằng đường viền 1px sắc sảo.
- **Thẻ nổi nhẹ (KPI Card / Hover Row):** `shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] border border-[#e2e8f0]`.
- **Dropdown Menu / Popover:** `shadow-[0_4px_12px_-2px_rgba(15,23,42,0.08),0_2px_6px_-1px_rgba(15,23,42,0.04)] border border-[#e2e8f0]`.
- **Modal Dialog / Action Sheet:** `shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] border border-[#e2e8f0]`.

---

## 5. Đặc Tả Thành Phần Quản Trị Chuẩn (Component Specifications)

### 5.1. Bảng Dữ Liệu Quản Trị (Admin Data Table)

Data Table là "trái tim" của phân hệ Admin:

- **Header:** Cao `40px`, nền `bg-[#f1f5f9]`, chữ `text-caption text-[#64748b] uppercase tracking-wider font-semibold`. Cố định (Sticky Header) khi cuộn nội dung dài.
- **Row:** Chiều cao chuẩn `48px` (hoặc `40px` cho chế độ compact). Đường phân cách đáy `border-b border-[#f1f5f9]`.
- **Hover State:** Khi rê chuột qua hàng, nền đổi sang `bg-[#f8fafc]` ngay lập tức (`transition-colors duration-100`).
- **Active / Selected State:** Hàng được chọn (check checkbox) có nền `bg-[#eff6ff]` và viền trái `border-l-2 border-[#2563eb]`.
- **Căn lề cột chuẩn:**
  - Cột văn bản (Tên sản phẩm, Email, Danh mục): **Căn trái (Left-aligned)**.
  - Cột số liệu (Giá tiền, Số lượng tồn kho, Ngày giờ): **Căn phải (Right-aligned)** và luôn dùng `tabular-nums font-mono`.
  - Cột trạng thái (Badge, Action dropdown): **Căn giữa (Center-aligned)** hoặc **Căn phải**.
- **Pagination Footer:** Tích hợp bộ đếm bản ghi rõ ràng (`"Hiển thị 1–10 của 1.420 sản phẩm"`), nút chuyển trang kèm chọn số lượng hàng hiển thị (`10 / 25 / 50 / 100`).

### 5.2. Thẻ Chỉ Số KPI (Metric / KPI Card)

- **Cấu trúc 3 thành phần:**
  1. _Top Row:_ Tiêu đề chỉ số (`text-body-sm text-[#64748b]`) + Icon ngữ nghĩa nhỏ trong khung `w-8 h-8 rounded-md bg-[#f1f5f9] text-[#0f172a]`.
  2. _Middle Metric:_ Con số chính lớn `text-kpi-metric text-[#0f172a] font-bold tracking-tight`.
  3. _Bottom Delta:_ Phần trăm tăng/giảm so với kỳ trước (`+12.4% vs tháng trước` màu xanh emerald kèm icon `TrendingUp` hoặc `-3.2%` màu đỏ kèm icon `TrendingDown`).

### 5.3. Thanh Công Cụ Bộ Lọc & Tìm Kiếm (Toolbar & Filter Strip)

- **Vị trí:** Nằm ngay phía trên Data Table.
- **Ô tìm kiếm chính:** Input tích hợp icon kính lúp bên trái, có phím tắt nhanh (`⌘K` hoặc `Ctrl+K`), nút `×` xóa nhanh truy vấn khi có ký tự.
- **Bộ lọc dạng Popover/Select:** Chiều cao chuẩn `36px` (`size="sm"`), hiển thị số lượng bộ lọc đang active dạng badge nhỏ (ví dụ: `"Danh mục (2)"`).
- **Dải Chip Lọc Đang Hoạt Động (Active Filters Strip):** Tự động xuất hiện phía dưới toolbar khi có ít nhất 1 filter được chọn. Mỗi chip có nút xóa nhanh `×` (`rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0]`). Có nút "Xóa tất cả bộ lọc" (`text-xs text-[#2563eb] font-medium`).

### 5.4. Hệ Thống Nút Bấm & Phân Cấp Hành Động (Buttons & Action Hierarchy)

Mỗi màn hình chỉ có **duy nhất 1 Nút Hành Động Chính (Primary Button)** để tránh gây nhiễu cho người thao tác:

1. **`Button Primary` (Hành động chính):** Nền `#2563eb`, chữ trắng, `rounded-md`, chiều cao `36px` (`h-9 px-4 text-sm font-medium`), micro-motion `active:scale-[0.97] transition-all`.
2. **`Button Secondary / Outline` (Hành động phụ):** Nền `#ffffff`, viền `1px solid #e2e8f0`, chữ `#0f172a`, hover nền `#f8fafc`, `active:scale-[0.97]`.
3. **`Button Ghost` (Thao tác inline):** Không viền, nền trong suốt, hover nền `#f1f5f9`, chữ `#334155`. Dùng cho icon actions trong bảng hoặc nút "Đóng".
4. **`Button Destructive` (Thao tác nguy hiểm):** Nền `#dc2626`, chữ trắng (hoặc biến thể Outline viền `#fca5a5` chữ `#dc2626` hover nền `#fef2f2`). Dùng cho "Xóa sản phẩm", "Hủy chiến dịch".

### 5.5. Form Nhập Liệu & Validation

- **Label:** Đặt ngay phía trên ô input (`text-sm font-medium text-[#0f172a]`), đánh dấu dấu sao đỏ `*` cho trường bắt buộc.
- **Input Field:** Nền `#ffffff`, viền `1px solid #e2e8f0`, chiều cao `36px` (`h-9 px-3 text-sm`), placeholder `#94a3b8`.
- **Focus Ring:** Khi focus, viền đổi thành `#2563eb` kèm outer ring `2px ring-[#2563eb]/20`.
- **Error State:** Khi có lỗi validate, viền đổi thành `#dc2626`, câu thông báo lỗi xuất hiện ngay dưới input (`text-xs text-[#dc2626] flex items-center gap-1 mt-1.5`).

### 5.6. Quản Lý Đa Ngôn Ngữ & Tạo Nội Dung AI (Locale Tabs & AI Generator)

Theo kiến trúc chuẩn của Vela Wear ([`docs/I18N_ADMIN_GUIDE_VI.md`](./I18N_ADMIN_GUIDE_VI.md)):

- Form nhập liệu sản phẩm và chiến dịch sale luôn có cụm **Content Locale Tabs** (`[ Tiếng Việt (Mặc định) ] [ English ]`).
- Tab Tiếng Anh tích hợp nút **"Generate English Content"** với biểu tượng `Sparkles` màu Cobalt để hỗ trợ dịch thuật tự động, hiển thị trạng thái badge `Synchronized` (Xanh) hoặc `Missing Translation` (Vàng).

---

## 6. Kiến Trúc Bố Cục & Lưới Dữ Liệu (Layout & Shell Architecture)

```
+-------------------------------------------------------------------------------+
| App Header (h-14 / 56px, fixed, border-b #e2e8f0, bg-white/80 backdrop-blur)   |
| [Logo + Breadcrumb]          [Global Search ⌘K]    [Locale VI/EN] [User Nav]  |
+-------------------+-----------------------------------------------------------+
| App Sidebar       | Main Content Canvas (min-h-[calc(100vh-56px)], bg-#f8fafc)|
| (w-64 desktop     |                                                           |
|  w-16 collapsed)  |  Page Header: Title H1 + Subtitle + Action Button Group   |
|                   |  -------------------------------------------------------  |
|  - Tổng quan      |  KPI Cards Grid (4 columns desktop, 2 col tablet)         |
|  - Sản phẩm       |  -------------------------------------------------------  |
|  - Đơn hàng       |  Main Card / Data Table:                                  |
|  - Sale Campaigns |   [ Search & Filter Toolbar ] [ Export / Bulk Actions ]   |
|  - Khách hàng     |   [ Active Filters Chips Strip ]                          |
|  - Báo cáo        |   [ Data Table Rows with Sticky Headers ]                 |
|                   |   [ Pagination Footer ]                                   |
+-------------------+-----------------------------------------------------------+
```

### 6.1. Khung Vỏ Quản Trị (The Admin Shell)

- **Header:** Cố định trên cùng, chiều cao `56px` (`h-14`), nền trắng có hiệu ứng mờ `bg-white/80 backdrop-blur-md`, viền đáy `border-b border-[#e2e8f0]`. Chứa Breadcrumbs điều hướng, Global Search Trigger (`⌘K`), Trình chuyển ngôn ngữ (`VI/EN`), và Account Switcher.
- **Sidebar:** Cố định bên trái, chiều rộng `256px` (`w-64`), có thể thu gọn về dạng icon `64px` (`w-16`). Nền `#ffffff`, viền phải `border-r border-[#e2e8f0]`.
- **Canvas Nội dung:** Nền `#f8fafc`, padding chuẩn `p-6` (24px) trên desktop và `p-4` (16px) trên mobile. Chiều rộng tối đa không giới hạn nhưng có `min-w-[1024px]` cho các bảng dữ liệu phức tạp (cho phép cuộn ngang nội bộ bảng mà không làm vỡ khung shell).

### 6.2. Hệ Thống Lưới (Grid Columns)

- **KPI Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
- **Form chỉnh sửa chi tiết (Master-Detail):** Tỉ lệ `8 / 4` (Cột trái 8 phần chứa thông tin chính, biến thể, hình ảnh; Cột phải 4 phần chứa Trạng thái xuất bản, Danh mục, Brand, SEO tags).

### 6.3. Sơ Đồ Điều Hướng & Định Vị Màn Hình Chuẩn (Information Architecture)

Phân hệ Quản trị Vela Wear là **nền tảng vận hành thương mại điện tử thời trang cao cấp**, không phải một bộ template SaaS generic. Danh sách màn hình được chuẩn hóa như sau:

#### 1. Nhóm Quản Trị Nghiệp Vụ (Management) — BẮT BUỘC GIỮ

- **Sản phẩm & Danh mục:** `Products` (Sản phẩm + Biến thể Màu/Size), `Categories` (Danh mục), `Brands` (Thương hiệu), `Attributes` (Thuộc tính).
- **Đơn hàng & Doanh số:** `Orders` (Đơn hàng & Giao vận), `Sales` (Chiến dịch Flash Sale & Giảm giá), `Coupons` (Mã khuyến mãi).
- **Người dùng & Phân quyền:** `Users` (Nhân sự / Khách hàng), `Roles` (Vai trò), `Permissions` (Quyền hạn).

#### 2. Nhóm Bảng Điều Khiển (Dashboards)

| Màn hình           | Route                       | Đánh giá nghiệp vụ Vela Wear                                                                                             | Khuyến nghị                                          |
| :----------------- | :-------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| **E-commerce**     | `/dashboard/ecommerce`      | **Trục xương sống:** Doanh thu bán lẻ, đơn mới, cảnh báo hết hàng, top sản phẩm bán chạy, đánh giá khách hàng.           | **GIỮ LẠI (Ưu tiên số 1 — Đặt làm trang chủ Admin)** |
| **Analytics**      | `/dashboard/analytics`      | **Quan trọng:** Lưu lượng truy cập web, tỷ lệ chuyển đổi mua hàng (Conversion rate), Sessions, Pageviews, nguồn traffic. | **GIỮ LẠI**                                          |
| **Finance**        | `/dashboard/finance`        | **Quan trọng:** Dòng tiền kinh doanh, doanh thu thuần, chi phí vận hành, lịch sử giao dịch tài chính.                    | **GIỮ LẠI**                                          |
| **CRM**            | `/dashboard/crm`            | **Hữu ích:** Quản lý quan hệ khách hàng, phân khúc khách hàng VIP, giá trị vòng đời (LTV), tỷ lệ khách quay lại.         | **GIỮ LẠI**                                          |
| **Default**        | `/dashboard/default`        | Dashboard tổng hợp template chung chung, bị trùng lặp chức năng với Ecommerce.                                           | **NÊN GỘP / REDIRECT VÀO E-COMMERCE**                |
| **Infrastructure** | `/dashboard/infrastructure` | Giám sát CPU/RAM/Server tải — thuộc về DevOps/SysAdmin, không phù hợp cho người vận hành thời trang.                     | **NÊN ẨN / LOẠI BỎ KHỎI SIDEBAR**                    |
| **Productivity**   | `/dashboard/productivity`   | Thống kê năng suất làm việc nhóm kiểu Jira/Linear — thừa thãi cho shop bán lẻ.                                           | **NÊN ẨN / LOẠI BỎ KHỎI SIDEBAR**                    |

#### 3. Nhóm Công Cụ & Tiện Ích (Tools)

| Màn hình     | Route                 | Đánh giá nghiệp vụ Vela Wear                                                                           | Khuyến nghị                       |
| :----------- | :-------------------- | :----------------------------------------------------------------------------------------------------- | :-------------------------------- |
| **Invoice**  | `/dashboard/invoice`  | **Rất cần thiết:** Xem, in hóa đơn VAT, phiếu xuất kho cho đơn hàng gửi khách.                         | **GIỮ LẠI**                       |
| **Chat**     | `/dashboard/chat`     | **Hữu ích:** Live Chat CSKH tư vấn chọn size, chất liệu và hỗ trợ giải quyết sự cố đơn hàng trực tiếp. | **GIỮ LẠI (Tuỳ chọn CSKH)**       |
| **Email**    | `/dashboard/mail`     | Hộp thư generic kiểu Outlook — vận hành viên dùng Gmail/GSuite doanh nghiệp riêng.                     | **NÊN ẨN / LOẠI BỎ KHỎI SIDEBAR** |
| **Calendar** | `/dashboard/calendar` | Lịch công tác generic không liên kết với luồng bán hàng hay sự kiện sale.                              | **NÊN ẨN / LOẠI BỎ KHỎI SIDEBAR** |
| **Kanban**   | `/dashboard/kanban`   | Bảng quản lý task dự án kiểu Agile — không phục vụ vận hành bán lẻ thời trang.                         | **NÊN ẨN / LOẠI BỎ KHỎI SIDEBAR** |
| **Tasks**    | `/dashboard/tasks`    | Danh sách todo checklist cá nhân generic.                                                              | **NÊN ẨN / LOẠI BỎ KHỎI SIDEBAR** |

---

## 7. Chuyển Động & Hiệu Năng Tương Tác (Motion & Micro-Interactions)

Admin Dashboard ưu tiên tuyệt đối **tốc độ phản hồi và sự mượt mà 60fps**:

1. **Tactile Push Feedback:** Mọi nút bấm tương tác đều có hiệu ứng nén nhẹ `active:scale-[0.97]` trong `100ms ease-out`.
2. **Modal & Drawer Transitions:**
   - Dialog Modal: Fade in (`opacity 0 -> 1`) kết hợp Scale nhẹ (`scale 0.98 -> 1`) trong `150ms cubic-bezier(0.16, 1, 0.3, 1)`.
   - Sheet Drawer (trượt từ phải sang): `transform translateX(100% -> 0)` trong `200ms cubic-bezier(0.16, 1, 0.3, 1)`.
3. **Loading States — Skeleton Shimmer:**
   - Tuyệt đối không dùng spinner tròn đơn điệu xoay giữa màn hình gây khó chịu.
   - Luôn sử dụng **Skeleton Shimmer** mô phỏng chính xác khung hình của Data Table và KPI Cards trong khi tải dữ liệu từ React Query.
4. **Hardware Acceleration:** Mọi animation chỉ tác động vào `transform` và `opacity`. Tuyệt đối không animate `height`, `width`, `top`, `left`.

---

## 8. Danh Sách Điều Cấm Kỵ Trong Giao Diện Admin (Explicit Anti-Patterns)

Nhằm ngăn chặn các lỗi thiết kế AI phổ biến (_AI Clichés & Tells_), đội ngũ phát triển phải tuân thủ nghiêm ngặt các điều cấm sau:

- ❌ **CẤM DÙNG MÀU KEM & TERRACOTTA CỦA STOREFRONT:** Không mang màu `#f7f4ef` hay `#b5573a` vào giao diện Admin để tránh gây nhầm lẫn môi trường và làm giảm độ sắc nét của bảng biểu.
- ❌ **CẤM DÙNG FONT SERIF:** Không dùng Tiempos, Cormorant Garamond hay bất kỳ font có chân nào trong Admin.
- ❌ **CẤM GRADIENT TÍM/XANH NEON (AI Purple Glow):** Không tạo hiệu ứng phát sáng neon hay gradient màu tím/hồng kiểu marketing SaaS trên các nút bấm quản trị.
- ❌ **CẤM BỐ CỤC LỒNG THẺ QUÁ MỨC (Cards-in-Cards Hell):** Không bọc thẻ card bên trong một thẻ card khác quá 2 lớp. Dùng đường kẻ phân cách `border-t border-[#e2e8f0]` hoặc khoảng cách padding để phân nhóm.
- ❌ **CẤM DÙNG SỐ LÀM TRÒN GIẢ TẠO:** Dữ liệu mockup trong quá trình phát triển phải chân thực (ví dụ: `1.428 sản phẩm`, `₫ 45.290.000`), không dùng `100%`, `50.00%`, `99.9%`.
- ❌ **CẤM DÙNG KIỂU DỮ LIỆU `any`:** Tuân thủ triệt để TypeScript Strict Type (`0 any errors`), tái sử dụng types từ `lib/api/types.ts`.
- ❌ **CẤM SPINNER XOAY TRÒN TOÀN TRANG:** Phải có skeleton loading tương ứng với từng widget.
- ❌ **CẤM NÚT BẤM BỊ XUỐNG DÒNG (CTA Wrap):** Nhãn nút bấm phải luôn nằm trên một dòng duy nhất (tối đa 2–3 từ: "Tạo sản phẩm", "Lưu thay đổi", "Xuất Excel").

---

## 9. Checklist Đảm Bảo Chất Lượng Trước Khi Đưa Lên Production (Admin QA Gate)

- [ ] **Contrast Verification:** Toàn bộ chữ trên nền sáng đạt WCAG 2.1 AA (>= 4.5:1), tiêu đề đạt AAA (>= 7:1).
- [ ] **Tabular Alignment:** Tất cả cột số tiền, số lượng, SKU, ID đều có class `tabular-nums font-mono` và căn phải chính xác.
- [ ] **Empty States:** Mọi màn hình danh sách đều có giao diện Trống (Empty State) chỉn chu kèm icon và nút CTA khởi tạo bản ghi đầu tiên.
- [ ] **Form Error Inline:** Mọi lỗi validation từ Backend (HTTP 400 DTO) đều hiển thị ngay dưới ô input tương ứng, không chỉ dựa vào toast notification.
- [ ] **Keyboard & Focus States:** Mọi dropdown, input, button đều có viền `focus-visible:ring-2 focus-visible:ring-[#2563eb]/20` rõ ràng khi dùng phím `Tab`.
- [ ] **Responsive Fallback:** Trên màn hình nhỏ (< 1024px), sidebar tự động thu gọn về dạng drawer/sheet, bảng dữ liệu cho phép cuộn ngang mượt mà (`overflow-x-auto`).
