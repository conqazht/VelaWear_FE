"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";

import { FashionImage } from "@/components/shop/fashion-image";
import { ProductCard } from "@/components/shop/product-card";
import { useFavorites } from "@/components/shop/favorites-provider";

export default function MemberProfile() {
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["profile", "orders", "favourites", "settings"].includes(tab)) {
        return tab;
      }
    }
    return "profile";
  });
  const [activeInterestTab, setActiveInterestTab] = useState("all");
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselContainerRef.current) {
      const scrollAmount = 420; // card width + gap
      carouselContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const subTabs = [
    { id: "profile", label: "Profile" },
    { id: "orders", label: "Orders" },
    { id: "favourites", label: "Favourites" },
    { id: "settings", label: "Settings" },
  ];

  const interestTabs = [
    { id: "all", label: "All" },
    { id: "sports", label: "Sports" },
    { id: "products", label: "Products" },
    { id: "teams", label: "Teams" },
    { id: "athletes", label: "Athletes" },
    { id: "cities", label: "Cities" },
  ];

  const recommendedProducts = [
    {
      id: "rec-1",
      name: "The Structure Blazer",
      category: "Women's Premium Outerwear",
      price: "$380.00",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxzCLSuFXV2BaU_SI-C_UwGVCKl_C5oG7VQ2x4d2AYRhiEPCQc038hB1fHURu_8AyqSm8ehgRf7EhvZwpFfrGcM0Pu4SQy9V3NSP7j2SSYp2l-jEoj_TfgJ3OYKBuscMy758AcU-4C3xzqrcQnxKPi8SR5Bw_wDhtEPhm_MXuY-q8xJxzKaAo0qnerVZ42QkfLEYBKqmTfqi8Pqum4CI0uDru7lreW5oGv4YKS4vMH5V09P233xozoG0Es9dZjx95QfW1RPBxZ_G1U",
    },
    {
      id: "rec-2",
      name: "Essential Ribbed Knit",
      category: "Women's Lifestyle Dress",
      price: "$195.00",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGuT1MGV0s-GET9OLrNCIAqJ5bWclXZ2FF3tmfnLh7RDnUfaVGgI7VL3cPfVFuFA0sXCB73hKuUJHIebB3g_Iyo65Ohk6m4Do4dklPwbCsO55eNH4YiE_N8ou-uUCsxs4J4IzyCtMqwhStDk-QLTEeG3XH26_XEPVbI2fuospCTfuH6jabINPv4AEw0lhTd7Jl7PRs9qYKjw66nx8jTmwnzIleXOpvwEPrOrdnZ1Z3ZXXn2xqBTNeppJasQj3Iufsw0OXp39xBzZEL",
    },
    {
      id: "rec-3",
      name: "Artisan Chelsea Boot",
      category: "Men's Premium Footwear",
      price: "$450.00",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8BUrYe4sh5K3HlJx6vFaK4p3MbI90KdEks40-fb3Srz0p8yWIRP6VhInTRF7dF-gVHjOF3dJZm-nOZ-exwrim-sQ5h1tu85BK4_TrwmsVSw9O1s_5QUyQ4FpyJ4gurcZTJumdU5iycxYZ1NROVRs0lFHDWMWPJb9boNfQEvvLJILCLfrydP5rT1RY-kVazb5FBuZZm6NqsSW-7tXyJyTzhn8oahWVu7dLiELgH4kdSx6aR5yXI1NnB1_58sWm87F3eCHEk2DGBDa4",
    },
  ];

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      {/* Sub-Navigation */}
      <div className="w-full border-b border-hairline/40 select-none">
        <div className="max-w-[1800px] mx-auto flex justify-center gap-8 py-4">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`text-sm font-medium tracking-[0.05em] transition-colors ${
                tab.id === activeSubTab
                  ? "text-primary border-b-2 border-primary pb-1 -mb-[18px]"
                  : "text-[#55423d]/60 hover:text-ink pb-1"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-[1800px] w-full mx-auto px-6 md:px-16 py-12 flex flex-col gap-16">
        
        {/* Profile Section */}
        <section className="flex items-center gap-6 md:gap-8 text-left">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#e7e1de] border border-hairline flex items-center justify-center text-ink text-3xl md:text-4xl font-serif font-light shadow-inner flex-shrink-0">
            E
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-serif text-3xl md:text-display-lg text-ink leading-none font-medium tracking-tight mb-2">
              Eleanor
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant/80 font-light">
              Vela Member Since October 2023
            </p>
          </div>
        </section>

        {/* PROFILE TAB CONTENT */}
        {activeSubTab === "profile" && (
          <>
            {/* Interests Section */}
            <section className="flex flex-col gap-6 text-left">
              <div className="flex justify-between items-end border-b border-hairline pb-4">
                <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight">
                  Interests
                </h2>
                <button className="text-sm font-medium text-ink hover:text-primary transition-colors">
                  Edit
                </button>
              </div>

              <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-hairline/40 pb-4">
                {interestTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveInterestTab(tab.id)}
                    className={`text-sm font-medium tracking-[0.05em] transition-colors whitespace-nowrap ${
                      tab.id === activeInterestTab
                        ? "text-ink border-b-2 border-ink pb-4 -mb-[18px]"
                        : "text-on-surface-variant/65 hover:text-ink pb-4"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-sm text-ink font-light max-w-xl">
                  {"Add your interests to shop a collection of products that are based on what you're into."}
                </p>
                <div className="w-full md:w-[300px] h-[300px] bg-surface-card border border-hairline/50 rounded-sm mt-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#efe7dc]/70 transition-colors group">
                  <PlusCircle className="size-8 text-ink/70 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-ink tracking-[0.05em]">
                    Add Interests
                  </span>
                </div>
              </div>
            </section>

            {/* Find your next favourite Carousel */}
            <section className="flex flex-col gap-6 border-t border-hairline/30 pt-16 text-left">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight">
                  Find your next favourite
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollCarousel("left")}
                    aria-label="Scroll left"
                    className="w-10 h-10 rounded-full border border-hairline bg-canvas flex items-center justify-center text-ink hover:bg-surface-card transition-colors active:scale-95"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={() => scrollCarousel("right")}
                    aria-label="Scroll right"
                    className="w-10 h-10 rounded-full border border-hairline bg-canvas flex items-center justify-center text-ink hover:bg-surface-card transition-colors active:scale-95"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>

              <div
                ref={carouselContainerRef}
                className="flex overflow-x-auto gap-6 scroll-smooth no-scrollbar pb-6"
              >
                {recommendedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-[280px] w-[280px] md:min-w-[400px] md:w-[400px] flex flex-col group cursor-pointer"
                  >
                    <div className="w-full aspect-square bg-surface-card relative overflow-hidden mb-4 rounded-sm shadow-sm transition-shadow duration-500 hover:shadow-md">
                      <FashionImage
                        src={product.src}
                        alt={product.name}
                        className="transition-transform duration-[1200ms] group-hover:scale-103"
                      />
                      <div className="absolute inset-0 bg-[#1c1a18]/5 group-hover:bg-[#1c1a18]/10 transition-colors duration-500" />
                    </div>
                    <div className="px-1 text-left">
                      <h3 className="font-serif text-lg text-ink font-light group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-on-surface-variant/75 text-xs tracking-wider uppercase mt-0.5">
                        {product.category}
                      </p>
                      <p className="text-sm font-semibold text-ink mt-2">
                        {product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ORDERS TAB CONTENT */}
        {activeSubTab === "orders" && (
          <section className="flex flex-col gap-6 text-left">
            <div className="border-b border-hairline pb-4 flex justify-between items-end">
              <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight">
                Order History
              </h2>
              <span className="text-xs text-[#55423d]/65">2 orders placed</span>
            </div>
            
            <div className="flex flex-col gap-8">
              {/* Order 1 */}
              <div className="border border-hairline/60 rounded-sm bg-surface-card/30 p-6 flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-surface-card overflow-hidden rounded-sm flex-shrink-0 border border-hairline/25">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwRzAE6C185QzyiPxCpVjB15ObBSeOKabu2pDX2jtjCbTbeBZqlIWMfXtCkW3cIuCjgaYSQAIUMWMTpqCihesHuOM_YtttUXMe469suIteQ-q2RNfi6MNmbukPG747ouYpZq-jzJ75zPYVXA1kP4enS-NOjFwWOfMB-z1LSUPNFHhtKMMpeiWx7CtS5dgfN-_EfjAvCgxN8hdxayD8dsnAAUx91mkM9xDoSu6DUS01v59PW5xRuI81N4DOIe2cUXUeYHlAbxxxgMsJ"
                      alt="Linen Blend Blazer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-sans text-sm font-semibold text-ink">Linen Blend Blazer</h3>
                    <p className="text-xs text-[#55423d]/75 mt-0.5">Size: M | Color: Sand</p>
                    <p className="text-xs text-[#55423d]/50 mt-1">Order #VW-10492 • Placed on June 12, 2026</p>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col justify-between md:justify-center md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-hairline/40">
                  <div className="text-sm font-bold text-ink">$245.00</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                    Delivered
                  </span>
                </div>
              </div>

              {/* Order 2 */}
              <div className="border border-hairline/60 rounded-sm bg-surface-card/30 p-6 flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-surface-card overflow-hidden rounded-sm flex-shrink-0 border border-hairline/25">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEIQP1onvFftdIpPdfA7kqAlQHAu_SknPhkK5aWLKs_qCZofjj9eJjMQ50OnceZ_K-9sqSJrMgZMiESDSuM9SpXP0ozbdO-mvi6w4tYkdgZ_uaMuqIqA6HstQyT7ZhWTmv250PRjHGzPRAMB_tra-1_71ox25I_64a8N9NdhHRVMs9HAiyZACTaboO61z-holquWMxK0CL0tW12dXdlYR_hYalde3HrqLDwtpCiR9xlRuEixHCMSH1WWZMzGZZMS5dBCUAme6_L4XJ"
                      alt="Silk Drape Blouse"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-sans text-sm font-semibold text-ink">Silk Drape Blouse</h3>
                    <p className="text-xs text-[#55423d]/75 mt-0.5">Size: S | Color: Cream</p>
                    <p className="text-xs text-[#55423d]/50 mt-1">Order #VW-10381 • Placed on May 24, 2026</p>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col justify-between md:justify-center md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-hairline/40">
                  <div className="text-sm font-bold text-ink">$180.00</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                    Delivered
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAVOURITES TAB CONTENT */}
        {activeSubTab === "favourites" && (
          <section className="flex flex-col gap-6 text-left">
            <div className="border-b border-hairline pb-4">
              <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight">
                Your Favourites
              </h2>
            </div>
            {favorites.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-6">
                <p className="text-sm text-on-surface-variant/80 font-light max-w-md">
                  Danh sách yêu thích của bạn đang trống. Hãy khám phá các sản phẩm tuyệt vời của Vela Wear để thêm vào danh sách yêu thích.
                </p>
                <Link
                  href="/collection"
                  className="inline-flex bg-primary-container text-on-primary text-xs font-semibold uppercase tracking-widest py-3.5 px-8 hover:bg-[#964025] transition-colors duration-200 rounded-sm shadow-sm"
                >
                  Khám phá Collections
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* SETTINGS TAB CONTENT */}
        {activeSubTab === "settings" && (
          <section className="flex flex-col gap-6 text-left max-w-2xl">
            <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight border-b border-hairline pb-4">
              Account Settings
            </h2>
            <div className="flex flex-col gap-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#1c1a18]/45 mb-1.5">First Name</span>
                  <div className="border border-hairline bg-surface-card/25 p-3 rounded-sm text-sm text-ink font-medium">Eleanor</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#1c1a18]/45 mb-1.5">Last Name</span>
                  <div className="border border-hairline bg-surface-card/25 p-3 rounded-sm text-sm text-ink font-medium">Vela</div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#1c1a18]/45 mb-1.5">Email Address</span>
                <div className="border border-hairline bg-surface-card/25 p-3 rounded-sm text-sm text-ink font-medium">eleanor.vela@minimalist.com</div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#1c1a18]/45 mb-1.5">Member Tier</span>
                <div className="border border-[#b5573a]/30 bg-[#b5573a]/5 p-4 rounded-sm flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-[#b5573a]">VELA Elite Member</div>
                    <div className="text-xs text-[#55423d]/75 mt-0.5">Enjoying free nationwide shipping and 30-day returns</div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b5573a] bg-white px-3 py-1.5 border border-[#b5573a]/30 rounded-sm">Active</span>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
