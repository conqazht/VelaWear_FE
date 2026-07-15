# Hướng dẫn quản trị nội dung VI/EN và status toggle

Tài liệu này mô tả cách admin nhập nội dung đa ngôn ngữ cho Product, Category và Sale Campaign, cùng quy tắc bật/tắt nhanh Product, Category, Brand và Product Variant.

## 1. Hai loại ngôn ngữ độc lập

Frontend có hai khái niệm khác nhau:

- **Ngôn ngữ giao diện**: quyết định chữ trên nút, menu, thông báo và bảng admin.
- **Ngôn ngữ nội dung**: tab `Tiếng Việt | English` trong form, quyết định dữ liệu khách hàng đọc ở storefront.

Đổi ngôn ngữ giao diện không tự đổi tab nội dung đang soạn. Admin có thể dùng giao diện tiếng Việt nhưng vẫn nhập tab English, hoặc ngược lại.

## 2. Quy tắc chung cho nội dung

- Tiếng Việt là nội dung gốc và bắt buộc.
- English là tùy chọn. Campaign vẫn publish và Product/Category vẫn activate được khi chưa có English.
- Khi English không tồn tại, public API trả nội dung tiếng Việt làm fallback.
- Badge `Đã đủ/Còn thiếu` trên tab và badge `VI/EN` trong bảng giúp nhìn nhanh locale nào đã có dữ liệu.
- Muốn xóa bản English đã lưu, xóa toàn bộ trường trong tab English rồi lưu. Frontend gọi DELETE locale; không gửi một bản dịch rỗng.
- Slug là nội dung theo locale. Slug tiếng Việt và English có thể khác nhau, nhưng từng slug phải duy nhất theo quy tắc backend.

Không nhập một phần English. Với Product/Category, nếu bắt đầu nhập English thì phải có ít nhất `name` và `slug`. Với Sale Campaign, `name` English là bắt buộc khi đã nhập mô tả English.

## 3. Product

Các trường dùng chung cho cả hai locale:

- Category, Brand và status.
- Variants, SKU, màu, size, giá, stock, ảnh và trạng thái variant.

Các trường theo locale:

- `name`, `slug`, `shortDescription`, `description`;
- `material`, `careInstruction`;
- `seoTitle`, `seoDescription`.

Luồng tạo Product vẫn là workflow nhiều bước:

1. Tạo Product ở trạng thái nháp.
2. Lưu batch bản dịch VI và EN nếu có.
3. Tạo/cập nhật variants.
4. Áp dụng status Product và variant mong muốn.

Nếu một bước sau thất bại, form giữ lại Product đã tạo để admin bấm lưu lại an toàn; không tạo thêm Product trùng. Thông báo lỗi cho biết dữ liệu có thể đã được lưu một phần.

Khi activate Product mới, frontend có thể phải lưu variant tạm ở `INACTIVE` trước khi bật Product. Trạng thái variant mà admin chọn được giữ trong một checkpoint riêng và chỉ ghi ngược vào form sau khi toàn bộ workflow thành công; retry không làm mất ý định `ACTIVE` và không tạo lại variant đã lưu.

## 4. Category

Các trường dùng chung:

- Parent category, sort order và status.

Các trường theo locale:

- `name`, `slug`, `description`, `seoTitle`, `seoDescription`.

Frontend vẫn chặn chọn chính Category hoặc một Category con làm parent. Việc đổi locale nội dung không làm đổi cây parent đang chọn.

## 5. Sale Campaign

Các trường dùng chung:

- `code`, banner, loại `STANDARD/FLASH`, lịch chạy;
- danh sách variant, promotional price, quota và giới hạn mỗi khách.

Các trường theo locale:

- `name`, `description`.

`code` không dịch và vẫn là định danh nghiệp vụ dùng chung. Thêm English không thay đổi lifecycle Sale:

- `DRAFT`: sửa toàn bộ, có thể xóa;
- `PUBLISHED + UPCOMING`: sửa theo rule hiện tại;
- `LIVE`: chỉ sửa display, tăng quota hoặc kết thúc theo action hiện có;
- `ENDED/CANCELLED`: chỉ xem hoặc clone.

Mọi lần ghi bản dịch Sale gửi `version`. Nếu xóa English, frontend dùng `version` mới nhất trả về từ batch PUT để tránh ghi đè thay đổi của admin khác.

Nếu POST tạo draft thành công nhưng PUT translation lỗi, editor giữ ngay `id/version` của draft cùng toàn bộ dữ liệu form. Lần bấm lưu tiếp theo dùng PUT trên đúng campaign đó, không POST thêm campaign trùng.

## 6. Bật/tắt nhanh trong bảng

Toggle gọi endpoint PATCH status riêng và cập nhật giao diện trước. Nếu request lỗi, cache được khôi phục về trạng thái cũ và hiển thị thông báo lỗi.

| Resource | Toggle ON | Toggle OFF | Trạng thái khóa toggle |
| --- | --- | --- | --- |
| Product | `DRAFT/INACTIVE → ACTIVE` | `ACTIVE → INACTIVE` | `OUT_OF_STOCK` |
| Category | `INACTIVE → ACTIVE` | `ACTIVE → INACTIVE` | Không |
| Brand | `INACTIVE → ACTIVE` | `ACTIVE → INACTIVE` | Không |
| Product Variant | `INACTIVE → ACTIVE` | `ACTIVE → INACTIVE` | `OUT_OF_STOCK`, `DISCONTINUED` |

`OUT_OF_STOCK` và `DISCONTINUED` là trạng thái nghiệp vụ, không được ghi đè bằng quick toggle. Muốn thay đổi phải vào form phù hợp.

## 7. API frontend sử dụng

Raw translation:

```text
GET    /products/{id}/translations
PUT    /products/{id}/translations
DELETE /products/{id}/translations/{locale}

GET    /categories/{id}/translations
PUT    /categories/{id}/translations
DELETE /categories/{id}/translations/{locale}

GET    /sale-campaigns/{id}/translations
PUT    /sale-campaigns/{id}/translations
DELETE /sale-campaigns/{id}/translations/{locale}?version={version}
```

Product/Category GET và PUT trả `{ "translations": [...] }`. Sale GET, PUT và DELETE trả `{ "version": n, "translations": [...] }`; frontend luôn dùng version Sale mới nhất cho lệnh kế tiếp.

Status:

```text
PATCH /products/{id}/status
PATCH /categories/{id}/status
PATCH /brands/{id}/status
PATCH /product-variants/{id}/status
```

Public Sale gửi locale trong query, ví dụ `GET /sales?type=FLASH&locale=en`. Cache key cũng chứa locale nên không hiển thị thoáng qua nội dung ngôn ngữ cũ khi đổi ngôn ngữ.

## 8. Cache và metadata

Sau khi sửa bản dịch, status, variant hoặc Sale pricing, frontend invalidate cả cache admin và các root storefront liên quan: Product list (`products`), Product detail (`product`), Category (`categories`) và Sale (`sales`). Product/Category list không tái sử dụng placeholder từ locale khác. Trang Sale cập nhật `document.title` và meta description theo locale hiện tại mà không cần URL prefix.

## 9. Checklist nghiệm thu

1. Tạo Product, Category và Sale chỉ có VI; xác nhận vẫn lưu/publish/activate được.
2. Thêm EN, tải lại form và xác nhận tab EN đọc đúng raw translation, không đọc fallback.
3. Xóa toàn bộ EN rồi lưu; xác nhận badge EN mất và storefront English dùng VI fallback.
4. Đổi nhanh VI ↔ EN; xác nhận không lóe nội dung/cache của locale trước.
5. Thử slug EN trùng; xác nhận hiển thị lỗi backend rõ ràng và form vẫn giữ dữ liệu.
6. Toggle từng trạng thái trong bảng; giả lập request lỗi và xác nhận UI rollback.
7. Với Sale, mở hai phiên admin và xác nhận version conflict không âm thầm ghi đè.

Các lệnh kiểm tra frontend:

```bash
pnpm exec tsc --noEmit
pnpm test:unit
pnpm lint
pnpm build
```
