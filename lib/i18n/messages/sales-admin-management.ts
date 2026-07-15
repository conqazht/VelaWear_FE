import { defineMessages } from "@/lib/i18n/define-messages";

export const salesAdminManagementMessages = defineMessages(
  {
    "admin.sales.management.type.standard": "Standard",
    "admin.sales.management.type.flash": "Flash",
    "admin.sales.management.status.draft": "Draft",
    "admin.sales.management.status.published": "Published",
    "admin.sales.management.status.cancelled": "Cancelled",
    "admin.sales.management.phase.upcoming": "Upcoming",
    "admin.sales.management.phase.live": "Live",
    "admin.sales.management.phase.ended": "Ended",

    "admin.sales.management.title": "Sale campaigns",
    "admin.sales.management.description":
      "Schedule Standard sales and quota-controlled Flash sales. Coupon rules are managed separately.",
    "admin.sales.management.searchPlaceholder": "Search campaign name or code...",
    "admin.sales.management.create": "Create campaign",
    "admin.sales.management.emptyTitle": "No sale campaigns found",
    "admin.sales.management.emptyDescription":
      "Create a campaign or adjust the current search and filters.",
    "admin.sales.management.column.campaign": "Campaign",
    "admin.sales.management.column.typeItems": "Type / items",
    "admin.sales.management.column.schedule": "Schedule",
    "admin.sales.management.column.flashQuota": "Flash quota",
    "admin.sales.management.column.lifecycle": "Lifecycle",
    "admin.sales.management.column.actions": "Actions",
    "admin.sales.management.variantCount": "{count} variant(s)",
    "admin.sales.management.scheduleTo": "to {date}",
    "admin.sales.management.quota.none": "No quota",
    "admin.sales.management.quota.allocated": "{count} allocated",
    "admin.sales.management.quota.total": "{count} total",
    "admin.sales.management.quota.breakdown":
      "{reserved} reserved · {sold} sold",
    "admin.sales.management.action.publishAria": "Publish {name}",
    "admin.sales.management.action.publishTitle": "Publish campaign",
    "admin.sales.management.action.viewAria": "View {name}",
    "admin.sales.management.action.deleteAria": "Delete {name}",
    "admin.sales.management.action.deleteTitle": "Delete draft",
    "admin.sales.management.filter.type": "Type",
    "admin.sales.management.filter.allTypes": "All types",
    "admin.sales.management.filter.status": "Status",
    "admin.sales.management.filter.allStatuses": "All statuses",
    "admin.sales.management.filter.phase": "Phase",
    "admin.sales.management.filter.allPhases": "All phases",
    "admin.sales.management.toast.published": "{name} was published.",
    "admin.sales.management.toast.deleted": "{name} was deleted.",
    "admin.sales.management.dialog.publishTitle": "Publish this campaign?",
    "admin.sales.management.dialog.deleteTitle": "Delete this draft?",
    "admin.sales.management.dialog.publishDescription":
      "Publishing validates price, schedule, variant overlap, and Flash quota inside one backend transaction.",
    "admin.sales.management.dialog.deleteDescription":
      "The draft and all configured campaign items will be permanently removed.",
    "admin.sales.management.dialog.cancel": "Cancel",
    "admin.sales.management.dialog.publish": "Publish",
    "admin.sales.management.dialog.delete": "Delete draft",

    "admin.sales.management.picker.defaultOption": "Default",
    "admin.sales.management.picker.bulkPositive":
      "Enter a positive value before applying a bulk price.",
    "admin.sales.management.picker.bulkPercentageRange":
      "Percentage discount must be greater than 0 and below 100.",
    "admin.sales.management.picker.chooseTitle": "Choose product variants",
    "admin.sales.management.picker.chooseDescription":
      "A campaign can contain variants from one or many products.",
    "admin.sales.management.picker.selectedCount": "{count} selected",
    "admin.sales.management.picker.searchPlaceholder":
      "Search products, SKU, color, or size...",
    "admin.sales.management.picker.searchAria":
      "Search available product variants",
    "admin.sales.management.picker.loading": "Loading sellable variants...",
    "admin.sales.management.picker.empty":
      "No active variants match this search.",
    "admin.sales.management.picker.selectAllAria":
      "Select all variants of {name}",
    "admin.sales.management.picker.selectVariantAria": "Select {sku}",
    "admin.sales.management.picker.pricingTitle": "Sale pricing",
    "admin.sales.management.picker.pricingDescription":
      "Set an absolute sale price per variant. Bulk percentage is converted before saving.",
    "admin.sales.management.picker.bulkModeAria": "Bulk price mode",
    "admin.sales.management.picker.discountPercent": "Discount percent",
    "admin.sales.management.picker.fixedPrice": "Fixed sale price",
    "admin.sales.management.picker.bulkPercentageAria":
      "Bulk discount percentage",
    "admin.sales.management.picker.bulkFixedPriceAria":
      "Bulk fixed sale price",
    "admin.sales.management.picker.applySelected": "Apply to selected",
    "admin.sales.management.picker.column.productVariant": "Product / variant",
    "admin.sales.management.picker.column.referencePrice": "Reference price",
    "admin.sales.management.picker.column.salePrice": "Sale price",
    "admin.sales.management.picker.column.quota": "Quota",
    "admin.sales.management.picker.column.customerLimit": "Limit / customer",
    "admin.sales.management.picker.column.used": "Used",
    "admin.sales.management.picker.column.remove": "Remove",
    "admin.sales.management.picker.selectPrompt":
      "Select one or more variants above.",
    "admin.sales.management.picker.salePriceAria": "Sale price for {sku}",
    "admin.sales.management.picker.quotaAria": "Quota for {sku}",
    "admin.sales.management.picker.noLimit": "No limit",
    "admin.sales.management.picker.customerLimitAria":
      "Customer limit for {sku}",
    "admin.sales.management.picker.usedBreakdown":
      "{reserved} reserved · {sold} sold",
    "admin.sales.management.picker.removeAria": "Remove {sku}",

    "admin.sales.management.validation.nameRequired": "Enter a campaign name.",
    "admin.sales.management.validation.bannerUrl":
      "Banner URL must be a valid http or https URL.",
    "admin.sales.management.validation.code":
      "Campaign code must contain 3–50 uppercase letters, numbers, dashes, or underscores.",
    "admin.sales.management.validation.schedule": "Choose a valid schedule.",
    "admin.sales.management.validation.scheduleOrder":
      "End time must be later than start time.",
    "admin.sales.management.validation.itemRequired":
      "Select at least one product variant.",
    "admin.sales.management.validation.duplicateVariant":
      "Variant {sku} is selected more than once.",
    "admin.sales.management.validation.salePrice":
      "{sku} needs a sale price above 0 and below its reference price.",
    "admin.sales.management.validation.quotaPositive":
      "{sku} needs a positive whole-number quota.",
    "admin.sales.management.validation.quotaUsed":
      "{sku} quota cannot be lower than its reserved and sold quantity.",
    "admin.sales.management.validation.customerLimit":
      "{sku} customer limit must be between 1 and its quota.",
  },
  {
    "admin.sales.management.type.standard": "Thường",
    "admin.sales.management.type.flash": "Chớp nhoáng",
    "admin.sales.management.status.draft": "Bản nháp",
    "admin.sales.management.status.published": "Đã xuất bản",
    "admin.sales.management.status.cancelled": "Đã hủy",
    "admin.sales.management.phase.upcoming": "Sắp diễn ra",
    "admin.sales.management.phase.live": "Đang diễn ra",
    "admin.sales.management.phase.ended": "Đã kết thúc",

    "admin.sales.management.title": "Chiến dịch khuyến mãi",
    "admin.sales.management.description":
      "Lên lịch đợt giảm giá thường và Flash Sale có kiểm soát hạn ngạch. Quy tắc mã giảm giá được quản lý riêng.",
    "admin.sales.management.searchPlaceholder": "Tìm tên hoặc mã chiến dịch...",
    "admin.sales.management.create": "Tạo chiến dịch",
    "admin.sales.management.emptyTitle": "Không tìm thấy chiến dịch khuyến mãi",
    "admin.sales.management.emptyDescription":
      "Hãy tạo chiến dịch hoặc điều chỉnh từ khóa và bộ lọc hiện tại.",
    "admin.sales.management.column.campaign": "Chiến dịch",
    "admin.sales.management.column.typeItems": "Loại / sản phẩm",
    "admin.sales.management.column.schedule": "Lịch chạy",
    "admin.sales.management.column.flashQuota": "Hạn ngạch Flash Sale",
    "admin.sales.management.column.lifecycle": "Vòng đời",
    "admin.sales.management.column.actions": "Thao tác",
    "admin.sales.management.variantCount": "{count} biến thể",
    "admin.sales.management.scheduleTo": "đến {date}",
    "admin.sales.management.quota.none": "Không giới hạn hạn ngạch",
    "admin.sales.management.quota.allocated": "Đã phân bổ {count}",
    "admin.sales.management.quota.total": "Tổng {count}",
    "admin.sales.management.quota.breakdown":
      "{reserved} đang giữ · {sold} đã bán",
    "admin.sales.management.action.publishAria": "Xuất bản {name}",
    "admin.sales.management.action.publishTitle": "Xuất bản chiến dịch",
    "admin.sales.management.action.viewAria": "Xem {name}",
    "admin.sales.management.action.deleteAria": "Xóa {name}",
    "admin.sales.management.action.deleteTitle": "Xóa bản nháp",
    "admin.sales.management.filter.type": "Loại",
    "admin.sales.management.filter.allTypes": "Tất cả loại",
    "admin.sales.management.filter.status": "Trạng thái",
    "admin.sales.management.filter.allStatuses": "Tất cả trạng thái",
    "admin.sales.management.filter.phase": "Giai đoạn",
    "admin.sales.management.filter.allPhases": "Tất cả giai đoạn",
    "admin.sales.management.toast.published": "Đã xuất bản {name}.",
    "admin.sales.management.toast.deleted": "Đã xóa {name}.",
    "admin.sales.management.dialog.publishTitle": "Xuất bản chiến dịch này?",
    "admin.sales.management.dialog.deleteTitle": "Xóa bản nháp này?",
    "admin.sales.management.dialog.publishDescription":
      "Khi xuất bản, backend sẽ kiểm tra giá, lịch chạy, biến thể bị trùng và hạn ngạch Flash Sale trong cùng một transaction.",
    "admin.sales.management.dialog.deleteDescription":
      "Bản nháp và toàn bộ sản phẩm đã cấu hình trong chiến dịch sẽ bị xóa vĩnh viễn.",
    "admin.sales.management.dialog.cancel": "Hủy",
    "admin.sales.management.dialog.publish": "Xuất bản",
    "admin.sales.management.dialog.delete": "Xóa bản nháp",

    "admin.sales.management.picker.defaultOption": "Mặc định",
    "admin.sales.management.picker.bulkPositive":
      "Nhập một giá trị dương trước khi áp dụng giá hàng loạt.",
    "admin.sales.management.picker.bulkPercentageRange":
      "Phần trăm giảm giá phải lớn hơn 0 và nhỏ hơn 100.",
    "admin.sales.management.picker.chooseTitle": "Chọn biến thể sản phẩm",
    "admin.sales.management.picker.chooseDescription":
      "Một chiến dịch có thể chứa biến thể của một hoặc nhiều sản phẩm.",
    "admin.sales.management.picker.selectedCount": "Đã chọn {count}",
    "admin.sales.management.picker.searchPlaceholder":
      "Tìm sản phẩm, SKU, màu sắc hoặc kích cỡ...",
    "admin.sales.management.picker.searchAria":
      "Tìm biến thể sản phẩm có thể bán",
    "admin.sales.management.picker.loading": "Đang tải biến thể có thể bán...",
    "admin.sales.management.picker.empty":
      "Không có biến thể đang hoạt động khớp với tìm kiếm.",
    "admin.sales.management.picker.selectAllAria":
      "Chọn tất cả biến thể của {name}",
    "admin.sales.management.picker.selectVariantAria": "Chọn {sku}",
    "admin.sales.management.picker.pricingTitle": "Giá khuyến mãi",
    "admin.sales.management.picker.pricingDescription":
      "Đặt giá khuyến mãi tuyệt đối cho từng biến thể. Phần trăm giảm hàng loạt sẽ được quy đổi trước khi lưu.",
    "admin.sales.management.picker.bulkModeAria": "Chế độ đặt giá hàng loạt",
    "admin.sales.management.picker.discountPercent": "Phần trăm giảm giá",
    "admin.sales.management.picker.fixedPrice": "Giá khuyến mãi cố định",
    "admin.sales.management.picker.bulkPercentageAria":
      "Phần trăm giảm giá hàng loạt",
    "admin.sales.management.picker.bulkFixedPriceAria":
      "Giá khuyến mãi cố định hàng loạt",
    "admin.sales.management.picker.applySelected": "Áp dụng cho mục đã chọn",
    "admin.sales.management.picker.column.productVariant": "Sản phẩm / biến thể",
    "admin.sales.management.picker.column.referencePrice": "Giá tham chiếu",
    "admin.sales.management.picker.column.salePrice": "Giá khuyến mãi",
    "admin.sales.management.picker.column.quota": "Hạn ngạch",
    "admin.sales.management.picker.column.customerLimit": "Giới hạn / khách",
    "admin.sales.management.picker.column.used": "Đã dùng",
    "admin.sales.management.picker.column.remove": "Bỏ chọn",
    "admin.sales.management.picker.selectPrompt":
      "Hãy chọn một hoặc nhiều biến thể ở phía trên.",
    "admin.sales.management.picker.salePriceAria": "Giá khuyến mãi của {sku}",
    "admin.sales.management.picker.quotaAria": "Hạn ngạch của {sku}",
    "admin.sales.management.picker.noLimit": "Không giới hạn",
    "admin.sales.management.picker.customerLimitAria":
      "Giới hạn mỗi khách của {sku}",
    "admin.sales.management.picker.usedBreakdown":
      "{reserved} đang giữ · {sold} đã bán",
    "admin.sales.management.picker.removeAria": "Bỏ chọn {sku}",

    "admin.sales.management.validation.nameRequired": "Nhập tên chiến dịch.",
    "admin.sales.management.validation.bannerUrl":
      "URL banner phải là địa chỉ http hoặc https hợp lệ.",
    "admin.sales.management.validation.code":
      "Mã chiến dịch phải gồm 3–50 chữ cái in hoa, chữ số, dấu gạch ngang hoặc gạch dưới.",
    "admin.sales.management.validation.schedule": "Chọn lịch chạy hợp lệ.",
    "admin.sales.management.validation.scheduleOrder":
      "Thời gian kết thúc phải sau thời gian bắt đầu.",
    "admin.sales.management.validation.itemRequired":
      "Chọn ít nhất một biến thể sản phẩm.",
    "admin.sales.management.validation.duplicateVariant":
      "Biến thể {sku} được chọn nhiều hơn một lần.",
    "admin.sales.management.validation.salePrice":
      "{sku} cần có giá khuyến mãi lớn hơn 0 và thấp hơn giá tham chiếu.",
    "admin.sales.management.validation.quotaPositive":
      "{sku} cần có hạn ngạch là số nguyên dương.",
    "admin.sales.management.validation.quotaUsed":
      "Hạn ngạch của {sku} không được thấp hơn số lượng đang giữ và đã bán.",
    "admin.sales.management.validation.customerLimit":
      "Giới hạn mỗi khách của {sku} phải từ 1 đến hạn ngạch.",
  },
);

export type SalesAdminManagementTranslationKey =
  keyof (typeof salesAdminManagementMessages)["en"];
