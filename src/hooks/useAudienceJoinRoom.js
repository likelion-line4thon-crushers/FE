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

    // 세션 스토리지에서 기존 청중 정보 확인
    const storageKey = `boini_audience_${code}`;
    let storedData = null;
    
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        storedData = JSON.parse(stored);
        // audienceId와 audienceToken이 모두 존재하는지 확인
        if (storedData.audienceId && storedData.audienceToken) {
          console.log("[useAudienceJoinRoom] 기존 청중 정보 복원 (재호출 방지)");
          
          // 세션 스토리지에서 복원
          window.roomId = storedData.roomId;
          window.audienceId = storedData.audienceId;
          window.audienceToken = storedData.audienceToken;

          setRoomId(storedData.roomId);
          setAudienceId(storedData.audienceId);
          setAudienceToken(storedData.audienceToken);

          if (storedData.deckId) {
            setDeckId(storedData.deckId);
          }
          if (storedData.totalPages !== undefined && storedData.totalPages !== null) {
            setTotalPages(Number(storedData.totalPages));
          }
          if (storedData.sessionStatus) {
            setSessionStatus(storedData.sessionStatus);
          } else {
            setSessionStatus("waiting");
          }
          if (storedData.currentPage) {
            const presenterPage = Number(storedData.currentPage);
            if (Number.isFinite(presenterPage) && presenterPage > 0) {
              lastPresenterPageRef.current = presenterPage;
            }
          }
          if (storedData.sticker !== undefined && storedData.sticker !== null) {
            setQuickSettings((prev) => ({
              ...prev,
              sticker: String(storedData.sticker) === "true",
            }));
          }
          if (storedData.question !== undefined && storedData.question !== null) {
            setQuickSettings((prev) => ({
              ...prev,
              question: String(storedData.question) === "true",
            }));
          }
          if (storedData.feedback !== undefined && storedData.feedback !== null) {
            setQuickSettings((prev) => ({
              ...prev,
              feedback: String(storedData.feedback) === "true",
            }));
          }
          if (storedData.maxPage !== undefined || storedData.slideUnlock !== undefined) {
            const maxPage = storedData.maxPage ? Number(storedData.maxPage) : null;
            const slideUnlock = storedData.slideUnlock
              ? String(storedData.slideUnlock) === "true"
              : true;

            setUnlockSettings({
              maxRevealedPage: maxPage,
              revealAllSlides: slideUnlock,
              totalPages: storedData.totalPages ? Number(storedData.totalPages) : null,
              presenterPage: storedData.currentPage
                ? Number(storedData.currentPage)
                : null,
            });
          }
          if (storedData.wsUrl) {
            setWsUrl(storedData.wsUrl);
          }
          
          // 기존 정보가 있으면 API 호출하지 않고 종료
          // currentPage는 WebSocket을 통해 실시간으로 업데이트됨
          return;
        }
      }
    } catch (_error) {
      // 세션 스토리지 읽기 실패 시 무시하고 API 호출 진행
      console.warn("[useAudienceJoinRoom] 세션 스토리지 읽기 실패, API 호출 진행");
    }

    // 세션 스토리지에 정보가 없으면 API 호출
    const handleJoinRoom = async () => {
      try {
        const joinData = await joinRoom(code);

        window.roomId = joinData.roomId;
        window.audienceId = joinData.audienceId;
        window.audienceToken = joinData.audienceToken;

        // 세션 스토리지에 청중 정보 저장
        try {
          const dataToStore = {
            roomId: joinData.roomId,
            audienceId: joinData.audienceId,
            audienceToken: joinData.audienceToken,
            deckId: joinData.deckId || joinData.deckID || joinData.deck?.deckId || joinData.presentation?.deckId,
            totalPages: joinData.totalPages || joinData.deck?.totalPages || joinData.presentation?.totalPages,
            sessionStatus: joinData.sessionStatus || "waiting",
            currentPage: joinData.currentPage,
            sticker: joinData.sticker,
            question: joinData.question,
            feedback: joinData.feedback,
            maxPage: joinData.maxPage,
            slideUnlock: joinData.slideUnlock,
            wsUrl: (() => {
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
              return wsUrlValue;
            })(),
          };
          sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
          console.log("[useAudienceJoinRoom] 청중 정보를 세션 스토리지에 저장");
        } catch (storageError) {
          console.warn("[useAudienceJoinRoom] 세션 스토리지 저장 실패:", storageError);
        }

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
