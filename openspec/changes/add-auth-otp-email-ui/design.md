## Context

The frontend currently has a polished register page, sign-in flow, auth provider, and profile settings page. Registration submits directly to `/auth/register`, profile settings shows an editable email input without a real save flow, and there is no forgot-password route yet. The backend phase `add-auth-otp-email` will expose OTP request/verify behavior for `REGISTER`, `FORGOT_PASSWORD`, and `CHANGE_EMAIL`.

This change adds the client experience that consumes those backend APIs. The frontend must preserve the premium Vela Wear auth aesthetic while making OTP states clear and low-friction.

## Goals / Non-Goals

**Goals:**

- Add reusable OTP UI and state handling for request, code entry, resend cooldown, verification, expiration, and error display.
- Update registration to verify `REGISTER` OTP before final account creation.
- Add a forgot-password flow that verifies `FORGOT_PASSWORD` OTP before password reset.
- Update profile settings email change to verify `CHANGE_EMAIL` OTP for the new email before saving.
- Add typed API helpers that wrap the backend OTP endpoints and account-action endpoints.
- Keep backend as the source of truth for OTP delivery, verification, rate limits, and account updates.

**Non-Goals:**

- Do not send email from the frontend.
- Do not generate, store, or validate OTP codes locally beyond user input state.
- Do not implement payment UI in this change.
- Do not redesign the whole auth system or replace existing token refresh behavior.

## Decisions

### 1. Shared OTP component and hook

- **Decision:** Add a reusable OTP entry component plus a small state hook or helper for request/verify/resend flows.
- **Rationale:** Register, forgot password, and change email need the same interaction pattern with different purposes and completion actions.
- **Alternatives considered:**
  - Copy OTP UI into each screen: quicker initially, but likely to drift across auth flows.
  - Put all OTP state in `AuthProvider`: convenient globally, but mixes temporary form state into session/auth identity state.

### 2. Purpose-specific flows

- **Decision:** Each flow passes a backend purpose: `REGISTER`, `FORGOT_PASSWORD`, or `CHANGE_EMAIL`.
- **Rationale:** The backend scopes OTPs by purpose. The frontend should mirror that contract instead of using one generic "email verification" action.

### 3. Registration remains a guided single-screen journey

- **Decision:** Keep the register page as the main surface, but add an OTP step after validating account fields and before final registration.
- **Rationale:** This avoids routing users away from an already detailed membership form and preserves the current editorial auth layout.

### 4. Forgot password gets its own route

- **Decision:** Add a dedicated forgot-password page with email entry, OTP verification, and new-password entry.
- **Rationale:** Password recovery is a separate mental model from sign-in and should be linkable from the sign-in page.

### 5. Change email stays inside settings

- **Decision:** Keep change-email inside profile settings and use inline OTP verification for the new email.
- **Rationale:** Users should not leave account settings to complete a simple email change.

### 6. Error and cooldown behavior follows backend

- **Decision:** Display backend validation, cooldown, expired, and attempts-exhausted responses without trying to outguess them locally.
- **Rationale:** Rate limits and OTP validity are backend-owned. Frontend cooldown timers are only UX affordances.

## Risks / Trade-offs

- **[Risk] Multi-step registration loses form data on refresh.** Mitigation: keep all form state in the register page and avoid route changes during OTP verification.
- **[Risk] Frontend cooldown can drift from backend truth.** Mitigation: use backend responses as authoritative and treat local timers as guidance only.
- **[Risk] OTP UI disrupts premium auth aesthetic.** Mitigation: reuse existing field/button styling, compact copy, and clear status messaging.
- **[Risk] Change-email could leave profile stale.** Mitigation: refetch `/auth/me` or update auth context after successful email change.
- **[Risk] Backend contract shifts during phase 1 implementation.** Mitigation: keep API helpers typed and centralized so endpoint/payload changes are localized.

## Migration Plan

1. Add typed auth OTP API helpers and response types.
2. Add reusable OTP input/status/resend UI.
3. Update register page to request and verify `REGISTER` OTP before final registration.
4. Add forgot-password route and flow for `FORGOT_PASSWORD`.
5. Update profile settings email change flow for `CHANGE_EMAIL`.
6. Add UI tests or focused manual verification for happy path, cooldown, wrong code, expired code, and responsive layouts.

Rollback is UI-local: the existing register/sign-in/session behavior can remain intact if OTP UI routes are disabled or hidden while backend contracts are finalized.

## Open Questions

- Should successful registration auto-sign in the user after OTP verification, or keep the current redirect to sign-in?
- Should forgot-password completion redirect to sign-in with a success message, or keep users on the same page?
- Should OTP code entry be six separate boxes or one styled input for accessibility and mobile paste support?
