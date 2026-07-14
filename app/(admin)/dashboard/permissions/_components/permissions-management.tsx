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
  formatAdminDateTime,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AdminPermission,
  CreateAdminPermissionRequest,
  UpdateAdminPermissionRequest,
} from "@/lib/api/admin-rbac";
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
      toast.error("Complete every permission field before saving.");
      return;
    }
    if (!request.apiPath.startsWith("/")) {
      toast.error("API path must start with a forward slash.");
      return;
    }

    if (editingPermission) {
      const updateRequest: UpdateAdminPermissionRequest = request;
      updateMutation.mutate(
        { id: editingPermission.id, request: updateRequest },
        {
          onSuccess: () => {
            toast.success(`${request.name} was updated.`);
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
        toast.success(`${request.name} was created.`);
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
        toast.success(`${name} was deleted.`);
        setDeletePermission(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminPermission>[] = [
    {
      key: "name",
      header: "Permission",
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
      header: "Endpoint",
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
      header: "Module",
      cell: (permission) => <Badge variant="outline">{permission.module}</Badge>,
    },
    {
      key: "updatedAt",
      header: "Updated",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (permission) => formatAdminDateTime(permission.updatedAt),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (permission) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${permission.name}`}
            onClick={() => openEditForm(permission)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${permission.name}`}
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
        title="Permissions"
        description="Manage method-and-path rules used by backend role-based access control. Changes can affect access immediately."
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder="Search permission names..."
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
            label: "Method",
            value: methodFilter,
            options: [
              { label: "All methods", value: ALL_FILTER },
              ...PERMISSION_METHODS.map((method) => ({ label: method, value: method })),
            ],
            onValueChange: (value) => {
              setMethodFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: "Module",
            value: moduleFilter,
            options: [
              { label: "All modules", value: ALL_FILTER },
              ...moduleOptions.map((module) => ({ label: module, value: module })),
            ],
            onValueChange: (value) => {
              setModuleFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: "Add permission", onClick: openCreateForm }}
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
        emptyTitle="No permissions found"
        emptyDescription="Add a permission or adjust the name, method, and module filters."
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={editingPermission ? "Edit permission" : "Add permission"}
        description="A permission matches one HTTP method and one backend API path pattern."
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitLabel={editingPermission ? "Save permission" : "Create permission"}
      >
        <PermissionForm values={formValues} onChange={setFormValues} moduleOptions={moduleOptions} />
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(deletePermission)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeletePermission(null);
        }}
        resourceName={deletePermission?.name ?? "permission"}
        description="Deleting this permission removes it from assigned roles and may revoke access immediately."
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
