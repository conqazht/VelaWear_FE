"use client";

import { Palette, Ruler } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ColorsManagement } from "./colors-management";
import { SizesManagement } from "./sizes-management";

export function AttributesManagement() {
  const { t } = useI18n();

  return (
    <Tabs defaultValue="colors" className="gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("admin.commerce.attributes.title")}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            {t("admin.commerce.attributes.description")}
          </p>
        </div>
        <TabsList aria-label={t("admin.commerce.attributes.type")}>
          <TabsTrigger value="colors">
            <Palette /> {t("admin.commerce.attributes.colors")}
          </TabsTrigger>
          <TabsTrigger value="sizes">
            <Ruler /> {t("admin.commerce.attributes.sizes")}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="colors" keepMounted>
        <ColorsManagement />
      </TabsContent>
      <TabsContent value="sizes" keepMounted>
        <SizesManagement />
      </TabsContent>
    </Tabs>
  );
}
