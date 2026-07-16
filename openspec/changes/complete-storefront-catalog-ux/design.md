## Context

Collection and Search currently own different local filter models, while the backend product endpoint cannot sort by effective price. The header hard-codes repeated `/collection` links, PDP size-guide anchors are inert, review summaries are computed from a partial page, and query errors discard cached results.

## Goals / Non-Goals

**Goals:** one shareable catalog URL model; meaningful facets and sorts; real mega-menu destinations; separate size guide; paged public reviews and completed-order review creation; stable, full-width shop error behavior; Vietnamese handoff docs.

**Non-Goals:** review edit/delete/moderation, a size-management CMS, runtime scraping, or redesigning unrelated home/admin product lists.

## Decisions

### URL is the catalog source of truth
Collection and Search parse and serialize the same query model. OR applies within category/color/size groups and AND across groups. Desktop commits immediately; mobile keeps draft selections until Apply.

### Navigation is configuration-driven
All desktop and mobile menu leaves share typed catalog link definitions. Parent labels remain navigable and chevrons only control disclosure. Per-leaf subtitles are removed; one orange left-rail CTA remains.

### Size guide is a dedicated route
`/size-guide` consumes category, selected size, and product slug. Static reference data is versioned locally, converted from canonical centimetres, and clearly labeled advisory.

### Reviews separate preview from exploration
PDP renders three text-only previews with per-comment expansion. A URL-addressable modal fetches ten reviews per page, summary, filters, sorts, and images. Completed order items own the authenticated write entry point.

### Cached data is never treated as a fatal route error
Initial no-data failures use the route status surface. Background failures retain data and show a retry banner. Client validation prevents invalid price/filter requests, and retry policy excludes deterministic 4xx responses.

## Risks / Trade-offs

- Effective pricing can change with user/quota state; query keys include auth state and checkout remains authoritative.
- Static size measurements are advisory; the UI includes explicit fit disclaimers and centralizes future edits.
- The review modal and order form add interaction complexity; focus trapping, Escape, keyboard stars, and responsive tests are required.

## Migration Plan

1. Land the additive backend storefront/review contracts.
2. Switch Collection/Search/header links to the new contract.
3. Add size guide and review UI.
4. Apply shared error behavior and route status variants.
5. Verify full-stack flows, update Vietnamese docs, then deploy backend before frontend.
