## 1. Auth OTP API Client

- [ ] 1.1 Add TypeScript types for OTP purpose, request payload, verify payload, and backend responses
- [ ] 1.2 Add API helpers for OTP request and OTP verification using the existing `apiClient`
- [ ] 1.3 Add API helpers or auth-provider methods for OTP-protected register, forgot-password reset, and change-email actions
- [ ] 1.4 Normalize backend OTP validation, cooldown, expired, attempts-exhausted, and service errors into UI-friendly error states

## 2. Shared OTP UI

- [ ] 2.1 Build a reusable OTP entry component that matches the existing Vela Wear auth styling
- [ ] 2.2 Support code entry, paste, loading state, success state, error state, and disabled state
- [ ] 2.3 Add resend controls with cooldown display driven by backend responses and local countdown guidance
- [ ] 2.4 Add a small reusable OTP flow hook or helper for request, verify, resend, and reset state

## 3. Register Flow

- [ ] 3.1 Update the register page to validate form fields before requesting `REGISTER` OTP
- [ ] 3.2 Add an OTP verification step without navigating away from the register page
- [ ] 3.3 Block final registration until `REGISTER` OTP verification succeeds
- [ ] 3.4 Preserve existing post-register behavior and error handling after successful account creation
- [ ] 3.5 Verify responsive layout and text fit for the multi-step register flow

## 4. Forgot Password Flow

- [ ] 4.1 Add a forgot-password route/page linked from the sign-in experience
- [ ] 4.2 Add email entry and `FORGOT_PASSWORD` OTP request behavior
- [ ] 4.3 Add OTP verification followed by new-password entry and validation
- [ ] 4.4 Submit password reset only after OTP verification succeeds
- [ ] 4.5 Show completion state or redirect users back to sign-in after successful reset

## 5. Change Email Flow

- [ ] 5.1 Update profile settings email editing from static input to a saveable change-email flow
- [ ] 5.2 Request `CHANGE_EMAIL` OTP for the new email
- [ ] 5.3 Verify OTP inline in settings before saving email change
- [ ] 5.4 Refresh or update authenticated user profile after successful email change
- [ ] 5.5 Preserve unauthenticated settings guard behavior

## 6. Verification and Docs

- [ ] 6.1 Add focused tests or manual verification notes for happy path, wrong OTP, expired OTP, cooldown, and backend service error states
- [ ] 6.2 Verify register, forgot-password, and settings flows on mobile and desktop layouts
- [ ] 6.3 Run `pnpm lint`
- [ ] 6.4 Run `pnpm build` if route structure or app-level behavior changes
- [ ] 6.5 Update `docs/PROJECT_STATUS.md` with implementation summary, verification, and follow-ups
