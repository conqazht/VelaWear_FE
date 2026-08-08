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
      <div className="py-16 text-center flex flex-col items-center gap-6 bg-surface-card/30 border border-[#1c1a18]/15 rounded-md">
        <p className="text-sm text-ink/70 font-light max-w-md">
          {t("account.addresses.empty")}
        </p>
        <button className="inline-flex py-3.5 px-10 rounded-sm border border-[#1c1a18] text-xs font-semibold uppercase tracking-widest text-[#1c1a18] hover:bg-[#1c1a18] hover:text-white transition-colors cursor-pointer">
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
          className="rounded-md border border-[#1c1a18]/15 bg-surface-card/30 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">
                  {address.receiverName}
                </h3>
                {address.isDefault && (
                  <span className="rounded bg-[#1c1a18] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {t("account.addresses.default")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink/65">
                {address.phone ?? t("account.addresses.noPhone")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {formatAddress(address) || t("account.addresses.noAddress")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
