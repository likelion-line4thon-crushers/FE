import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { startSession, closeSession } from "../../services/roomService";
import {
  fetchTopSlideReport,
  fetchTopQuestionsReport,
  fetchTopStoredReport,
} from "../../services/aiReportService";
import websocketService from "../../services/websocketService";
import { createLogger } from "../../utils/logger";

const log = createLogger("header");

interface UseHeaderSessionActionParams {
  roomData: any;
  fileName: string;
  totalPages?: number;
}

/**
 * * Handles session start (prep → present) and session end (present → report).
 */
export const useHeaderSessionAction = ({
  roomData,
  fileName,
  totalPages,
}: UseHeaderSessionActionParams) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isPrep =
    location.pathname === "/rooms/new" ||
    location.pathname.endsWith("/prepare");
  const isPresenter = location.pathname.endsWith("/present");

  const [isSessionEnding, setIsSessionEnding] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [landingMessage, setLandingMessage] = useState("AI 리포트 생성 중 ...");

  const handleSessionAction = useCallback(async () => {
    if (isSessionEnding) return;

    if (isPrep) {
      if (!roomData?.roomId || !roomData?.deckId) {
        alert("⚠️ 방 정보가 아직 준비되지 않았습니다.");
        return;
      }

      try {
        await startSession(roomData.roomId);
        navigate(`/rooms/${roomData.roomId}/present`, {
          state: {
            fileName,
            roomId: roomData.roomId,
            deckId: roomData.deckId,
            totalPages: totalPages || 0,
          },
        });
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
          window.sessionStorage.setItem(
            "ai_report_room",
            JSON.stringify(nextState.roomData)
          );
        } catch {
          // ignore storage write errors
        }

        navigate(`/rooms/${resolvedRoomId}/report`, {
          replace: false,
          state: nextState,
        });
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
  }, [isSessionEnding, isPrep, isPresenter, roomData, fileName, totalPages, navigate, location.state]);

  return {
    isSessionEnding,
    showLandingPage,
    landingMessage,
    handleSessionAction,
  };
};
