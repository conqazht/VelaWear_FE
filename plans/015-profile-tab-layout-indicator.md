# 015 — Add sliding layout indicator to profile page tab navigation

- **Status**: DONE
- **Commit**: 937306c
- **Severity**: LOW
- **Category**: Cohesion & polish
- **Estimated scope**: 1 file (`app/(shop)/profile/page.tsx`)

## Problem

The profile navigation tabs currently swap active background and text colors instantly without a sliding active indicator line, creating a static, disjointed feel when switching tabs.

```tsx
/* app/(shop)/profile/page.tsx — current active tab styling */
className={cn(
  "px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors",
  activeTab === tab.id ? "border-b-2 border-[#b5573a] text-[#1c1a18]" : "text-[#1c1a18]/60"
)}
```

## Target

Introduce a shared `motion.div` active tab underline indicator using `layoutId="profile-tab-indicator"` to smoothly slide under whichever tab is active:

```tsx
/* target */
{activeTab === tab.id && (
  <motion.div
    layoutId="profile-tab-indicator"
    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#b5573a]"
    transition={{ type: "spring", stiffness: 380, damping: 30 }}
  />
)}
```

## Repo conventions to follow

- `motion/react` `layoutId` pattern is used for sliding indicator lines across shared tab menus.
- Spring transition follows standard tab indicator config (`stiffness: 380, damping: 30`).

## Steps

1. Inspect `app/(shop)/profile/page.tsx` tab rendering loop.
2. Add relative positioning to tab buttons.
3. Insert `motion.div` indicator with `layoutId="profile-tab-indicator"` rendered when `activeTab === tab.id`.

## Boundaries

- Do NOT change tab IDs, query parameter routing, or active tab state management.
- Do NOT alter tab panel content or lazy loading behavior.
- Do NOT add external dependencies.

## Verification

- **Mechanical**: `pnpm exec tsc --noEmit` exits with code 0; `pnpm lint` passes with 0 errors.
- **Feel check**: Click between profile tabs (Profile, Orders, Coupons, Reviews); verify the red active line glides smoothly between tabs.
- **Done when**: Active profile tab indicator slides seamlessly using `layoutId`.
