"use client";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreateAdminPermissionRequest } from "@/lib/api/admin-rbac";

export type PermissionMethod = CreateAdminPermissionRequest["method"];

export type PermissionFormValues = {
  name: string;
  apiPath: string;
  method: PermissionMethod;
  module: string;
};

export const EMPTY_PERMISSION_FORM: PermissionFormValues = {
  name: "",
  apiPath: "",
  method: "GET",
  module: "",
};

export const PERMISSION_METHODS: PermissionMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

type PermissionFormProps = {
  values: PermissionFormValues;
  onChange: (next: PermissionFormValues) => void;
  moduleOptions: string[];
};

export function PermissionForm({ values, onChange, moduleOptions }: PermissionFormProps) {
  function update<Key extends keyof PermissionFormValues>(key: Key, value: PermissionFormValues[Key]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="permission-name">Permission name</FieldLabel>
        <Input
          id="permission-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value.toUpperCase())}
          maxLength={100}
          placeholder="VIEW_PRODUCTS"
          required
        />
        <FieldDescription>Use a clear action-oriented identifier, typically in uppercase snake case.</FieldDescription>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="permission-method">HTTP method</FieldLabel>
          <Select
            value={values.method}
            onValueChange={(value) => update("method", value as PermissionMethod)}
          >
            <SelectTrigger id="permission-method" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {PERMISSION_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="permission-module">Module</FieldLabel>
          <Input
            id="permission-module"
            list="permission-module-options"
            value={values.module}
            onChange={(event) => update("module", event.target.value.toUpperCase())}
            maxLength={100}
            placeholder="PRODUCT"
            required
          />
          <datalist id="permission-module-options">
            {moduleOptions.map((module) => (
              <option key={module} value={module} />
            ))}
          </datalist>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="permission-api-path">API path</FieldLabel>
        <Input
          id="permission-api-path"
          value={values.apiPath}
          onChange={(event) => update("apiPath", event.target.value)}
          maxLength={255}
          placeholder="/api/v1/products/{id}"
          spellCheck={false}
          required
        />
        <FieldDescription>
          Enter the backend route pattern exactly. Path variables such as {"{id}"} are supported.
        </FieldDescription>
      </Field>
    </FieldGroup>
  );
}
