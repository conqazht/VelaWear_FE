## 1. Auth OTP API Client

- [x] 1.1 Add TypeScript types for OTP purpose, request payload, verify payload, and backend responses
- [x] 1.2 Add API helpers for OTP request and OTP verification using the existing `apiClient`
- [x] 1.3 Add API helpers or auth-provider methods for OTP-protected register, forgot-password reset, and change-email actions
- [x] 1.4 Normalize backend OTP validation, cooldown, expired, attempts-exhausted, and service errors into UI-friendly error states

## 2. Shared OTP UI

- [x] 2.1 Build a reusable OTP entry component that matches the existing Vela Wear auth styling
- [x] 2.2 Support code entry, paste, loading state, success state, error state, and disabled state
- [x] 2.3 Add resend controls with cooldown display driven by backend responses and local countdown guidance
- [x] 2.4 Add a small reusable OTP flow hook or helper for request, verify, resend, and reset state

## 3. Register Flow

- [x] 3.1 Update the register page to validate form fields before requesting `REGISTER` OTP
- [x] 3.2 Add an OTP verification step without navigating away from the register page
- [x] 3.3 Block final registration until `REGISTER` OTP verification succeeds
- [x] 3.4 Preserve existing post-register behavior and error handling after successful account creation
- [x] 3.5 Verify responsive layout and text fit for the multi-step register flow

## 4. Forgot Password Flow

- [x] 4.1 Add a forgot-password route/page linked from the sign-in experience
- [x] 4.2 Add email entry and `FORGOT_PASSWORD` OTP request behavior
- [x] 4.3 Add OTP verification followed by new-password entry and validation
- [x] 4.4 Submit password reset only after OTP verification succeeds
- [x] 4.5 Show completion state or redirect users back to sign-in after successful reset

## 5. Change Email Flow

- [x] 5.1 Update profile settings email editing from static input to a saveable change-email flow
- [x] 5.2 Request `CHANGE_EMAIL` OTP for the new email
- [x] 5.3 Verify OTP inline in settings before saving email change
- [x] 5.4 Refresh or update authenticated user profile after successful email change
- [x] 5.5 Preserve unauthenticated settings guard behavior

## 6. Verification and Docs

- [x] 6.1 Add focused tests or manual verification notes for happy path, wrong OTP, expired OTP, cooldown, and backend service error states
- [x] 6.2 Verify register, forgot-password, and settings flows on mobile and desktop layouts
- [x] 6.3 Run `pnpm lint`
- [x] 6.4 Run `pnpm build` if route structure or app-level behavior changes
- [x] 6.5 Update `docs/PROJECT_STATUS.md` with implementation summary, verification, and follow-ups
