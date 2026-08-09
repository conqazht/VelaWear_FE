# Frontend Implementation Plans

> Generated from the **shadcn/improve skill v1.0.0** audit on 2026-07-16.
> These English files are the canonical execution context. Implementation is
> performed directly by Codex, **not** by `improve execute`. Vietnamese reader
> copies are under [`plans/vi/`](vi/), with a Vietnamese roadmap in
> [`plans/README.vi.md`](README.vi.md).

## Planning baseline

- Repository: `coqanklazy/VelaWear_FE`
- Planned at: commit `ff217af` on `main`
- Planning branch: `docs/shadcn-improve-plans`
- Delivery rule: merge this planning PR into `main` before creating any
  implementation branch.
- Status is maintained only in this file to prevent translation drift.
- Authorization rule: branch creation, commits, pushes, and PR creation require
  explicit operator authorization. Commit-message/order examples in plans are
  recommendations, never authorization. An operator may authorize an ordered
  workflow, but the executor must verify that instruction is still active before
  causing Git or GitHub writes.

Every executor must read the selected plan completely, run its drift check,
honor its STOP conditions, and use the exact branch named in the plan. After a
PR is merged, fetch and fast-forward `main` before starting the next plan. Do
not stack a dependent plan on an unmerged branch.

## Mandatory dependency-drift reconciliation

Later plans intentionally depend on earlier PRs and will often detect changes
from their original planned-at SHA. Before editing source, run the plan's drift
check against current `main`. If any in-scope path changed, compare every live
symbol/citation and then update the canonical English plan, its Vietnamese
mirror, exact scope/test names, and `Planned at` SHA to current `main` **before
coding**. Commit that reconciliation in the implementation PR before the source
change, or in a preceding docs-only commit. The two plan files are the sole
pre-implementation exception to a plan's source-file allowlist. In every
implementation PR, `docs/PROJECT_STATUS.md` is the single mandatory workflow-
metadata exception required by repository `AGENTS.md`; update only that plan's
actual branch, outcome, and verification evidence. `plans/README.md` status is
reviewer/operator-maintained after merge confirmation and must not be edited by
an executor merely to satisfy a Done checkbox. Never execute a stale plan or
treat dependency drift as automatically safe.

## Execution order and status

| ID | Plan | Branch | Priority | Effort | Depends on | Wave | Status |
|---|---|---|---:|---:|---|---:|---|
| FE-001 | [Migrate to self-scoped customer APIs](001-migrate-to-self-scoped-customer-apis.md) | `fix/self-scoped-customer-apis` | P1 | L | external BE-001 | 1 | DONE |
| FE-002 | [Preserve review multipart requests](002-preserve-review-multipart-requests.md) | `fix/review-multipart-transport` | P1 | M | FE-001 | 2 | DONE |
| FE-003 | [Isolate cart state by account and harden logout](003-isolate-cart-by-account-and-harden-logout.md) | `fix/cart-session-isolation` | P1 | L | FE-002 | 2 | DONE |
| FE-004 | [Consolidate account settings and hydration](004-consolidate-account-settings-and-hydration.md) | `fix/account-settings-integrity` | P1 | L | FE-001 | 2 | DONE |
| FE-005 | [Honor rate-limit Retry-After](005-honor-rate-limit-retry-after.md) | `fix/rate-limit-retry-after` | P2 | M | FE-003 and external BE-005 | 2 | DONE |
| FE-006 | [Scope shop providers to shop routes](006-scope-shop-providers-to-shop-routes.md) | `perf/shop-provider-scope` | P2 | M | FE-003 | 3 | DONE |
| FE-007 | [Consume wishlist product summaries](007-consume-wishlist-product-summaries.md) | `perf/wishlist-summary-client` | P2 | M | FE-006 and external BE-009 | 3 | DONE |
| FE-008 | [Load profile data on demand](008-load-profile-data-on-demand.md) | `perf/profile-demand-loading` | P2 | M | FE-001, FE-004 | 3 | DONE |
| FE-009 | [Characterize profile-page behavior](009-characterize-profile-page-behavior.md) | `test/profile-characterization` | P2 | M | FE-004, FE-008 | 4 | DONE |
| FE-010 | [Decompose the profile page](010-decompose-profile-page.md) | `refactor/profile-page` | P3 | L | FE-009 | 4 | DONE |
| FE-011 | [Split i18n message namespaces](011-split-i18n-message-namespaces.md) | `perf/i18n-message-splitting` | P3 | L | FE-001–FE-010 | 5 | DONE |
| FE-012 | [Clean frontend dependencies and documentation](012-clean-frontend-dependencies-and-docs.md) | `chore/frontend-maintenance-docs` | P3 | M | FE-001–FE-011 and external BE-015 | 5 | DONE |
| FE-013 | [Consolidate shared CSS animation tokens](013-consolidate-animation-tokens.md) | `feat/storefront-animations` | P2 | S | FE-012 | 6 | DONE |
| FE-014 | [Add spring pop feedback to product detail wishlist heart](014-product-detail-favorite-spring.md) | `feat/storefront-animations` | P3 | S | FE-013 | 6 | DONE |
| FE-015 | [Add sliding layout indicator to profile page tab navigation](015-profile-tab-layout-indicator.md) | `feat/storefront-animations` | P3 | S | FE-013 | 6 | DONE |
| FE-016 | [Add reduced motion fallback to editorial craft scroll gallery](016-editorial-craft-reduced-motion.md) | `feat/storefront-animations` | P2 | S | FE-013 | 6 | DONE |

Status values: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED (<reason>)`, or
`REJECTED (<reason>)`.

## Mandatory cross-repository sequence

The authorization migration must use an expand → migrate → revoke sequence:

1. Backend BE-001 adds ownership-bound `/me` routes while temporarily retaining
   the legacy user-ID routes.
2. FE-001 migrates all customer calls to the new contracts.
3. Backend BE-002 then removes `ROLE_USER` access to the legacy routes.

Changing this order can either break the frontend or leave an IDOR window.

## Merge waves

| Wave | Ordered work | Required checkpoint |
|---:|---|---|
| 0 | Backend planning PR, frontend planning PR | Both plans are merged; both mains are clean and synced |
| 1 | BE-001 → FE-001 → BE-002 | Backend verify, frontend CI suite, full-stack ownership smoke |
| 2 | FE-002 → BE-003 → FE-003 → BE-004 → BE-005 → FE-004 → FE-005 | Backend verify, frontend CI suite, full-stack security/correctness smoke |
| 3 | BE-006 → BE-007 → BE-008 → BE-009 → FE-006 → FE-007 → FE-008 | Full tests, full-stack smoke, query-count assertions |
| 4 | BE-010 → BE-011 → BE-012 → BE-013 → BE-014 → FE-009 → FE-010 | Full regression and full-stack smoke |
| 5 | FE-011 → BE-015 → FE-012 | Final backend verify, frontend CI suite, full-stack smoke |

The BE IDs refer to the canonical plans in the VelaWear backend repository.

## Standard branch preflight

Before every implementation PR:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git switch -c <branch-from-plan>
```

Expected: the worktree is clean, local `HEAD` equals `origin/main`, and the new
branch is created from that commit. If any condition is false, STOP; do not
stash, reset, overwrite, or improvise.

## Standard verification gates

Every frontend PR ends with all four commands:

```powershell
pnpm exec eslint . --max-warnings 25
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm test:unit
pnpm build
```

Expected: every command exits 0; tests pass; the production build succeeds.
Plan-specific tests must run before these final gates. At wave boundaries,
dispatch `.github/workflows/fullstack-e2e.yml` with both refs set to `main`.
If the last merge of a wave is a backend PR, dispatch it manually because a
backend push does not trigger the frontend workflow.

## Findings disposition

All accepted shadcn/improve frontend findings and the backend authorization
companion migration are represented. Related findings were deliberately
combined where they share one auth-state invariant, while provider optimization
and profile decomposition were split into independently verifiable phases. No
accepted finding was rejected.

The audit reported 12 frontend finding groups and execution also uses 12 plans.
The count stays at 12 after adding the authorization-migration companion because
cart/logout, settings/hydration, and maintenance findings are combined, while
provider/wishlist and profile characterization/decomposition are split into
separate verifiable phases.
