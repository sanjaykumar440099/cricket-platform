# Monetization

The platform currently supports self-serve monthly subscription records through
the API subscription module.

## Plans

- Free: 3 matches/month, 1 tournament/month, basic live scoring.
- Basic: 25 matches/month, 5 tournaments/month, exports, AI summaries, public widgets.
- Premium: unlimited matches, 25 tournaments/month, advanced AI commentary.
- Enterprise: unlimited matches and tournaments, white-label live centre, priority support.

## Billing Flow

- `GET /api/subscriptions/plans` returns the public monthly catalog.
- `GET /api/subscriptions/me` returns the authenticated user's subscription.
- `GET /api/subscriptions/me/entitlements` returns feature gates for the user.
- `POST /api/subscriptions/checkout/monthly` activates a monthly plan in the local billing model.
- `POST /api/subscriptions/cancel` cancels immediately for free plans or marks paid plans to cancel at period end.

The current provider implementation is still mock/manual:

- Free uses `self-serve`.
- Basic and Premium use `mock-billing`.
- Enterprise uses `manual-enterprise-monthly`.

## Production Gaps

- Replace mock billing with a real provider such as Stripe, Razorpay, or Cashfree.
- Add provider checkout sessions, hosted invoices, tax/GST fields, and webhooks.
- Add organization/tenant ownership so subscriptions gate an entire club or tournament operator account.
- Add payment audit logs, invoice history, failed-payment retry flows, and admin overrides.
