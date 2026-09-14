import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  CachedProfileNavigation,
  PersonalizedRouteBoundary,
} from "@/components/shop/cached-shop-chrome";

export const metadata: Metadata = {
  title: "Tài Khoản Cá Nhân",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CachedProfileNavigation />
      <PersonalizedRouteBoundary>{children}</PersonalizedRouteBoundary>
    </>
  );
}
