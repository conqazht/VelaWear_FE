import { StorefrontStatus } from "@/components/errors/storefront-status";

export default function ShopNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 pt-[104px] md:pt-[120px] lg:px-10">
      <StorefrontStatus
        status={404}
        title="Thiết kế này không còn ở đây"
        description="Nội dung có thể đã được chuyển sang một địa chỉ mới hoặc tạm rời khỏi bộ sưu tập hiện tại."
        primaryAction={{ label: "Xem bộ sưu tập", href: "/collection" }}
        secondaryAction={{ label: "Về trang chủ", href: "/" }}
        variant="panel"
      />
    </div>
  );
}
