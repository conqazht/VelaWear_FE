import type { ReactNode } from "react";

import {
  CachedProfileNavigation,
  PersonalizedRouteBoundary,
} from "@/components/shop/cached-shop-chrome";

export const instant = false;

export default function CouponsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CachedProfileNavigation />
      <PersonalizedRouteBoundary>{children}</PersonalizedRouteBoundary>
    </>
  );
}
