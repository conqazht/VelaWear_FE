## ADDED Requirements

### Requirement: Default storefront locale

The storefront SHALL maintain an active catalog locale and MUST default that locale to Vietnamese (`vi`).

#### Scenario: Storefront initializes without user locale

- **WHEN** the storefront loads without a selected locale
- **THEN** catalog requests use `vi` as the active locale

### Requirement: Locale-aware catalog requests

The storefront SHALL pass the active locale to backend product and category catalog requests.

#### Scenario: Product list request includes locale

- **WHEN** the storefront requests a product list or search result
- **THEN** the request includes the active locale

#### Scenario: Product detail request includes locale

- **WHEN** the storefront requests product detail data
- **THEN** the request includes the active locale

#### Scenario: Category request includes locale

- **WHEN** the storefront requests category catalog data
- **THEN** the request includes the active locale

### Requirement: Locale-aware catalog caching

The storefront SHALL include the active locale in catalog cache or query keys for product lists, product details, search results, and category data.

#### Scenario: Same catalog request in two locales

- **WHEN** the storefront caches the same product, search, or category request for two different locales
- **THEN** each locale uses a distinct cache key or request URL

### Requirement: Localized catalog field rendering

The storefront SHALL render localized product and category fields returned by the backend for the active locale.

#### Scenario: Product DTO contains localized fields

- **WHEN** a product DTO contains localized `name`, `slug`, `description`, SEO, material, or care fields
- **THEN** the storefront renders those resolved fields without selecting from a translation map

#### Scenario: Category DTO contains localized fields

- **WHEN** a category DTO contains localized `name`, `slug`, description, or SEO fields
- **THEN** the storefront renders those resolved fields without selecting from a translation map

### Requirement: Language-neutral color and size display

The storefront SHALL keep color and size display based on technical color and size data rather than database-backed translations.

#### Scenario: Product variant contains color

- **WHEN** a product variant has color code/name and hex data
- **THEN** the storefront renders the swatch using the technical color data

#### Scenario: Product variant contains size

- **WHEN** a product variant has a size code such as `XS`, `M`, `XXL`, or `35`
- **THEN** the storefront renders the size code directly
