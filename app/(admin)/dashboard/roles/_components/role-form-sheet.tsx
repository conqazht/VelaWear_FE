"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { ResourceFormSheet } from "@/app/(admin)/dashboard/_components/management/resource-overlays";
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
      title={mode === "create" ? "Create role" : `Edit ${role?.name ?? "role"}`}
      description={
        mode === "create"
          ? "Create a named access role for user assignment."
          : "Update the role name and its operational description."
      }
      onSubmit={handleSubmit}
      isPending={isPending}
      submitLabel={mode === "create" ? "Create role" : "Save changes"}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to save role</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="role-name">Role name</FieldLabel>
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
            Users are assigned by this exact name, including capitalization.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="role-description">Description</FieldLabel>
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
            placeholder="Describe what this role is used for."
          />
          <FieldDescription>{values.description.length}/255 characters</FieldDescription>
        </Field>
      </FieldGroup>

      <FieldSet>
        <FieldLegend variant="label">Assigned permissions</FieldLegend>
        <Alert>
          <AlertTitle>Read-only access map</AlertTitle>
          <AlertDescription>
            The backend exposes assigned permissions on role details, but does not yet provide an endpoint to add or remove them.
          </AlertDescription>
        </Alert>

        {mode === "create" ? (
          <p className="text-muted-foreground text-sm">
            New roles are created without permissions until the backend supports role-permission assignment.
          </p>
        ) : permissionsError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load assigned permissions</AlertTitle>
            <AlertDescription>{permissionsError}</AlertDescription>
          </Alert>
        ) : isPermissionsLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading permissions...
          </div>
        ) : permissions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No permissions are assigned.</p>
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
