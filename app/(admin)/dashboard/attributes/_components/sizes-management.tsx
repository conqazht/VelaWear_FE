"use client";

import { type FormEvent, useDeferredValue, useState } from "react";
import { Pencil, Ruler, Trash2 } from "lucide-react";
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
  AdminSize,
  CreateAdminSizeRequest,
  UpdateAdminSizeRequest,
} from "@/lib/api/admin-commerce";
import {
  useAdminSizesQuery,
  useCreateAdminSizeMutation,
  useDeleteAdminSizeMutation,
  useUpdateAdminSizeMutation,
} from "@/lib/queries/admin-commerce";

import { EMPTY_SIZE_FORM, SizeForm, type SizeFormValues } from "./size-form";

function toFormValues(size: AdminSize): SizeFormValues {
  return {
    name: size.name,
    sortOrder: String(size.sortOrder ?? 0),
  };
}

export function SizesManagement() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<AdminSize | null>(null);
  const [deleteSize, setDeleteSize] = useState<AdminSize | null>(null);
  const [formValues, setFormValues] = useState<SizeFormValues>({ ...EMPTY_SIZE_FORM });
  const deferredSearch = useDeferredValue(searchValue.trim());

  const sizesQuery = useAdminSizesQuery({
    page,
    size: pageSize,
    sort: "sortOrder,asc",
    name: deferredSearch || undefined,
  });
  const createMutation = useCreateAdminSizeMutation();
  const updateMutation = useUpdateAdminSizeMutation();
  const deleteMutation = useDeleteAdminSizeMutation();

  const rows = sizesQuery.data?.result ?? [];
  const meta = sizesQuery.data?.meta;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateForm() {
    setEditingSize(null);
    setFormValues({ ...EMPTY_SIZE_FORM });
    setFormOpen(true);
  }

  function openEditForm(size: AdminSize) {
    setEditingSize(size);
    setFormValues(toFormValues(size));
    setFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    const sortOrderText = formValues.sortOrder.trim();
    const sortOrder = Number(sortOrderText);

    if (!name) {
      toast.error(t("admin.commerce.attributes.sizes.validation.name"));
      return;
    }
    if (!/^\d+$/.test(sortOrderText) || !Number.isSafeInteger(sortOrder) || sortOrder < 0) {
      toast.error(t("admin.commerce.attributes.validation.sortOrder"));
      return;
    }

    const request: CreateAdminSizeRequest = {
      name,
      sortOrder,
    };

    if (editingSize) {
      const updateRequest: UpdateAdminSizeRequest = request;
      updateMutation.mutate(
        { id: editingSize.id, request: updateRequest },
        {
          onSuccess: () => {
            toast.success(t("admin.commerce.attributes.updated", { name }));
            setEditingSize(null);
            setFormOpen(false);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        },
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
    if (!deleteSize) return;

    const { id, name } = deleteSize;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("admin.commerce.attributes.deleted", { name }));
        setDeleteSize(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminSize>[] = [
    {
      key: "name",
      header: t("admin.commerce.attributes.sizes.column.size"),
      className: "min-w-64",
      cell: (size) => (
        <div className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
            <Ruler className="size-4" />
          </div>
          <span className="font-medium">{size.name}</span>
        </div>
      ),
    },
    {
      key: "sortOrder",
      header: t("admin.commerce.attributes.sortOrder"),
      className: "tabular-nums text-muted-foreground",
      cell: (size) => size.sortOrder ?? "—",
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (size) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.common.editNamed", { name: size.name })}
            onClick={() => openEditForm(size)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.common.deleteNamed", { name: size.name })}
            onClick={() => setDeleteSize(size)}
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
        title={t("admin.commerce.attributes.sizes")}
        description={t("admin.commerce.attributes.sizes.description")}
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder={t("admin.commerce.attributes.sizes.search")}
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
          label: t("admin.commerce.attributes.sizes.add"),
          icon: Ruler,
          onClick: openCreateForm,
        }}
        onRefresh={() => void sizesQuery.refetch()}
        onExport={() =>
          downloadCsv(
            "sizes.csv",
            rows.map((size) => ({
              id: size.id,
              name: size.name,
              sortOrder: size.sortOrder,
            })),
          )
        }
        isLoading={sizesQuery.isPending}
        isFetching={sizesQuery.isFetching}
        error={sizesQuery.isError ? sizesQuery.error : null}
        emptyTitle={t("admin.commerce.attributes.sizes.emptyTitle")}
        emptyDescription={t("admin.commerce.attributes.sizes.emptyDescription")}
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={
          editingSize
            ? t("admin.commerce.attributes.sizes.edit")
            : t("admin.commerce.attributes.sizes.add")
        }
        description={t("admin.commerce.attributes.sizes.formDescription")}
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitLabel={
          editingSize
            ? t("admin.commerce.attributes.sizes.save")
            : t("admin.commerce.attributes.sizes.create")
        }
      >
        <SizeForm values={formValues} onChange={setFormValues} />
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(deleteSize)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteSize(null);
        }}
        resourceName={deleteSize?.name ?? t("admin.commerce.attributes.sizes.resource")}
        description={t("admin.commerce.attributes.sizes.deleteDescription")}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
