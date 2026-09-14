import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trung Tâm Trợ Giúp & Chăm Sóc Khách Hàng",
  description:
    "Trung tâm trợ giúp VELA WEAR. Hướng dẫn chi tiết chính sách giao hàng toàn quốc, đổi trả linh hoạt 30 ngày, hướng dẫn chọn cỡ và bảo quản trang phục cao cấp.",
  alternates: {
    canonical: "/help",
  },
  openGraph: {
    title: "Trung Tâm Trợ Giúp & Chăm Sóc Khách Hàng | VELA WEAR",
    description:
      "Trung tâm trợ giúp VELA WEAR. Hướng dẫn chi tiết chính sách giao hàng toàn quốc, đổi trả linh hoạt 30 ngày, hướng dẫn chọn cỡ và bảo quản trang phục cao cấp.",
    url: "/help",
  },
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Thời gian giao hàng tiêu chuẩn của VELA WEAR là bao lâu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Thời gian giao hàng tiêu chuẩn từ 2 đến 4 ngày làm việc trên toàn quốc. Đối với khu vực nội thành Hà Nội và TP.HCM, VELA WEAR hỗ trợ giao hàng hỏa tốc trong 2 giờ.",
      },
    },
    {
      "@type": "Question",
      name: "Chính sách đổi trả sản phẩm như thế nào?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Khách hàng được quyền đổi size hoặc mẫu sản phẩm trong vòng 30 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tem mác, chưa qua giặt ủi hoặc sử dụng.",
      },
    },
    {
      "@type": "Question",
      name: "VELA WEAR có miễn phí vận chuyển không?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "VELA WEAR miễn phí vận chuyển tiêu chuẩn cho tất cả đơn hàng có giá trị từ 1.500.000 VNĐ trở lên trên toàn quốc.",
      },
    },
    {
      "@type": "Question",
      name: "Làm thế nào để chọn size trang phục chính xác?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bạn có thể tham khảo Bảng hướng dẫn chọn cỡ (Size Guide) chi tiết của từng loại trang phục hoặc liên hệ đội ngũ Chuyên viên Tư vấn VELA WEAR để được hỗ trợ đo và tư vấn phom dáng phù hợp.",
      },
    },
  ],
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      {children}
    </>
  );
}
