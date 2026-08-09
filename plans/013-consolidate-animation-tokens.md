# 013 — Consolidate shared CSS animation tokens

- **Status**: DONE
- **Commit**: 937306c
- **Severity**: HIGH
- **Category**: Cohesion & tokens
- **Estimated scope**: 4 files (`app/globals.css`, `components/shop/site-header.tsx`, `components/shop/product-detail-client.tsx`, `components/shop/checkout-page-client.tsx`)

## Problem

Inline cubic-bezier arrays such as `[0.16, 1, 0.3, 1]` and `[0.23, 1, 0.32, 1]` are typed inline across multiple TSX components (`site-header.tsx`, `product-detail-client.tsx`, `checkout-page-client.tsx`, `scroll-reveal.tsx`), creating token duplication and fragmentation across the codebase.

```tsx
/* components/shop/product-detail-client.tsx:418 — current inline easing */
transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
```

## Target

Define shared CSS custom properties `--ease-vela` and `--ease-vela-out` in `app/globals.css` and export a shared motion constants file `lib/motion-tokens.ts` so all motion components reference unified easing tokens:

```css
/* app/globals.css target */
:root {
  --ease-vela: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-vela-out: cubic-bezier(0.23, 1, 0.32, 1);
}
```

```ts
/* lib/motion-tokens.ts target */
export const EASE_VELA = [0.16, 1, 0.3, 1] as const;
export const EASE_VELA_OUT = [0.23, 1, 0.32, 1] as const;
```

## Repo conventions to follow

- Global CSS theme variables live in `app/globals.css` under `:root`.
- Reuse existing token conventions e.g. `--primary: #b5573a`.

## Steps

1. Add `--ease-vela` and `--ease-vela-out` CSS variables to `app/globals.css` under `:root`.
2. Create `lib/motion-tokens.ts` exporting `EASE_VELA` and `EASE_VELA_OUT` tuple constants.
3. Import `EASE_VELA` in `site-header.tsx`, `product-detail-client.tsx`, `checkout-page-client.tsx`, and `scroll-reveal.tsx` replacing inline array literals.

## Boundaries

- Do NOT change component layout or DOM structure.
- Do NOT alter animation durations or spring parameters.
- Do NOT add external dependencies.

## Verification

- **Mechanical**: `pnpm exec tsc --noEmit` exits with code 0; `pnpm lint` passes with 0 errors.
- **Feel check**: Verify mobile menu expand, accordion open/close, and checkout success card entrance retain smooth editorial easing.
- **Done when**: All inline cubic-bezier arrays in storefront components consume unified tokens from `lib/motion-tokens.ts`.
