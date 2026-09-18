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

const HELP_TOPICS_VI = [
  { id: "overview", label: "Tổng quan" },
  { id: "shipping", label: "Giao hàng" },
  { id: "returns", label: "Đổi và trả hàng" },
  { id: "size", label: "Kích cỡ và phom dáng" },
  { id: "care", label: "Bảo quản sản phẩm" },
  { id: "contact", label: "Liên hệ" },
  { id: "faq", label: "Câu hỏi thường gặp" },
];

const HELP_TOPICS_EN = [
  { id: "overview", label: "Overview" },
  { id: "shipping", label: "Shipping" },
  { id: "returns", label: "Returns & Exchanges" },
  { id: "size", label: "Size & Fit" },
  { id: "care", label: "Product Care" },
  { id: "contact", label: "Contact Us" },
  { id: "faq", label: "FAQs" },
];

const SEARCH_INDEX_VI = [
  {
    id: "shipping",
    title: "Giao hàng & Phí vận chuyển",
    subtitle: "Thời gian 2-4 ngày, freeship đơn từ 1.5M, hỏa tốc 2H",
    category: "Vận chuyển",
  },
  {
    id: "returns",
    title: "Chính sách đổi trả 30 ngày",
    subtitle: "Thu hồi tận nơi miễn phí, điều kiện tem mác, hoàn tiền 24H",
    category: "Đổi trả",
  },
  {
    id: "size",
    title: "Hướng dẫn chọn kích cỡ (Size Guide)",
    subtitle: "Bảng số đo 3 vòng, phom Tailored, Relaxed, Oversized",
    category: "Kích cỡ",
  },
  {
    id: "care",
    title: "Bảo quản vải đũi Linen, Lụa & Len",
    subtitle: "Hướng dẫn giặt tay, giặt khô và ủi hơi nước cao cấp",
    category: "Chất liệu",
  },
  {
    id: "contact",
    title: "Hotline Concierge 1900 6886 & Store",
    subtitle: "Tư vấn 8:30-22:00, Email concierge@velawear.com, Store Hà Nội & TP.HCM",
    category: "Liên hệ",
  },
  {
    id: "faq",
    title: "Giải đáp các câu hỏi thường gặp",
    subtitle: "Tổng hợp giải đáp thắc mắc về đơn hàng và sản phẩm",
    category: "Hỏi đáp",
  },
];

const SEARCH_INDEX_EN = [
  {
    id: "shipping",
    title: "Shipping & Fees",
    subtitle: "2-4 days, free delivery over 1.5M, 2H express",
    category: "Delivery",
  },
  {
    id: "returns",
    title: "30-Day Return Policy",
    subtitle: "Free doorstep pickup, tag conditions, 24H refund",
    category: "Returns",
  },
  {
    id: "size",
    title: "Garment Size Guide",
    subtitle: "Measurements, Tailored, Relaxed, Oversized fit",
    category: "Sizing",
  },
  {
    id: "care",
    title: "Care for Linen, Silk & Wool",
    subtitle: "Washing, dry cleaning, and steaming instructions",
    category: "Fabric Care",
  },
  {
    id: "contact",
    title: "Concierge Hotline 1900 6886 & Store",
    subtitle: "Concierge support, Email & Flagship store locations",
    category: "Contact",
  },
  {
    id: "faq",
    title: "Frequently Asked Questions",
    subtitle: "Quick answers to common order and product queries",
    category: "FAQ",
  },
];

export default function HelpCenter() {
  const { t, locale } = useI18n();
  const [activeTopic, setActiveTopic] = useState("overview");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isVi = locale === "vi";
  const helpTopics = isVi ? HELP_TOPICS_VI : HELP_TOPICS_EN;
  const searchIndex = isVi ? SEARCH_INDEX_VI : SEARCH_INDEX_EN;

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
