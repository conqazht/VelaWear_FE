import { defineMessages } from "@/lib/i18n/define-messages";

export const salesCheckoutMessages = defineMessages(
  {
    "sale.cart.flashNotReserved.title": "Flash Sale items in your bag are not reserved",
    "sale.cart.flashNotReserved.description":
      "Stock, Flash allocation, and your per-customer allowance are checked again when you place the order.",
    "sale.cart.remainingQuota": "{count} spots left",
    "sale.cart.customerRemaining": "You can still buy {count}",
    "sale.cart.estimateNotice":
      "This total is an estimate. Checkout revalidates prices, coupons, and stock.",
    "sale.order.snapshotNotice":
      "The prices and campaign shown above are snapshots captured when the order was created. They do not change when the campaign ends or is edited.",
    "sale.order.paymentDue": "Payment due",
    "sale.order.reservationExpires": "Resources reserved until",
    "sale.order.resourcesReleasedAt":
      "Stock, allocation, and purchase allowance were released at {time}.",
    "sale.order.latePaymentNotice":
      "A late payment does not automatically restore this order; it will be handled according to the current payment status.",
    "sale.order.reservationNotice":
      "Online orders only hold stock, allocation, and purchase allowance until the time above. The system-confirmed status is authoritative.",
    "sale.order.codNoticeTitle": "Cash on delivery (COD)",
    "sale.order.codNoticeDescription":
      "Online advance payment is not required for this order. Please prepare cash to pay directly to the courier upon arrival.",
    "sale.payment.method.sepay": "Bank transfer via SePay",
    "sale.payment.method.vnpay": "VNPay Payment Gateway",
    "sale.payment.method.momo": "MoMo E-Wallet",
    "sale.payment.method.stripe": "Credit / Debit Card (Stripe)",
    "sale.payment.status.refundPending": "Refund pending",
    "sale.checkout.preview.retry": "Try again",
    "sale.checkout.preview.checkingCoupon": "Checking",
    "sale.checkout.preview.updateCoupon": "Update",
    "sale.checkout.preview.couponVerified":
      "Code “{code}” was verified by the server in this preview.",
    "sale.checkout.coupon.flashIneligible":
      "Coupons do not apply to Flash Sale items. Eligible BASE and Standard Sale items are calculated separately.",
    "sale.checkout.couponEligibleSubtotal": "Coupon-eligible subtotal",
    "sale.checkout.summary.checking": "Checking the latest prices, stock, and allocation...",
    "sale.checkout.summary.serverValidated":
      "The final price is checked atomically when the order is created. Adding an item to your bag does not reserve a Flash Sale allocation.",
    "sale.checkout.summary.clientEstimate":
      "This is only a browser estimate. The system will validate it again before creating the order.",
    "sale.checkout.payment.sepay": "Bank transfer via SePay (VietQR)",
    "sale.checkout.payment.vnpay": "VNPay Payment Gateway (ATM / QR)",
    "sale.checkout.payment.momo": "MoMo E-Wallet",
    "sale.checkout.payment.stripe": "International Cards (Visa / Mastercard)",
    "sale.checkout.payment.expiredTitle": "Reservation expired",
    "sale.checkout.payment.graceTitle": "Payment confirmation grace period",
    "sale.checkout.payment.remainingTitle": "Payment time remaining",
    "sale.checkout.payment.releasedDescription":
      "Stock, allocation, and purchase allowance were released. A late transaction will not automatically restore the order.",
    "sale.checkout.payment.deadlineDescription":
      "Please complete payment before {time} to secure your order. Unpaid orders will expire automatically.",
    "sale.checkout.payment.continue": "Continue payment",
    "sale.checkout.error.flashSoldOut":
      "The Flash Sale allocation just sold out. Your bag has been refreshed with the latest data.",
    "sale.checkout.error.flashEnded": "The Flash Sale has ended. Please review the updated price.",
    "sale.checkout.error.customerLimit":
      "You have exceeded the purchase limit for this Flash Sale item.",
    "sale.checkout.error.priceChanged":
      "The product price just changed. Please review the total before placing your order.",
    "sale.checkout.error.idempotencyConflict":
      "This checkout request no longer matches the previous attempt. Please try again.",
    "sale.payment.return.successTitle": "Payment Successful",
    "sale.payment.return.successSubtitle":
      "Your transaction has been verified. Your order is now confirmed and being prepared.",
    "sale.payment.return.failedTitle": "Payment Incomplete",
    "sale.payment.return.failedSubtitle":
      "The payment was cancelled or could not be verified by the gateway.",
    "sale.payment.return.orderCode": "Order Code",
    "sale.payment.return.amount": "Amount Paid",
    "sale.payment.return.provider": "Payment Gateway",
    "sale.payment.return.transactionCode": "Transaction Ref",
    "sale.payment.return.status": "Status",
    "sale.payment.return.statusPaid": "Paid",
    "sale.payment.return.statusFailed": "Unpaid / Cancelled",
    "sale.payment.return.viewOrder": "View Order Details",
    "sale.payment.return.retryPayment": "Retry Payment",
    "sale.payment.return.continueShopping": "Continue Shopping",
    "sale.payment.return.emailNotice":
      "A confirmation receipt has been dispatched to your email address.",
    "sale.payment.return.failureNotice":
      "If funds were deducted from your account, please save your transaction reference and contact customer support.",
  },
  {
    "sale.cart.flashNotReserved.title": "Sản phẩm Flash trong giỏ chưa được giữ chỗ",
    "sale.cart.flashNotReserved.description":
      "Tồn kho, suất Flash và giới hạn mua của bạn sẽ được kiểm tra lại khi đặt hàng.",
    "sale.cart.remainingQuota": "Còn {count} suất",
    "sale.cart.customerRemaining": "Bạn còn được mua {count}",
    "sale.cart.estimateNotice":
      "Tổng tiền tại đây là tạm tính; checkout sẽ xác nhận lại giá, coupon và tồn kho.",
    "sale.order.snapshotNotice":
      "Giá và campaign ở trên là dữ liệu được chụp tại thời điểm tạo đơn, nên không thay đổi khi campaign kết thúc hoặc được chỉnh sửa.",
    "sale.order.paymentDue": "Hạn thanh toán",
    "sale.order.reservationExpires": "Giữ tài nguyên đến",
    "sale.order.resourcesReleasedAt": "Tồn kho, suất sale và lượt mua đã được nhả lúc {time}.",
    "sale.order.latePaymentNotice":
      "Thanh toán đến muộn không tự khôi phục đơn; hệ thống sẽ xử lý theo trạng thái thanh toán hiện tại.",
    "sale.order.reservationNotice":
      "Đơn online chỉ giữ tồn kho, suất sale và lượt mua đến mốc ở trên. Trạng thái do hệ thống xác nhận là trạng thái chính thức.",
    "sale.order.codNoticeTitle": "Thanh toán khi nhận hàng (COD)",
    "sale.order.codNoticeDescription":
      "Đơn hàng áp dụng hình thức COD, bạn không cần thanh toán online trước. Vui lòng chuẩn bị tiền mặt để thanh toán trực tiếp cho nhân viên giao hàng khi nhận kiện hàng.",
    "sale.payment.method.sepay": "Chuyển khoản ngân hàng qua SePay",
    "sale.payment.method.vnpay": "Cổng thanh toán VNPay",
    "sale.payment.method.momo": "Ví điện tử MoMo",
    "sale.payment.method.stripe": "Thẻ quốc tế Visa / Mastercard (Stripe)",
    "sale.payment.status.refundPending": "Đang chờ hoàn tiền",
    "sale.checkout.preview.retry": "Thử lại",
    "sale.checkout.preview.checkingCoupon": "Đang kiểm tra",
    "sale.checkout.preview.updateCoupon": "Cập nhật",
    "sale.checkout.preview.couponVerified":
      "Mã “{code}” đã được server kiểm tra trong bản tạm tính.",
    "sale.checkout.coupon.flashIneligible":
      "Coupon không áp dụng lên sản phẩm Flash Sale. Các sản phẩm BASE và Standard Sale đủ điều kiện vẫn được tính riêng.",
    "sale.checkout.couponEligibleSubtotal": "Phần giá trị đủ điều kiện coupon",
    "sale.checkout.summary.checking": "Đang đối chiếu giá, tồn kho và suất sale mới nhất...",
    "sale.checkout.summary.serverValidated":
      "Giá cuối cùng vẫn được kiểm tra nguyên tử khi tạo đơn; thêm vào giỏ không giữ suất Flash Sale.",
    "sale.checkout.summary.clientEstimate":
      "Đây chỉ là ước tính trên trình duyệt. Hệ thống sẽ kiểm tra lại trước khi tạo đơn.",
    "sale.checkout.payment.sepay": "Chuyển khoản ngân hàng (VietQR)",
    "sale.checkout.payment.vnpay": "Cổng thanh toán VNPay (ATM / QR / Thẻ nội địa)",
    "sale.checkout.payment.momo": "Ví điện tử MoMo",
    "sale.checkout.payment.stripe": "Thẻ quốc tế Visa / Mastercard (Stripe)",
    "sale.checkout.payment.expiredTitle": "Đã hết thời gian giữ hàng",
    "sale.checkout.payment.graceTitle": "Đang trong thời gian gia hạn xác nhận",
    "sale.checkout.payment.remainingTitle": "Thời gian thanh toán còn lại",
    "sale.checkout.payment.releasedDescription":
      "Tồn kho, suất sale và lượt mua đã được nhả. Giao dịch đến muộn sẽ không tự khôi phục đơn.",
    "sale.checkout.payment.deadlineDescription":
      "Vui lòng thanh toán trước {time} để hoàn tất đơn hàng. Đơn hàng sẽ tự động hủy nếu quá hạn thanh toán.",
    "sale.checkout.payment.continue": "Tiếp tục thanh toán",
    "sale.checkout.error.flashSoldOut":
      "Suất Flash Sale vừa hết. Giỏ hàng đã được cập nhật theo dữ liệu mới nhất.",
    "sale.checkout.error.flashEnded":
      "Chương trình Flash Sale đã kết thúc. Vui lòng kiểm tra lại giá mới.",
    "sale.checkout.error.customerLimit": "Bạn đã vượt giới hạn mua của sản phẩm Flash Sale này.",
    "sale.checkout.error.priceChanged":
      "Giá sản phẩm vừa thay đổi. Vui lòng kiểm tra lại tổng tiền trước khi đặt hàng.",
    "sale.checkout.error.idempotencyConflict":
      "Yêu cầu đặt hàng này không còn khớp với lần gửi trước. Vui lòng thử lại.",
    "sale.payment.return.successTitle": "Thanh toán thành công",
    "sale.payment.return.successSubtitle":
      "Giao dịch của bạn đã được xác thực thành công. Đơn hàng hiện đã được xác nhận và đang được chuẩn bị.",
    "sale.payment.return.failedTitle": "Thanh toán chưa hoàn tất",
    "sale.payment.return.failedSubtitle":
      "Giao dịch thanh toán đã bị hủy hoặc không được cổng thanh toán xác thực thành công.",
    "sale.payment.return.orderCode": "Mã đơn hàng",
    "sale.payment.return.amount": "Số tiền đã thanh toán",
    "sale.payment.return.provider": "Cổng thanh toán",
    "sale.payment.return.transactionCode": "Mã giao dịch",
    "sale.payment.return.status": "Trạng thái thanh toán",
    "sale.payment.return.statusPaid": "Đã thanh toán",
    "sale.payment.return.statusFailed": "Chưa thanh toán / Đã hủy",
    "sale.payment.return.viewOrder": "Xem chi tiết đơn hàng",
    "sale.payment.return.retryPayment": "Thử thanh toán lại",
    "sale.payment.return.continueShopping": "Tiếp tục mua sắm",
    "sale.payment.return.emailNotice":
      "Biên lai xác nhận thanh toán và chi tiết đơn hàng đang được gửi tới email của bạn.",
    "sale.payment.return.failureNotice":
      "Nếu tài khoản của bạn đã bị trừ tiền, vui lòng lưu lại mã tham chiếu giao dịch và liên hệ với đội ngũ hỗ trợ của Vela Wear.",
  },
);
