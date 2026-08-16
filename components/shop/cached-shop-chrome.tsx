import { Suspense, type ReactNode } from "react";
import { cacheLife } from "next/cache";
import { connection } from "next/server";

import {
  AccountContentLoadingFallback,
  ProfileNavigation,
} from "@/components/shop/profile-navigation";
import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";

/**
 * These boundaries cache the stable RSC payload for the shop chrome. The
 * interactive header, footer route mode, and active profile tab still hydrate
 * as Client Components, so account-specific state is never stored here.
 */
export async function CachedSiteHeader() {
  "use cache";
  cacheLife("max");

  return <SiteHeader />;
}

export async function CachedSiteFooter() {
  "use cache";
  cacheLife("max");

  return <SiteFooter />;
}

export async function CachedProfileNavigation() {
  "use cache";
  cacheLife("max");

  return (
    <Suspense fallback={null}>
      <ProfileNavigation withPageOffset />
    </Suspense>
  );
}

/**
 * Keep personalized account content out of the prerendered shell. The route's
 * own route-specific loading skeleton takes over as soon as the request-time
 * Client Component tree is streamed, while cached shop chrome can be sent first.
 */
export function PersonalizedRouteBoundary({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AccountContentLoadingFallback />}>
      <RequestTimeAccountContent>{children}</RequestTimeAccountContent>
    </Suspense>
  );
}

async function RequestTimeAccountContent({ children }: { children: ReactNode }) {
  await connection();
  return children;
}
