import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { presenterModeAtom } from "@/entities/room";
import { startSession, closeSession } from "@/shared/api/room";
import { sessionStartMarker } from "@/shared/config/storage-keys";
import {
  fetchTopSlideReport,
  fetchTopQuestionsReport,
  fetchTopStoredReport,
} from "@/shared/api/ai-report";
import websocketService from "@/shared/api/websocket";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("header");

interface UseHeaderSessionActionParams {
  roomData: any;
  fileName: string;
  totalPages?: number;
  canStartSession?: boolean;
  isPrep?: boolean;
  isPresenter?: boolean;
}

/**
 * * Handles session start (prepare → present) and session end (present → report).
 * 준비/발표 구분은 URL 이 아니라 presenterModeAtom 기반으로 상위(AppHeader)에서 전달받는다.
 */
export const useHeaderSessionAction = ({
  roomData,
  fileName,
  totalPages,
  canStartSession = false,
  isPrep = false,
  isPresenter = false,
}: UseHeaderSessionActionParams) => {
  const location = useLocation();
  const navigate = useNavigate();
  const setPresenterMode = useSetAtom(presenterModeAtom);

  const [isSessionEnding, setIsSessionEnding] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [landingMessage, setLandingMessage] = useState("AI 리포트 생성 중 ...");

  useEffect(() => {
    if (location.pathname.endsWith("/report")) {
      setShowLandingPage(false);
      setIsSessionEnding(false);
    }
  }, [location.pathname]);

  const handleSessionAction = useCallback(async () => {
    if (isSessionEnding) return;

    if (isPrep) {
      if (!roomData?.roomId || !roomData?.deckId) {
        alert("⚠️ 방 정보가 아직 준비되지 않았습니다.");
        return;
      }

      if (!canStartSession) {
        alert("⚠️ 아직 슬라이드 준비 중입니다. 잠시만 기다려주세요.");
        return;
      }

      try {
        await startSession(roomData.roomId);
        // 새로고침 시에도 발표 화면으로 복원되도록 시작 마커를 저장.
        sessionStartMarker.set(roomData.roomId);
        // 단일 경로이므로 라우팅하지 않고 모드만 발표로 전환한다.
        // (게이트가 presenterModeAtom 을 구독해 발표 화면으로 즉시 전환)
        setPresenterMode("present");
      } catch {
        alert("⚠️ 세션 시작에 실패했습니다. 다시 시도해주세요.");
      }
    } else if (isPresenter) {
      const resolvedRoomId = roomData?.roomId ?? location.state?.roomId ?? null;
      const resolvedDeckId = roomData?.deckId ?? location.state?.deckId ?? null;
      const resolvedTotalPages =
        location.state?.totalPages ??
        roomData?.totalPages ??
        roomData?.slideCount ??
        totalPages ??
        null;

      if (!resolvedRoomId) {
        alert("⚠️ 방 정보를 찾을 수 없습니다. 다시 시도해주세요.");
        return;
      }

      setIsSessionEnding(true);
      setLandingMessage("AI 리포트 생성 중 ...");
      setShowLandingPage(true);
      let didNavigate = false;

      try {
        // ! Send WS end-session notification before API call
        if (websocketService.getIsConnected()) {
          try {
            websocketService.sendEndSession(resolvedRoomId);
            log.log("세션 종료 웹소켓 알림 전송 완료:", resolvedRoomId);
          } catch (wsError) {
            log.warn("웹소켓 알림 전송 실패 (계속 진행):", wsError);
          }
        } else {
          log.warn("WebSocket이 연결되지 않아 알림을 전송할 수 없습니다.");
        }

        // * Pre-fetch AI report data
        const reportResults = await Promise.allSettled([
          fetchTopStoredReport(resolvedRoomId),
          fetchTopSlideReport(resolvedRoomId, { latestFirst: true }),
          fetchTopQuestionsReport(resolvedRoomId),
        ]);

        const reportErrors = reportResults.filter((r) => r.status === "rejected");
        if (reportErrors.length > 0) {
          log.warn("레포트 선행 호출 중 일부 실패:", reportErrors);
        }

        await closeSession(resolvedRoomId);
        sessionStartMarker.clear(resolvedRoomId);
        log.log("세션 종료 API(DELETE) 성공:", resolvedRoomId);

        const nextState = {
          roomId: resolvedRoomId,
          deckId: resolvedDeckId,
          totalPages: resolvedTotalPages,
          fileName,
          roomData: {
            ...(roomData || {}),
            roomId: resolvedRoomId,
            deckId: resolvedDeckId,
            totalPages: resolvedTotalPages,
            fileName,
          },
        };

        try {
          window.sessionStorage.setItem("ai_report_room", JSON.stringify(nextState.roomData));
        } catch {
          // ignore storage write errors
        }

        navigate(`/rooms/${resolvedRoomId}/report`, {
          replace: false,
          state: nextState,
        });
        setShowLandingPage(false);
        didNavigate = true;
      } catch (error) {
        log.error("세션 종료 처리 실패:", error);
        alert("⚠️ 세션 종료 처리에 실패했습니다. 다시 시도해주세요.");
        setShowLandingPage(false);
      } finally {
        setIsSessionEnding(false);
        if (!didNavigate) {
          setShowLandingPage(false);
        }
      }
    }
  }, [
    isSessionEnding,
    isPrep,
    isPresenter,
    roomData,
    fileName,
    totalPages,
    canStartSession,
    navigate,
    location.state,
    setPresenterMode,
  ]);

  return {
    isSessionEnding,
    showLandingPage,
    landingMessage,
    handleSessionAction,
  };
};
