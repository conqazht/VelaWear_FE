"use client";

import { Sparkles, Leaf, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { PRODUCTS, mapBackendProduct } from "@/lib/vela-data";
import { getActiveLocale } from "@/lib/i18n";
import { useProductsQuery, useCategoriesQuery } from "@/lib/queries/catalog";

// Import new modular subcomponents
import { HeroSlider } from "./hero-slider";
import { FeaturedCategories } from "./featured-categories";
import { StorySection } from "./story-section";
import { EditorialCraft } from "./editorial-craft";
import { HorizontalSlider } from "./horizontal-slider";
import { Testimonials } from "./testimonials";
import { Newsletter } from "./newsletter";
import { ScrollReveal } from "./scroll-reveal";

const HERO_SLIDES = [
  {
    id: "slide-1",
    title: "Vela Wear — Bộ sưu tập Thu 2026",
    subtitle: "Mùa Thu 2026",
    image: "/landingpage1.png",
    ctaText: "Khám phá ngay",
  },
  {
    id: "slide-2",
    title: "Nét Đẹp Của Sự Tĩnh Lặng",
    subtitle: "Lookbook 2026",
    image: "/landingpage2.jpg",
    ctaText: "Xem Lookbook",
  },
];

const STATIC_CATEGORIES = [
  {
    id: "cat-1",
    name: "Essentials",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBB01iD0ZUAAbXEfBxGwf6S_tVo9lhi8Sz-9Bqgt3w7eHWeLzxcQtFE8j1hypM92Hh87JXPBZ7iRaIfzRGf0jcLZcybovsZochcNkAlY7HAXlGCDru3V3RzmnIPgmVqLbRBuMy8jWHj0t-SU9s_IlGrfTjt3-XJUcW5HSPgMAoXCWJB0X_8io6wtuVZ-TVQietcTPsIO0tn7S5Pbjv_Izf0xCID5DhIQoy7JxSgks5H_3ZA-PwUi3BSWgxbspE5oOAhi4ra3-No9FKa",
    link: "/collection",
  },
  {
    id: "cat-2",
    name: "Accessories",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLGMe7fSol3cLxyNZeWO1_aSBSqo2xD7aktKUxgF3gx43in9HtB7MqVYyDZwQTbNNYlSJIubLUEWzwA1Q8jTYKYmkfsLyO60rtQVaxykhg6z3whbLFXQF7M6GRLQs1DLWvfyf23hvG2bVcPHsTHzOO8DdtQJo1YhIDfUXV8uo1qsMo2eP8Y40rlr-3f8g2l2momMxfNI3YNrunps0Dz6tTQ0_eDfY-aSHBt3bhC2n2To-wQXXBLREk8o5fQenXi1PKtBdMdSPXE8E9",
    link: "/collection",
  },
  {
    id: "cat-3",
    name: "Outerwear",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3rdhdd2Is5yjK5nAVVfW6P2sBr2eFbIuyGPXLzEMmaaz6S048ueY6FpMEhTXDQ70RHHoicQkL8NH1GrGzWkFHgtJ9AZY0aQHNRuQigIU9TZZSReu_xPV2W9m1jyi0ZDIFVUqm10oAVd9EW7Alu_gKcYdm8ZYDEkWqM2BRPBkIOA-Nb0PQlIzJj-OeG8i8Jlv6_nDIuYrw1eSjwgjtRvkjlxlOxMtc3rdT9__yYdd3YpOJXLlEPuMNJbUU88td1TYmIABgQLcnDhg4",
    link: "/collection",
  },
];

export function HomePage() {
  const activeLocale = getActiveLocale();
  
  // Fetch newest products for trending
  const productsQuery = useProductsQuery({ size: 10, sort: "createdAt,desc", locale: activeLocale });
  const categoriesQuery = useCategoriesQuery({ size: 10, sort: "sortOrder,asc", locale: activeLocale });

  const trendingProducts = useMemo(() => {
    if (productsQuery.data?.result && productsQuery.data.result.length > 0) {
      return productsQuery.data.result.map((product) => mapBackendProduct(product, activeLocale));
    }
    // Fallback to static if backend fails or empty
    const trendingProductIds = ["classic-linen-shirt", "pleated-wool-trousers", "the-heritage-tote", "merino-wool-coat"];
    return trendingProductIds
      .map(id => PRODUCTS.find(p => p.id === id))
      .filter((p): p is typeof PRODUCTS[number] => !!p);
  }, [productsQuery.data, activeLocale]);

  const featuredCategories = useMemo(() => {
    if (categoriesQuery.data?.result && categoriesQuery.data.result.length > 0) {
      return categoriesQuery.data.result.slice(0, 3).map((cat, index) => ({
        id: `cat-${cat.id}`,
        name: cat.name,
        image: STATIC_CATEGORIES[index % STATIC_CATEGORIES.length].image, // keep premium static images
        link: `/collection`,
      }));
    }
    return STATIC_CATEGORIES;
  }, [categoriesQuery.data]);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1c1a18] flex flex-col selection:bg-[#b5573a] selection:text-white">
      <main className="flex-1">
        {/* 1. Hero Slider Banner */}
        <HeroSlider slides={HERO_SLIDES} />

        {/* 2. Featured Categories Section */}
        <section id="categories" className="max-w-[1800px] mx-auto px-6 md:px-16 py-20 md:py-28">
          <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <ScrollReveal direction="right" className="max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[2px] text-[#b5573a] block mb-3">
                Danh mục nổi bật
              </span>
              <h2 className="font-serif text-3.5xl md:text-5xl font-light tracking-tight">
                Bộ sưu tập đặc tuyển
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2}>
              <Link
                href="/collection"
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1px] text-[#1c1a18] hover:text-[#b5573a] transition-colors"
              >
                Xem toàn bộ danh mục
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </ScrollReveal>
          </div>

          <FeaturedCategories categories={featuredCategories} />
        </section>

        {/* 3. Story Bento Grid Section */}
        <StorySection />

        {/* 4. Craftsmanship Sticky Scroll Timeline Section */}
        <EditorialCraft />

        {/* 5. Trending Products Carousel Slider */}
        <section id="trending" className="py-20 md:py-28 bg-[#f1ebe1]/40 border-y border-[#e3dccf]/50">
          <div className="max-w-[1800px] mx-auto px-6 md:px-16 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <ScrollReveal direction="right" className="max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[2px] text-[#b5573a] block mb-3">
                Mùa này có gì hot
              </span>
              <h2 className="font-serif text-3.5xl md:text-5xl font-light tracking-tight">
                Xu hướng thịnh hành
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2} className="text-[#8a857c] text-xs font-medium uppercase tracking-[1px] hidden sm:block">
              Lướt ngang để xem thêm hoặc sử dụng nút bấm
            </ScrollReveal>
          </div>

          <div className="max-w-[1800px] mx-auto px-6 md:px-16 overflow-visible">
            <ScrollReveal direction="up" delay={0.1}>
              <HorizontalSlider products={trendingProducts} />
            </ScrollReveal>
          </div>
        </section>

        {/* 6. Bento Grid Brand Philosophy & Values */}
        <section className="max-w-[1800px] mx-auto px-6 md:px-16 py-20 md:py-28">
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-semibold uppercase tracking-[2px] text-[#b5573a] block mb-3">
              Giá trị di sản
            </span>
            <h2 className="font-serif text-3.5xl md:text-5xl font-light tracking-tight">
              Sự tinh tuyển trong từng thớ vải
            </h2>
            <p className="text-[#8a857c] text-sm md:text-base mt-4 font-light">
              Chúng tôi kiến tạo thời trang tối giản dựa trên ba triết lý trường tồn cùng năm tháng.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Premium Materials */}
            <ScrollReveal direction="up" delay={0.1} className="flex">
              <div className="bg-[#efe7dc] p-8 md:p-10 rounded-[12px] flex flex-col gap-6 items-start shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
                <div className="w-12 h-12 rounded-full bg-[#b5573a]/10 flex items-center justify-center text-[#b5573a]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-medium text-[#1c1a18] mb-3">
                    Chất liệu thượng hạng
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3d3a36] font-light">
                    Sử dụng 100% len merino tự nhiên, sợi bông hữu cơ đạt chuẩn quốc tế và lụa dệt thủ công mang lại sự mềm mại, thoáng mát vượt bậc cho làn da.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: Eco & Sustainability */}
            <ScrollReveal direction="up" delay={0.2} className="flex">
              <div className="bg-[#efe7dc] p-8 md:p-10 rounded-[12px] flex flex-col gap-6 items-start shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
                <div className="w-12 h-12 rounded-full bg-[#b5573a]/10 flex items-center justify-center text-[#b5573a]">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-medium text-[#1c1a18] mb-3">
                    Độc bản & Bền vững
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3d3a36] font-light">
                    Mỗi sản phẩm đều mang triết lý Eco-conscious, hạn chế hoá chất tẩy nhuộm độc hại, tối ưu hoá vòng đời sử dụng để bảo vệ hệ sinh thái Trái Đất.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3: Artisan Tailoring */}
            <ScrollReveal direction="up" delay={0.3} className="flex">
              <div className="bg-[#efe7dc] p-8 md:p-10 rounded-[12px] flex flex-col gap-6 items-start shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
                <div className="w-12 h-12 rounded-full bg-[#b5573a]/10 flex items-center justify-center text-[#b5573a]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-medium text-[#1c1a18] mb-3">
                    Nghệ thuật may đo
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3d3a36] font-light">
                    Được gia công bởi các nghệ nhân lành nghề bậc nhất với kỹ nghệ khâu giấu chỉ tinh tế, phom dáng rủ tự nhiên tôn vinh nét quyến rũ tĩnh lặng.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 7. Testimonials & Reviews Grid */}
        <Testimonials />

        {/* 8. Newsletter Subscription */}
        <Newsletter />
      </main>
    </div>
  );
}
