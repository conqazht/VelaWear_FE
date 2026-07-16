## Why

The storefront currently exposes incomplete filters, decorative mega-menu links, no usable size guide, a truncated review experience, and error states that replace usable cached data. These gaps block normal product discovery and make transient API failures look like fatal 400/500 pages.

## What Changes

- Replace the independent Collection/Search implementations with one URL-driven storefront catalog backed by public facets and effective pricing.
- Expand the header into accessible Vela mega-menus whose leaves point to real catalog queries.
- Add a dedicated responsive size-guide route with reference measurements and cm/in conversion.
- Add paged review browsing plus completed-order review submission with optional images.
- Centralize retry/error classification so cached content survives background failures and route errors fill the shop content area.
- Add detailed Vietnamese maintenance and troubleshooting documentation.

## Capabilities

### New Capabilities
- `storefront-catalog-ux`: URL-driven product discovery, menu navigation, size guidance, review browsing/submission, and resilient storefront status behavior.

## Impact

- Affected routes: Collection, Search, product detail, size guide, order detail, and top-level shop error/not-found surfaces.
- Affected shared code: storefront API/query types, navigation configuration, review API helpers, and status/retry utilities.
- Backend dependency: coordinated `complete-storefront-catalog-ux` change in the commercial backend.
