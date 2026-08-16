"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";

type ProfileTabId = "profile" | "orders" | "favourites" | "coupons" | "reviews";

const subTabs = [
  { id: "profile", labelKey: "storefront.nav.profile" },
  { id: "orders", labelKey: "storefront.nav.orders" },
  { id: "favourites", labelKey: "storefront.nav.favourites" },
  { id: "coupons", labelKey: "storefront.nav.coupons" },
  { id: "reviews", labelKey: "storefront.nav.reviews" },
] as const;

const getProfileTab = (tab: string | null): ProfileTabId =>
  subTabs.some((item) => item.id === tab) ? (tab as ProfileTabId) : "profile";

type ProfileNavigationProps = {
  activeTab?: ProfileTabId;
  withPageOffset?: boolean;
};

export function ProfileNavigation({ activeTab, withPageOffset = false }: ProfileNavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useI18n();

  const inferredActiveTab =
    pathname === "/coupons"
      ? "coupons"
      : pathname === "/reviews"
        ? "reviews"
        : pathname === "/profile"
          ? getProfileTab(searchParams.get("tab"))
          : null;
  const resolvedActiveTab = activeTab ?? inferredActiveTab;

  if (!resolvedActiveTab || isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <nav
      aria-label={t("storefront.account.navigation")}
      className={`no-scrollbar bg-canvas w-full overflow-x-auto select-none ${
        withPageOffset ? "pt-[104px] md:pt-[120px]" : ""
      }`}
    >
      <div className="mx-auto flex w-full min-w-max justify-center gap-8 px-6 py-4 md:gap-12 md:px-16">
        {subTabs.map((tab) => {
          const href =
            tab.id === "coupons" || tab.id === "reviews" ? `/${tab.id}` : `/profile?tab=${tab.id}`;
          const isActive = tab.id === resolvedActiveTab;

          return (
            <Link
              key={tab.id}
              href={href}
              className={`group relative cursor-pointer pb-0.5 text-sm font-medium tracking-[0.05em] transition-colors ${
                isActive ? "text-[#b5573a]" : "text-[#55423d]/60 hover:text-[#1c1a18]"
              }`}
            >
              {t(tab.labelKey)}
              <span
                className={`absolute bottom-[-1px] left-[10%] h-[1.5px] w-[80%] origin-center bg-[#b5573a] transition-transform duration-300 ease-out ${
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AccountContentLoadingFallback() {
  const { t } = useI18n();

  return (
    <div
      aria-busy="true"
      aria-label={t("storefront.account.loading")}
      className="bg-canvas min-h-[calc(100dvh-172px)]"
    />
  );
}
