"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Quote, Plus, X, Award, Check } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

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
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    name: "Khánh Linh",
    location: "Hà Nội",
    rating: 5,
    productBought: "Merino Wool Coat",
    quote: "Chiếc áo khoác mang lại cảm giác cực kỳ ấm áp và sang trọng. Chất len merino mềm mướt không tì vết, phom dáng rủ tự nhiên chuẩn phong cách rủ tinh tế. Đây thực sự là khoản đầu tư xứng đáng cho tủ đồ mùa đông.",
    date: "15/06/2026",
    initial: "KL",
    category: "outerwear",
  },
  {
    id: "rev-2",
    name: "Minh Trí",
    location: "TP. Hồ Chí Minh",
    rating: 5,
    productBought: "Classic Linen Shirt",
    quote: "Chất liệu linen dệt mộc cực thoáng, đường may giấu chỉ vô cùng tinh tế và chỉ chu. Áo giặt vài lần vẫn giữ phom rủ rất đẹp. Tôi đặc biệt yêu mến gam màu đất nung ấm áp của Vela.",
    date: "28/05/2026",
    initial: "MT",
    category: "essentials",
  },
  {
    id: "rev-3",
    name: "Thanh Nhàn",
    location: "Đà Nẵng",
    rating: 5,
    productBought: "The Heritage Tote",
    quote: "Chiếc túi tote da thật cực kỳ dày dặn, da mềm mại tự nhiên và mùi hương mộc mạc tinh tế. Kích thước vừa vặn cho máy tính và tài liệu, quai xách chắc chắn vô cùng thanh thoát.",
    date: "02/06/2026",
    initial: "TN",
    category: "accessories",
  },
  {
    id: "rev-4",
    name: "Hoàng Lâm",
    location: "Hải Phòng",
    rating: 5,
    productBought: "Pleated Wool Trousers",
    quote: "Quần tây ly xếp phom đứng tuyệt đẹp. Từng nếp gấp ly được ép tỉ mỉ và đứng dáng cực kỳ tôn dáng. Chất vải pha len nhẹ mặc rất dễ chịu, thích hợp cho cả công sở lẫn dạo phố cuối tuần.",
    date: "10/06/2026",
    initial: "HL",
    category: "essentials",
  },
  {
    id: "rev-5",
    name: "Amara Osei",
    location: "Gallery Director",
    rating: 5,
    productBought: "Minimalist Silk Dress",
    quote: "Vela Wear totally transformed our gallery space. It didn't look like clothes; it looked like living art. Pure design intelligence in every single thread.",
    date: "14/05/2026",
    initial: "A",
    category: "outerwear",
  },
  {
    id: "rev-6",
    name: "Markus Vance",
    location: "Product Lead, Arch",
    rating: 5,
    productBought: "Artisan Wool Blazer",
    quote: "Their structural approach to garments is unparalleled. Not just an outfit, an architectural statement. The silhouette flows seamlessly with your movements.",
    date: "22/04/2026",
    initial: "M",
    category: "outerwear",
  },
  {
    id: "rev-7",
    name: "Elena Rostova",
    location: "Tech Curator",
    rating: 5,
    productBought: "Relaxed Silk Trousers",
    quote: "Elegant, fluid, and brilliantly executed. It stands out by whispering instead of shouting. A profound paradigm shift in modern essential wear.",
    date: "09/05/2026",
    initial: "E",
    category: "essentials",
  },
  {
    id: "rev-8",
    name: "Julian Thorne",
    location: "Founder, Synthetix",
    rating: 5,
    productBought: "Draped Linen Jacket",
    quote: "I've never experienced a tailoring so deeply attuned to natural workflows. It responds with quiet intelligence. Simple, refined, absolute comfort.",
    date: "30/04/2026",
    initial: "J",
    category: "accessories",
  }
];

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [filter, setFilter] = useState<"all" | "essentials" | "outerwear" | "accessories">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("Hà Nội");
  const [formRating, setFormRating] = useState(5);
  const [formProduct, setFormProduct] = useState("Classic Linen Shirt");
  const [formCategory, setFormCategory] = useState<"essentials" | "outerwear" | "accessories">("essentials");
  const [formQuote, setFormQuote] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredReviews = reviews.filter(
    (rev) => filter === "all" || rev.category === filter
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
      id: `rev-${Date.now()}`,
      name: formName,
      location: formLocation,
      rating: formRating,
      productBought: formProduct,
      quote: formQuote,
      date: new Date().toLocaleDateString("vi-VN"),
      initial: getInitials(formName),
      category: formCategory,
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
    <section id="testimonials" className="py-24 md:py-32 bg-[#efe7dc]/30 border-t border-[#e3dccf]/60 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e3dccf_1px,transparent_1px),linear-gradient(to_bottom,#e3dccf_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <ScrollReveal direction="right" className="max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[2px] text-[#b5573a] block mb-3">
              Ý kiến khách hàng
            </span>
            <h2 className="font-serif text-3.5xl md:text-5xl font-light tracking-tight text-[#1c1a18]">
              Cảm hứng & Sự chia sẻ
            </h2>
            <p className="text-[#8a857c] text-sm md:text-base mt-4 font-light leading-relaxed">
              Những lời chia sẻ chân thực về sự tương tác, phom dáng rủ tự nhiên và kết cấu thớ vải tinh mỹ từ giới mộ điệu sở hữu Vela Wear.
            </p>
          </ScrollReveal>

          {/* Write a Review Button */}
          <ScrollReveal direction="left" delay={0.2} className="flex-none">
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1c1a18] hover:bg-[#b5573a] text-white text-xs font-semibold uppercase tracking-[1.5px] px-6 py-4 rounded-[6px] transition-all duration-300 shadow-md cursor-pointer flex items-center gap-2 border border-transparent"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Viết đánh giá
            </motion.button>
          </ScrollReveal>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 mb-16 md:mb-20 border-b border-[#e3dccf]/60 pb-6">
          {(["all", "essentials", "outerwear", "accessories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-full text-xs font-medium uppercase tracking-[1.5px] transition-all cursor-pointer ${
                filter === tab
                  ? "bg-[#b5573a] text-white shadow-sm"
                  : "bg-[#efe7dc]/50 hover:bg-[#efe7dc] text-[#1c1a18]"
              }`}
            >
              {tab === "all" ? "Tất cả" : tab}
            </button>
          ))}
        </div>

        {/* Masonry Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[col1, col2, col3].map((columnReviews, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-6 md:gap-8">
              {columnReviews.map((rev) => (
                <ScrollReveal
                  key={rev.id}
                  direction="up"
                  delay={colIdx * 0.1}
                  className="bg-[#efe7dc]/60 hover:bg-[#efe7dc]/90 p-8 rounded-[20px] shadow-sm border border-[#e3dccf]/30 flex flex-col gap-6 relative transition-all duration-300 hover:shadow-md"
                >
                  <Quote className="absolute right-6 top-6 w-10 h-10 text-[#b5573a]/10 pointer-events-none" />

                  {/* Rating Stars */}
                  <div className="flex gap-1 text-[#b5573a]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="text-sm leading-relaxed text-[#3d3a36] font-light italic">
                    &ldquo;{rev.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3.5 pt-2 border-t border-[#e3dccf]/50 mt-auto">
                    {/* Initial Badge */}
                    <div className="w-10 h-10 rounded-full bg-[#b5573a]/15 text-[#b5573a] font-serif text-sm font-semibold flex items-center justify-center flex-none">
                      {rev.initial}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-serif text-base font-semibold text-[#1c1a18] leading-none">
                        {rev.name}
                      </h4>
                      <p className="text-[10px] text-[#8a857c] uppercase tracking-[1px] mt-1 leading-none">
                        {rev.location} &bull; Bought: <span className="text-[#b5573a]/80 font-medium">{rev.productBought}</span>
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
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-[#f7f4ef] rounded-[24px] border border-[#e3dccf] shadow-2xl p-8 z-50 flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#e3dccf]">
                <h3 className="font-serif text-2xl text-[#1c1a18] font-medium">Chia sẻ cảm nhận của bạn</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-[#1c1a18] hover:text-[#b5573a] hover:bg-black/5 transition-all cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#5d8a6c]/10 flex items-center justify-center text-[#5d8a6c]">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-xl font-medium text-[#1c1a18]">Cám ơn đóng góp của bạn</h4>
                  <p className="text-xs text-[#8a857c] max-w-xs leading-relaxed">
                    Ý kiến của bạn đã được xuất bản và chia sẻ trực tiếp trên Vela Archives.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8a857c]">Tên của bạn *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nhập tên..."
                        className="bg-[#efe7dc]/50 border border-[#e3dccf] rounded-[8px] px-3.5 py-2.5 text-xs text-[#1c1a18] placeholder-[#8a857c]/50 focus:outline-none focus:border-[#b5573a]/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8a857c]">Tỉnh/Thành phố *</label>
                      <input
                        type="text"
                        required
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="Ví dụ: Hà Nội"
                        className="bg-[#efe7dc]/50 border border-[#e3dccf] rounded-[8px] px-3.5 py-2.5 text-xs text-[#1c1a18] placeholder-[#8a857c]/50 focus:outline-none focus:border-[#b5573a]/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8a857c]">Sản phẩm đã mua</label>
                      <select
                        value={formProduct}
                        onChange={(e) => setFormProduct(e.target.value)}
                        className="bg-[#efe7dc]/50 border border-[#e3dccf] rounded-[8px] px-3 py-2.5 text-xs text-[#1c1a18] focus:outline-none focus:border-[#b5573a]/50"
                      >
                        <option value="Classic Linen Shirt">Classic Linen Shirt</option>
                        <option value="Pleated Wool Trousers">Pleated Wool Trousers</option>
                        <option value="The Heritage Tote">The Heritage Tote</option>
                        <option value="Merino Wool Coat">Merino Wool Coat</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8a857c]">Phân loại</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="bg-[#efe7dc]/50 border border-[#e3dccf] rounded-[8px] px-3 py-2.5 text-xs text-[#1c1a18] focus:outline-none focus:border-[#b5573a]/50"
                      >
                        <option value="essentials">Essentials</option>
                        <option value="outerwear">Outerwear</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8a857c]">Đánh giá chất lượng (Số sao)</label>
                    <div className="flex gap-2 text-[#b5573a]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${star <= formRating ? "fill-current" : "text-[#e3dccf]"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8a857c]">Lời chứng nhận / Đánh giá của bạn *</label>
                    <textarea
                      required
                      value={formQuote}
                      onChange={(e) => setFormQuote(e.target.value)}
                      placeholder="Lời chứng thực của bạn..."
                      rows={4}
                      className="bg-[#efe7dc]/50 border border-[#e3dccf] rounded-[8px] px-3.5 py-2.5 text-xs text-[#1c1a18] placeholder-[#8a857c]/50 focus:outline-none focus:border-[#b5573a]/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full bg-[#1c1a18] hover:bg-[#b5573a] text-white text-xs font-semibold uppercase tracking-[1.5px] py-4 rounded-[8px] transition-colors duration-300 shadow-md cursor-pointer"
                  >
                    Gửi ý kiến
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
