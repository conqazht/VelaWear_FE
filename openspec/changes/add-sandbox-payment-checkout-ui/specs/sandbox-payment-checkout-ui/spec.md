## ADDED Requirements

### Requirement: Payment Method Selection
The frontend MUST let authenticated checkout users choose a backend-supported payment method instead of entering fake card details.

#### Scenario: Show supported methods
- **WHEN** an authenticated user views checkout payment details
- **THEN** the frontend shows selectable options for `COD`, `MOMO`, `VNPAY`, and bank transfer/SePay

#### Scenario: Replace card inputs
- **WHEN** the sandbox payment checkout UI is active
- **THEN** the frontend MUST NOT require card number, expiry, CVC, or cardholder fields to submit checkout

#### Scenario: Require payment method
- **WHEN** a user attempts to complete checkout without selecting a payment method
- **THEN** the frontend blocks submission and shows a validation state

### Requirement: Backend Payment Initiation
The frontend MUST create an order and initiate payment through backend APIs for the selected method.

#### Scenario: Create order before initiation
- **WHEN** a user submits checkout with valid contact, shipping, cart, and payment method data
- **THEN** the frontend creates the order through the backend order API before requesting payment initiation

#### Scenario: Initiate selected provider
- **WHEN** order creation succeeds
- **THEN** the frontend calls the backend payment initiation API with the created order and selected provider

#### Scenario: Initiation failure
- **WHEN** payment initiation fails
- **THEN** the frontend shows a recoverable error state and MUST NOT claim the order is paid

### Requirement: Redirect Payment Handling
The frontend MUST handle redirect-based sandbox providers by navigating only to backend-provided payment URLs.

#### Scenario: Redirect to MoMo or VNPay
- **WHEN** backend payment initiation returns a `redirectUrl`
- **THEN** the frontend navigates the browser to that URL

#### Scenario: Return from provider
- **WHEN** the user returns from a provider redirect
- **THEN** the frontend fetches backend order or payment status before showing a final result

### Requirement: QR or Bank Transfer Payment Handling
The frontend MUST render backend-provided QR or bank-transfer reference data for SePay-style pending payments.

#### Scenario: Show QR payment state
- **WHEN** backend payment initiation returns QR or bank-transfer reference data
- **THEN** the frontend shows the QR/reference, amount, order code, and pending payment guidance

#### Scenario: Refresh pending bank-transfer status
- **WHEN** a user is on a QR or bank-transfer pending state
- **THEN** the frontend can poll or manually refetch backend status without calling the provider directly

### Requirement: COD Checkout Handling
The frontend MUST handle COD as an order placed state without external redirect or QR.

#### Scenario: COD order placed
- **WHEN** backend payment initiation succeeds for `COD`
- **THEN** the frontend shows an order placed state with payment status indicating COD/awaiting collection or unpaid according to backend status

### Requirement: Backend Status Authority
The frontend MUST treat backend order/payment status as authoritative for payment results.

#### Scenario: Paid status from backend
- **WHEN** backend status reports the order/payment as paid or successful
- **THEN** the frontend shows payment success and clears the cart if not already cleared

#### Scenario: Failed status from backend
- **WHEN** backend status reports the payment as failed or cancelled
- **THEN** the frontend shows a failed payment state with recovery guidance

#### Scenario: Query params are not authoritative
- **WHEN** a payment return URL contains success-like query params
- **THEN** the frontend MUST NOT show final success until backend status confirms it

### Requirement: Payment Status Surfaces
The frontend MUST expose payment status in checkout result and order detail surfaces.

#### Scenario: Checkout result surface
- **WHEN** checkout reaches pending, paid, failed, or COD placed state
- **THEN** the frontend shows the order code, selected payment method, backend payment status, and a path to order details

#### Scenario: Order detail payment display
- **WHEN** a user views an order detail page
- **THEN** the frontend shows human-readable payment method and payment status from backend order data

### Requirement: Frontend Provider Boundary
The frontend MUST NOT call payment provider APIs or email notification APIs directly.

#### Scenario: Provider calls stay backend-owned
- **WHEN** checkout initiates MoMo, VNPay, or SePay-style payment
- **THEN** the frontend calls only the backend API and consumes backend-returned redirect or QR/reference data

#### Scenario: Email notifications stay backend-owned
- **WHEN** order or payment state changes
- **THEN** the frontend MUST NOT send order, payment, or delivery emails itself
