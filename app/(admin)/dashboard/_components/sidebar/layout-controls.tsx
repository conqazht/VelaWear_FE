"use client";

import { Settings } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type FontKey, fontOptions } from "@/lib/fonts/registry";
import type {
  ContentLayout,
  NavbarStyle,
  SidebarCollapsible,
  SidebarVariant,
} from "@/lib/preferences/layout";
import { THEME_PRESET_OPTIONS, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

const THEME_PRESET_LABEL_KEYS = {
  default: "admin.shell.preferences.preset.default",
  brutalist: "admin.shell.preferences.preset.brutalist",
  "soft-pop": "admin.shell.preferences.preset.softPop",
  tangerine: "admin.shell.preferences.preset.tangerine",
} as const;

export function LayoutControls() {
  const { t } = useI18n();
  const { values, resolvedThemeMode, setPreference, resetPreferences } = usePreferencesStore(
    useShallow((state) => ({
      values: state.values,
      resolvedThemeMode: state.resolvedThemeMode,
      setPreference: state.setPreference,
      resetPreferences: state.resetPreferences,
    })),
  );

  const {
    theme_mode: themeMode,
    theme_preset: themePreset,
    content_layout: contentLayout,
    navbar_style: navbarStyle,
    sidebar_variant: variant,
    sidebar_collapsible: collapsible,
    font,
  } = values;

  const themePresetItems = THEME_PRESET_OPTIONS.map((preset) => ({
    value: preset.value,
    label: (
      <span className="flex items-center gap-1.5">
        <span
          className="size-2.5 rounded-full"
          style={{
            backgroundColor:
              (resolvedThemeMode ?? "light") === "dark"
                ? preset.primary.dark
                : preset.primary.light,
          }}
        />
        {t(THEME_PRESET_LABEL_KEYS[preset.value])}
      </span>
    ),
  }));
  const fontItems = fontOptions.map((option) => ({
    value: option.key,
    label: option.label,
  }));

  const onThemePresetChange = (preset: ThemePreset) => {
    setPreference("theme_preset", preset);
  };

  const onFontChange = (value: FontKey | "") => {
    if (!value) return;
    setPreference("font", value);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={<Button size="icon" aria-label={t("admin.shell.preferences.open")} />}
      >
        <Settings />
      </PopoverTrigger>
      <PopoverContent align="end">
        <div className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <h4 className="text-sm leading-none font-medium">
              {t("admin.shell.preferences.title")}
            </h4>
            <p className="text-muted-foreground text-xs">
              {t("admin.shell.preferences.description")}
            </p>
          </div>
          <div className="space-y-3 **:data-[slot=toggle-group]:w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                {t("admin.shell.preferences.themePreset")}
              </Label>
              <Select
                items={themePresetItems}
                value={themePreset}
                onValueChange={(value) => {
                  if (!value) return;
                  void onThemePresetChange(value as ThemePreset);
                }}
              >
                <SelectTrigger size="sm" className="w-full text-xs">
                  <SelectValue
                    className="items-center"
                    placeholder={t("admin.shell.preferences.preset")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {THEME_PRESET_OPTIONS.map((preset) => (
                      <SelectItem key={preset.value} className="text-xs" value={preset.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                resolvedThemeMode === "dark"
                                  ? preset.primary.dark
                                  : preset.primary.light,
                            }}
                          />
                          {t(THEME_PRESET_LABEL_KEYS[preset.value])}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">{t("admin.shell.preferences.fonts")}</Label>
              <Select
                items={fontItems}
                value={font}
                onValueChange={(value) => {
                  if (!value) return;
                  void onFontChange(value as FontKey);
                }}
              >
                <SelectTrigger size="sm" className="w-full text-xs">
                  <SelectValue placeholder={t("admin.shell.preferences.selectFont")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.key} className="text-xs" value={font.key}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">
                {t("admin.shell.preferences.themeMode")}
              </Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                value={[themeMode]}
                onValueChange={([mode]) => {
                  if (!mode) return;
                  setPreference("theme_mode", mode as ThemeMode);
                }}
              >
                <ToggleGroupItem
                  value="light"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.light"),
                  })}
                >
                  {t("admin.shell.preferences.light")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="dark"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.dark"),
                  })}
                >
                  {t("admin.shell.preferences.dark")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="system"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.system"),
                  })}
                >
                  {t("admin.shell.preferences.system")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">
                {t("admin.shell.preferences.pageLayout")}
              </Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                value={[contentLayout]}
                onValueChange={([layout]) => {
                  if (!layout) return;
                  setPreference("content_layout", layout as ContentLayout);
                }}
              >
                <ToggleGroupItem
                  value="centered"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.centered"),
                  })}
                >
                  {t("admin.shell.preferences.centered")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="full-width"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.fullWidth"),
                  })}
                >
                  {t("admin.shell.preferences.fullWidth")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">
                {t("admin.shell.preferences.navbarBehavior")}
              </Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                value={[navbarStyle]}
                onValueChange={([style]) => {
                  if (!style) return;
                  setPreference("navbar_style", style as NavbarStyle);
                }}
              >
                <ToggleGroupItem
                  value="sticky"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.sticky"),
                  })}
                >
                  {t("admin.shell.preferences.sticky")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="scroll"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.scroll"),
                  })}
                >
                  {t("admin.shell.preferences.scroll")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">
                {t("admin.shell.preferences.sidebarStyle")}
              </Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                value={[variant]}
                onValueChange={([nextVariant]) => {
                  if (!nextVariant) return;
                  setPreference("sidebar_variant", nextVariant as SidebarVariant);
                }}
              >
                <ToggleGroupItem
                  value="inset"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.inset"),
                  })}
                >
                  {t("admin.shell.preferences.inset")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="sidebar"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.sidebar"),
                  })}
                >
                  {t("admin.shell.preferences.sidebar")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="floating"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.floating"),
                  })}
                >
                  {t("admin.shell.preferences.floating")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">
                {t("admin.shell.preferences.sidebarCollapseMode")}
              </Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                value={[collapsible]}
                onValueChange={([nextCollapsible]) => {
                  if (!nextCollapsible) return;
                  setPreference("sidebar_collapsible", nextCollapsible as SidebarCollapsible);
                }}
              >
                <ToggleGroupItem
                  value="icon"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.icon"),
                  })}
                >
                  {t("admin.shell.preferences.icon")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="offcanvas"
                  aria-label={t("admin.shell.preferences.selectOption", {
                    option: t("admin.shell.preferences.offcanvas"),
                  })}
                >
                  {t("admin.shell.preferences.offcanvas")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={resetPreferences}
            >
              {t("admin.shell.preferences.restoreDefaults")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
