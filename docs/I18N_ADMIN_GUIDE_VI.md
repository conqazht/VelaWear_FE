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

Không nhập một phần English. Với Product/Category, nếu bắt đầu nhập English thì phải có ít nhất `name` và `slug`. Slug English tự sinh theo dạng kebab ASCII khi admin nhập hoặc tạo tên English; admin vẫn có thể sửa riêng và slug đã sửa thủ công sẽ không bị việc gõ tiếp tên ghi đè. Với Sale Campaign, `name` English là bắt buộc khi đã nhập mô tả English.

## 3. Tạo nội dung English bằng Gemini (tùy chọn)

Trong tab English của Product, Category và Sale Campaign có nút **Tạo nội dung English**. Đây là công cụ gợi ý, không thay đổi quy tắc nhập tay:

1. Nhập ít nhất tên tiếng Việt.
2. Chọn một trong ba model Gemini được hệ thống cho phép.
3. Bấm **Tạo nội dung English**.
4. Kiểm tra và chỉnh lại nội dung được điền vào tab English.
5. Bấm **Lưu** theo luồng bình thường để ghi dữ liệu xuống database.

Ba lựa chọn model:

| Model gửi cho backend | Nhãn trên giao diện | Trường hợp phù hợp |
| --- | --- | --- |
| `gemini-3.1-flash-lite` | Tiết kiệm, mặc định | Nội dung catalog thông thường hoặc nhập số lượng lớn |
| `gemini-3.5-flash` | Cân bằng | Mô tả cần cân bằng chất lượng, tốc độ và chi phí |
| `gemini-3.1-pro-preview` | Chất lượng cao · Preview | Nội dung quan trọng hoặc phức tạp; cần lưu ý độ ổn định và chi phí của model Preview |

Frontend không cho nhập model tự do và luôn gửi đúng ID trong danh sách trên. API key Gemini chỉ được cấu hình ở backend, không đặt trong `.env` frontend và không gửi xuống trình duyệt.

Suggestion chỉ cập nhật state của form, không tự gọi API lưu translation. Product/Category tự sinh slug English từ tên do backend trả về; backend suggestion không nhận hoặc trả slug. Nếu tab English đang có bất kỳ nội dung nào, giao diện bắt buộc xác nhận trước khi thay toàn bộ nội dung English. Tiếng Việt không bị sửa.

Khi backend chưa cấu hình API key, bị rate limit hoặc provider lỗi, giao diện hiển thị lỗi và giữ nguyên toàn bộ nội dung đang soạn. Admin vẫn có thể nhập English thủ công và lưu như trước; việc tạo/sửa dữ liệu không phụ thuộc tính năng Gemini.

## 4. Product

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

## 5. Category

Các trường dùng chung:

- Parent category, sort order và status.

Các trường theo locale:

- `name`, `slug`, `description`, `seoTitle`, `seoDescription`.

Frontend vẫn chặn chọn chính Category hoặc một Category con làm parent. Việc đổi locale nội dung không làm đổi cây parent đang chọn.

## 6. Sale Campaign

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

## 7. Bật/tắt nhanh trong bảng

Toggle gọi endpoint PATCH status riêng và cập nhật giao diện trước. Nếu request lỗi, cache được khôi phục về trạng thái cũ và hiển thị thông báo lỗi.

| Resource | Toggle ON | Toggle OFF | Trạng thái khóa toggle |
| --- | --- | --- | --- |
| Product | `DRAFT/INACTIVE → ACTIVE` | `ACTIVE → INACTIVE` | `OUT_OF_STOCK` |
| Category | `INACTIVE → ACTIVE` | `ACTIVE → INACTIVE` | Không |
| Brand | `INACTIVE → ACTIVE` | `ACTIVE → INACTIVE` | Không |
| Product Variant | `INACTIVE → ACTIVE` | `ACTIVE → INACTIVE` | `OUT_OF_STOCK`, `DISCONTINUED` |

`OUT_OF_STOCK` và `DISCONTINUED` là trạng thái nghiệp vụ, không được ghi đè bằng quick toggle. Muốn thay đổi phải vào form phù hợp.

## 8. API frontend sử dụng

English suggestion, không persist:

```text
POST /products/translation-suggestions/en
POST /categories/translation-suggestions/en
POST /sale-campaigns/translation-suggestions/en
```

Mỗi request gửi nội dung tiếng Việt tương ứng và `model`. Response có `localeCode: "en"` cùng các trường được gợi ý, không có `slug`, `id` hoặc `version`.

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

## 9. Cache và metadata

Sau khi sửa bản dịch, status, variant hoặc Sale pricing, frontend invalidate cả cache admin và các root storefront liên quan: Product list (`products`), Product detail (`product`), Category (`categories`) và Sale (`sales`). Product/Category list không tái sử dụng placeholder từ locale khác. Trang Sale cập nhật `document.title` và meta description theo locale hiện tại mà không cần URL prefix.

## 10. Checklist nghiệm thu

1. Tạo Product, Category và Sale chỉ có VI; xác nhận vẫn lưu/publish/activate được.
2. Thêm EN, tải lại form và xác nhận tab EN đọc đúng raw translation, không đọc fallback.
3. Xóa toàn bộ EN rồi lưu; xác nhận badge EN mất và storefront English dùng VI fallback.
4. Đổi nhanh VI ↔ EN; xác nhận không lóe nội dung/cache của locale trước.
5. Thử slug EN trùng; xác nhận hiển thị lỗi backend rõ ràng và form vẫn giữ dữ liệu.
6. Toggle từng trạng thái trong bảng; giả lập request lỗi và xác nhận UI rollback.
7. Với Sale, mở hai phiên admin và xác nhận version conflict không âm thầm ghi đè.
8. Tạo suggestion cho cả ba resource bằng từng model; xác nhận request không chứa slug và form chưa tự lưu.
9. Khi English đã có dữ liệu, xác nhận phải đồng ý trong dialog mới được thay; bấm hủy hoặc gặp lỗi provider phải giữ nguyên dữ liệu.
10. Tắt API key backend hoặc giả lập lỗi `503/429/502`; xác nhận nhập tay và lưu Product/Category/Sale vẫn hoạt động.

Các lệnh kiểm tra frontend:

```bash
pnpm exec tsc --noEmit
pnpm test:unit
pnpm lint
pnpm build
```
