import React from "react";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { useI18n } from "@/components/providers/i18n-provider";
import type { UserAddress } from "@/lib/api/types";
import { formatAddress } from "./profile-formatters";
import { ProfileAddressesLoadingFallback } from "./profile-loading";

interface ProfileAddressesPanelProps {
  addressesQuery: {
    data?: { result: UserAddress[] };
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
}

export function ProfileAddressesPanel({ addressesQuery }: ProfileAddressesPanelProps) {
  const { t } = useI18n();
  const addresses = addressesQuery.data?.result ?? [];

  if (addressesQuery.isLoading) {
    return <ProfileAddressesLoadingFallback />;
  }

  if (addressesQuery.isError) {
    return (
      <StorefrontApiStatus
        error={addressesQuery.error}
        onRetry={() => void addressesQuery.refetch()}
        resourceLabel={t("account.addresses.resource")}
        returnHref="/collection"
        variant="panel"
      />
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="bg-surface-card/30 flex flex-col items-center gap-6 rounded-md border border-[#1c1a18]/15 py-16 text-center">
        <p className="text-ink/70 max-w-md text-sm font-light">{t("account.addresses.empty")}</p>
        <button className="inline-flex cursor-pointer rounded-sm border border-[#1c1a18] px-10 py-3.5 text-xs font-semibold tracking-widest text-[#1c1a18] uppercase transition-colors hover:bg-[#1c1a18] hover:text-white">
          {t("account.addresses.add")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="bg-surface-card/30 rounded-md border border-[#1c1a18]/15 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-ink text-sm font-semibold">{address.receiverName}</h3>
                {address.isDefault && (
                  <span className="rounded bg-[#1c1a18] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase">
                    {t("account.addresses.default")}
                  </span>
                )}
              </div>
              <p className="text-ink/65 mt-1 text-sm">
                {address.phone ?? t("account.addresses.noPhone")}
              </p>
              <p className="text-ink/70 mt-2 text-sm leading-relaxed">
                {formatAddress(address) || t("account.addresses.noAddress")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
