"use client";

import { Sparkles, Leaf, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { getLocalizedFixtureProducts } from "@/lib/i18n/fixture-catalog";
import { mapBackendProduct } from "@/lib/vela-data";
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

const STATIC_CATEGORY_MEDIA = [
  {
    id: "cat-1",
    nameKey: "storefront.home.categoryEssentials",
    image: "/images/categories/essentials.jpg",
    link: "/collection",
  },
  {
    id: "cat-2",
    nameKey: "storefront.home.categoryAccessories",
    image: "/images/categories/accessories.jpg",
    link: "/collection",
  },
  {
    id: "cat-3",
    nameKey: "storefront.home.categoryOuterwear",
    image: "/images/categories/outerwear.png",
    link: "/collection",
  },
] as const;

export function HomePage() {
  const { locale: activeLocale, t } = useI18n();
  const heroSlides = [
    {
      id: "slide-1",
      title: t("storefront.home.heroAutumnTitle"),
      subtitle: t("storefront.home.heroAutumnSubtitle"),
      image: "/images/home/hero-autumn-2026.avif",
      ctaText: t("storefront.home.heroAutumnCta"),
    },
    {
      id: "slide-2",
      title: t("storefront.home.heroLookbookTitle"),
      subtitle: t("storefront.home.heroLookbookSubtitle"),
      image: "/images/home/hero-lookbook-2026.jpg",
      ctaText: t("storefront.home.heroLookbookCta"),
    },
  ];
  const staticCategories = useMemo(
    () =>
      STATIC_CATEGORY_MEDIA.map((category) => ({
        ...category,
        name: t(category.nameKey),
      })),
    [t],
  );
  
  // Fetch newest products for trending
  const productsQuery = useProductsQuery({ size: 10, sort: "createdAt,desc", locale: activeLocale });
  const categoriesQuery = useCategoriesQuery({ size: 10, sort: "sortOrder,asc", locale: activeLocale });

  const trendingProducts = useMemo(() => {
    if (productsQuery.data?.result && productsQuery.data.result.length > 0) {
      return productsQuery.data.result.map((product) => mapBackendProduct(product, activeLocale));
    }
    // Fallback to static if backend fails or empty
    const trendingProductIds = ["classic-linen-shirt", "pleated-wool-trousers", "the-heritage-tote", "merino-wool-coat"];
    const fixtureProducts = getLocalizedFixtureProducts(activeLocale);
    return trendingProductIds
      .map(id => fixtureProducts.find(p => p.id === id))
      .filter((p): p is (typeof fixtureProducts)[number] => !!p);
  }, [productsQuery.data, activeLocale]);

  const featuredCategories = useMemo(() => {
    if (categoriesQuery.data?.result && categoriesQuery.data.result.length > 0) {
      return categoriesQuery.data.result.slice(0, 3).map((cat, index) => ({
        id: `cat-${cat.id}`,
        name: cat.name,
        image: staticCategories[index % staticCategories.length].image, // keep premium static images
        link: `/collection`,
      }));
    }
    return staticCategories;
  }, [categoriesQuery.data, staticCategories]);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1c1a18] flex flex-col selection:bg-[#b5573a] selection:text-white">
      <main className="flex-1">
        {/* 1. Hero Slider Banner */}
        <HeroSlider slides={heroSlides} />

        {/* 2. Featured Categories Section */}
        <section id="categories" className="max-w-[1800px] mx-auto px-6 md:px-16 py-20 md:py-28">
          <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <ScrollReveal direction="right" className="max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[2px] text-[#b5573a] block mb-3">
                {t("storefront.home.featuredEyebrow")}
              </span>
              <h2 className="font-serif text-3.5xl md:text-5xl font-light tracking-tight">
                {t("storefront.home.featuredTitle")}
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2}>
              <Link
                href="/collection"
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1px] text-[#1c1a18] hover:text-[#b5573a] transition-colors"
              >
                {t("storefront.home.viewAllCategories")}
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
                {t("storefront.home.trendingEyebrow")}
              </span>
              <h2 className="font-serif text-3.5xl md:text-5xl font-light tracking-tight">
                {t("storefront.home.trendingTitle")}
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2} className="text-[#8a857c] text-xs font-medium uppercase tracking-[1px] hidden sm:block">
              {t("storefront.home.trendingHint")}
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
              {t("storefront.home.heritageEyebrow")}
            </span>
            <h2 className="font-serif text-3.5xl md:text-5xl font-light tracking-tight">
              {t("storefront.home.heritageTitle")}
            </h2>
            <p className="text-[#8a857c] text-sm md:text-base mt-4 font-light">
              {t("storefront.home.heritageDescription")}
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
                    {t("storefront.home.materialsTitle")}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3d3a36] font-light">
                    {t("storefront.home.materialsDescription")}
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
                    {t("storefront.home.sustainableTitle")}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3d3a36] font-light">
                    {t("storefront.home.sustainableDescription")}
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
                    {t("storefront.home.tailoringTitle")}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3d3a36] font-light">
                    {t("storefront.home.tailoringDescription")}
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
