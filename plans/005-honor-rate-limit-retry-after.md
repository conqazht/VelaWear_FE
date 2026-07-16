# Plan FE-005: Honor server rate-limit Retry-After values

> **shadcn/improve provenance**: Generated from the **shadcn/improve skill v1.0.0** audit. This English file is canonical. Codex implements it directly; do **not** invoke `improve execute`. Vietnamese copy: `plans/vi/005-honor-rate-limit-retry-after.vi.md`.
>
> **Executor instructions**: Centralize parsing, preserve the one-retry query policy and zero-retry mutation policy, and use deterministic time in tests. Start only after BE-005 from repository `coqanklazy/VelaWear_BE`, plan `plans/005-stabilize-api-error-contract.md`, branch `fix/api-error-contract`, is merged. STOP if that merged contract differs.
>
> **Drift check (run first)**: `git diff --stat ff217af..HEAD -- lib/api/errors.ts lib/api/errors.test.ts components/providers/query-provider.tsx components/providers/query-provider.test.tsx lib/auth-otp-api.ts lib/auth-otp-api.test.ts`

## Status

- **Priority**: P2
- **Effort**: M
- **Wave**: 2
- **Risk**: LOW — delay behavior is shared but bounded by existing retry counts.
- **Depends on**: FE-003 and `coqanklazy/VelaWear_BE` BE-005 (`plans/005-stabilize-api-error-contract.md`, branch `fix/api-error-contract`)
- **Category**: bug
- **Planned at**: commit `ff217af`, 2026-07-16

## Why this matters

Queries classify HTTP 429 as retryable but use React Query's default delay instead of the server's `Retry-After`/`retryAfterSeconds`. An early retry consumes quota and predictably fails again. OTP already parses the contract correctly; the generic query path should reuse one parser rather than diverge.

## Current state

- `lib/api/errors.ts:50-78` returns `retryable: true` for 429 and limits retry to `failureCount < 1`, but exposes no delay.
- `components/providers/query-provider.tsx:13-18` sets `retry` but no `retryDelay`.
- `lib/auth-otp-api.ts:128-154` parses positive seconds, HTTP-date, AxiosHeaders `.get`, body values and header casing in OTP-only private functions.
- `lib/auth-otp-api.ts:157-174,241-245` falls back to substring matching on raw response messages (`rate`, `retry`, `expired`, `invalid`, and similar). BE-005 makes messages display-only, so this machine classification must be removed.
- `lib/auth-otp-api.test.ts:128-149` asserts body precedence and header parsing.
- `docs/STOREFRONT_CATALOG_UX_FRONTEND_VI.md:405-417` records one retry for 408/429/5xx and none for mutations/deterministic 4xx.

After BE-005 merges, freeze this code/status matrix in tests; response messages are never machine identifiers:

| HTTP status | Stable code(s) | Frontend machine behavior |
|---|---|---|
| 400 | `REQUEST_BODY_INVALID`, `INVALID_REQUEST`, plus established OTP validation codes | no automatic retry; OTP kind comes only from its known code |
| 401 | `AUTHENTICATION_REQUIRED`, `SESSION_REVOKED` | no automatic retry; preserve the existing authentication/session-revoked handling |
| 403 | `ACCESS_DENIED` | no automatic retry |
| 405 | `METHOD_NOT_ALLOWED` | no automatic retry |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | no automatic retry |
| 429 | `OTP_RATE_LIMITED`, `AUTH_RATE_LIMITED`, or another documented finite rate-limit code | parse `data.retryAfterSeconds` first, then `Retry-After`; a known code may select OTP copy, but status controls retry eligibility |
| 500 | `INTERNAL_SERVER_ERROR` | query may use the existing single fallback retry; mutations remain zero-retry |

Established `OTP_INVALID_OR_EXPIRED`, `OTP_ATTEMPTS_EXHAUSTED`, `OTP_PROOF_INVALID_OR_EXPIRED`, `OTP_SERVICE_UNAVAILABLE`, and `OTP_DELIVERY_UNAVAILABLE` mappings remain code-based. If a code is absent or unknown, derive only a generic behavior from HTTP/network status; never inspect message substrings.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Target tests | `pnpm exec vitest run lib/api/errors.test.ts lib/auth-otp-api.test.ts components/providers/query-provider.test.tsx` | all pass |
| Lint | `pnpm exec eslint . --max-warnings 25` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit --pretty false --incremental false` | exit 0 |
| Unit | `pnpm test:unit` | all tests pass |
| Build | `pnpm build` | production build succeeds |

## Scope

> **Workflow-metadata exception**: In addition to the source allowlist below, update `docs/PROJECT_STATUS.md` with this plan ID, branch, actual outcome, and exact verification evidence. Canonical EN/VI plan files may be reconciled before source edits under `plans/README.md`; the reviewer/operator owns index status. No other out-of-scope file is allowed.

**In scope**:
- `lib/api/errors.ts`
- `lib/api/errors.test.ts`
- `components/providers/query-provider.tsx`
- `components/providers/query-provider.test.tsx` (create)
- `lib/auth-otp-api.ts`
- `lib/auth-otp-api.test.ts`

**Out of scope**:
- Increasing retry counts or enabling mutation retries.
- Changing backend thresholds/error codes.
- UI countdowns outside existing OTP flow.
- Persisting rate-limit state or adding CAPTCHA/edge tooling.

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
  git switch -c fix/rate-limit-retry-after
  ```
- The worktree must be clean and both SHAs must match before branch creation.
- STOP on dirty/diverged main or existing branch.
- Suggested commit: `fix: honor rate limit retry delays`.

## Steps

### Step 1: Encode the generic delay contract in tests

Add deterministic cases for the exact BE-005 matrix, body `data.retryAfterSeconds`, numeric header, HTTP-date, AxiosHeaders `.get`, malformed/past/negative values, non-429 fallback, and the five-minute automatic-retry ceiling. Freeze units explicitly: `extractRetryAfterSeconds(error, nowMs)` returns positive integer **seconds** for OTP/UI; `getQueryRetryDelayMs(attemptIndex, error, nowMs)` returns **milliseconds** for TanStack Query; and `shouldRetryApiError(failureCount, error, nowMs)` rejects a 429 whose valid delay exceeds 300 seconds. Test `300 seconds → 300_000 ms` and retry allowed, `301 seconds → 301_000 ms` from the adapter but retry disallowed, deterministic HTTP-date rounding, and unchanged OTP seconds. Add adversarial cases proving a 400 message containing “rate limit” is not rate-limited, an unknown-code message containing “expired OTP” is not classified as an OTP expiry, and every known code works even with unrelated display text.

**Verify**: `pnpm exec vitest run lib/api/errors.test.ts` → new cases fail before implementation for the missing helper.

### Step 2: Extract one shared Retry-After parser

Move the proven OTP delay logic into `lib/api/errors.ts` (or a narrowly named sibling only if import cycles require it) with the exact pure API `extractRetryAfterSeconds(error, nowMs = Date.now()): number | undefined`. Body `data.retryAfterSeconds` has precedence over headers, and HTTP-date is converted to positive ceiling seconds. OTP continues to consume this seconds value unchanged. Add `getQueryRetryDelayMs(attemptIndex, error, nowMs = Date.now()): number`, which calls the parser and multiplies a valid server value by `1_000` exactly once; only missing/invalid delay and non-429 retryable failures use the bounded exponential millisecond fallback. Replace `getFallbackErrorKind(message)` with finite code lookup plus HTTP/network-status fallback; message text may be displayed only as safe copy and must never select behavior.

**Verify**: `pnpm exec vitest run lib/api/errors.test.ts lib/auth-otp-api.test.ts` → all parser/unit/code-matrix cases pass, with no duplicate delay parser or message-substring classifier in `auth-otp-api.ts`.

### Step 3: Wire React Query retryDelay without changing retry eligibility

Set `queries.retryDelay` to `getQueryRetryDelayMs`. Update `shouldRetryApiError(failureCount, error, nowMs = Date.now())` so a 429 with a valid delay greater than `300` seconds is ineligible for automatic retry; at or below `300` seconds remains eligible under the existing one-retry limit. Keep `mutations.retry: 0`, stale/gc times and focus behavior unchanged. The delay adapter may return the full `301_000` ms value for deterministic testing, but the eligibility function must prevent scheduling it.

**Verify**: `pnpm exec vitest run lib/api/errors.test.ts components/providers/query-provider.test.tsx` → 429 at or below five minutes uses the exact millisecond delay, longer valid delay is ineligible, 5xx/network uses fallback, and deterministic 4xx/cancel never retries.

### Step 4: Run shared error-handling regression

Run the full CI-equivalent suite. Confirm OTP cooldown outputs remain byte-for-byte compatible with existing tests.

**Verify**: run `pnpm exec eslint . --max-warnings 25`, `pnpm exec tsc --noEmit --pretty false --incremental false`, `pnpm test:unit`, and `pnpm build` separately → each exits 0.

## Test plan

- Header seconds and HTTP-date with deterministic clock.
- Body-over-header precedence.
- AxiosHeaders and plain-object headers.
- Malformed, zero, negative and past values; exact boundary cases at `300`/`301` seconds and `300_000`/`301_000` milliseconds.
- At most one retry for 408/429/5xx/network; no automatic retry for a valid 429 delay over five minutes or for cancel/400/401/403/404/mutations.
- Existing OTP normalization tests remain unchanged except imports.
- Code/status matrix tests prove display-message changes cannot alter retry, authentication, session-revoked, or OTP behavior.

## Done criteria

- [ ] One shared parser serves OTP and generic queries.
- [ ] Seconds and milliseconds are explicit: OTP remains in seconds and TanStack receives exactly seconds × 1,000 once.
- [ ] Every BE-005 framework/security status-code pair is tested; raw message text never controls behavior.
- [ ] 429 uses the exact server-provided delay up to five minutes and never retries earlier than a longer valid delay.
- [ ] Retry count and mutation policy are unchanged.
- [ ] All targeted and CI-equivalent gates pass.
- [ ] Only in-scope files changed; `git diff --check` passes.

## STOP conditions

- BE-005 uses milliseconds or a different response shape than documented.
- Any merged consumer still requires raw exception/message substring matching; coordinate that migration instead of retaining the fallback.
- An established product requirement needs automatic waits longer than five minutes; revise the policy explicitly instead of silently changing the ceiling.
- Extraction creates an import cycle.
- OTP precedence/output changes unexpectedly.
- Drift or repeated verification failure occurs.

## Maintenance notes

- Keep server delay parsing side-effect free and independently testable.
- Future rate-limited queries should inherit QueryProvider behavior; feature code should not add ad-hoc timers.
