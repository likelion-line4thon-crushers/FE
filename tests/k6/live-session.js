import http from "k6/http";
import ws from "k6/ws";
import { check, fail } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const BASE_URL = trimTrailingSlash(__ENV.K6_BASE_URL || "http://host.docker.internal:8080");
const PROFILE = __ENV.K6_PROFILE || "smoke";
const profile = buildProfile(PROFILE);
const ROOM_CAPACITY = intEnv("K6_ROOM_CAPACITY", 200);
const TOTAL_PAGES = intEnv("K6_TOTAL_PAGES", 10);
const START_SESSION = boolEnv("K6_START_SESSION", true);
const DISABLE_PRESENTER = boolEnv("K6_DISABLE_PRESENTER", false);
const REACTION_PROBABILITY = floatEnv("K6_REACTION_PROBABILITY", profile.reactionProbability);
const QUESTION_PROBABILITY = floatEnv("K6_QUESTION_PROBABILITY", profile.questionProbability);
const AUDIENCE_BROWSE_PROBABILITY = floatEnv(
  "K6_AUDIENCE_BROWSE_PROBABILITY",
  profile.audienceBrowseProbability
);
const SLIDE_INTERVAL_MS = intEnv("K6_SLIDE_INTERVAL_MS", 3000);
const REACTION_INTERVAL_MS = intEnv("K6_REACTION_INTERVAL_MS", 5000);
const QUESTION_INTERVAL_MS = intEnv("K6_QUESTION_INTERVAL_MS", 10000);
const AUDIENCE_BROWSE_INTERVAL_MS = intEnv("K6_AUDIENCE_BROWSE_INTERVAL_MS", 7000);
const STOMP_HEARTBEAT_MS = intEnv("K6_STOMP_HEARTBEAT_MS", 4000);
const SLIDE_SYNC_GRACE_MS = intEnv("K6_SLIDE_SYNC_GRACE_MS", 15000);
const EXPECT_CLUSTER_UPDATES = boolEnv("K6_EXPECT_CLUSTER_UPDATES", profile.expectClusterUpdates);

const TARGET_AUDIENCES = intEnv("K6_AUDIENCES", profile.defaultAudiences);
const ACTIVE_SESSION_MS = Math.max(15000, (profile.totalSeconds - 5) * 1000);

const audienceJoinSuccess = new Rate("audience_join_success");
const wsUpgradeSuccess = new Rate("ws_upgrade_success");
const stompConnectSuccess = new Rate("stomp_connect_success");
const unexpectedSocketClose = new Rate("unexpected_socket_close");
const slideSyncSuccess = new Rate("slide_sync_success");
const slideEventsReceived = new Counter("slide_events_received");
const pageChangesSent = new Counter("page_changes_sent");
const audiencePageChangesSent = new Counter("audience_page_changes_sent");
const audiencePageEventsReceived = new Counter("audience_page_events_received");
const reactionsSent = new Counter("reactions_sent");
const questionsSent = new Counter("questions_sent");
const clusterUpdatesReceived = new Counter("cluster_updates_received");
const clusterUpdateSuccess = new Rate("cluster_update_success");
const stompMessagesReceived = new Counter("stomp_messages_received");
const reactionRtt = new Trend("reaction_rtt_ms", true);

const scenarios = {
  audiences: buildAudienceScenario(profile, TARGET_AUDIENCES),
};

if (!DISABLE_PRESENTER) {
  scenarios.presenter = {
    executor: "constant-vus",
    exec: "presenter",
    vus: 1,
    duration: `${profile.totalSeconds}s`,
  };
}

const thresholds = {
  http_req_failed: ["rate<0.01"],
  audience_join_success: ["rate>0.99"],
  ws_upgrade_success: ["rate>0.98"],
  stomp_connect_success: ["rate>0.98"],
  unexpected_socket_close: ["rate<0.01"],
};

if (!DISABLE_PRESENTER) {
  thresholds.slide_sync_success = ["rate>0.90"];
}

if (EXPECT_CLUSTER_UPDATES) {
  thresholds.cluster_update_success = ["rate>0"];
}

if (REACTION_PROBABILITY > 0) {
  thresholds.reaction_rtt_ms = ["p(95)<1000", "p(99)<2000"];
}

export const options = {
  scenarios,
  thresholds,
};

export function setup() {
  const existingRoom = {
    roomId: __ENV.K6_ROOM_ID,
    code: __ENV.K6_CODE,
    presenterToken: __ENV.K6_PRESENTER_TOKEN,
    presenterWsUrl: __ENV.K6_PRESENTER_WS_URL,
    audienceWsUrl: __ENV.K6_AUDIENCE_WS_URL,
  };

  if (existingRoom.code) {
    if (!existingRoom.roomId) {
      console.warn(
        "K6_CODE is set without K6_ROOM_ID. Audience joins can run, but presenter sync needs K6_ROOM_ID."
      );
    }
    return existingRoom;
  }

  const createResponse = http.post(
    `${BASE_URL}/api/rooms`,
    JSON.stringify({ count: ROOM_CAPACITY, totalPages: TOTAL_PAGES }),
    jsonParams()
  );

  const created = unwrapData(createResponse);
  const createOk = check(createResponse, {
    "created stress-test room": (res) =>
      res.status >= 200 && res.status < 300 && Boolean(created?.code),
  });

  if (!createOk) {
    fail(`Failed to create room: HTTP ${createResponse.status} ${createResponse.body}`);
  }

  if (START_SESSION) {
    const startResponse = http.post(
      `${BASE_URL}/api/rooms/${created.roomId}/session/start`,
      null,
      jsonParams()
    );
    const startOk = check(startResponse, {
      "started stress-test session": (res) => res.status >= 200 && res.status < 300,
    });
    if (!startOk) {
      fail(
        `Failed to start session. If your backend requires uploaded slides before start, create a room manually and rerun with K6_CODE, K6_ROOM_ID, K6_PRESENTER_TOKEN, and K6_PRESENTER_WS_URL. HTTP ${startResponse.status} ${startResponse.body}`
      );
    }
  }

  return {
    roomId: created.roomId,
    code: created.code,
    presenterToken: created.presenterToken,
    presenterWsUrl: created.wsUrl,
    audienceWsUrl: __ENV.K6_AUDIENCE_WS_URL,
  };
}

export function presenter(room) {
  if (!room?.roomId || !room?.presenterToken) {
    console.warn(
      "Presenter VU skipped. Provide K6_ROOM_ID and K6_PRESENTER_TOKEN, or set K6_DISABLE_PRESENTER=true."
    );
    return;
  }

  const wsUrl = sockJsWebSocketUrl(room.presenterWsUrl, "/ws/presenter");
  const role = "presenter";
  let receivedClusterUpdate = false;
  let recordedClusterUpdate = false;

  const recordClusterUpdate = () => {
    if (!EXPECT_CLUSTER_UPDATES || recordedClusterUpdate) return;
    recordedClusterUpdate = true;
    clusterUpdateSuccess.add(receivedClusterUpdate, { role });
  };

  connectStomp({
    role,
    wsUrl,
    token: room.presenterToken,
    onConnected: (socket) => {
      subscribe(
        socket,
        "presenter-audience-page",
        `/topic/presentation/${room.roomId}/pageChange/audience`
      );
      subscribe(socket, "presenter-question", `/topic/presentation/${room.roomId}/question`);
      subscribe(socket, "presenter-public", `/topic/p/${room.roomId}/public`);
      subscribe(socket, "presenter-private", `/topic/p/${room.roomId}/presenter`);
      subscribe(socket, "presenter-clusters", `/topic/p/${room.roomId}/clusters`);
      subscribe(socket, "presenter-reactions", `/topic/presentation/${room.roomId}/reactions`);
      subscribe(
        socket,
        "presenter-audience-count",
        `/topic/presentation/${room.roomId}/audienceCount`
      );

      let currentPage = 1;
      sendPageChange(socket, room.roomId, currentPage, currentPage);

      socket.setInterval(() => {
        const beforePage = currentPage;
        currentPage = currentPage >= TOTAL_PAGES ? 1 : currentPage + 1;
        sendPageChange(socket, room.roomId, beforePage, currentPage);
      }, SLIDE_INTERVAL_MS);
    },
    onFrame: (frame) => {
      stompMessagesReceived.add(1, { role });
      if (frame.headers.destination === `/topic/presentation/${room.roomId}/pageChange/audience`) {
        audiencePageEventsReceived.add(1);
      }
      if (frame.headers.destination === `/topic/p/${room.roomId}/clusters`) {
        receivedClusterUpdate = true;
        clusterUpdatesReceived.add(1);
        recordClusterUpdate();
      }
    },
    onClose: recordClusterUpdate,
  });
}

export function audience(room) {
  if (!room?.code) {
    fail("Audience scenario requires a room code. Provide K6_CODE or let setup create a room.");
  }

  const joinResponse = http.get(`${BASE_URL}/api/rooms/join/${encodeURIComponent(room.code)}`);
  const joinData = unwrapData(joinResponse);
  const joined = check(joinResponse, {
    "audience joined room": (res) =>
      res.status >= 200 &&
      res.status < 300 &&
      Boolean(joinData?.audienceId) &&
      Boolean(joinData?.audienceToken),
  });
  audienceJoinSuccess.add(joined);

  if (!joined) {
    return;
  }

  const roomId = joinData.roomId || room.roomId;
  const audienceId = joinData.audienceId;
  const token = joinData.audienceToken;
  const wsUrl = sockJsWebSocketUrl(joinData.wsUrl || room.audienceWsUrl, "/ws/audience");
  const role = "audience";
  let receivedSlideSync = false;
  let recordedSlideSync = false;
  let currentPage = 1;
  const pendingReactions = new Map();

  const recordSlideSync = () => {
    if (recordedSlideSync) return;
    recordedSlideSync = true;
    slideSyncSuccess.add(receivedSlideSync, { role });
  };

  connectStomp({
    role,
    wsUrl,
    token,
    onConnected: (socket) => {
      subscribe(socket, `aud-${__VU}-page`, `/topic/presentation/${roomId}/pageChange`);
      subscribe(socket, `aud-${__VU}-option`, `/topic/presentation/${roomId}/option`);
      subscribe(socket, `aud-${__VU}-unlock`, `/topic/presentation/${roomId}/option/unlock`);
      subscribe(socket, `aud-${__VU}-focus`, `/topic/presentation/${roomId}/focusOn`);
      subscribe(socket, `aud-${__VU}-public`, `/topic/p/${roomId}/public`);
      subscribe(socket, `aud-${__VU}-presenter`, `/topic/p/${roomId}/presenter`);
      subscribe(socket, `aud-${__VU}-clusters`, `/topic/p/${roomId}/clusters`);
      subscribe(socket, `aud-${__VU}-question`, `/topic/presentation/${roomId}/question`);
      subscribe(socket, `aud-${__VU}-reactions`, `/topic/presentation/${roomId}/reactions`);

      socket.setInterval(() => {
        if (Math.random() <= REACTION_PROBABILITY) {
          const createdAt = sendReaction(socket, roomId, audienceId);
          // Key by epoch-ms: the backend round-trips created_at through a
          // LocalDateTime (drops the trailing Z and zero-pads), so the echoed
          // string never equals what we sent — the instant value survives.
          pendingReactions.set(Date.parse(createdAt), Date.now());
        }
      }, REACTION_INTERVAL_MS);

      socket.setInterval(() => {
        if (Math.random() <= QUESTION_PROBABILITY) {
          sendQuestion(socket, roomId, audienceId);
        }
      }, QUESTION_INTERVAL_MS);

      socket.setInterval(() => {
        if (Math.random() <= AUDIENCE_BROWSE_PROBABILITY) {
          const beforePage = currentPage;
          currentPage = randomDifferentPage(currentPage);
          sendAudiencePageChange(socket, roomId, audienceId, beforePage, currentPage);
        }
      }, AUDIENCE_BROWSE_INTERVAL_MS);

      socket.setTimeout(recordSlideSync, SLIDE_SYNC_GRACE_MS);
    },
    onFrame: (frame) => {
      stompMessagesReceived.add(1, { role });
      if (frame.headers.destination === `/topic/presentation/${roomId}/pageChange`) {
        const body = parseJsonBody(frame.body);
        if (Number.isFinite(Number(body?.changedPage))) {
          currentPage = Number(body.changedPage);
        }
        receivedSlideSync = true;
        recordSlideSync();
        slideEventsReceived.add(1);
      }
      if (frame.headers.destination === `/topic/p/${roomId}/clusters`) {
        clusterUpdatesReceived.add(1);
      }
      if (frame.headers.destination === `/topic/presentation/${roomId}/reactions`) {
        const body = parseJsonBody(frame.body);
        const key = reactionInstantMs(body && body.created_at);
        const sentAt = pendingReactions.get(key);
        if (sentAt) {
          reactionRtt.add(Date.now() - sentAt);
          pendingReactions.delete(key);
        }
      }
    },
    onClose: recordSlideSync,
  });
}

function connectStomp({ role, wsUrl, token, onConnected, onFrame, onClose = () => {} }) {
  let sockJsReady = false;
  let stompReady = false;
  let expectedClose = false;

  const response = ws.connect(wsUrl, { tags: { role } }, (socket) => {
    socket.on("message", (message) => {
      if (message === "o") {
        sockJsReady = true;
        sendSockJsFrame(
          socket,
          stompFrame("CONNECT", {
            "accept-version": "1.2,1.1,1.0",
            "heart-beat": "4000,4000",
            Authorization: `Bearer ${token}`,
          })
        );
        return;
      }

      if (message === "h") return;

      const frames = parseSockJsStompFrames(message);
      frames.forEach((frame) => {
        if (frame.command === "CONNECTED") {
          stompReady = true;
          stompConnectSuccess.add(true, { role });
          onConnected(socket);
          if (STOMP_HEARTBEAT_MS > 0) {
            socket.setInterval(() => {
              sendSockJsFrame(socket, "\n");
            }, STOMP_HEARTBEAT_MS);
          }
          return;
        }

        if (frame.command === "MESSAGE") {
          onFrame(frame);
        }
      });
    });

    socket.on("close", () => {
      unexpectedSocketClose.add(!expectedClose, { role });
      onClose();
      if (!stompReady && sockJsReady) {
        stompConnectSuccess.add(false, { role });
      }
    });

    socket.on("error", () => {
      unexpectedSocketClose.add(true, { role });
      if (!stompReady) {
        stompConnectSuccess.add(false, { role });
      }
    });

    socket.setTimeout(() => {
      if (!stompReady) {
        stompConnectSuccess.add(false, { role });
      }
    }, 10000);

    socket.setTimeout(() => {
      expectedClose = true;
      socket.close();
    }, ACTIVE_SESSION_MS);
  });

  const upgraded = Boolean(response && response.status === 101);
  wsUpgradeSuccess.add(upgraded, { role });
  check(response, {
    [`${role} websocket upgraded`]: (res) => res && res.status === 101,
  });
}

function sendPageChange(socket, roomId, beforePage, changedPage) {
  sendJson(socket, `/app/presentation/${roomId}/pageChange/presenter`, {
    beforePage,
    changedPage,
  });
  pageChangesSent.add(1);
}

function sendAudiencePageChange(socket, roomId, audienceId, beforePage, changedPage) {
  sendJson(socket, `/app/presentation/${roomId}/pageChange/audience`, {
    audienceId,
    beforePage,
    changedPage,
  });
  audiencePageChangesSent.add(1);
}

function sendReaction(socket, roomId, audienceId) {
  const createdAt = new Date().toISOString();
  sendJson(socket, `/app/presentation/${roomId}/reaction`, {
    emoji: randomInt(1, 8),
    audienceID: audienceId,
    created_at: createdAt,
    x: randomInt(5, 95),
    y: randomInt(5, 95),
    slide: randomInt(1, TOTAL_PAGES),
  });
  reactionsSent.add(1);
  return createdAt;
}

function sendQuestion(socket, roomId, audienceId) {
  sendJson(socket, `/app/p/${roomId}/question.create`, {
    audienceId,
    slide: randomInt(1, TOTAL_PAGES),
    content: randomQuestionContent(),
    ts: Date.now(),
  });
  questionsSent.add(1);
}

function subscribe(socket, id, destination) {
  sendSockJsFrame(
    socket,
    stompFrame("SUBSCRIBE", {
      id,
      destination,
      ack: "auto",
    })
  );
}

function sendJson(socket, destination, body) {
  sendSockJsFrame(
    socket,
    stompFrame(
      "SEND",
      {
        destination,
        "content-type": "application/json",
        "Idempotency-Key": randomId(),
      },
      JSON.stringify(body)
    )
  );
}

function sendSockJsFrame(socket, frame) {
  socket.send(JSON.stringify([frame]));
}

function stompFrame(command, headers = {}, body = "") {
  const bodyText = body == null ? "" : String(body);
  const lines = [command];
  Object.entries(headers).forEach(([key, value]) => {
    lines.push(`${key}:${value}`);
  });
  if (bodyText.length > 0) {
    lines.push(`content-length:${bodyText.length}`);
  }
  return `${lines.join("\n")}\n\n${bodyText}\x00`;
}

function parseSockJsStompFrames(message) {
  if (!message || message[0] !== "a") return [];

  try {
    const rawFrames = JSON.parse(message.slice(1));
    return rawFrames
      .flatMap((raw) => String(raw).split("\x00"))
      .map((raw) => raw.trimEnd())
      .filter(Boolean)
      .map(parseStompFrame)
      .filter(Boolean);
  } catch (_error) {
    return [];
  }
}

function parseStompFrame(raw) {
  const separator = raw.indexOf("\n\n");
  const headerBlock = separator >= 0 ? raw.slice(0, separator) : raw;
  const body = separator >= 0 ? raw.slice(separator + 2) : "";
  const lines = headerBlock.split("\n").filter(Boolean);
  const command = lines.shift();
  if (!command) return null;

  const headers = {};
  lines.forEach((line) => {
    const index = line.indexOf(":");
    if (index <= 0) return;
    headers[line.slice(0, index)] = line.slice(index + 1);
  });

  return { command, headers, body };
}

// The STOMP JSON converter serializes created_at as a Java LocalDateTime
// timestamp array [year, month(1-based), day, hour, minute, second, nanos] in
// UTC wall-clock (REST returns ISO strings, but the WS converter does not).
// Reduce either form to epoch-ms so it matches the sender's Date.parse key.
function reactionInstantMs(raw) {
  if (Array.isArray(raw)) {
    const [y, mo, d, h = 0, mi = 0, s = 0, nanos = 0] = raw;
    return Date.UTC(y, mo - 1, d, h, mi, s, Math.round(nanos / 1e6));
  }
  if (typeof raw === "string") {
    return Date.parse(raw.endsWith("Z") ? raw : `${raw}Z`);
  }
  return NaN;
}

function parseJsonBody(body) {
  try {
    return JSON.parse(body);
  } catch (_error) {
    return null;
  }
}

function sockJsWebSocketUrl(rawUrl, path) {
  const fallback = `${BASE_URL}${path}`;
  const base = roleEndpointUrl(rawUrl || fallback, path);
  const url = parseUrl(base);

  if (url.protocol === "http") url.protocol = "ws";
  if (url.protocol === "https") url.protocol = "wss";

  if (url.path.endsWith("/websocket")) {
    return buildUrl(url);
  }

  const basePath = trimTrailingSlash(url.path);
  url.path = `${basePath}/${randomInt(0, 999)}/${randomId()}/websocket`;
  return buildUrl(url);
}

function roleEndpointUrl(rawUrl, path) {
  const target = parseUrl(rewriteLocalhost(rawUrl));

  if (target.path.endsWith("/websocket")) {
    return buildUrl(target);
  }

  target.path = path;
  target.query = "";
  return buildUrl(target);
}

function rewriteLocalhost(rawUrl) {
  const target = parseUrl(resolveUrl(rawUrl));
  const base = parseUrl(BASE_URL);
  if (isLocalHost(target.host) && target.host !== base.host) {
    target.protocol = base.protocol;
    target.host = base.host;
  }
  return buildUrl(target);
}

function resolveUrl(rawUrl) {
  const raw = String(rawUrl || "").trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    return raw;
  }

  const base = parseUrl(BASE_URL);
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return buildUrl({ ...base, path, query: "" });
}

function parseUrl(value) {
  const match = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]+)([^?#]*)(\?[^#]*)?/i.exec(String(value));
  if (!match) {
    throw new Error(`Invalid URL: ${value}`);
  }

  return {
    protocol: match[1].toLowerCase(),
    host: match[2],
    path: match[3] || "/",
    query: match[4] || "",
  };
}

function buildUrl({ protocol, host, path, query = "" }) {
  const safePath = path && path.startsWith("/") ? path : `/${path || ""}`;
  return `${protocol}://${host}${safePath}${query}`;
}

function isLocalHost(host) {
  const normalized = String(host)
    .toLowerCase()
    .replace(/^\[/, "")
    .replace(/\](:\d+)?$/, "");
  return (
    normalized === "localhost" ||
    normalized.startsWith("localhost:") ||
    normalized === "127.0.0.1" ||
    normalized.startsWith("127.0.0.1:") ||
    normalized === "::1" ||
    normalized.startsWith("::1:")
  );
}

function unwrapData(response) {
  try {
    const parsed = response.json();
    return parsed?.data || parsed;
  } catch (_error) {
    return null;
  }
}

function jsonParams() {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
}

function buildProfile(name) {
  const common = {
    reactionProbability: 0.15,
    questionProbability: 0.02,
    audienceBrowseProbability: 0,
    expectClusterUpdates: false,
  };

  if (name === "target-interaction") {
    return {
      ...common,
      name,
      defaultAudiences: 200,
      totalSeconds: 420,
      warmupSeconds: 30,
      rampSeconds: 60,
      holdSeconds: 300,
      reactionProbability: 0.1,
      questionProbability: 0.01,
      audienceBrowseProbability: 0.1,
      expectClusterUpdates: true,
    };
  }
  if (name === "target") {
    return {
      ...common,
      name,
      defaultAudiences: 200,
      totalSeconds: 420,
      warmupSeconds: 30,
      rampSeconds: 60,
      holdSeconds: 300,
    };
  }
  if (name === "headroom") {
    return {
      ...common,
      name,
      defaultAudiences: 250,
      totalSeconds: 480,
      warmupSeconds: 30,
      rampSeconds: 90,
      holdSeconds: 330,
    };
  }
  return {
    ...common,
    name: "smoke",
    defaultAudiences: 10,
    totalSeconds: 75,
    warmupSeconds: 15,
    rampSeconds: 15,
    holdSeconds: 30,
  };
}

function buildAudienceScenario(selectedProfile, audiences) {
  if (selectedProfile.name === "smoke") {
    return {
      executor: "per-vu-iterations",
      exec: "audience",
      vus: audiences,
      iterations: 1,
      maxDuration: `${selectedProfile.totalSeconds + 30}s`,
    };
  }

  return {
    executor: "ramping-vus",
    exec: "audience",
    startVUs: 0,
    stages: buildAudienceStages(selectedProfile, audiences),
    gracefulRampDown: "15s",
  };
}

function buildAudienceStages(selectedProfile, audiences) {
  if (selectedProfile.name === "smoke") {
    return [
      { duration: `${selectedProfile.rampSeconds}s`, target: audiences },
      { duration: `${selectedProfile.holdSeconds}s`, target: audiences },
      { duration: "15s", target: 0 },
    ];
  }

  const warmupTarget = Math.min(50, audiences);
  return [
    { duration: `${selectedProfile.warmupSeconds}s`, target: warmupTarget },
    { duration: `${selectedProfile.rampSeconds}s`, target: audiences },
    { duration: `${selectedProfile.holdSeconds}s`, target: audiences },
    { duration: "30s", target: 0 },
  ];
}

function intEnv(name, fallback) {
  const value = Number(__ENV[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function floatEnv(name, fallback) {
  if (__ENV[name] == null || __ENV[name] === "") return fallback;
  const value = Number(__ENV[name]);
  return Number.isFinite(value) ? value : fallback;
}

function boolEnv(name, fallback) {
  const value = __ENV[name];
  if (value == null || value === "") return fallback;
  return !["0", "false", "no", "off"].includes(String(value).toLowerCase());
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDifferentPage(currentPage) {
  if (TOTAL_PAGES <= 1) return 1;

  let nextPage = currentPage;
  while (nextPage === currentPage) {
    nextPage = randomInt(1, TOTAL_PAGES);
  }
  return nextPage;
}

function randomQuestionContent() {
  const templates = [
    "Can you explain the scoring rule again?",
    "How much time do we have for the final demo?",
    "Where can I find the submission link?",
    "Can teams use external APIs?",
    "What happens if the presentation runs over time?",
    "Will the slides be shared after the session?",
    "Can you clarify the judging criteria?",
    "Is there a recommended project format?",
  ];
  return `${templates[randomInt(0, templates.length - 1)]} [vu:${__VU}]`;
}

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${__VU}`;
}

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}
