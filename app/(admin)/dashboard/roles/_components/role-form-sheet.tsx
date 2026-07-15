"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { ResourceFormSheet } from "@/app/(admin)/dashboard/_components/management/resource-overlays";
import { useI18n } from "@/components/providers/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminPermission, AdminRole } from "@/lib/api/admin-rbac";

export type RoleFormValues = {
  name: string;
  description: string;
};

type RoleFormSheetProps = {
  mode: "create" | "edit";
  role?: AdminRole;
  permissions: AdminPermission[];
  isPermissionsLoading: boolean;
  permissionsError?: string | null;
  error?: string | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => Promise<void>;
};

export function RoleFormSheet({
  mode,
  role,
  permissions,
  isPermissionsLoading,
  permissionsError,
  error,
  isPending,
  onClose,
  onSubmit,
}: RoleFormSheetProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<RoleFormValues>({
    name: role?.name ?? "",
    description: role?.description ?? "",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit(values);
  }

  return (
    <ResourceFormSheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={
        mode === "create"
          ? t("admin.commerce.roles.create")
          : t("admin.commerce.roles.form.editTitle", {
              name: role?.name ?? t("admin.commerce.roles.resource"),
            })
      }
      description={
        mode === "create"
          ? t("admin.commerce.roles.form.createDescription")
          : t("admin.commerce.roles.form.editDescription")
      }
      onSubmit={handleSubmit}
      isPending={isPending}
      submitLabel={
        mode === "create"
          ? t("admin.commerce.roles.create")
          : t("admin.commerce.common.saveChanges")
      }
    >
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.roles.form.unableSave")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="role-name">{t("admin.commerce.roles.form.name")}</FieldLabel>
          <Input
            id="role-name"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            maxLength={50}
            placeholder="MERCHANDISER"
            autoComplete="off"
            required
          />
          <FieldDescription>
            {t("admin.commerce.roles.form.nameHelp")}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="role-description">{t("admin.commerce.common.description")}</FieldLabel>
          <Textarea
            id="role-description"
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            maxLength={255}
            placeholder={t("admin.commerce.roles.form.descriptionPlaceholder")}
          />
          <FieldDescription>
            {t("admin.commerce.roles.form.characters", { count: values.description.length })}
          </FieldDescription>
        </Field>
      </FieldGroup>

      <FieldSet>
        <FieldLegend variant="label">{t("admin.commerce.roles.form.assignedPermissions")}</FieldLegend>
        <Alert>
          <AlertTitle>{t("admin.commerce.roles.form.readOnlyMap")}</AlertTitle>
          <AlertDescription>
            {t("admin.commerce.roles.form.readOnlyDescription")}
          </AlertDescription>
        </Alert>

        {mode === "create" ? (
          <p className="text-muted-foreground text-sm">
            {t("admin.commerce.roles.form.newWithoutPermissions")}
          </p>
        ) : permissionsError ? (
          <Alert variant="destructive">
            <AlertTitle>{t("admin.commerce.roles.form.unableLoadPermissions")}</AlertTitle>
            <AlertDescription>{permissionsError}</AlertDescription>
          </Alert>
        ) : isPermissionsLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            {t("admin.commerce.roles.form.loadingPermissions")}
          </div>
        ) : permissions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("admin.commerce.roles.form.noPermissions")}
          </p>
        ) : (
          <div className="space-y-3">
            {Array.from(new Set(permissions.map((permission) => permission.module)))
              .sort()
              .map((module) => (
                <div key={module} className="space-y-2 rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {module}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {permissions
                      .filter((permission) => permission.module === module)
                      .map((permission) => (
                        <Badge
                          key={permission.id}
                          variant="outline"
                          title={`${permission.method} ${permission.apiPath}`}
                        >
                          {permission.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </FieldSet>
    </ResourceFormSheet>
  );
}
