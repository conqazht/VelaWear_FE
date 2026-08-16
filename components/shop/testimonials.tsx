"use client";

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Star, Quote, Plus, Check } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { useI18n } from "@/components/providers/i18n-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Locale } from "@/lib/i18n";
import { getLocalizedFixtureProducts } from "@/lib/i18n/fixture-catalog";
import { formatDate } from "@/lib/i18n/format";

const REVIEW_PRODUCT_IDS = new Set([
  "classic-linen-shirt",
  "pleated-wool-trousers",
  "the-heritage-tote",
  "merino-wool-coat",
]);

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  productBought: string;
  quote: string;
  date: string;
  initial: string;
  category: "essentials" | "outerwear" | "accessories";
  locale: Locale;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    name: "Khánh Linh",
    location: "Hà Nội",
    rating: 5,
    productBought: "Áo khoác len merino",
    quote:
      "Chiếc áo khoác mang lại cảm giác cực kỳ ấm áp và sang trọng. Chất len merino mềm mướt không tì vết, phom dáng rủ tự nhiên chuẩn phong cách rủ tinh tế. Đây thực sự là khoản đầu tư xứng đáng cho tủ đồ mùa đông.",
    date: "2026-06-15",
    initial: "KL",
    category: "outerwear",
    locale: "vi",
  },
  {
    id: "rev-2",
    name: "Minh Trí",
    location: "TP. Hồ Chí Minh",
    rating: 5,
    productBought: "Áo sơ mi linen cổ điển",
    quote:
      "Chất liệu linen dệt mộc cực thoáng, đường may giấu chỉ vô cùng tinh tế và chỉ chu. Áo giặt vài lần vẫn giữ phom rủ rất đẹp. Tôi đặc biệt yêu mến gam màu đất nung ấm áp của Vela.",
    date: "2026-05-28",
    initial: "MT",
    category: "essentials",
    locale: "vi",
  },
  {
    id: "rev-3",
    name: "Thanh Nhàn",
    location: "Đà Nẵng",
    rating: 5,
    productBought: "Túi tote di sản",
    quote:
      "Chiếc túi tote da thật cực kỳ dày dặn, da mềm mại tự nhiên và mùi hương mộc mạc tinh tế. Kích thước vừa vặn cho máy tính và tài liệu, quai xách chắc chắn vô cùng thanh thoát.",
    date: "2026-06-02",
    initial: "TN",
    category: "accessories",
    locale: "vi",
  },
  {
    id: "rev-4",
    name: "Hoàng Lâm",
    location: "Hải Phòng",
    rating: 5,
    productBought: "Quần len xếp ly",
    quote:
      "Quần tây ly xếp phom đứng tuyệt đẹp. Từng nếp gấp ly được ép tỉ mỉ và đứng dáng cực kỳ tôn dáng. Chất vải pha len nhẹ mặc rất dễ chịu, thích hợp cho cả công sở lẫn dạo phố cuối tuần.",
    date: "2026-06-10",
    initial: "HL",
    category: "essentials",
    locale: "vi",
  },
  {
    id: "rev-5",
    name: "Amara Osei",
    location: "Gallery Director",
    rating: 5,
    productBought: "Minimalist Silk Dress",
    quote:
      "Vela Wear totally transformed our gallery space. It didn't look like clothes; it looked like living art. Pure design intelligence in every single thread.",
    date: "2026-05-14",
    initial: "A",
    category: "outerwear",
    locale: "en",
  },
  {
    id: "rev-6",
    name: "Markus Vance",
    location: "Product Lead, Arch",
    rating: 5,
    productBought: "Artisan Wool Blazer",
    quote:
      "Their structural approach to garments is unparalleled. Not just an outfit, an architectural statement. The silhouette flows seamlessly with your movements.",
    date: "2026-04-22",
    initial: "M",
    category: "outerwear",
    locale: "en",
  },
  {
    id: "rev-7",
    name: "Elena Rostova",
    location: "Tech Curator",
    rating: 5,
    productBought: "Relaxed Silk Trousers",
    quote:
      "Elegant, fluid, and brilliantly executed. It stands out by whispering instead of shouting. A profound paradigm shift in modern essential wear.",
    date: "2026-05-09",
    initial: "E",
    category: "essentials",
    locale: "en",
  },
  {
    id: "rev-8",
    name: "Julian Thorne",
    location: "Founder, Synthetix",
    rating: 5,
    productBought: "Draped Linen Jacket",
    quote:
      "I've never experienced a tailoring so deeply attuned to natural workflows. It responds with quiet intelligence. Simple, refined, absolute comfort.",
    date: "2026-04-30",
    initial: "J",
    category: "accessories",
    locale: "en",
  },
];

export function Testimonials() {
  const { locale, t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [filter, setFilter] = useState<"all" | "essentials" | "outerwear" | "accessories">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("Hà Nội");
  const [formRating, setFormRating] = useState(5);
  const [formProduct, setFormProduct] = useState("classic-linen-shirt");
  const [formCategory, setFormCategory] = useState<"essentials" | "outerwear" | "accessories">(
    "essentials",
  );
  const [formQuote, setFormQuote] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const reviewProducts = getLocalizedFixtureProducts(locale).filter((product) =>
    REVIEW_PRODUCT_IDS.has(product.id),
  );

  const filteredReviews = reviews.filter(
    (rev) => rev.locale === locale && (filter === "all" || rev.category === filter),
  );

  const col1 = filteredReviews.filter((_, idx) => idx % 3 === 0);
  const col2 = filteredReviews.filter((_, idx) => idx % 3 === 1);
  const col3 = filteredReviews.filter((_, idx) => idx % 3 === 2);

  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (formName.trim() === "" || formQuote.trim() === "") return;

    const getInitials = (name: string) => {
      const words = name.trim().split(" ");
      if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const newReview: Review = {
      id: `rev-${crypto.randomUUID()}`,
      name: formName,
      location: formLocation,
      rating: formRating,
      productBought:
        reviewProducts.find((product) => product.id === formProduct)?.name ?? formProduct,
      quote: formQuote,
      date: new Date().toISOString(),
      initial: getInitials(formName),
      category: formCategory,
      locale,
    };

    setReviews([newReview, ...reviews]);
    setIsSuccess(true);

    setTimeout(() => {
      setIsModalOpen(false);
      setIsSuccess(false);
      setFormName("");
      setFormQuote("");
    }, 1500);
  };

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden border-t border-[#e3dccf]/60 bg-[#efe7dc]/30 py-24 md:py-32"
    >
      {/* Background Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e3dccf_1px,transparent_1px),linear-gradient(to_bottom,#e3dccf_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem] opacity-30" />

      <div className="relative z-10 mx-auto max-w-[1800px] px-6 md:px-16">
        {/* Header */}
        <div className="mb-16 flex flex-col justify-between gap-8 md:mb-24 md:flex-row md:items-end">
          <ScrollReveal direction="right" className="max-w-xl">
            <span className="mb-3 block text-[11px] font-semibold tracking-[2px] text-[#b5573a] uppercase">
              {t("testimonials.eyebrow")}
            </span>
            <h2 className="text-3.5xl font-serif font-light tracking-tight text-[#1c1a18] md:text-5xl">
              {t("testimonials.title")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-[#8a857c] md:text-base">
              {t("testimonials.description")}
            </p>
          </ScrollReveal>

          {/* Write a Review Button */}
          <ScrollReveal direction="left" delay={0.2} className="flex-none">
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-[6px] border border-transparent bg-[#1c1a18] px-6 py-4 text-xs font-semibold tracking-[1.5px] text-white uppercase shadow-md transition-all duration-300 hover:bg-[#b5573a]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4" />
              {t("testimonials.write")}
            </motion.button>
          </ScrollReveal>
        </div>

        {/* Filters */}
        <div className="mb-16 flex flex-wrap gap-2.5 border-b border-[#e3dccf]/60 pb-6 md:mb-20">
          {(["all", "essentials", "outerwear", "accessories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              aria-pressed={filter === tab}
              className={`cursor-pointer rounded-full px-5 py-2.5 text-xs font-medium tracking-[1.5px] uppercase transition-all ${
                filter === tab
                  ? "bg-[#b5573a] text-white shadow-sm"
                  : "bg-[#efe7dc]/50 text-[#1c1a18] hover:bg-[#efe7dc]"
              }`}
            >
              {t(`testimonials.filter.${tab}` as const)}
            </button>
          ))}
        </div>

        {/* Masonry Columns */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {[col1, col2, col3].map((columnReviews, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-6 md:gap-8">
              {columnReviews.map((rev) => (
                <ScrollReveal
                  key={rev.id}
                  direction="up"
                  delay={colIdx * 0.1}
                  className="relative flex flex-col gap-6 rounded-[20px] border border-[#e3dccf]/30 bg-[#efe7dc]/60 p-8 shadow-sm transition-all duration-300 hover:bg-[#efe7dc]/90 hover:shadow-md"
                >
                  <Quote className="pointer-events-none absolute top-6 right-6 h-10 w-10 text-[#b5573a]/10" />

                  {/* Rating Stars */}
                  <div className="flex gap-1 text-[#b5573a]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="text-sm leading-relaxed font-light text-[#3d3a36] italic">
                    &ldquo;{rev.quote}&rdquo;
                  </p>

                  <div className="mt-auto flex items-center gap-3.5 border-t border-[#e3dccf]/50 pt-2">
                    {/* Initial Badge */}
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#b5573a]/15 font-serif text-sm font-semibold text-[#b5573a]">
                      {rev.initial}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-serif text-base leading-none font-semibold text-[#1c1a18]">
                        {rev.name}
                      </h4>
                      <p className="mt-1 text-[10px] leading-none tracking-[1px] text-[#8a857c] uppercase">
                        {rev.location} &bull; {t("testimonials.bought")}:{" "}
                        <span className="font-medium text-[#b5573a]/80">{rev.productBought}</span>{" "}
                        &bull; {formatDate(rev.date, locale)}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Write Review */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-[#e3dccf] bg-[#f7f4ef] p-6 text-[#1c1a18] shadow-2xl sm:p-8">
          <DialogHeader className="border-b border-[#e3dccf] pb-4">
            <DialogTitle className="font-serif text-2xl font-medium text-[#1c1a18]">
              {t("testimonials.modal.title")}
            </DialogTitle>
          </DialogHeader>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5d8a6c]/10 text-[#5d8a6c]">
                <Check className="h-8 w-8" />
              </div>
              <h4 className="font-serif text-xl font-medium text-[#1c1a18]">
                {t("testimonials.success.title")}
              </h4>
              <p className="max-w-xs text-xs leading-relaxed text-[#8a857c]">
                {t("testimonials.success.description")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="mt-2 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-[1px] text-[#8a857c] uppercase">
                    {t("testimonials.form.name")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t("testimonials.form.namePlaceholder")}
                    className="rounded-sm border border-[#e3dccf] bg-[#efe7dc]/50 px-3.5 py-2.5 text-xs text-[#1c1a18] placeholder-[#8a857c]/50 focus:border-[#b5573a]/50 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-[1px] text-[#8a857c] uppercase">
                    {t("testimonials.form.location")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder={t("testimonials.form.locationPlaceholder")}
                    className="rounded-sm border border-[#e3dccf] bg-[#efe7dc]/50 px-3.5 py-2.5 text-xs text-[#1c1a18] placeholder-[#8a857c]/50 focus:border-[#b5573a]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-[1px] text-[#8a857c] uppercase">
                    {t("testimonials.form.product")}
                  </label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="rounded-sm border border-[#e3dccf] bg-[#efe7dc]/50 px-3 py-2.5 text-xs text-[#1c1a18] focus:border-[#b5573a]/50 focus:outline-none"
                  >
                    {reviewProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-[1px] text-[#8a857c] uppercase">
                    {t("testimonials.form.category")}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as "essentials" | "outerwear" | "accessories")
                    }
                    className="rounded-sm border border-[#e3dccf] bg-[#efe7dc]/50 px-3 py-2.5 text-xs text-[#1c1a18] focus:border-[#b5573a]/50 focus:outline-none"
                  >
                    <option value="essentials">{t("testimonials.filter.essentials")}</option>
                    <option value="outerwear">{t("testimonials.filter.outerwear")}</option>
                    <option value="accessories">{t("testimonials.filter.accessories")}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold tracking-[1px] text-[#8a857c] uppercase">
                  {t("testimonials.form.rating")}
                </label>
                <div className="flex gap-2 text-[#b5573a]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      aria-label={t("testimonials.form.star", { count: star })}
                      className="cursor-pointer p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${star <= formRating ? "fill-current" : "text-[#e3dccf]"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold tracking-[1px] text-[#8a857c] uppercase">
                  {t("testimonials.form.review")}
                </label>
                <textarea
                  required
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  placeholder={t("testimonials.form.reviewPlaceholder")}
                  rows={4}
                  className="resize-none rounded-sm border border-[#e3dccf] bg-[#efe7dc]/50 px-3.5 py-2.5 text-xs text-[#1c1a18] placeholder-[#8a857c]/50 focus:border-[#b5573a]/50 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full cursor-pointer rounded-sm bg-[#1c1a18] py-3.5 text-xs font-semibold tracking-[1.5px] text-white uppercase shadow-md transition-colors duration-300 hover:bg-[#b5573a]"
              >
                {t("testimonials.form.submit")}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
