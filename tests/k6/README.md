# k6 Stress Tests

These tests run through Docker with the official `grafana/k6` image. They exercise the backend protocol directly: REST room/join APIs plus SockJS-framed STOMP WebSockets.

## Local smoke test

Start the backend on port `8080`, then run:

```bash
pnpm k6:smoke
```

Inside Docker, the default base URL is `http://host.docker.internal:8080`.

By default, the script creates a room and calls the session-start API. This backend's
session-start has no slide precondition, so the auto-create path runs standalone. (If you
point these tests at a backend that *does* gate session start on uploaded slides, use the
existing-room mode below.)

## Early production target

The current target ceiling is 200 concurrent audience WebSocket clients:

```bash
pnpm k6:target
```

The realistic live-interaction profile keeps the same 200-audience ceiling, but also has
audiences send reactions, submit questions, browse slides independently, and expects at
least one AI cluster update:

```bash
pnpm k6:target-interaction
```

Headroom above the target:

```bash
pnpm k6:headroom
```

## Remote EC2 backend

```bash
K6_BASE_URL=https://api.example.com pnpm k6:target
```

Use the public API origin, not the frontend origin, unless they are the same host.

For the 200-audience interaction profile:

```bash
K6_BASE_URL=https://api.example.com pnpm k6:target-interaction
```

## Upload and parsing tests

Upload tests use a separate k6 service and script because file upload/parsing stresses
different backend paths than live WebSocket fanout.

Place local heavy fixtures under `tests/k6/fixtures/` without committing them. The default
file path is `/fixtures/heavy.pdf`, mounted from `tests/k6/fixtures/heavy.pdf`:

```bash
pnpm k6:upload
```

For a PPT/PPTX fixture:

```bash
K6_UPLOAD_FILE=/fixtures/heavy.pptx pnpm k6:upload
```

Against EC2:

```bash
K6_BASE_URL=https://api.example.com \
K6_UPLOAD_FILE=/fixtures/heavy.pdf \
pnpm k6:upload
```

Small burst of concurrent uploads:

```bash
K6_UPLOAD_FILE=/fixtures/heavy.pdf \
K6_UPLOAD_VUS=3 \
K6_UPLOAD_DURATION_SECONDS=180 \
pnpm k6:upload-burst
```

If fixtures live outside the repo, mount that directory:

```bash
K6_UPLOAD_FIXTURE_DIR=/absolute/path/to/fixtures \
K6_UPLOAD_FILE=/fixtures/heavy.pptx \
pnpm k6:upload
```

## Existing room mode

The current backend does not require this — session start works on a freshly created room.
Use this mode when you want to drive a real, app-prepared room (or a backend that gates
session start on uploaded slides). Create and start the room through the app, then pass the
room fields:

```bash
K6_BASE_URL=https://api.example.com \
K6_CODE=ABCD \
K6_ROOM_ID=room-id \
K6_PRESENTER_TOKEN=presenter-jwt \
K6_PRESENTER_WS_URL=https://api.example.com/ws/presenter \
K6_AUDIENCE_WS_URL=https://api.example.com/ws/audience \
pnpm k6:target
```

If you only want audience join/connect pressure without presenter slide-sync traffic:

```bash
K6_CODE=ABCD K6_DISABLE_PRESENTER=true pnpm k6:target
```

## Useful knobs

- `K6_PROFILE=smoke | target | target-interaction | headroom`
- `K6_AUDIENCES=200`
- `K6_ROOM_CAPACITY=200`
- `K6_TOTAL_PAGES=10`
- `K6_REACTION_PROBABILITY=0.15`
- `K6_QUESTION_PROBABILITY=0.02`
- `K6_AUDIENCE_BROWSE_PROBABILITY=0.10`
- `K6_SLIDE_INTERVAL_MS=3000`
- `K6_REACTION_INTERVAL_MS=5000`
- `K6_QUESTION_INTERVAL_MS=10000`
- `K6_AUDIENCE_BROWSE_INTERVAL_MS=7000`
- `K6_STOMP_HEARTBEAT_MS=4000`
- `K6_SLIDE_SYNC_GRACE_MS=15000`
- `K6_EXPECT_CLUSTER_UPDATES=true`
- `K6_START_SESSION=false`

Upload-specific knobs:

- `K6_UPLOAD_FILE=/fixtures/heavy.pdf`
- `K6_UPLOAD_FILE_NAME=heavy.pdf`
- `K6_UPLOAD_MIME_TYPE=application/pdf`
- `K6_UPLOAD_CHUNK_SIZE=2097152`
- `K6_UPLOAD_CHUNK_CONCURRENCY=4`
- `K6_UPLOAD_VUS=1`
- `K6_UPLOAD_ITERATIONS=1`
- `K6_UPLOAD_DURATION_SECONDS=180`
- `K6_UPLOAD_MAX_DURATION_SECONDS=300`

## Profiles

- `smoke`: 10 audiences, one join/connect iteration each, quick protocol check.
- `target`: 200 audiences, presenter page-change fanout, default reaction/question traffic.
- `target-interaction`: 200 audiences with moderate reactions, questions, independent audience slide browsing, and cluster-update assertion.
- `headroom`: 250 audiences for above-ceiling pressure.
- `upload-smoke`: one chunked PDF/PPT/PPTX upload; asserts READY response from parsing/assembly.
- `upload-burst`: multiple repeated chunked uploads for upload/parse pressure.

For a low-write sync-only target run, override interaction knobs:

```bash
K6_REACTION_PROBABILITY=0 \
K6_QUESTION_PROBABILITY=0 \
K6_AUDIENCE_BROWSE_PROBABILITY=0 \
pnpm k6:target
```

## What the script measures

- room creation and audience join failures
- WebSocket upgrade success
- STOMP `CONNECTED` success
- unexpected socket closes
- presenter page changes sent
- audience page changes sent and received
- audience slide events received
- reaction/question traffic sent
- `reaction_rtt_ms`: reaction round-trip latency (client publish → broker fanout →
  same client receives its own stamp). Thresholds `p(95)<1000`, `p(99)<2000` apply
  whenever reactions are enabled. This is the primary responsiveness-under-load signal —
  it stays near-zero on loopback, so watch it against a remote backend. Matching relies on
  the broadcast echoing `created_at` (serialized by the WS converter as a `LocalDateTime`
  timestamp array, not an ISO string).
- AI cluster updates received
- upload room creation, chunk success, READY response, parsed page count
