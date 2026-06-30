## 1. Payment API Client

- [ ] 1.1 Add TypeScript types for payment provider, initiation request, initiation response, order payment status, and payment status results
- [ ] 1.2 Add order creation helper or typed wrapper around the existing order API call
- [ ] 1.3 Add payment initiation helper using the existing `apiClient`
- [ ] 1.4 Add order/payment status fetch helper for result and pending screens
- [ ] 1.5 Normalize backend payment errors into checkout-friendly error states

## 2. Checkout Payment UI

- [ ] 2.1 Replace fake card fields with a payment method selector for COD, MoMo, VNPay, and bank transfer/SePay
- [ ] 2.2 Preserve the existing premium checkout layout, spacing, typography, and responsive behavior
- [ ] 2.3 Require a selected payment method before checkout submit
- [ ] 2.4 Remove card-number, expiry, CVC, and cardholder validation from checkout submit
- [ ] 2.5 Add clear loading, disabled, and recoverable error states during order creation and payment initiation

## 3. Checkout Submit Flow

- [ ] 3.1 Create the order through the backend order API using selected payment method data
- [ ] 3.2 Initiate payment through the backend payment API after order creation succeeds
- [ ] 3.3 For COD responses, show order placed status without external redirect
- [ ] 3.4 For redirect responses, persist enough order/payment context and navigate to the backend-provided redirect URL
- [ ] 3.5 For QR/bank-transfer responses, show a pending payment screen with backend-provided reference data
- [ ] 3.6 Clear the cart only after order creation succeeds and the resulting state is safe to show to the user

## 4. Payment Status and Result Surfaces

- [ ] 4.1 Add a payment pending/result route or reusable result component for paid, pending, failed, cancelled, and COD placed states
- [ ] 4.2 Fetch backend order/payment status after provider return instead of trusting return URL query params
- [ ] 4.3 Add bounded polling or manual refresh for pending QR/bank-transfer status
- [ ] 4.4 Provide recovery actions for failed payment, such as returning to checkout or viewing order details
- [ ] 4.5 Update order detail payment display labels for method and status readability

## 5. Verification and Docs

- [ ] 5.1 Verify checkout on mobile and desktop for COD, redirect provider, QR provider, pending, paid, and failed states
- [ ] 5.2 Verify no frontend code calls MoMo, VNPay, SePay, bank, or email provider APIs directly
- [ ] 5.3 Run `pnpm lint`
- [ ] 5.4 Run `pnpm build` because route/status UI changes affect app structure
- [ ] 5.5 Update `docs/PROJECT_STATUS.md` with implementation summary, verification, and known follow-ups
