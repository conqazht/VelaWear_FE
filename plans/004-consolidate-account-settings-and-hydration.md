# Plan FE-004: Consolidate account settings and hydrate forms safely

> **shadcn/improve provenance**: Generated from the **shadcn/improve skill v1.0.0** audit. This English file is canonical. Codex implements it directly; do **not** invoke `improve execute`. Vietnamese copy: `plans/vi/004-consolidate-account-settings-and-hydration.vi.md`.
>
> **Executor instructions**: Preserve the real OTP/password flows and make unsupported controls truthful. Add behavior tests before deleting duplicate UI. STOP rather than inventing backend preference or account-deletion APIs.
>
> **Drift check (run first)**: `git diff --stat ff217af..HEAD -- 'app/(shop)/profile/page.tsx' 'app/(shop)/profile/settings/page.tsx' components/shop/profile-navigation.tsx lib/i18n/messages/account.ts`

## Status

- **Priority**: P1
- **Effort**: L
- **Wave**: 2
- **Risk**: MED — two competing settings surfaces include sensitive-account UI.
- **Depends on**: FE-001
- **Category**: bug
- **Planned at**: commit `ff217af`, 2026-07-16

## Why this matters

The main profile renders local-only privacy/communication settings, enabled Save/Delete buttons without handlers, and a password modal that never submits. A separate `/profile/settings` route contains the real OTP email and password mutations but has no reachable navigation and initializes email before async auth hydration. Users can believe a security/privacy action succeeded when nothing happened.

## Current state

- `app/(shop)/profile/page.tsx:234-242` labels local state `// Mock settings state`.
- Save buttons without handlers are at `:742-746`, `:769-773`, `:829-833`; Delete has no handler at `:580-585`.
- Password modal opens at `:450-460`, but its final button at `:1166-1182` has no submit handler.
- `app/(shop)/profile/settings/page.tsx:145-169` contains the real `changePassword` + reauthentication flow; email OTP is in the same component.
- `components/shop/profile-navigation.tsx:9-17` omits a settings tab. The only code reference to `/profile/settings` is inside that route itself at `settings/page.tsx:200-205`.
- Although `app/(shop)/profile/layout.tsx` already renders `CachedProfileNavigation`, `settings/page.tsx:200-240` renders a second local account-tab navigation. Once Settings is added to the shared navigation, that duplicate block must be removed so the route exposes exactly one account navigation with Settings active.
- `settings/page.tsx:77-86` calls `useForm({ defaultValues: { email: user?.email || "" } })`; React Hook Form does not reapply async defaults.
- `settings/page.tsx:177-198` renders a sign-in prompt without first honoring auth loading state.

## Commands you will need

| Purpose      | Command                                                                                                        | Expected on success       |
| ------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Target tests | `pnpm exec vitest run 'app/(shop)/profile/settings/page.test.tsx' components/shop/profile-navigation.test.tsx` | all pass                  |
| Lint         | `pnpm exec eslint . --max-warnings 25`                                                                         | exit 0                    |
| Typecheck    | `pnpm exec tsc --noEmit --pretty false --incremental false`                                                    | exit 0                    |
| Unit         | `pnpm test:unit`                                                                                               | all tests pass            |
| Build        | `pnpm build`                                                                                                   | production build succeeds |
| Smoke        | `pnpm test:e2e:smoke`                                                                                          | smoke suite passes        |

## Scope

> **Workflow-metadata exception**: In addition to the source allowlist below, update `docs/PROJECT_STATUS.md` with this plan ID, branch, actual outcome, and exact verification evidence. Canonical EN/VI plan files may be reconciled before source edits under `plans/README.md`; the reviewer/operator owns index status. No other out-of-scope file is allowed.

**In scope**:

- `app/(shop)/profile/page.tsx`
- `app/(shop)/profile/settings/page.tsx`
- `components/shop/profile-navigation.tsx`
- `lib/i18n/messages/account.ts`
- `app/(shop)/profile/settings/page.test.tsx` (create)
- `components/shop/profile-navigation.test.tsx` (create)

**Out of scope**:

- New backend preference, privacy, location or delete-account APIs.
- Changing OTP/proof-token contracts or reauthentication cleanup.
- Broad profile decomposition (FE-009/FE-010).
- Visual redesign, new settings storage, or localStorage persistence for mock preferences.

## Git workflow

- **Authorization gate**: do not commit, push, or open a PR without an explicit current operator instruction; all commit examples are recommendations only.
- Run each command separately and stop on the first failure:
  ```powershell
  git fetch origin
  git switch main
  git pull --ff-only origin main
  git status --short --branch
  git rev-parse HEAD
  git rev-parse origin/main
  git switch -c fix/account-settings-integrity
  ```
- The worktree must be clean and both SHAs must match before branch creation.
- STOP on branch collision, dirty worktree or diverged main; never stash/reset.
- Suggested commit: `fix: consolidate account settings flows`.

## Steps

### Step 1: Characterize the real settings flows

Create tests for auth loading, guest prompt, hydrated email, dirty email preservation, password submit, OTP callback and reauthentication redirect. Mock at API/hook boundaries; do not mock React Hook Form behavior being tested.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/settings/page.test.tsx' components/shop/profile-navigation.test.tsx` → existing OTP/password cases pass; new loading, hydration, duplicate-navigation, and Settings-active cases fail for the documented gaps before implementation.

### Step 2: Make settings reachable and canonical

Add `settings` to the shared profile tab type/navigation with `/profile/settings`. Remove the local top-level account-tab block at `settings/page.tsx:200-240`; keep only settings-specific content/sidebar below the single shared navigation supplied by `profile/layout.tsx`. Replace the fake profile password editor with a link/button to the canonical route. Ensure desktop/mobile navigation semantics and active state are correct.

**Verify**: `pnpm exec vitest run components/shop/profile-navigation.test.tsx 'app/(shop)/profile/settings/page.test.tsx'` → exactly one account navigation is rendered for `/profile/settings`, exactly one Settings item is active, and password edit navigates to the canonical route.

### Step 3: Remove or explicitly disable unsupported actions

Remove duplicate local-only panels and dead password state where safe. Any unsupported UI retained for product visibility must be disabled with `aria-disabled` and an explicit localized “Coming soon” label. Enabled Save/Delete controls without handlers are forbidden.

**Verify**: run the negative search and guards first:

```powershell
rg -n 'Mock settings state|setReviewVisibility|setLocationSharing|setPrivacySettings|setIsEditPasswordOpen' 'app/(shop)/profile/page.tsx'
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

Then run the positive test separately:

```powershell
pnpm exec vitest run 'app/(shop)/profile/settings/page.test.tsx'
```

Expected: the negative search exits 0 with no output; the test exits 0, no enabled unsupported action remains, and all real settings cases pass.

### Step 4: Hydrate email without overwriting user edits

Use `isLoading` from `useAuth`. When the authenticated user first resolves or changes, reset the email field/default only if it is pristine; a cache refetch must not overwrite a dirty value. Preserve validation and requested OTP email semantics.

**Verify**: `pnpm exec vitest run 'app/(shop)/profile/settings/page.test.tsx'` → named pending→authenticated and dirty-refetch cases pass; email initializes once and later cache refresh does not overwrite edits.

### Step 5: Run full account regression

Run all gates and smoke. Manually or via component test exercise email OTP, password change/create, cancel, validation, reauthentication redirect and both locales.

**Verify**: run `pnpm exec eslint . --max-warnings 25`, `pnpm exec tsc --noEmit --pretty false --incremental false`, `pnpm test:unit`, `pnpm build`, and `pnpm test:e2e:smoke` separately → each exits 0.

## Test plan

- Loading state never flashes guest prompt.
- Hydration sets initial email; refetch does not overwrite dirty input.
- Settings navigation active state and canonical href.
- The settings route has exactly one account navigation and exactly one active Settings item.
- Real password/OTP mutations receive existing payloads and redirect after revocation.
- Unsupported controls are absent or disabled/labeled.
- Model render/mocks after `components/shop/checkout-page-client.test.tsx`; use a real `I18nProvider` where practical as in `app/(shop)/profile/orders/[code]/order-review-dialog.test.tsx`.

## Done criteria

- [ ] `/profile/settings` is reachable from shared profile navigation.
- [ ] The duplicate settings-page account tabs are removed; exactly one shared navigation marks Settings active.
- [ ] There is one real email/password implementation.
- [ ] No enabled Save/Delete/password action lacks behavior.
- [ ] Auth loading and email hydration tests pass without dirty-field overwrite.
- [ ] OTP, password and reauthentication regressions pass.
- [ ] Full lint, typecheck, unit, build and smoke pass.
- [ ] Only in-scope files changed; `git diff --check` passes.

## STOP conditions

- Main now exposes backend APIs for a formerly mock control; re-plan the real contract instead of hiding it.
- Product requires retaining an enabled unsupported control.
- Hydration requires overwriting a dirty field.
- Removing duplicate UI changes the real OTP/password contract.
- Drift or two repeated verification failures occur.

## Maintenance notes

- Sensitive settings must never be represented by local-only state.
- FE-008/FE-009/FE-010 should build on this canonical route and must not restore duplicate password logic.
- Reviewers should test both `hasPassword=true` and OAuth-only `hasPassword=false` accounts.
