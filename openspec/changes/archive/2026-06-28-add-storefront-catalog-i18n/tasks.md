## 1. Locale Source

- [x] 1.1 Add a storefront locale constant or helper with `vi` as the default active locale.
- [x] 1.2 Expose the active catalog locale to product/search/detail data-loading code without requiring a visible language switcher in this phase.

## 2. Catalog API Requests

- [x] 2.1 Update catalog API helpers in `lib/vela-data.ts` to accept an optional locale and default to `vi`.
- [x] 2.2 Pass the active locale as `locale` query parameter for product list/search requests.
- [x] 2.3 Pass the active locale as `locale` query parameter for product detail requests.
- [x] 2.4 Pass the active locale as `locale` query parameter for category catalog requests if category data is fetched from the backend.
- [x] 2.5 Keep API mapping tolerant of old and new backend DTO shapes during rollout.

## 3. Cache Keys and Rendering

- [x] 3.1 Include active locale in any catalog request URL, query key, or cache key used by product list, search, category, and product detail flows.
- [x] 3.2 Update product mapper/types to keep localized fields returned by the backend, including optional SEO, material, care, and short description fields.
- [x] 3.3 Render localized product and category `name`, `slug`, `description`, and related catalog fields returned by the backend.
- [x] 3.4 Keep color swatch rendering based on technical color/hex data and size rendering based on size codes.

## 4. Verification

- [x] 4.1 Verify product search/list requests include `locale=vi` by default.
- [x] 4.2 Verify product detail requests include `locale=vi` by default.
- [x] 4.3 Verify search/list/detail pages render Vietnamese catalog content when the backend returns localized fields.
- [x] 4.4 Run frontend lint or equivalent verification.
