## Why

The backend OTP/email phase adds verification requirements for registration, forgot-password, and change-email flows. The frontend needs matching UI and API client behavior so users can request, enter, resend, and verify OTP codes without the browser owning any OTP or email delivery logic.

## What Changes

- Add reusable OTP UI patterns for code entry, resend cooldown, verification status, expiration, and error states.
- Update registration so users verify `REGISTER` OTP before account creation is finalized.
- Add forgot-password UI flow using `FORGOT_PASSWORD` OTP before password reset.
- Update profile settings email change flow to verify `CHANGE_EMAIL` OTP for the new email before saving.
- Add typed API client helpers for backend OTP endpoints and OTP-protected account actions.
- Keep email sending, OTP generation, rate limiting, and OTP verification authority in the backend.

## Capabilities

### New Capabilities

- `auth-otp-email-ui`: Frontend OTP user experience and API consumption for register, forgot-password, and change-email flows.

### Modified Capabilities

## Impact

- Affected UI: register page, forgot-password route/page, profile settings email field, auth form components, and shared feedback states.
- Affected client data flow: `AuthProvider` or auth API helpers will call OTP request/verify endpoints and consume backend responses.
- Affected navigation: register and forgot-password flows become multi-step, while change-email remains inside authenticated settings.
- Affected tests/verification: OTP form validation, cooldown behavior, API error display, route transitions, and responsive UI states.
