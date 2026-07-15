"use client";

import { type FormEvent, useDeferredValue, useState } from "react";
import { Pencil, ShieldCheck, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AdminPermission,
  CreateAdminPermissionRequest,
  UpdateAdminPermissionRequest,
} from "@/lib/api/admin-rbac";
import { formatDateTime } from "@/lib/i18n/format";
import {
  useAdminPermissionsQuery,
  useCreateAdminPermissionMutation,
  useDeleteAdminPermissionMutation,
  useUpdateAdminPermissionMutation,
} from "@/lib/queries/admin-rbac";

import {
  EMPTY_PERMISSION_FORM,
  PERMISSION_METHODS,
  PermissionForm,
  type PermissionFormValues,
  type PermissionMethod,
} from "./permission-form";

const ALL_FILTER = "ALL";

function isPermissionMethod(value: string): value is PermissionMethod {
  return PERMISSION_METHODS.some((method) => method === value);
}

function getMethodVariant(method: string) {
  if (method === "DELETE") return "destructive" as const;
  if (method === "GET") return "default" as const;
  if (method === "POST") return "secondary" as const;
  return "outline" as const;
}

function toFormValues(permission: AdminPermission): PermissionFormValues {
  return {
    name: permission.name,
    apiPath: permission.apiPath,
    method: isPermissionMethod(permission.method) ? permission.method : "GET",
    module: permission.module,
  };
}

export function PermissionsManagement() {
  const { locale, t } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [methodFilter, setMethodFilter] = useState(ALL_FILTER);
  const [moduleFilter, setModuleFilter] = useState(ALL_FILTER);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<AdminPermission | null>(null);
  const [deletePermission, setDeletePermission] = useState<AdminPermission | null>(null);
  const [formValues, setFormValues] = useState<PermissionFormValues>({ ...EMPTY_PERMISSION_FORM });
  const deferredSearch = useDeferredValue(searchValue.trim());

  const permissionsQuery = useAdminPermissionsQuery({
    page,
    size: pageSize,
    sort: "updatedAt,desc",
    name: deferredSearch || undefined,
    method: methodFilter === ALL_FILTER ? undefined : methodFilter,
    module: moduleFilter === ALL_FILTER ? undefined : moduleFilter,
  });
  const modulesQuery = useAdminPermissionsQuery({ page: 1, size: 2000, sort: "module,asc" });
  const createMutation = useCreateAdminPermissionMutation();
  const updateMutation = useUpdateAdminPermissionMutation();
  const deleteMutation = useDeleteAdminPermissionMutation();

  const rows = permissionsQuery.data?.result ?? [];
  const meta = permissionsQuery.data?.meta;
  const moduleOptions = Array.from(
    new Set((modulesQuery.data?.result ?? []).map((permission) => permission.module).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right));
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateForm() {
    setEditingPermission(null);
    setFormValues({ ...EMPTY_PERMISSION_FORM });
    setFormOpen(true);
  }

  function openEditForm(permission: AdminPermission) {
    setEditingPermission(permission);
    setFormValues(toFormValues(permission));
    setFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const request: CreateAdminPermissionRequest = {
      name: formValues.name.trim().toUpperCase(),
      apiPath: formValues.apiPath.trim(),
      method: formValues.method,
      module: formValues.module.trim().toUpperCase(),
    };

    if (!request.name || !request.apiPath || !request.module) {
      toast.error(t("admin.commerce.permissions.validation.complete"));
      return;
    }
    if (!request.apiPath.startsWith("/")) {
      toast.error(t("admin.commerce.permissions.validation.path"));
      return;
    }

    if (editingPermission) {
      const updateRequest: UpdateAdminPermissionRequest = request;
      updateMutation.mutate(
        { id: editingPermission.id, request: updateRequest },
        {
          onSuccess: () => {
            toast.success(t("admin.commerce.permissions.updated", { name: request.name }));
            setEditingPermission(null);
            setFormOpen(false);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
      return;
    }

    createMutation.mutate(request, {
      onSuccess: () => {
        toast.success(t("admin.commerce.permissions.created", { name: request.name }));
        setPage(1);
        setFormOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleDelete() {
    if (!deletePermission) return;

    const { id, name } = deletePermission;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("admin.commerce.permissions.deleted", { name }));
        setDeletePermission(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminPermission>[] = [
    {
      key: "name",
      header: t("admin.commerce.permissions.column.permission"),
      className: "min-w-56",
      cell: (permission) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ShieldCheck className="size-4" />
          </div>
          <span className="font-medium">{permission.name}</span>
        </div>
      ),
    },
    {
      key: "endpoint",
      header: t("admin.commerce.permissions.column.endpoint"),
      className: "min-w-80",
      cell: (permission) => (
        <div className="flex items-center gap-2">
          <Badge variant={getMethodVariant(permission.method)} className="min-w-14 font-mono">
            {permission.method}
          </Badge>
          <code className="truncate text-xs">{permission.apiPath}</code>
        </div>
      ),
    },
    {
      key: "module",
      header: t("admin.commerce.permissions.column.module"),
      cell: (permission) => <Badge variant="outline">{permission.module}</Badge>,
    },
    {
      key: "updatedAt",
      header: t("admin.commerce.common.updated"),
      className: "whitespace-nowrap text-muted-foreground",
      cell: (permission) => formatDateTime(permission.updatedAt, locale),
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (permission) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.common.editNamed", { name: permission.name })}
            onClick={() => openEditForm(permission)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.common.deleteNamed", { name: permission.name })}
            onClick={() => setDeletePermission(permission)}
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
        title={t("admin.commerce.permissions.title")}
        description={t("admin.commerce.permissions.description")}
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder={t("admin.commerce.permissions.search")}
        onSearchChange={(value) => {
          setSearchValue(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        filters={[
          {
            label: t("admin.commerce.permissions.method"),
            value: methodFilter,
            options: [
              { label: t("admin.commerce.permissions.allMethods"), value: ALL_FILTER },
              ...PERMISSION_METHODS.map((method) => ({ label: method, value: method })),
            ],
            onValueChange: (value) => {
              setMethodFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: t("admin.commerce.permissions.module"),
            value: moduleFilter,
            options: [
              { label: t("admin.commerce.permissions.allModules"), value: ALL_FILTER },
              ...moduleOptions.map((module) => ({ label: module, value: module })),
            ],
            onValueChange: (value) => {
              setModuleFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: t("admin.commerce.permissions.add"), onClick: openCreateForm }}
        onRefresh={() => void permissionsQuery.refetch()}
        onExport={() =>
          downloadCsv(
            "permissions.csv",
            rows.map((permission) => ({
              id: permission.id,
              name: permission.name,
              apiPath: permission.apiPath,
              method: permission.method,
              module: permission.module,
              createdAt: permission.createdAt,
              updatedAt: permission.updatedAt,
            }))
          )
        }
        isLoading={permissionsQuery.isPending}
        isFetching={permissionsQuery.isFetching}
        error={permissionsQuery.isError ? permissionsQuery.error : null}
        emptyTitle={t("admin.commerce.permissions.emptyTitle")}
        emptyDescription={t("admin.commerce.permissions.emptyDescription")}
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={
          editingPermission
            ? t("admin.commerce.permissions.edit")
            : t("admin.commerce.permissions.add")
        }
        description={t("admin.commerce.permissions.formDescription")}
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitLabel={
          editingPermission
            ? t("admin.commerce.permissions.save")
            : t("admin.commerce.permissions.create")
        }
      >
        <PermissionForm values={formValues} onChange={setFormValues} moduleOptions={moduleOptions} />
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(deletePermission)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeletePermission(null);
        }}
        resourceName={deletePermission?.name ?? t("admin.commerce.permissions.resource")}
        description={t("admin.commerce.permissions.deleteDescription")}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
