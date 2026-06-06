# WebSocket Events

The API exposes a Socket.IO match feed on the default namespace.

## Connecting

Clients connect with query parameters:

```text
socketUrl?matchId=<matchId>&lastEventId=<optionalLastEventId>
```

The frontend may also pass JWT auth in `handshake.auth.token`, but live feed
subscription is read-only.

## Server Events

- `resumeState`: full latest match state for fresh clients or replay gaps.
- `resume`: compatibility envelope `{ state, lastEventId }`.
- `scoreUpdate`: live event emitted after a ball is persisted.
- `score.updated`: alias for integrations that prefer dotted event names.
- `spectatorCount`: current connected socket count for the match room.

## `scoreUpdate` Payload

```json
{
  "eventId": 12,
  "matchId": "match-uuid",
  "timestamp": 1760000000000,
  "score": {
    "runs": 84,
    "wickets": 3,
    "overs": "9.4",
    "runRate": 8.69
  },
  "state": {},
  "lastBall": {},
  "commentary": {},
  "payload": {
    "score": {},
    "state": {},
    "lastBall": {},
    "commentary": {}
  }
}
```

The duplicated top-level fields keep the Ionic client simple while preserving
the replay-friendly `payload` envelope.

## Replay

The backend stores the last 50 live events in Redis. If a client reconnects
with `lastEventId`, the gateway replays contiguous missed events. If there is a
gap, it sends `resumeState` instead.
