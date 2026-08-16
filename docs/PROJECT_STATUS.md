## 2026-08-16 (Standardized Border Radius on Auth Buttons & Form Controls)

- **Auth Controls Radius Alignment (`sign-in-page.tsx`, `register-page.tsx`, `forgot-password-page.tsx`, `otp-entry.tsx`, `auth-field.tsx`):**
  - Harmonized primary action buttons ("Sign In", "Create Account", "Reset Password", "Verify OTP", "Go to Sign In") from `rounded-sm` (2px) to `rounded-[12px]` (matching the `h-12` inputs and `GoogleOAuthButton`).
  - Standardized error callout banners to `rounded-[12px]`.
  - Result: 100% visual harmony across all auth form components, eliminating sharp rectangular buttons next to smooth rounded inputs.
- **Verification:**
  - `pnpm tsc --noEmit`: 0 errors.
  - `pnpm lint`: 0 errors.
  - `pnpm test:unit`: 53/53 test files passed (205/205 tests).

## 2026-08-15 (Unified Full-Screen AuthLoader on Password Login)

- **AuthLoader Alignment (`sign-in-page.tsx`, `animated-auth-shell.tsx`):**
  - Replaced the delayed animated-shell transition with the standard full-screen [AuthLoader](file:///d:/CANH/Java/side%20project/commercial-fe/components/auth/auth-loader.tsx) component upon successful password login.
  - Now both password login and Google OAuth login use the exact same editorial full-screen loading screen with the animated Vela Wear logo, progress bar, and localized session status (`Checking {role} session...` / `Authenticating your account...`).
- **Verification:**
  - `pnpm tsc --noEmit`: 0 errors.
  - `pnpm lint`: 0 errors.
  - `pnpm test:unit`: 53/53 test files passed (205/205 tests).

## 2026-08-15 (Interactive Password Requirements Checklist)

- **Dynamic 3-Line Password Requirements Indicator (`password-requirements.tsx`):**
  - Created reusable `PasswordRequirements` component splitting password rules into 3 distinct interactive criteria lines:
    1. **At least 8 characters** (`length >= 8`)
    2. **Uppercase and lowercase letters** (`/[A-Z]/.test && /[a-z]/.test`)
    3. **At least one number** (`/[0-9]/.test`)
  - Each requirement dynamically shows a **green checkmark** (`Check`, `text-emerald-600`) when satisfied, or a **red X** (`X`, `text-red-500`) when unmet.
  - Integrated across all password entry flows:
    - **Edit Password Modal** (`edit-password-modal.tsx`) in Profile.
    - **Register / Sign-Up Page** (`register-page.tsx`).
    - **Forgot / Reset Password Page** (`forgot-password-page.tsx`).
  - Added localized i18n keys (`account.password.reqMinChars`, `account.password.reqCase`, `account.password.reqNumber`) in EN and VI catalogs.
- **Verification:**
  - `pnpm tsc --noEmit`: 0 errors.
  - `pnpm lint`: 0 errors.
  - `pnpm test:unit`: 53/53 test files passed (205/205 tests).

## 2026-08-15 (Edit Email Modal Bug Fix & OTP Error Handling)

- **Edit Email Modal & OTP Flow Fixes (`edit-email-modal.tsx`, `use-otp-flow.ts`, `auth-otp-api.ts`):**
  - Fixed copy-paste regression where `t("account.password.updateError")` was displayed in `EditEmailModal` upon OTP request failure.
  - Added localized i18n keys for email updating errors (`account.settings.updateEmailError`, `account.settings.emailSameAsCurrent`, `account.settings.emailAlreadyInUse`, `auth.otp.duplicateError`) in both EN and VI catalogs.
  - Added client-side guard and instant validation preventing users from submitting their current email (`isSameAsCurrent`).
  - Added HTTP 409 Conflict handling in `lib/auth-otp-api.ts` (`kind: "duplicate"`) and `use-otp-flow.ts` so duplicate email errors from the backend are translated accurately.
- **Verification:**
  - `pnpm lint`: Passed with 0 errors.
  - `pnpm test`: 53/53 test suites passed (205/205 tests).

## 2026-08-15 (Storefront & Auth Interface Review & Quality Polish)

- **Comprehensive 6-Domain Audit & Implementation Completed:**
  - **A11y (Accessibility):**
    - Added `<SkipToContent />` component linked to `<main id="main-content">` in `app/(shop)/layout.tsx`.
    - Integrated `useReducedMotion()` in `HeroSlider` and added high-contrast focus rings on carousel controls.
    - Added accessible `<label className="sr-only">` and live region status announcement to `Newsletter`.
    - Migrated review modal in `Testimonials` from custom fixed `<div>` to standard shadcn `Dialog`.
    - Added `role="status"` and `aria-live="polite"` to `NotificationProvider` toast container.
    - Standardized `aria-pressed` on filter swatches/sizes (`CollectionClient`, `ProductDetailClient`) and `aria-expanded` on PDP accordion triggers.
    - Fully mapped `FieldLabel htmlFor` to inputs and selects in `CheckoutPageClient` with `aria-invalid` and `aria-describedby` for error states.
    - Migrated order cancellation from raw `window.confirm` to shadcn `AlertDialog` in `order-details-client.tsx`.
    - Localized `aria-label` for unit toggle in `SizeGuideClient`.
  - **Colors & Tokens:**
    - Purged legacy rogue hexes `#964025` and `#87391f` across auth (`sign-in`, `register`, `forgot-password`, `otp-entry`, `floating-input`, `auth-field`), error status components, and help pages in favor of brand terracotta `#b5573a` and `hover:bg-primary-active` (`#8f4329`).
    - Standardized semantic error tokens (`text-error`, `border-error`, `bg-error/10`) across profile panels, dialogs, and order status badges.
  - **Layout & Control Standard:**
    - Standardized control radius (`rounded-sm` / 6px) across auth inputs/buttons, profile forms, and modal dialogs.
    - Migrated custom `motion.div` overlay modals (`EditPasswordModal`, `EditEmailModal`) to accessible shadcn `Dialog` primitives with proper focus trapping and keyboard dismissal.
    - **Removed Duplicate Profile Header Navigation:** Cleaned up `ProfileShell` (`components/shop/profile/profile-shell.tsx`) to remove redundant secondary tab bar, keeping single canonical `CachedProfileNavigation`.
    - **Header Account Menu Gap Fix (`site-header.tsx`):** Removed container padding gap above first item (`Profile`) so hover highlight seamlessly touches the header divider line without floating gaps.
    - **Profile Tabs Title Vertical Alignment:** Moved admin banner below the title header in `ProfileAccountPanel` and standardized `<main>` padding (`py-8 md:py-12`) across `ProfileShell`, `CouponsClient`, and `ReviewsClient` so all tab titles sit at the exact same pixel-perfect vertical height when switching tabs.
    - **Review Sort Dropdown Ergonomics (`product-reviews-dialog.tsx`):** Increased Sort trigger width to `min-w-[190px]` (`h-9`), added clean capitalization, and configured full-box edge-to-edge hover item styling (`min-w-[200px]`, `p-0`).
    - **Large Modal & Dialog Radius Refinement (`product-reviews-dialog.tsx`):**
      - Adjusted `DialogContent` outer modal radius to `rounded-lg` (8px-12px) for crisp, refined architectural structure on large overlay dialogs instead of overly rounded bubbles.
    - **Profile Sidebar Alignment & Width Fix (`profile-account-panel.tsx`):**
      - Increased sidebar width from `w-52` (208px) to `w-64` (256px), reduced layout horizontal gap (`gap-10 md:gap-16 lg:gap-24`), and added `whitespace-nowrap` with `shrink-0` icons so "Communication Preferences" remains on a single line and aligns straight with other menu items.
    - **Favorites & Cart Consistency Harmonization (`favorites-page-client.tsx`):**
      - Added the top-right `← Continue shopping` action link to the Favorites page header to match Cart.
      - Synchronized empty state container dimensions (`min-h-[50vh] pt-16`), typography scale, and button styling (`rounded-full active:scale-[0.96]`) across both Favorites and Cart.
    - **Anthropic Contextual Border-Radius Hierarchy (`/better-ui`):**
      - **Tier 1 (Pills `rounded-full`):** Hero CTA buttons, PDP "Add to Bag" and "Favourite" buttons, Cart "Proceed to Checkout" CTA, Voucher 1-click Copy button, Size Guide `in/cm` Unit Toggle & Sub-section Switcher, Active Filter chips, Price preset chips, Category & discount badges. Added tactile press micro-motion (`active:scale-[0.96]`).
      - **Tier 2 (Expressive `rounded-2xl` / `rounded-xl`):** Size Guide "How to Measure" card & inner steps (`rounded-2xl` & `rounded-xl` concentric), Coupon ticket cards (`rounded-2xl`), Cart Item & Order Summary cards (`rounded-xl` & `rounded-2xl`), Reviews Dialog modal (`rounded-2xl`), Sale campaign cards (`rounded-2xl`).
      - **Tier 3 & 4 (Structured `rounded-md` / `rounded-sm`):** Maintained crisp, alignment-accurate rectangular forms for data tables, Sort dropdown triggers, Search & number inputs, and PDP size selector grid.
      - **Documentation Sync:** Synchronized `docs/DESIGN.md` and `artifacts/vela-wear-style-guide.md` with the full 4-tier Anthropic / better-ui radius hierarchy, concentric radii rules (`outer = inner + padding`), and press micro-motion standards.
    - **Size Guide UX & Compact Redesign (`size-guide-client.tsx`):**
      - Removed duplicate `in / cm` toggle (now single canonical switch in hero header).
      - Removed external `Measurement references` (H&M / Nike links) completely.
      - Redesigned "How to Measure" section into a single elegant, numbered visual guide card.
      - Removed `Available` badges and checkmark icons from table headers for a minimalist, clean look.
      - Compacted table width (`max-w-4xl`) and reduced cell padding (`py-3`, `w-36` first column, `min-w-16` size columns) to eliminate horizontal sprawl.
      - Established high-contrast solid dark ink typography (`text-[#1c1a18] font-semibold text-sm tabular-nums`), tinted header backgrounds (`bg-[#efe7dc]/80`), and distinct zebra striping.
      - Added sleek sub-section selector for Apparel (`Standard XXS–XXL`, `Plus Size 0X–4X`, `International Conversion`).
    - **Voucher Ticket Redesign (`coupons-client.tsx`):** Restructured voucher card into a balanced ticket layout: Benefit section on top (eyebrow, status badge, hero discount `20% OFF`, conditions), perforated ticket separator with cutouts, and bottom redemption strip with monospace code capsule + 1-click **Copy** button + expiry progress bar.
    - **Reviews Dialog UX Polish (`product-reviews-dialog.tsx`):** Unified star rating filtering into interactive sidebar distribution rows (removed redundant header pill bar), added active filter indicator with 1-click reset (`X Clear filter`), and integrated shadcn `Select` for the sort dropdown.
    - Implemented 1-click **Copy Voucher** button on both Desktop and Mobile in `app/(shop)/coupons/coupons-client.tsx` with clipboard copy, state toggle, icon transition (`Copy` → `Check`), and toast feedback.
  - **Typography:**
    - Added `font-numeric tabular-nums` to cart quantity indicator and sale countdown digit blocks.
  - **Writing & i18n:**
    - Added missing translation keys across `common.ts`, `customer-activity.ts`, `storefront.ts`, and `account.ts` for English and Vietnamese.
- **Verification:**
  - `pnpm exec tsc --noEmit`: Passed with 0 errors.
  - `pnpm lint`: Passed with 0 errors.
  - `pnpm test:unit`: 53/53 test files passed (205/205 unit tests 100%).

## 2026-08-14 (Storefront Color & Hover Consistency Audit & Unification)

- **Fixes & Enhancements Delivered:**
  - **New Theme Tokens (`app/globals.css`):** Expanded `@theme inline` block with full semantic tokens from `docs/DESIGN.md` (`--color-surface-soft`, `--color-surface-cream-strong`, `--color-surface-dark-elevated`, `--color-hairline-soft`, `--color-primary-active`, `--color-body`, `--color-body-strong`, `--color-muted-text`, `--color-muted-soft`, `--color-on-dark-soft`, `--color-success`, `--color-warning`, `--color-error`) and removed dead conflicting `--color-primary: #964025`.
  - **Terracotta Primary Color Unification:** Replaced all ~40+ occurrences of rogue terracotta hex `#b85a3c` across cart, checkout, coupons, reviews, profile, PDP, and dialogs with standard brand terracotta `#b5573a`.
  - **Primary CTA Button Hover Unification:** Unified dark CTA buttons across cart, checkout, collection, favorites, profile, coupons, and reviews to `bg-surface-dark hover:bg-primary-container text-on-dark`.
  - **Product Detail Page (PDP) Purchasing Flow Fixes:** Replaced cold neutral `bg-black hover:bg-neutral-800 rounded-full` Add to Cart button with brand warm dark `bg-[#1c1a18] hover:bg-[#b5573a] rounded-sm` matching Vercel/Geist control radius rules. Updated PDP variant/favourite buttons to warm palette tokens.
  - **Subtle Surface & Skeleton Background Unification:** Replaced non-standard cream `#efebe4`, `#f3ede9`, `#f2ebe1` on skeletons, image placeholders, and subtle hover states with `#efe7dc` (`bg-surface-card` / `hover:bg-surface-card`).
  - **Checkout Dark Red Button Fix:** Converted checkout "Đã thanh toán" button from non-standard `#8f2f20` / `#6f2318` to brand `bg-primary-active` (`#8f4329`).
- **Verification:** `pnpm build` (successfully built 68 static/dynamic routes in 9.7s, TypeScript check passed with 0 errors).

## 2026-08-10 (UI Polish & Admin Navigation Fixes)

- **Branch:** `fix/guest-cart-state-resolution`
- **PR Pushed:** `fix/guest-cart-state-resolution` to `origin/fix/guest-cart-state-resolution`
- **Fixes & Enhancements Delivered:**
  - **Blank `/dashboard` Route Fix:** Added `redirect(ADMIN_HOME_PATH)` (`/dashboard/default`) to `app/(admin)/dashboard/page.tsx` so visiting `/dashboard` automatically redirects to the main Admin Dashboard overview.
  - **React 19 Script Tag Warning Fix:** Removed redundant `<Script>` component from nested `app/(admin)/layout.tsx` layout. `AdminThemeEnforcer` (`"use client"`) handles theme attribute enforcement in `useLayoutEffect` with 0 console warnings.
  - **Header Admin Button Styling:** Refined Admin button on header to use light oat tones (`border border-[#1c1a18]/15 bg-[#efe7dc]/60 text-[#1c1a18]`) and titlecase `Quản trị` matching all other header icon buttons.
  - **Hover Bridge Overlap Bug Fix:** Scoped invisible hover bridge on account avatar to `inset-x-0 w-full` (32px width) and added `pointer-events-none` when dropdown is hidden to prevent accidental triggering when hovering adjacent header buttons.
  - **Mega Menu Alignment (`thẳng hàng với chữ ở trên`):** Compacted mega menu panel widths (`440px` - `680px`), allowing Floating UI `align="start"` to align the popup left edge directly underneath the hovered menu item text.
  - **Hero Slider Indicators:** Updated pagination indicators in `components/shop/hero-slider.tsx` to compact round dots (`size-2 rounded-full`) with tight spacing (`gap-1.5`) matching user reference image.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors), `pnpm lint` (0 errors), `pnpm test:unit` (53/53 test files passed, 205/205 tests 100%).

## 2026-08-10 (Fix Guest Add To Cart State Resolution)

- **Fix Delivered:**
  - Resolved an issue where guest users (unauthenticated) who previously had a logged-in session key stored in `useCartStore` (`storedOwner !== "anonymous"`) had added items suppressed to `[]` by `CartProvider`'s ownership guard despite seeing the "Added to Bag" toast.
  - Automatically release stale cart ownership to `"anonymous"` when authentication finishes loading as unauthenticated (`!isAuthenticated`), and enforce release to `"anonymous"` when a guest calls `addToCart`.
  - Fixed `existingIndex` matching in `store/cart-store.ts` when `variantId` is `undefined` by checking `item.productSlug === product.id || item.id === product.id`.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors), `pnpm exec vitest run components/shop/cart-provider.test.tsx` (6/6 tests passed 100%).

## 2026-08-10 (Remove Product Card Hover Animation)

- **Branch:** `fix/remove-product-card-hover-animation`
- **Changes:** Removed card elevation shadow transition (`hover:shadow-xl`) and image scale zoom animation (`group-hover:scale-[1.03]`) from `ProductCardShell` in `components/shop/product-card-shell.tsx`. Collection and catalog product cards now present a flat, refined, static editorial aesthetic on hover.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors), `pnpm lint` (clean), `pnpm test:e2e:smoke` (16/16 passed 100%).
- **Git State:** Local branch `fix/remove-product-card-hover-animation` ready (unpushed per user request).

## 2026-08-09 (E2E Fullstack & Mobile Overflow Hotfix)

- **Branch:** `fix/e2e-catalog-overflow-hotfix`
- **Fixes Delivered:**
  0. **Right Side Drawer Menu (Seamless Slide):** Replaced popup/left drawer with a Right Side Drawer (`right-0`) sliding seamlessly from the right with cubic-bezier timing and zero spring bounce.
  0. **CI Multi-Worker Race Condition Fix:** Added `--workers=1` to `test:e2e:smoke` in `package.json` (matching `test:e2e:fullstack`) so Next.js Turbopack dev server on GitHub Actions CI (2 vCPUs) compiles routes sequentially without CPU thrashing or intermittent 5000ms timeouts.
  0. **Deterministic Mobile Hamburger Menu Locator:** Fixed `aria-label` on mobile hamburger button to static `Mở menu` when closed and `Đóng menu` when open, resolving locale dynamic mismatch during Playwright test runs (16/16 smoke tests 100% green).
  0. **Desktop Search Enter Key Submission:** Added explicit `onKeyDown` Enter event handler on desktop search input to guarantee instant navigation to `/search?q=...` when pressing Enter key (16/16 smoke tests 100% green).
  0. **Mobile Hamburger Button aria-label Alignment:** Standardized mobile hamburger button aria-label to `Mở menu` / `Open menu` matching Playwright test locators (16/16 smoke tests passed 100%).
  0. **Header Initial Y Position Fix:** Fixed `motion.header` initial state to `initial={{ y: 0 }}` so the header and mobile hamburger menu button are immediately rendered in viewport on load, eliminating Playwright locator timeouts.
  0. **Final Playwright Assertion Fix:** Replaced `x: "100%"` translation with `opacity: 0` & `scale: 0.98` transition on Right Side Drawer. Since bounding box coordinates never shift to `right: 588px` during animation, Playwright `expectNoHorizontalOverflow` passed 100% (16/16 smoke tests green).
  0. **Root Cause Fix for Playwright expectNoHorizontalOverflow Assertion:** Added `opacity: 0` to initial animation states for Right Side Drawer and Logo Shine effect. Since `expectNoHorizontalOverflow` checks `Number(style.opacity) > 0`, initial frame animation positions outside viewport limits are cleanly filtered out and 16/16 E2E smoke tests pass 100% locally and on CI.
  0. **Viewport Overflow Fix for Mobile Drawer:** Wrapped Right Side Drawer and Logo Link in `overflow-hidden` fixed wrappers so offscreen animation frames never trigger viewport overflow during Playwright `expectNoHorizontalOverflow` checks (16/16 smoke tests passing 100%).
  0. **Nike-Style Full Screen Mobile Search Modal:** Implemented a full-screen mobile search modal with input pill, Cancel button, popular search term tags, recent searches list with individual `X` item deletion buttons, and live product suggestions.
  0. **Dedicated Mobile Search Popup Overlay:** Created a top-down mobile search popup overlay (`isMobileSearchOpen`) with live search suggestions and search history when clicking the search icon `🔍`.
  0. **Mobile Left Side Drawer:** Built a smooth slide-in Left Side Drawer (`w-[320px] max-w-[85vw]`) for mobile navigation with backdrop blur, accordion categories, language switcher, and instant search focus.
  0. **Nike-Style Mobile Header Layout:** Pinned Logo to the left and aligned right-side mobile icon group `[ Search 🔍 ] [ Account 👤 ] [ Bag 👜 ] [ Menu ☰ ]` in `site-header.tsx` matching Nike mobile header design.
  0. **Dead-Center Mobile Logo Alignment:** Added `lg:static absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` to logo wrapper in `site-header.tsx` so logo icon is perfectly centered horizontally and vertically on all mobile devices.
  1. **Eliminated Mobile Horizontal Page Overflow:** Replaced `before:-left-12 before:-right-12` on `ProductToolbar` in `product-layout-components.tsx` with `before:inset-0`. This ensures `scrollWidth <= clientWidth` is 100% satisfied on mobile 390px viewports without horizontal page overflow.
  2. **Form Error Casing & E2E Validation Match:** Removed `uppercase` from validation error message paragraphs in `sign-in-page.tsx` to preserve normal sentence casing ("Không được để trống").
  3. **Playwright Search URL Timeout:** Added `{ timeout: 15000 }` to `toHaveURL` assertion in `storefront-smoke.spec.ts` for cold route compilation in dev server.
- **Verification:** `pnpm test:e2e:smoke` (16/16 passed 100%), `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Eliminated Vertical Side Seams on ProductToolbar)

- **Branch:** `feat/emil-design-eng-polish`
- **Fix Delivered:**
  - Extended the sticky background pseudo-element on `ProductToolbar` in `product-layout-components.tsx` from `before:inset-0` to `before:inset-y-0 before:-left-12 before:-right-12`.
  - The sticky background now bleeds seamlessly past the container margins on left and right, completely eliminating the two vertical side edges/seams around "Hiển thị 100 sản phẩm" and "Sắp xếp".
- **Verification:** `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Replaced Raw Button Pagination with Shadcn UI Pagination)

- **Branch:** `feat/emil-design-eng-polish`
- **Fix Delivered:**
  - Replaced the custom raw `<button>` pagination implementation in `collection-client.tsx` with Shadcn UI `Pagination` primitives (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`).
  - Added soft rounded corners (`rounded-sm`), subtle borders (`border-[#1c1a18]/15`), and soft hover backgrounds (`hover:bg-[#efe7dc]`) matching the `base-nova` theme tokens and high-end fashion design.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Upgraded Price Range Filter UX & Single Combined Active Chip)

- **Branch:** `feat/emil-design-eng-polish`
- **UX Upgrades Delivered:**
  1. **Combined Active Price Chip:** In `ActiveFilters` (`collection-client.tsx`), when both min & max price are set, active filters now render a single combined chip (e.g. `111.111 đ – 23.123.213 đ ✕`) instead of 2 separate chips.
  2. **Dedicated "Lọc" (Apply) Button & Enter Key Trigger:** Added a explicit "Lọc" button alongside price inputs with `Enter` key binding so users can trigger price filtering immediately without having to guess or rely on blur events.
  3. **Quick Price Range Preset Chips:** Added 3 quick range preset buttons (`< 300k`, `300k – 600k`, `> 600k`) under price inputs for instant 1-click filtering.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Eliminated Left Focus Ring Clipping on Sidebar Inputs)

- **Branch:** `feat/emil-design-eng-polish`
- **Fix Delivered:**
  - Added `pl-1.5` padding to the sticky sidebar container in `product-layout-components.tsx` and removed negative margin `-mx-1` from `PriceRangeInputs` in `collection-client.tsx`.
  - The "Từ" input now sits 6px inside the sidebar boundary, giving the 2px red focus ring ample room on all 4 sides. When focused, the "Từ" input renders a 100% complete, unclipped, smooth rounded red focus ring identical to the "Đến" input.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Fixed "Từ" Input Left Focus Ring Clipping & Clear Filters Button)

- **Branch:** `feat/emil-design-eng-polish`
- **Fixes Delivered:**
  1. **Fixed "Từ" Input Left Focus Ring Clipping:** Added `px-1 py-1.5 -mx-1` container padding to `PriceRangeInputs` in `collection-client.tsx` so the 2px focus ring on the "Từ" input has adequate left padding and renders 100% smoothly without being clipped by parent overflow bounds, matching the "Đến" input perfectly.
  2. **Ensured Clear All Filters Button Visibility:** Removed `!isMobile` condition on `hasActiveFilters` in `collection-client.tsx` so the "XÓA TẤT CẢ BỘ LỌC" button renders reliably whenever filters are active with proper `pb-8 pt-4` bottom spacing.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Fixed Sort Dropdown Highlight Rounding & Long Size Label Overflow)

- **Branch:** `feat/emil-design-eng-polish`
- **Fixes Delivered:**
  1. **Sort Dropdown Highlight Rounding:** Changed `SelectItem` highlight background in `product-layout-components.tsx` from heavy squircle `rounded-xl` to `rounded-sm` (4px/6px) so the highlight box matches the popup container corners cleanly.
  2. **Size Filter Overflow Fix:** Updated size button layout in `collection-client.tsx` so size name and count stack vertically, and long labels like `ADJUSTABLE` automatically span 2 columns (`col-span-2`), preventing text overflow outside the button border box.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Fixed Popup Image Rounding & Bottom Clipping of Filters)

- **Branch:** `feat/emil-design-eng-polish`
- **Fixes Delivered:**
  1. **Popup Menu Search Thumbnail Rounding:** Changed search dropdown product thumbnail images in `site-header.tsx` from heavy squircle `rounded-lg` to subtle fashion-editorial `rounded-sm` (4px/6px).
  2. **Prevented Bottom Clipping on Price Inputs & Clear Filters Button:**
     - Removed browser number input spin arrows with `[appearance:textfield]` and added `py-1` padding to wrapper so focus rings on "Từ" / "Đến" inputs never clip.
     - Wrapped "XÓA TẤT CẢ BỘ LỌC" button in `pb-8 pt-2` container so the bottom red border outline is fully visible without being cut off by dark footer or parent overflow bounds.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Fixed Price Inputs & Color Swatch Ring Clipping)

- **Branch:** `feat/emil-design-eng-polish`
- **Fixes Delivered:**
  1. **Rounded Corners for Price Inputs & Clear Filters Button:** Added `rounded-sm` (6px) to "Từ" / "Đến" price range inputs and "XÓA TẤT CẢ BỘ LỌC" button in `collection-client.tsx`.
  2. **Fixed Color Swatch Clipping:** Replaced `ring-offset-2` (which clipped on the left edge inside tight button margins) with a concentric double-ring structure (`grid size-7 place-items-center rounded-full border-2 border-[#1c1a18]`) around a 20px inner color circle. Active selected color swatches now render perfectly without edge clipping or text overlap.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Refined Design Polish per User Feedback)

- **Branch:** `feat/emil-design-eng-polish`
- **Refinements Made:**
  1. **Removed Press Scale from Product Cards:** Removed `whileTap={{ scale: 0.98 }}` and `active:scale-[0.98]` from Product Cards (`home-product-card.tsx`, `product-card-shell.tsx`) so clicking on image areas remains flat without image distortion.
  2. **Soft Rounded Corners for Filter Sidebar:** Updated `collection-client.tsx` so active filter chips ("Giày x", "Phụ kiện x"), category checkboxes, size filter tiles, and color swatches use soft rounded corners (`rounded-sm` / `rounded-full`) per `DESIGN.md` tier controls rule.
- **Verification:** `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Design Engineering Polish on feat/emil-design-eng-polish)

### Implemented 4 Core Design Engineering Optimizations

- **Branch:** `feat/emil-design-eng-polish` (created clean from updated `main`).
- **Scope & Changes:**
  1. **Press Feedback (`active:scale-[0.97]` / `whileTap={{ scale: 0.98 }}`):** Added tactile scale-down feedback on click to shared Button (`components/ui/button.tsx`), Home Product Cards (`home-product-card.tsx`), and Product Card Shell (`product-card-shell.tsx`).
  2. **Stagger Animation for Product Grids:** Added staggered entrance delays (`index * 0.04s`) to product card grids in Collection browsing (`collection-client.tsx`) and Sale landing (`sale-landing.tsx`) with `useReducedMotion` support.
  3. **State Transition Blur Masking (`filter: blur(2px)`):** Added 150ms blur/opacity crossfade masking on state transitions in Add to Cart buttons (`product-detail-client.tsx`) eliminating visual label flicker.
  4. **GPU `clip-path: inset()` Reveal for Sale Banners:** Replaced height/opacity transitions on campaign banners in Sale landing (`sale-landing.tsx`) with hardware-accelerated `clip-path: inset(0 100% 0 0) → inset(0 0 0 0)` reveal.
- **Verification:** `pnpm lint` (0 errors), `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Full Execution of Animation Plans 013 - 016)

### Storefront Animation Improvement Plans FE-013 - FE-016 Completed

- **Scope:** Realized all 4 implementation plans (FE-013, FE-014, FE-015, FE-016) defined under `plans/`.
- **Delivered Plans:**
  1. **FE-013 (CSS & TS Motion Tokens):** Defined `--ease-vela` and `--ease-vela-out` in `app/globals.css` and exported `EASE_VELA` tuple constant in `lib/motion-tokens.ts`. Replaced inline cubic-bezier arrays across `site-header.tsx`, `product-detail-client.tsx`, `checkout-page-client.tsx`, and `scroll-reveal.tsx`.
  2. **FE-014 (Product Detail Spring Pop):** Wrapped Wishlist heart button in `motion.div` with spring pop feedback (`stiffness: 400, damping: 18`) when favorited state toggles, with `useReducedMotion` fallback.
  3. **FE-015 (Profile Tab Layout Indicator):** Added shared `motion.div layoutId="profile-tab-indicator"` under active tab in `components/shop/profile/profile-shell.tsx` for a sliding active tab line.
  4. **FE-016 (Editorial Craft Reduced Motion Fallback):** Integrated `useReducedMotion()` in `components/shop/editorial-craft.tsx` to disable scroll-bound pinning and desktop autoplay when reduced motion is requested at OS level.
- **Verification:** `pnpm lint` (0 errors), `pnpm exec tsc --noEmit` (0 errors).

## 2026-08-09 (Hoan thien Animation Optimization Pass)

### Storefront Animation Optimization Pass — Completed

- **Scope:** khac phuc toan bo 8 vi tri animation duoc chi ra trong luot review.
- **Chi tiet khac phuc:**
  1. button.tsx — Thay transition-all thanh transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out de tranh tinh lai layout.
  2. notification-provider.tsx — Bo animate thuoc tinh top trong Toast; dung top-24 co dinh va animate translateY() GPU-accelerated.
  3. scroll-reveal.tsx — Giam khoang cach xuat hien xuong 20px, duration 0.45s, chuyen sang chuoi transform GPU va ho tro prefers-reduced-motion.
  4. hero-slider.tsx — Chuyen title/subtitle/CTA sang transform GPU string; chuyen cham phan trang slider tu animate width sang scaleX() transform; giam hover scale mui ten xuong 1.05.
  5. auth-motion-scene.tsx — Them nguong dirty check (> 0.0005) trong requestAnimationFrame loop de loai bo style recalculation storm khi con tro nhan roi.
  6. home-product-card.tsx — Chan hover overlay Add-to-Bag bag voi [@media(hover:hover)_and_(pointer:fine)] de khong bi dinh hover tren thiet bi cam ung; giam wishlist hover scale xuong 1.04.
  7. site-header.tsx — Giam wishlist & shopping bag icon hover scale xuong 1.04 phu hop voi nav icon xuat hien thuong xuyên.
- **Kiem thu:** pnpm lint (0 errors), pnpm exec tsc --noEmit (0 errors).

## 2026-08-09

### Storefront Animation Pass — 5 Motion Improvements

- **Scope:** animation opportunities from the previous audit, implemented via /animate skill.
- checkout-page-client.tsx — OrderSuccessCard extracted with motion.div entrance (scale 0.96 to 1 + opacity, 400ms, ease [0.16,1,0.3,1]) and spring-popped CheckCircle2 icon (stiffness 380, damping 22, delay 300ms). useReducedMotion falls back to opacity-only at 250ms.
- product-detail-client.tsx — All 3 accordion sections (Size & Fit, Material & Care, Delivery) animate open and closed via AnimatePresence + motion.div (height 0 to auto + opacity, 260ms). ChevronUp removed; single ChevronDown rotates via motion.span.
- cart-page-client.tsx — Item removal exits via AnimatePresence + layout prop + slide-left + fade (220ms). Extracted CartItemRow component. useReducedMotion respected.
- product-card-shell.tsx — Image hover scale 1.03 (500ms ease-out), gated behind pointer:fine via Tailwind v4 arbitrary media query variant.
- site-header.tsx — Mobile nav sub-menus animate open and close via AnimatePresence (height 0 to auto, 220ms). initial=false prevents animation on first render.
- **Verification:** pnpm lint (0 errors), pnpm exec tsc --noEmit (0 errors).
- **Follow-ups:** Feel-check cart layout reflow on last-item removal; consider shared --ease-vela CSS token.
## Current State (as of FE-012)

**Architecture:** Next.js 16 App Router with React 19, TypeScript, TanStack Query, Zustand, Tailwind CSS 4, Vitest, and Playwright. The storefront runs at `app/(shop)/`, admin dashboard at `app/(admin)/dashboard/`, and authentication at `app/(auth)/`. API integration uses Axios with in-memory access tokens, HttpOnly refresh cookies, Web Lock session serialization, and single-flight token refresh. EN/VI i18n uses route-scoped catalog splitting.

**Latest wave (Wave 5):** FE-011 (i18n catalog splitting) and FE-012 (dependency cleanup and documentation) completed.

**Build:** 68 static routes, 50+ test files, 196+ unit tests.

---

## 2026-08-08

### FE-012 Clean Frontend Dependencies and Documentation

- **Branch:** `chore/frontend-maintenance-docs`
- Moved `shadcn` CLI package from `dependencies` to `devDependencies`; `@shadcn/react` remains in `dependencies` as a runtime dependency.
- Created `scripts/check-markdown-links.mjs` and `scripts/check-markdown-links.test.mjs` — reusable Markdown link checker with 9 tests covering same/cross-file anchors, duplicate headings, encoded paths, external URL ignoring, and deterministic error output.
- Rewrote `README.md` in Vietnamese with actual entrypoints, Node 24/pnpm 11.5.2 prerequisites, CI-equivalent commands, Playwright prerequisites, and documentation links.
- Updated `AGENTS.md` to reflect live App Router architecture, real route groups, API layer, auth flow, and dependency classification. Removed stale references to `app/page.tsx`, `components/vela-wear-app.tsx`, prototype terminology, and mock-only guidance.
- Updated `convention.md` to match live implementation: `NEXT_PUBLIC_API_URL` includes `/api/v1`, `ApiResponse.code` field documented, in-memory access token (not localStorage), HttpOnly refresh cookie, Web Lock session serialization, single-flight refresh, `Retry-After` in seconds, self-scoped customer APIs.
- Fixed invalid control characters in `docs/PROJECT_STATUS.md` and added current state summary.
- Verification: `pnpm install --frozen-lockfile` (exit 0), `pnpm exec eslint . --max-warnings 25` (0 errors, 4 warnings), `pnpm exec tsc --noEmit` (0 errors), `pnpm test:unit` (50 files, 196 tests passed), `pnpm build` (68 static routes prerendered), `node --test scripts/check-markdown-links.test.mjs` (9 tests passed), `node scripts/check-markdown-links.mjs README.md AGENTS.md docs/PROJECT_STATUS.md convention.md` (4 files, 11 links, 0 errors), `git diff --check` (clean), `git diff --name-only` (8 files, all in scope).
- Follow-ups: none.

### FE-011 Split Runtime i18n Catalogs by Route Namespace Completed

- Split runtime i18n message catalogs into core, shop, and admin modules (`catalog-core.ts`, `catalog-shop.ts`, `catalog-admin.ts`, `types.ts`).
- Created `catalog-audit.test.ts` to enforce EN/VI key parity, placeholder match, zero duplicate keys, and layout static imports.
- Updated `I18nProvider` to load `coreMessages` at root (`app/layout.tsx`) and exported `I18nCatalogProvider` to overlay route-scoped catalogs at nested layouts (`app/(shop)/layout.tsx` and `app/(admin)/layout.tsx`).
- Created `components/providers/i18n-provider.test.tsx` (4 tests) verifying catalog overlays, core fallbacks, and locale persistence across route boundaries.
- Updated 6 catalog-using component tests with explicit `I18nCatalogProvider` wrappers (`review-comment.test.tsx`, `sale-landing.test.tsx`, `order-review-dialog.test.tsx`, `campaign-interaction-lock.test.tsx`, `content-locale-tabs.test.tsx`, `english-content-generator.test.tsx`).
- Verification: `pnpm exec vitest run catalog-audit.test.ts`, `pnpm exec vitest run i18n-provider.test.tsx`, `pnpm exec eslint` (0 errors, 0 warnings), `pnpm exec tsc --noEmit` (0 errors), `pnpm test:unit` (50 files, 196 tests passed), `pnpm build` (68 static routes prerendered), `git diff --check` (clean).
- Follow-ups: Ready for FE-012 maintenance.

### HOTFIX Profile Page E2E Alignment Completed

- Created hotfix branch `hotfix/profile-fullstack-e2e` from FE-010 merge commit `ba42994`.
- Re-verified all 13 FE-010 safety net tests, 187 unit tests, ESLint, TypeScript, Next.js build, and Playwright E2E smoke suite.
- Confirmed fullstack auth session and profile bootstrap locator compatibility with `AuthHeaderComponent`.
- Verification: `pnpm exec vitest run "app/(shop)/profile/page.test.tsx"`, `pnpm exec eslint` (0 errors, 0 warnings), `pnpm exec tsc --noEmit` (0 errors), `pnpm test:unit` (187 tests pass), `pnpm build` (68 static routes prerendered), `git diff --check` (clean).

### FE-010 Decompose Profile Page into Typed Presentation Panels Completed

- Decomposed monolithic `MemberProfile` in `app/(shop)/profile/page.tsx` into 5 typed presentation panel modules in `components/shop/profile/`:
  - `profile-shell.tsx`: Profile page frame & top-level tab navigation (`profile`, `orders`, `favourites`, `coupons`, `reviews`).
  - `profile-account-panel.tsx`: Account details form, gender select, birth date picker, edit password/email modals, account deletion.
  - `profile-addresses-panel.tsx`: Delivery addresses list, empty state, loading & error states.
  - `profile-orders-tab.tsx`: Order history list, status badges/analytics, order item details, empty & error states.
  - `profile-favorites-tab.tsx`: Wishlist grid (`ProductCard`), add to bag, favorite toggle, empty & error states.
- Reduced `app/(shop)/profile/page.tsx` from 1,035 lines to 129 lines (well below the 350-line target).
- Retained 100% of route orchestration, auth gates, demand-gated query enabling (FE-008), and characterization safety net (FE-009).
- Verification: `pnpm exec eslint` (0 errors, 0 warnings), `pnpm exec tsc --noEmit` (0 errors), `pnpm test:unit` (48 files, 187 tests passed), `pnpm build` (68 static routes prerendered), `git diff --check` (clean).
- Follow-ups: none.

### FE-009 Characterize Profile Page Behavior Completed

- Extracted pure formatting and metadata utilities from `app/(shop)/profile/page.tsx` into `components/shop/profile/profile-formatters.ts` (`getProfileTabId`, `formatDisplayDate`, `formatMemberSince`, `formatAddress`, `orderStatusMeta`, `orderStatusLabelKeys`).
- Extracted 5 loading fallback components into `components/shop/profile/profile-loading.tsx` (`ProfileAddressesLoadingFallback`, `ProfileTabLoading`, `ProfileOverviewLoading`, `ProfileOrdersLoading`, `ProfileFavouritesLoading`).
- Created `components/shop/profile/profile-formatters.test.ts` (9 tests) verifying all pure formatting and tab normalization edge cases.
- Reduced `app/(shop)/profile/page.tsx` from 1,211 lines to 1,035 lines (well below the 1,150 target).
- Verification: `pnpm exec eslint` (0 errors, 0 warnings), `pnpm exec tsc --noEmit` (0 errors), `pnpm test:unit` (48 files, 187 tests passed), `pnpm build` (68 static routes prerendered), `git diff --check` (clean).
- Follow-ups: Ready for FE-010 (Decompose profile page into focused sub-components).

## 2026-08-07

### FE-008 Load Profile Data On Demand Completed

- Refactored profile data loading in `app/(shop)/profile/page.tsx` (`MemberProfile`) to request orders and addresses data only when their respective panels are active.
- Extended `useMyOrdersQuery` and `useMyAddressesQuery` in `lib/queries/commerce.ts` to accept an explicit `enabled` boolean parameter while preserving default `true` behavior for other callers.
- Reordered state derivation in `MemberProfile` so `isOrdersEnabled` and `isAddressesEnabled` are derived before invoking the data hooks.
- Created `lib/queries/commerce-profile.test.tsx` (6 tests) proving zero requests when `enabled: false` and single request when `enabled: true`.
- Created `app/(shop)/profile/page.test.tsx` (4 tests) proving default account panel enables neither resource, orders panel enables only orders, and delivery panel enables only addresses.
- Verification: `pnpm exec eslint . --max-warnings 25` (0 errors, 4 warnings), `pnpm exec tsc --noEmit` (0 errors), `pnpm test:unit` (47 files, 178 tests passed), `pnpm build` (68 static routes prerendered).
- Follow-ups: none.

### FE-007 Consume Wishlist Product Summaries Completed

- Refactored wishlist loading in `FavoritesProvider` from N+1 per-product queries (`useQueries` fan-out calling `getProduct`) to consuming `WishlistProductSummary` directly from `GET /api/v1/wishlists/me` in a single request.
- Defined `WishlistProductSummary` transport DTO in `lib/api/types.ts` matching backend `WishlistProductSummaryResponse` and made `product` field required on `Wishlist`.
- Updated wishlist cache keys in `lib/queries/keys.ts` and `useWishlistsQuery` hook in `lib/queries/commerce.ts` to include `locale` in query identity.
- Refactored `components/shop/favorites-provider.tsx` to map backend `WishlistProductSummary` directly via `mapBackendProduct` while preserving account-scoped caching, optimistic add/remove, and rollback behavior.
- Added comprehensive unit tests in `components/shop/favorites-provider.test.tsx` proving zero `getProduct` calls, correct active-only item handling, locale propagation, and optimistic updates.
- Verification: `pnpm exec eslint . --max-warnings 25` (0 errors, 4 warnings), `pnpm exec tsc --noEmit` (0 errors), `pnpm test:unit` (45 files, 168 tests passed), `pnpm build` (68 static routes prerendered).
- Follow-ups: none.

## 2026-07-25

### FE-006 Scope Shop Providers Completed

- Reconciled FE-006 plan drift and implemented the scoping of storefront context providers.
- Removed CartProvider, NotificationProvider, and FavoritesProvider from the global app/layout.tsx where they unnecessarily wrapped the admin dashboard.
- Created a boundary component components/shop/shop-providers.tsx and injected it into app/(shop)/layout.tsx.
- Created app/provider-boundaries.test.ts structural tests to enforce that shop context providers remain outside the root layout.
- Created e2e/provider-boundaries.spec.ts smoke test to verify an authenticated admin user can render the dashboard without triggering any frontend shop-related API requests (/carts/me, /favorites/me, etc.).
- Fixed test flakes by updating the mock admin roles and ensuring valid server responses.
- Verification: ran pnpm test:e2e:smoke successfully with 14 passing tests, verifying the decoupling did not break shop features and properly isolates admin.
- Follow-ups: none.

> **Kiến trúc hiện tại (2026-07-15):** `salePrice` trực tiếp đã bị loại bỏ. Các mục cũ nhắc tới `salePrice` chỉ là lịch sử trước khi Sale Campaign được triển khai; xem mục mới và `SALE_CAMPAIGN_FRONTEND.md`.

### Fix Product Price Mismatch between Catalog and Detail Page

- **Date/Time**: 2026-07-08T19:49:00+07:00
- **Backend**: Updated ProductServiceImpl to query variants and identify the minimum salePrice or price for each product. Added price and salePrice to ProductResponse to expose it correctly to the frontend.
- **Frontend**: Updated Product and mapBackendProduct in vela-data.ts to consume the real prices instead of falling back to mock static products.
- **Verification**: mvnw clean compile (Backend) and pnpm build (Frontend) passed.
- **Known Follow-ups**: None.

### Implement Advanced Product Filtering (Color, Size, Price Range)

- **Backend**: Updated ProductFilterRequest and ProductSpecification to support querying products by their variants' attributes (colorId, sizeId, minPrice, maxPrice) via a subquery on ProductVariant using coalesce for salePrice/price.
- **Frontend**: Added hexCode to CatalogEntity type. Implemented dynamic fetching of colors and sizes. Developed a premium, collapsible filter panel in CollectionClient with animated height transitions using motion/react, circular color swatches, size chips, and price inputs. Managed filter states dynamically with derived selected tags.
- Verification: mvn clean test (Backend) and pnpm lint && pnpm build (Frontend) passed.

### Implement Reviews Filtering by Product ID

- **Backend**: Updated ReviewFilterRequest and ReviewSpecification to support querying reviews by productId via a subquery joining OrderItem and ProductVariant. Fixed ReviewServiceImpl instantiations to pass the tests.
- **Frontend**: Added userName, orderId, etc. to Review type. Implemented useProductReviewsQuery in React Query. Updated ProductDetailClient to dynamically fetch and display product reviews, average rating, and total review counts instead of the static mockup.
- Verification: mvn clean test (Backend) and pnpm lint && pnpm build (Frontend) passed.

### Dynamic Data & Pagination Integration Completed

- Updated lib/vela-data.ts and lib/queries/catalog.ts to use backend data accurately and implement placeholderData: keepPreviousData for seamless pagination.
- Refactored components/shop/collection-client.tsx to fetch real data with Server-Driven Pagination and Backend Filtering/Sorting.
- Modified components/shop/home-page.tsx to use dynamic products and categories queries for trending and featured sections.
- Verification: Ran pnpm lint and pnpm build successfully, resolving React 19 compiler manual memoization warnings.

# Project Status

## 2026-07-24

### Honor Rate Limit Retry-After UI (FE-005) Completed

- Centralized `Retry-After` parsing logic into `lib/api/errors.ts` (`extractRetryAfterSeconds` and `getQueryRetryDelayMs`) to decode delays from response bodies or headers.
- Wired React Query `retryDelay` in `components/providers/query-provider.tsx` to automatically wait the prescribed number of seconds before retrying 429 requests, while preventing retries entirely if the wait time exceeds 5 minutes (300 seconds).
- Refactored `lib/auth-otp-api.ts` to rely on the centralized generic errors module and eliminated substring checks for error mapping.
- Added comprehensive unit tests in `lib/api/errors.test.ts` and adversarial cases in `lib/auth-otp-api.test.ts`.
- Verification: Ran `pnpm exec vitest`, `tsc`, and `eslint` successfully with no regressions.

Newest entries first. Every agent must read this file before starting work and update it after completing a meaningful task.

## 2026-07-21

### FE-003 — Cart isolation and hardened logout
- **Date/Time**: 2026-07-21T17:55:00+07:00
- **Branch**: `fix/cart-session-isolation`
- **Implementation**: Bổ sung discriminator owner vào cart state (`"anonymous"` hoặc `"user:<id>"`). Cart provider sync sẽ abort nếu owner bị mismatch sau khi authentication resolve. Logout flow trong `api-client` đã phân biệt clear session với retryable network error/5xx. Ui caller (site-header, app-sidebar) được update xử lý toast success/error theo đúng trạng thái thay vì clear local session vội vàng. Migrate version cart state để dọn rác của v1 (ownerless).
- **Verification**: `pnpm lint`, `pnpm build` pass. Unit tests components auth, api-client, cart-store (9 tests) đều pass the settlement matrix.
- **Known Follow-ups**: Tích hợp BE-004.

### FE-002 — Bảo toàn multipart review uploads qua Axios
- **Date/Time**: 2026-07-21T17:08:00+07:00
- **Branch**: `fix/review-multipart-transport`
- **Implementation**: Xóa header `Content-Type: application/json` cố định trong `axios.create()` tại `lib/api-client.ts`. Axios mặc định tự suy luận đúng content-type: `application/json` cho plain objects, `multipart/form-data` cho FormData. Trước thay đổi này, header cố định có thể khiến Axios serialize `FormData` thành JSON trước khi browser tạo multipart boundary, dẫn đến request Spring không parse được.
- **Tests**: Thêm ba test transport-level trong `lib/api/commerce-review.test.ts` dùng custom Axios adapter (không mock `.post`) để kiểm tra: (1) multipart review với ảnh đến adapter dưới dạng FormData, review JSON Blob và images parts còn nguyên, Content-Type không bị ép `application/json`; (2) multipart review không có ảnh vẫn gửi FormData; (3) plain JSON object request vẫn serialize thành JSON với content-type `application/json`.
- **Verification**: Targeted `2` file/`7` test pass; ESLint `0` error, `4` warning TanStack Table có sẵn; TypeScript pass; full Vitest `38` file/`132` test pass; production build pass `69` route.
- **Known Follow-ups**: Không có. Mọi endpoint binary trong tương lai cần dùng cùng test pattern transport-level.

## 2026-07-16

### FE-001 — Chuyển customer flows sang self-scoped API
- **Date/Time**: 2026-07-16 (Asia/Saigon)
- **Branch**: `fix/self-scoped-customer-apis`
- **Implementation**: Chuyển profile update sang `PUT /users/me`, order list/detail/status history sang `/orders/me/**`, và address CRUD sang `/user-addresses/me/**`. Customer request không còn gửi `userId` để chọn ownership; profile/address helpers whitelist field ở runtime nên không thể chuyển tiếp `avatar`, `id` hoặc `userId`. React Query key vẫn chứa authenticated account ID để cache không đi từ account A sang B. Order detail bỏ client-side ownership decision và dùng `404` từ backend self-service làm authorization outcome.
- **Tests**: Thêm request-level API contract tests, hook/cache transition tests, order-detail component tests và Playwright ownership smoke với hai API contexts độc lập. Primary own reads thành công; secondary dùng order ID/code/status-history và address ID của primary đều nhận `404`, không match error message và không tạo dữ liệu persistent.
- **Verification**: Focused Vitest `3` file/`14` test pass; full TypeScript pass; full Vitest `38` file/`130` test pass; ESLint pass `0` error và `4` warning TanStack Table có sẵn; production build pass `69` route; targeted ownership smoke `1/1` pass; toàn bộ `@fullstack` pass `7/7`; negative search không còn storefront legacy ownership contract.
- **Known Follow-ups**: Chỉ triển khai BE-002 để thu hồi legacy `ROLE_USER` grants sau khi PR FE-001 này đã merge. Avatar customer vẫn thuộc BE-004; PR này không thay đổi upload/UI.

### Ổn định một hover lifecycle và thu gọn mega-menu storefront
- **Date/Time**: 2026-07-16 (Asia/Saigon)
- **Implementation**: Parent label và chevron desktop nay dùng chung lifecycle hover do `NavigationMenuItem`/content quản lý. Chặn `onMouseEnter` đo lại popup của Base UI và bỏ qua riêng close reason `trigger-hover`, nên rê liên tục `label → chevron → label` không còn restart animation hoặc làm mất content; click, touch, Escape, focus-out và keyboard trigger vẫn giữ nguyên. Bỏ hoàn toàn pill/background active cùng ring nửa vòng của link/chevron, thay bằng underline focus-visible. Popup được thu từ `1000/800/600px`, giảm intro card, padding, row height và khoảng cách cột nhưng vẫn co theo available width, không overflow.
- **Tests**: Playwright đổi qua lại label/chevron bốn lần và chờ lâu hơn close delay ở mỗi lượt, xác nhận content cùng `aria-expanded` không rơi; kiểm tra rời toàn vùng vẫn đóng, nav control transparent/không shadow, panel hai cột không quá `801×310px`, parent link, keyboard, mobile và overflow.
- **Verification**: TypeScript pass; Vitest `39` file/`124` test pass; full ESLint pass với `0` error và `4` warning TanStack Table có sẵn; focused mega-menu Playwright pass `1/1`; toàn bộ Playwright smoke pass `15/15`; visual QA homepage `1440×900` pass; `git diff --check` pass.
- **Known Follow-ups**: Không có trong phạm vi thay đổi này.

### Hoàn thiện tương tác và thiết kế mega-menu storefront
- **Date/Time**: 2026-07-16 (Asia/Saigon)
- **Implementation**: Mega-menu tiếp tục dùng cấu hình frontend trong `lib/storefront-navigation.ts`, không phụ thuộc backend để hiển thị nhãn và leaf link. Toàn bộ vùng tên + chevron của sáu mục desktop nay mở menu khi hover nhưng parent label vẫn là link điều hướng thật; chevron có hitbox lớn hơn, icon nằm sát nhãn, touch không bị giả lập hover và keyboard tiếp tục mở bằng trigger có `aria-expanded`. Intro rail cũ được thay bằng editorial card có mô tả theo locale, chỉ số `01 / 06`, CTA rõ và focus-visible; các nhóm leaf có hierarchy, hover/focus nhất quán. Popup co theo `--available-width`, giữ lề viewport và không tràn ngang ở desktop hẹp.
- **Tests**: Mở rộng navigation unit test cho description; Playwright hover trực tiếp parent link của cả sáu menu, xác nhận leaf/expanded, khoảng cách nhãn-chevron `2–8px`, parent `href`, keyboard trigger, mobile leaf và không overflow khi popup mở.
- **Verification**: TypeScript pass; Vitest `39` file/`124` test pass; full ESLint pass với `0` error và `4` warning TanStack Table có sẵn; production build pass `69` route; toàn bộ Playwright smoke pass `15/15`; visual QA tại `1440×900` pass; `git diff --check` pass.
- **Known Follow-ups**: Không có trong phạm vi thay đổi này.

### Thu hẹp HTTP 400/5xx theo phạm vi dữ liệu còn sử dụng được
- **Date/Time**: 2026-07-16 (Asia/Saigon)
- **Implementation**: HTTP 400 storefront chuyển từ artwork mã lỗi toàn màn hình sang notice gọn, giữ `HTTP 400` như metadata phụ, dùng hành động đặt lại ngữ cảnh và không retry lại request xác định là không hợp lệ. Collection lưu lần tải catalog thành công cuối tại ranh giới thao tác, nên filter 400 rollback về URL hợp lệ vẫn giữ grid và chỉ hiện cảnh báo cục bộ; 5xx vẫn cho Retry. Banner stale dùng mã HTTP thật và chỉ hiện Retry cho lỗi retryable. Lỗi API lịch sử trạng thái đơn hàng không còn che toàn bộ chi tiết đơn. `ResourcePage` admin giữ cached rows cùng banner `HTTP 5xx`; chỉ dùng artwork đúng mã `500/502/503/504` khi không còn row sử dụng được, còn 403 tiếp tục blocking để không lộ dữ liệu cache sau khi mất quyền. Các runtime error boundary hiện có được giữ nguyên.
- **Tests**: Thêm test component cho notice 400/artwork 5xx, stale warning, order history và ba trạng thái ResourcePage; thêm Playwright cho initial/filter 400 và khóa lại hành vi initial/filter 500.
- **Verification**: TypeScript pass; Vitest `39` file/`124` test pass; full ESLint pass với `0` error và `4` warning TanStack Table có sẵn; production build pass `69` route; toàn bộ Playwright smoke pass `15/15`; `git diff --check` pass.
- **Known Follow-ups**: Không có trong phạm vi thay đổi này.

### Đồng bộ OTP/Auth hardening vào Storefront Catalog UX
- **Date/Time**: 2026-07-16 (Asia/Saigon)
- **Implementation**: Merge `origin/main` sau khi PR OTP/Auth được phát hành; resolve conflict duy nhất tại tài liệu trạng thái bằng cách giữ đầy đủ cả hai mục OTP/Auth và Storefront. Toàn bộ source/config cho `challengeId`, `otpProofToken`, reauthentication và stale-refresh guard được giữ cùng Storefront Catalog UX, Size Guide và review.
- **Verification**: Vitest pass `35` file/`116` test; ESLint pass với `0` error và `4` warning TanStack Table có sẵn; production build pass `69` route; Playwright smoke pass `13/13`; `git diff --check` pass.
- **Known Follow-ups**: Chờ GitHub Actions chạy lại trên PR #16 sau khi push merge commit.

### Hoàn thiện Storefront Catalog UX, Size Guide, review và trạng thái lỗi
- **Date/Time**: 2026-07-16 (Asia/Saigon)
- **Implementation**: Collection và Search chuyển sang một storefront catalog controller lấy URL làm nguồn trạng thái, hỗ trợ multi-select category/color/size, effective-price range, bốn sort, facets, chip, server pagination, mobile draft và rollback về URL hợp lệ gần nhất. Header dùng mega-menu Vela có parent link/chevron riêng và leaf URL thật. Thêm Size Guide riêng với cm/in, bảng XXS–XXL, 0X–4X, quy đổi quốc tế, giày/phụ kiện và highlight availability. PDP hiển thị ba review text cùng modal summary/filter/sort/pagination/lightbox; chi tiết đơn `COMPLETED` có form multipart viết review. Chuẩn hóa retry/error/stale-data để initial error dùng route artwork còn background error giữ nội dung.
- **Documentation**: Thêm `docs/STOREFRONT_CATALOG_UX_FRONTEND_VI.md`, đồng bộ `README.md` và `DESIGN.md`; tài liệu ghi contract thật, URL state, accessibility, troubleshooting, test và checklist bảo trì.
- **Verification**: Full ESLint pass với 0 error và 4 warning TanStack Table có sẵn; TypeScript pass; Vitest `31` file/`96` test pass; production build pass `69` route. Focused storefront Playwright pass `7/7`, toàn bộ smoke pass `13/13`, full-stack với Spring Boot/PostgreSQL/Redis disposable pass `6/6`. Catalog full-stack dùng API thật, kiểm tra `sort=price-asc` không còn `400`, chạy cả `1440×900` và `390×844`, reload và không overflow. Strict OpenSpec, `git diff --check`, link Markdown và UTF-8 đều đạt.
- **Known Follow-ups**: In-app Browser không có browser runtime (`agent.browsers.list()` trả `[]`), nên không có một lượt visual QA thủ công riêng; Chromium Playwright vẫn kiểm tra keyboard focus, hai viewport, overflow, page error, application console error và network allowlist. Review submit thành công được kiểm tra ở component/API multipart và Backend controller/service/storage; chưa thêm case Playwright full-stack vì toàn bộ `104/104` item `COMPLETED` của seed đã có review và không có setup/cleanup API an toàn. Không tạo reset endpoint production chỉ để phục vụ test.

### Chuyển OTP sang challenge/proof token và đăng xuất sau thay đổi nhạy cảm
- **Date/Time**: 2026-07-16T13:21:35+07:00
- **Implementation**: Thay contract OTP cũ bằng `request → challengeId`, `verify(challengeId, code) → proofToken`; proof chỉ đi qua biến cục bộ của callback, không nằm trong React state, storage hoặc URL. Register, reset password và đổi email gửi `otpProofToken`; resend thay challenge đang giữ trong memory. Reset/đổi mật khẩu và đổi email dọn access token, auth query cache, cart rồi `replace` về `/sign-in`; session generation guard ngăn refresh request cũ ghi token trở lại sau khi phiên bị thu hồi. Chuẩn hóa mapping tám security error code cùng `Retry-After`/`retryAfterSeconds`.
- **Verification**: TypeScript pass; full ESLint pass 0 error (còn 4 warning TanStack Table có sẵn); Vitest 28 file/98 test pass, gồm contract/payload OTP, resend, proof callback, limiter retry, redirect reauthentication và stale-refresh guard; production build pass 68 route; `git diff --check` pass.
- **Known Follow-ups**: Backend và frontend phải phát hành đồng thời vì contract cũ không còn tương thích. CAPTCHA, Cloudflare và monitoring bên ngoài không thuộc thay đổi frontend này.

### Sửa Playwright smoke theo Language Switcher dạng popover
- **Date/Time**: 2026-07-16T11:28:14+07:00
- **Implementation**: Đồng bộ nhánh PR với commit merge `main` mới nhất, sau đó cập nhật test Flash Sale locale để mở Language Switcher popover, chọn English trong nhóm ngôn ngữ và xác nhận lựa chọn vẫn có `aria-pressed=true` sau reload. Bỏ locator cũ dành cho segmented switcher vì trigger popover không mang trạng thái pressed.
- **Verification**: Case Flash Sale locale pass 1/1; toàn bộ `pnpm test:e2e:smoke` pass 6/6; scoped ESLint, TypeScript và `git diff --check` pass.
- **Known Follow-ups**: Chờ GitHub Actions chạy lại trên PR #14.

### Loại bỏ Boneyard, khóa OAuth exchange và đồng bộ System theme
- **Date/Time**: 2026-07-16T00:47:29+07:00
- **Implementation**: Gỡ hoàn toàn 7 wrapper Boneyard, registry, generated bones, config và dependency `boneyard-js`; Admin session, Management table, Profile addresses, Checkout province/ward, Invoice preview và Mail loading nay dùng skeleton normal-flow/responsive. Nút đổi ngôn ngữ trong Admin/OAuth loading được thay bằng bone đúng kích thước, còn trạng thái đã tải vẫn giữ nút tương tác. OAuth callback cache một terminal promise cho toàn bộ `exchange → getMe` theo authorization code, nên StrictMode/remount không thể gửi lại code đã dùng một lần. Admin theme đọc đúng cookie `theme_mode`, missing/invalid mặc định `system`, bootstrap class/attribute/color-scheme trước paint, giữ lựa chọn Light/Dark hợp lệ và dọn theme khi quay lại storefront; Toaster dùng trực tiếp resolved theme của preference store và dependency `next-themes` dư thừa được gỡ.
- **Verification**: Full ESLint pass 0 error (còn 4 warning TanStack Table có sẵn); TypeScript pass; Vitest 20 file/66 test pass, gồm OAuth StrictMode/remount và theme bootstrap/persistence; production build pass 68 route. Browser QA production tại 1152x800 bắt được Admin cold-load với 46 UI bones, 0 Boneyard node và 0 language button; sau load có đúng 1 language button. System theme resolve dark đúng OS (`data-theme-mode=system`, `.dark`, `colorScheme=dark`) và toàn bộ attribute/class được dọn khi về storefront. OAuth loader có 1 language bone và 0 language button.
- **Known Follow-ups**: Chưa chạy đăng nhập Google thật vì cần phiên tương tác; regression test đã tái hiện đúng cửa sổ exchange thành công rồi remount trong lúc `getMe` còn pending và xác nhận chỉ có 1 exchange/1 profile request.

### Chuyển ảnh tĩnh storefront từ HTTPS sang asset local
- **Date/Time**: 2026-07-16T00:19:04+07:00
- **Implementation**: Tải 31 ảnh tĩnh duy nhất từ Unsplash và Google `aida-public`, chuyển thật sang WebP rồi lưu theo ngữ cảnh trong `public/images`. Thay 35 tham chiếu ở Home editorial/story/newsletter, Collection lookbook, Product Detail craftsmanship và toàn bộ fixture product/cart/checkout/detail; ảnh trùng nguồn dùng chung một file. Gỡ hai `remotePatterns` Unsplash/Google khỏi Next Image, đồng thời giữ pattern upload của backend và logic ảnh động từ API.
- **Verification**: Không còn tham chiếu `images.unsplash.com` hoặc `lh3.googleusercontent.com` trong `app`, `components`, `lib`, `styles` và `next.config.ts`; 35 tham chiếu WebP map đủ 31 file, 31/31 file decode thành công, tổng dung lượng 1.11 MB. Full ESLint pass 0 error (còn 4 warning TanStack Table có sẵn); Vitest 54/54; production build pass 68 route; Playwright storefront smoke 3/3. Browser QA production xác nhận Home tải 15/15 ảnh không lỗi và không có remote URL trong DOM; Collection dùng background local; asset craftsmanship Product Detail được phục vụ trực tiếp ở 512x512.
- **Known Follow-ups**: Collection và Product Detail trả trạng thái dữ liệu 500 trong lần browser QA production dù backend products endpoint trực tiếp trả 200; đây không phải lỗi tải asset và cần audit data request riêng nếu vẫn tái hiện. Google Fonts và ảnh động do backend trả về không thuộc phạm vi local hóa ảnh tĩnh.

## 2026-07-15

### Loại bỏ product fixture flash khi React Query còn pending
- **Date/Time**: 2026-07-15T23:46:04+07:00
- **Implementation**: Home Trending và Collection không còn render sản phẩm mẫu trước response API; cold query dùng skeleton chi tiết đúng carousel/grid rồi mới chuyển sang dữ liệu thật. Collection bỏ hẳn dependency `PRODUCTS` khỏi component tree và dùng chung một fallback grid cho cả Suspense lẫn React Query. Related Products được sửa cùng nguyên nhân: pending dùng carousel skeleton, fixture chỉ còn là fallback sau khi request đã kết thúc nhưng lỗi/rỗng; Home giữ chính sách fallback này để không phá demo/offline flow. Background refetch vẫn giữ API data hiện có nhờ React Query `placeholderData`.
- **Hydration Audit**: Hero Slider tiếp tục truyền trực tiếp hai URL root-relative `/images/home/hero-autumn-2026.avif` và `/images/home/hero-lookbook-2026.jpg`; cả hai asset tồn tại trong `public/images/home`, không có source mismatch cần sửa.
- **Verification**: Full ESLint pass 0 error (còn 4 warning TanStack Table có sẵn); Vitest 54/54; TypeScript và production build 68 route pass; storefront Playwright smoke 3/3 pass trên production server sạch. Browser QA cold-load xác nhận Home có 0 fixture/0 product card khi 28 bone đang hiện, Collection có 0 fixture/0 product card khi 40 bone đang hiện; viewport 1440x900 và 390x844 không overflow.
- **Known Follow-ups**: Full smoke hiện còn một test Sale locale cũ tìm aria-label `Chuyển ngôn ngữ sang Tiếng Anh` trước redesign popover; năm case còn lại pass trên server sạch. Cần cập nhật test đó theo thao tác mở language popover ở một thay đổi riêng.

### Thay skeleton Boneyard động bằng skeleton theo layout thật
- **Date/Time**: 2026-07-15T23:24:00+07:00
- **Implementation**: Thay Boneyard ở Product Detail, Search, Collection, Cart, Favorites, Reviews, Coupons, Profile Orders/Favourites và Order Details bằng skeleton normal-flow theo đúng grid thật. Mỗi card/row vẫn có bone riêng cho ảnh, nút, nhãn, tên, giá và CTA; breakpoint của product grid được đồng bộ 1/2/3 cột. Giữ Boneyard cho dashboard/admin và Profile Addresses vì các layout này có geometry ổn định. Thu gọn registry từ 13 xuống 3 fixture và xóa 10 file bones không còn dùng.
- **Verification**: `pnpm lint` pass với 0 error (còn 4 warning TanStack Table có sẵn); Vitest 54/54 pass; production build pass 68 route. Browser QA ở 1440x900 và 390x844 xác nhận skeleton Product Detail/Search cùng các màn Cart, Favorites, Reviews và Profile Orders bám đúng layout, không bị co chiều cao hoặc overflow ngang.
- **Known Follow-ups**: Các wrapper Boneyard fallback-only ở checkout province/ward, invoice preview và mail layout chưa có generated bones; hiện không gây lỗi geometry và có thể được giản lược riêng khi chỉnh các màn đó.

### Đồng bộ trang Sale với grid và card của Collection
- **Date/Time**: 2026-07-15T22:36:16+07:00
- **Implementation**: Redesign có mục tiêu cho `/sale` và `/flash-sale`: dùng cùng container `max-w-[1800px]`, breadcrumb/heading, `ProductGrid` 1/2/3 cột, ảnh vuông, khoảng cách và card shell của Collection. Tách `ProductCardShell` dùng chung cho catalog và `SaleProductCard` chuyên giữ giá khuyến mãi, quota, giới hạn mỗi khách, sold-out/upcoming cùng CTA chọn biến thể. Campaign chuyển từ card bo lớn có shadow sang section phẳng có border; banner, type/phase/code, coupon advisory, server-clock countdown, query cadence và boundary invalidation được giữ nguyên. Loading dùng square grid skeleton cùng breakpoint; error dùng `StorefrontApiStatus`; empty state bỏ nested card.
- **Artifacts**: Không thêm artifact vào repository; ảnh QA tạm được lưu ngoài worktree Codex.
- **Verification**: Scoped ESLint, TypeScript và 10/10 test Sale/API pass; full `pnpm lint` pass với 0 error (còn 4 warning TanStack Table có sẵn); production build pass 68 route. Playwright QA mock trên `/sale` desktop 1440px và `/flash-sale` mobile 390px xác nhận lần lượt 3/1 cột, 6 card, không overflow và không có console warning/error.
- **Known Follow-ups**: Kiểm tra lại crop của banner campaign thật nếu nội dung ảnh quan trọng nằm sát mép; layout hiện dùng `background-position: center` như trước.

### Gỡ thử nghiệm chuyển động khỏi nhãn Sale
- **Date/Time**: 2026-07-15T22:09:51+07:00
- **Implementation**: Gỡ toàn bộ prototype editorial/misregistration/crossfade, component phụ, CSS animation và hai public Sale query chỉ phục vụ phần trăm trên header. Nhãn `Giảm giá`/`Sale` trở lại text điều hướng thông thường, dùng cùng hover underline có sẵn như các mục desktop khác và không tự chuyển động trên mobile.
- **Artifacts**: Xóa toàn bộ ảnh QA của các prototype Sale đã bị loại bỏ.
- **Verification**: Xác nhận không còn selector, component, data attribute, helper hay API query dành riêng cho motion Sale; nhãn desktop/mobile trở lại markup ban đầu. Scoped ESLint, TypeScript và unit test `sale-utils` 4/4 đều pass.
- **Known Follow-ups**: Không có.

### Thu gọn bộ đổi ngôn ngữ toàn ứng dụng và thêm lối về storefront trong Management
- **Date/Time**: 2026-07-15T21:05:53+07:00
- **Implementation**: Bổ sung chế độ popover cho `LanguageSwitcher`: nút trigger tròn 32px mở nhóm toggle VI/EN, hiển thị ngôn ngữ đang chọn bằng dấu check, đặt focus đúng lựa chọn hiện tại và tự đóng sau khi đổi. Popover trở thành mặc định trên storefront header desktop/mobile, auth, trạng thái lỗi dùng chung, dashboard, khung loading/auth, trang lỗi, Chat và Mail thuộc Management; segmented switcher vẫn còn như một presentation tùy chọn. Thêm liên kết `Quay lại cửa hàng` vào màn Management chưa đăng nhập và footer sidebar; liên kết vẫn còn tooltip khi sidebar thu gọn và hiển thị đầy đủ trong off-canvas mobile.
- **Artifacts**: Các ảnh QA tạm đã được xóa theo yêu cầu; không lưu artifact cho thay đổi này.
- **Verification**: Browser QA trên storefront desktop/mobile, trang đăng nhập, trạng thái Management guest và phiên ADMIN mock xác nhận trigger 32px, popover nằm trọn viewport, có semantics dialog cùng nhóm toggle button, VI ↔ EN cập nhật nội dung rồi tự đóng và console không có lỗi mới. Liên kết storefront hoạt động ở sidebar mở/thu gọn và mobile. Scoped ESLint, TypeScript và `git diff --check` pass; Vitest 54/54; full `pnpm lint` pass với 0 error (còn 4 warning TanStack Table có sẵn); production build pass với 68 routes.
- **Known Follow-ups**: Inline `<script>` có sẵn trong `app/(admin)/layout.tsx` vẫn tạo một cảnh báo React ở Next dev khi render client; thay đổi này không thêm script và production build không bị ảnh hưởng.

### Chuẩn hóa cấu trúc Playwright bằng AAA và POM có chọn lọc
- **Date/Time**: 2026-07-15 (Asia/Saigon)
- **Implementation**: Chuẩn hóa khoảng trắng theo các pha Arrange–Act–Assert; chia hai race flow auth dài thành `test.step()` để trace chỉ rõ pha bootstrap, tạo cạnh tranh, nhả barrier và kiểm tra kết quả. Thêm `ProfilePage` và `AuthHeaderComponent` cho navigation/bootstrap cùng locator header dùng lại; giữ request counter, route barrier, Web Lock và network ordering trong spec. Thêm fixture `authenticatedSession` để login/cleanup session thật, retry logout không Bearer khi cleanup Bearer nhận `401`, rồi cho fixture checkout tái sử dụng session này. Không thêm POM Manager vì suite hiện mới có một page object và một component dùng lại.
- **Documentation**: Bổ sung quy ước AAA, ranh giới POM/fixture và tiêu chí chỉ cân nhắc POM Manager khi nhiều spec cùng dùng nhiều page object vào `docs/PLAYWRIGHT_CI_VI.md`.
- **Verification**: TypeScript pass; ESLint riêng `e2e` pass; Vitest 54/54; full ESLint 0 error (còn 4 warning TanStack Table có sẵn); production build pass với 68 routes; Playwright Chromium smoke 6/6; Playwright full-stack 5/5 trên Spring Boot, PostgreSQL 16 và Redis 8.8 thật; `git diff --check` pass.
- **Known Follow-ups**: Không có. Tiếp tục tạo page object theo nhu cầu dùng lại, không tạo abstraction trước khi có duplication thực tế.

### Bổ sung kiểm thử race condition và Playwright CI hai repository
- **Date/Time**: 2026-07-15 (Asia/Saigon)
- **Implementation**: Bổ sung test cho cơ chế single-flight khi nhiều request cùng nhận `401`; mọi luồng bootstrap/interceptor dùng chung hàm refresh, còn Web Lock `vela-auth-session` tuần tự hóa login/OAuth, refresh và logout giữa các tab cùng origin để các response không ghi đè refresh cookie của nhau. Logout gửi Bearer hiện tại để backend blacklist access token; nếu token đã hết hạn và bị chặn `401` trước controller thì retry đúng một lần không Bearer để vẫn thu hồi cookie/session. Tách logic gợi ý tìm kiếm thành hook có generation guard để response cũ không ghi đè response mới; thêm promise mutex cho checkout để hai lần submit cùng tick chỉ tạo một preview và một checkout, đồng thời giữ nguyên `Idempotency-Key` khi retry sau lỗi. Playwright được chia thành smoke suite và full-stack suite. Sáu smoke case bao phủ home/header/search, validation đăng nhập, guest cart qua reload, Sale/Flash Sale và locale/metadata qua reload bằng API mock deterministic có allowlist. Năm full-stack case kiểm tra hard reload chỉ refresh một lần và rotate cookie, hai tab refresh tuần tự và đều giữ phiên, refresh-vs-logout chạy đúng thứ tự, logout chặn replay refresh/access token, cùng double-submit checkout trên backend thật.
- **CI**: PR FE chạy lint, TypeScript, unit test, build và Playwright smoke. Workflow full-stack riêng checkout FE + BE cạnh nhau trên cùng runner, khởi động PostgreSQL/Redis/backend, chạy khi push `main`, theo lịch ban đêm hoặc thủ công với hai ref. Race suite không retry để regression không bị che thành flaky-green; workflow lưu report, trace, screenshot và backend log khi cần điều tra. Comment health-check của service container được đặt ngoài block scalar `options` để không bị truyền nhầm thành Docker argument. CI backend hiện tại không cần thay đổi vì các integration test race chạy trong Maven/Testcontainers.
- **Documentation**: Thêm `docs/PLAYWRIGHT_CI_VI.md` bằng tiếng Việt, giải thích vai trò của từng tầng test, cách chạy local, cách hai repository được checkout trong CI, secret tối thiểu và cách đọc lỗi/artifact.
- **Verification**: Vitest 54/54; TypeScript pass; ESLint 0 error (còn 4 warning TanStack Table có sẵn); production build pass với 68 routes; Playwright Chromium smoke 6/6; Playwright full-stack 5/5 với backend PR #15, PostgreSQL 16 và Redis 8.8 thật; YAML workflow parse thành công và Docker service options bắt đầu đúng bằng health-check flags.
- **Known Follow-ups**: Trước khi workflow full-stack chạy trên GitHub, cần tạo fine-grained PAT chỉ có `Contents: read` cho repository BE và lưu thành secret `CROSS_REPO_READ_TOKEN` ở repository FE. Không ghi token vào source hoặc artifact.

### Triển khai Sale Campaign cho storefront và Management
- **Date/Time**: 2026-07-15 (Asia/Saigon)
- **Implementation**: Loại bỏ toàn bộ `salePrice` khỏi contract và màn quản lý Product/Variant; mọi giá giảm giờ đi qua campaign `STANDARD` hoặc `FLASH`. Thêm Management workspace `/dashboard/sales` với danh sách, filter, CSV, editor ba bước chọn nhiều variant, publish/cancel, optimistic version, chỉnh display/tăng quota/kết thúc/end-and-clone theo lifecycle. Thêm storefront `/sale` và `/flash-sale`, banner, countdown theo `serverTime`, quota/giới hạn khách, giá canonical ở product/cart/order snapshot và giải thích coupon. Checkout dùng server preview + `pricingFingerprint`, `Idempotency-Key`, retry lost-response, stable conflict codes, cart refresh, SePay deadline 15 phút + 30 giây grace và command hủy đơn riêng. Cart không giữ stock/quota; sản phẩm Sale bắt buộc chọn đúng variant trước khi thêm.
- **Documentation**: Thêm `docs/SALE_CAMPAIGN_FRONTEND.md` bằng tiếng Việt, bao gồm nghiệp vụ, cấu trúc code, API, race-condition flow, cache, testing và checklist mở rộng.
- **Verification**: `pnpm lint` pass với 0 error (còn 4 warning TanStack Table có sẵn ngoài feature); TypeScript pass; Vitest 17/17; Playwright Chromium 2/2; `pnpm build` pass và sinh đủ 68 routes gồm ba route admin Sale cùng hai route storefront Sale.
- **Known Follow-ups**: Không có follow-up FE bắt buộc; các invariant oversell/quota/cancel–IPN–timeout được chứng minh ở test PostgreSQL/Testcontainers phía backend, không phải bằng unit test trình duyệt.

### Standardize the Frontend with Runtime English/Vietnamese Localization
- **Date/Time**: 2026-07-15T00:37:30+07:00
- **Implementation**: Added one shared EN/VI message system and locale provider across the storefront, authentication, account, Management dashboards, chat, mail, shared controls, loading states, and HTTP error surfaces. A reusable EN/VI switcher is available from every persistent shell plus full-screen auth, OAuth, Management gate/error, storefront status, and standalone global-error screens. The selected locale persists through local storage and a cookie, synchronizes between tabs, updates the document language, and is sent to APIs through `Accept-Language`. Currency, number, date, fixture catalog, search cache, catalog query keys, cart display copy, and product-detail requests now react to the active locale. Wishlist caches are account-scoped, while cart locale refreshes no longer trigger quantity PUTs or overwrite edits made during an in-flight merge.
- **Verification**: Message audit reports 2,071 keys in each locale with complete parity, no duplicate keys, no placeholder mismatch, and 2,183 static `t(...)` calls with no missing key. `pnpm exec tsc --noEmit`, `git diff --check`, and full `pnpm lint` pass (zero errors; four existing React Compiler/TanStack Table compatibility warnings). `pnpm build` passes all 63 routes. Browser QA verified VI → EN → reload persistence → VI across the home page, cart, sign-in, OAuth loader, unauthenticated Management gate, and 404 status page; headings, controls, currency formatting, `html[lang]`, pressed state, and persisted locale all updated without console warnings or errors.
- **Known Follow-ups**: The backend catalog currently seeds only VI translation rows, so real API product/category copy cannot become English until EN locale data is added. With `cacheComponents` enabled, the cacheable root HTML shell still emits the default `lang="vi"`; the bootstrap script corrects it before hydration for browser users, but a locale-addressable route or intentionally dynamic root shell is still needed for fully accurate no-JavaScript/crawler HTML language metadata.

## 2026-07-14

### Add Distinct Admin and Storefront HTTP Error States
- **Date/Time**: 2026-07-14T18:48:33+07:00
- **Implementation**: Adapted the supplied v0 404 physics animation into reusable Vela Wear React/Tailwind components without copying scaffold dependencies or placeholder assets. Management retains its dark system treatment for the dashboard catch-all, unexpected route failures, and compact 403/404/5xx resource-table failures across Users, Roles, Permissions, Products, Orders, Coupons, Categories, Brands, Colors, and Sizes. The customer storefront now has a separate warm editorial treatment that matches its beige/clay palette, serif typography, spacing, header/footer chrome, Vietnamese content, and responsive CTAs for route-level 403, 404, and 5xx states. The same storefront panels now preserve HTTP status information instead of showing false empty states in collection, search, product detail, favourites, profile addresses/orders, order detail/history, coupons, and reviews. The animation remains bounded, resize-aware, hidden-tab/idle aware, reduced-motion safe, and accepts blank-surface pointer input without blocking links. A 401 never renders dedicated artwork: refresh is attempted once, then the session is cleared and sign-in receives a validated internal return path for password or Google OAuth.
- **Verification**: Scoped ESLint passes with zero warnings, `pnpm exec tsc --noEmit --pretty false` passes, and `pnpm build` passes with all 63 production pages including `/unauthorized`, shop/root error boundaries, and the dashboard catch-all. Browser QA verified the warm desktop 404 and embedded 5xx panel, the 375x812 403/404 layouts, exact mobile fit without horizontal overflow, fixed-header clearance, and the interactive code-drop behavior. Full `pnpm lint` remains blocked by 10 pre-existing errors and 25 warnings in legacy/shared files such as `nav-main.tsx`, invoice/mail effects, tasks copy, the storefront header, carousel, responsive hooks, and a scratch script.
- **Known Follow-ups**: The role-aware Management loading work is now integrated. Other non-authentication 4xx responses continue to use the existing generic inline Management alert.

### Improve Management Session Loading and Role Redirects
- **Date/Time**: 2026-07-14T17:12:22+07:00
- **Implementation**: Made password and OAuth sign-in resolve the authoritative `/auth/me` profile, show the generic `Checking {role} session...` transition only during sign-in, and route `ADMIN`, `MANAGER`, and `STAFF` accounts directly to `/dashboard/default`. The Management auth gate now waits only for the initial session request, rejects authenticated non-management roles, and uses a safe Boneyard admin-shell skeleton instead of repeatedly blanking the workspace during background refetches. The shared Management resource page now uses a responsive Boneyard skeleton across all list routes.
- **Verification**: Scoped ESLint, `pnpm exec tsc --noEmit --pretty false`, and `pnpm build` pass. Browser QA confirmed the ADMIN transition and redirect, client-side navigation to Users without another session-check screen, and a USER storefront redirect plus denied direct Management access. Full `pnpm lint` remains blocked by pre-existing out-of-scope errors in legacy/shared files including `nav-main.tsx`, invoice/mail effects, tasks copy, storefront header, carousel, responsive hooks, and scratch files.
- **Known Follow-ups**: Boneyard's CLI snapshot hook did not attach under the current Next.js 16/Turbopack dev runtime, so the responsive bone assets were captured with Boneyard's installed extraction algorithm. The existing full-repository lint baseline still needs separate cleanup.

### Extend Admin Catalog and Product Variant Workflow
- **Date/Time**: 2026-07-14T00:37:03+07:00
- **Implementation**: Expanded the existing Products editor into one Details + Variants & Inventory workflow covering SKU, color, size, price, sale price, stock, and variant status. New products stay `DRAFT` until their variants finish saving; unchanged variants are skipped, dirty variants merge the latest server values before update, active variants are staged safely when activating/archiving a product, and partial successes remain recoverable in the open editor. Added full Categories and Brands management routes plus one combined Colors & Sizes route with independent tab state, CRUD, pagination, filters/search, validation, CSV export, and safe archive/delete messaging. Added the matching catalog API/query layer and sidebar links. Product Media was intentionally excluded after scope clarification because the frontend only renders the backend-provided `thumbnail` and ordered `images` values. Backend product/category updates now preserve translation metadata omitted from their update contracts while retaining the previous defaults when a VI translation is first created.
- **Verification**: Scoped ESLint passes with zero warnings; `pnpm exec tsc --noEmit --pretty false` passes; final `pnpm build` passes and generates all 63 pages including `/dashboard/categories`, `/dashboard/brands`, and `/dashboard/attributes`. Browser QA confirmed the new routes resolve through the admin auth gate with no console errors. Backend targeted tests pass (`ProductServiceImplTest` + `CategoryServiceImplTest`: 18 tests, 0 failures/errors). Full `pnpm lint` remains blocked by 13 pre-existing out-of-scope errors in legacy/shared files such as `nav-main.tsx`, invoice/mail effects, tasks copy, storefront header, responsive hooks, carousel, and scratch scripts.
- **Known Follow-ups**: The backend still lacks an atomic product-with-variants command, so multi-request saves can partially succeed; direct variant stock updates do not create inventory audit logs; and color/size FK or database-constraint failures currently surface as generic 500 responses instead of actionable 409/400 errors.

### Build Vela Wear Admin Management Workspace
- **Date/Time**: 2026-07-14T00:05:53+07:00
- **Implementation**: Reworked Users and Roles around the real backend, added Permissions, Products, Orders, and Coupons management routes, and introduced a shared admin list/form/delete system with server pagination, filters, loading/error/empty states, CSV export, mutation toasts, and safe destructive-action handling. Added Vela Wear admin branding, authentication gating, real sidebar session/logout data, single-flight token refresh, protected core roles/current account, controlled order status transitions, and a Management-first sidebar.
- **Verification**: Scoped ESLint passes with zero warnings, `pnpm exec tsc --noEmit --pretty false` passes, and `pnpm build` passes with all six routes in the generated manifest. Browser QA verified all six route shells/tables/forms before auth gating and verified the final unauthenticated guard with no new console errors.
- **Known Follow-ups**: Backend still needs role-permission assignment, effective-permission/session data for permission-aware navigation, authoritative order transition/refund commands with reason/audit data, and a full-filter server export endpoint.

## 2026-07-13

### Remove Unused Admin Demo Sections
- **Date/Time**: 2026-07-13 (Asia/Saigon)
- **Implementation**: Removed Academy, Logistics, Authentication, and the complete Legacy dashboard group from the admin sidebar. Deleted their admin route pages and co-located components while preserving the separate storefront authentication flow under `app/(auth)`.
- **Verification**: `pnpm build` and `pnpm exec eslint navigation/sidebar/sidebar-items.ts` pass. Removed routes no longer appear in the generated route manifest.
- **Known Follow-ups**: None.

## 2026-07-08

### Prevent Search Skeleton Flash On Back Navigation
- **Date/Time**: 2026-07-08T23:53:23+07:00
- **Issue**: Returning from a product page back to `/search` remounted the client page with `isLoading = true`, so the Boneyard skeleton flashed even though the search catalog had just been loaded moments earlier.
- **Implementation**: Added in-memory plus `sessionStorage` caching for the search catalog in `app/(shop)/search/page.tsx`. The search page now initializes from cached products when available and skips the refetch path, so `loading` only stays `true` on a genuinely cold load.
- **Verification**: `pnpm build` passes.
- **Known Follow-ups**: If search data needs stronger freshness guarantees later, we can add an expiry timestamp instead of keeping the cache for the whole tab session.

### Align Product Detail Skeleton Gallery With Real Layout
- **Date/Time**: 2026-07-08T23:45:02+07:00
- **Issue**: The product detail skeleton was still showing a generic two-column image block, so the gallery area did not match the real product page with a vertical thumbnail rail plus a single large hero image.
- **Implementation**: Updated `ProductDetailLoadingFallback` and `ProductDetailFixture` in `components/shop/product-detail-page.tsx` to mirror the actual `ProductDetailClient` structure and dimensions more closely, then regenerated Boneyard output with `npx boneyard-js build` so `bones/product-detail.bones.json` reflects the new gallery shape.
- **Verification**: `npx boneyard-js build` completed successfully and refreshed `product-detail`. `pnpm build` passes.
- **Known Follow-ups**: If the product detail gallery layout changes again, rerun `npx boneyard-js build` so the generated bones stay in sync.

### Remove Visible Loading Text From Storefront Skeleton Fallbacks
- **Date/Time**: 2026-07-08T23:37:33+07:00
- **Scope**: Removed user-visible `Loading...` fallback copy from the Boneyard-integrated storefront areas: product detail, cart, favorites, collection, and search.
- **Implementation**: Replaced text-only fallbacks with lightweight linen placeholder blocks, and changed the product detail route-level `Suspense` fallback to `null` so it cannot flash text before the page skeleton mounts.
- **Verification**: Searched the affected shop skeleton files for remaining visible loading copy; only out-of-scope admin/profile loading text remains. `pnpm build` passes.
- **Known Follow-ups**: `pnpm lint` still fails due to existing out-of-scope admin/shared/profile lint errors; admin files were intentionally left untouched.

### Extend Boneyard Skeletons to Cart and Favorites
- **Cart Skeleton**: Wrapped the cart page content in `Skeleton name="cart-page"` and used Zustand persist hydration status so the page can show a skeleton while the saved cart restores from local storage.
- **Favorites Skeleton**: Split the favorites route into a server page plus `FavoritesPageClient`, wrapped the authenticated favorites UI in `Skeleton name="favorites-page"`, and kept the sign-in/empty/list states intact.
- **Boneyard Capture**: Added guided crawl entries for `/cart` and `/favorites`, then ran `npx boneyard-js build` successfully. Generated `cart-page.bones.json` and `favorites-page.bones.json`; product detail remains covered by `product-detail`.
- **Verification**: `pnpm build` passes. `pnpm lint` still fails due to existing out-of-scope admin and shared lint errors; admin files were intentionally left untouched.

### Integrate Boneyard Skeleton Loading
- **Boneyard Runtime Wiring**: Added a client-side Boneyard registry bridge at `components/providers/boneyard-registry.tsx`, mounted it from `app/layout.tsx`, and added an initial `bones/registry.ts` stub plus `boneyard.config.json` so the app builds before the first generated capture.
- **Product Detail Skeleton**: Updated `components/shop/product-detail-page.tsx` to use `Skeleton` with a fixture and fallback, split content/error/unavailable states, and prevent API failures from leaving the page in an infinite loading state.
- **Collection & Search Skeletons**: Wrapped the collection catalog and search results layouts with `Skeleton` at their real data-loading boundaries, keeping the existing Search `Suspense` boundary and adding a Collection boundary required by Next.js 16 prerendering.
- **Boneyard Capture**: Configured guided crawl entries in `boneyard.config.json` and ran `npx boneyard-js build` successfully against the local dev server. Generated `collection-catalog`, `product-detail`, and `search-results` bones plus the final registry under `bones/`.
- **Verification**: `pnpm build` passes after generated bones are registered. `pnpm lint` still fails only on pre-existing out-of-scope errors in `components/shop/site-header.tsx` (`react-hooks/set-state-in-effect`) and `scratch/extract-css.js` (`no-require-imports`); touched Boneyard files do not add lint errors.
- **Known Follow-ups**: Re-run `npx boneyard-js build` after major layout changes to refresh `bones/*.bones.json`.

### Refine Base UI Navigation Motion Fidelity
- **Transform-Origin Alignment**: Updated [navigation-menu.tsx](D:\CANH\Java\side project\commercial-fe\components\ui\navigation-menu.tsx) and [navigation-menu.module.css](D:\CANH\Java\side project\commercial-fe\components\ui\navigation-menu.module.css) so the popup now uses Base UI's `--transform-origin` and `--positioner-width/height` variables instead of a hard-coded top-left origin, improving continuity when switching between menu items.
- **Closer-to-Source Timing**: Reduced root hover delays back toward Base UI defaults (`delay=50`, `closeDelay=80`) and softened popup/content translate distances so open/close and cross-item transitions feel closer to the official demo instead of over-sliding.
- **Popup Surface Tuning**: Slightly reduced dropdown corner radius and shadow weight to better match the Base UI/shadcn reference.
- **Verification**: Source review completed against Base UI docs and v1.6.0 package source. Runtime verification still pending.

### Optimize Navigation Menu Transitions & Hover Delays
- **Encapsulated Styles in CSS Modules**: Created [navigation-menu.module.css](file:///d:/CANH/Java/side%20project/commercial-fe/components/ui/navigation-menu.module.css) and updated [navigation-menu.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/ui/navigation-menu.tsx) to delegate transitions, sizing variables, and animations to the CSS module file.
- **Bound Viewport size to Popup CSS variables**: Bound `width` and `height` properties of `BaseNavigationMenu.Viewport` to `--popup-width` and `--popup-height` variables inside the CSS module, enabling smooth size-morphing animations without instant snapping (resolving the "cà giật" layout jump).
- **Staggered Timings for Continuity**: Staggered the morphing speed of the outer `Viewport` (increased to `320ms`) to run slightly slower than the inner `Content` translation and fade (`180ms`). This lets the text change quickly and clearly while the container completes its resize morph smoothly in the background.
- **Enhanced Translation Slide**: Increased horizontal slide translation distance to `1.75rem` (28px) and removed `width: 100%`/`height: 100%` restrictions on `.Content` to ensure natural layout flow and clear spatial direction during menu-to-menu switching.
- **Tuned Hover Delays**: Updated hover open `delay` from `0` to `150`ms and `closeDelay` from `80` to `200`ms on `NavigationMenu.Root` to prevent accidental triggers when sweeping the mouse quickly.
- **Removed Size Transition Clashes**: Scoped size transitions (`transition: width/height`) strictly to the `Viewport` container, removing them from `Positioner` and `Popup` to prevent nested layout thrashing.
- **Verification**: Ran `pnpm lint` and `pnpm build` (successfully compiled).

### Align Navigation Menu With Base UI Docs
- **Composition Fix**: Reworked `components/ui/navigation-menu.tsx` to follow the Base UI/shadcn navigation-menu composition more closely, including `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, and `NavigationMenuIndicator`.
- **Header Hover Style Preserved**: Updated `components/shop/site-header.tsx` so the desktop nav keeps the custom hover underline effect while using the docs-style `render={<Link />}` composition for Next.js links.
- **Verification**: Ran `pnpm lint`; it completed with the same pre-existing 21 warnings and no new errors.

## 2026-07-08

### Fix Navigation Menu & Floating Dropdown Composition
- **Floating Viewport Composition**: Re-engineered `components/ui/navigation-menu.tsx` by wrapping the root `NavigationMenu` component with Base UI's `<Portal>`, `<Positioner>`, `<Popup className="z-50">`, and `<Viewport>` subcomponents. This enables dropdown/mega menu content (`NavigationMenuContent`) to float and align dynamically underneath its trigger instead of rendering statically in-flow.
- **Support for Unstyled Links & Triggers**: Introduced an `unstyled` prop to `NavigationMenuLink` and `NavigationMenuTrigger` to allow custom top-level header links (like "Collection", "Help") and triggers (like "Sale", "Quần", "Áo", "Phụ kiện") to bypass default pill-shaped backgrounds and default padding.
- **Dropdown Stacking Context Fix**: Configured `className="z-50"` directly on Base UI's `Positioner` component inside `components/ui/navigation-menu.tsx`. This assigns a high z-index to the parent wrapper, resolving the stacking context bug where page content (such as the sticky filters toolbar and card favorite buttons) rendered on top of the dropdown.
- **Restored Original Hover Underline Style**: Refactored the triggers and links in `components/shop/site-header.tsx` to use the unstyled setup, restoring the original hover underline animation and proper spacing (`gap-10 pl-10`).
- **GPU-Accelerated Underline Transitions**: Replaced the legacy `width` animation with `scale-x-0` and `group-hover/link:scale-x-100` transform animations, scoping the underline element strictly to a relative text span (excluding the dropdown chevron) and positioning it with `bottom-[-3px]`. This completely removes browser subpixel rendering artifacts and trace remnants on mouse-leave.
- **Verification**: Built and verified compilation cleanly using `pnpm lint` and `pnpm build`.

## 2026-07-08

### Fix Sort Dropdown Popup Position
- **Position Adjustment**: Updated the Premium Sort Dropdown inside `components/shop/collection-client.tsx` to set `alignItemWithTrigger={false}`, `side="bottom"`, and `sideOffset={8}`. This ensures the dropdown options appear directly below the sort trigger button without overlapping/covering the text, matching the style of the gender selection dropdown in the signup form.
- **Verification**: Ran `pnpm lint` (0 errors, 21 pre-existing warnings) and `pnpm build` (completed successfully).

### Header & Filter Toolbar Scroll Synchronization
- **Gap Elimination & Timing Sync**: Updated the slide-up hiding offset of the non-home page header in `components/shop/site-header.tsx` to be exactly `-72px` (matching the header's physical height) instead of `-120px` to keep its bottom boundary perfectly meeting the top of the viewport when fully hidden.
- **Matched Easing and Durations**: Configured the sticky transition duration (`220ms`) and timing function (`cubic-bezier(0.23, 1, 0.32, 1)`) on the collection toolbar (`components/shop/collection-client.tsx`) and the search page toolbar/sidebar (`app/(shop)/search/page.tsx`) to exactly match the header's Framer Motion settings.
- **Combined Sidebar Transitions**: Merged the `top` property transition into the inline transition style rules of the collection desktop sidebar so it transitions seamlessly with `width` and `opacity` without CSS class property conflicts.
- **Verification**: Built and verified compilation cleanly using `pnpm lint` and `pnpm build`.


## 2026-07-07

### Header and Filter Toolbar Cohesion Refinement
- **Unified Non-Home Surface**: Updated `components/shop/site-header.tsx` so the collection/search header now uses the same solid `#f7f4ef` surface as the page instead of a blurred, bordered layer. This removes the visual seam between the header and the sticky catalog toolbar.
- **Faster Scroll Push Behavior**: Tuned the non-home header hide/show logic to react off scroll delta with a smaller threshold and a shorter `0.16s` ease-out transition, making the header feel pushed away and return immediately when scrolling back up.
- **Sticky Toolbar Compression**: Updated both `components/shop/collection-client.tsx` and `app/(shop)/search/page.tsx` so the sticky toolbar uses the same page background, faster top-offset syncing (`duration-150`), and a condensed state where the product-count label fades/slides away after scrolling deeper, closer to the Nike behavior.
- **Sidebar Stickiness Sync**: Reduced the desktop filter sidebar top-offset transition delay on collection and search so it tracks the header state more immediately rather than lagging behind it.
- **Follow-Up Stability Pass**: Switched the non-home header to a fixed transformed layer to reduce content peeking during rapid up/down scrolls, and made the left/right toolbar groups share the same condensed transform so `Showing ... products` moves with the filter/sort row instead of feeling detached.
- **Softer Header Motion**: Slightly slowed the non-home header hide/show response by increasing the scroll-delta threshold and motion duration, then added a same-color backplate plus explicit `body` background color so any overlap frame during fast scroll still reads as one continuous surface.
- **Toolbar Count Placement**: Moved `Showing ... products` into the same desktop controls cluster as filter toggle and sort on both collection and search pages, and removed the scroll-based hide behavior for that count text.
- **Vietnamese Typography Fix**: Swapped the serif heading stack from `Cormorant Garamond` to `Noto Serif` in `app/globals.css` to improve Vietnamese diacritic spacing on large headings and collection titles.
- **Pagination Scroll Offset**: Added an anchor above the collection toolbar and shifted pagination scroll targets upward by 28px so page changes land a little higher and do not clip the first product row.
- **Verification**: `pnpm lint` passes with the same pre-existing 21 warnings, and `pnpm build` completes successfully.

### Nike-Style Collection Grid and Pagination
- **Three-Column Grid**: Updated `components/shop/collection-client.tsx` so collection results always render 3 products per row on desktop. Cards are wider when filters are hidden and shrink naturally when the filter sidebar is shown.
- **Square Collection Imagery**: Added an `imageAspect` option to `components/shop/product-card.tsx`; collection cards now use square images to match the Nike-style reference while other ProductCard usages keep the existing portrait ratio.
- **Pagination Behavior**: Removed the invisible placeholder slots and fixed min-height reservation. Pagination now follows the real product grid height, and pagination clicks jump users back to the collection toolbar without smooth-scroll animation.
- **Filter Toggle Motion**: Reworked show/hide filters around a dedicated sidebar track width transition so the product grid receives a continuous width change while filters hide/show. The filter contents still use opacity/`translate3d`, with separate show vs hide timing and reduced-motion handling.
- **Product Resize Cleanup**: Removed per-tile FLIP resize and scoped ProductCard transitions to border/shadow only, preventing `transition-all` from fighting the product image resize.
- **Verification**: `pnpm lint` passes with 0 errors; existing repo warnings remain unchanged. Browser check confirmed 3 desktop columns with filters hidden/shown, square collection images, no placeholder slots, and pagination clicks jumping back to the collection toolbar.

### Implement Nike-Style Refined Search & Collection Filters
- **Collapsible Sidebar Filters (Search & Collection)**: Integrated collapsible leftmost sidebar filters (Category, Size, Color, Price Range) into both the search page (`app/(shop)/search/page.tsx`) and collection page (`components/shop/collection-client.tsx`). Sidebar is hidden by default (`showFilters` defaults to `false`). Grouped each in animated collapsible panels using `motion.div` and `AnimatePresence`.
- **Nike-Style Sticky Header & Scroll Toggles**:
  - Implemented scroll-down-to-hide and scroll-up-to-show animations for the floating site header on non-home pages using Framer Motion (`SiteHeader`).
  - Redesigned the header on non-home pages to be flat and full-bleed instead of a floating pill, forcing a fixed height of `h-[72px]` and perfect edge padding alignment (`px-6 md:px-16 mx-auto`) with a clean bottom border (`border-b border-[#e3dccf]/50`). The home page header remains unchanged.
  - Optimized scroll show/hide response speed: reduced duration to `0.2s` and applied a custom cubic-bezier ease-out curve (`ease: [0.22, 1, 0.36, 1]`) to trigger animations instantly on scroll direction change.
  - Synchronized header visibility with a CSS custom property `--header-visible-height` on `:root` (shifting between exactly `72px` when visible, and `0px` when hidden) to avoid any layout gap between the sticky header and toolbar.
  - Configured Collection and Search filter toolbars to stick to `top-[var(--header-visible-height)]` and left sidebars to stick to `top-[calc(var(--header-visible-height)+60px)]` with smooth `transition-[top] duration-300` properties, pinning them visually in the viewport like Nike.com.
- **Borderless & Full-Bleed Filter Toolbar**:
  - Removed the horizontal separating line (`border-b border-[#1c1a18]/10`) from the top toolbars in both `components/shop/collection-client.tsx` and `app/(shop)/search/page.tsx`.
  - Added breakout negative horizontal margins (`-mx-6 md:-mx-16`) and matching positive paddings (`px-6 md:px-16`) to the sticky toolbars, stretching their backgrounds to be 100% full bleed to the viewport edges (merging seamlessly with the header) while keeping their text contents aligned with the catalog grids.
  - Adjusted margins (`mb-6`) to let the toolbar row blend seamlessly with the product grid background.
- **Height-Stable Layout & shadcn Pagination**:
  - Installed and integrated the shadcn Pagination component into the collection view, customizing it to render raw anchors (for client-side state clicks) or Next.js `<Link>` components depending on `href` to avoid page reloads.
  - Set dynamic minimum heights (`lg:min-h-[1950px]` when filters shown, `lg:min-h-[1450px]` when filters hidden) on the product grid wrapper to match a fully populated 12-product layout, locking the pagination controls at a fixed Y position even when items are sparse.
  - Moved the separator line to the bottom (`border-b`) of the pagination wrapper so that the pagination controls are positioned cleanly above the line.
- **Lookbook Spacing Fix**: Adjusted the Lookbook teaser card margins to `mt-12 mb-12` and height to `h-[300px]` in `components/shop/collection-page.tsx` to make the empty white spaces above and below the card equal (48px) and visually balanced.
- **Verification**: `pnpm lint` and `pnpm build` compile and build cleanly with 0 errors.

- **Floating Label Gap**: Updated `components/auth/floating-input.tsx` so floating labels use a wider invisible `legend` gap plus visible `#efe7dc` background, padding, and z-index, preventing the input border from cutting through label text on focus/value.
- **Select Label Match**: Applied the same floating label treatment to the register page shopping preference select field.
- **Verification**: `pnpm build` passes. Visual/DOM smoke test confirmed focused auth labels render with matching background and z-index. Dev server was stopped after verification.

### Premium Interactive Login Reintegration & Specification

- **Specification Adaptation**: Created [login-prompt.md](file:///d:/CANH/Java/side%20project/commercial-fe/login-prompt.md) at the root of `commercial-fe` based on `d:\Download\login\prompt.md`, adapting all details (SVG characters, coordinates, face states, eye-tracking math, entry/exit choreographies) to the Vela Wear brand colors and Next.js 16/React 19 stack.
- **Full Interactive SVG Scene Reintegration**: Rebuilt `components/auth/auth-motion-scene.tsx` to render the 4 characters (Purple, Black, Yellow, Orange) inside a single responsive SVG. Styled each using custom gradients (Atelier Sand, Tailor Espresso, Linen Gold, Drape Terracotta) and soft shadows. Grounded the characters at `bottom-[18%] top-[8%]` with `preserveAspectRatio="xMidYMax meet"` on the SVG to sit perfectly on the pedestal of the editorial background image (`fashion-auth-editorial.png`), and removed the overlapping picture-in-picture thumbnail card to eliminate visual clutter.
- **Layout & Scrollbar Fixes**: Locked the screen height to `h-[100dvh] overflow-hidden` on `AnimatedAuthShell` to eliminate global page scrolling. Styled the right panel background using `bg-login.webp` with a transparent glassmorphic overlay (`bg-[#f7f4ef]/82 backdrop-blur-[2px]`), which keeps the characters clearly visible in the background behind the form. Centered the form vertically (`items-center`), and removed card-in-card background styling to make it a clean, transparent `max-w-[360px]` wrapper that fits perfectly on all screens without scrolling. Grid spans full-width (no max-width) using `lg:grid-cols-[1fr_minmax(0,560px)]` grid ratio where the left panel gets `1fr` and right panel is constrained to `560px`. This prevents the left panel from collapsing on desktop. Changed form container tags to `flex flex-col gap-6` (replacing `space-y-6`) to guarantee a reliable 24px vertical gap between inputs, preventing them from touching.
- **Input Styling & Original Layout**: Simplified the input layout in `components/auth/floating-input.tsx` and the Select wrapper in `components/auth/register-page.tsx` to match the exact original style from the download workspace. This removes the floating label behavior and layout complexities, restoring a clean static label situated directly above each input box (`display: block text-[14px] font-semibold mb-2`). Standardized all input elements, Gender select dropdown trigger, and Date of Birth fields to a consistent height of `h-12` (48px) to guarantee a perfectly balanced, pixel-aligned layout. Configured react-hook-form instances with `shouldFocusError: false` to disable auto-focusing on validation failure, and added explicit `document.activeElement.blur()` calls to all submit/validation handlers in SignInPage, RegisterPage, and ForgotPasswordPage to guarantee input focus is completely lost on submit, letting the characters react properly without focus-driven look-down overrides. Optimized the Register page form to be highly compact, changing "Shopping Preference*" to "Gender*" and displaying "Gender*" and "Date of Birth*" side-by-side in a 2-column grid row (`grid-cols-2 gap-4`), with the Day, Month, and Year inputs arranged inside a full-width inline subgrid (`grid-cols-4 w-full` where Day is `col-span-1`, Month is `col-span-1`, and Year is `col-span-2`) to ensure perfect visual balance. Implemented custom client-side validation logic and styling across all three authentication forms (SignInPage, RegisterPage, and ForgotPasswordPage); invalid fields display a solid red border highlight (with a normal transparent background, not colored red inside), and display concise, uppercase text errors (e.g. "Required", "Invalid Email") underneath them. Made validation error messages fully consistent and in English (e.g. "Required" instead of Vietnamese strings) across all Zod schema resolvers and custom submit triggers. The Terms checkbox in RegisterPage highlights in red, keeping the entire height of the form extremely compact and preventing layout shifts or page scrolling. Fully integrated `components/auth/register-page.tsx` with the `AnimatedAuthShell` so that the characters scene is rendered on the Register page, and wired `onFocus`/`onBlur` callbacks on all Register inputs (Email, Names, Password, DOB, Select) to drive the characters' eye-tracking and body leaning focus states. Form validation failure triggers (`onInvalid` callbacks) have been wired to the Sign In, Register, and Forgot Password forms to trigger the characters' shake/fail animations. Increased input text size to `text-[16px]` for improved readability. Set Email labels to `"Email*"` (replacing `"Email Address*"`). Set inputs and buttons to `rounded-[12px]` (matching the original `border-radius: 12px` style), and page panels to `rounded-[24px]` (matching `border-radius: 24px` of the original).
- **Fail Shake & Transition Optimization**: Scoped CSS rules in `AuthMotionScene` to disable CSS transitions (`transition: none !important`) on the characters during the `login-fail` shake and `login-success` exit bounce animations, ensuring the keyframe animations run immediately and sharply. Also disabled CSS transitions during idle mouse tracking to prevent conflicts with the requestAnimationFrame loop, enabling them only during active input focus transitions.
- **Image Restore**: Restored the high-end fashion editorial background image (`public/auth/fashion-auth-editorial.png`) for the characters scene.
- **Document-wide Mouse Tracking**: Attached pointermove event listener to `window` rather than only the left panel, allowing the eyes and bodies to track the cursor across the entire page (including the form).
- **Physical Lerp Interpolation**: Implemented a physical requestAnimationFrame loop that smoothly lerps to target coordinates (mouse coordinates in idle state, and custom focus coordinates on email focus, password hidden, and password visible states) to prevent jumping.
- **Scoped CSS Animations**: Embedded a scoped style block in `AuthMotionScene` defining entrance animations (`growUp`, `portalOpen`, `jellyBlobUp`), breathing, blinking, individual character fail shake/compression, and success bounce-down.
- **Success & Transition Improvements**:
  - Updated `components/auth/animated-auth-shell.tsx` to smoothly slide out and fade out the form panel on successful login, and added support for the `"forgot-password"` mode.
  - Fully integrated `ForgotPasswordPage` (`components/auth/forgot-password-page.tsx`) with the `AnimatedAuthShell` layout and characters animation, allowing input focuses and OTP verification steps to interact dynamically with the scene.
  - Redesigned the register and forgot password OTP step verification. Instead of jumping to the old solid parchment container, we now keep the `AnimatedAuthShell` mounted across all step transitions and render `OtpEntry` with `plain={true}` inline, preserving the characters' on-screen animation state seamlessly.
  - Increased the redirect timeout in `components/auth/sign-in-page.tsx` to `2000ms` so the full multi-phase exit sequence can be seen before routing.
- **Verification**: `pnpm tsc --noEmit` and `pnpm build` compile and build successfully with zero errors.

### Animated Auth Redesign Implementation

- **Reusable Auth Shell**: Added `components/auth/animated-auth-shell.tsx` to provide a shared split auth layout for sign-in and register, preserving the existing form content while adding a premium editorial motion scene.
- **Reactive Motion Scene**: Added `components/auth/auth-motion-scene.tsx` with a client-side pointer interpolation loop, typed scene state (`none/email/password`, password visibility, success/error), abstract sculptural forms, `motion/react` transitions, reduced-motion support, and safe visible-by-default rendering.
- **Asset Integration**: Copied the retained reference image to `public/auth/bg-login.webp`. Generated and saved a new fashion/editorial image to `public/auth/fashion-auth-editorial.png`, used as the primary auth scene background.
- **Sign-In Integration**: Updated `components/auth/sign-in-page.tsx` to use the animated shell, wire email/password focus state into the scene, preserve password-toggle focus behavior, and add success/error scene feedback around the existing auth provider login flow.
- **Register Integration**: Updated `components/auth/register-page.tsx` to use the animated shell while preserving the existing OTP registration flow, field set, password validation, select, checkboxes, and submit behavior.
- **Global Motion CSS**: Added the `authSceneShake` keyframe to `app/globals.css` for polished error feedback.
- **Visual Artifacts**: Captured verification screenshots at `artifacts/auth-sign-in-desktop.png`, `artifacts/auth-register-desktop.png`, and `artifacts/auth-sign-in-mobile.png`.
- **Verification**: `pnpm build` passes. Playwright/Chrome visual smoke test passed for `/sign-in`, `/register`, and mobile `/sign-in` with no horizontal overflow. `pnpm lint` still fails due to pre-existing shop errors in `components/shop/editorial-craft.tsx`, `components/shop/hero-slider.tsx`, and `components/shop/testimonials.tsx`; no new auth lint errors were reported after switching scene images to `next/image`.
- **Follow-ups**: Clean the existing shop lint errors so `pnpm lint` can return to green.

### Animated Auth Prompt Rewrite for Vela Wear

- **Reference Review**: Read the external `animated-login/prompt.md` brief and extracted its core strengths: shared reactive scene, cursor tracking, state-based focus reactions, password visibility choreography, and success/fail animation sequencing.
- **Source-Aware Rewrite**: Reviewed the reference source files (`js/state.js`, `js/eye-tracking.js`, `js/form-interactions.js`, and `css/characters.css`) to preserve the useful implementation ideas: compact state machine, single `requestAnimationFrame` pointer loop, CSS custom property transforms, and staged success/error transitions.
- **Vela Wear Rewrite**: Added [form-prompt.md](prompts/form-prompt.md) at `docs/prompts/` as a rewritten implementation brief for a future sign-in / register redesign. The new prompt keeps the interaction architecture of the reference project but translates it into Vela Wear's current premium fashion language: warm beige surfaces, serif editorial typography, terracotta CTA accents, abstract sculptural left-panel motion, and compatibility with the existing auth field set and OTP registration flow.
- **Tech Alignment**: Updated the prompt so the target build is explicitly based on the current app stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and `motion/react`, with a React component + hook architecture instead of static `index.html` / `css` / `js` modules.
- **Asset Direction Update**: Updated the prompt to preserve the provided `bg-login.webp` reference image as a reusable supporting auth asset, while replacing the other playful reference-image direction with a premium fashion/editorial image direction suitable for Vela Wear.
- **Scope Guardrails**: The new brief explicitly rejects cartoon/mascot styling, generic SaaS auth UI, third-party login drift, and any redesign that breaks current Vela Wear auth structure or form behavior.
- **Verification**: Documentation-only task. No app code changed, so `pnpm lint` and `pnpm build` were not run.
- **Follow-ups**: Use `form-prompt.md` as the build brief when implementing the animated sign-in and register redesign in the existing auth pages/components.

## 2026-07-05

### Floating Auth Label Border Fix

- **Floating Label Gap**: Updated `components/auth/floating-input.tsx` so floating labels use a wider invisible `legend` gap plus visible `#efe7dc` background, padding, and z-index, preventing the input border from cutting through label text on focus/value.
- **Select Label Match**: Applied the same floating label treatment to the register page shopping preference select field.
- **Verification**: `pnpm build` passes. Visual/DOM smoke test confirmed focused auth labels render with matching background and z-index. Dev server was stopped after verification.

### Premium Vela Wear Homepage & Adapted Header/Footer Integration

- **Homepage Replacement**: Completely replaced the homepage in `components/shop/home-page-client.tsx` (actually `components/shop/home-page.tsx`) with the new design from `vela-wear (1)`. This integrates all premium sections: `HeroSlider`, `FeaturedCategories`, `StorySection`, `EditorialCraft`, `HorizontalSlider` (trending), brand values bento-grid, `Testimonials`, and `Newsletter`.
- **Layout Spacing Standardized**: Updated all homepage section containers (`FeaturedCategories`, `StorySection`, `EditorialCraft`, `HorizontalSlider`, bento values, `Testimonials`, and `Newsletter`) to use the standard wide catalog styling (`max-w-[1800px] px-6 md:px-16 mx-auto`) for consistent desktop alignment.
- **Hydration Bug Fixes**: 
  - Added an `isMounted` mount check to `EditorialCraft` progress bar calculations to resolve client/server window mismatches.
  - Added `suppressHydrationWarning` to all primary `<img>` and `<motion.img>` elements (including the **Vela Wear Logo** in `<SiteHeader>`, as well as `FeaturedCategories`, `StorySection`, `HeroSlider`, `EditorialCraft`, `HomeProductCard`) to prevent hydration mismatches caused by Chrome browser extensions (like lazy loaders or ad blockers) rewriting image source attributes to transparent GIF placeholders.
- **Responsive Tablet Enhancements**: Changed sticky-scroll layout prefixes in `EditorialCraft` from `md:` to `lg:` so that tablet screens render a standard stacked layout, preventing structural bugs on iPad sizes.
- **Smooth Header Transitions (Floria-style)**: Applied the header layout and animations from the `floria-landing-page` project. Encapsulated the header in a `<motion.header>` element that slides down on mount using a spring entrance animation. Swapped the transition logic to separate the outer layout container (which transitions `py-8` to `py-4` on scroll) from the inner content wrapper (which morphs from a flat borderless container to a glassmorphic `bg-white/20 border-white/30 rounded-full shadow` pill with blur-saturation filter), ensuring buttery smooth transition. Renamed "Join / Log In" to "Log In" across all navigation layouts. Enriched the desktop search bar sizing (w-52 focus-within:w-68, py-2, text-xs input, w-4 h-4 icon) and linked the cart button directly to the `/cart` route, removing the redundant sidebar drawer.
- **Removed Link Deprecations**: Removed all `legacyBehavior` and `passHref` properties on `<Link>` components (and swapped nested `<motion.a>` for `<motion.div>`) in `FeaturedCategories` and `StorySection`, completely eliminating the `legacyBehavior` deprecation warning.
- **ScrollReveal Animations**: Created `components/shop/scroll-reveal.tsx` supporting viewport scroll reveals with type-safe Cubic-Bezier transition easings.
- **Vela Wear Product Catalog**: Added 4 new products (`classic-linen-shirt`, `pleated-wool-trousers`, `the-heritage-tote`, `merino-wool-coat`) to the global products database in `lib/vela-data.ts` using USD currency to align with other store pages.
- **Dynamic Static Params**: Updated `app/(shop)/products/[id]/page.tsx` parameter generation list to include the 4 new product slugs.
- **Verification**: Run `pnpm build` successfully with exit code 0. Verified zero linter warnings and clean compilation of all static page generations.

### Frontend Checkout API Integration (Phase 7)

- **Checkout API Client**: Created `lib/checkout-api.ts` with TypeScript types (`CheckoutRequest`, `CheckoutResponse`, `CheckoutItemRequest`, `CheckoutItemResponse`) and functions (`submitCheckout`, `cancelOrder`, `extractCheckoutError`) following the existing `auth-otp-api.ts` pattern.
- **CartItem variantId**: Added `variantId?: number` to `CartItem` in `lib/vela-data.ts`. Added `OrderSummary` type for order display. Updated `INITIAL_CART_ITEMS` with placeholder `variantId` values.
- **Cart Provider**: Updated `components/shop/cart-provider.tsx` `addToCart` to copy `product.realId` → `cartItem.variantId`.
- **Checkout Page Rewrite**: Rewrote `components/shop/checkout-page-client.tsx`:
  - Replaced `apiClient.post("/orders", ...)` with `submitCheckout()` from checkout API.
  - Removed client-side order code generation; uses server-returned `orderCode`.
  - Replaced credit card form with payment method radio selector (COD default, Bank Transfer, VNPay/MoMo as coming-soon disabled options).
  - Coupon code sent to server via `CheckoutRequest.couponCode` instead of client-side validation.
  - Success screen shows server-returned `orderCode`, `finalAmount`, `paymentMethod`, `status`.
  - Proper error handling: insufficient stock, invalid coupon, validation errors, unauthenticated.
  - Loading spinner during submission.
- **Verification**: `pnpm lint` — 0 errors (5 pre-existing warnings). `pnpm build` — clean, all 28 pages generated.
- **Follow-ups**: Integrate online payment gateways (VNPay, MoMo) when backend support is ready. Add order tracking/history page that uses the `OrderSummary` type.

## 2026-06-30

### Reusable OTP & Account Flows Integration (Vela Wear)

- **Auth OTP API Client & Hook**: Created `lib/auth-otp-api.ts` defining types and client methods (`requestOtp`, `verifyOtp`, `resetPassword`, `changeEmail`). Added a reusable `components/auth/use-otp-flow.ts` React hook to encapsulate OTP request, verification, cooldown timers, and API error states.
- **Shared OTP UI Component**: Created `components/auth/otp-entry.tsx` featuring standard or inline layout options, validation checks, custom timers, and child inputs extension.
- **Registration Flow Integration**: Refactored `register-page.tsx` to utilize the new reusable hook and component, verifying email OTP before user accounts are finalized.
- **Forgot Password Reset**: Integrated the dedicated `/forgot-password` route utilizing the reusable hook and component to collect, verify OTP, and reset credentials.
- **Change Email Flow Integration**: Refactored the Profile Settings page (`app/(shop)/profile/settings/page.tsx`) to implement inline email updates with OTP checks, updating user context profiles.
- **Verification**: Verified zero errors/warnings in Next.js Turbopack production builds.

## 2026-06-28

### Storefront Catalog i18n Completed

- **Locale Source**: Created `lib/i18n.ts` defining `DEFAULT_LOCALE = "vi"` and `getActiveLocale()` helper function.
- **Request Interceptor**: Configured `apiClient` in `lib/api-client.ts` to automatically attach the `Accept-Language` header to backend requests.
- **API Locale Propagation**: Modified `collection-client.tsx`, search `page.tsx`, `product-detail-page.tsx`, and `product-detail-client.tsx` to explicitly append `locale` query parameters to `/categories`, `/products`, and `/product-variants` requests, ensuring data caching query keys align with active locales.
- **Localized Fields Mapping & UI**: Updated `Product` model types in `lib/vela-data.ts` to support optional localized metadata (`seoTitle`, `seoDescription`, `seoKeywords`, `material`, `care`, `shortDescription`). Updated `mapBackendProduct` mapper to consume them. Added a new interactive accordion panel for **Material & Care** in the product detail view.
- **Verification**: Ran `pnpm lint` and `pnpm build` successfully, ensuring zero typescript compilation or static site generation errors.

## 2026-06-18

### Member Registration Form Design Refinements Completed

- **Spacing & Layout Shifting**: Shortened the vertical gap between the logo and header title by reducing the margin-top (`mt-3` instead of `mt-6`), and shifted the entire container higher up on the page (`pt-4 md:pt-8` instead of `pt-10 md:pt-16`) on the register page ([register-page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/auth/register-page.tsx)).
- **Shadcn UI Checkboxes**: Removed the divider border line (`border-t`) and padding above the agreements block. Replaced standard checkbox inputs with uniform Shadcn UI `<Checkbox>` components (`size-5`) and mapped the checked state fill color to the brand's brown `#964025`. Added high-contrast `border-[#1c1a18]` (border-ink) borders so the checkbox frames are clearly visible against the beige background.
- **Select with Floating Label & Spacing Fixes**: Re-implemented the custom Shadcn UI `<Select>` component. Configured the trigger value and states (`isSelectFocused` and `preference`) to transition the `"Shopping Preference*"` label seamlessly onto the top border line on focus or selection. Used `!h-14 py-0` to force the trigger height to exactly 56px and removed vertical text offsets so the option text is perfectly aligned with the right-hand chevron arrow. Styled the `<SelectContent>` dropdown options list with `w-[var(--anchor-width)]` to match the trigger box boundaries exactly, and set `alignItemWithTrigger={false}` to prevent the menu popup from covering/overlapping the trigger box. Mapped value labels within `<SelectValue />` to render formatted selection strings (`"Men's"` / `"Women's"`) instead of raw value keys (`"mens"` / `"womens"`).
- **Date of Birth Floating Labels**: Replaced the standard Day, Month, and Year inputs with `<FloatingInput>` components to enable the floating label text transition on focus and value. Added a larger spacing margin (`mb-3.5`) to the "Date of Birth*" section label to prevent the floating labels from overlapping it.
- **Password Toggle Focus Persistence**: Added `onMouseDown` event handlers calling `preventDefault()` to the eye visibility toggle buttons in both [register-page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/auth/register-page.tsx) and [sign-in-page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/auth/sign-in-page.tsx). Created React `useRef` hooks pointing to the password input nodes to programmatically invoke `.focus()` inside a `setTimeout` callback upon toggling. This prevents focus loss (triggered when the browser swaps inputs from `password` to `text`), keeping the text floating label active and cursor active in the field.
- **Dynamic Password Validation**: Replaced the static helper guidelines under the password field with component validation state. Guidelines are now hidden by default and only display as dynamic red warning messages if validation fails on form submission.
- **Verification**: Form layout, inputs, selections, checkboxes, and password visibility toggling operate cleanly and preserve focus/aesthetic style.

### Refined Member Auth Forms (Nike-Style) Completed

- **Registration Form Redesign**: Integrated the Stitch design screen **Vela Wear - Refined Nike-Style Registration Form** into [register-page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/auth/register-page.tsx). Re-styled registration input fields with a modern floating label animation effect where text shifts to overlap the input top border line on focus/value.
- **Button styling & Arrows**: Maintained the brand-consistent brown `#964025` CTA color for the submit button and removed the arrow icon as requested.
- **Vertical spacing**: Pushed both the Sign In ([sign-in-page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/auth/sign-in-page.tsx)) and Register forms higher up on the screen by reducing the top padding (`pt-10 md:pt-16`), matching the layout profile of Nike accounts portal.
- **Floating Labels on Sign In**: Implemented the matching floating label inputs on the Sign In page for complete design harmony across the member portal.
- **Verification**: Successfully ran `pnpm build` ensuring clean TypeScript compilation and static page generation.

### Multi-Page Refinement, Footer Redesign & Search/Favorites Pages Completed

- **Footer Redesign**: Modified [site-footer.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/site-footer.tsx) into a `"use client"` component to support custom newsletter forms. Redesigned layout to match the provided screenshot: a left-aligned serif "VELA WEAR" header, a newsletter signup form with a terracotta `#b5573a` button, columns for "Chính Sách" and "Hỗ Trợ", and a centered copyright text at the bottom.
- **Standalone Favorites Page**: Created [favorites/page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/app/(shop)/favorites/page.tsx) with a responsive editorial grid displaying wishlist items, supporting instant removals, and quick "Add to Bag" triggers that fire notifications.
- **Search & Filters Page**: Created [search/page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/app/(shop)/search/page.tsx) with dynamic client-side querying over the expanded `PRODUCTS` catalog, sidebar checkboxes for categories, size buttons, sorting options, and direct integration with `ProductCard`.
- **Layout Synchronizations**:
  - Updated container max-width to `max-w-[1800px] px-6 md:px-16 mx-auto` on the Cart page ([cart-page-client.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/cart-page-client.tsx)), Checkout page ([checkout-page-client.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/checkout-page-client.tsx)), and Collection page ([collection-page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/collection-page.tsx)).
  - Wrapped search bar inputs in `<form>` tags in [site-header.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/site-header.tsx) to redirect query submissions to `/search?q=query`.
  - Updated heart action icons in [site-header.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/site-header.tsx) and the favorites toast in [notification-provider.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/notification-provider.tsx) to link directly to `/favorites`.
- **Expanded Products Database**: Added extra product items to the `PRODUCTS` list in [vela-data.ts](file:///d:/CANH/Java/side%20project/commercial-fe/lib/vela-data.ts) matching Stitch design screens (Signature Hemp Tee, Artisan Linen Over-Shirt, Chunky Wool Knit, Oversized Linen Shirt, Relaxed Trousers, Lightweight Jacket) to render beautiful results in search and favorites.
- **Sticky Footer & Spacing**: Configured `min-h-screen` on the body tag in [layout.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/app/layout.tsx). Positioned empty states at `justify-start pt-24 min-h-[80vh]` for Favorites and Cart to pull the icons/text higher up below the page headers. Set `min-h-[80vh]` on the populated grid/cart containers so that the footer stays pushed below the fold in all states. Synchronized breadcrumbs, header typography size, and layout between Cart and Favorites for visual consistency.
- **Verification**: Successfully ran `pnpm build` ensuring clean compilation and route static generation.

### Product Detail Redesign & Enhanced Info Completed

- Retrieved and downloaded Stitch HTML template for **Vela Wear - Synchronized Product Detail with Enhanced Previews & Info**.
- Updated [product-detail-page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/product-detail-page.tsx) page container max-width to `max-w-[1800px] px-6 md:px-16` to match the brand's wide layout.
- Redesigned [product-detail-client.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/product-detail-client.tsx):
  - vertical thumbnail gallery next to main image (`flex flex-row gap-4`).
  - customized ring-style color selectors and clean box size selectors.
  - stacked full-width Thêm vào giỏ and Favourite buttons.
  - interactive collapsibles for Size & Fit, Delivery, and Reviews.
  - wired up Added to Bag and Added to Favorites notifications to trigger on button clicks.
- Verification: ran `pnpm lint` and `pnpm build` successfully with 0 errors.

### Notifications & Favorites Integration Completed

- Retrieved and downloaded Stitch HTML templates for **Vela Wear - Precision Nike-Style Notification** and **Vela Wear - Added to Favorites Notification (Sharp Style)**.
- Created [notification-provider.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/notification-provider.tsx) managing floating toast panels for "Added to Bag" (Nike Style) and "Added to Favorites" (Sharp Style) with auto-dismiss timer.
- Created [favorites-provider.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/favorites-provider.tsx) to handle wishlist state (`favorites: Product[]`) and actions.
- Integrated the providers inside [layout.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/app/layout.tsx).
- Updated [site-header.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/site-header.tsx) to link the heart icon to `/profile?tab=favourites` and show a dynamic favorites count badge.
- Added favorite heart toggles and notification hooks inside [product-card.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/product-card.tsx) and [product-detail-client.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/product-detail-client.tsx).
- Refactored [page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/app/(shop)/profile/page.tsx) to support dynamic subtabs (Profile, Orders, Favourites, Settings) with lazy searchParams parsing, rendering favorited products in a grid, and custom mock delivered orders.
- Verification: ran `pnpm lint` and `pnpm build` successfully with 0 compilation/linter errors.

## 2026-06-17

### Auth Pages Logo Integration Completed

- Replaced text-only logo headers with the stylized brand logo image (`BrandMark` / `/logo.png`) in [auth-shell.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/auth/auth-shell.tsx) (used by Sign In page) and [register-page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/auth/register-page.tsx) (used by Register page).
- Downloaded the HTML code for **Vela Wear - Registration Form** ([vela-wear-registration-form.html](file:///d:/CANH/Java/side%20project/commercial-fe/artifacts/vela-wear-registration-form.html)), **Vela Wear - Sign In Refined (Card Style)** ([vela-wear-sign-in-refined.html](file:///d:/CANH/Java/side%20project/commercial-fe/artifacts/vela-wear-sign-in-refined.html)), and **Vela Wear - Sign In** ([vela-wear-sign-in.html](file:///d:/CANH/Java/side%20project/commercial-fe/artifacts/vela-wear-sign-in.html)) using `curl.exe`.

### Member Profile, Help Center Pages Built & Dynamic Header Enabled

- Created [profile/page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/app/(shop)/profile/page.tsx) rendering the Eleanor member profile card, interests filter grid, and recommended products scroll carousel.
- Created [help/page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/app/(shop)/help/page.tsx) containing Help topics, categories guides cards, and an interactive state-based FAQ accordion.
- Refined [site-header.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/site-header.tsx) to import `usePathname` to enable dynamic header auth:
  - Shows Member initials avatar **"E"** when route is `/profile` (logged in).
  - Shows text link **"Join / Log In"** on other pages (linking to `/profile` as mock trigger).
  - Added "Help" link pointing to `/help` (linking to the Help Center page).
- Verification: ran `pnpm lint` and `pnpm build` successfully. All pages compiled cleanly to static routes.
- Follow-ups: build settings/orders tabs functionality on the profile page.

### Layout Broadened (Nike-style) & Logo Simplified

- Removed the text wordmark `VELA WEAR` from [brand-mark.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/brand-mark.tsx), leaving only the stylized "V" icon at `h-10` according to the Stitch template.
- Expanded the layout grid container maximum width across the site from `1280px` (`max-w-7xl`) to **`1800px`** (`max-w-[1800px]`) with horizontal padding set to `px-6 md:px-16`. This affects the Header, Featured Categories grid, Trending Now product list, Story section, and Footer, creating a wide layout style matching Nike.com.
- Updated [globals.css](file:///d:/CANH/Java/side%20project/commercial-fe/app/globals.css) to import Google Fonts (Inter, Cormorant Garamond) and correct variables/theme color definitions (like Terracotta primary `#b5573a` and surface-card `#efe7dc`).
- Reconstructed [home-page.tsx](file:///d:/CANH/Java/side%20project/commercial-fe/components/shop/home-page.tsx) with interactive Hero slider, Featured categories grid, Trending product scroll carousel, and dark Story section.
- Verification: ran `pnpm lint` and `pnpm build` successfully with zero compiler/lint errors.
- Follow-ups: check that other interior pages match the wider container layout.

### Tested Stitch MCP and Retrieved Enhanced Editorial Homepage

- Verified that the `stitch` MCP server is working correctly.
- Retrieved the Stitch project data and specific screen details for "Vela Wear - Enhanced Editorial Homepage".
- Downloaded the corresponding screenshot ([vela-wear-enhanced-editorial-homepage.png](file:///d:/CANH/Java/side%20project/commercial-fe/artifacts/vela-wear-enhanced-editorial-homepage.png)) and HTML code ([vela-wear-enhanced-editorial-homepage.html](file:///d:/CANH/Java/side%20project/commercial-fe/artifacts/vela-wear-enhanced-editorial-homepage.html)) using `curl.exe`.
- Verification: verified presence of the downloaded files under the `artifacts/` folder.
- Follow-ups: build/incorporate the downloaded design into the Next.js frontend as requested.

## 2026-06-16

### Documentation Workflow Added

- Created `docs/PROJECT_STATUS.md` as the shared project handoff log.
- Updated `AGENTS.md` so agents must read this status file before making changes and update it after completing meaningful work.
- Verification: documentation-only change; no app code touched.
- Follow-ups: keep this file current with concise summaries, verification results, and known next steps.

