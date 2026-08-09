# 016 — Add reduced motion fallback to editorial craft scroll-bound gallery

- **Status**: DONE
- **Commit**: 937306c
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file (`components/shop/editorial-craft.tsx`)

## Problem

The editorial craft section on desktop binds step advancement and image crossfades directly to window scroll position. Users with vestibular motion sensitivities who have enabled `prefers-reduced-motion` at the OS level currently experience uninterrupted scroll-bound motion.

```tsx
/* components/shop/editorial-craft.tsx:55 — current scroll listener */
useEffect(() => {
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    if (window.innerWidth < 1024) return;
    // scroll progress calculation
  };
  // ...
}, []);
```

## Target

Integrate `useReducedMotion()` from `motion/react`. When `reduceMotion` is true, disable scroll-bound step interpolation and render static step cards without continuous motion transforms.

```tsx
/* target */
const reduceMotion = useReducedMotion();

useEffect(() => {
  if (reduceMotion) return;
  const handleScroll = () => { ... };
  // ...
}, [reduceMotion]);
```

## Repo conventions to follow

- Accessibility motion gating uses `useReducedMotion()` from `motion/react`.
- Desktop/mobile breakpoint checks follow Tailwind `lg:` (1024px).

## Steps

1. Import `useReducedMotion` from `motion/react` in `editorial-craft.tsx`.
2. Add `const reduceMotion = useReducedMotion()` to `EditorialCraft`.
3. Early return in `useEffect` scroll handler when `reduceMotion` is true.
4. Pass `reduceMotion` to step card transforms so image transitions render statically without zoom/slide.

## Boundaries

- Do NOT change step titles, descriptions, images, or copy keys.
- Do NOT alter mobile/tablet layout behavior.
- Do NOT add external dependencies.

## Verification

- **Mechanical**: `pnpm exec tsc --noEmit` exits with code 0; `pnpm lint` passes with 0 errors.
- **Feel check**: In Chrome DevTools Rendering tab, emulate `prefers-reduced-motion: reduce`. Scroll past the Editorial Craft section on desktop and verify images render statically without forced scroll-pinning or crossfade motion.
- **Done when**: `editorial-craft.tsx` respects `useReducedMotion()` and disables scroll-bound motion when requested.
