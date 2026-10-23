# Calling Service API

All endpoints under `/api/v1` require `Authorization: Bearer <CloudComAI access JWT>`. JWTs must use HS256 and match configured issuer, audience, and user ID claim. Align these values with the real CloudComAI auth service before integration. JSON error shape: `{ "error": { "code": "...", "message": "...", "requestId": "..." } }`.

## Create calls

Direct: `POST /api/v1/calls` with `{"calleeUserId":"user-2","callType":"audio"}`.

Group: `POST /api/v1/calls` with `{"participantUserIds":["user-2","user-3"],"callType":"video"}`. IDs are recipient IDs (do not include the caller), unique, max 15 invitees / 16 total participants. `callType` is `audio` or `video`.

## Lifecycle

- `GET /api/v1/calls/:callId` participant-only call state and participant status.
- `POST /api/v1/calls/:callId/accept`, `reject`, `cancel`, `end`, `connected`.
- In group calls, accept/reject is per invitee, end by the caller ends the whole call, end by a joined invitee means leave; the call moves to connecting when the first invitee accepts.
- `GET /api/v1/call-history?limit=20&before=<ISO timestamp>`.

## WebRTC

1. `GET /api/v1/calls/:callId/rtp-capabilities`
2. `POST /api/v1/calls/:callId/transports` body `{"direction":"send"}` or `{"direction":"receive"}`. The direction is descriptive; each client may create both transports.
3. `POST /api/v1/calls/:callId/transports/:transportId/connect` body `{"dtlsParameters":{...}}`
4. `POST /api/v1/calls/:callId/producers` body `{"transportId":"...","kind":"audio","rtpParameters":{...}}`
5. `GET /api/v1/calls/:callId/producers` to discover remote producers.
6. `POST /api/v1/calls/:callId/consumers` body `{"transportId":"...","producerId":"...","rtpCapabilities":{...}}`
7. `POST /api/v1/calls/:callId/consumers/:consumerId/resume` after the client has installed the consumer.

Clients must poll producer discovery or implement their own notification loop when another participant publishes new media. REST API is authoritative for call state.

## TURN

`GET /api/v1/calls/:callId/ice-servers` returns short-lived coturn REST credentials. Responses use `Cache-Control: no-store`. Do not log credentials or store them long-term.

## WebSocket

Connect to `wss://<host>/ws`, then send `{"type":"auth","token":"<JWT>"}`. Server emits `connection.ready` and call event messages. Call actions are performed over REST; unsupported WebSocket commands receive an error event.
