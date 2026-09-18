"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  HelpHeader,
  HelpSidebar,
  HelpOverviewSection,
  HelpShippingSection,
  HelpReturnsSection,
  HelpSizeSection,
  HelpCareSection,
  HelpContactSection,
  HelpFaqSection,
} from "./_components/help-sections";

export default function HelpCenter() {
  const { t, locale } = useI18n();
  const [activeTopic, setActiveTopic] = useState("overview");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isVi = locale === "vi";

  const helpTopics = [
    { id: "overview", label: isVi ? "Tổng quan" : "Overview" },
    { id: "shipping", label: isVi ? "Giao hàng" : "Shipping" },
    { id: "returns", label: isVi ? "Đổi và trả hàng" : "Returns & Exchanges" },
    { id: "size", label: isVi ? "Kích cỡ và phom dáng" : "Size & Fit" },
    { id: "care", label: isVi ? "Bảo quản sản phẩm" : "Product Care" },
    { id: "contact", label: isVi ? "Liên hệ" : "Contact Us" },
    { id: "faq", label: isVi ? "Câu hỏi thường gặp" : "FAQs" },
  ];

  const searchIndex = [
    {
      id: "shipping",
      title: isVi ? "Giao hàng & Phí vận chuyển" : "Shipping & Fees",
      subtitle: isVi
        ? "Thời gian 2-4 ngày, freeship đơn từ 1.5M, hỏa tốc 2H"
        : "2-4 days, free delivery over 1.5M, 2H express",
      category: isVi ? "Vận chuyển" : "Delivery",
    },
    {
      id: "returns",
      title: isVi ? "Chính sách đổi trả 30 ngày" : "30-Day Return Policy",
      subtitle: isVi
        ? "Thu hồi tận nơi miễn phí, điều kiện tem mác, hoàn tiền 24H"
        : "Free doorstep pickup, tag conditions, 24H refund",
      category: isVi ? "Đổi trả" : "Returns",
    },
    {
      id: "size",
      title: isVi ? "Hướng dẫn chọn kích cỡ (Size Guide)" : "Garment Size Guide",
      subtitle: isVi
        ? "Bảng số đo 3 vòng, phom Tailored, Relaxed, Oversized"
        : "Measurements, Tailored, Relaxed, Oversized fit",
      category: isVi ? "Kích cỡ" : "Sizing",
    },
    {
      id: "care",
      title: isVi ? "Bảo quản vải đũi Linen, Lụa & Len" : "Care for Linen, Silk & Wool",
      subtitle: isVi
        ? "Hướng dẫn giặt tay, giặt khô và ủi hơi nước cao cấp"
        : "Washing, dry cleaning, and steaming instructions",
      category: isVi ? "Chất liệu" : "Fabric Care",
    },
    {
      id: "contact",
      title: isVi ? "Hotline Concierge 1900 6886 & Store" : "Concierge Hotline 1900 6886 & Store",
      subtitle: isVi
        ? "Tư vấn 8:30-22:00, Email concierge@velawear.com, Store Hà Nội & TP.HCM"
        : "Concierge support, Email & Flagship store locations",
      category: isVi ? "Liên hệ" : "Contact",
    },
    {
      id: "faq",
      title: isVi ? "Giải đáp các câu hỏi thường gặp" : "Frequently Asked Questions",
      subtitle: isVi
        ? "Tổng hợp giải đáp thắc mắc về đơn hàng và sản phẩm"
        : "Quick answers to common order and product queries",
      category: isVi ? "Hỏi đáp" : "FAQ",
    },
  ];

  // Scrollspy via scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ["overview", "shipping", "returns", "size", "care", "contact", "faq"];
      const scrollPosition = window.scrollY + 160;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTopic(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTopic(id);
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 110;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: isVi
        ? "Giao hàng tiêu chuẩn mất bao lâu?"
        : "How long does standard shipping take?",
      answer: isVi
        ? "Đơn hàng nội thành Hà Nội và TP.HCM được giao trong 1–2 ngày làm việc. Các tỉnh thành khác thường mất 2–4 ngày. Bạn sẽ nhận được mã vận đơn theo dõi qua email ngay khi đơn hàng rời kho."
        : "Standard delivery within Hanoi and HCMC usually takes 1–2 business days. Other provinces take 2–4 days. Tracking details are emailed as soon as your package ships.",
    },
    {
      question: isVi
        ? "Tôi có thể sửa hoặc hủy đơn sau khi đặt không?"
        : "Can I modify or cancel an order after placing it?",
      answer: isVi
        ? "Vela Wear xử lý đơn hàng trong vòng 30 phút sau khi ghi nhận. Hãy liên hệ hotline Concierge 1900 6886 ngay lập tức. Nếu đơn chưa bàn giao cho bên vận chuyển, chúng tôi sẽ hỗ trợ điều chỉnh miễn phí."
        : "We process orders promptly within 30 minutes. Contact our Concierge hotline 1900 6886 immediately. If the package hasn't left our fulfillment center, we can update your order free of charge.",
    },
    {
      question: isVi
        ? "Chính sách đổi trả trong 30 ngày áp dụng như thế nào?"
        : "How does the 30-day return policy work?",
      answer: isVi
        ? "Bạn có thể đổi size, đổi mẫu hoặc trả hàng trong vòng 30 ngày kể từ khi nhận. Sản phẩm cần giữ nguyên tem mác, chưa qua sử dụng hay giặt tẩy. Đội ngũ giao hàng sẽ đến lấy tận nơi hoàn toàn miễn phí."
        : "You can exchange sizes, swap items, or return within 30 days of delivery. Items must remain unworn, unwashed, and with original tags attached. We provide free doorstep courier pickup.",
    },
    {
      question: isVi
        ? "Chất liệu đũi Linen và Lụa nên được chăm sóc ra sao?"
        : "How should Linen and Silk garments be cared for?",
      answer: isVi
        ? "Sản phẩm Linen nên được giặt máy chế độ nhẹ (nhiệt độ dưới 30°C) hoặc giặt tay, phơi trong bóng râm và ủi khi còn ẩm nhẹ. Với trang phục Lụa & Satin, khuyến khích giặt khô hoặc giặt tay với dầu gội dịu nhẹ."
        : "Linen items should be washed on a gentle cycle (<30°C) or handwashed, line-dried in shade, and ironed while damp. For Silk & Satin pieces, professional dry cleaning or mild handwash is recommended.",
    },
  ];

  const searchResults = searchQuery.trim()
    ? searchIndex.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f4ef] text-[#1c1a18]">
      <main className="mx-auto w-full max-w-[1800px] flex-grow px-6 pt-[104px] pb-16 md:px-16 md:pt-[120px] md:pb-24">
        {/* Header Title & Interactive Search Bar */}
        <HelpHeader
          isVi={isVi}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          searchResults={searchResults}
          scrollToSection={scrollToSection}
          searchAriaLabel={t("help.search")}
        />

        {/* Sidebar Navigation & Main Content Split */}
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
          {/* Seamless Left Sidebar Navigation */}
          <HelpSidebar
            isVi={isVi}
            helpTopics={helpTopics}
            activeTopic={activeTopic}
            scrollToSection={scrollToSection}
          />

          {/* Right Main Content Stream */}
          <div className="flex w-full flex-col gap-10 md:gap-14 lg:w-3/4">
            <HelpOverviewSection isVi={isVi} scrollToSection={scrollToSection} />
            <HelpShippingSection isVi={isVi} />
            <HelpReturnsSection isVi={isVi} />
            <HelpSizeSection isVi={isVi} />
            <HelpCareSection isVi={isVi} />
            <HelpContactSection isVi={isVi} />
            <HelpFaqSection
              filteredFaqs={filteredFaqs}
              openFaqIndex={openFaqIndex}
              toggleFaq={toggleFaq}
              faqTitle={t("help.faq.title")}
              noResultsText={t("help.noResults")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
