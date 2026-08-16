"use client";

import { Sparkles, Leaf, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
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
  const productsQuery = useProductsQuery({
    size: 10,
    sort: "createdAt,desc",
    locale: activeLocale,
  });
  const categoriesQuery = useCategoriesQuery({
    size: 10,
    sort: "sortOrder,asc",
    locale: activeLocale,
  });

  const trendingProducts = useMemo(() => {
    if (productsQuery.isPending) {
      return [];
    }

    if (productsQuery.data?.result && productsQuery.data.result.length > 0) {
      return productsQuery.data.result.map((product) => mapBackendProduct(product, activeLocale));
    }

    const trendingProductIds = [
      "classic-linen-shirt",
      "pleated-wool-trousers",
      "the-heritage-tote",
      "merino-wool-coat",
    ];
    const fixtureProducts = getLocalizedFixtureProducts(activeLocale);

    return trendingProductIds
      .map((id) => fixtureProducts.find((product) => product.id === id))
      .filter((product): product is (typeof fixtureProducts)[number] => Boolean(product));
  }, [productsQuery.data, productsQuery.isPending, activeLocale]);

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
    <div className="flex min-h-screen flex-col bg-[#f7f4ef] text-[#1c1a18] selection:bg-[#b5573a] selection:text-white">
      <main className="flex-1">
        {/* 1. Hero Slider Banner */}
        <HeroSlider slides={heroSlides} />

        {/* 2. Featured Categories Section */}
        <section id="categories" className="mx-auto max-w-[1800px] px-6 py-20 md:px-16 md:py-28">
          <div className="mb-12 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end">
            <ScrollReveal direction="right" className="max-w-xl">
              <span className="mb-3 block text-[11px] font-semibold tracking-[2px] text-[#b5573a] uppercase">
                {t("storefront.home.featuredEyebrow")}
              </span>
              <h2 className="text-3.5xl font-serif font-light tracking-tight md:text-5xl">
                {t("storefront.home.featuredTitle")}
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2}>
              <Link
                href="/collection"
                className="group inline-flex items-center gap-2 text-xs font-semibold tracking-[1px] text-[#1c1a18] uppercase transition-colors hover:text-[#b5573a]"
              >
                {t("storefront.home.viewAllCategories")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
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
        <section
          id="trending"
          className="border-y border-[#e3dccf]/50 bg-[#f1ebe1]/40 py-20 md:py-28"
        >
          <div className="mx-auto mb-12 flex max-w-[1800px] flex-col justify-between gap-4 px-6 md:flex-row md:items-end md:px-16">
            <ScrollReveal direction="right" className="max-w-xl">
              <span className="mb-3 block text-[11px] font-semibold tracking-[2px] text-[#b5573a] uppercase">
                {t("storefront.home.trendingEyebrow")}
              </span>
              <h2 className="text-3.5xl font-serif font-light tracking-tight md:text-5xl">
                {t("storefront.home.trendingTitle")}
              </h2>
            </ScrollReveal>
            <ScrollReveal
              direction="left"
              delay={0.2}
              className="hidden text-xs font-medium tracking-[1px] text-[#8a857c] uppercase sm:block"
            >
              {t("storefront.home.trendingHint")}
            </ScrollReveal>
          </div>

          <div className="mx-auto max-w-[1800px] overflow-visible px-6 md:px-16">
            {productsQuery.isPending ? (
              <TrendingProductsSkeleton loadingLabel={t("common.loading")} />
            ) : (
              <ScrollReveal direction="up" delay={0.1}>
                <HorizontalSlider products={trendingProducts} />
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* 6. Bento Grid Brand Philosophy & Values */}
        <section className="mx-auto max-w-[1800px] px-6 py-20 md:px-16 md:py-28">
          <ScrollReveal direction="up" className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-3 block text-[11px] font-semibold tracking-[2px] text-[#b5573a] uppercase">
              {t("storefront.home.heritageEyebrow")}
            </span>
            <h2 className="text-3.5xl font-serif font-light tracking-tight md:text-5xl">
              {t("storefront.home.heritageTitle")}
            </h2>
            <p className="mt-4 text-sm font-light text-[#8a857c] md:text-base">
              {t("storefront.home.heritageDescription")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Card 1: Premium Materials */}
            <ScrollReveal direction="up" delay={0.1} className="flex">
              <div className="flex w-full flex-col items-start gap-6 rounded-[12px] bg-[#efe7dc] p-8 shadow-sm transition-shadow duration-300 hover:shadow-md md:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b5573a]/10 text-[#b5573a]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-3 font-serif text-xl font-medium text-[#1c1a18] md:text-2xl">
                    {t("storefront.home.materialsTitle")}
                  </h3>
                  <p className="text-sm leading-relaxed font-light text-[#3d3a36]">
                    {t("storefront.home.materialsDescription")}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: Eco & Sustainability */}
            <ScrollReveal direction="up" delay={0.2} className="flex">
              <div className="flex w-full flex-col items-start gap-6 rounded-[12px] bg-[#efe7dc] p-8 shadow-sm transition-shadow duration-300 hover:shadow-md md:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b5573a]/10 text-[#b5573a]">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-3 font-serif text-xl font-medium text-[#1c1a18] md:text-2xl">
                    {t("storefront.home.sustainableTitle")}
                  </h3>
                  <p className="text-sm leading-relaxed font-light text-[#3d3a36]">
                    {t("storefront.home.sustainableDescription")}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3: Artisan Tailoring */}
            <ScrollReveal direction="up" delay={0.3} className="flex">
              <div className="flex w-full flex-col items-start gap-6 rounded-[12px] bg-[#efe7dc] p-8 shadow-sm transition-shadow duration-300 hover:shadow-md md:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b5573a]/10 text-[#b5573a]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-3 font-serif text-xl font-medium text-[#1c1a18] md:text-2xl">
                    {t("storefront.home.tailoringTitle")}
                  </h3>
                  <p className="text-sm leading-relaxed font-light text-[#3d3a36]">
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

function TrendingProductsSkeleton({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div aria-busy="true">
      <span role="status" className="sr-only">
        {loadingLabel}
      </span>

      <div className="flex gap-6 overflow-hidden px-1 pb-4" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="max-w-[400px] min-w-[280px] flex-none pb-4 sm:min-w-[340px] md:min-w-[380px]"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Skeleton className="size-full rounded-none bg-[#efe7dc]" />
              <Skeleton className="absolute top-4 left-4 h-6 w-16 rounded-full bg-[#e5dccf]" />
              <Skeleton className="absolute top-4 right-4 size-10 rounded-full bg-[#f7f4ef]/90" />
            </div>

            <div className="flex flex-col gap-1.5 px-1 pt-4">
              <Skeleton className="h-3 w-24 rounded-none bg-[#e5dccf]" />
              <Skeleton className="h-5 w-3/4 rounded-none bg-[#e5dccf]" />
              <div className="mt-0.5 flex items-center gap-2.5">
                <Skeleton className="h-4 w-24 rounded-none bg-[#e5dccf]" />
                <Skeleton className="h-3 w-16 rounded-none bg-[#e5dccf]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
