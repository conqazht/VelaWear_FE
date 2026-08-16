# Plan FE-002: Preserve review multipart requests through Axios

> **shadcn/improve provenance**: Generated from the **shadcn/improve skill v1.0.0** audit. This English file is canonical. Codex implements it directly; do **not** invoke `improve execute`. Vietnamese copy: `plans/vi/002-preserve-review-multipart-requests.vi.md`.
>
> **Executor instructions**: Follow every step and gate. Do not manually construct a multipart boundary. STOP instead of improvising when the transport or backend contract differs.
>
> **Drift check (run first)**: `git diff --stat ff217af..HEAD -- lib/api-client.ts lib/api/commerce.ts lib/api/commerce-review.test.ts lib/api-client.test.ts`

## Status

- **Priority**: P1
- **Effort**: M
- **Wave**: 2
- **Risk**: LOW — request serialization is shared, so JSON and multipart both need regression tests.
- **Depends on**: FE-001
- **Category**: bug
- **Planned at**: commit `ff217af`, 2026-07-16

## Why this matters

The shared Axios instance forces JSON for every request. Axios can therefore transform `FormData` into JSON before the browser creates a multipart boundary, dropping binary review images or producing a request Spring cannot parse. The fix must restore content-type inference without breaking normal JSON APIs.

## Current state

- `lib/api-client.ts:34-40`, `apiClient`:
  ```ts
  headers: { "Content-Type": "application/json" },
  ```
- `lib/api/commerce.ts:247-266`, `createReview`, builds `FormData` with a JSON Blob named `review` and zero-to-five `images` parts.
- `lib/api/commerce-review.test.ts:3-7` mocks `apiClient.post`, so Axios transforms never execute.
- `docs/STOREFRONT_CATALOG_UX_FRONTEND_VI.md:388-396` requires the browser/Axios to generate the multipart boundary and forbids a manually forced content type.

## Commands you will need

| Purpose      | Command                                                                       | Expected on success       |
| ------------ | ----------------------------------------------------------------------------- | ------------------------- |
| Target tests | `pnpm exec vitest run lib/api/commerce-review.test.ts lib/api-client.test.ts` | all pass                  |
| Lint         | `pnpm exec eslint . --max-warnings 25`                                        | exit 0                    |
| Typecheck    | `pnpm exec tsc --noEmit --pretty false --incremental false`                   | exit 0                    |
| Unit         | `pnpm test:unit`                                                              | all tests pass            |
| Build        | `pnpm build`                                                                  | production build succeeds |

## Scope

> **Workflow-metadata exception**: In addition to the source allowlist below, update `docs/PROJECT_STATUS.md` with this plan ID, branch, actual outcome, and exact verification evidence. Canonical EN/VI plan files may be reconciled before source edits under `plans/README.md`; the reviewer/operator owns index status. No other out-of-scope file is allowed.

**In scope**:

- `lib/api-client.ts`
- `lib/api/commerce-review.test.ts`
- `lib/api-client.test.ts` if shared transport assertions fit there

**Out of scope**:

- Changing review part names, payload fields, validation or backend storage.
- Upload quotas or generic file upload.
- Adding a second Axios client only for reviews.
- Manually setting `multipart/form-data` or a boundary.

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
  git switch -c fix/review-multipart-transport
  ```
- The worktree must be clean and both SHAs must match before branch creation.
- If the branch exists or main is not clean/synced, STOP; do not stash/reset.
- Suggested commit: `fix: preserve multipart review uploads`.

## Steps

### Step 1: Add a transport-level failing regression test

Use a custom Axios adapter so transforms run before inspection. Assert that review data reaching the adapter is still `FormData`, contains `review` and `images`, and is not labeled `application/json`. Keep the existing safe-payload assertions. Add a JSON-object control case.

**Verify**: `pnpm exec vitest run lib/api/commerce-review.test.ts lib/api-client.test.ts` → the new FormData assertions fail against the old forced JSON header for the intended reason before Step 2.

### Step 2: Restore Axios content-type inference

Remove the global explicit JSON header from `axios.create`. Do not add endpoint-specific multipart headers. Axios must continue serializing plain objects as JSON.

**Verify**: `pnpm exec vitest run lib/api/commerce-review.test.ts lib/api-client.test.ts` → multipart and JSON cases pass.

### Step 3: Run shared-client regression gates

Run TypeScript, full unit tests and production build because every API request shares this instance.

**Verify**: run `pnpm exec eslint . --max-warnings 25`, `pnpm exec tsc --noEmit --pretty false --incremental false`, `pnpm test:unit`, and `pnpm build` separately → each exits 0.

## Test plan

- Multipart with one image; multipart with zero images.
- JSON review part trims comment and excludes `userId`/image URL.
- Adapter receives `FormData`, not a serialized string/object.
- Plain JSON request remains JSON.
- Model structure after `lib/api-client.test.ts`; do not mock the layer being tested.

## Done criteria

- [ ] No default `Content-Type` is forced in `apiClient`.
- [ ] Multipart survives Axios transforms and the browser owns the boundary.
- [ ] JSON regression test passes.
- [ ] Targeted tests and all CI-equivalent gates pass.
- [ ] Only in-scope files changed; `git diff --check` passes.

## STOP conditions

- Backend no longer expects `review` JSON Blob plus `images` parts.
- Axios behavior/version differs after drift.
- The proposed fix needs a hard-coded boundary or a second client.
- Shared JSON calls regress or verification fails twice.

## Maintenance notes

- Any future binary endpoint must use the same transport-level test pattern.
- Reviewers should verify the test executes Axios transforms; a mocked `.post` is insufficient.
