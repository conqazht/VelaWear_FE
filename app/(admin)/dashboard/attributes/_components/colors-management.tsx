"use client";

import { type FormEvent, useDeferredValue, useState } from "react";
import { Palette, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  type ManagementColumn,
  ResourcePage,
} from "@/app/(admin)/dashboard/_components/management/resource-page";
import {
  DeleteResourceDialog,
  ResourceFormSheet,
} from "@/app/(admin)/dashboard/_components/management/resource-overlays";
import {
  downloadCsv,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import type {
  AdminColor,
  CreateAdminColorRequest,
  UpdateAdminColorRequest,
} from "@/lib/api/admin-commerce";
import {
  useAdminColorsQuery,
  useCreateAdminColorMutation,
  useDeleteAdminColorMutation,
  useUpdateAdminColorMutation,
} from "@/lib/queries/admin-commerce";

import { ColorForm, EMPTY_COLOR_FORM, type ColorFormValues } from "./color-form";

const HEX_CODE_PATTERN = /^#[0-9A-F]{6}$/;

function toFormValues(color: AdminColor): ColorFormValues {
  return {
    name: color.name,
    hexCode: color.hexCode?.toUpperCase() ?? "",
    sortOrder: String(color.sortOrder ?? 0),
  };
}

function getSafeHexCode(value: string | null) {
  const normalized = value?.toUpperCase() ?? "";
  return HEX_CODE_PATTERN.test(normalized) ? normalized : undefined;
}

export function ColorsManagement() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<AdminColor | null>(null);
  const [deleteColor, setDeleteColor] = useState<AdminColor | null>(null);
  const [formValues, setFormValues] = useState<ColorFormValues>({ ...EMPTY_COLOR_FORM });
  const deferredSearch = useDeferredValue(searchValue.trim());

  const colorsQuery = useAdminColorsQuery({
    page,
    size: pageSize,
    sort: "sortOrder,asc",
    name: deferredSearch || undefined,
  });
  const createMutation = useCreateAdminColorMutation();
  const updateMutation = useUpdateAdminColorMutation();
  const deleteMutation = useDeleteAdminColorMutation();

  const rows = colorsQuery.data?.result ?? [];
  const meta = colorsQuery.data?.meta;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateForm() {
    setEditingColor(null);
    setFormValues({ ...EMPTY_COLOR_FORM });
    setFormOpen(true);
  }

  function openEditForm(color: AdminColor) {
    setEditingColor(color);
    setFormValues(toFormValues(color));
    setFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    const hexCode = formValues.hexCode.trim().toUpperCase();
    const sortOrderText = formValues.sortOrder.trim();
    const sortOrder = Number(sortOrderText);

    if (!name) {
      toast.error(t("admin.commerce.attributes.colors.validation.name"));
      return;
    }
    if (!HEX_CODE_PATTERN.test(hexCode)) {
      toast.error(t("admin.commerce.attributes.colors.validation.hex"));
      return;
    }
    if (!/^\d+$/.test(sortOrderText) || !Number.isSafeInteger(sortOrder) || sortOrder < 0) {
      toast.error(t("admin.commerce.attributes.validation.sortOrder"));
      return;
    }

    const request: CreateAdminColorRequest = {
      name,
      hexCode,
      sortOrder,
    };

    if (editingColor) {
      const updateRequest: UpdateAdminColorRequest = request;
      updateMutation.mutate(
        { id: editingColor.id, request: updateRequest },
        {
          onSuccess: () => {
            toast.success(t("admin.commerce.attributes.updated", { name }));
            setEditingColor(null);
            setFormOpen(false);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
      return;
    }

    createMutation.mutate(request, {
      onSuccess: () => {
        toast.success(t("admin.commerce.attributes.created", { name }));
        setPage(1);
        setFormOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleDelete() {
    if (!deleteColor) return;

    const { id, name } = deleteColor;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("admin.commerce.attributes.deleted", { name }));
        setDeleteColor(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminColor>[] = [
    {
      key: "name",
      header: t("admin.commerce.attributes.colors.column.color"),
      className: "min-w-64",
      cell: (color) => {
        const safeHexCode = getSafeHexCode(color.hexCode);

        return (
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-9 shrink-0 rounded-lg border shadow-xs"
              style={{ backgroundColor: safeHexCode ?? "transparent" }}
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{color.name}</p>
              <p className="font-mono text-muted-foreground text-xs">
                {safeHexCode ?? t("admin.commerce.attributes.colors.noValidHex")}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "hexCode",
      header: t("admin.commerce.attributes.colors.column.hex"),
      className: "font-mono text-muted-foreground",
      cell: (color) => color.hexCode?.toUpperCase() ?? "—",
    },
    {
      key: "sortOrder",
      header: t("admin.commerce.attributes.sortOrder"),
      className: "tabular-nums text-muted-foreground",
      cell: (color) => color.sortOrder ?? "—",
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (color) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.common.editNamed", { name: color.name })}
            onClick={() => openEditForm(color)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.common.deleteNamed", { name: color.name })}
            onClick={() => setDeleteColor(color)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ResourcePage
        title={t("admin.commerce.attributes.colors")}
        description={t("admin.commerce.attributes.colors.description")}
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder={t("admin.commerce.attributes.colors.search")}
        onSearchChange={(value) => {
          setSearchValue(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        primaryAction={{
          label: t("admin.commerce.attributes.colors.add"),
          icon: Palette,
          onClick: openCreateForm,
        }}
        onRefresh={() => void colorsQuery.refetch()}
        onExport={() =>
          downloadCsv(
            "colors.csv",
            rows.map((color) => ({
              id: color.id,
              name: color.name,
              hexCode: color.hexCode,
              sortOrder: color.sortOrder,
            }))
          )
        }
        isLoading={colorsQuery.isPending}
        isFetching={colorsQuery.isFetching}
        error={colorsQuery.isError ? colorsQuery.error : null}
        emptyTitle={t("admin.commerce.attributes.colors.emptyTitle")}
        emptyDescription={t("admin.commerce.attributes.colors.emptyDescription")}
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={
          editingColor
            ? t("admin.commerce.attributes.colors.edit")
            : t("admin.commerce.attributes.colors.add")
        }
        description={t("admin.commerce.attributes.colors.formDescription")}
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitLabel={
          editingColor
            ? t("admin.commerce.attributes.colors.save")
            : t("admin.commerce.attributes.colors.create")
        }
      >
        <ColorForm values={formValues} onChange={setFormValues} />
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(deleteColor)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteColor(null);
        }}
        resourceName={deleteColor?.name ?? t("admin.commerce.attributes.colors.resource")}
        description={t("admin.commerce.attributes.colors.deleteDescription")}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
