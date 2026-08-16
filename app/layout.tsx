import type { Metadata } from "next";
import { cookies } from "next/headers";
import React from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { QueryProvider } from "@/components/providers/query-provider";

import Script from "next/script";

import { LOCALE_BOOTSTRAP_SCRIPT, LOCALE_COOKIE_KEY, parseLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "VELA WEAR",
  description: "Editorial fashion commerce experience for VELA WEAR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-locale="vi" className="h-full antialiased" suppressHydrationWarning>
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
