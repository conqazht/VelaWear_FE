## Context

The checkout page currently collects contact/shipping data plus fake card fields, then posts an order with a hardcoded cash-like payment method. The backend payment phase `add-sandbox-payments-notifications` will add payment initiation for COD, MoMo, VNPay, and SePay-style bank transfer, plus callback-driven status updates and email notifications.

The frontend should become a sandbox payment client: it lets users choose a method, creates the order, asks the backend to initiate payment, redirects or renders QR/reference information, then reads final state from backend order/payment status.

## Goals / Non-Goals

**Goals:**
- Replace fake card entry with payment method selection for `COD`, `MOMO`, `VNPAY`, and bank-transfer/SePay.
- Create a clear checkout flow for immediate COD, redirect-based sandbox payments, and QR/reference-based pending payments.
- Add typed API helpers for order creation, payment initiation, and order/payment status retrieval.
- Add payment pending/result UI that polls or refetches backend state after return/QR flows.
- Keep provider integrations, signatures, callbacks, webhook handling, and notification emails on the backend.
- Preserve the premium fashion checkout feel and responsive behavior.

**Non-Goals:**
- Do not call MoMo, VNPay, SePay, or bank APIs from the frontend.
- Do not process real money or store payment credentials in the browser.
- Do not trust return URL query params as final payment success.
- Do not implement provider webhook simulation UI unless backend exposes dev-only endpoints and the app is in a dev/demo mode.
- Do not redesign cart, product catalog, or order management outside checkout/status surfaces.

## Decisions

### 1. Provider selection replaces card fields
- **Decision:** Remove card-number/CVC/expiry UI and replace it with payment method choices.
- **Rationale:** The sandbox gateway flow is provider-based; card fields are misleading because no frontend card processor exists.
- **Options shown:** COD, MoMo, VNPay, and bank transfer/SePay.

### 2. Backend-owned payment initiation
- **Decision:** Checkout creates an order first, then calls backend payment initiation with `orderId` and selected provider.
- **Rationale:** The backend validates amount/order state and owns provider secrets. The frontend only consumes the returned result.
- **Alternatives considered:**
  - Frontend calls provider SDK/API directly: not suitable because secrets/signatures and state changes belong to backend.
  - Create order and payment in one frontend call: possible later, but current backend design already exposes order and payment modules separately.

### 3. Response-type-driven UI
- **Decision:** The frontend chooses the next UI action based on the initiation response shape:
  - `redirectUrl`: navigate browser to provider sandbox.
  - `qrContent` or bank transfer fields: render pending transfer screen.
  - COD/immediate response: show order placed state with unpaid/awaiting collection status.
- **Rationale:** This keeps provider-specific UI small and avoids hardcoding too much provider behavior into checkout.

### 4. Backend status is authoritative
- **Decision:** Payment result pages and return handlers refetch order/payment status from backend and never mark success from provider query params alone.
- **Rationale:** Browser return can happen before webhook/IPN and can be user-controlled.

### 5. Pending and result routes
- **Decision:** Add a payment status/result route that can display pending, paid, failed, cancelled, and fallback states for an order code or payment id.
- **Rationale:** Redirect and QR flows need a stable place to land, poll/refetch, and guide the user back to order details.

### 6. Order detail payment summary reuse
- **Decision:** Order details should continue showing `paymentMethod` and `paymentStatus`, with improved labels as needed after checkout changes.
- **Rationale:** The profile order detail page already fetches by order code and can be the durable customer-facing status surface.

## Risks / Trade-offs

- **[Risk] Backend contracts may change during payment implementation.** Mitigation: centralize payment API types/helpers so contract edits are localized.
- **[Risk] Redirect flow loses local cart/order context.** Mitigation: store order code/payment id in route params or query/state before redirect and fetch backend status after return.
- **[Risk] Polling can annoy users or overload backend.** Mitigation: use short bounded polling for pending states and provide manual refresh.
- **[Risk] QR transfer UX feels too utilitarian for premium storefront.** Mitigation: present QR/reference details inside the existing checkout aesthetic with concise status language.
- **[Risk] COD and online payment statuses confuse users.** Mitigation: use distinct labels such as "Awaiting collection", "Waiting for payment", "Paid", and "Payment failed" while preserving backend enum values in API types.

## Migration Plan

1. Add typed order/payment API models and helper functions.
2. Replace fake card fields with payment method selector in checkout.
3. Update checkout submit flow to create order, initiate payment, then route based on initiation response.
4. Add pending/QR/redirect status UI and payment result route.
5. Update order success and order detail surfaces to show payment method/status consistently.
6. Add focused responsive/manual verification for COD, redirect provider, QR provider, payment success, payment failure, and pending status.

Rollback is local to checkout UI: the existing checkout form can remain behind a feature branch until backend payment endpoints are ready.

## Open Questions

- Should checkout create the order before payment initiation, or wait for a backend combined endpoint if one is added later?
- Should payment status polling use payment id, order id, or order code as the primary client route identifier?
- Should dev/demo simulation controls be exposed in frontend only under a clear environment flag, or left to Bruno/backend testing only?
