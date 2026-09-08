# auth-otp-email-ui Specification

## Purpose

TBD - created by archiving change add-auth-otp-email-ui. Update Purpose after archive.

## Requirements

### Requirement: OTP Request UI

The frontend MUST let users request an email OTP for `REGISTER`, `FORGOT_PASSWORD`, and `CHANGE_EMAIL` flows by calling the backend OTP request endpoint.

#### Scenario: Request register OTP

- **WHEN** a user submits valid registration fields and requests email verification
- **THEN** the frontend calls the backend OTP request endpoint with purpose `REGISTER` and shows the OTP entry step for the submitted email

#### Scenario: Request forgot-password OTP

- **WHEN** a user submits an email on the forgot-password page
- **THEN** the frontend calls the backend OTP request endpoint with purpose `FORGOT_PASSWORD` and shows the OTP entry step

#### Scenario: Request change-email OTP

- **WHEN** an authenticated user enters a new email in profile settings and requests verification
- **THEN** the frontend calls the backend OTP request endpoint with purpose `CHANGE_EMAIL` for the new email

### Requirement: OTP Entry and Verification UI

The frontend MUST provide a reusable OTP entry experience that verifies codes through the backend and reflects verification state to the user.

#### Scenario: Verify correct OTP

- **WHEN** a user enters the OTP and submits verification
- **THEN** the frontend calls the backend OTP verify endpoint with the active purpose, email, and code

#### Scenario: OTP verified

- **WHEN** the backend confirms OTP verification
- **THEN** the frontend marks the current step as verified and enables the next action for that flow

#### Scenario: OTP verification error

- **WHEN** the backend rejects the OTP as wrong, expired, purpose-mismatched, or attempts-exhausted
- **THEN** the frontend displays the error state without changing account data locally

### Requirement: OTP Resend and Cooldown UI

The frontend MUST expose resend behavior that respects backend cooldown and communicates waiting state clearly.

#### Scenario: Resend OTP

- **WHEN** a user requests a new OTP after cooldown
- **THEN** the frontend calls the backend OTP request endpoint again with the same purpose and email

#### Scenario: Cooldown active

- **WHEN** the backend reports cooldown or the local cooldown timer is active
- **THEN** the frontend disables resend and shows the remaining wait state

### Requirement: OTP-Protected Registration UI

The frontend MUST require successful `REGISTER` OTP verification before submitting the final registration action.

#### Scenario: Registration completes after OTP verification

- **WHEN** a user has verified `REGISTER` OTP and submits registration
- **THEN** the frontend calls the backend registration endpoint with the registration payload and handles success using the existing post-register navigation

#### Scenario: Registration blocked before OTP verification

- **WHEN** a user attempts to finalize registration without a verified `REGISTER` OTP
- **THEN** the frontend keeps the user in the OTP verification flow and MUST NOT call the final registration endpoint

### Requirement: Forgot Password UI

The frontend MUST provide a forgot-password flow that verifies `FORGOT_PASSWORD` OTP before submitting a new password.

#### Scenario: Reset password after OTP verification

- **WHEN** a user has verified `FORGOT_PASSWORD` OTP and submits a valid new password
- **THEN** the frontend calls the backend password reset endpoint and shows a completion state or redirects to sign-in

#### Scenario: Reset blocked before OTP verification

- **WHEN** a user attempts to reset password before OTP verification
- **THEN** the frontend MUST NOT call the password reset endpoint

### Requirement: Change Email UI

The frontend MUST support authenticated email change from profile settings using `CHANGE_EMAIL` OTP verification.

#### Scenario: Change email after OTP verification

- **WHEN** an authenticated user verifies `CHANGE_EMAIL` OTP for a new email and saves the change
- **THEN** the frontend calls the backend change-email endpoint and refreshes or updates the authenticated user profile

#### Scenario: Change email blocked before OTP verification

- **WHEN** an authenticated user edits email but has not verified `CHANGE_EMAIL` OTP for the new email
- **THEN** the frontend MUST NOT call the backend change-email endpoint

### Requirement: Backend-Owned OTP Authority

The frontend MUST treat the backend as the authority for OTP generation, delivery, verification, cooldown, attempts, and expiration.

#### Scenario: No frontend OTP generation

- **WHEN** an OTP flow starts
- **THEN** the frontend MUST NOT generate or validate OTP values locally

#### Scenario: Backend response drives state

- **WHEN** backend OTP APIs return success, validation error, rate limit, or service error responses
- **THEN** the frontend updates UI state based on those responses
