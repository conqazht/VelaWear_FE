"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import {
  ResourceFormSheet,
} from "@/app/(admin)/dashboard/_components/management/resource-overlays";
import { useI18n } from "@/components/providers/i18n-provider";
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
  const { t } = useI18n();
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
      setRolesValidationError(t("admin.commerce.users.form.rolesRequired"));
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
      title={
        mode === "create"
          ? t("admin.commerce.users.form.addTitle")
          : t("admin.commerce.users.form.editTitle", {
              name: user?.fullName ?? t("admin.commerce.users.resource"),
            })
      }
      description={
        mode === "create"
          ? t("admin.commerce.users.form.createDescription")
          : t("admin.commerce.users.form.editDescription")
      }
      onSubmit={handleSubmit}
      isPending={isPending}
      submitLabel={
        mode === "create"
          ? t("admin.commerce.users.form.create")
          : t("admin.commerce.common.saveChanges")
      }
    >
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.users.form.unableSave")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="user-full-name">{t("admin.commerce.users.form.fullName")}</FieldLabel>
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
          <FieldLabel htmlFor="user-email">{t("admin.commerce.users.form.email")}</FieldLabel>
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
              {t("admin.commerce.users.form.emailImmutable")}
            </FieldDescription>
          ) : null}
        </Field>

        {mode === "create" ? (
          <Field>
            <FieldLabel htmlFor="user-password">
              {t("admin.commerce.users.form.temporaryPassword")}
            </FieldLabel>
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
            <FieldDescription>{t("admin.commerce.users.form.passwordHelp")}</FieldDescription>
          </Field>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="user-birth-date">{t("admin.commerce.users.form.birthDate")}</FieldLabel>
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
            <FieldLabel htmlFor="user-gender">{t("admin.commerce.users.form.gender")}</FieldLabel>
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
                <SelectItem value="MALE">{t("admin.commerce.users.gender.male")}</SelectItem>
                <SelectItem value="FEMALE">{t("admin.commerce.users.gender.female")}</SelectItem>
                <SelectItem value="OTHER">{t("admin.commerce.users.gender.other")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="user-avatar">{t("admin.commerce.users.form.avatarUrl")}</FieldLabel>
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
            {t("admin.commerce.users.form.avatarHelp")}
          </FieldDescription>
        </Field>
      </FieldGroup>

      <FieldSet>
        <FieldLegend variant="label">{t("admin.commerce.users.form.roles")}</FieldLegend>
        <FieldDescription>
          {t("admin.commerce.users.form.rolesHelp")}
        </FieldDescription>

        {rolesError ? (
          <Alert variant="destructive">
            <AlertTitle>{t("admin.commerce.users.form.unableLoadRoles")}</AlertTitle>
            <AlertDescription>{rolesError}</AlertDescription>
          </Alert>
        ) : isRolesLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> {t("admin.commerce.users.form.loadingRoles")}
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
                    aria-label={t("admin.commerce.users.form.assignRole", { name: role.name })}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{role.name}</span>
                    <span className="text-muted-foreground line-clamp-1 text-xs">
                      {role.description || t("admin.commerce.common.noDescription")}
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
