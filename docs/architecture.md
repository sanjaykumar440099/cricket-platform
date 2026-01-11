# Architecture Overview

This document describes the high-level architecture for the Cricket Platform monorepo.

- Monorepo layout: `apps/`, `libs/`, `infra/`, `scripts/`, `docs/`.
- Backend: NestJS (TypeScript) in `apps/api`.
- Realtime: WebSockets (namespaced gateways under `modules/live/gateways`).
- Persistence: PostgreSQL (TypeORM/ORM config in `src/database/ormconfig.ts`).
- Caching and subscriptions: Redis.
- CI/CD: infra manifests and Dockerfiles live under `infra/` and `apps/*`.

## Components

- API: REST endpoints + WebSocket gateways.
- Scoring engine: deterministic domain-driven module (`modules/scoring/domain`).
- Live streaming: scalable gateways, events and `LiveService`.
- Billing/subscriptions: policies and guards in `modules/subscriptions`.

(Expand this file with diagrams and deployment notes.)
