"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isClickingRef = useRef(false);

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
      subtitle: isVi ? "Thời gian 2-4 ngày, freeship đơn từ 1.5M, hỏa tốc 2H" : "2-4 days, free delivery over 1.5M, 2H express",
      category: isVi ? "Vận chuyển" : "Delivery",
    },
    {
      id: "returns",
      title: isVi ? "Chính sách đổi trả 30 ngày" : "30-Day Return Policy",
      subtitle: isVi ? "Thu hồi tận nơi miễn phí, điều kiện tem mác, hoàn tiền 24H" : "Free doorstep pickup, tag conditions, 24H refund",
      category: isVi ? "Đổi trả" : "Returns",
    },
    {
      id: "size",
      title: isVi ? "Hướng dẫn chọn kích cỡ (Size Guide)" : "Garment Size Guide",
      subtitle: isVi ? "Bảng số đo 3 vòng, phom Tailored, Relaxed, Oversized" : "Measurements, Tailored, Relaxed, Oversized fit",
      category: isVi ? "Kích cỡ" : "Sizing",
    },
    {
      id: "care",
      title: isVi ? "Bảo quản vải đũi Linen, Lụa & Len" : "Care for Linen, Silk & Wool",
      subtitle: isVi ? "Hướng dẫn giặt tay, giặt khô và ủi hơi nước cao cấp" : "Washing, dry cleaning, and steaming instructions",
      category: isVi ? "Chất liệu" : "Fabric Care",
    },
    {
      id: "contact",
      title: isVi ? "Hotline Concierge 1900 6886 & Store" : "Concierge Hotline 1900 6886 & Store",
      subtitle: isVi ? "Tư vấn 8:30-22:00, Email concierge@velawear.com, Store Hà Nội & TP.HCM" : "Concierge support, Email & Flagship store locations",
      category: isVi ? "Liên hệ" : "Contact",
    },
    {
      id: "faq",
      title: isVi ? "Giải đáp các câu hỏi thường gặp" : "Frequently Asked Questions",
      subtitle: isVi ? "Tổng hợp giải đáp thắc mắc về đơn hàng và sản phẩm" : "Quick answers to common order and product queries",
      category: isVi ? "Hỏi đáp" : "FAQ",
    },
  ];

  // Scrollspy via IntersectionObserver
  useEffect(() => {
    const handleScroll = () => {
      if (Date.now() - lastClickTime < 800) return;
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
  }, [lastClickTime]);

  const scrollToSection = (id: string) => {
    setActiveTopic(id);
    setLastClickTime(Date.now());
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
      question: isVi ? "Giao hàng tiêu chuẩn mất bao lâu?" : "How long does standard shipping take?",
      answer: isVi
        ? "Đơn hàng nội thành Hà Nội và TP.HCM được giao trong 1–2 ngày làm việc. Các tỉnh thành khác thường mất 2–4 ngày. Bạn sẽ nhận được mã vận đơn theo dõi qua email ngay khi đơn hàng rời kho."
        : "Standard delivery within Hanoi and HCMC usually takes 1–2 business days. Other provinces take 2–4 days. Tracking details are emailed as soon as your package ships.",
    },
    {
      question: isVi ? "Tôi có thể sửa hoặc hủy đơn sau khi đặt không?" : "Can I modify or cancel an order after placing it?",
      answer: isVi
        ? "Vela Wear xử lý đơn hàng trong vòng 30 phút sau khi ghi nhận. Hãy liên hệ hotline Concierge 1900 6886 ngay lập tức. Nếu đơn chưa bàn giao cho bên vận chuyển, chúng tôi sẽ hỗ trợ điều chỉnh miễn phí."
        : "We process orders promptly within 30 minutes. Contact our Concierge hotline 1900 6886 immediately. If the package hasn't left our fulfillment center, we can update your order free of charge.",
    },
    {
      question: isVi ? "Chính sách đổi trả trong 30 ngày áp dụng như thế nào?" : "How does the 30-day return policy work?",
      answer: isVi
        ? "Bạn có thể đổi size, đổi mẫu hoặc trả hàng trong vòng 30 ngày kể từ khi nhận. Sản phẩm cần giữ nguyên tem mác, chưa qua sử dụng hay giặt tẩy. Đội ngũ giao hàng sẽ đến lấy tận nơi hoàn toàn miễn phí."
        : "You can exchange sizes, swap items, or return within 30 days of delivery. Items must remain unworn, unwashed, and with original tags attached. We provide free doorstep courier pickup.",
    },
    {
      question: isVi ? "Chất liệu đũi Linen và Lụa nên được chăm sóc ra sao?" : "How should Linen and Silk garments be cared for?",
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
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f7f4ef] text-[#1c1a18] min-h-screen flex flex-col">
      <main className="flex-grow w-full max-w-[1800px] mx-auto px-6 md:px-16 pt-[104px] pb-16 md:pt-[120px] md:pb-24">
        
        {/* Header Title & Interactive Search Bar */}
        <header className="text-center mb-16 md:mb-20 max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b5573a]/10 text-[#b5573a] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            <Sparkles className="size-3.5" />
            <span>Vela Concierge</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-[#1c1a18] leading-tight tracking-[-0.02em] mb-6">
            {isVi ? "Vela có thể hỗ trợ bạn điều gì?" : "How can we assist you today?"}
          </h1>
          <p className="text-sm md:text-base text-[#55423d]/80 font-light leading-relaxed mb-8 max-w-lg">
            {isVi
              ? "Tìm kiếm câu trả lời nhanh chóng về đơn hàng, dịch vụ giao nhận, chính sách đổi trả hoặc tư vấn chất liệu & phom dáng."
              : "Search for instant guidance on orders, express delivery, returns, size fit, or premium textile care."}
          </p>

          {/* Search Input Box */}
          <div className="relative w-full">
            <div className="relative w-full shadow-sm rounded-sm overflow-hidden border border-hairline bg-white focus-within:border-[#b5573a] transition-all">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                <Search className="size-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white py-4 pl-12 pr-10 font-sans text-sm text-[#1c1a18] placeholder-[#55423d]/50 focus:outline-none transition-all p-0 border-none"
                placeholder={isVi ? "Nhập từ khóa (vd: giao hàng, đổi trả, chọn size, linen)..." : "Search topics (shipping, returns, size, care)..."}
                aria-label={t("help.search")}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-[#1c1a18] transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Floating Suggestions Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-hairline shadow-md rounded-md z-30 p-2 max-h-80 overflow-y-auto text-left">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        scrollToSection(result.id);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left p-3 hover:bg-[#f2ebe1]/60 rounded-sm transition-colors flex items-start justify-between group border-b border-hairline/20 last:border-none"
                    >
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#b5573a] mb-0.5">
                          {result.category}
                        </div>
                        <div className="font-serif text-sm font-medium text-[#1c1a18] group-hover:text-[#b5573a] transition-colors">
                          {result.title}
                        </div>
                        <div className="text-xs text-on-surface-variant/75 font-light">
                          {result.subtitle}
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-on-surface-variant/40 group-hover:text-[#b5573a] group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-on-surface-variant/60 italic">
                    {isVi ? "Không tìm thấy chủ đề trùng khớp. Xem các câu hỏi thường gặp bên dưới." : "No matching topic found. See FAQ section below."}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Sidebar Navigation & Main Content Split */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Seamless Left Sidebar Navigation (Nike Editorial Style) */}
          <aside className="w-full lg:w-1/4 sticky top-28 hidden lg:block select-none max-h-[calc(100vh-140px)] overflow-y-auto shrink-0 pr-6">
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#55423d]/60 mb-6 border-b border-hairline/40 pb-3">
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
                        "text-left text-sm font-medium tracking-[0.03em] pl-4 py-1.5 border-l-2 transition-all flex items-center justify-between group",
                        isActive
                          ? "text-[#b5573a] border-[#b5573a] font-semibold"
                          : "text-[#55423d]/70 hover:text-[#b5573a] border-transparent"
                      )}
                    >
                      <span>{topic.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Directly Accessible Call Box */}
              <div className="mt-8 pt-6 border-t border-hairline bg-[#f2ebe1]/50 p-4 rounded-sm border border-hairline/30 space-y-2">
                <p className="text-xs font-medium text-[#1c1a18] flex items-center gap-1.5">
                  <Headphones className="size-3.5 text-[#b5573a]" />
                  <span>{isVi ? "Cần tư vấn trực tiếp?" : "Need instant advice?"}</span>
                </p>
                <a
                  href="tel:19006886"
                  className="flex items-center gap-2 text-[#b5573a] hover:underline font-semibold text-sm pt-0.5"
                >
                  <Phone className="size-3.5" />
                  <span>1900 6886</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Main Content Stream */}
          <div className="w-full lg:w-3/4 flex flex-col gap-10 md:gap-14">
            
            {/* Section 1: Overview Quick Cards */}
            <section id="overview" className="scroll-mt-28 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => scrollToSection("shipping")}
                  className="group text-left bg-white border border-hairline/40 p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 rounded-sm"
                >
                  <Truck className="size-8 text-[#b5573a] mb-4 transition-transform group-hover:scale-105" />
                  <h3 className="font-serif text-xl md:text-2xl text-[#1c1a18] font-medium tracking-tight mb-2">
                    {isVi ? "Giao hàng & Vận chuyển" : "Shipping & Delivery"}
                  </h3>
                  <p className="text-sm text-[#55423d]/80 font-light leading-relaxed">
                    {isVi ? "Thời gian, chi phí, theo dõi đơn và dịch vụ hỏa tốc nội thành." : "Delivery times, shipping fees, tracking, and same-day express service."}
                  </p>
                </button>

                <button
                  onClick={() => scrollToSection("returns")}
                  className="group text-left bg-white border border-hairline/40 p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 rounded-sm"
                >
                  <RotateCcw className="size-8 text-[#b5573a] mb-4 transition-transform group-hover:scale-105" />
                  <h3 className="font-serif text-xl md:text-2xl text-[#1c1a18] font-medium tracking-tight mb-2">
                    {isVi ? "Đổi và trả hàng" : "Returns & Exchanges"}
                  </h3>
                  <p className="text-sm text-[#55423d]/80 font-light leading-relaxed">
                    {isVi ? "Chính sách 30 ngày, thu hồi tận nơi miễn phí và hình thức hoàn tiền." : "30-day return policy, free doorstep courier pickup, and refund processing."}
                  </p>
                </button>

                <button
                  onClick={() => scrollToSection("size")}
                  className="group text-left bg-white border border-hairline/40 p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 rounded-sm"
                >
                  <Ruler className="size-8 text-[#b5573a] mb-4 transition-transform group-hover:scale-105" />
                  <h3 className="font-serif text-xl md:text-2xl text-[#1c1a18] font-medium tracking-tight mb-2">
                    {isVi ? "Hướng dẫn chọn cỡ" : "Size & Fit Guide"}
                  </h3>
                  <p className="text-sm text-[#55423d]/80 font-light leading-relaxed">
                    {isVi ? "Số đo chi tiết 3 vòng và tư vấn phom dáng Tailored / Relaxed / Oversized." : "Detailed measurements and fit advice for every garment style."}
                  </p>
                </button>

                <button
                  onClick={() => scrollToSection("care")}
                  className="group text-left bg-white border border-hairline/40 p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 rounded-sm"
                >
                  <Sparkles className="size-8 text-[#b5573a] mb-4 transition-transform group-hover:scale-105" />
                  <h3 className="font-serif text-xl md:text-2xl text-[#1c1a18] font-medium tracking-tight mb-2">
                    {isVi ? "Bảo quản sản phẩm" : "Product Care"}
                  </h3>
                  <p className="text-sm text-[#55423d]/80 font-light leading-relaxed">
                    {isVi ? "Chăm sóc chất liệu đũi Linen, Lụa, Dệt kim và các dòng áo khoác cao cấp." : "Care guidelines for Linen, Silk, Knitwear, and tailored outerwear."}
                  </p>
                </button>
              </div>

              {/* 3 Core Commitments Banner */}
              <div className="bg-white rounded-sm p-8 border border-hairline/40 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-[0_2px_12px_rgba(28,26,24,0.03)]">
                <div className="flex items-start gap-4">
                  <PackageCheck className="size-6 text-[#b5573a] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-serif text-base text-[#1c1a18] font-medium mb-1">
                      {isVi ? "Đóng Gói Độc Quyền" : "Signature Packaging"}
                    </h5>
                    <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                      {isVi
                        ? "Hộp sản phẩm cứng cao cấp, túi bọc trang phục vải cao cấp và giấy nến thơm giữ nguyên phom."
                        : "Rigid luxury gift box, protective garment bag, and scented tissue paper for perfect drape."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <ShieldCheck className="size-6 text-[#b5573a] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-serif text-base text-[#1c1a18] font-medium mb-1">
                      {isVi ? "Cam Kết 100% Chính Hãng" : "Guaranteed Authenticity"}
                    </h5>
                    <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                      {isVi
                        ? "Mọi thiết kế đều được may may chỉn chu từ nguồn vải nhập khẩu tinh tuyển có chứng nhận nguồn gốc."
                        : "Every garment is crafted from certified premium imported textiles with artisanal precision."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Headphones className="size-6 text-[#b5573a] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-serif text-base text-[#1c1a18] font-medium mb-1">
                      {isVi ? "Concierge Phục Vụ 7 Ngày" : "Dedicated Concierge"}
                    </h5>
                    <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                      {isVi
                        ? "Đội ngũ chuyên viên tư vấn phối đồ và hỗ trợ xử lý đơn hàng từ 8:30 - 22:00 tất cả các ngày."
                        : "Personal styling advisors and order specialists available from 8:30 to 22:00 daily."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Shipping */}
            <section id="shipping" className="scroll-mt-28 bg-white p-8 md:p-10 rounded-sm border border-hairline/40 shadow-[0_2px_12px_rgba(28,26,24,0.03)] flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-hairline pb-4">
                <span className="font-mono text-xs font-semibold text-[#b5573a] uppercase tracking-widest bg-[#b5573a]/10 px-2 py-0.5 rounded-sm">01</span>
                <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light">
                  {isVi ? "Giao hàng & Vận chuyển" : "Shipping & Delivery"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#f9f7f4] p-6 rounded-sm border border-hairline/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#b5573a] bg-[#b5573a]/10 px-2.5 py-0.5 rounded-sm inline-block mb-3">
                      {isVi ? "Phổ biến" : "Standard"}
                    </span>
                    <h4 className="font-serif text-lg font-medium text-[#1c1a18] mb-2">
                      {isVi ? "Giao Hàng Tiêu Chuẩn" : "Standard Delivery"}
                    </h4>
                    <p className="text-xs text-[#55423d]/80 leading-relaxed font-light mb-4">
                      {isVi
                        ? "Áp dụng cho mọi tỉnh thành trên toàn quốc qua đối tác bưu chính cao cấp."
                        : "Nationwide express courier service for all cities and provinces."}
                    </p>
                  </div>
                  <div className="border-t border-hairline/30 pt-4 text-xs font-medium text-[#1c1a18] flex justify-between">
                    <span>{isVi ? "Thời gian: 2 - 4 ngày" : "Time: 2–4 days"}</span>
                    <span className="text-[#b5573a]">{isVi ? "Freeship đơn > 1.5M" : "Free over 1.5M"}</span>
                  </div>
                </div>

                <div className="bg-[#f9f7f4] p-6 rounded-sm border border-hairline/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#964025] bg-[#964025]/10 px-2.5 py-0.5 rounded-sm inline-block mb-3">
                      {isVi ? "Nội thành" : "Same Day"}
                    </span>
                    <h4 className="font-serif text-lg font-medium text-[#1c1a18] mb-2">
                      {isVi ? "Giao Hỏa Tốc 2H" : "Express 2-Hour Delivery"}
                    </h4>
                    <p className="text-xs text-[#55423d]/80 leading-relaxed font-light mb-4">
                      {isVi
                        ? "Giao nhận trực tiếp trong vòng 2-4 giờ tại các quận nội thành Hà Nội & TP.HCM."
                        : "Direct courier dispatch within 2-4 hours inside Hanoi & HCMC city centers."}
                    </p>
                  </div>
                  <div className="border-t border-hairline/30 pt-4 text-xs font-medium text-[#1c1a18] flex justify-between">
                    <span>{isVi ? "Thời gian: 2 - 4 giờ" : "Time: 2–4 hours"}</span>
                    <span className="text-[#964025]">55.000 VNĐ</span>
                  </div>
                </div>

                <div className="bg-[#f9f7f4] p-6 rounded-sm border border-hairline/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6f554c] bg-[#6f554c]/10 px-2.5 py-0.5 rounded-sm inline-block mb-3">
                      {isVi ? "Quốc tế" : "Global"}
                    </span>
                    <h4 className="font-serif text-lg font-medium text-[#1c1a18] mb-2">
                      {isVi ? "Giao Hàng Quốc Tế" : "International Shipping"}
                    </h4>
                    <p className="text-xs text-[#55423d]/80 leading-relaxed font-light mb-4">
                      {isVi
                        ? "Vận chuyển toàn cầu tới Đông Nam Á, Châu Âu, Mỹ qua dịch vụ DHL Express."
                        : "Global shipping to Asia, US, EU, and UK via DHL Express."}
                    </p>
                  </div>
                  <div className="border-t border-hairline/30 pt-4 text-xs font-medium text-[#1c1a18] flex justify-between">
                    <span>{isVi ? "Thời gian: 5 - 7 ngày" : "Time: 5–7 days"}</span>
                    <span className="text-[#6f554c]">{isVi ? "Tính theo DHL" : "Calculated"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f9f7f4] p-6 rounded-sm border border-hairline/30 text-xs text-[#55423d]/85 leading-relaxed">
                <p className="font-medium text-[#1c1a18] mb-2">{isVi ? "Cách kiểm tra vị trí đơn hàng:" : "How to track your order:"}</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>{isVi ? "Đăng nhập tài khoản Vela Wear và vào trang Đơn hàng cá nhân." : "Log in to your account and open My Orders page."}</li>
                  <li>{isVi ? "Nhấp chọn đơn hàng cần xem và lấy mã vận đơn (VD: VELA883921)." : "Select your active order to find the tracking number."}</li>
                  <li>{isVi ? "Hoặc tra cứu mã vận đơn trực tiếp qua email xác nhận đã nhận hàng." : "Or click the direct tracking link provided in your shipment confirmation email."}</li>
                </ol>
              </div>
            </section>

            {/* Section 3: Returns & Exchanges */}
            <section id="returns" className="scroll-mt-28 bg-white p-8 md:p-10 rounded-sm border border-hairline/40 shadow-[0_2px_12px_rgba(28,26,24,0.03)] flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-hairline pb-4">
                <span className="font-mono text-xs font-semibold text-[#b5573a] uppercase tracking-widest bg-[#b5573a]/10 px-2 py-0.5 rounded-sm">02</span>
                <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light">
                  {isVi ? "Chính sách Đổi và Trả hàng" : "Returns & Exchange Policy"}
                </h2>
              </div>

              <p className="text-sm text-[#55423d]/85 leading-relaxed font-light">
                {isVi
                  ? "Nhằm đảm bảo trải nghiệm mua sắm hoàn hảo nhất, Vela Wear áp dụng chính sách đổi trả linh hoạt trong vòng 30 ngày kể từ ngày bạn nhận được sản phẩm."
                  : "To ensure your total peace of mind, Vela Wear offers a seamless 30-day return and exchange policy from the delivery date."}
              </p>

              {/* 3 Step Process Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2">
                <div className="flex gap-4 items-start p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30">
                  <div className="size-8 rounded-full bg-[#b5573a] text-white font-mono font-semibold text-sm grid place-items-center shrink-0">1</div>
                  <div>
                    <h5 className="font-serif text-base text-[#1c1a18] font-medium mb-1">{isVi ? "Gửi Yêu Cầu" : "Request Return"}</h5>
                    <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                      {isVi ? "Liên hệ Concierge hoặc bấm Đổi/Trả trong mục Quản lý đơn hàng." : "Contact Concierge or click Return on your account dashboard."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30">
                  <div className="size-8 rounded-full bg-[#b5573a] text-white font-mono font-semibold text-sm grid place-items-center shrink-0">2</div>
                  <div>
                    <h5 className="font-serif text-base text-[#1c1a18] font-medium mb-1">{isVi ? "Thu Hồi Tận Nơi" : "Courier Pickup"}</h5>
                    <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                      {isVi ? "Nhân viên vận chuyển tới tận nhà nhận lại gói hàng miễn phí." : "Our courier collects the parcel directly from your address free."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30">
                  <div className="size-8 rounded-full bg-[#b5573a] text-white font-mono font-semibold text-sm grid place-items-center shrink-0">3</div>
                  <div>
                    <h5 className="font-serif text-base text-[#1c1a18] font-medium mb-1">{isVi ? "Đổi Sản Phẩm / Hoàn Tiền" : "Exchange / Refund"}</h5>
                    <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                      {isVi ? "Nhận ngay món đồ mới đổi hoặc tiền hoàn về tài khoản trong 24h." : "Receive your exchange or bank refund credited within 24–48 hours."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditions Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-hairline/30 pt-6">
                <div>
                  <h4 className="font-serif text-base font-medium text-[#1c1a18] mb-3 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[#b5573a]" />
                    {isVi ? "Điều kiện áp dụng đổi trả:" : "Eligible return conditions:"}
                  </h4>
                  <ul className="text-xs text-[#55423d]/80 space-y-2 font-light pl-6 list-disc">
                    <li>{isVi ? "Sản phẩm còn giữ nguyên tem mác thương hiệu gốc." : "Garment retains all original brand tags intact."}</li>
                    <li>{isVi ? "Chưa qua giặt tẩy, chưa qua bẩn hay hư hỏng do tác động ngoài." : "Unworn, unwashed, and without perfume/stains."}</li>
                    <li>{isVi ? "Còn đầy đủ bao bì hộp đựng và túi bọc kèm theo." : "Returned with original packaging box & garment bag."}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif text-base font-medium text-[#1c1a18] mb-3 flex items-center gap-2">
                    <RotateCcw className="size-4 text-[#b5573a]" />
                    {isVi ? "Hình thức hoàn tiền:" : "Refund methods:"}
                  </h4>
                  <ul className="text-xs text-[#55423d]/80 space-y-2 font-light pl-6 list-disc">
                    <li>{isVi ? "Chuyển khoản trực tiếp về tài khoản ngân hàng của bạn." : "Direct bank transfer within 24 hours of inspection."}</li>
                    <li>{isVi ? "Hoàn về Thẻ tín dụng/Thẻ ghi nợ (tùy theo ngân hàng phát hành)." : "Reversed to your Credit / Debit card issuer."}</li>
                    <li>{isVi ? "Mã Gift Card mua sắm trực tuyến (có giá trị sử dụng vô thời hạn)." : "Store credit voucher with no expiration date."}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Size & Fit */}
            <section id="size" className="scroll-mt-28 bg-white p-8 md:p-10 rounded-sm border border-hairline/40 shadow-[0_2px_12px_rgba(28,26,24,0.03)] flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-hairline pb-4">
                <span className="font-mono text-xs font-semibold text-[#b5573a] uppercase tracking-widest bg-[#b5573a]/10 px-2 py-0.5 rounded-sm">03</span>
                <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light">
                  {isVi ? "Kích cỡ & Phom dáng" : "Size & Fit Guide"}
                </h2>
              </div>

              <p className="text-sm text-[#55423d]/85 leading-relaxed font-light">
                {isVi
                  ? "Trang phục Vela Wear được thiết kế theo tỷ lệ phom dáng chuẩn quốc tế, tinh chỉnh để vừa vặn với vóc dáng người Á Đông."
                  : "Vela Wear silhouettes are tailored to international proportions, refined specifically for elegant comfortable fits."}
              </p>

              {/* Fit Profiles Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30">
                  <h4 className="font-serif text-base font-medium text-[#1c1a18] mb-1">Tailored Fit</h4>
                  <p className="text-xs text-[#b5573a] font-mono mb-2">{isVi ? "Phom may đo ôm nhẹ" : "Slightly tailored"}</p>
                  <p className="text-xs text-[#55423d]/80 font-light leading-relaxed">
                    {isVi
                      ? "Thiết kế ôm nhẹ theo đường nét cơ thể, mang lại vẻ sang trọng chỉn chu thích hợp sự kiện & công sở."
                      : "Contoured slightly to natural body lines for structured elegance suitable for formal occasions."}
                  </p>
                </div>

                <div className="p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30">
                  <h4 className="font-serif text-base font-medium text-[#1c1a18] mb-1">Relaxed Fit</h4>
                  <p className="text-xs text-[#b5573a] font-mono mb-2">{isVi ? "Phom rộng thoải mái" : "Naturally relaxed"}</p>
                  <p className="text-xs text-[#55423d]/80 font-light leading-relaxed">
                    {isVi
                      ? "Khoảng cử động rộng rãi vừa phải, tạo cảm giác nhẹ nhàng tự nhiên khi mặc hàng ngày."
                      : "Generous movement allowance for breathable, effortless everyday comfort."}
                  </p>
                </div>

                <div className="p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30">
                  <h4 className="font-serif text-base font-medium text-[#1c1a18] mb-1">Oversized Fit</h4>
                  <p className="text-xs text-[#b5573a] font-mono mb-2">{isVi ? "Phom rộng thời thượng" : "Modern oversized"}</p>
                  <p className="text-xs text-[#55423d]/80 font-light leading-relaxed">
                    {isVi
                      ? "Phom áo quần rộng rãi phóng khoáng, vai trễ và độ rủ tạo điểm nhấn thời trang hiện đại."
                      : "Dropped shoulders and generous drape creating a contemporary fashion silhouette."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#f9f7f4] p-6 rounded-sm border border-hairline/30">
                <div>
                  <h4 className="font-serif text-lg font-medium text-[#1c1a18] mb-1">
                    {isVi ? "Xem bảng số đo chi tiết từng dòng sản phẩm" : "View complete garment size chart"}
                  </h4>
                  <p className="text-xs text-[#55423d]/80 font-light">
                    {isVi ? "Bao gồm số đo Vòng 1, Vòng 2, Vòng 3 & chiều dài áo/quần." : "Includes bust, waist, hips, and garment length specifications."}
                  </p>
                </div>
                <Link
                  href="/size-guide"
                  className="inline-flex items-center gap-2 bg-[#b5573a] text-white px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#8f4329] transition-colors shrink-0"
                >
                  <span>{isVi ? "Bảng chọn size" : "Size Guide"}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </section>

            {/* Section 5: Product Care */}
            <section id="care" className="scroll-mt-28 bg-white p-8 md:p-10 rounded-sm border border-hairline/40 shadow-[0_2px_12px_rgba(28,26,24,0.03)] flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-hairline pb-4">
                <span className="font-mono text-xs font-semibold text-[#b5573a] uppercase tracking-widest bg-[#b5573a]/10 px-2 py-0.5 rounded-sm">04</span>
                <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light">
                  {isVi ? "Bảo quản sản phẩm & Chất liệu" : "Product & Fabric Care"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#b5573a] font-serif text-base font-medium">
                    <Sparkles className="size-4" />
                    <span>Linen Blend (Vải Đũi Cao Cấp)</span>
                  </div>
                  <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                    {isVi
                      ? "Giặt tay hoặc giặt máy chế độ nhẹ (nhiệt độ <30°C). Nên giặt cùng túi giặt chuyên dụng, phơi nơi thoáng mát tránh ánh nắng gắt. Ủi ở nhiệt độ trung bình khi vải còn ẩm nhẹ để giữ phom đẹp nhất."
                      : "Handwash or machine wash on a delicate cycle (<30°C). Line dry in the shade and iron while damp on medium heat."}
                  </p>
                </div>

                <div className="p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#b5573a] font-serif text-base font-medium">
                    <Sparkles className="size-4" />
                    <span>Lụa & Satin (Silk & Satin)</span>
                  </div>
                  <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                    {isVi
                      ? "Khuyến khích giặt khô chuyên nghiệp. Nếu giặt tay, hãy sử dụng nước mát và dầu gội dịu nhẹ. Không vắt mạnh, phơi phẳng nơi râm mát và ủi hơi nước ở mặt trái sản phẩm."
                      : "Professional dry cleaning recommended. For gentle handwash, use cold water with mild shampoo. Do not wring; steam iron inside out."}
                  </p>
                </div>

                <div className="p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#b5573a] font-serif text-base font-medium">
                    <Sparkles className="size-4" />
                    <span>Dệt Kim & Len (Knitwear & Wool)</span>
                  </div>
                  <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                    {isVi
                      ? "Giặt khô hoặc giặt nhẹ bằng nước mát với xà phòng chuyên dụng cho len. Phơi nằm ngang trên mặt phẳng để tránh bị chảy xệ dãn dài. Bảo quản bằng cách gấp gọn trong tủ, không treo móc."
                      : "Dry clean or handwash gently with wool detergent. Dry flat horizontally to prevent stretching; store folded, never hung."}
                  </p>
                </div>

                <div className="p-6 rounded-sm bg-[#f9f7f4] border border-hairline/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#b5573a] font-serif text-base font-medium">
                    <Sparkles className="size-4" />
                    <span>Cotton & Blazer May Đo (Tailored Outerwear)</span>
                  </div>
                  <p className="text-xs text-[#55423d]/80 leading-relaxed font-light">
                    {isVi
                      ? "Blazer và Áo khoác dạ may đo nên giặt khô định kỳ để bảo vệ phom dựng vai. Giặt lộn trái đối với các dòng áo thun Cotton để giữ độ bền màu vải tốt nhất."
                      : "Tailored blazers should be dry-cleaned to protect internal shoulder canvasing. Turn cotton tees inside out before washing."}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Contact Us & Concierge */}
            <section id="contact" className="scroll-mt-28 bg-white p-8 md:p-10 rounded-sm border border-hairline/40 shadow-[0_2px_12px_rgba(28,26,24,0.03)] flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-hairline pb-4">
                <span className="font-mono text-xs font-semibold text-[#b5573a] uppercase tracking-widest bg-[#b5573a]/10 px-2 py-0.5 rounded-sm">05</span>
                <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light">
                  {isVi ? "Liên hệ & Dịch vụ Concierge" : "Contact & Concierge Services"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#f9f7f4] p-6 rounded-sm border border-hairline/30 flex flex-col items-start gap-3">
                  <div className="size-10 rounded-sm bg-[#b5573a]/10 text-[#b5573a] grid place-items-center">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-[#1c1a18] mb-1">{isVi ? "Hotline Concierge" : "Concierge Hotline"}</h4>
                    <p className="text-xs text-[#55423d]/75 font-light mb-2">{isVi ? "Phục vụ 8:30 – 22:00 hàng ngày" : "Daily 8:30 – 22:00"}</p>
                    <a href="tel:19006886" className="text-sm font-semibold text-[#b5573a] hover:underline">
                      1900 6886
                    </a>
                  </div>
                </div>

                <div className="bg-[#f9f7f4] p-6 rounded-sm border border-hairline/30 flex flex-col items-start gap-3">
                  <div className="size-10 rounded-sm bg-[#b5573a]/10 text-[#b5573a] grid place-items-center">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-[#1c1a18] mb-1">{isVi ? "Email Hỗ Trợ" : "Email Support"}</h4>
                    <p className="text-xs text-[#55423d]/75 font-light mb-2">{isVi ? "Phản hồi trong 2 giờ làm việc" : "Response within 2 hours"}</p>
                    <a href="mailto:concierge@velawear.com" className="text-sm font-semibold text-[#b5573a] hover:underline">
                      concierge@velawear.com
                    </a>
                  </div>
                </div>

                <div className="bg-[#f9f7f4] p-6 rounded-sm border border-hairline/30 flex flex-col items-start gap-3">
                  <div className="size-10 rounded-sm bg-[#b5573a]/10 text-[#b5573a] grid place-items-center">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-[#1c1a18] mb-1">{isVi ? "Zalo Official Account" : "Zalo Official"}</h4>
                    <p className="text-xs text-[#55423d]/75 font-light mb-2">{isVi ? "Chat trực tiếp với Stylist" : "Chat with a dedicated Stylist"}</p>
                    <span className="text-sm font-semibold text-[#1c1a18]">Vela Wear Official</span>
                  </div>
                </div>
              </div>

              {/* Flagship Store Locations */}
              <div className="border-t border-hairline/30 pt-6">
                <h4 className="font-serif text-lg font-medium text-[#1c1a18] mb-4 flex items-center gap-2">
                  <MapPin className="size-4 text-[#b5573a]" />
                  <span>{isVi ? "Hệ thống Cửa Hàng Flagship Store" : "Flagship Stores"}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-sm bg-[#f9f7f4] border border-hairline/30 text-xs">
                    <p className="font-semibold text-[#1c1a18] mb-1">Flagship Store Hà Nội</p>
                    <p className="text-[#55423d]/80 font-light">18 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội</p>
                    <p className="text-[#55423d]/60 font-light mt-1">Giờ mở cửa: 9:00 – 21:30</p>
                  </div>
                  <div className="p-5 rounded-sm bg-[#f9f7f4] border border-hairline/30 text-xs">
                    <p className="font-semibold text-[#1c1a18] mb-1">Flagship Store TP. Hồ Chí Minh</p>
                    <p className="text-[#55423d]/80 font-light">122 Đồng Khởi, Quận 1, TP. Hồ Chí Minh</p>
                    <p className="text-[#55423d]/60 font-light mt-1">Giờ mở cửa: 9:00 – 21:30</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: FAQ Accordion Section with Motion Animation & Active Highlighting */}
            <section id="faq" className="scroll-mt-28 bg-white p-8 md:p-10 rounded-sm border border-hairline/40 shadow-[0_2px_12px_rgba(28,26,24,0.03)] flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-hairline pb-4">
                <span className="font-mono text-xs font-semibold text-[#b5573a] uppercase tracking-widest bg-[#b5573a]/10 px-2 py-0.5 rounded-sm">06</span>
                <div className="flex items-center gap-2">
                  <HelpCircle className="size-5 text-[#b5573a]" />
                  <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light">
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
                        "flex flex-col rounded-sm border transition-all duration-300 overflow-hidden",
                        isOpen
                          ? "border-[#b5573a]/30 bg-[#f9f7f4] shadow-sm"
                          : "border-hairline/40 bg-white hover:border-[#b5573a]/20"
                      )}
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        aria-expanded={isOpen}
                        className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none group"
                      >
                        <span
                          className={cn(
                            "font-sans text-sm md:text-base font-medium transition-colors",
                            isOpen ? "text-[#b5573a] font-semibold" : "text-[#1c1a18] group-hover:text-[#b5573a]"
                          )}
                        >
                          {faq.question}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className={cn(
                            "ml-4 shrink-0 transition-colors",
                            isOpen ? "text-[#b5573a]" : "text-[#55423d]/60 group-hover:text-[#b5573a]"
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
                            <div className="px-6 pb-6 pt-1 border-t border-[#b5573a]/10">
                              <p className="font-sans text-xs md:text-sm text-[#55423d]/85 leading-relaxed font-light">
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
                  <p className="text-center text-[#55423d]/60 py-8 text-sm italic">
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
