# WebSocket Events

This document lists WebSocket namespaces and event contracts.

## Namespaces
- `/match` — match-specific realtime updates (score, commentary, substitutions).

## Events (examples)
- `score.updated` — payload: `{ matchId, innings, runs, wickets, timestamp }`
- `commentary.new` — payload: `{ matchId, text, over, ball, timestamp }`
- `connection.ping` / `connection.pong`

## Versioning & Compatibility
- Include `version` on event envelopes when evolving contracts.
- Keep backward-compatible fields where possible.

(Expand with full event schemas and example messages.)
