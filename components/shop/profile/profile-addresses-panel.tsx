"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { useI18n } from "@/components/providers/i18n-provider";
import type { UserAddress } from "@/lib/api/types";
import { useDeleteMyAddressMutation, useUpdateMyAddressMutation } from "@/lib/queries/commerce";
import { toast } from "sonner";
import { formatAddress } from "./profile-formatters";
import { ProfileAddressesLoadingFallback } from "./profile-loading";
import { AddressModal } from "./address-modal";

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
  const deleteMutation = useDeleteMyAddressMutation();
  const updateMutation = useUpdateMyAddressMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const addresses = addressesQuery.data?.result ?? [];

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (address: UserAddress) => {
    if (!window.confirm(t("account.addresses.deleteConfirm"))) {
      return;
    }
    setDeletingId(address.id);
    try {
      await deleteMutation.mutateAsync(address.id);
      toast.success(t("account.addresses.deleteSuccess"));
    } catch {
      toast.error(t("account.addresses.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (address: UserAddress) => {
    if (address.isDefault) return;
    try {
      await updateMutation.mutateAsync({
        id: address.id,
        request: {
          receiverName: address.receiverName,
          phone: address.phone,
          province: address.province,
          ward: address.ward,
          addressDetail: address.addressDetail,
          isDefault: true,
        },
      });
      toast.success(t("account.addresses.updateSuccess"));
    } catch {
      toast.error(t("account.addresses.saveError"));
    }
  };

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

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-ink font-serif text-xl font-light">{t("account.addresses.title")}</h3>
          {addresses.length > 0 && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-[#1c1a18] px-4 py-2 text-xs font-semibold tracking-wider text-[#1c1a18] uppercase transition-colors hover:bg-[#1c1a18] hover:text-white"
            >
              <Plus className="size-3.5" />
              <span>{t("account.addresses.addNew")}</span>
            </button>
          )}
        </div>

        {addresses.length === 0 ? (
          <div className="bg-surface-card/30 flex flex-col items-center gap-6 rounded-md border border-[#1c1a18]/15 py-16 text-center">
            <p className="text-ink/70 max-w-md text-sm font-light">
              {t("account.addresses.empty")}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-[#1c1a18] px-8 py-3 text-xs font-semibold tracking-widest text-[#1c1a18] uppercase transition-colors hover:bg-[#1c1a18] hover:text-white"
            >
              <Plus className="size-3.5" />
              <span>{t("account.addresses.add")}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-surface-card/30 rounded-md border border-[#1c1a18]/15 p-5 transition-shadow hover:shadow-xs"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-ink text-sm font-semibold">{address.receiverName}</h4>
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

                  <div className="flex flex-wrap items-center gap-2 sm:self-start">
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-[#1c1a18]/20 px-3 py-1.5 text-xs font-medium text-[#1c1a18] transition-colors hover:border-[#1c1a18] hover:bg-black/5"
                        title={t("account.addresses.setDefault")}
                      >
                        <CheckCircle2 className="size-3.5 text-[#55423d]" />
                        <span>{t("account.addresses.default")}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(address)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-[#1c1a18]/20 px-3 py-1.5 text-xs font-medium text-[#1c1a18] transition-colors hover:border-[#1c1a18] hover:bg-black/5"
                      title={t("account.addresses.edit")}
                    >
                      <Edit2 className="size-3.5" />
                      <span>{t("account.addresses.edit")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(address)}
                      disabled={deletingId === address.id}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      title={t("account.addresses.delete")}
                    >
                      <Trash2 className="size-3.5" />
                      <span>
                        {deletingId === address.id
                          ? t("account.addresses.deleting")
                          : t("account.addresses.delete")}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addressToEdit={editingAddress}
      />
    </>
  );
}
