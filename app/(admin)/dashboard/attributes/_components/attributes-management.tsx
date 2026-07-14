"use client";

import { Palette, Ruler } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ColorsManagement } from "./colors-management";
import { SizesManagement } from "./sizes-management";

export function AttributesManagement() {
  return (
    <Tabs defaultValue="colors" className="gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Colors & sizes</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground text-sm">
            Maintain the reusable attributes available when creating product variants.
          </p>
        </div>
        <TabsList aria-label="Product attribute type">
          <TabsTrigger value="colors">
            <Palette /> Colors
          </TabsTrigger>
          <TabsTrigger value="sizes">
            <Ruler /> Sizes
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
