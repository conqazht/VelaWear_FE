import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/vela-data";
import { serverApiGet } from "@/lib/api/server";

interface CatalogProductItem {
  id: number;
  slug?: string;
  updatedAt?: string;
}

interface PaginatedProductsResponse {
  result: CatalogProductItem[];
}

async function getSitemapProducts(): Promise<Array<{ id: string | number; lastModified?: Date }>> {
  try {
    const data = await serverApiGet<PaginatedProductsResponse>("/products", {
      query: { page: 1, size: 100 },
      next: { revalidate: 3600 },
    });

    if (data?.result && Array.isArray(data.result) && data.result.length > 0) {
      return data.result.map((item) => ({
        id: item.slug || item.id,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
      }));
    }
  } catch {
    // Fall back to static fixtures when offline or during build
  }

  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://velawear.com";
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sale`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/flash-sale`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/size-guide`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const products = await getSitemapProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.lastModified ?? lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
