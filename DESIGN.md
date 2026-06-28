## Overview

Vela Wear là một trang thương mại điện tử thời trang theo phong cách **editorial, ấm áp, tối giản sang trọng** — gần với một tạp chí thời trang in ấn hơn là một SaaS app điển hình. Nền tảng là **canvas màu kem ấm** (`{colors.canvas}` — #f7f4ef), khác biệt rõ với nền trắng/xám lạnh mà hầu hết các trang bán hàng thời trang đang dùng. Tiêu đề dùng **slab-serif display** (Tiempos Headline / Cormorant Garamond) ở weight 400-500 với letter-spacing âm nhẹ, kết hợp với **Inter / StyreneB** cho phần body — tạo cảm giác như đang đọc một bộ lookbook hơn là lướt một cửa hàng online thông thường.

Điểm nhấn thương hiệu là cặp **kem + terracotta (đất nung)** — terracotta (`{colors.primary}` — #b5573a) là màu accent chính, dùng cho CTA, badge "MỚI", giá sale, và các banner khuyến mãi full-bleed. Terracotta ấm, trầm, mang tính "heritage/artisan" — khác với đỏ rực của các sàn TMĐT lớn (Shopee, Lazada) và khác với coral của các brand công nghệ AI.

Hệ thống có ba chế độ nền xen kẽ theo từng section:
1. **Cream canvas** (`{colors.canvas}`) — nền mặc định của toàn trang
2. **Light cream cards** (`{colors.surface-card}`) — nền cho card sản phẩm, feature block
3. **Dark warm-brown surfaces** (`{colors.surface-dark}`) — banner lookbook, footer, banner sale lớn

Các nền tối là nơi hiển thị **ảnh sản phẩm/lookbook thật** (full-bleed photography) — đây là điểm khác biệt lớn nhất so với bản gốc Anthropic (nơi nền tối hiển thị code mockup). Sự đối lập kem-tối là nhịp điệu chính của trang.

**Đặc điểm chính:**
- Canvas kem ấm (`{colors.canvas}` — #f7f4ef) với chữ ink ấm gần đen (`{colors.ink}` — #1c1a18). Lựa chọn màu định danh của thương hiệu.
- CTA chính màu terracotta (`{colors.primary}` — #b5573a). Dùng hạn chế trên từng nút riêng lẻ, dùng rộng trên các banner sale full-bleed.
- Tiêu đề slab-serif display qua Tiempos Headline / Cormorant Garamond ở weight 400-500 với letter-spacing âm. Kết hợp với sans-serif body nhân văn cho giọng điệu editorial sang trọng.
- Các banner lookbook nền tối (`{colors.surface-dark}` — #1c1a18) hiển thị **ảnh chụp sản phẩm/người mẫu thật** — thương hiệu thể hiện sản phẩm thực tế chứ không phải illustration trừu tượng.
- Card sản phẩm nền kem nhạt (`{colors.surface-card}` — #efe7dc) — đậm hơn canvas một chút, dùng cho grid sản phẩm và feature block.
- Logo Vela Wear — một dấu ngoặc/đường nét đơn giản (xem phần Shapes) — xuất hiện như tiền tố wordmark và như dấu phân đoạn nội dung.
- Border radius theo phong cách Vercel/Geist — 3 tier rõ ràng: `{rounded.none}` (0px) cho ảnh sản phẩm/lookbook, `{rounded.sm}` (6px) cho controls, `{rounded.md}` (12px) cho cards, `{rounded.lg}` (16px) cho surfaces lớn, `{rounded.pill}` cho badge/chip. Nhất quán, không pha trộn sharp và round trong cùng một view.
- Nhịp section `{spacing.section}` (88px) — hơi chặt hơn chuẩn SaaS để phù hợp mật độ hình ảnh sản phẩm. Padding nội bộ card vẫn rộng ở `{spacing.xl}` (32px).

## Colors

### Brand & Accent
- **Terracotta / Primary** (`{colors.primary}` — #b5573a): Màu accent chính của Vela Wear, đậm và trầm hơn coral gốc của Anthropic để tránh trùng nhận diện với các thương hiệu AI. Dùng cho nút CTA chính, badge "MỚI"/"SALE", giá khuyến mãi, banner full-bleed.
- **Terracotta Active** (`{colors.primary-active}` — #8f4329): Trạng thái nhấn/hover-đậm hơn.
- **Terracotta Disabled** (`{colors.primary-disabled}` — #e6d9cf): Trạng thái disabled nhạt, tông kem.
- **Accent Sage** (`{colors.accent-sage}` — #7a8a6f): Màu phụ dùng hạn chế cho tag "Bền vững"/"Eco", chỉ báo còn hàng dạng chấm màu.
- **Accent Gold** (`{colors.accent-gold}` — #d4a85f): Màu phụ ấm dùng cho badge "Bộ sưu tập giới hạn", highlight inline trong nội dung biên tập.

### Surface
- **Canvas** (`{colors.canvas}` — #f7f4ef): Nền mặc định toàn trang. Kem ấm — không phải trắng tinh.
- **Surface Soft** (`{colors.surface-soft}` — #f1ebe1): Section dividers, băng nền rất nhạt giữa các khối nội dung.
- **Surface Card** (`{colors.surface-card}` — #efe7dc): Card sản phẩm, card nội dung. Đậm hơn canvas một bậc.
- **Surface Cream Strong** (`{colors.surface-cream-strong}` — #e6dccb): Tab filter đang chọn, băng section nhấn mạnh (ví dụ "Bộ sưu tập mới").
- **Surface Dark** (`{colors.surface-dark}` — #1c1a18): Banner lookbook, footer, banner sale lớn. Nền tối chủ đạo.
- **Surface Dark Elevated** (`{colors.surface-dark-elevated}` — #28241f): Card nổi trong các băng tối (ví dụ form newsletter trong footer).
- **Surface Dark Soft** (`{colors.surface-dark-soft}` — #221f1c): Tông tối nhẹ hơn, dùng cho overlay text trên ảnh lookbook để đảm bảo độ đọc.
- **Hairline** (`{colors.hairline}` — #e3dccf): Viền 1px trên nền kem. Dùng cho input, divider giữa sản phẩm.
- **Hairline Soft** (`{colors.hairline-soft}` — #ece6dc): Đường phân chia gần như vô hình, dùng trong cùng một băng.

### Text
- **Ink** (`{colors.ink}` — #1c1a18): Toàn bộ tiêu đề và text chính. Đen ấm, không tuyệt đối đen.
- **Body Strong** (`{colors.body-strong}` — #2a2825): Đoạn văn nhấn mạnh, mô tả sản phẩm chính.
- **Body** (`{colors.body}` — #3d3a36): Màu text chạy mặc định.
- **Muted** (`{colors.muted}` — #8a857c): Mô tả phụ, giá gốc gạch ngang, label dưới.
- **Muted Soft** (`{colors.muted-soft}` — #b0aaa0): Caption nhỏ, fine-print, copyright footer.
- **On Primary** (`{colors.on-primary}` — #ffffff): Text trên nút terracotta.
- **On Dark** (`{colors.on-dark}` — #f7f4ef): Trắng-tông-kem dùng trên nền tối (vọng lại tông canvas).
- **On Dark Soft** (`{colors.on-dark-soft}` — #a89e93): Text body footer, label phụ trên ảnh lookbook.

### Semantic
- **Success / Còn hàng** (`{colors.success}` — #5d8a6c): Chấm trạng thái "Còn hàng", tag "Bền vững".
- **Warning / Sắp hết** (`{colors.warning}` — #d4a017): Tag "Sắp hết hàng", "Chỉ còn vài size".
- **Error / Hết hàng** (`{colors.error}` — #b04a3a): Trạng thái "Hết hàng", lỗi form thanh toán.
- **Sale** (`{colors.sale}` — #b5573a): Dùng lại màu primary cho giá sale — tránh thêm một tông đỏ thứ ba gây loãng bảng màu.

## Typography

### Font Family
Hệ thống dùng **Tiempos Headline** (hoặc **Cormorant Garamond** weight 500, letter-spacing -0.02em làm thay thế mã nguồn mở) làm font slab-serif display cho tiêu đề, và **Inter** (hoặc **StyreneB** nếu có license) làm font sans nhân văn cho body, navigation, label UI. **JetBrains Mono** không cần thiết cho Vela Wear (không có code block) — thay vào đó dùng **Inter** ở weight 500 + uppercase + letter-spacing rộng cho mọi nhãn dạng "mã sản phẩm"/SKU. Fallback stack: `Cormorant Garamond, Garamond, "Times New Roman", serif` cho display và `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` cho body.

Phân chia display/body mang tính editorial:
- Cormorant Garamond / Tiempos (weight 400-500, tracking âm) → h1, h2, h3, tên bộ sưu tập, tên sản phẩm nổi bật
- Inter (weight 400-500) → body, navigation, nút, mô tả sản phẩm, label
- Inter uppercase + tracking rộng → mã SKU, badge, nhãn size/màu

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 56px | 400 | 1.08 | -1.2px | Hero homepage ("Vela Wear — Bộ sưu tập Thu 2026") — serif |
| `{typography.display-lg}` | 40px | 400 | 1.12 | -0.8px | Tiêu đề bộ sưu tập, section heads — serif |
| `{typography.display-md}` | 32px | 400 | 1.18 | -0.4px | Tên sản phẩm trên trang chi tiết — serif |
| `{typography.display-sm}` | 24px | 500 | 1.25 | -0.2px | Tiêu đề banner sale, tên collection nhỏ — serif |
| `{typography.title-lg}` | 20px | 500 | 1.3 | 0 | Tên section grid sản phẩm — Inter |
| `{typography.title-md}` | 16px | 500 | 1.4 | 0 | Tên sản phẩm trên product card |
| `{typography.title-sm}` | 14px | 500 | 1.4 | 0 | Label filter, breadcrumb |
| `{typography.body-md}` | 16px | 400 | 1.55 | 0 | Mô tả sản phẩm, nội dung chính — Inter |
| `{typography.body-sm}` | 14px | 400 | 1.55 | 0 | Footer body, chi tiết vận chuyển/đổi trả |
| `{typography.price}` | 16px | 500 | 1.3 | 0 | Giá hiện tại trên product card |
| `{typography.price-strike}` | 14px | 400 | 1.3 | 0 | Giá gốc gạch ngang, màu muted |
| `{typography.caption}` | 13px | 500 | 1.4 | 0 | Caption ảnh, ghi chú size |
| `{typography.caption-uppercase}` | 11px | 500 | 1.4 | 1.8px | "MỚI", "SALE", "HẾT HÀNG", mã SKU |
| `{typography.button}` | 14px | 500 | 1.0 | 0.5px | Nhãn nút (uppercase nhẹ cho cảm giác cao cấp) |
| `{typography.nav-link}` | 14px | 500 | 1.4 | 0 | Mục menu top-nav |

### Principles
Display giữ weight 400-500, không bao giờ dùng bold đậm (700+). Letter-spacing âm (-0.2 đến -1.2px) là bắt buộc cho các cỡ display — thiếu nó font serif sẽ mất đi cảm giác cao cấp. Đặc tính serif là giọng nói editorial/thời trang của Vela Wear; chuyển sang sans-serif cho display sẽ khiến trang giống một cửa hàng fast-fashion thông thường.

Body giữ weight 400 cho đoạn văn, weight 500 cho label và cụm từ nhấn mạnh (ví dụ giá, tên sản phẩm). Body sans là nhân văn (Inter) — không dùng font geometric (Helvetica/Arial quá trung tính, phá vỡ cảm giác ấm-editorial).

### Note on Font Substitutes
Nếu Tiempos Headline không khả dụng, **Cormorant Garamond** weight 500 với letter-spacing -0.02em là lựa chọn mã nguồn mở gần nhất. **EB Garamond** là phương án dự phòng tiếp theo. Cho phần body, **Inter** là lựa chọn chính — nếu cần thay thế, **Söhne** hoặc **General Sans** là các phương án gần.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 88px.
- **Section padding:** `{spacing.section}` (88px) — chặt hơn chuẩn SaaS một chút để grid sản phẩm xuất hiện sớm hơn khi cuộn.
- **Card internal padding:** `{spacing.xl}` (32px) cho feature card, banner sale; `{spacing.md}` (16px) cho product card (ảnh chiếm phần lớn diện tích, text nhỏ gọn dưới ảnh).
- **Callout / CTA bands:** `{spacing.xxl}` (48px) trong banner terracotta; 64px trong băng lookbook lớn.

### Grid & Container
- **Max content width:** ~1280px centered (rộng hơn bản gốc một chút để grid sản phẩm thoáng).
- **Editorial body:** Single 12-column grid; hero dùng full-bleed ảnh lookbook với overlay text, hoặc 6/6 split (text trái, ảnh phải).
- **Product grid:** 4-up desktop, 3-up tablet, 2-up mobile (giữ tối thiểu 2 cột trên mobile để duy trì cảm giác "lưới sản phẩm").
- **Lookbook/banner grid:** Full-width, hoặc 2-up cho "Bộ sưu tập Nam/Nữ".
- **Filter/category tile grids:** 6-up desktop, 3-up tablet, 2-up mobile.

### Whitespace Philosophy
Canvas kem + serif display + ảnh sản phẩm chất lượng cao tạo nhịp điệu editorial — Vela Wear đọc như một catalogue thời trang in chứ không phải một template TMĐT. Khoảng trắng giữa các băng giữ ở 88px; khoảng trắng trong product card gọn (16px) để tối đa hóa không gian ảnh, còn card nội dung/feature giữ rộng (32px).

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | Không shadow, không border | Body section, top nav, hero band |
| Soft hairline | Viền 1px `{colors.hairline}` | Input, sub-nav, product card (tùy chọn) |
| Cream card | Nền `{colors.surface-card}` — không shadow | Feature card, card nội dung biên tập |
| Dark surface card | Nền `{colors.surface-dark}` — không shadow | Banner lookbook, footer, banner sale lớn |
| Subtle drop shadow | Shadow rất nhạt | Trạng thái hover của product card: `0 2px 8px rgba(28,26,24,0.06)` |

Triết lý elevation là **color-block trước, shadow hiếm**. Phần lớn độ sâu đến từ đối lập nền kem-vs-tối và từ chính ảnh sản phẩm (có shadow/depth tự nhiên trong ảnh). Shadow chỉ xuất hiện nhẹ khi hover trên product card để gợi ý có thể click.

### Decorative Depth
- Logo Vela Wear (xem Shapes) xuất hiện nhỏ trong wordmark và như dấu phân đoạn giữa các section nội dung dài.
- Banner lookbook mang theo độ sâu nội tại từ ảnh: ánh sáng tự nhiên, vải có texture, overlay gradient tối nhẹ ở dưới để text "On Dark" luôn đọc được.
- Một số hero dùng ảnh full-bleed với overlay gradient từ trong (đậm) ra ngoài (nhạt) để text headline luôn nổi trên ảnh, không cần card riêng.

## Shapes

### Border Radius Scale

Hệ thống bo tròn theo triết lý Vercel/Geist: **3 tier rõ ràng**, không pha trộn sharp và round trong cùng một view. Mỗi tier phục vụ một nhóm element cụ thể — controls, cards, surfaces lớn — giúp hierarchy trực quan và nhất quán hơn so với nhiều bậc radius khác nhau.

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Ảnh sản phẩm trong grid chính, ảnh lookbook full-bleed, `button-add-to-cart-overlay` (khớp cạnh ảnh). Flat-edge = cảm giác catalogue cao cấp. |
| `{rounded.sm}` | 6px | **Tier controls:** Nút CTA (`button-primary`, `button-secondary`), input (`text-input`), tab filter (`category-tab`), `button-icon-circular`. Mọi control tương tác dùng tier này. |
| `{rounded.md}` | 12px | **Tier cards:** Feature card, card nội dung biên tập, dropdown menus. |
| `{rounded.lg}` | 16px | **Tier surfaces lớn:** Banner sale (`callout-card-terracotta`), card lookbook (`collection-banner-dark` khi không full-bleed), `newsletter-band-dark`. |
| `{rounded.pill}` | 9999px | Badge ("MỚI", "SALE", "HẾT HÀNG"), filter chip, avatar đánh giá khách hàng, swatch màu tròn. |

> **Lưu ý bỏ `{rounded.xs}` (4px cũ):** Token này đã được hợp nhất vào `{rounded.sm}` (6px) để giảm số bậc và giữ nhất quán với Geist. Mọi chỗ trước đây dùng `{rounded.xs}` nay dùng `{rounded.sm}`.

### Photography & Illustrations
Vela Wear dựa hoàn toàn vào **nhiếp ảnh sản phẩm/người mẫu thật** — đây là khác biệt cốt lõi so với hệ thống gốc:
- Ảnh sản phẩm tỉ lệ 3:4 (chân dung), nền studio sáng hoặc on-location, không bo góc trong grid chính (`{rounded.none}`)
- Ảnh lookbook full-bleed trên nền `{colors.surface-dark}`, overlay gradient tối nhẹ cho text, không bo góc
- Ảnh chi tiết vải/texture dùng trong card "Chất liệu" — crop vuông 1:1
- Illustration chỉ xuất hiện ở mức tối thiểu: icon line-art đơn sắc (ink hoặc terracotta) cho size guide, hướng dẫn bảo quản vải
- Avatar đánh giá khách hàng crop tròn 36px (`{rounded.pill}`)

## Components

### Top Navigation

**`top-nav`** — Thanh nav kem cố định trên cùng mỗi trang. Cao 64px, nền `{colors.canvas}`. Logo Vela Wear bên trái, menu chính giữa-trái (Nữ, Nam, Bộ sưu tập, Sale, Về Vela), cụm bên phải gồm icon Tìm kiếm, icon Tài khoản, icon Giỏ hàng (có badge số lượng terracotta). Mục menu dùng `{typography.nav-link}` (Inter 14px/500). Nav không có border-radius — flat toàn chiều rộng.

### Buttons

**`button-primary`** — CTA terracotta chính. Nền `{colors.primary}` (#b5573a), text `{colors.on-primary}` (trắng), type `{typography.button}` (Inter 14px/500, tracking 0.5px, có thể uppercase), padding 14px × 24px, height 44px, rounded `{rounded.sm}` **(6px)**. Trạng thái active `button-primary-active` đậm về `{colors.primary-active}` (#8f4329).

**`button-secondary`** — Nút kem viền hairline. Nền `{colors.canvas}`, text `{colors.ink}`, viền hairline 1px, cùng padding/height với primary, rounded `{rounded.sm}` **(6px)**. Dùng cho "Thêm vào giỏ" trên product card khi chưa hover.

**`button-secondary-on-dark`** — Dùng trên các banner `{colors.surface-dark}`. Nền `{colors.surface-dark-elevated}` (#28241f), text `{colors.on-dark}`, rounded `{rounded.sm}` **(6px)**. Giữ tối — hệ thống không đảo sang nút sáng trên nền tối.

**`button-add-to-cart-overlay`** — Nút "Thêm vào giỏ" xuất hiện đè lên ảnh sản phẩm khi hover, nền `{colors.canvas}` ở 95% opacity, text `{colors.ink}`, full-width đáy ảnh, rounded `{rounded.none}` **(0px)** để khớp cạnh ảnh phẳng.

**`button-icon-circular`** — Nút icon tròn 40px. Nền `{colors.canvas}`, viền hairline, icon màu ink, rounded `{rounded.sm}` **(6px)** — hoặc `{rounded.pill}` nếu muốn hoàn toàn tròn (tùy context). Dùng cho Tìm kiếm, Yêu thích (icon tim), điều hướng carousel.

**`text-link`** — Link inline trong `{colors.primary}` (terracotta). Gạch chân khi nhấn; dùng cho "Xem tất cả", "Chi tiết sản phẩm".

### Cards & Containers

**`hero-band`** — Hero full-bleed ảnh lookbook trên `{colors.surface-dark}` với overlay gradient, headline + sub-headline + CTA đặt ở góc dưới-trái hoặc giữa-trái, text `{colors.on-dark}`. Padding dọc `{spacing.section}` (88px). Rounded `{rounded.none}` — full-bleed không bo góc. Phương án thay thế: 6-6 split với text trên canvas bên trái, ảnh bên phải.

**`product-card`** — Đơn vị cốt lõi của Vela Wear. Ảnh sản phẩm 3:4 rounded `{rounded.none}` **(0px)**, badge (nếu có: "MỚI"/"SALE") ở góc trên-trái dạng `{component.badge-pill}`, icon yêu thích góc trên-phải. Dưới ảnh: tên sản phẩm `{typography.title-md}`, giá `{typography.price}` (+ giá gốc gạch nếu sale), swatch màu nhỏ (chấm tròn 16px). Padding text dưới ảnh `{spacing.sm}` (12px). Hover: hiện `{component.button-add-to-cart-overlay}` + shadow nhẹ `0 2px 8px rgba(28,26,24,0.06)`.

**`feature-card`** — Dùng trong các block biên tập (ví dụ "Vì sao chọn Vela", "Chất liệu bền vững"). Nền `{colors.surface-card}` (#efe7dc), rounded `{rounded.md}` **(12px)**, padding `{spacing.xl}` (32px). Icon nhỏ ở trên, tiêu đề `{typography.title-lg}`, mô tả `{typography.body-md}`.

**`collection-banner-dark`** — Card lookbook nền tối lớn, hiển thị ảnh bộ sưu tập + tên collection (serif, on-dark) + CTA "Khám phá ngay". Nền `{colors.surface-dark}`, rounded `{rounded.lg}` **(16px)** hoặc full-bleed (`{rounded.none}`), padding `{spacing.xl}` (32px) cho vùng text overlay.

**`size-color-selector`** — Khối chọn size/màu trên trang chi tiết sản phẩm. Size: các ô vuông `{rounded.sm}` **(6px)** viền hairline, active có viền `{colors.primary}`. Màu: chấm tròn `{rounded.pill}` 28px, active có viền ngoài `{colors.ink}` cách 2px.

**`price-tag`** — Cụm hiển thị giá. Giá hiện tại `{typography.price}` màu `{colors.ink}`; nếu có sale, giá gốc `{typography.price-strike}` màu `{colors.muted}` gạch ngang đặt trước, và badge phần trăm giảm dùng `{component.badge-coral}`.

**`callout-card-terracotta`** — Banner full-bleed cho khuyến mãi lớn (ví dụ "Sale cuối mùa — giảm đến 40%"). Nền `{colors.primary}` (#b5573a), text `{colors.on-primary}` (trắng), rounded `{rounded.lg}` **(16px)**, padding `{spacing.xxl}` (48px). CTA bên trong dùng nút đảo màu kem/canvas trên nền terracotta.

**`category-tile`** — Dùng trong grid danh mục trang chủ (Áo, Quần, Phụ kiện...). Ảnh nền vuông 1:1, rounded `{rounded.none}` **(0px)**, tên danh mục overlay ở dưới với gradient tối nhẹ, text `{colors.on-dark}` `{typography.title-md}`.

### Inputs & Forms

**`text-input`** — Input chuẩn (tìm kiếm, email newsletter, form thanh toán). Nền `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-md}`, rounded `{rounded.sm}` **(6px)**, padding 12px × 16px, height 44px. Viền hairline 1px `{colors.hairline}`.

**`text-input-focused`** — Trạng thái focus. Viền chuyển sang `{colors.primary}` (terracotta), thêm outer ring 3px terracotta ở 15% alpha.

**`newsletter-band-dark`** — Băng đăng ký nhận tin trong footer hoặc giữa trang. Nền `{colors.surface-dark}`, rounded `{rounded.lg}` **(16px)**, text `{colors.on-dark}`, chứa `{component.text-input}` (nền tối hơn: `{colors.surface-dark-elevated}`) + `{component.button-primary}`.

### Tags / Badges

**`badge-pill`** — Pill nhỏ cho tag thông tin chung (ví dụ "Cotton hữu cơ"). Nền `{colors.surface-card}`, text `{colors.ink}`, type `{typography.caption}` (13px/500), rounded `{rounded.pill}`, padding 4px × 12px.

**`badge-coral`** *(đổi tên gợi nhớ: badge-terracotta)* — Badge nền terracotta cho "MỚI", "SALE", "-30%". Nền `{colors.primary}`, text `{colors.on-primary}`, type `{typography.caption-uppercase}` (11px/500/tracking 1.8px), rounded `{rounded.pill}`, padding 4px × 12px.

**`badge-stock`** — Badge trạng thái kho. "Còn hàng": chấm `{colors.success}` + text muted. "Sắp hết": nền `{colors.warning}` ở 15% alpha, text ink. "Hết hàng": nền `{colors.surface-soft}`, text `{colors.muted}`, ảnh sản phẩm giảm opacity 60%.

### Tab / Filter

**`category-tab`** + **`category-tab-active`** — Dùng trong sub-nav trang danh mục (Áo thun, Áo sơ mi, Quần...). Inactive: nền trong suốt, text `{colors.muted}`. Active: nền `{colors.surface-card}`, text `{colors.ink}`. Padding 8px × 16px, rounded `{rounded.sm}` **(6px)**.

**`filter-chip`** — Chip filter có thể xóa (ví dụ "Size: M ×", "Màu: Đen ×"). Nền `{colors.surface-card}`, rounded `{rounded.pill}`, padding 6px × 12px, icon × để xóa filter.

### CTA / Footer

**`cta-band-terracotta`** — Băng CTA trước footer (ví dụ "Đăng ký nhận ưu đãi 10% cho đơn đầu tiên"). Nền terracotta full-width, text trắng, rounded `{rounded.lg}` **(16px)**, padding 64px. H2 dùng `{typography.display-sm}` (vẫn serif), sub-line, và `{component.newsletter-band-dark}` biến thể nền sáng hoặc nút kem.

**`cta-band-dark-lookbook`** — Phương án thay thế: băng tối với ảnh lookbook nền + headline serif on-dark + CTA "Khám phá bộ sưu tập". Rounded `{rounded.none}` nếu full-bleed, `{rounded.lg}` **(16px)** nếu có margin hai bên.

**`footer`** — Footer nền tối khép mọi trang. Nền `{colors.surface-dark}` (#1c1a18), text `{colors.on-dark-soft}`. 4 cột link desktop: Mua sắm / Về Vela Wear / Hỗ trợ khách hàng (đổi trả, vận chuyển, FAQ) / Pháp lý. Padding dọc 64px. Logo Vela Wear + dòng "© Vela Wear" ở trên cùng bằng `{colors.on-dark}`. Footer không bao giờ đảo màu. Không có border-radius — flat toàn chiều rộng.

## Do's and Don'ts

### Do
- Đặt mọi trang trên nền canvas kem. Trắng tinh khiến trang giống mọi sàn TMĐT khác; tông kem là điểm khác biệt thương hiệu.
- Dùng serif Cormorant Garamond/Tiempos cho mọi tiêu đề display. Kết hợp với Inter cho body. Letter-spacing âm ở các cỡ display là bắt buộc.
- Dành `{colors.primary}` (terracotta) cho CTA chính và các banner sale full-bleed (`{component.callout-card-terracotta}`). Không tô terracotta ở các điểm nhấn khác.
- Dùng `{component.collection-banner-dark}` và ảnh lookbook full-bleed để thể hiện sản phẩm thật. Không vẽ illustration thay cho ảnh sản phẩm.
- Kết hợp `{component.feature-card}` (kem) với `{component.collection-banner-dark}` (tối) theo nhịp xen kẽ. Nhịp kem-tối là cơ chế tạo cảm giác editorial.
- Giữ ảnh sản phẩm flat-edge (`{rounded.none}`) trong grid chính — cảm giác cao cấp, gần với catalogue in.
- Áp dụng `{spacing.section}` (88px) giữa các băng chính.
- Giữ **một radius family trong mỗi view**: không pha trộn `{rounded.sm}` (6px) với `{rounded.lg}` (16px) trong cùng một component. Tier controls → `{rounded.sm}`, tier cards → `{rounded.md}`, tier surfaces → `{rounded.lg}`.

### Don't
- Không dùng xám lạnh hoặc trắng tinh cho canvas. Kem là thương hiệu.
- Không in đậm (bold 700+) cho display serif. Giữ ở weight 400-500.
- Không dùng xanh dương lạnh hoặc cyan bão hòa làm accent. Terracotta là điểm nhấn duy nhất.
- Không tô terracotta tràn lan. Terracotta khan hiếm trên từng element, chỉ rộng trên banner sale full-bleed.
- Không dùng coral gốc (#cc785c) của Anthropic — dùng terracotta đậm (#b5573a) để tránh trùng nhận diện với thương hiệu công nghệ AI.
- Không bo góc lớn (`{rounded.md}` hoặc `{rounded.lg}`) cho ảnh sản phẩm trong grid chính — phá vỡ cảm giác catalogue cao cấp. Ảnh luôn dùng `{rounded.none}`.
- Không pha trộn `{rounded.none}` và `{rounded.lg}` trong cùng một component (ngoại trừ ảnh bên trong card). Chọn một tier radius cho mỗi loại element và giữ nhất quán.
- Không lặp cùng một chế độ nền ở hai băng liên tiếp. Nhịp xen kẽ: kem → kem-card → tối-lookbook → kem → terracotta-callout → tối-footer.
- Không thêm hiệu ứng hover ngoài những gì hệ thống đã quy định — primary đậm khi nhấn, product card có shadow nhẹ + hiện nút khi hover; không thêm gì khác.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Hamburger nav; hero h1 56→28px; hero full-bleed giữ nguyên tỉ lệ nhưng text co lại; product grid 2-up; category tile 2-up; filter chuyển thành bottom-sheet; footer 4 cột → 1 |
| Tablet | 768–1024px | Top nav giữ ngang nhưng thu gọn; product grid 3-up; category tile 3-up |
| Desktop | 1024–1440px | Top nav đầy đủ menu; product grid 4-up; category tile 6-up |
| Wide | > 1440px | Giống desktop với khoảng thở ngoài lớn hơn; max content width giữ ở 1280px |

### Touch Targets
- `{component.button-primary}` tối thiểu 44 × 44px.
- `{component.button-icon-circular}` 40 × 40px.
- `{component.text-input}` height 44px.
- Toàn bộ `{component.product-card}` có thể chạm để vào trang chi tiết; vùng chạm hiệu quả >> 44px.
- `{component.size-color-selector}` ô size tối thiểu 40 × 40px để dễ chạm trên mobile.

### Collapsing Strategy
- Top nav thu về hamburger ở < 768px; menu mở dưới dạng sheet kem toàn màn hình.
- Hero full-bleed giữ nguyên trên mobile, nhưng headline giảm cỡ và overlay gradient đậm hơn để đảm bảo độ đọc.
- Product grid giảm cột (4→3→2) thay vì thu nhỏ card — ảnh sản phẩm luôn đủ lớn để thấy chi tiết vải.
- Filter chuyển từ tab ngang sang bottom-sheet trên mobile, vẫn dùng `{component.filter-chip}` để hiển thị filter đang áp dụng.
- Banner sale/collection giữ tỉ lệ ảnh, chỉ co text overlay.

### Image Behavior
- Ảnh sản phẩm giữ tỉ lệ 3:4 ở mọi breakpoint, không crop khác tỉ lệ trên mobile.
- Ảnh lookbook full-bleed scale theo chiều ngang, overlay gradient tăng độ đậm trên mobile để bù cho diện tích text/ảnh nhỏ hơn.
- Avatar đánh giá khách hàng crop tròn ở mọi breakpoint.
- Ảnh chi tiết vải/texture (1:1) chỉ hiển thị đầy đủ trên tablet/desktop; trên mobile có thể ẩn hoặc thu gọn thành thumbnail nhỏ trong tab "Chất liệu".

## Iteration Guide

1. Tập trung vào MỘT component mỗi lần. Tham chiếu theo key YAML (`{component.product-card}`, `{component.collection-banner-dark}`).
2. Các biến thể của component hiện có (`-active`, `-disabled`, `-focused`, `-on-dark`) tồn tại như entry riêng trong `components:`.
3. Dùng `{token.refs}` ở mọi nơi — không hardcode hex.
4. Không tài liệu hóa hover trừ khi đã quy định rõ (product card hover, button active). Chỉ Default và Active/Pressed.
5. Tiêu đề display luôn serif weight 400-500 với tracking âm. Body luôn Inter weight 400-500. Quy tắc này không được phá vỡ.
6. Kem + terracotta + tối-warm-brown là bộ ba màu chính. Không thêm tông nền thứ tư (không card tím, không section xanh dương).
7. Khi cần nhấn mạnh: ưu tiên tăng cỡ serif display trước khi tăng độ đậm.
8. **Border radius: luôn tra bảng Shapes trước khi assign radius.** Tier controls → `{rounded.sm}` (6px), tier cards → `{rounded.md}` (12px), tier surfaces lớn → `{rounded.lg}` (16px), ảnh/full-bleed → `{rounded.none}` (0px), badge/chip/avatar → `{rounded.pill}`.

## Known Gaps

- Cormorant Garamond và Inter đều là font mã nguồn mở/miễn phí, sẵn có trên Google Fonts — không có vấn đề license như bản gốc Anthropic.
- Logo Vela Wear chưa được thiết kế trong tài liệu này — cần một wordmark/dấu hiệu đơn giản (gợi ý: chữ "V" cách điệu hoặc một đường nét tối giản gợi hình áo/voan) để dùng nhất quán trong top-nav và footer.
- Animation/transition (page-load, scroll-reveal cho ảnh lookbook, hiệu ứng hover product card) chưa được định nghĩa chi tiết — cần xác nhận thêm khi build trong Google Stitch.
- Trạng thái form validation (lỗi nhập email, lỗi thanh toán) ngoài `{component.text-input-focused}` chưa được đặc tả — cần bổ sung khi xây flow checkout.
- Trang chi tiết sản phẩm (gallery ảnh nhiều góc, tab mô tả/chất liệu/đánh giá, size guide modal) là các component đặc thù chưa nằm trong phạm vi tài liệu này và cần thiết kế bổ sung.
- Trang giỏ hàng/checkout (cart drawer, order summary, payment method selector) chưa được đặc tả — sẽ kế thừa token màu/typography ở trên nhưng cần layout riêng.
