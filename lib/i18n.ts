export const DEFAULT_LOCALE = "vi";

/**
 * Gets the current active storefront locale.
 * Defaults to "vi" (Vietnamese) as the fallback.
 */
export function getActiveLocale(): string {
  return DEFAULT_LOCALE;
}
