"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Truck,
  RotateCcw,
  Ruler,
  Sparkles,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Headphones,
  HelpCircle,
  X,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

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
        <header className="mx-auto mb-16 flex max-w-2xl flex-col items-center text-center md:mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#b5573a]/10 px-3.5 py-1 text-xs font-semibold tracking-[0.2em] text-[#b5573a] uppercase">
            <Sparkles className="size-3.5" />
            <span>Vela Concierge</span>
          </div>
          <h1 className="mb-6 font-serif text-3xl leading-tight font-light tracking-[-0.02em] text-[#1c1a18] md:text-5xl">
            {isVi ? "Vela có thể hỗ trợ bạn điều gì?" : "How can we assist you today?"}
          </h1>
          <p className="mb-8 max-w-lg text-sm leading-relaxed font-light text-[#55423d]/80 md:text-base">
            {isVi
              ? "Tìm kiếm câu trả lời nhanh chóng về đơn hàng, dịch vụ giao nhận, chính sách đổi trả hoặc tư vấn chất liệu & phom dáng."
              : "Search for instant guidance on orders, express delivery, returns, size fit, or premium textile care."}
          </p>

          {/* Search Input Box */}
          <div className="relative w-full">
            <div className="border-hairline relative w-full overflow-hidden rounded-sm border bg-white shadow-sm transition-all focus-within:border-[#b5573a]">
              <span className="text-on-surface-variant/50 absolute top-1/2 left-4 -translate-y-1/2">
                <Search className="size-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none bg-white p-0 py-4 pr-10 pl-12 font-sans text-sm text-[#1c1a18] placeholder-[#55423d]/50 transition-all focus:outline-none"
                placeholder={
                  isVi
                    ? "Nhập từ khóa (vd: giao hàng, đổi trả, chọn size, linen)..."
                    : "Search topics (shipping, returns, size, care)..."
                }
                aria-label={t("help.search")}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-on-surface-variant/50 absolute top-1/2 right-4 -translate-y-1/2 transition-colors hover:text-[#1c1a18]"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Floating Suggestions Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="border-hairline absolute top-full right-0 left-0 z-30 mt-2 max-h-80 overflow-y-auto rounded-md border bg-white p-2 text-left shadow-md">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        scrollToSection(result.id);
                        setIsSearchFocused(false);
                      }}
                      className="group border-hairline/20 flex w-full items-start justify-between rounded-sm border-b p-3 text-left transition-colors last:border-none hover:bg-[#f2ebe1]/60"
                    >
                      <div>
                        <div className="mb-0.5 text-xs font-semibold tracking-wider text-[#b5573a] uppercase">
                          {result.category}
                        </div>
                        <div className="font-serif text-sm font-medium text-[#1c1a18] transition-colors group-hover:text-[#b5573a]">
                          {result.title}
                        </div>
                        <div className="text-on-surface-variant/75 text-xs font-light">
                          {result.subtitle}
                        </div>
                      </div>
                      <ArrowRight className="text-on-surface-variant/40 mt-1 size-4 shrink-0 transition-all group-hover:translate-x-0.5 group-hover:text-[#b5573a]" />
                    </button>
                  ))
                ) : (
                  <div className="text-on-surface-variant/60 p-4 text-center text-xs italic">
                    {isVi
                      ? "Không tìm thấy chủ đề trùng khớp. Xem các câu hỏi thường gặp bên dưới."
                      : "No matching topic found. See FAQ section below."}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Sidebar Navigation & Main Content Split */}
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
          {/* Seamless Left Sidebar Navigation (Nike Editorial Style) */}
          <aside className="sticky top-28 hidden max-h-[calc(100vh-140px)] w-full shrink-0 overflow-y-auto pr-6 select-none lg:block lg:w-1/4">
            <div>
              <h3 className="border-hairline/40 mb-6 border-b pb-3 font-sans text-xs font-semibold tracking-[0.15em] text-[#55423d]/60 uppercase">
                {isVi ? "CHỦ ĐỀ HỖ TRỢ" : "HELP TOPICS"}
              </h3>

              <nav className="flex flex-col gap-2">
                {helpTopics.map((topic) => {
                  const isActive = topic.id === activeTopic;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => scrollToSection(topic.id)}
                      className={cn(
                        "group flex items-center justify-between border-l-2 py-1.5 pl-4 text-left text-sm font-medium tracking-[0.03em] transition-all",
                        isActive
                          ? "border-[#b5573a] font-semibold text-[#b5573a]"
                          : "border-transparent text-[#55423d]/70 hover:text-[#b5573a]",
                      )}
                    >
                      <span>{topic.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Directly Accessible Call Box */}
              <div className="border-hairline border-hairline/30 mt-8 space-y-2 rounded-sm border border-t bg-[#f2ebe1]/50 p-4 pt-6">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#1c1a18]">
                  <Headphones className="size-3.5 text-[#b5573a]" />
                  <span>{isVi ? "Cần tư vấn trực tiếp?" : "Need instant advice?"}</span>
                </p>
                <a
                  href="tel:19006886"
                  className="flex items-center gap-2 pt-0.5 text-sm font-semibold text-[#b5573a] hover:underline"
                >
                  <Phone className="size-3.5" />
                  <span>1900 6886</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Main Content Stream */}
          <div className="flex w-full flex-col gap-10 md:gap-14 lg:w-3/4">
            {/* Section 1: Overview Quick Cards */}
            <section id="overview" className="flex scroll-mt-28 flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <button
                  onClick={() => scrollToSection("shipping")}
                  className="group border-hairline/40 rounded-sm border bg-white p-8 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Truck className="mb-4 size-8 text-[#b5573a] transition-transform group-hover:scale-105" />
                  <h3 className="mb-2 font-serif text-xl font-medium tracking-tight text-[#1c1a18] md:text-2xl">
                    {isVi ? "Giao hàng & Vận chuyển" : "Shipping & Delivery"}
                  </h3>
                  <p className="text-sm leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Thời gian, chi phí, theo dõi đơn và dịch vụ hỏa tốc nội thành."
                      : "Delivery times, shipping fees, tracking, and same-day express service."}
                  </p>
                </button>

                <button
                  onClick={() => scrollToSection("returns")}
                  className="group border-hairline/40 rounded-sm border bg-white p-8 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <RotateCcw className="mb-4 size-8 text-[#b5573a] transition-transform group-hover:scale-105" />
                  <h3 className="mb-2 font-serif text-xl font-medium tracking-tight text-[#1c1a18] md:text-2xl">
                    {isVi ? "Đổi và trả hàng" : "Returns & Exchanges"}
                  </h3>
                  <p className="text-sm leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Chính sách 30 ngày, thu hồi tận nơi miễn phí và hình thức hoàn tiền."
                      : "30-day return policy, free doorstep courier pickup, and refund processing."}
                  </p>
                </button>

                <button
                  onClick={() => scrollToSection("size")}
                  className="group border-hairline/40 rounded-sm border bg-white p-8 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Ruler className="mb-4 size-8 text-[#b5573a] transition-transform group-hover:scale-105" />
                  <h3 className="mb-2 font-serif text-xl font-medium tracking-tight text-[#1c1a18] md:text-2xl">
                    {isVi ? "Hướng dẫn chọn cỡ" : "Size & Fit Guide"}
                  </h3>
                  <p className="text-sm leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Số đo chi tiết 3 vòng và tư vấn phom dáng Tailored / Relaxed / Oversized."
                      : "Detailed measurements and fit advice for every garment style."}
                  </p>
                </button>

                <button
                  onClick={() => scrollToSection("care")}
                  className="group border-hairline/40 rounded-sm border bg-white p-8 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Sparkles className="mb-4 size-8 text-[#b5573a] transition-transform group-hover:scale-105" />
                  <h3 className="mb-2 font-serif text-xl font-medium tracking-tight text-[#1c1a18] md:text-2xl">
                    {isVi ? "Bảo quản sản phẩm" : "Product Care"}
                  </h3>
                  <p className="text-sm leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Chăm sóc chất liệu đũi Linen, Lụa, Dệt kim và các dòng áo khoác cao cấp."
                      : "Care guidelines for Linen, Silk, Knitwear, and tailored outerwear."}
                  </p>
                </button>
              </div>

              {/* 3 Core Commitments Banner */}
              <div className="border-hairline/40 grid grid-cols-1 gap-6 rounded-sm border bg-white p-8 shadow-[0_2px_12px_rgba(28,26,24,0.03)] md:grid-cols-3">
                <div className="flex items-start gap-4">
                  <PackageCheck className="mt-0.5 size-6 shrink-0 text-[#b5573a]" />
                  <div>
                    <h5 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                      {isVi ? "Đóng Gói Độc Quyền" : "Signature Packaging"}
                    </h5>
                    <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                      {isVi
                        ? "Hộp sản phẩm cứng cao cấp, túi bọc trang phục vải cao cấp và giấy nến thơm giữ nguyên phom."
                        : "Rigid luxury gift box, protective garment bag, and scented tissue paper for perfect drape."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <ShieldCheck className="mt-0.5 size-6 shrink-0 text-[#b5573a]" />
                  <div>
                    <h5 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                      {isVi ? "Cam Kết 100% Chính Hãng" : "Guaranteed Authenticity"}
                    </h5>
                    <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                      {isVi
                        ? "Mọi thiết kế đều được may may chỉn chu từ nguồn vải nhập khẩu tinh tuyển có chứng nhận nguồn gốc."
                        : "Every garment is crafted from certified premium imported textiles with artisanal precision."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Headphones className="mt-0.5 size-6 shrink-0 text-[#b5573a]" />
                  <div>
                    <h5 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                      {isVi ? "Concierge Phục Vụ 7 Ngày" : "Dedicated Concierge"}
                    </h5>
                    <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                      {isVi
                        ? "Đội ngũ chuyên viên tư vấn phối đồ và hỗ trợ xử lý đơn hàng từ 8:30 - 22:00 tất cả các ngày."
                        : "Personal styling advisors and order specialists available from 8:30 to 22:00 daily."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Shipping */}
            <section
              id="shipping"
              className="border-hairline/40 flex scroll-mt-28 flex-col gap-6 rounded-sm border bg-white p-8 shadow-[0_2px_12px_rgba(28,26,24,0.03)] md:p-10"
            >
              <div className="border-hairline flex items-center gap-3 border-b pb-4">
                <span className="rounded-sm bg-[#b5573a]/10 px-2 py-0.5 font-mono text-xs font-semibold tracking-widest text-[#b5573a] uppercase">
                  01
                </span>
                <h2 className="font-serif text-2xl font-light text-[#1c1a18] md:text-3xl">
                  {isVi ? "Giao hàng & Vận chuyển" : "Shipping & Delivery"}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="border-hairline/30 flex flex-col justify-between rounded-sm border bg-[#f9f7f4] p-6">
                  <div>
                    <span className="mb-3 inline-block rounded-sm bg-[#b5573a]/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#b5573a] uppercase">
                      {isVi ? "Phổ biến" : "Standard"}
                    </span>
                    <h4 className="mb-2 font-serif text-lg font-medium text-[#1c1a18]">
                      {isVi ? "Giao Hàng Tiêu Chuẩn" : "Standard Delivery"}
                    </h4>
                    <p className="mb-4 text-xs leading-relaxed font-light text-[#55423d]/80">
                      {isVi
                        ? "Áp dụng cho mọi tỉnh thành trên toàn quốc qua đối tác bưu chính cao cấp."
                        : "Nationwide express courier service for all cities and provinces."}
                    </p>
                  </div>
                  <div className="border-hairline/30 flex justify-between border-t pt-4 text-xs font-medium text-[#1c1a18]">
                    <span>{isVi ? "Thời gian: 2 - 4 ngày" : "Time: 2–4 days"}</span>
                    <span className="text-[#b5573a]">
                      {isVi ? "Freeship đơn > 1.5M" : "Free over 1.5M"}
                    </span>
                  </div>
                </div>

                <div className="border-hairline/30 flex flex-col justify-between rounded-sm border bg-[#f9f7f4] p-6">
                  <div>
                    <span className="mb-3 inline-block rounded-sm bg-[#b5573a]/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#b5573a] uppercase">
                      {isVi ? "Nội thành" : "Same Day"}
                    </span>
                    <h4 className="mb-2 font-serif text-lg font-medium text-[#1c1a18]">
                      {isVi ? "Giao Hỏa Tốc 2H" : "Express 2-Hour Delivery"}
                    </h4>
                    <p className="mb-4 text-xs leading-relaxed font-light text-[#55423d]/80">
                      {isVi
                        ? "Giao nhận trực tiếp trong vòng 2-4 giờ tại các quận nội thành Hà Nội & TP.HCM."
                        : "Direct courier dispatch within 2-4 hours inside Hanoi & HCMC city centers."}
                    </p>
                  </div>
                  <div className="border-hairline/30 flex justify-between border-t pt-4 text-xs font-medium text-[#1c1a18]">
                    <span>{isVi ? "Thời gian: 2 - 4 giờ" : "Time: 2–4 hours"}</span>
                    <span className="text-[#b5573a]">55.000 VNĐ</span>
                  </div>
                </div>

                <div className="border-hairline/30 flex flex-col justify-between rounded-sm border bg-[#f9f7f4] p-6">
                  <div>
                    <span className="mb-3 inline-block rounded-sm bg-[#6f554c]/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#6f554c] uppercase">
                      {isVi ? "Quốc tế" : "Global"}
                    </span>
                    <h4 className="mb-2 font-serif text-lg font-medium text-[#1c1a18]">
                      {isVi ? "Giao Hàng Quốc Tế" : "International Shipping"}
                    </h4>
                    <p className="mb-4 text-xs leading-relaxed font-light text-[#55423d]/80">
                      {isVi
                        ? "Vận chuyển toàn cầu tới Đông Nam Á, Châu Âu, Mỹ qua dịch vụ DHL Express."
                        : "Global shipping to Asia, US, EU, and UK via DHL Express."}
                    </p>
                  </div>
                  <div className="border-hairline/30 flex justify-between border-t pt-4 text-xs font-medium text-[#1c1a18]">
                    <span>{isVi ? "Thời gian: 5 - 7 ngày" : "Time: 5–7 days"}</span>
                    <span className="text-[#6f554c]">{isVi ? "Tính theo DHL" : "Calculated"}</span>
                  </div>
                </div>
              </div>

              <div className="border-hairline/30 rounded-sm border bg-[#f9f7f4] p-6 text-xs leading-relaxed text-[#55423d]/85">
                <p className="mb-2 font-medium text-[#1c1a18]">
                  {isVi ? "Cách kiểm tra vị trí đơn hàng:" : "How to track your order:"}
                </p>
                <ol className="list-decimal space-y-1 pl-4">
                  <li>
                    {isVi
                      ? "Đăng nhập tài khoản Vela Wear và vào trang Đơn hàng cá nhân."
                      : "Log in to your account and open My Orders page."}
                  </li>
                  <li>
                    {isVi
                      ? "Nhấp chọn đơn hàng cần xem và lấy mã vận đơn (VD: VELA883921)."
                      : "Select your active order to find the tracking number."}
                  </li>
                  <li>
                    {isVi
                      ? "Hoặc tra cứu mã vận đơn trực tiếp qua email xác nhận đã nhận hàng."
                      : "Or click the direct tracking link provided in your shipment confirmation email."}
                  </li>
                </ol>
              </div>
            </section>

            {/* Section 3: Returns & Exchanges */}
            <section
              id="returns"
              className="border-hairline/40 flex scroll-mt-28 flex-col gap-6 rounded-sm border bg-white p-8 shadow-[0_2px_12px_rgba(28,26,24,0.03)] md:p-10"
            >
              <div className="border-hairline flex items-center gap-3 border-b pb-4">
                <span className="rounded-sm bg-[#b5573a]/10 px-2 py-0.5 font-mono text-xs font-semibold tracking-widest text-[#b5573a] uppercase">
                  02
                </span>
                <h2 className="font-serif text-2xl font-light text-[#1c1a18] md:text-3xl">
                  {isVi ? "Chính sách Đổi và Trả hàng" : "Returns & Exchange Policy"}
                </h2>
              </div>

              <p className="text-sm leading-relaxed font-light text-[#55423d]/85">
                {isVi
                  ? "Nhằm đảm bảo trải nghiệm mua sắm hoàn hảo nhất, Vela Wear áp dụng chính sách đổi trả linh hoạt trong vòng 30 ngày kể từ ngày bạn nhận được sản phẩm."
                  : "To ensure your total peace of mind, Vela Wear offers a seamless 30-day return and exchange policy from the delivery date."}
              </p>

              {/* 3 Step Process Workflow */}
              <div className="my-2 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="border-hairline/30 flex items-start gap-4 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#b5573a] font-mono text-sm font-semibold text-white">
                    1
                  </div>
                  <div>
                    <h5 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                      {isVi ? "Gửi Yêu Cầu" : "Request Return"}
                    </h5>
                    <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                      {isVi
                        ? "Liên hệ Concierge hoặc bấm Đổi/Trả trong mục Quản lý đơn hàng."
                        : "Contact Concierge or click Return on your account dashboard."}
                    </p>
                  </div>
                </div>

                <div className="border-hairline/30 flex items-start gap-4 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#b5573a] font-mono text-sm font-semibold text-white">
                    2
                  </div>
                  <div>
                    <h5 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                      {isVi ? "Thu Hồi Tận Nơi" : "Courier Pickup"}
                    </h5>
                    <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                      {isVi
                        ? "Nhân viên vận chuyển tới tận nhà nhận lại gói hàng miễn phí."
                        : "Our courier collects the parcel directly from your address free."}
                    </p>
                  </div>
                </div>

                <div className="border-hairline/30 flex items-start gap-4 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#b5573a] font-mono text-sm font-semibold text-white">
                    3
                  </div>
                  <div>
                    <h5 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                      {isVi ? "Đổi Sản Phẩm / Hoàn Tiền" : "Exchange / Refund"}
                    </h5>
                    <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                      {isVi
                        ? "Nhận ngay món đồ mới đổi hoặc tiền hoàn về tài khoản trong 24h."
                        : "Receive your exchange or bank refund credited within 24–48 hours."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditions Checklist */}
              <div className="border-hairline/30 grid grid-cols-1 gap-4 border-t pt-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-serif text-base font-medium text-[#1c1a18]">
                    <CheckCircle2 className="size-4 text-[#b5573a]" />
                    {isVi ? "Điều kiện áp dụng đổi trả:" : "Eligible return conditions:"}
                  </h4>
                  <ul className="list-disc space-y-2 pl-6 text-xs font-light text-[#55423d]/80">
                    <li>
                      {isVi
                        ? "Sản phẩm còn giữ nguyên tem mác thương hiệu gốc."
                        : "Garment retains all original brand tags intact."}
                    </li>
                    <li>
                      {isVi
                        ? "Chưa qua giặt tẩy, chưa qua bẩn hay hư hỏng do tác động ngoài."
                        : "Unworn, unwashed, and without perfume/stains."}
                    </li>
                    <li>
                      {isVi
                        ? "Còn đầy đủ bao bì hộp đựng và túi bọc kèm theo."
                        : "Returned with original packaging box & garment bag."}
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-serif text-base font-medium text-[#1c1a18]">
                    <RotateCcw className="size-4 text-[#b5573a]" />
                    {isVi ? "Hình thức hoàn tiền:" : "Refund methods:"}
                  </h4>
                  <ul className="list-disc space-y-2 pl-6 text-xs font-light text-[#55423d]/80">
                    <li>
                      {isVi
                        ? "Chuyển khoản trực tiếp về tài khoản ngân hàng của bạn."
                        : "Direct bank transfer within 24 hours of inspection."}
                    </li>
                    <li>
                      {isVi
                        ? "Hoàn về Thẻ tín dụng/Thẻ ghi nợ (tùy theo ngân hàng phát hành)."
                        : "Reversed to your Credit / Debit card issuer."}
                    </li>
                    <li>
                      {isVi
                        ? "Mã Gift Card mua sắm trực tuyến (có giá trị sử dụng vô thời hạn)."
                        : "Store credit voucher with no expiration date."}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Size & Fit */}
            <section
              id="size"
              className="border-hairline/40 flex scroll-mt-28 flex-col gap-6 rounded-sm border bg-white p-8 shadow-[0_2px_12px_rgba(28,26,24,0.03)] md:p-10"
            >
              <div className="border-hairline flex items-center gap-3 border-b pb-4">
                <span className="rounded-sm bg-[#b5573a]/10 px-2 py-0.5 font-mono text-xs font-semibold tracking-widest text-[#b5573a] uppercase">
                  03
                </span>
                <h2 className="font-serif text-2xl font-light text-[#1c1a18] md:text-3xl">
                  {isVi ? "Kích cỡ & Phom dáng" : "Size & Fit Guide"}
                </h2>
              </div>

              <p className="text-sm leading-relaxed font-light text-[#55423d]/85">
                {isVi
                  ? "Trang phục Vela Wear được thiết kế theo tỷ lệ phom dáng chuẩn quốc tế, tinh chỉnh để vừa vặn với vóc dáng người Á Đông."
                  : "Vela Wear silhouettes are tailored to international proportions, refined specifically for elegant comfortable fits."}
              </p>

              {/* Fit Profiles Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="border-hairline/30 rounded-sm border bg-[#f9f7f4] p-6">
                  <h4 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                    Tailored Fit
                  </h4>
                  <p className="mb-2 font-mono text-xs text-[#b5573a]">
                    {isVi ? "Phom may đo ôm nhẹ" : "Slightly tailored"}
                  </p>
                  <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Thiết kế ôm nhẹ theo đường nét cơ thể, mang lại vẻ sang trọng chỉn chu thích hợp sự kiện & công sở."
                      : "Contoured slightly to natural body lines for structured elegance suitable for formal occasions."}
                  </p>
                </div>

                <div className="border-hairline/30 rounded-sm border bg-[#f9f7f4] p-6">
                  <h4 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                    Relaxed Fit
                  </h4>
                  <p className="mb-2 font-mono text-xs text-[#b5573a]">
                    {isVi ? "Phom rộng thoải mái" : "Naturally relaxed"}
                  </p>
                  <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Khoảng cử động rộng rãi vừa phải, tạo cảm giác nhẹ nhàng tự nhiên khi mặc hàng ngày."
                      : "Generous movement allowance for breathable, effortless everyday comfort."}
                  </p>
                </div>

                <div className="border-hairline/30 rounded-sm border bg-[#f9f7f4] p-6">
                  <h4 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                    Oversized Fit
                  </h4>
                  <p className="mb-2 font-mono text-xs text-[#b5573a]">
                    {isVi ? "Phom rộng thời thượng" : "Modern oversized"}
                  </p>
                  <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Phom áo quần rộng rãi phóng khoáng, vai trễ và độ rủ tạo điểm nhấn thời trang hiện đại."
                      : "Dropped shoulders and generous drape creating a contemporary fashion silhouette."}
                  </p>
                </div>
              </div>

              <div className="border-hairline/30 flex flex-col items-start justify-between gap-4 rounded-sm border bg-[#f9f7f4] p-6 sm:flex-row sm:items-center">
                <div>
                  <h4 className="mb-1 font-serif text-lg font-medium text-[#1c1a18]">
                    {isVi
                      ? "Xem bảng số đo chi tiết từng dòng sản phẩm"
                      : "View complete garment size chart"}
                  </h4>
                  <p className="text-xs font-light text-[#55423d]/80">
                    {isVi
                      ? "Bao gồm số đo Vòng 1, Vòng 2, Vòng 3 & chiều dài áo/quần."
                      : "Includes bust, waist, hips, and garment length specifications."}
                  </p>
                </div>
                <Link
                  href="/size-guide"
                  className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-[#b5573a] px-6 py-3 text-xs font-semibold tracking-[0.15em] text-white uppercase transition-colors hover:bg-[#8f4329]"
                >
                  <span>{isVi ? "Bảng chọn size" : "Size Guide"}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </section>

            {/* Section 5: Product Care */}
            <section
              id="care"
              className="border-hairline/40 flex scroll-mt-28 flex-col gap-6 rounded-sm border bg-white p-8 shadow-[0_2px_12px_rgba(28,26,24,0.03)] md:p-10"
            >
              <div className="border-hairline flex items-center gap-3 border-b pb-4">
                <span className="rounded-sm bg-[#b5573a]/10 px-2 py-0.5 font-mono text-xs font-semibold tracking-widest text-[#b5573a] uppercase">
                  04
                </span>
                <h2 className="font-serif text-2xl font-light text-[#1c1a18] md:text-3xl">
                  {isVi ? "Bảo quản sản phẩm & Chất liệu" : "Product & Fabric Care"}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="border-hairline/30 space-y-2 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="flex items-center gap-2 font-serif text-base font-medium text-[#b5573a]">
                    <Sparkles className="size-4" />
                    <span>Linen Blend (Vải Đũi Cao Cấp)</span>
                  </div>
                  <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Giặt tay hoặc giặt máy chế độ nhẹ (nhiệt độ <30°C). Nên giặt cùng túi giặt chuyên dụng, phơi nơi thoáng mát tránh ánh nắng gắt. Ủi ở nhiệt độ trung bình khi vải còn ẩm nhẹ để giữ phom đẹp nhất."
                      : "Handwash or machine wash on a delicate cycle (<30°C). Line dry in the shade and iron while damp on medium heat."}
                  </p>
                </div>

                <div className="border-hairline/30 space-y-2 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="flex items-center gap-2 font-serif text-base font-medium text-[#b5573a]">
                    <Sparkles className="size-4" />
                    <span>Lụa & Satin (Silk & Satin)</span>
                  </div>
                  <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Khuyến khích giặt khô chuyên nghiệp. Nếu giặt tay, hãy sử dụng nước mát và dầu gội dịu nhẹ. Không vắt mạnh, phơi phẳng nơi râm mát và ủi hơi nước ở mặt trái sản phẩm."
                      : "Professional dry cleaning recommended. For gentle handwash, use cold water with mild shampoo. Do not wring; steam iron inside out."}
                  </p>
                </div>

                <div className="border-hairline/30 space-y-2 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="flex items-center gap-2 font-serif text-base font-medium text-[#b5573a]">
                    <Sparkles className="size-4" />
                    <span>Dệt Kim & Len (Knitwear & Wool)</span>
                  </div>
                  <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Giặt khô hoặc giặt nhẹ bằng nước mát với xà phòng chuyên dụng cho len. Phơi nằm ngang trên mặt phẳng để tránh bị chảy xệ dãn dài. Bảo quản bằng cách gấp gọn trong tủ, không treo móc."
                      : "Dry clean or handwash gently with wool detergent. Dry flat horizontally to prevent stretching; store folded, never hung."}
                  </p>
                </div>

                <div className="border-hairline/30 space-y-2 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="flex items-center gap-2 font-serif text-base font-medium text-[#b5573a]">
                    <Sparkles className="size-4" />
                    <span>Cotton & Blazer May Đo (Tailored Outerwear)</span>
                  </div>
                  <p className="text-xs leading-relaxed font-light text-[#55423d]/80">
                    {isVi
                      ? "Blazer và Áo khoác dạ may đo nên giặt khô định kỳ để bảo vệ phom dựng vai. Giặt lộn trái đối với các dòng áo thun Cotton để giữ độ bền màu vải tốt nhất."
                      : "Tailored blazers should be dry-cleaned to protect internal shoulder canvasing. Turn cotton tees inside out before washing."}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Contact Us & Concierge */}
            <section
              id="contact"
              className="border-hairline/40 flex scroll-mt-28 flex-col gap-6 rounded-sm border bg-white p-8 shadow-[0_2px_12px_rgba(28,26,24,0.03)] md:p-10"
            >
              <div className="border-hairline flex items-center gap-3 border-b pb-4">
                <span className="rounded-sm bg-[#b5573a]/10 px-2 py-0.5 font-mono text-xs font-semibold tracking-widest text-[#b5573a] uppercase">
                  05
                </span>
                <h2 className="font-serif text-2xl font-light text-[#1c1a18] md:text-3xl">
                  {isVi ? "Liên hệ & Dịch vụ Concierge" : "Contact & Concierge Services"}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="border-hairline/30 flex flex-col items-start gap-3 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="grid size-10 place-items-center rounded-sm bg-[#b5573a]/10 text-[#b5573a]">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                      {isVi ? "Hotline Concierge" : "Concierge Hotline"}
                    </h4>
                    <p className="mb-2 text-xs font-light text-[#55423d]/75">
                      {isVi ? "Phục vụ 8:30 – 22:00 hàng ngày" : "Daily 8:30 – 22:00"}
                    </p>
                    <a
                      href="tel:19006886"
                      className="text-sm font-semibold text-[#b5573a] hover:underline"
                    >
                      1900 6886
                    </a>
                  </div>
                </div>

                <div className="border-hairline/30 flex flex-col items-start gap-3 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="grid size-10 place-items-center rounded-sm bg-[#b5573a]/10 text-[#b5573a]">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                      {isVi ? "Email Hỗ Trợ" : "Email Support"}
                    </h4>
                    <p className="mb-2 text-xs font-light text-[#55423d]/75">
                      {isVi ? "Phản hồi trong 2 giờ làm việc" : "Response within 2 hours"}
                    </p>
                    <a
                      href="mailto:concierge@velawear.com"
                      className="text-sm font-semibold text-[#b5573a] hover:underline"
                    >
                      concierge@velawear.com
                    </a>
                  </div>
                </div>

                <div className="border-hairline/30 flex flex-col items-start gap-3 rounded-sm border bg-[#f9f7f4] p-6">
                  <div className="grid size-10 place-items-center rounded-sm bg-[#b5573a]/10 text-[#b5573a]">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-serif text-base font-medium text-[#1c1a18]">
                      {isVi ? "Zalo Official Account" : "Zalo Official"}
                    </h4>
                    <p className="mb-2 text-xs font-light text-[#55423d]/75">
                      {isVi ? "Chat trực tiếp với Stylist" : "Chat with a dedicated Stylist"}
                    </p>
                    <span className="text-sm font-semibold text-[#1c1a18]">Vela Wear Official</span>
                  </div>
                </div>
              </div>

              {/* Flagship Store Locations */}
              <div className="border-hairline/30 border-t pt-6">
                <h4 className="mb-4 flex items-center gap-2 font-serif text-lg font-medium text-[#1c1a18]">
                  <MapPin className="size-4 text-[#b5573a]" />
                  <span>{isVi ? "Hệ thống Cửa Hàng Flagship Store" : "Flagship Stores"}</span>
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="border-hairline/30 rounded-sm border bg-[#f9f7f4] p-5 text-xs">
                    <p className="mb-1 font-semibold text-[#1c1a18]">Flagship Store Hà Nội</p>
                    <p className="font-light text-[#55423d]/80">
                      18 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội
                    </p>
                    <p className="mt-1 font-light text-[#55423d]/60">Giờ mở cửa: 9:00 – 21:30</p>
                  </div>
                  <div className="border-hairline/30 rounded-sm border bg-[#f9f7f4] p-5 text-xs">
                    <p className="mb-1 font-semibold text-[#1c1a18]">
                      Flagship Store TP. Hồ Chí Minh
                    </p>
                    <p className="font-light text-[#55423d]/80">
                      122 Đồng Khởi, Quận 1, TP. Hồ Chí Minh
                    </p>
                    <p className="mt-1 font-light text-[#55423d]/60">Giờ mở cửa: 9:00 – 21:30</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: FAQ Accordion Section with Motion Animation & Active Highlighting */}
            <section
              id="faq"
              className="border-hairline/40 flex scroll-mt-28 flex-col gap-6 rounded-sm border bg-white p-8 shadow-[0_2px_12px_rgba(28,26,24,0.03)] md:p-10"
            >
              <div className="border-hairline flex items-center gap-3 border-b pb-4">
                <span className="rounded-sm bg-[#b5573a]/10 px-2 py-0.5 font-mono text-xs font-semibold tracking-widest text-[#b5573a] uppercase">
                  06
                </span>
                <div className="flex items-center gap-2">
                  <HelpCircle className="size-5 text-[#b5573a]" />
                  <h2 className="font-serif text-2xl font-light text-[#1c1a18] md:text-3xl">
                    {t("help.faq.title")}
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col overflow-hidden rounded-sm border transition-all duration-300",
                        isOpen
                          ? "border-[#b5573a]/30 bg-[#f9f7f4] shadow-sm"
                          : "border-hairline/40 bg-white hover:border-[#b5573a]/20",
                      )}
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        aria-expanded={isOpen}
                        className="group flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                      >
                        <span
                          className={cn(
                            "font-sans text-sm font-medium transition-colors md:text-base",
                            isOpen
                              ? "font-semibold text-[#b5573a]"
                              : "text-[#1c1a18] group-hover:text-[#b5573a]",
                          )}
                        >
                          {faq.question}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className={cn(
                            "ml-4 shrink-0 transition-colors",
                            isOpen
                              ? "text-[#b5573a]"
                              : "text-[#55423d]/60 group-hover:text-[#b5573a]",
                          )}
                        >
                          <ChevronDown className="size-4.5" />
                        </motion.span>
                      </button>

                      {/* Smooth Fluid Framer Motion Collapse/Expand Animation */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[#b5573a]/10 px-6 pt-1 pb-6">
                              <p className="font-sans text-xs leading-relaxed font-light text-[#55423d]/85 md:text-sm">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                {filteredFaqs.length === 0 && (
                  <p className="py-8 text-center text-sm text-[#55423d]/60 italic">
                    {t("help.noResults")}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
