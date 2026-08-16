"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useCart } from "@/components/shop/cart-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import {
  useMyAddressesQuery,
  useMyOrdersQuery,
} from "@/lib/queries/commerce";
import { getProfileTabId } from "@/components/shop/profile/profile-formatters";
import { ProfileTabLoading } from "@/components/shop/profile/profile-loading";
import { ProfileShell } from "@/components/shop/profile/profile-shell";
import { ProfileAccountPanel } from "@/components/shop/profile/profile-account-panel";
import { ProfileOrdersTab } from "@/components/shop/profile/profile-orders-tab";
import { ProfileFavoritesTab } from "@/components/shop/profile/profile-favorites-tab";

export default function MemberProfile() {
  const { user, isAuthenticated, isLoading: isAuthLoading, checkSession } = useAuth();
  const { t } = useI18n();
  const {
    favorites,
    toggleFavorite,
    isLoading: favoritesLoading,
    error: favoritesError,
    retry: retryFavorites,
  } = useFavorites();
  const { addToCart } = useCart();
  const { showAddedToBag } = useNotification();

  const searchParams = useSearchParams();
  const activeSubTab = getProfileTabId(searchParams.get("tab"));
  const [activeProfileSidebarTab, setActiveProfileSidebarTab] = useState("account");

  const userId = user?.id;
  const isOrdersEnabled = isAuthenticated && activeSubTab === "orders";
  const isAddressesEnabled =
    isAuthenticated && activeSubTab === "profile" && activeProfileSidebarTab === "delivery";

  const ordersQuery = useMyOrdersQuery(
    userId,
    {
      size: 100,
      sort: "createdAt,desc",
    },
    isOrdersEnabled
  );
  const addressesQuery = useMyAddressesQuery(
    userId,
    { size: 100 },
    isAddressesEnabled
  );

  if (isAuthLoading) {
    return <ProfileTabLoading tab={activeSubTab} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-24 min-h-[70vh] flex flex-col justify-center items-center">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-sm border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b5573a]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            {t("account.signIn.profileTitle")}
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            {t("account.signIn.profileDescription")}
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b5573a]"
          >
            {t("account.signIn.action")}
          </Link>
        </Card>
      </div>
    );
  }

  if (activeSubTab === "orders" && ordersQuery.isError && !ordersQuery.data) {
    return (
      <StorefrontApiStatus
        error={ordersQuery.error}
        onRetry={() => void ordersQuery.refetch()}
        resourceLabel={t("account.orders.resource")}
        returnHref="/collection"
        variant="route"
      />
    );
  }

  return (
    <ProfileShell activeTab={activeSubTab}>
      {activeSubTab === "profile" && (
        <ProfileAccountPanel
          user={user}
          checkSession={checkSession}
          addressesQuery={addressesQuery}
          activeSidebarTab={activeProfileSidebarTab}
          setActiveSidebarTab={setActiveProfileSidebarTab}
        />
      )}

      {activeSubTab === "orders" && (
        <ProfileOrdersTab ordersQuery={ordersQuery} />
      )}

      {activeSubTab === "favourites" && (
        <ProfileFavoritesTab
          favorites={favorites}
          favoritesLoading={favoritesLoading}
          favoritesError={favoritesError}
          retryFavorites={retryFavorites}
          toggleFavorite={toggleFavorite}
          addToCart={addToCart}
          showAddedToBag={showAddedToBag}
        />
      )}
    </ProfileShell>
  );
}
