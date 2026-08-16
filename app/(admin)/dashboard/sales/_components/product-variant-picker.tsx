"use client";

import { useState } from "react";
import { Package, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SaleCampaignType } from "@/lib/api/admin-sales";
import type { AdminProductVariant } from "@/lib/api/admin-commerce";

import { productVariantToFormItem, type SaleCampaignFormItem } from "../_data/sale-campaign-form";

type BulkPriceMode = "PERCENTAGE" | "FIXED_PRICE";

type ProductVariantPickerProps = {
  type: SaleCampaignType;
  availableVariants: AdminProductVariant[];
  items: SaleCampaignFormItem[];
  onChange: (items: SaleCampaignFormItem[]) => void;
  disabled: boolean;
  isLoading: boolean;
  error: string | null;
};

type VariantGroup = {
  productId: number;
  productName: string;
  variants: AdminProductVariant[];
};

function optionLabel(
  item: {
    colorName?: string | null;
    sizeName?: string | null;
  },
  defaultLabel: string,
) {
  return [item.colorName, item.sizeName].filter(Boolean).join(" / ") || defaultLabel;
}

export function ProductVariantPicker({
  type,
  availableVariants,
  items,
  onChange,
  disabled,
  isLoading,
  error,
}: ProductVariantPickerProps) {
  const { locale, t } = useI18n();
  const [searchValue, setSearchValue] = useState("");
  const [bulkMode, setBulkMode] = useState<BulkPriceMode>("PERCENTAGE");
  const [bulkValue, setBulkValue] = useState("10");
  const normalizedSearch = searchValue.trim().toLowerCase();
  const selectedVariantIds = new Set(items.map((item) => item.variantId));
  const groupsByProduct = new Map<number, VariantGroup>();

  for (const variant of availableVariants) {
    const matchesSearch =
      !normalizedSearch ||
      variant.product.name.toLowerCase().includes(normalizedSearch) ||
      variant.sku.toLowerCase().includes(normalizedSearch) ||
      variant.color?.name.toLowerCase().includes(normalizedSearch) ||
      variant.size?.name.toLowerCase().includes(normalizedSearch);
    if (!matchesSearch) continue;

    const existing = groupsByProduct.get(variant.product.id);
    if (existing) {
      existing.variants.push(variant);
    } else {
      groupsByProduct.set(variant.product.id, {
        productId: variant.product.id,
        productName: variant.product.name,
        variants: [variant],
      });
    }
  }

  const groups = Array.from(groupsByProduct.values()).sort((left, right) =>
    left.productName.localeCompare(right.productName, locale),
  );

  function toggleVariant(variant: AdminProductVariant, checked: boolean) {
    if (checked) {
      if (selectedVariantIds.has(variant.id)) return;
      onChange([...items, productVariantToFormItem(variant, type)]);
      return;
    }
    onChange(items.filter((item) => item.variantId !== variant.id));
  }

  function toggleProduct(group: VariantGroup, checked: boolean) {
    const groupIds = new Set(group.variants.map((variant) => variant.id));
    if (!checked) {
      onChange(items.filter((item) => !groupIds.has(item.variantId)));
      return;
    }

    const additions = group.variants
      .filter((variant) => !selectedVariantIds.has(variant.id))
      .map((variant) => productVariantToFormItem(variant, type));
    onChange([...items, ...additions]);
  }

  function updateItem(variantId: number, patch: Partial<SaleCampaignFormItem>) {
    onChange(items.map((item) => (item.variantId === variantId ? { ...item, ...patch } : item)));
  }

  function applyBulkPrice() {
    const value = Number(bulkValue);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error(t("admin.sales.management.picker.bulkPositive"));
      return;
    }
    if (bulkMode === "PERCENTAGE" && value >= 100) {
      toast.error(t("admin.sales.management.picker.bulkPercentageRange"));
      return;
    }

    onChange(
      items.map((item) => {
        const rawPrice =
          bulkMode === "PERCENTAGE" ? item.referencePrice * (1 - value / 100) : value;
        const promotionalPrice = Math.max(1, Math.round(rawPrice / 1_000) * 1_000);
        return { ...item, promotionalPrice: String(promotionalPrice) };
      }),
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-heading font-medium">
              {t("admin.sales.management.picker.chooseTitle")}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("admin.sales.management.picker.chooseDescription")}
            </p>
          </div>
          <Badge variant="secondary">
            {t("admin.sales.management.picker.selectedCount", {
              count: items.length,
            })}
          </Badge>
        </div>

        <InputGroup className="w-full sm:max-w-md">
          <InputGroupAddon align="inline-start">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t("admin.sales.management.picker.searchPlaceholder")}
            aria-label={t("admin.sales.management.picker.searchAria")}
          />
        </InputGroup>

        {error ? (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
            {error}
          </p>
        ) : null}

        <div className="max-h-[32rem] overflow-y-auto rounded-lg border">
          {isLoading ? (
            <p className="text-muted-foreground p-6 text-center text-sm">
              {t("admin.sales.management.picker.loading")}
            </p>
          ) : groups.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center text-sm">
              {t("admin.sales.management.picker.empty")}
            </p>
          ) : (
            <div className="divide-y">
              {groups.map((group) => {
                const selectedCount = group.variants.filter((variant) =>
                  selectedVariantIds.has(variant.id),
                ).length;
                const allSelected =
                  group.variants.length > 0 && selectedCount === group.variants.length;

                return (
                  <section key={group.productId}>
                    <label className="bg-muted/40 flex cursor-pointer items-center gap-3 px-4 py-3">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => toggleProduct(group, Boolean(checked))}
                        disabled={disabled}
                        aria-label={t("admin.sales.management.picker.selectAllAria", {
                          name: group.productName,
                        })}
                      />
                      <Package className="text-muted-foreground size-4" />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {group.productName}
                      </span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {selectedCount}/{group.variants.length}
                      </span>
                    </label>
                    <div className="divide-y">
                      {group.variants.map((variant) => (
                        <label
                          key={variant.id}
                          className="hover:bg-muted/30 flex cursor-pointer items-center gap-3 px-4 py-3 pl-11"
                        >
                          <Checkbox
                            checked={selectedVariantIds.has(variant.id)}
                            onCheckedChange={(checked) => toggleVariant(variant, Boolean(checked))}
                            disabled={disabled}
                            aria-label={t("admin.sales.management.picker.selectVariantAria", {
                              sku: variant.sku,
                            })}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-mono text-xs">{variant.sku}</span>
                            <span className="text-muted-foreground block text-xs">
                              {optionLabel(
                                {
                                  colorName: variant.color?.name,
                                  sizeName: variant.size?.name,
                                },
                                t("admin.sales.management.picker.defaultOption"),
                              )}
                            </span>
                          </span>
                          <span className="text-sm font-medium whitespace-nowrap tabular-nums">
                            {formatCurrency(variant.price, locale)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-heading font-medium">
              {t("admin.sales.management.picker.pricingTitle")}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("admin.sales.management.picker.pricingDescription")}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={bulkMode}
              onValueChange={(value) => setBulkMode(value as BulkPriceMode)}
              disabled={disabled || items.length === 0}
            >
              <SelectTrigger
                className="sm:w-44"
                aria-label={t("admin.sales.management.picker.bulkModeAria")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false}>
                <SelectItem value="PERCENTAGE">
                  {t("admin.sales.management.picker.discountPercent")}
                </SelectItem>
                <SelectItem value="FIXED_PRICE">
                  {t("admin.sales.management.picker.fixedPrice")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="sm:w-36"
              type="number"
              min="1"
              max={bulkMode === "PERCENTAGE" ? "99" : undefined}
              step={bulkMode === "PERCENTAGE" ? "1" : "1000"}
              value={bulkValue}
              onChange={(event) => setBulkValue(event.target.value)}
              disabled={disabled || items.length === 0}
              aria-label={
                bulkMode === "PERCENTAGE"
                  ? t("admin.sales.management.picker.bulkPercentageAria")
                  : t("admin.sales.management.picker.bulkFixedPriceAria")
              }
            />
            <Button
              type="button"
              variant="outline"
              onClick={applyBulkPrice}
              disabled={disabled || items.length === 0}
            >
              {t("admin.sales.management.picker.applySelected")}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table className={type === "FLASH" ? "min-w-[1050px]" : "min-w-[760px]"}>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.sales.management.picker.column.productVariant")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.sales.management.picker.column.referencePrice")}
                </TableHead>
                <TableHead className="w-48">
                  {t("admin.sales.management.picker.column.salePrice")}
                </TableHead>
                {type === "FLASH" ? (
                  <>
                    <TableHead className="w-36">
                      {t("admin.sales.management.picker.column.quota")}
                    </TableHead>
                    <TableHead className="w-44">
                      {t("admin.sales.management.picker.column.customerLimit")}
                    </TableHead>
                    <TableHead>{t("admin.sales.management.picker.column.used")}</TableHead>
                  </>
                ) : null}
                <TableHead className="w-12">
                  <span className="sr-only">
                    {t("admin.sales.management.picker.column.remove")}
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={type === "FLASH" ? 7 : 4}
                    className="text-muted-foreground h-28 text-center"
                  >
                    {t("admin.sales.management.picker.selectPrompt")}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.variantId}>
                    <TableCell>
                      <p className="max-w-64 truncate font-medium">{item.productName}</p>
                      <p className="text-muted-foreground text-xs">
                        <span className="font-mono">{item.sku}</span> ·{" "}
                        {optionLabel(item, t("admin.sales.management.picker.defaultOption"))}
                      </p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.referencePrice, locale)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        max={Math.max(1, item.referencePrice - 1)}
                        step="1000"
                        value={item.promotionalPrice}
                        onChange={(event) =>
                          updateItem(item.variantId, {
                            promotionalPrice: event.target.value,
                          })
                        }
                        disabled={disabled}
                        aria-label={t("admin.sales.management.picker.salePriceAria", {
                          sku: item.sku,
                        })}
                      />
                    </TableCell>
                    {type === "FLASH" ? (
                      <>
                        <TableCell>
                          <Input
                            type="number"
                            min={Math.max(1, item.reservedQuantity + item.soldQuantity)}
                            step="1"
                            value={item.quota}
                            onChange={(event) =>
                              updateItem(item.variantId, { quota: event.target.value })
                            }
                            disabled={disabled}
                            aria-label={t("admin.sales.management.picker.quotaAria", {
                              sku: item.sku,
                            })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder={t("admin.sales.management.picker.noLimit")}
                            value={item.maxPerCustomer}
                            onChange={(event) =>
                              updateItem(item.variantId, {
                                maxPerCustomer: event.target.value,
                              })
                            }
                            disabled={disabled}
                            aria-label={t("admin.sales.management.picker.customerLimitAria", {
                              sku: item.sku,
                            })}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
                          {t("admin.sales.management.picker.usedBreakdown", {
                            reserved: item.reservedQuantity,
                            sold: item.soldQuantity,
                          })}
                        </TableCell>
                      </>
                    ) : null}
                    <TableCell>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() =>
                          onChange(
                            items.filter((selected) => selected.variantId !== item.variantId),
                          )
                        }
                        disabled={disabled}
                        aria-label={t("admin.sales.management.picker.removeAria", {
                          sku: item.sku,
                        })}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
