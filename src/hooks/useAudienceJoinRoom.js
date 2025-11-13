import { useEffect, useRef } from "react";
import { joinRoom } from "../services/roomService";

const useAudienceJoinRoom = ({
  code,
  setRoomId,
  setAudienceId,
  setAudienceToken,
  setWsUrl,
  setDeckId,
  setTotalPages,
  setSessionStatus,
  setQuickSettings,
  setUnlockSettings,
  lastPresenterPageRef,
}) => {
  useEffect(() => {
    if (!code) return;

    const handleJoinRoom = async () => {
      try {
        const joinData = await joinRoom(code);

        window.roomId = joinData.roomId;
        window.audienceId = joinData.audienceId;
        window.audienceToken = joinData.audienceToken;

        setRoomId(joinData.roomId);
        setAudienceId(joinData.audienceId);
        setAudienceToken(joinData.audienceToken);

        if (joinData.deckId || joinData.deckID) {
          setDeckId(joinData.deckId || joinData.deckID);
        } else if (joinData.deck?.deckId) {
          setDeckId(joinData.deck.deckId);
        } else if (joinData.presentation?.deckId) {
          setDeckId(joinData.presentation.deckId);
        }

        if (joinData.totalPages !== undefined && joinData.totalPages !== null) {
          setTotalPages(Number(joinData.totalPages));
        } else if (joinData.deck?.totalPages) {
          setTotalPages(Number(joinData.deck.totalPages));
        } else if (joinData.presentation?.totalPages) {
          setTotalPages(Number(joinData.presentation.totalPages));
        }

        // 세션 상태 설정
        if (joinData.sessionStatus) {
          setSessionStatus(joinData.sessionStatus);
        } else {
          setSessionStatus("waiting");
        }

        if (joinData.currentPage) {
          const presenterPage = Number(joinData.currentPage);
          if (Number.isFinite(presenterPage) && presenterPage > 0) {
            lastPresenterPageRef.current = presenterPage;
          }
        }

        if (joinData.sticker !== undefined && joinData.sticker !== null) {
          setQuickSettings((prev) => ({
            ...prev,
            sticker: String(joinData.sticker) === "true",
          }));
        }
        if (joinData.question !== undefined && joinData.question !== null) {
          setQuickSettings((prev) => ({
            ...prev,
            question: String(joinData.question) === "true",
          }));
        }
        if (joinData.feedback !== undefined && joinData.feedback !== null) {
          setQuickSettings((prev) => ({
            ...prev,
            feedback: String(joinData.feedback) === "true",
          }));
        }

        const maxPage = joinData.maxPage ? Number(joinData.maxPage) : null;
        const slideUnlock = joinData.slideUnlock
          ? String(joinData.slideUnlock) === "true"
          : true;

        setUnlockSettings({
          maxRevealedPage: maxPage,
          revealAllSlides: slideUnlock,
          totalPages: joinData.totalPages ? Number(joinData.totalPages) : null,
          presenterPage: joinData.currentPage
            ? Number(joinData.currentPage)
            : null,
        });

        let wsUrlValue = joinData.wsUrl;

        if (!wsUrlValue) {
          const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
          wsUrlValue = `${apiBaseUrl}/ws/audience`;
        } else {
          if (wsUrlValue.includes(",")) {
            wsUrlValue = wsUrlValue.split(",")[0].trim();
          }

          if (!wsUrlValue.endsWith("/audience")) {
            wsUrlValue = wsUrlValue.replace(/\/ws\/?$/, "/ws/audience");
          }
        }

        setWsUrl(wsUrlValue);
      } catch (err) {
        alert("방 입장에 실패했습니다. 코드를 확인해주세요.");
      }
    };

    handleJoinRoom();
  }, [
    code,
    setRoomId,
    setAudienceId,
    setAudienceToken,
    setWsUrl,
    setDeckId,
    setTotalPages,
    setSessionStatus,
    setQuickSettings,
    setUnlockSettings,
    lastPresenterPageRef,
  ]);
};

export default useAudienceJoinRoom;
