import type { Locale } from "@/lib/i18n";

export type MessageVariables = Record<string, string | number>;

export function defineMessages<const English extends Record<string, string>>(
  en: English,
  vi: { [Key in keyof English]: string },
) {
  return { en, vi } satisfies Record<Locale, Record<keyof English, string>>;
}

export function interpolateMessage(message: string, variables?: MessageVariables): string {
  if (!variables) return message;

  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) => {
    const value = variables[key];
    return value === undefined ? placeholder : String(value);
  });
}
