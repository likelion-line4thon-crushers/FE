import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createLogger } from "@/shared/lib/logger";
import type { RoomData } from "@/entities/room";
import { createRoom } from "@/shared/api/room";
import { getUploadErrorMessage } from "@/shared/api/uploadError";
import type { ChunkUploadReady, FontReportEntry } from "@/shared/api/model/pdf";
import { useChunkedPdfUpload } from "./useChunkedPdfUpload";
import { useFontMutations } from "./useFontMutations";

const log = createLogger("upload-flow");

export type UploadFlowPhase =
  | { step: "idle" }
  | { step: "creating-room" }
  | { step: "uploading" }
  | { step: "awaiting-fonts"; uploadId: string; fontReport: FontReportEntry[] }
  | { step: "done" }
  | { step: "failed"; message: string };

type FlowAction =
  | { type: "START" }
  | { type: "ROOM_CREATED" }
  | { type: "NEEDS_FONTS"; uploadId: string; fontReport: FontReportEntry[] }
  | { type: "FONT_MATCHED"; fontName: string }
  | { type: "DONE" }
  | { type: "FAIL"; message: string }
  | { type: "RESET" };

function reducer(phase: UploadFlowPhase, action: FlowAction): UploadFlowPhase {
  switch (action.type) {
    case "START":
      return { step: "creating-room" };
    case "ROOM_CREATED":
      return { step: "uploading" };
    case "NEEDS_FONTS":
      return { step: "awaiting-fonts", uploadId: action.uploadId, fontReport: action.fontReport };
    case "FONT_MATCHED":
      // 서버는 전체 리포트를 재분석하지 않으므로, 일치한 폰트만 로컬에서 '사용 가능'으로 바꾼다.
      if (phase.step !== "awaiting-fonts") return phase;
      return {
        ...phase,
        fontReport: phase.fontReport.map((e) =>
          e.name === action.fontName ? { ...e, status: "AVAILABLE" as const, installed: true } : e
        ),
      };
    case "DONE":
      return { step: "done" };
    case "FAIL":
      return { step: "failed", message: action.message };
    case "RESET":
      return { step: "idle" };
  }
}

interface Params {
  /** 랜딩에서 넘어온 발표 파일. 값이 생기면 자동으로 플로우를 시작한다. */
  pendingFile: File | null;
  /** 방 생성 직후 — 캐노니컬 URL 로 교체하고 스켈레톤 roomData 를 영속화할 기회. */
  onRoomCreated: (room: RoomData) => void;
  /** 업로드/변환 확정 — SSE 구독을 시작할 수 있는 시점. */
  onReady: (room: RoomData, ready: ChunkUploadReady) => void;
  /** 신규 플로우 시작 직전 — 이전 세션 잔재(atom/스토리지/로컬 state) 리셋. */
  onStart: () => void;
}

/**
 * 발표 자료 업로드 파이프라인 오케스트레이터.
 * createRoom → 청크 업로드 → (폰트 확인) → finalize 를 명시적 단계 머신으로 관리한다.
 *
 * - 언마운트/StrictMode 재실행 시 진행 중 요청을 abort 하고, 재실행이면 처음부터 다시 시작한다.
 * - 재시도(retry)는 이미 만든 방을 재사용하되 uploadId 는 새로 발급된다
 *   (서버 청크 카운터는 수신 횟수 기반이라 같은 uploadId 로 청크를 재전송하면 안 된다).
 */
export function usePresentationUploadFlow({
  pendingFile,
  onRoomCreated,
  onReady,
  onStart,
}: Params) {
  const [phase, dispatch] = useReducer(reducer, { step: "idle" });
  const { upload: uploadPdf, progress } = useChunkedPdfUpload();

  const roomRef = useRef<RoomData | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const startedForRef = useRef<File | null>(null);

  // 콜백은 latest-ref 로 보관해 run 의 정체성을 안정시킨다 (effect 재실행 → 업로드 중단 방지).
  const callbacksRef = useRef({ onRoomCreated, onReady, onStart });
  useEffect(() => {
    callbacksRef.current = { onRoomCreated, onReady, onStart };
  }, [onRoomCreated, onReady, onStart]);

  const [fontWarnings, setFontWarnings] = useState<Record<string, string>>({});
  const [fontError, setFontError] = useState<string | null>(null);

  const {
    uploadFont: mutateFontUpload,
    finalize,
    uploadingName,
    busy: fontBusy,
  } = useFontMutations({
    onUploaded: (fontName, res) => {
      setFontError(null);
      if (res.matched) {
        dispatch({ type: "FONT_MATCHED", fontName });
        setFontWarnings((prev) => {
          const next = { ...prev };
          delete next[fontName];
          return next;
        });
      } else {
        setFontWarnings((prev) => ({ ...prev, [fontName]: res.uploadedFamilies?.[0] ?? "" }));
      }
    },
    onUploadError: () => setFontError("폰트 업로드에 실패했습니다. 다시 시도해주세요."),
    onFinalized: (ready) => {
      const room = roomRef.current;
      if (!room) return;
      dispatch({ type: "DONE" });
      callbacksRef.current.onReady(room, ready);
    },
    onFinalizeError: () => setFontError("변환을 시작하지 못했습니다. 다시 시도해주세요."),
  });

  const run = useCallback(
    async (file: File, signal: AbortSignal) => {
      dispatch({ type: "START" });
      callbacksRef.current.onStart();
      setFontWarnings({});
      setFontError(null);
      try {
        let room = roomRef.current;
        if (!room) {
          // BE 는 totalPages >= 1 을 요구하므로 placeholder 로 1 을 보낸다.
          // 실제 총 페이지는 업로드 조립 완료 응답(ready.totalPages)에서 확정된다.
          const created = await createRoom(1, signal);
          // abort 확인을 roomRef 할당보다 먼저 — 중단된 run 이 다른 run 의 방을 덮어쓰지 않도록.
          if (signal.aborted) return;
          room = created;
          roomRef.current = created;
          callbacksRef.current.onRoomCreated(created);
        }
        if (signal.aborted) return;

        dispatch({ type: "ROOM_CREATED" });
        const terminal = await uploadPdf(file, room.roomId, room.deckId, signal);
        if (terminal.status === "NEEDS_FONTS") {
          dispatch({
            type: "NEEDS_FONTS",
            uploadId: terminal.uploadId,
            fontReport: terminal.fontReport,
          });
          return; // finalize 는 사용자 액션(폰트 업로드 / 그냥 진행)으로 트리거된다
        }

        dispatch({ type: "DONE" });
        callbacksRef.current.onReady(room, terminal);
      } catch (err) {
        if (signal.aborted) return; // 취소는 실패로 취급하지 않는다
        log.error("발표 자료 업로드 실패:", err);
        dispatch({
          type: "FAIL",
          message: getUploadErrorMessage(
            err,
            "발표 자료 업로드에 실패했습니다. 다시 시도해주세요."
          ),
        });
      }
    },
    [uploadPdf]
  );

  // 자동 시작: pendingFile 이 생기면 한 번 실행. cleanup 은 StrictMode 재실행과
  // 실제 언마운트 양쪽에서 진행 중 요청을 중단하고 가드를 풀어 재시작을 허용한다.
  useEffect(() => {
    if (!pendingFile || startedForRef.current === pendingFile) return undefined;
    startedForRef.current = pendingFile;
    const controller = new AbortController();
    controllerRef.current = controller;
    void run(pendingFile, controller.signal);
    return () => {
      // ref 를 통해 최신 컨트롤러를 abort — retry() 가 교체한 컨트롤러도 언마운트 시 중단되도록.
      controllerRef.current?.abort();
      startedForRef.current = null;
    };
  }, [pendingFile, run]);

  const retry = useCallback(() => {
    const file = startedForRef.current ?? pendingFile;
    if (!file) return;
    startedForRef.current = file;
    const controller = new AbortController();
    controllerRef.current = controller;
    void run(file, controller.signal);
  }, [pendingFile, run]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    dispatch({ type: "RESET" });
  }, []);

  const uploadFont = useCallback(
    (fontName: string, file: File) => {
      if (phase.step !== "awaiting-fonts") return;
      setFontError(null);
      mutateFontUpload(phase.uploadId, fontName, file);
    },
    [phase, mutateFontUpload]
  );

  const continueWithFonts = useCallback(() => {
    if (phase.step !== "awaiting-fonts") return;
    setFontError(null);
    finalize(phase.uploadId, false);
  }, [phase, finalize]);

  const proceedWithoutFonts = useCallback(() => {
    if (phase.step !== "awaiting-fonts") return;
    setFontError(null);
    finalize(phase.uploadId, true);
  }, [phase, finalize]);

  return {
    phase,
    progress,
    retry,
    cancel,
    fonts: {
      warnings: fontWarnings,
      error: fontError,
      uploadingName,
      busy: fontBusy,
      uploadFont,
      continueWithFonts,
      proceedWithoutFonts,
    },
  };
}
