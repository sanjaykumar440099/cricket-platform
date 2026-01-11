# Monetization

This document outlines monetization strategies and billing flows.

- Subscription tiers: free, basic (streaming limited), premium (full access).
- Payment providers: integrations defined in `src/config/payment.config.ts`.
- Entitlements: policies in `modules/subscriptions/policies` guard access to features (streaming, exports, match creation).
- Metrics: track active subscribers, churn, and revenue per match.

(Include billing flow diagrams and webhook handling notes.)
