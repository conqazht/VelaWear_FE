import type { PriceSource, Pricing } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { localizeFixtureProduct } from "@/lib/i18n/fixture-products";
import { formatCurrency } from "@/lib/i18n/format";

export interface CartItem {
  id: string;
  productId?: number;
  productSlug?: string;
  name: string;
  price: number;
  listPrice?: number;
  priceSource?: PriceSource;
  campaignId?: number;
  campaignItemId?: number;
  campaignCode?: string;
  campaignName?: string;
  campaignEndsAt?: string;
  remainingQuota?: number;
  maxPerCustomer?: number;
  customerRemaining?: number;
  availableQuantity?: number;
  color: string;
  size: string;
  image: string;
  quantity: number;
  variantId?: number;
}

export interface OrderSummary {
  orderId: number;
  orderCode: string;
  status: string;
  finalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export interface ProductColorImages {
  colorId: number;
  colorName: string;
  hexCode?: string | null;
  thumbnail?: string;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  pricing?: Pricing;
  image: string;
  category: string;
  categoryId?: number;
  categorySlug?: string;
  badge?: string;
  color: string;
  size: string;
  description: string;
  realId?: number;
  variantId?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  material?: string;
  care?: string;
  shortDescription?: string;
  images?: string[];
  colorImages?: ProductColorImages[];
}

export const categoryLabels: Record<string, string> = {
  ALL: "Tất cả",
  AO: "Áo",
  QUAN: "Quần",
  "PHU KIEN": "Phụ kiện",
};

const englishCategoryLabels: Record<string, string> = {
  ALL: "All",
  AO: "Clothes",
  QUAN: "Trousers",
  "PHU KIEN": "Accessories",
};

const categoryFallbackLabels = {
  vi: "Phụ kiện",
  en: "Accessories",
} as const;

export function getCategoryLabel(
  category: string,
  locale: keyof typeof categoryFallbackLabels = "vi",
) {
  const labels = locale === "en" ? englishCategoryLabels : categoryLabels;

  return labels[category] ?? categoryFallbackLabels[locale];
}

const productBadgeLabels = {
  en: {
    new: "New",
    sale: "Sale",
    seasonal: "Seasonal Pick",
    loved: "Most Loved",
  },
  vi: {
    new: "Mới",
    sale: "Giảm giá",
    seasonal: "Gợi ý theo mùa",
    loved: "Được yêu thích nhất",
  },
} as const;

export function getProductBadgeLabel(badge: string, locale: Locale): string {
  const normalized = badge.trim().toLocaleLowerCase();
  const key =
    normalized === "new" || normalized === "mới"
      ? "new"
      : normalized === "sale" || normalized === "giảm giá"
        ? "sale"
        : normalized === "seasonal pick" || normalized === "gợi ý theo mùa"
          ? "seasonal"
          : normalized === "most loved" || normalized === "được yêu thích nhất"
            ? "loved"
            : null;

  return key ? productBadgeLabels[locale][key] : badge;
}

export const categoryTabs = ["ALL", "AO", "QUAN", "PHU KIEN"];

export const money = (value: number, locale: Locale = "vi") => {
  return formatCurrency(value, locale);
};

export const getProductById = (id: string) => PRODUCTS.find((product) => product.id === id);

export const PRODUCTS: Product[] = [
  {
    id: "linen-blazer",
    name: "Linen Blend Blazer",
    price: 2450000,
    image: "/images/fixtures/products/linen-blazer/card.webp",
    category: "AO",
    badge: "Seasonal Pick",
    color: "Sand",
    size: "M",
    description:
      "Meticulously tailored from an artisanal blend of European flax and organic cotton. It features double-needle detailing, structured yet soft shoulder pads, and raw horn buttons for a refined minimalist aesthetic.",
  },
  {
    id: "silk-blouse",
    name: "Silk Drape Blouse",
    price: 1800000,
    image: "/images/fixtures/products/silk-blouse/card.webp",
    category: "AO",
    badge: "Most Loved",
    color: "Cream",
    size: "S",
    description:
      "A fluid silk crepe de chine blouse with soft shoulder pleating and back tie details. Effortless luxury designed for comfortable elegance.",
  },
  {
    id: "wide-trousers",
    name: "Wide Leg Trousers",
    price: 1440000,
    originalPrice: 1800000,
    image: "/images/fixtures/products/wide-trousers/card.webp",
    category: "QUAN",
    badge: "Sale",
    color: "Terracotta",
    size: "M",
    description:
      "Tailored from Italian wool blend canvas with high rise, neat double pleats, and elegant long legs. Beautiful silhouette with a gorgeous, fluid drape.",
  },
  {
    id: "leather-tote",
    name: "Structured Leather Tote",
    price: 3200000,
    image: "/images/fixtures/products/leather-tote/card.webp",
    category: "PHU KIEN",
    badge: "New",
    color: "Tan",
    size: "OS",
    description:
      "Sleek and robust day tote made of premium smooth vegetable-tanned leather. Fits your tablet, notebook and daily essentials with ease.",
  },
  {
    id: "signature-hemp-tee",
    name: "Signature Hemp Tee",
    price: 1100000,
    image: "/images/fixtures/products/signature-hemp-tee/card.webp",
    category: "AO",
    color: "Grey",
    size: "M",
    description:
      "A minimalist, oversized grey t-shirt tailored from premium organic hemp and cotton blend. Offers exceptional breathability and structural weight.",
  },
  {
    id: "artisan-linen-overshirt",
    name: "Artisan Linen Over-Shirt",
    price: 2450000,
    image: "/images/fixtures/products/artisan-linen-overshirt/card.webp",
    category: "AO",
    color: "Terracotta",
    size: "S",
    description:
      "An unstructured, rich terracotta-colored linen shirt. Features natural raw texture, relaxed collar, and elegant drape.",
  },
  {
    id: "chunky-wool-knit",
    name: "Chunky Wool Knit",
    price: 3200000,
    image: "/images/fixtures/products/chunky-wool-knit/card.webp",
    category: "AO",
    color: "Olive",
    size: "L",
    description:
      "Folded, thick-knit wool sweater in a deep, natural olive green. Hand-stitched details and exceptionally warm fabric.",
  },
  {
    id: "oversized-linen-shirt",
    name: "Oversized Linen Shirt",
    price: 1850000,
    image: "/images/fixtures/products/oversized-linen-shirt/card.webp",
    category: "AO",
    badge: "New",
    color: "Natural",
    size: "S",
    description:
      "Off-white linen button-down shirt. The aesthetic is warm minimalism, highlighting the organic weave of flax fabric.",
  },
  {
    id: "relaxed-trousers",
    name: "Relaxed Trousers",
    price: 2100000,
    image: "/images/fixtures/products/relaxed-trousers/card.webp",
    category: "QUAN",
    color: "Sand",
    size: "M",
    description:
      "Relaxed-fit linen trousers in sand color. Long elegant drape designed for sophisticated campaigns.",
  },
  {
    id: "lightweight-jacket",
    name: "Lightweight Jacket",
    price: 1800000,
    image: "/images/fixtures/products/lightweight-jacket/card.webp",
    category: "AO",
    badge: "Sale",
    color: "Olive",
    size: "M",
    description:
      "Dark olive green linen jacket. Tactile, premium construction with single breasted buttons.",
  },
  {
    id: "classic-linen-shirt",
    name: "Classic Linen Shirt",
    price: 550000,
    image: "/images/fixtures/products/classic-linen-shirt/card.webp",
    category: "AO",
    badge: "New",
    color: "Sage",
    size: "M",
    description:
      "Exceptionally breathable rustic-woven linen with meticulous hidden stitching. It keeps its elegant drape after repeated washes and comes in a warm, easy-to-style shade.",
  },
  {
    id: "pleated-wool-trousers",
    name: "Pleated Wool Trousers",
    price: 1000000,
    image: "/images/fixtures/products/pleated-wool-trousers/card.webp",
    category: "QUAN",
    badge: "New",
    color: "Charcoal",
    size: "S",
    description:
      "Beautifully structured pleated trousers. Every fold is carefully pressed to hold its shape and flatter the silhouette. The lightweight wool blend is comfortable for work and relaxed weekends alike.",
  },
  {
    id: "the-heritage-tote",
    name: "The Heritage Tote",
    price: 1600000,
    originalPrice: 1900000,
    image: "/images/fixtures/products/the-heritage-tote/card.webp",
    category: "PHU KIEN",
    badge: "Sale",
    color: "Terracotta",
    size: "OS",
    description:
      "A substantial genuine-leather tote with a naturally soft hand and refined, earthy character. It is sized for a laptop and documents, with sturdy yet elegant handles.",
  },
  {
    id: "merino-wool-coat",
    name: "Merino Wool Coat",
    price: 2400000,
    image: "/images/fixtures/products/merino-wool-coat/card.webp",
    category: "AO",
    color: "Charcoal",
    size: "M",
    description:
      "An exceptionally warm and luxurious coat. Impeccably soft merino wool and a natural drape create a refined silhouette—an enduring winter wardrobe investment.",
  },
];

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: "silk-coat",
    name: "Silk Blend Tailored Coat",
    price: 4850000,
    color: "Oat",
    size: "M",
    image: "/images/fixtures/cart/silk-coat.webp",
    quantity: 1,
    variantId: 1001,
  },
  {
    id: "pleated-trousers-cart",
    name: "Pleated Wide-Leg Trousers",
    price: 2200000,
    color: "Charcoal",
    size: "32",
    image: "/images/fixtures/cart/pleated-trousers-cart.webp",
    quantity: 1,
    variantId: 1002,
  },
];

export const CHECKOUT_DEFAULT_ITEMS = [
  {
    id: "linen-overcoat",
    name: "The Linen Overcoat",
    price: 2850000,
    color: "Desert Beige",
    size: "L",
    image: "/images/fixtures/checkout/linen-overcoat.webp",
  },
  {
    id: "organic-poplin-shirt2",
    name: "Organic Poplin Shirt",
    price: 1450000,
    color: "Optical White",
    size: "M",
    image: "/images/fixtures/checkout/organic-poplin-shirt2.webp",
  },
];

export const DETAIL_IMAGES = [
  {
    src: "/images/fixtures/products/linen-blazer/gallery-main.webp",
    label: "Main Hangar",
  },
  {
    src: "/images/fixtures/products/linen-blazer/gallery-drape.webp",
    label: "Drape Close Up",
  },
  {
    src: "/images/fixtures/products/linen-blazer/gallery-seam.webp",
    label: "Horn Seam Detail",
  },
];

// Map backend product data to client-side Product model to preserve high-res images and styling.
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "/images/products/product-placeholder.webp";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    const explicitOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
    if (explicitOrigin) {
      try {
        return `${new URL(explicitOrigin).origin}${cleanPath}`;
      } catch {
        return cleanPath;
      }
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && apiUrl.startsWith("http")) {
      try {
        return `${new URL(apiUrl).origin}${cleanPath}`;
      } catch {
        return cleanPath;
      }
    }
    return cleanPath;
  }
  return url;
}

export function mapBackendProduct(
  bp: {
    id: number;
    slug: string;
    originalSlug?: string;
    name: string;
    description: string;
    categoryId: number;
    price?: number | null;
    pricing?: Pricing | null;
    image?: string | null;
    thumbnail?: string | null;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    material?: string;
    care?: string;
    shortDescription?: string;
    images?: string[];
    colorImages?: Array<{
      colorId: number;
      colorName: string;
      hexCode?: string | null;
      thumbnail?: string | null;
      images: string[];
    }>;
    categoryName?: string | null;
    categorySlug?: string | null;
  },
  locale: Locale = "vi",
): Product {
  // Find local match by matching originalSlug, slug, or name
  const match = PRODUCTS.find(
    (p) =>
      (bp.originalSlug && p.id === bp.originalSlug) ||
      p.id === bp.slug ||
      p.id === bp.slug.replace(/-[0-9]+$/, "") ||
      p.name.toLowerCase() === bp.name.toLowerCase(),
  );
  const localizedMatch = match ? localizeFixtureProduct(match, locale) : undefined;

  const colorImages = (bp.colorImages ?? []).map((group) => {
    const images = Array.from(new Set(group.images.map(resolveImageUrl)));
    const thumbnail = group.thumbnail ? resolveImageUrl(group.thumbnail) : images[0];

    return {
      colorId: group.colorId,
      colorName: group.colorName,
      hexCode: group.hexCode,
      thumbnail,
      images,
    };
  });
  const mainImg =
    bp.image || bp.thumbnail || colorImages[0]?.thumbnail || (match ? match.image : undefined);
  const resolvedMainImg = resolveImageUrl(mainImg);

  const rawImages =
    bp.images && bp.images.length > 0
      ? bp.images
      : match && match.id === "linen-blazer"
        ? DETAIL_IMAGES.map((img) => img.src)
        : [mainImg || "/images/products/product-placeholder.webp"];

  return {
    id: bp.slug,
    realId: bp.id,
    categoryId: bp.categoryId,
    name: bp.name,
    description: bp.description || localizedMatch?.description || "",
    price: bp.pricing?.effectivePrice ?? bp.price ?? 0,
    originalPrice:
      bp.pricing && bp.pricing.listPrice > bp.pricing.effectivePrice
        ? bp.pricing.listPrice
        : undefined,
    image: resolvedMainImg,
    badge:
      bp.pricing?.priceSource === "FLASH_SALE"
        ? "Flash Sale"
        : bp.pricing?.priceSource === "STANDARD_SALE"
          ? "Sale"
          : localizedMatch?.badge,
    pricing: bp.pricing ?? undefined,
    color:
      colorImages[0]?.colorName || localizedMatch?.color || (locale === "vi" ? "Đen" : "Black"),
    size: match ? match.size : "M",
    category:
      bp.categoryName ||
      (match
        ? match.category
        : bp.categoryId === 2
          ? "AO"
          : bp.categoryId === 3
            ? "QUAN"
            : "PHU KIEN"),
    categorySlug: bp.categorySlug ?? undefined,
    seoTitle: bp.seoTitle,
    seoDescription: bp.seoDescription,
    seoKeywords: bp.seoKeywords,
    material: bp.material,
    care: bp.care,
    shortDescription: bp.shortDescription,
    images: rawImages.map(resolveImageUrl),
    colorImages,
  };
}
