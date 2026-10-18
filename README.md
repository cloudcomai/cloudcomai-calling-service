# CloudComAI Calling Service

Self-hosted voice/video calling microservice foundation built with Node.js, Express, WebSocket, mediasoup, coturn, and MySQL. No managed RTC provider is used.

## Status

Development foundation — not production-ready. This branch adds authenticated mediasoup transport/produce/consume signaling and short-lived HMAC TURN REST credentials. Client integration, database/runtime integration tests, real coturn/media tests, production hardening, and load testing remain necessary.

## Requirements

- Node.js 22.x
- MySQL 8.0+
- Build tools required by mediasoup if a prebuilt binary is unavailable
- coturn
- Public IP, DNS hostname, TLS termination, and correctly configured firewall rules for real WebRTC tests

## Local setup

1. Copy `.env.example` to `.env` and generate unique secrets. Never commit `.env`.
2. Configure a local MySQL database/user with least privilege.
3. Run `npm install`, `npm test`, `npm run db:migrate`, and `npm start`.
4. Configure coturn with the same TURN secret as `TURN_SECRET`.

The JWT middleware currently expects HS256, configured issuer/audience, and the configured user-id claim. Adapt it to CloudComAI's actual auth contract before integration.

## API outline

- `GET /health`, `GET /ready`
- `POST /api/v1/calls`, `GET /api/v1/calls/:callId`
- `POST /api/v1/calls/:callId/{accept,reject,cancel,end}`
- `GET /api/v1/call-history`
- `GET /api/v1/calls/:callId/ice-servers` — participant-scoped, short-lived TURN credentials
- `GET /api/v1/calls/:callId/rtp-capabilities`
- `POST /api/v1/calls/:callId/transports`
- `POST /api/v1/calls/:callId/transports/:transportId/connect`
- `POST /api/v1/calls/:callId/producers`, `GET /api/v1/calls/:callId/producers`
- `POST /api/v1/calls/:callId/consumers`
- `POST /api/v1/calls/:callId/consumers/:consumerId/resume`
- WebSocket `/ws` — first message: `{"type":"auth","token":"<JWT>"}`

## Deployment cautions

Compose is a template, not a production deployment. Review all ports, firewall rules, TLS certificates, secrets, resource limits, backups, and CORS origins. Do not expose MySQL publicly. The current Oracle E2.1.Micro (1 GB RAM) is suitable only for limited API/unit testing; real media workloads will likely exhaust its resources.

See `docs/architecture.md` for topology and migration notes.
