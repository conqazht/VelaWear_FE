## Context

The backend catalog i18n change serves localized product and category fields using an active locale, with Vietnamese (`vi`) as the default fallback. The storefront currently maps catalog data in `lib/vela-data.ts` and renders product/search/detail views without a shared storefront locale source.

This FE change should make the storefront ask the backend for localized catalog content and render the resolved fields. It should not create frontend translations for every UI label yet; this phase is about catalog content returned by the backend.

## Goals / Non-Goals

**Goals:**

- Add a single storefront locale source with `vi` as the default active locale.
- Pass the active locale to product and category catalog API requests.
- Include locale in catalog cache/query keys and request URLs so locale-specific responses do not mix.
- Render backend-localized product/category fields directly in catalog list, search, and product detail surfaces.
- Keep color swatches and size codes language-neutral in the storefront.
- Keep the implementation compatible with the backend fallback contract: requested locale, `Accept-Language`, then `vi`.

**Non-Goals:**

- Do not implement full UI copy translation for buttons, menus, auth, checkout, or validation messages in this change.
- Do not add database-backed color or size translations.
- Do not change backend schema or backend catalog API behavior.
- Do not add locale-prefixed public routes unless explicitly selected in a later change.
- Do not replace existing product/category display components beyond what is needed for localized catalog fields.

## Decisions

### Use a small frontend locale source first

Create a minimal locale source, such as a constant plus helper/hook/provider, with `vi` as the default active locale.

Rationale: the immediate need is to pass locale to catalog APIs. A full i18n framework can be added later when UI copy translation is in scope.

Alternative considered: introduce `next-intl` or another full i18n routing framework immediately. That would solve more than this phase needs and may force route/layout churn before UI copy translation is planned.

### Pass locale explicitly to backend catalog APIs

Catalog requests should send the active locale as a `locale` query parameter. Where an API wrapper supports headers cleanly, it can also set `Accept-Language` to the same locale.

Rationale: explicit `?locale=vi` is easy to debug, cache, and test. It matches the backend precedence and avoids relying only on browser headers.

### Include locale in all catalog cache keys

Any cached catalog list, search, category, or detail request must include locale in its key or URL.

Rationale: the same product id or slug can return different text per locale. Locale-free keys can leak one language into another.

### Render resolved localized fields, not translation maps

The storefront should expect product/category DTOs to already contain resolved `name`, `slug`, `description`, SEO fields, and related localized fields.

Rationale: the backend resolves fallback. The storefront only needs the active locale response and should not implement its own translation-selection logic for catalog content.

### Keep color and size technical

Color should continue to render from code/name plus hex/swatch data, and size should render as a stable code such as `XS`, `M`, `XXL`, or `35`.

Rationale: color swatches and size codes are not DB-localized in this phase. Any accessibility labels can be handled by frontend copy dictionaries later.

## Risks / Trade-offs

- Locale missing from one request can show mixed language catalog data -> Centralize catalog request helpers and include locale in query keys.
- Static fallback product data may not match localized backend DTOs -> Keep mapper tolerant of both old and new DTO fields during transition.
- Full UI remains partly mixed language -> Scope this phase to backend catalog content and track UI-copy i18n separately if needed.
- Product/category slugs may differ by locale later -> Avoid assuming display slug is the same as routing id unless route design is updated.
- Backend not running the i18n migration can omit new fields -> Use safe optional mapping and preserve existing fallback fields.

## Migration Plan

1. Add storefront locale source with `vi` as default.
2. Update catalog API helpers to accept/use locale.
3. Update search/list/detail fetches to pass locale and include it in request/cache keys.
4. Update product/category mappers to consume localized DTO fields and tolerate optional SEO/material/care fields.
5. Verify search, product detail, and category/list pages render Vietnamese catalog content by default against the backend i18n API.

Rollback can remove locale passing and return to previous catalog API calls. Because backend defaults to Vietnamese, the storefront should still receive usable content even if the locale parameter is removed.

## Open Questions

- Should a visible language switcher be part of this phase, or should the initial implementation be `vi` only?
- Should public routes become locale-prefixed later, such as `/vi/search`, or should locale remain request-only for now?
- Should UI copy translation become a follow-up change after catalog content is localized?
