"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { FashionImage } from "@/components/shop/fashion-image";

export function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const trendingContainerRef = useRef<HTMLDivElement>(null);

  // Auto cycle hero slides every 6000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
  };

  const scrollTrending = (direction: "left" | "right") => {
    if (trendingContainerRef.current) {
      const scrollAmount = 420; // width of product card + gap
      trendingContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const heroSlides = [
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnlgzgGreQihhisxNEqhc_gB3nux5XRbRwcD3euAu2Am2gGq9JRPGOKUtB1hCE0SqSNdEvJcDn8y2hWPk6sosFg4AKiftSKlH0SWHKG4z3BTVP1rTiAXUah9tj2SUHCyLhvCgGhVqYiL8ew-4cWP1JknMFcAdxuL5Ix4uhXsPLbMz54P4aiY6SOOS_HDnkYzzJmj7x6pVIV6GcY8lZ8Y-mYz6_0twAn96sH8-GY-vb-e6RpLtUcpBKo1l-lUwraFKBf0NF0LIeNDeK",
      title: "Vela Wear — Bộ sưu tập Thu 2026",
      subtitle: "Khám Phá Sự Tĩnh Lặng",
      btnText: "Khám phá ngay",
      link: "/collection",
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDb2C_CdYCUxxS2v20r1u-piDVPxRGbeJYHnvWOeUu8AfdpbsiM-2QXXYby-n38tG-QGVtfjRTwPPwE-IvSgBxM0vPysyM9QF6URCE6JfhS66F0LrroSxwFrPu-9_zpSTfdLAl5QYfGNW-0c7deZ_L1aI4txERmjUvB_TPYC4f10EY-GVOJ2HFeRrvMlay0FJf8_Zj0Cl7Mm3DuH86q2_sKqDB-W4sQgA3SlibzuVBwt2ysRRcyTihHSUD9I8N0IT4GwmTC9aRpEv5w",
      title: "Nét Đẹp Của Sự Tĩnh Lặng",
      subtitle: "Autumn / Winter Lookbook",
      btnText: "Xem Lookbook",
      link: "/collection",
    },
  ];

  const categories = [
    {
      label: "Essentials",
      btnText: "Shop Now",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBB01iD0ZUAAbXEfBxGwf6S_tVo9lhi8Sz-9Bqgt3w7eHWeLzxcQtFE8j1hypM92Hh87JXPBZ7iRaIfzRGf0jcLZcybovsZochcNkAlY7HAXlGCDru3V3RzmnIPgmVqLbRBuMy8jWHj0t-SU9s_IlGrfTjt3-XJUcW5HSPgMAoXCWJB0X_8io6wtuVZ-TVQietcTPsIO0tn7S5Pbjv_Izf0xCID5DhIQoy7JxSgks5H_3ZA-PwUi3BSWgxbspE5oOAhi4ra3-No9FKa",
      link: "/collection",
    },
    {
      label: "Accessories",
      btnText: "Explore",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLGMe7fSol3cLxyNZeWO1_aSBSqo2xD7aktKUxgF3gx43in9HtB7MqVYyDZwQTbNNYlSJIubLUEWzwA1Q8jTYKYmkfsLyO60rtQVaxykhg6z3whbLFXQF7M6GRLQs1DLWvfyf23hvG2bVcPHsTHzOO8DdtQJo1YhIDfUXV8uo1qsMo2eP8Y40rlr-3f8g2l2momMxfNI3YNrunps0Dz6tTQ0_eDfY-aSHBt3bhC2n2To-wQXXBLREk8o5fQenXi1PKtBdMdSPXE8E9",
      link: "/collection",
    },
    {
      label: "Outerwear",
      btnText: "Discover",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3rdhdd2Is5yjK5nAVVfW6P2sBr2eFbIuyGPXLzEMmaaz6S048ueY6FpMEhTXDQ70RHHoicQkL8NH1GrGzWkFHgtJ9AZY0aQHNRuQigIU9TZZSReu_xPV2W9m1jyi0ZDIFVUqm10oAVd9EW7Alu_gKcYdm8ZYDEkWqM2BRPBkIOA-Nb0PQlIzJj-OeG8i8Jlv6_nDIuYrw1eSjwgjtRvkjlxlOxMtc3rdT9__yYdd3YpOJXLlEPuMNJbUU88td1TYmIABgQLcnDhg4",
      link: "/collection",
    },
  ];

  const trendingProducts = [
    {
      id: "trending-1",
      name: "Classic Linen Shirt",
      category: "Men's Lifestyle",
      price: "1,250,000₫",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyQTGTpgHC2eDqWMGK8dR2RuHmPVKLBqYH20_WPIANN1bFcjjQ6-8kTI1SelzlScRo5881xkzSzOBJRYoe4ZCEbMWsPzeqydM2SbOliSQPh-TPL_WAoL7rp27x_yaBc-ZZBSe4qIc8o50jRXY4h5IFZJ21Ep5UAt5H3zV7d7ZI6AN8NcMV5aJx-vFgKR5CPdNAdoRcnsqs45aaesgReQqVl56pF2YS22-Wh2E_Zas8zX_4oPiVWTDcAc2IF3klxwGDZ2T1uIGDaNRi",
    },
    {
      id: "trending-2",
      name: "Pleated Wool Trousers",
      category: "Women's Premium",
      price: "2,400,000₫",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvP7H8zQsUizbqeLCsGS0Hu3mLducId6DXvb0dwq-5VgHnm48wp8zWIsynRu5pIR4AE4ZUhPlPSHf9alsJK-GVFz9dFe37X68bqSV9t-gpzqZyUpJAdJHK4AHznxt5LgUBtExaHWPDISobXgESuMFsgJMBzFURdBOCeueSSZ7Q7B1_aD2VjnljK_qtpicDlBuOzhZDko34wB7-_XXWfDzX5u_afVC_XmAI3fffbOtgtuAo9ocnrGaHo3-afBhVIzN3nKWUEXl3bzA6",
    },
    {
      id: "trending-3",
      name: "The Heritage Tote",
      category: "Accessories",
      price: "3,800,000₫",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoYMTx73sE-zl-rrk3jPvaVd_aviVz5zLceFEuv_qsiBZ0vz3tWf27Y4bM3tKDRPWUDzVbW27UEQ7321iBNy9hj5FeoekgDPBRzmdvPUwTtUiPit_j3bnUld7t5DEEzvyPcUvLdCdnrk8SfaQH51KzYB2tNWGezSFzJVMhl_Um_ej-Htfj5ixSBPA7SfU5FD_jserlObo9OvUA7agoC_03nsUmacD6b7_nhyNV0PkA5Gzn9NBahxqHhxAgBy14QadlvpSwGsafxfga",
    },
    {
      id: "trending-4",
      name: "Merino Wool Coat",
      category: "Outerwear",
      price: "5,600,000₫",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3rdhdd2Is5yjK5nAVVfW6P2sBr2eFbIuyGPXLzEMmaaz6S048ueY6FpMEhTXDQ70RHHoicQkL8NH1GrGzWkFHgtJ9AZY0aQHNRuQigIU9TZZSReu_xPV2W9m1jyi0ZDIFVUqm10oAVd9EW7Alu_gKcYdm8ZYDEkWqM2BRPBkIOA-Nb0PQlIzJj-OeG8i8Jlv6_nDIuYrw1eSjwgjtRvkjlxlOxMtc3rdT9__yYdd3YpOJXLlEPuMNJbUU88td1TYmIABgQLcnDhg4",
    },
  ];

  return (
    <div className="bg-canvas text-ink min-h-screen">
      {/* Hero Slider Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] md:h-[819px] overflow-hidden group select-none">
        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out flex items-end pb-24 md:pb-section px-5 md:px-12 justify-center text-center ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <FashionImage
                src={slide.image}
                alt={slide.title}
                priority={index === 0}
                className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-[10000ms] scale-105 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/60 via-transparent to-transparent z-10" />

              <div className="relative z-20 max-w-3xl mx-auto flex flex-col items-center">
                <span className="font-serif italic text-base md:text-xl text-on-dark/85 tracking-wide mb-4">
                  {slide.subtitle}
                </span>
                <h1 className="font-serif text-3xl md:text-display-xl text-on-dark font-light leading-tight tracking-[-0.02em] mb-8 max-w-2xl">
                  {slide.title}
                </h1>
                <Link
                  href={slide.link}
                  className="bg-primary-container text-on-primary font-serif uppercase text-xs md:text-sm tracking-[0.2em] px-8 py-4 rounded-sm hover:bg-primary transition-all duration-300 hover:shadow-lg active:scale-95"
                >
                  {slide.btnText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevSlide}
          aria-label="Previous slide"
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          onClick={handleNextSlide}
          aria-label="Next slide"
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="size-6" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="max-w-[1800px] mx-auto px-6 md:px-16 py-20 md:py-section">
        <div className="mb-12">
          <h2 className="font-serif text-3xl md:text-display-lg text-ink font-light tracking-tight">
            Featured
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-item-gap">
          {categories.map((category) => (
            <Link
              key={category.label}
              href={category.link}
              className="group relative aspect-[3/4] block overflow-hidden bg-surface-card rounded-sm shadow-sm transition-shadow duration-500 hover:shadow-xl"
            >
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <FashionImage
                  src={category.src}
                  alt={category.label}
                  className="transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors duration-500" />
              </div>

              <div className="absolute bottom-8 left-8 z-10">
                <h3 className="font-serif text-2xl md:text-display-md text-on-dark uppercase tracking-wide">
                  {category.label}
                </h3>
                <span className="text-on-dark border-b border-white/40 hover:border-white text-xs font-serif tracking-[0.15em] uppercase mt-2.5 inline-block transition-colors">
                  {category.btnText}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="py-16 md:py-section border-t border-hairline/30 bg-surface-container-low/20">
        <div className="max-w-[1800px] mx-auto px-6 md:px-16 mb-10 flex justify-between items-end">
          <div>
            <h2 className="font-serif text-3xl md:text-display-lg text-ink font-light tracking-tight">
              Trending Now
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollTrending("left")}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full border border-hairline bg-canvas flex items-center justify-center hover:bg-surface-card transition-colors active:scale-95"
            >
              <ChevronLeft className="size-5 text-ink" />
            </button>
            <button
              onClick={() => scrollTrending("right")}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full border border-hairline bg-canvas flex items-center justify-center hover:bg-surface-card transition-colors active:scale-95"
            >
              <ChevronRight className="size-5 text-ink" />
            </button>
          </div>
        </div>

        <div
          ref={trendingContainerRef}
          className="overflow-x-auto no-scrollbar scroll-smooth flex gap-6 md:gap-item-gap px-6 md:px-16 max-w-[1800px] mx-auto pb-4"
        >
          {trendingProducts.map((product) => (
            <Link
              key={product.id}
              href="/collection"
              className="min-w-[280px] md:min-w-[380px] group flex flex-col gap-4"
            >
              <div className="aspect-[3/4] w-full bg-surface-card overflow-hidden relative rounded-sm shadow-sm transition-shadow duration-500 group-hover:shadow-md">
                <FashionImage
                  src={product.src}
                  alt={product.name}
                  className="transition-transform duration-[1200ms] group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-[#1c1a18]/5 group-hover:bg-[#1c1a18]/10 transition-colors duration-500" />

                {/* Subtle Quick-Add Indicator on Hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-canvas/95 py-3.5 text-center text-xs font-serif uppercase tracking-[0.15em] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out border-t border-hairline">
                  Xem chi tiết
                </div>
              </div>
              <div className="px-1">
                <h4 className="font-serif text-lg text-ink font-light group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <p className="text-on-surface-variant/75 text-xs tracking-wider uppercase mt-0.5">
                  {product.category}
                </p>
                <p className="mt-2 text-sm font-medium text-ink">
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collection (Story) Section */}
      <section className="bg-surface-dark py-20 md:py-section select-none text-on-dark overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-section items-center">
            <div className="order-2 md:order-1 max-w-lg pr-4">
              <span className="font-serif text-xs md:text-sm italic tracking-widest text-primary-fixed-dim/90 uppercase block mb-4">
                Mùa Thu 2026
              </span>
              <h2 className="font-serif text-3xl md:text-display-lg font-light tracking-tight mb-6 text-white">
                Sự Tĩnh Lặng Trầm Ấm
              </h2>
              <p className="text-sm md:text-base leading-relaxed tracking-wide text-on-dark/75 mb-8 font-light">
                Lấy cảm hứng từ những buổi chiều tà muộn, bộ sưu tập mang đến
                những thiết kế tối giản nhưng giàu chi tiết. Chất liệu len
                merino và lụa tự nhiên được dệt tinh xảo, tạo nên những cấu trúc
                phom dáng thoải mái nhưng đầy tính nghệ thuật. Một sự tôn vinh vẻ
                đẹp tĩnh lặng giữa nhịp sống hối hả.
              </p>
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 text-primary-fixed-dim hover:text-white transition-colors text-xs md:text-sm font-serif tracking-[0.15em] uppercase border-b border-primary-fixed-dim/40 pb-1 hover:border-white group"
              >
                Xem chi tiết bộ sưu tập
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="order-1 md:order-2 aspect-[4/5] bg-ink relative rounded-sm overflow-hidden shadow-2xl">
              <FashionImage
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3rdhdd2Is5yjK5nAVVfW6P2sBr2eFbIuyGPXLzEMmaaz6S048ueY6FpMEhTXDQ70RHHoicQkL8NH1GrGzWkFHgtJ9AZY0aQHNRuQigIU9TZZSReu_xPV2W9m1jyi0ZDIFVUqm10oAVd9EW7Alu_gKcYdm8ZYDEkWqM2BRPBkIOA-Nb0PQlIzJj-OeG8i8Jlv6_nDIuYrw1eSjwgjtRvkjlxlOxMtc3rdT9__yYdd3YpOJXLlEPuMNJbUU88td1TYmIABgQLcnDhg4"
                alt="Autumn collection highlight editorial photography"
                className="w-full h-full object-cover transition-transform duration-[8000ms] hover:scale-102"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-500" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
