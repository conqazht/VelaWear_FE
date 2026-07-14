"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import {
  ResourceFormSheet,
} from "@/app/(admin)/dashboard/_components/management/resource-overlays";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdminGender,
  AdminRole,
  AdminUser,
} from "@/lib/api/admin-rbac";

export type UserFormValues = {
  fullName: string;
  email: string;
  password: string;
  birthDate: string;
  avatar: string;
  gender: AdminGender;
  roles: string[];
};

type UserFormSheetProps = {
  mode: "create" | "edit";
  user?: AdminUser;
  availableRoles: AdminRole[];
  isRolesLoading: boolean;
  rolesError?: string | null;
  error?: string | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
};

export function UserFormSheet({
  mode,
  user,
  availableRoles,
  isRolesLoading,
  rolesError,
  error,
  isPending,
  onClose,
  onSubmit,
}: UserFormSheetProps) {
  const [values, setValues] = useState<UserFormValues>({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    password: "",
    birthDate: user?.birthDate ?? "",
    avatar: user?.avatar ?? "",
    gender: user?.gender ?? "OTHER",
    roles: user?.roles.map((role) => role.name) ?? [],
  });
  const [rolesValidationError, setRolesValidationError] = useState<string | null>(
    null
  );

  function toggleRole(roleName: string, checked: boolean) {
    setValues((current) => ({
      ...current,
      roles: checked
        ? [...new Set([...current.roles, roleName])]
        : current.roles.filter((name) => name !== roleName),
    }));
    setRolesValidationError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (values.roles.length === 0) {
      setRolesValidationError("Select at least one role.");
      return;
    }
    void onSubmit(values);
  }

  return (
    <ResourceFormSheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={mode === "create" ? "Add user" : `Edit ${user?.fullName ?? "user"}`}
      description={
        mode === "create"
          ? "Create an account and assign its initial access roles."
          : "Update profile details and replace the user's assigned roles."
      }
      onSubmit={handleSubmit}
      isPending={isPending}
      submitLabel={mode === "create" ? "Create user" : "Save changes"}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to save user</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="user-full-name">Full name</FieldLabel>
          <Input
            id="user-full-name"
            value={values.fullName}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
            maxLength={150}
            autoComplete="name"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="user-email">Email address</FieldLabel>
          <Input
            id="user-email"
            type="email"
            value={values.email}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            maxLength={255}
            autoComplete="email"
            disabled={mode === "edit"}
            required
          />
          {mode === "edit" ? (
            <FieldDescription>
              Email changes are not supported by the admin user endpoint.
            </FieldDescription>
          ) : null}
        </Field>

        {mode === "create" ? (
          <Field>
            <FieldLabel htmlFor="user-password">Temporary password</FieldLabel>
            <Input
              id="user-password"
              type="password"
              value={values.password}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              required
            />
            <FieldDescription>Use between 8 and 100 characters.</FieldDescription>
          </Field>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="user-birth-date">Birth date</FieldLabel>
            <Input
              id="user-birth-date"
              type="date"
              value={values.birthDate}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  birthDate: event.target.value,
                }))
              }
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="user-gender">Gender</FieldLabel>
            <Select
              value={values.gender}
              onValueChange={(value) =>
                setValues((current) => ({
                  ...current,
                  gender: value as AdminGender,
                }))
              }
            >
              <SelectTrigger id="user-gender" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="user-avatar">Avatar URL</FieldLabel>
          <Input
            id="user-avatar"
            type="text"
            value={values.avatar}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                avatar: event.target.value,
              }))
            }
            maxLength={500}
            placeholder="/uploads/avatars/user.png"
          />
          <FieldDescription>
            Optional image URL or backend-relative upload path, up to 500 characters.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <FieldSet>
        <FieldLegend variant="label">Roles</FieldLegend>
        <FieldDescription>
          Saving replaces the complete role list. The backend requires at least one role.
        </FieldDescription>

        {rolesError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load roles</AlertTitle>
            <AlertDescription>{rolesError}</AlertDescription>
          </Alert>
        ) : isRolesLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading roles...
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {availableRoles.map((role) => (
              <FieldLabel key={role.id} className="cursor-pointer">
                <Field orientation="horizontal">
                  <Checkbox
                    checked={values.roles.includes(role.name)}
                    onCheckedChange={(checked) =>
                      toggleRole(role.name, Boolean(checked))
                    }
                    disabled={isPending}
                    aria-label={`Assign ${role.name} role`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{role.name}</span>
                    <span className="text-muted-foreground line-clamp-1 text-xs">
                      {role.description || "No description"}
                    </span>
                  </span>
                </Field>
              </FieldLabel>
            ))}
          </div>
        )}
        <FieldError>{rolesValidationError}</FieldError>
      </FieldSet>
    </ResourceFormSheet>
  );
}
