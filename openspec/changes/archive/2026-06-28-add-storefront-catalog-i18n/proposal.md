## Why

The backend catalog now supports localized product and category content with Vietnamese (`vi`) as the default locale. The storefront needs a matching client-side locale flow so catalog requests ask for the active locale and pages render backend-localized fields consistently.

## What Changes

- Add a storefront locale source with `vi` as the default active locale.
- Pass the active locale to product and category catalog API calls.
- Include locale in client cache/query keys so responses from different locales do not mix.
- Render localized product and category fields returned by the backend without introducing database-backed color or size translations.
- Keep color swatches and size codes language-neutral in the storefront UI.
- Leave backend schema and backend API implementation to the `commercial` backend change.

## Capabilities

### New Capabilities

- `storefront-catalog-i18n`: Storefront catalog screens can request and render localized product/category content using the active locale.

### Modified Capabilities

- None.

## Impact

- Catalog API helpers in `lib/vela-data.ts`.
- Product listing/search flows in `app/(shop)/search/page.tsx`.
- Product detail rendering in `components/shop/product-detail-client.tsx`.
- Any shared frontend locale source, constants, hook, or provider added for the active storefront locale.
- Frontend verification via lint and manual page checks once the backend i18n API is available.
