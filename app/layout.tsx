import type { Metadata } from "next";
import { cookies } from "next/headers";
import React from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { QueryProvider } from "@/components/providers/query-provider";

import Script from "next/script";

import { LOCALE_BOOTSTRAP_SCRIPT, LOCALE_COOKIE_KEY, parseLocale } from "@/lib/i18n";
import "./globals.css";

function getSafeBaseUrl(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || "https://velawear.com");
  } catch {
    return new URL("https://velawear.com");
  }
}

const siteUrl = getSafeBaseUrl();
const baseUrl = siteUrl.toString().replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "VELA WEAR | Thời Trang Thiết Kế Cao Cấp",
    template: "%s | VELA WEAR",
  },
  description:
    "Khám phá bộ sưu tập thời trang thiết kế cao cấp VELA WEAR. Tinh tế trong từng đường kim mũi chỉ, tôn vinh phong cách bền vững và hiện đại.",
  keywords: [
    "VELA WEAR",
    "thời trang thiết kế",
    "thời trang cao cấp",
    "thời trang nữ",
    "linen blazer",
    "lụa tự nhiên",
    "thời trang bền vững",
    "editorial fashion",
  ],
  authors: [{ name: "VELA WEAR" }],
  creator: "VELA WEAR",
  publisher: "VELA WEAR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: baseUrl,
    siteName: "VELA WEAR",
    title: "VELA WEAR | Thời Trang Thiết Kế Cao Cấp",
    description:
      "Khám phá bộ sưu tập thời trang thiết kế cao cấp VELA WEAR. Tinh tế trong từng đường kim mũi chỉ, chất liệu tự nhiên bền vững.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "VELA WEAR - Thời Trang Thiết Kế Cao Cấp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VELA WEAR | Thời Trang Thiết Kế Cao Cấp",
    description:
      "Khám phá bộ sưu tập thời trang thiết kế cao cấp VELA WEAR. Tinh tế trong từng đường kim mũi chỉ, chất liệu tự nhiên bền vững.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VELA WEAR",
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  sameAs: ["https://facebook.com/velawear", "https://instagram.com/velawear"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: "support@velawear.com",
    availableLanguage: ["vi", "en"],
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VELA WEAR",
  url: baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-locale="vi" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <Script
          id="locale-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: LOCALE_BOOTSTRAP_SCRIPT }}
        />
        <React.Suspense fallback={null}>
          <LocalizedAppProviders>{children}</LocalizedAppProviders>
        </React.Suspense>
      </body>
    </html>
  );
}

async function LocalizedAppProviders({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialLocale = parseLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value);

  return (
    <QueryProvider>
      <I18nProvider initialLocale={initialLocale}>
        <AuthProvider>{children}</AuthProvider>
      </I18nProvider>
    </QueryProvider>
  );
}
