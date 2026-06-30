## Why

The current checkout UI presents card fields and then creates an order with a hardcoded cash-like payment method, while the backend payment phase will expose sandbox provider initiation and callback-driven status. The frontend needs a matching checkout experience that lets users choose COD, MoMo, VNPay, or bank-transfer/SePay without pretending to process cards locally.

## What Changes

- Replace the fake card payment section with provider selection for `COD`, `MOMO`, `VNPAY`, and bank transfer/SePay.
- Add typed payment initiation and status helpers that call backend payment APIs only.
- Redirect users to sandbox payment URLs for MoMo/VNPay responses.
- Render bank-transfer/SePay QR or reference details when the backend returns QR/payment reference data.
- Add payment pending/result UI that fetches backend order/payment status instead of trusting browser return query params.
- Keep provider API calls, signatures, webhook processing, and notification emails in the backend.

## Capabilities

### New Capabilities
- `sandbox-payment-checkout-ui`: Frontend checkout, redirect, QR, and payment status experience for backend sandbox payment gateways.

### Modified Capabilities

## Impact

- Affected UI: checkout page, order success/pending states, possible payment result route, and order detail/status surfaces.
- Affected data flow: checkout will create orders, initiate payment through backend, redirect/render QR, and refetch backend status.
- Affected client helpers: add typed order/payment request and response models for payment initiation/status.
- Affected verification: responsive checkout, provider-specific paths, redirect behavior, QR/pending state, polling/refetch, and fallback errors.
