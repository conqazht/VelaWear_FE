import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function NotFound() {
  return (
    <StorefrontStatus
      status={404}
      title="Trang này đã rời khỏi bộ sưu tập"
      description="Đường dẫn có thể đã được thay đổi, nội dung đã chuyển sang một địa chỉ mới hoặc chưa từng tồn tại."
      primaryAction={{ label: "Xem bộ sưu tập", href: "/collection" }}
      secondaryAction={{ label: "Về trang chủ", href: "/" }}
    />
  );
}
