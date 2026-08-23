"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/components/providers/i18n-provider";
import { useCreateMyAddressMutation, useUpdateMyAddressMutation } from "@/lib/queries/commerce";
import type { UserAddress } from "@/lib/api/types";
import {
  getVietnamProvinces,
  getVietnamWards,
  type VietnamProvince,
  type VietnamWard,
} from "@/lib/vietnam-address-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: UserAddress | null;
}

export function AddressModal({ isOpen, onClose, addressToEdit }: AddressModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-canvas text-ink w-full max-w-[calc(100%-2rem)] rounded-md border border-[#e4dacf] p-6 shadow-xl sm:max-w-2xl sm:p-8">
        {isOpen ? (
          <AddressModalForm
            key={addressToEdit?.id ?? "new"}
            addressToEdit={addressToEdit}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AddressModalForm({
  addressToEdit,
  onClose,
}: {
  addressToEdit?: UserAddress | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const createMutation = useCreateMyAddressMutation();
  const updateMutation = useUpdateMyAddressMutation();

  const [receiverName, setReceiverName] = useState(addressToEdit?.receiverName ?? "");
  const [phone, setPhone] = useState(addressToEdit?.phone ?? "");
  const [provinces, setProvinces] = useState<VietnamProvince[]>([]);
  const [wards, setWards] = useState<VietnamWard[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
  const [selectedWardCode, setSelectedWardCode] = useState<string>("");
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [addressDetail, setAddressDetail] = useState(addressToEdit?.addressDetail ?? "");
  const [isDefault, setIsDefault] = useState(Boolean(addressToEdit?.isDefault));

  const [errors, setErrors] = useState<{
    receiverName?: string;
    phone?: string;
    province?: string;
    ward?: string;
    addressDetail?: string;
  }>({});

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Load provinces on mount
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getVietnamProvinces(controller.signal)
      .then((data) => {
        if (!active) return;
        setProvinces(data);
        setIsLoadingProvinces(false);

        if (addressToEdit?.province) {
          const matchedProvince = data.find(
            (p) =>
              p.name.toLowerCase() === addressToEdit.province.toLowerCase() ||
              p.codename.toLowerCase() === addressToEdit.province.toLowerCase(),
          );
          if (matchedProvince) {
            setSelectedProvinceCode(String(matchedProvince.code));
            setIsLoadingWards(true);
          }
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setIsLoadingProvinces(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [addressToEdit?.province]);

  // Load wards when province changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      return;
    }

    const controller = new AbortController();
    let active = true;

    getVietnamWards(Number(selectedProvinceCode), controller.signal)
      .then((data) => {
        if (!active) return;
        setWards(data);
        setIsLoadingWards(false);

        if (addressToEdit?.ward) {
          const matchedWard = data.find(
            (w) =>
              w.name.toLowerCase() === addressToEdit.ward.toLowerCase() ||
              w.codename.toLowerCase() === addressToEdit.ward.toLowerCase(),
          );
          if (matchedWard) {
            setSelectedWardCode(String(matchedWard.code));
          }
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setWards([]);
        setIsLoadingWards(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedProvinceCode, addressToEdit?.ward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!receiverName.trim() || receiverName.trim().length < 2) {
      newErrors.receiverName = t("account.addresses.receiverNameRequired");
    }

    if (!phone.trim() || phone.trim().length < 8) {
      newErrors.phone = t("account.addresses.phoneInvalid");
    }

    const selectedProvince = provinces.find((p) => String(p.code) === selectedProvinceCode);
    if (!selectedProvinceCode || !selectedProvince) {
      newErrors.province = t("account.addresses.provinceRequired");
    }

    const selectedWard = wards.find((w) => String(w.code) === selectedWardCode);
    if (!selectedWardCode || !selectedWard) {
      newErrors.ward = t("account.addresses.wardRequired");
    }

    if (!addressDetail.trim() || addressDetail.trim().length < 2) {
      newErrors.addressDetail = t("account.addresses.addressDetailRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      receiverName: receiverName.trim(),
      phone: phone.trim(),
      province: selectedProvince!.name,
      ward: selectedWard!.name,
      addressDetail: addressDetail.trim(),
      isDefault,
    };

    try {
      if (addressToEdit) {
        await updateMutation.mutateAsync({
          id: addressToEdit.id,
          request: payload,
        });
        toast.success(t("account.addresses.updateSuccess"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("account.addresses.createSuccess"));
      }
      onClose();
    } catch {
      toast.error(t("account.addresses.saveError"));
    }
  };

  return (
    <>
      <DialogHeader className="mb-3 text-left">
        <DialogTitle className="text-ink font-serif text-2xl font-light tracking-tight">
          {addressToEdit ? t("account.addresses.editTitle") : t("account.addresses.createTitle")}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        {/* Receiver Full Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="modalReceiverName"
            className="text-xs font-semibold tracking-wider text-[#1c1a18]/80 uppercase"
          >
            {t("account.addresses.receiverName")}
          </label>
          <input
            id="modalReceiverName"
            type="text"
            value={receiverName}
            onChange={(e) => {
              setReceiverName(e.target.value);
              if (errors.receiverName) {
                setErrors((prev) => ({ ...prev, receiverName: undefined }));
              }
            }}
            placeholder={t("account.addresses.receiverNamePlaceholder")}
            className={cn(
              "w-full rounded-sm border bg-white/70 px-3.5 py-2.5 text-sm text-[#1c1a18] transition-colors placeholder:text-[#1c1a18]/40 focus:bg-white focus:outline-none",
              errors.receiverName
                ? "border-red-500 focus:border-red-500"
                : "border-[#1c1a18]/20 focus:border-[#1c1a18]",
            )}
          />
          {errors.receiverName && (
            <p className="text-xs font-medium text-red-500">{errors.receiverName}</p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="modalPhone"
            className="text-xs font-semibold tracking-wider text-[#1c1a18]/80 uppercase"
          >
            {t("account.addresses.phone")}
          </label>
          <input
            id="modalPhone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) {
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }
            }}
            placeholder={t("account.addresses.phonePlaceholder")}
            className={cn(
              "w-full rounded-sm border bg-white/70 px-3.5 py-2.5 text-sm text-[#1c1a18] transition-colors placeholder:text-[#1c1a18]/40 focus:bg-white focus:outline-none",
              errors.phone
                ? "border-red-500 focus:border-red-500"
                : "border-[#1c1a18]/20 focus:border-[#1c1a18]",
            )}
          />
          {errors.phone && <p className="text-xs font-medium text-red-500">{errors.phone}</p>}
        </div>

        {/* Province & Ward API Selects */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {/* Province / City Select */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="modalProvince"
              className="text-xs font-semibold tracking-wider text-[#1c1a18]/80 uppercase"
            >
              {t("account.addresses.province")}
            </label>
            <select
              id="modalProvince"
              value={selectedProvinceCode}
              onChange={(e) => {
                setSelectedProvinceCode(e.target.value);
                setSelectedWardCode("");
                if (errors.province) {
                  setErrors((prev) => ({ ...prev, province: undefined }));
                }
              }}
              disabled={isLoadingProvinces}
              className={cn(
                "w-full rounded-sm border bg-white/70 px-3.5 py-2.5 text-sm text-[#1c1a18] transition-colors focus:bg-white focus:outline-none disabled:opacity-60",
                errors.province
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#1c1a18]/20 focus:border-[#1c1a18]",
                !selectedProvinceCode && "text-[#1c1a18]/40",
              )}
            >
              <option value="" className="text-[#1c1a18]/40">
                {isLoadingProvinces
                  ? t("account.addresses.loadingProvinces")
                  : t("account.addresses.selectProvince")}
              </option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code} className="text-[#1c1a18]">
                  {province.name}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="text-xs font-medium text-red-500">{errors.province}</p>
            )}
          </div>

          {/* Ward / District Select */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="modalWard"
              className="text-xs font-semibold tracking-wider text-[#1c1a18]/80 uppercase"
            >
              {t("account.addresses.ward")}
            </label>
            <select
              id="modalWard"
              value={selectedWardCode}
              onChange={(e) => {
                setSelectedWardCode(e.target.value);
                if (errors.ward) {
                  setErrors((prev) => ({ ...prev, ward: undefined }));
                }
              }}
              disabled={!selectedProvinceCode || isLoadingWards}
              className={cn(
                "w-full rounded-sm border bg-white/70 px-3.5 py-2.5 text-sm text-[#1c1a18] transition-colors focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
                errors.ward
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#1c1a18]/20 focus:border-[#1c1a18]",
                !selectedWardCode && "text-[#1c1a18]/40",
              )}
            >
              <option value="" className="text-[#1c1a18]/40">
                {isLoadingWards
                  ? t("account.addresses.loadingWards")
                  : t("account.addresses.selectWard")}
              </option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code} className="text-[#1c1a18]">
                  {ward.name}
                </option>
              ))}
            </select>
            {errors.ward && <p className="text-xs font-medium text-red-500">{errors.ward}</p>}
          </div>
        </div>

        {/* Detailed Street Address */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="modalAddressDetail"
            className="text-xs font-semibold tracking-wider text-[#1c1a18]/80 uppercase"
          >
            {t("account.addresses.addressDetail")}
          </label>
          <textarea
            id="modalAddressDetail"
            rows={2}
            value={addressDetail}
            onChange={(e) => {
              setAddressDetail(e.target.value);
              if (errors.addressDetail) {
                setErrors((prev) => ({ ...prev, addressDetail: undefined }));
              }
            }}
            placeholder={t("account.addresses.addressDetailPlaceholder")}
            className={cn(
              "w-full resize-none rounded-sm border bg-white/70 px-3.5 py-2.5 text-sm text-[#1c1a18] transition-colors placeholder:text-[#1c1a18]/40 focus:bg-white focus:outline-none",
              errors.addressDetail
                ? "border-red-500 focus:border-red-500"
                : "border-[#1c1a18]/20 focus:border-[#1c1a18]",
            )}
          />
          {errors.addressDetail && (
            <p className="text-xs font-medium text-red-500">{errors.addressDetail}</p>
          )}
        </div>

        {/* Default Switch */}
        <div className="mt-1 flex items-center gap-3">
          <Checkbox
            id="modalIsDefault"
            checked={isDefault}
            onCheckedChange={(checked) => setIsDefault(!!checked)}
            className="size-4.5 rounded-[4px] border-[#1c1a18]/30 data-checked:border-[#b5573a] data-checked:bg-[#b5573a]"
          />
          <label
            htmlFor="modalIsDefault"
            className="cursor-pointer text-xs font-medium text-[#55423d] select-none sm:text-sm"
          >
            {t("account.addresses.setDefault")}
          </label>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-sm border border-[#1c1a18]/20 bg-transparent px-5 py-2.5 text-xs font-semibold tracking-wider text-[#1c1a18] uppercase transition-colors hover:bg-black/5 disabled:opacity-50"
          >
            {t("account.addresses.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-w-[130px] cursor-pointer items-center justify-center rounded-sm border border-[#1c1a18] bg-[#1c1a18] px-6 py-2.5 text-xs font-semibold tracking-wider whitespace-nowrap text-white uppercase shadow-sm transition-colors hover:border-[#b5573a] hover:bg-[#b5573a] disabled:opacity-50"
          >
            {isSubmitting
              ? t("account.addresses.saving")
              : addressToEdit
                ? t("account.addresses.save")
                : t("account.addresses.addNew")}
          </button>
        </div>
      </form>
    </>
  );
}
