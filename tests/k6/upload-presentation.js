import http from "k6/http";
import { check, fail } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const BASE_URL = trimTrailingSlash(__ENV.K6_BASE_URL || "http://host.docker.internal:8080");
const PROFILE = __ENV.K6_PROFILE || "upload-smoke";
const ROOM_CAPACITY = intEnv("K6_ROOM_CAPACITY", 200);
const CHUNK_SIZE = intEnv("K6_UPLOAD_CHUNK_SIZE", 2 * 1024 * 1024);
const CHUNK_CONCURRENCY = intEnv("K6_UPLOAD_CHUNK_CONCURRENCY", 4);

const uploadProfile = buildUploadProfile(PROFILE);

// Open every fixture listed in K6_UPLOAD_FILES (comma-separated container
// paths, e.g. "/fixtures/heavy_many.pdf,/fixtures/light_few.pptx"), or fall
// back to the single K6_UPLOAD_FILE. k6 has no directory-listing API and
// open() is init-context only, so the host enumerates the folder (see the
// k6:upload-all script) and passes the list in — this runs at module load.
const FILES = resolveUploadFiles();

const roomCreateSuccess = new Rate("upload_room_create_success");
const chunkUploadSuccess = new Rate("upload_chunk_success");
const uploadReadySuccess = new Rate("upload_ready_success");
const uploadDuration = new Trend("upload_duration", true);
const chunksUploaded = new Counter("upload_chunks_sent");
const pagesParsed = new Counter("upload_pages_parsed");

export const options = {
  scenarios: {
    uploads: uploadProfile.scenario,
  },
  thresholds: buildThresholds(FILES),
};

export default function uploadFixtures() {
  for (let i = 0; i < FILES.length; i++) {
    uploadOne(FILES[i]);
  }
}

function uploadOne(file) {
  const tags = { file: file.name };
  const startedAt = Date.now();
  const room = createRoom(tags);
  const ready = uploadChunks(
    file,
    { uploadId: randomId(), roomId: room.roomId, deckId: room.deckId },
    tags
  );

  uploadDuration.add(Date.now() - startedAt, tags);
  uploadReadySuccess.add(Boolean(ready), tags);

  if (ready && ready.totalPages) {
    pagesParsed.add(Number(ready.totalPages), tags);
  }
}

function createRoom(tags) {
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
  roomCreateSuccess.add(ok, tags);

  if (!ok) {
    fail(
      `Failed to create room before upload (${tags.file}): HTTP ${response.status} ${response.body}`
    );
  }

  return created;
}

function uploadChunks(file, { uploadId, roomId, deckId }, tags) {
  const indexes = Array.from({ length: file.totalChunks }, (_, index) => index);
  const readyResponses = [];

  while (indexes.length > 0) {
    const batchIndexes = indexes.splice(0, Math.min(CHUNK_CONCURRENCY, indexes.length));
    const requests = batchIndexes.map((chunkIndex) => {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.bytes.byteLength);
      const chunk = file.bytes.slice(start, end);

      return [
        "POST",
        `${BASE_URL}/api/upload/chunk`,
        {
          chunk: http.file(chunk, file.name, file.mime),
          uploadId,
          roomId,
          deckId,
          chunkIndex: String(chunkIndex),
          totalChunks: String(file.totalChunks),
          fileName: file.name,
          fileSize: String(file.bytes.byteLength),
        },
      ];
    });

    const responses = http.batch(requests);
    responses.forEach((response) => {
      const data = unwrapData(response);
      const ok = response.status === 200 || response.status === 201;
      chunkUploadSuccess.add(ok, tags);
      chunksUploaded.add(1, tags);

      if (!ok) {
        fail(`Upload chunk failed (${file.name}): HTTP ${response.status} ${response.body}`);
      }

      if (response.status === 201 && data?.status === "READY") {
        readyResponses.push(data);
      }
    });
  }

  const ready = readyResponses[0];
  if (!ready) {
    fail(`Upload finished without READY response. file=${file.name} chunks=${file.totalChunks}`);
  }

  return ready;
}

function resolveUploadFiles() {
  const listed = String(__ENV.K6_UPLOAD_FILES || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const paths = listed.length > 0 ? listed : [__ENV.K6_UPLOAD_FILE || "/fixtures/heavy_few.pdf"];
  const single = paths.length === 1;

  return paths.map((path) => {
    // K6_UPLOAD_FILE_NAME / K6_UPLOAD_MIME_TYPE only override in single-file
    // mode; a folder sweep derives name + mime from each path.
    const name =
      single && __ENV.K6_UPLOAD_FILE_NAME ? __ENV.K6_UPLOAD_FILE_NAME : fileNameFromPath(path);
    const mime =
      single && __ENV.K6_UPLOAD_MIME_TYPE ? __ENV.K6_UPLOAD_MIME_TYPE : mimeTypeFor(name);
    const bytes = open(path, "b");
    const totalChunks = Math.max(1, Math.ceil(bytes.byteLength / CHUNK_SIZE));
    return { path, name, mime, bytes, totalChunks };
  });
}

function buildThresholds(files) {
  const thresholds = {
    http_req_failed: ["rate<0.01"],
    upload_room_create_success: ["rate>0.99"],
    upload_chunk_success: ["rate>0.99"],
    upload_ready_success: ["rate>0.99"],
  };

  // Per-file sub-metrics so the summary breaks each fixture out separately
  // (upload_ready_success is a real pass/fail; upload_duration always passes
  // and just surfaces the per-file timing line).
  files.forEach((file) => {
    thresholds[`upload_ready_success{file:${file.name}}`] = ["rate>0.99"];
    thresholds[`upload_duration{file:${file.name}}`] = ["max>=0"];
    thresholds[`upload_pages_parsed{file:${file.name}}`] = ["count>=0"];
    thresholds[`upload_chunks_sent{file:${file.name}}`] = ["count>=0"];
  });

  return thresholds;
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
      maxDuration: `${intEnv("K6_UPLOAD_MAX_DURATION_SECONDS", 600)}s`,
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
  if (name.endsWith(".pptx"))
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
}
