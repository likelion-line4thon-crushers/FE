import http from "k6/http";
import { check, fail } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const BASE_URL = trimTrailingSlash(__ENV.K6_BASE_URL || "http://host.docker.internal:8080");
const PROFILE = __ENV.K6_PROFILE || "upload-smoke";
const UPLOAD_FILE = __ENV.K6_UPLOAD_FILE || "/fixtures/heavy.pdf";
const UPLOAD_FILE_NAME = __ENV.K6_UPLOAD_FILE_NAME || fileNameFromPath(UPLOAD_FILE);
const UPLOAD_MIME_TYPE = __ENV.K6_UPLOAD_MIME_TYPE || mimeTypeFor(UPLOAD_FILE_NAME);
const ROOM_CAPACITY = intEnv("K6_ROOM_CAPACITY", 200);
const CHUNK_SIZE = intEnv("K6_UPLOAD_CHUNK_SIZE", 2 * 1024 * 1024);
const CHUNK_CONCURRENCY = intEnv("K6_UPLOAD_CHUNK_CONCURRENCY", 4);

const uploadProfile = buildUploadProfile(PROFILE);
const fileBytes = open(UPLOAD_FILE, "b");
const totalChunks = Math.max(1, Math.ceil(fileBytes.byteLength / CHUNK_SIZE));

const roomCreateSuccess = new Rate("upload_room_create_success");
const chunkUploadSuccess = new Rate("upload_chunk_success");
const uploadReadySuccess = new Rate("upload_ready_success");
const uploadDuration = new Trend("upload_duration");
const chunksUploaded = new Counter("upload_chunks_sent");
const pagesParsed = new Counter("upload_pages_parsed");

export const options = {
  scenarios: {
    uploads: uploadProfile.scenario,
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    upload_room_create_success: ["rate>0.99"],
    upload_chunk_success: ["rate>0.99"],
    upload_ready_success: ["rate>0.99"],
  },
};

export default function uploadPresentation() {
  const startedAt = Date.now();
  const room = createRoom();
  const uploadId = randomId();
  const ready = uploadChunks({
    uploadId,
    roomId: room.roomId,
    deckId: room.deckId,
  });

  uploadDuration.add(Date.now() - startedAt);
  uploadReadySuccess.add(Boolean(ready));

  if (ready?.totalPages) {
    pagesParsed.add(Number(ready.totalPages));
  }
}

function createRoom() {
  const response = http.post(
    `${BASE_URL}/api/rooms`,
    JSON.stringify({ count: ROOM_CAPACITY, totalPages: 1 }),
    jsonParams()
  );
  const created = unwrapData(response);
  const ok = check(response, {
    "created upload-test room": (res) =>
      res.status >= 200 && res.status < 300 && Boolean(created?.roomId) && Boolean(created?.deckId),
  });
  roomCreateSuccess.add(ok);

  if (!ok) {
    fail(`Failed to create room before upload: HTTP ${response.status} ${response.body}`);
  }

  return created;
}

function uploadChunks({ uploadId, roomId, deckId }) {
  const indexes = Array.from({ length: totalChunks }, (_, index) => index);
  const readyResponses = [];

  while (indexes.length > 0) {
    const batchIndexes = indexes.splice(0, Math.min(CHUNK_CONCURRENCY, indexes.length));
    const requests = batchIndexes.map((chunkIndex) => {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileBytes.byteLength);
      const chunk = fileBytes.slice(start, end);

      return [
        "POST",
        `${BASE_URL}/api/upload/chunk`,
        {
          chunk: http.file(chunk, UPLOAD_FILE_NAME, UPLOAD_MIME_TYPE),
          uploadId,
          roomId,
          deckId,
          chunkIndex: String(chunkIndex),
          totalChunks: String(totalChunks),
          fileName: UPLOAD_FILE_NAME,
          fileSize: String(fileBytes.byteLength),
        },
      ];
    });

    const responses = http.batch(requests);
    responses.forEach((response) => {
      const data = unwrapData(response);
      const ok = response.status === 200 || response.status === 201;
      chunkUploadSuccess.add(ok);
      chunksUploaded.add(1);

      if (!ok) {
        fail(`Upload chunk failed: HTTP ${response.status} ${response.body}`);
      }

      if (response.status === 201 && data?.status === "READY") {
        readyResponses.push(data);
      }
    });
  }

  const ready = readyResponses[0];
  if (!ready) {
    fail(`Upload finished without READY response. file=${UPLOAD_FILE_NAME} chunks=${totalChunks}`);
  }

  return ready;
}

function buildUploadProfile(name) {
  if (name === "upload-burst") {
    return {
      scenario: {
        executor: "constant-vus",
        vus: intEnv("K6_UPLOAD_VUS", 3),
        duration: `${intEnv("K6_UPLOAD_DURATION_SECONDS", 180)}s`,
        gracefulStop: "30s",
      },
    };
  }

  return {
    scenario: {
      executor: "shared-iterations",
      vus: intEnv("K6_UPLOAD_VUS", 1),
      iterations: intEnv("K6_UPLOAD_ITERATIONS", 1),
      maxDuration: `${intEnv("K6_UPLOAD_MAX_DURATION_SECONDS", 300)}s`,
    },
  };
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

function intEnv(name, fallback) {
  if (__ENV[name] == null || __ENV[name] === "") return fallback;
  const value = Number(__ENV[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${__VU}`;
}

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}

function fileNameFromPath(path) {
  return String(path).split("/").filter(Boolean).pop() || "presentation.pdf";
}

function mimeTypeFor(fileName) {
  const name = String(fileName).toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
  if (name.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
}
