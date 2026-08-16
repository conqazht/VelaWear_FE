import { defineMessages } from "@/lib/i18n/define-messages";

export const salesAdminEditorMessages = defineMessages(
  {
    "admin.sales.editor.type.standard": "Standard Sale",
    "admin.sales.editor.type.flash": "Flash Sale",

    "admin.sales.editor.details.code.label": "Campaign code",
    "admin.sales.editor.details.code.placeholder": "SUMMER_2026",
    "admin.sales.editor.details.code.description":
      "Permanent identifier using uppercase letters, numbers, dashes, or underscores.",
    "admin.sales.editor.details.type.label": "Campaign type",
    "admin.sales.editor.details.type.flashDescription":
      "Flash sales require quota and may set a per-customer limit.",
    "admin.sales.editor.details.type.standardDescription":
      "Standard sales run on schedule without quota.",
    "admin.sales.editor.details.name.label": "Campaign name",
    "admin.sales.editor.details.name.placeholder": "Summer Essentials",
    "admin.sales.editor.details.description.label": "Description",
    "admin.sales.editor.details.description.placeholder":
      "Internal and storefront campaign description",
    "admin.sales.editor.details.banner.label": "Banner URL",
    "admin.sales.editor.details.banner.placeholder": "https://cdn.example.com/summer-sale.jpg",
    "admin.sales.editor.details.banner.description":
      "Optional storefront artwork. Use an absolute HTTP or HTTPS URL.",
    "admin.sales.editor.details.startsAt.label": "Starts at",
    "admin.sales.editor.details.startsAt.description":
      "Entered in your local timezone and sent as UTC.",
    "admin.sales.editor.details.endsAt.label": "Ends at",
    "admin.sales.editor.details.endsAt.description": "The end instant is exclusive.",

    "admin.sales.editor.review.campaign": "Campaign",
    "admin.sales.editor.review.unnamed": "Unnamed campaign",
    "admin.sales.editor.review.noCode": "NO_CODE",
    "admin.sales.editor.review.schedule": "Schedule",
    "admin.sales.editor.review.scheduleTo": "to {date}",
    "admin.sales.editor.review.variants": "Variants",
    "admin.sales.editor.review.productCount": "across {count} product(s)",
    "admin.sales.editor.review.rules": "Rules",
    "admin.sales.editor.review.flashRules": "{count} total quota · coupons excluded",
    "admin.sales.editor.review.standardRules": "No quota · eligible coupons may apply",
    "admin.sales.editor.review.column.productVariant": "Product / variant",
    "admin.sales.editor.review.column.reference": "Reference",
    "admin.sales.editor.review.column.salePrice": "Sale price",
    "admin.sales.editor.review.column.discount": "Discount",
    "admin.sales.editor.review.column.quota": "Quota",
    "admin.sales.editor.review.column.customerLimit": "Customer limit",
    "admin.sales.editor.review.noLimit": "No limit",
    "admin.sales.editor.review.beforePublishing": "Before publishing",
    "admin.sales.editor.review.checkOverlap":
      "The backend validates schedule overlap again inside a transaction.",
    "admin.sales.editor.review.checkReferencePrice":
      "Reference prices are snapshotted when the campaign is published.",
    "admin.sales.editor.review.checkFlashEnforcement":
      "Flash quota and per-customer limits are enforced by the database at checkout.",

    "admin.sales.editor.stepper.aria": "Campaign form steps",
    "admin.sales.editor.step.details.title": "Campaign details",
    "admin.sales.editor.step.details.description": "Type and schedule",
    "admin.sales.editor.step.products.title": "Products & pricing",
    "admin.sales.editor.step.products.description": "Variants and limits",
    "admin.sales.editor.step.review.title": "Review",
    "admin.sales.editor.step.review.description": "Validate and save",

    "admin.sales.editor.loading": "Loading sale campaign...",
    "admin.sales.editor.notFound.title": "Sale campaign was not found",
    "admin.sales.editor.notFound.description": "The campaign identifier in this URL is invalid.",
    "admin.sales.editor.backToCampaigns": "Back to campaigns",
    "admin.sales.editor.loadError.title": "Unable to load sale campaign",
    "admin.sales.editor.loadError.requestFailed": "Request failed",
    "admin.sales.editor.tryAgain": "Try again",
    "admin.sales.editor.clone.defaultName": "{name} (next)",
    "admin.sales.editor.toast.displayUpdated": "{name} display details were updated.",
    "admin.sales.editor.toast.updated": "{name} was updated.",
    "admin.sales.editor.toast.draftSaved": "{name} was saved as a draft.",
    "admin.sales.editor.toast.published": "{name} was published.",
    "admin.sales.editor.toast.publishFailed":
      "Campaign changes were saved, but publishing failed. {error}",
    "admin.sales.editor.toast.deleted": "{name} was deleted.",
    "admin.sales.editor.toast.cancelled": "{name} was cancelled.",
    "admin.sales.editor.toast.ended": "{name} ended.",
    "admin.sales.editor.toast.cloned": "Campaign ended and a new draft was created.",
    "admin.sales.editor.toast.quotaIncreased": "{sku} quota increased by {count}.",
    "admin.sales.editor.validation.cloneCode":
      "Clone code must contain 3–50 uppercase letters, numbers, dashes, or underscores.",
    "admin.sales.editor.validation.cloneName": "Enter a name for the cloned campaign.",
    "admin.sales.editor.validation.cloneSchedule":
      "Choose a valid future schedule for the cloned campaign.",
    "admin.sales.editor.validation.quotaIncrease":
      "Quota increase must be a positive whole number.",
    "admin.sales.editor.backAria": "Back to sale campaigns",
    "admin.sales.editor.createTitle": "Create sale campaign",
    "admin.sales.editor.editDescription":
      "Manage the schedule, eligible variants, sale prices, and lifecycle from one workflow.",
    "admin.sales.editor.createDescription":
      "Configure a scheduled Standard or quota-controlled Flash sale.",
    "admin.sales.editor.action.deleteDraft": "Delete draft",
    "admin.sales.editor.action.cancelCampaign": "Cancel campaign",
    "admin.sales.editor.action.endAndClone": "End & clone",
    "admin.sales.editor.action.endNow": "End now",
    "admin.sales.editor.liveAlert.title": "Live-safe editing is active",
    "admin.sales.editor.liveAlert.description":
      "Name, description, and banner remain editable. Schedule, variants, and prices are locked; Flash quota can only increase.",
    "admin.sales.editor.readOnlyAlert.title": "This campaign is read-only",
    "admin.sales.editor.readOnlyAlert.description":
      "Ended and cancelled campaigns are retained for pricing and order history.",
    "admin.sales.editor.section.details": "Campaign details",
    "admin.sales.editor.section.products": "Products, prices, and limits",
    "admin.sales.editor.section.review": "Review campaign",
    "admin.sales.editor.navigation.previous": "Previous",
    "admin.sales.editor.navigation.next": "Next",
    "admin.sales.editor.saveDraft": "Save draft",
    "admin.sales.editor.saveDisplay": "Save display",
    "admin.sales.editor.saveChanges": "Save changes",
    "admin.sales.editor.saveAndPublish": "Save & publish",

    "admin.sales.editor.liveQuota.title": "Live quota controls",
    "admin.sales.editor.liveQuota.description":
      "Quota can only increase while a Flash campaign is live.",
    "admin.sales.editor.liveQuota.quota": "{count} quota",
    "admin.sales.editor.liveQuota.breakdown": "{reserved} reserved · {sold} sold",
    "admin.sales.editor.liveQuota.increase": "Increase",

    "admin.sales.editor.lifecycle.delete.title": "Delete draft campaign?",
    "admin.sales.editor.lifecycle.delete.description":
      "This permanently deletes the draft and its configured items. Published campaigns cannot be deleted.",
    "admin.sales.editor.lifecycle.delete.confirm": "Delete draft",
    "admin.sales.editor.lifecycle.cancel.title": "Cancel upcoming campaign?",
    "admin.sales.editor.lifecycle.cancel.description":
      "The campaign will no longer start. Its history remains available in read-only mode.",
    "admin.sales.editor.lifecycle.cancel.confirm": "Cancel campaign",
    "admin.sales.editor.lifecycle.end.title": "End live campaign now?",
    "admin.sales.editor.lifecycle.end.description":
      "New checkouts will stop receiving this price. Existing valid reservations keep their payment window.",
    "admin.sales.editor.lifecycle.end.confirm": "End campaign",
    "admin.sales.editor.lifecycle.clone.title": "End and create a new draft?",
    "admin.sales.editor.lifecycle.clone.description":
      "The live campaign ends now and a draft copy is created for a future schedule. Current reservations remain valid.",
    "admin.sales.editor.lifecycle.clone.confirm": "End & clone",
    "admin.sales.editor.lifecycle.confirmTitle": "Confirm action",
    "admin.sales.editor.lifecycle.keepCampaign": "Keep campaign",
    "admin.sales.editor.lifecycle.confirm": "Confirm",
    "admin.sales.editor.clone.code": "New campaign code",
    "admin.sales.editor.clone.name": "New campaign name",
    "admin.sales.editor.clone.startsAt": "Starts at",
    "admin.sales.editor.clone.endsAt": "Ends at",

    "admin.sales.editor.quotaDialog.title": "Increase Flash quota",
    "admin.sales.editor.quotaDialog.description":
      "Increase quota for {sku}. Existing quota cannot be reduced while live.",
    "admin.sales.editor.quotaDialog.thisVariant": "this variant",
    "admin.sales.editor.quotaDialog.additionalQuantity": "Additional quantity",
    "admin.sales.editor.quotaDialog.calculation":
      "{current} current + {additional} = {next} new quota",
    "admin.sales.editor.quotaDialog.details":
      "Sale price {price} · {reserved} reserved · {sold} sold",
    "admin.sales.editor.quotaDialog.cancel": "Cancel",
    "admin.sales.editor.quotaDialog.increase": "Increase quota",
  },
  {
    "admin.sales.editor.type.standard": "Standard Sale",
    "admin.sales.editor.type.flash": "Flash Sale",

    "admin.sales.editor.details.code.label": "Mã chiến dịch",
    "admin.sales.editor.details.code.placeholder": "SUMMER_2026",
    "admin.sales.editor.details.code.description":
      "Mã định danh cố định gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.",
    "admin.sales.editor.details.type.label": "Loại chiến dịch",
    "admin.sales.editor.details.type.flashDescription":
      "Flash Sale bắt buộc có hạn ngạch và có thể đặt giới hạn cho mỗi khách hàng.",
    "admin.sales.editor.details.type.standardDescription":
      "Standard Sale chạy theo lịch mà không có hạn ngạch.",
    "admin.sales.editor.details.name.label": "Tên chiến dịch",
    "admin.sales.editor.details.name.placeholder": "Sản phẩm mùa hè thiết yếu",
    "admin.sales.editor.details.description.label": "Mô tả",
    "admin.sales.editor.details.description.placeholder":
      "Mô tả chiến dịch dùng trong nội bộ và cửa hàng",
    "admin.sales.editor.details.banner.label": "URL banner",
    "admin.sales.editor.details.banner.placeholder": "https://cdn.example.com/summer-sale.jpg",
    "admin.sales.editor.details.banner.description":
      "Hình ảnh tùy chọn trên cửa hàng. Dùng URL HTTP hoặc HTTPS tuyệt đối.",
    "admin.sales.editor.details.startsAt.label": "Bắt đầu lúc",
    "admin.sales.editor.details.startsAt.description":
      "Nhập theo múi giờ địa phương của bạn và gửi lên dưới dạng UTC.",
    "admin.sales.editor.details.endsAt.label": "Kết thúc lúc",
    "admin.sales.editor.details.endsAt.description":
      "Thời điểm kết thúc không nằm trong khoảng hiệu lực.",

    "admin.sales.editor.review.campaign": "Chiến dịch",
    "admin.sales.editor.review.unnamed": "Chiến dịch chưa đặt tên",
    "admin.sales.editor.review.noCode": "CHƯA_CÓ_MÃ",
    "admin.sales.editor.review.schedule": "Lịch chạy",
    "admin.sales.editor.review.scheduleTo": "đến {date}",
    "admin.sales.editor.review.variants": "Biến thể",
    "admin.sales.editor.review.productCount": "thuộc {count} sản phẩm",
    "admin.sales.editor.review.rules": "Quy tắc",
    "admin.sales.editor.review.flashRules": "Tổng hạn ngạch {count} · không áp dụng coupon",
    "admin.sales.editor.review.standardRules":
      "Không có hạn ngạch · có thể áp dụng coupon đủ điều kiện",
    "admin.sales.editor.review.column.productVariant": "Sản phẩm / biến thể",
    "admin.sales.editor.review.column.reference": "Giá tham chiếu",
    "admin.sales.editor.review.column.salePrice": "Giá khuyến mãi",
    "admin.sales.editor.review.column.discount": "Mức giảm",
    "admin.sales.editor.review.column.quota": "Hạn ngạch",
    "admin.sales.editor.review.column.customerLimit": "Giới hạn mỗi khách",
    "admin.sales.editor.review.noLimit": "Không giới hạn",
    "admin.sales.editor.review.beforePublishing": "Trước khi xuất bản",
    "admin.sales.editor.review.checkOverlap":
      "Backend sẽ kiểm tra lại lịch chạy chồng lấn trong một transaction.",
    "admin.sales.editor.review.checkReferencePrice":
      "Giá tham chiếu được chụp lại tại thời điểm xuất bản chiến dịch.",
    "admin.sales.editor.review.checkFlashEnforcement":
      "Database thực thi hạn ngạch Flash và giới hạn mỗi khách khi checkout.",

    "admin.sales.editor.stepper.aria": "Các bước của biểu mẫu chiến dịch",
    "admin.sales.editor.step.details.title": "Thông tin chiến dịch",
    "admin.sales.editor.step.details.description": "Loại và lịch chạy",
    "admin.sales.editor.step.products.title": "Sản phẩm và giá",
    "admin.sales.editor.step.products.description": "Biến thể và giới hạn",
    "admin.sales.editor.step.review.title": "Kiểm tra",
    "admin.sales.editor.step.review.description": "Xác thực và lưu",

    "admin.sales.editor.loading": "Đang tải chiến dịch khuyến mãi...",
    "admin.sales.editor.notFound.title": "Không tìm thấy chiến dịch khuyến mãi",
    "admin.sales.editor.notFound.description": "Mã chiến dịch trong URL này không hợp lệ.",
    "admin.sales.editor.backToCampaigns": "Quay lại danh sách chiến dịch",
    "admin.sales.editor.loadError.title": "Không thể tải chiến dịch khuyến mãi",
    "admin.sales.editor.loadError.requestFailed": "Yêu cầu thất bại",
    "admin.sales.editor.tryAgain": "Thử lại",
    "admin.sales.editor.clone.defaultName": "{name} (tiếp theo)",
    "admin.sales.editor.toast.displayUpdated": "Đã cập nhật thông tin hiển thị của {name}.",
    "admin.sales.editor.toast.updated": "Đã cập nhật {name}.",
    "admin.sales.editor.toast.draftSaved": "Đã lưu {name} dưới dạng bản nháp.",
    "admin.sales.editor.toast.published": "Đã xuất bản {name}.",
    "admin.sales.editor.toast.publishFailed":
      "Đã lưu thay đổi chiến dịch nhưng xuất bản thất bại. {error}",
    "admin.sales.editor.toast.deleted": "Đã xóa {name}.",
    "admin.sales.editor.toast.cancelled": "Đã hủy {name}.",
    "admin.sales.editor.toast.ended": "Đã kết thúc {name}.",
    "admin.sales.editor.toast.cloned": "Đã kết thúc chiến dịch và tạo một bản nháp mới.",
    "admin.sales.editor.toast.quotaIncreased": "Đã tăng hạn ngạch của {sku} thêm {count}.",
    "admin.sales.editor.validation.cloneCode":
      "Mã bản sao phải có 3–50 chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.",
    "admin.sales.editor.validation.cloneName": "Nhập tên cho chiến dịch được sao chép.",
    "admin.sales.editor.validation.cloneSchedule":
      "Chọn lịch chạy trong tương lai hợp lệ cho chiến dịch được sao chép.",
    "admin.sales.editor.validation.quotaIncrease":
      "Phần tăng hạn ngạch phải là một số nguyên dương.",
    "admin.sales.editor.backAria": "Quay lại danh sách chiến dịch khuyến mãi",
    "admin.sales.editor.createTitle": "Tạo chiến dịch khuyến mãi",
    "admin.sales.editor.editDescription":
      "Quản lý lịch chạy, biến thể áp dụng, giá khuyến mãi và vòng đời trong một quy trình.",
    "admin.sales.editor.createDescription":
      "Cấu hình Standard Sale theo lịch hoặc Flash Sale có kiểm soát hạn ngạch.",
    "admin.sales.editor.action.deleteDraft": "Xóa bản nháp",
    "admin.sales.editor.action.cancelCampaign": "Hủy chiến dịch",
    "admin.sales.editor.action.endAndClone": "Kết thúc và sao chép",
    "admin.sales.editor.action.endNow": "Kết thúc ngay",
    "admin.sales.editor.liveAlert.title": "Đang bật chế độ chỉnh sửa an toàn khi chạy",
    "admin.sales.editor.liveAlert.description":
      "Vẫn có thể sửa tên, mô tả và banner. Lịch chạy, biến thể và giá đã bị khóa; hạn ngạch Flash chỉ có thể tăng.",
    "admin.sales.editor.readOnlyAlert.title": "Chiến dịch này chỉ có thể xem",
    "admin.sales.editor.readOnlyAlert.description":
      "Chiến dịch đã kết thúc hoặc bị hủy được giữ lại cho lịch sử giá và đơn hàng.",
    "admin.sales.editor.section.details": "Thông tin chiến dịch",
    "admin.sales.editor.section.products": "Sản phẩm, giá và giới hạn",
    "admin.sales.editor.section.review": "Kiểm tra chiến dịch",
    "admin.sales.editor.navigation.previous": "Trước",
    "admin.sales.editor.navigation.next": "Tiếp theo",
    "admin.sales.editor.saveDraft": "Lưu bản nháp",
    "admin.sales.editor.saveDisplay": "Lưu thông tin hiển thị",
    "admin.sales.editor.saveChanges": "Lưu thay đổi",
    "admin.sales.editor.saveAndPublish": "Lưu và xuất bản",

    "admin.sales.editor.liveQuota.title": "Điều khiển hạn ngạch đang chạy",
    "admin.sales.editor.liveQuota.description":
      "Chỉ có thể tăng hạn ngạch khi chiến dịch Flash đang chạy.",
    "admin.sales.editor.liveQuota.quota": "Hạn ngạch {count}",
    "admin.sales.editor.liveQuota.breakdown": "Đã giữ {reserved} · đã bán {sold}",
    "admin.sales.editor.liveQuota.increase": "Tăng",

    "admin.sales.editor.lifecycle.delete.title": "Xóa chiến dịch nháp?",
    "admin.sales.editor.lifecycle.delete.description":
      "Thao tác này xóa vĩnh viễn bản nháp và các sản phẩm đã cấu hình. Không thể xóa chiến dịch đã xuất bản.",
    "admin.sales.editor.lifecycle.delete.confirm": "Xóa bản nháp",
    "admin.sales.editor.lifecycle.cancel.title": "Hủy chiến dịch sắp diễn ra?",
    "admin.sales.editor.lifecycle.cancel.description":
      "Chiến dịch sẽ không còn bắt đầu. Lịch sử vẫn được giữ lại ở chế độ chỉ xem.",
    "admin.sales.editor.lifecycle.cancel.confirm": "Hủy chiến dịch",
    "admin.sales.editor.lifecycle.end.title": "Kết thúc chiến dịch đang chạy ngay?",
    "admin.sales.editor.lifecycle.end.description":
      "Checkout mới sẽ không còn nhận mức giá này. Các lượt giữ chỗ hợp lệ hiện có vẫn giữ nguyên thời hạn thanh toán.",
    "admin.sales.editor.lifecycle.end.confirm": "Kết thúc chiến dịch",
    "admin.sales.editor.lifecycle.clone.title": "Kết thúc và tạo bản nháp mới?",
    "admin.sales.editor.lifecycle.clone.description":
      "Chiến dịch đang chạy sẽ kết thúc ngay và một bản nháp được tạo cho lịch chạy tương lai. Các lượt giữ chỗ hiện tại vẫn hợp lệ.",
    "admin.sales.editor.lifecycle.clone.confirm": "Kết thúc và sao chép",
    "admin.sales.editor.lifecycle.confirmTitle": "Xác nhận thao tác",
    "admin.sales.editor.lifecycle.keepCampaign": "Giữ chiến dịch",
    "admin.sales.editor.lifecycle.confirm": "Xác nhận",
    "admin.sales.editor.clone.code": "Mã chiến dịch mới",
    "admin.sales.editor.clone.name": "Tên chiến dịch mới",
    "admin.sales.editor.clone.startsAt": "Bắt đầu lúc",
    "admin.sales.editor.clone.endsAt": "Kết thúc lúc",

    "admin.sales.editor.quotaDialog.title": "Tăng hạn ngạch Flash",
    "admin.sales.editor.quotaDialog.description":
      "Tăng hạn ngạch cho {sku}. Không thể giảm hạn ngạch khi chiến dịch đang chạy.",
    "admin.sales.editor.quotaDialog.thisVariant": "biến thể này",
    "admin.sales.editor.quotaDialog.additionalQuantity": "Số lượng tăng thêm",
    "admin.sales.editor.quotaDialog.calculation":
      "Hiện tại {current} + thêm {additional} = hạn ngạch mới {next}",
    "admin.sales.editor.quotaDialog.details":
      "Giá khuyến mãi {price} · đã giữ {reserved} · đã bán {sold}",
    "admin.sales.editor.quotaDialog.cancel": "Hủy",
    "admin.sales.editor.quotaDialog.increase": "Tăng hạn ngạch",
  },
);
