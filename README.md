# CloudComAI Calling Service

Self-hosted voice/video calling microservice foundation built with Node.js, Express, WebSocket, mediasoup, coturn, and MySQL. No managed RTC provider is used.

## Current scope

- Direct and group audio/video call metadata and lifecycle (up to 16 total participants).
- JWT-protected REST APIs and authenticated WebSocket event delivery.
- mediasoup WebRTC transport, producer, consumer, and remote producer discovery endpoints.
- Short-lived HMAC-SHA1 TURN REST credentials compatible with coturn `use-auth-secret`.
- MySQL schema, migration runner, Docker Compose and coturn examples.
- Node.js CI workflow for syntax checks and unit tests.

## Status

Development/POC foundation, **not production-ready**. It still needs integration with the actual CloudComAI authentication and user/contact APIs, client implementation, push notifications, multi-node call ownership, end-to-end mediasoup/coturn tests, abuse controls, and load testing. The current Oracle E2.1.Micro (1 GB RAM) is suitable only for limited API/unit testing; real media workloads will likely exhaust its resources.

## Local setup

1. Copy `.env.example` to `.env` and generate unique secrets. Never commit `.env`.
2. Configure a least-privilege MySQL database/user.
3. Run `npm install`, `npm test`, `npm run db:migrate`, and `npm start`.
4. Replace `REPLACE_WITH_TURN_SECRET` in `deploy/coturn/turnserver.conf` with the same value as `TURN_SECRET`; configure the real realm, public IP, and certificates before exposing TURN. Set `TURN_TLS_ENABLED=true` only after enabling the coturn TLS listener and mapping its certificate paths.
5. Set `MEDIASOUP_ANNOUNCED_IP` to the reachable public IP and open the configured media/TURN ranges.

The JWT middleware currently expects HS256, configured issuer/audience, and the configured user ID claim. Adapt it to CloudComAI's actual auth contract before integration.

See `docs/api.md` for request contracts and `docs/architecture.md` for topology, ports, and migration notes.
