# CloudComAI Calling Service — Architecture and migration notes

## Initial topology

The initial proof of concept can place Node.js REST/WebSocket signaling, mediasoup, coturn, and MySQL on one VM. Nginx terminates HTTPS/WSS and proxies signaling to 127.0.0.1:8081; WebRTC media and TURN relay traffic do not pass through Nginx. The current Oracle E2.1.Micro has 1 GB RAM and should be used only for limited API/unit tests; real media workloads will likely exhaust memory.

## Portability

- MySQL stores call metadata, participants, and audit events.
- The public API contract is under /api/v1; clients should not depend on physical VM identity.
- MEDIASOUP_ANNOUNCED_IP, media port ranges, TURN host, and DB endpoint are environment configuration.
- A later two-server design can place API/signaling and DB on Server A and mediasoup/coturn on Server B, but needs a media-node registry, authenticated internal control plane, shared call ownership, and client reconnect protocol.

## Direct and group calls

The API supports direct calls and group calls with up to 16 total participants. Group call invitees have independent ringing/accepted/rejected/left/missed states; the first acceptance starts media, the caller can end the entire group call, and individual participants can leave. Clients should call `GET /api/v1/calls/active` after reconnecting to restore active call UI state.

## Implemented foundation

Authenticated APIs cover call lifecycle, router RTP capabilities, WebRTC transport creation/DTLS connection, producer publishing, remote producer discovery, consumer creation/resume, and short-lived HMAC TURN REST credentials. Call state changes remain REST-authoritative; WebSocket is authenticated and delivers server events.

## Remaining limitations

Not production-ready. No CloudComAI auth-contract integration, push notifications, distributed call ownership, durable ringing timers, room recovery, client implementation, real coturn/media integration tests, multi-device policy, quotas/abuse protection, or load testing. TURN credentials and advertised media addresses must be validated against the actual coturn/network setup. Consumers must be signaled to clients when new producers appear; this starter only exposes producer discovery polling.

## Network intent

- TCP 443 HTTPS/WSS via Nginx
- UDP 40000–49999 mediasoup by default; open the configured range
- UDP/TCP 3478 TURN
- TCP 5349 optional TURN/TLS only after certificate configuration
- UDP 50000–50100 example TURN relay range
- TCP 22 restricted to administrator IPs
- MySQL 3306 private/local only

Compose maps the configured mediasoup range; do not expose MySQL publicly. Configure host/cloud firewalls as well as container port mappings.
