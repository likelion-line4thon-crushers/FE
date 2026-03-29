import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { joinRoom, getRoomInfo } from "@/shared/api/room";
import { roomIdAtom, deckIdAtom, totalPagesAtom, wsUrlAtom } from "@/entities/room";
import { sessionStatusAtom, quickSettingsAtom, unlockSettingsAtom } from "@/entities/session";
import { audienceIdAtom, audienceTokenAtom } from "./store";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("join-room");

/**
 * ! Refactored to use Jotai atoms — no more setter params.
 * Only `lastPresenterPageRef`, `setFollowPresenter`, `changeCurrentSlide` remain as params
 * because they come from useAudienceSlideNavigation (tightly coupled with refs/WS sends).
 */
const useAudienceJoinRoom = ({
  code,
  lastPresenterPageRef,
  setFollowPresenter,
  changeCurrentSlide,
}: {
  code?: any;
  lastPresenterPageRef?: any;
  setFollowPresenter?: any;
  changeCurrentSlide?: any;
}) => {
  const setRoomId = useSetAtom(roomIdAtom);
  const setAudienceId = useSetAtom(audienceIdAtom);
  const setAudienceToken = useSetAtom(audienceTokenAtom);
  const setWsUrl = useSetAtom(wsUrlAtom);
  const setDeckId = useSetAtom(deckIdAtom);
  const setTotalPages = useSetAtom(totalPagesAtom);
  const setSessionStatus = useSetAtom(sessionStatusAtom);
  const setQuickSettings = useSetAtom(quickSettingsAtom);
  const setUnlockSettings = useSetAtom(unlockSettingsAtom);

  useEffect(() => {
    if (!code) return;

    const storageKey = `boini_audience_${code}`;
    let storedData: any = null;

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        storedData = JSON.parse(stored);
        if (storedData.audienceId && storedData.audienceToken) {
          log.log("Restoring audience info from sessionStorage");

          setRoomId(storedData.roomId);
          setAudienceId(storedData.audienceId);
          setAudienceToken(storedData.audienceToken);

          if (storedData.deckId) setDeckId(storedData.deckId);
          if (storedData.totalPages != null) setTotalPages(Number(storedData.totalPages));
          setSessionStatus(storedData.sessionStatus || "waiting");

          if (storedData.currentPage) {
            const presenterPage = Number(storedData.currentPage);
            if (Number.isFinite(presenterPage) && presenterPage > 0) {
              lastPresenterPageRef.current = presenterPage - 1;
            }
          }

          if (storedData.sticker != null) {
            setQuickSettings((prev) => ({
              ...prev,
              sticker: String(storedData.sticker) === "true",
            }));
          }
          if (storedData.question != null) {
            setQuickSettings((prev) => ({
              ...prev,
              question: String(storedData.question) === "true",
            }));
          }
          if (storedData.feedback != null) {
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
              presenterPage: storedData.currentPage ? Number(storedData.currentPage) : null,
            });
          }

          if (storedData.wsUrl) setWsUrl(storedData.wsUrl);

          // Sync latest room info on refresh
          if (storedData.roomId) {
            const syncRoomInfo = async () => {
              try {
                const roomInfo = await getRoomInfo(storedData.roomId);
                log.log("Room info synced on refresh", roomInfo);

                if (roomInfo.currentPage) {
                  const presenterPage = Number(roomInfo.currentPage);
                  if (Number.isFinite(presenterPage) && presenterPage > 0) {
                    const presenterIndex = presenterPage - 1;
                    lastPresenterPageRef.current = presenterIndex;
                    if (changeCurrentSlide && typeof changeCurrentSlide === "function") {
                      changeCurrentSlide(presenterIndex, {
                        source: "presenter",
                        broadcast: false,
                        preserveFollowState: true,
                      });
                    }
                    if (setFollowPresenter && typeof setFollowPresenter === "function") {
                      setFollowPresenter(true);
                    }
                  }
                }

                if (roomInfo.sticker != null)
                  setQuickSettings((prev) => ({
                    ...prev,
                    sticker: String(roomInfo.sticker) === "true",
                  }));
                if (roomInfo.question != null)
                  setQuickSettings((prev) => ({
                    ...prev,
                    question: String(roomInfo.question) === "true",
                  }));
                if (roomInfo.feedback != null)
                  setQuickSettings((prev) => ({
                    ...prev,
                    feedback: String(roomInfo.feedback) === "true",
                  }));

                if (roomInfo.maxPage !== undefined || roomInfo.slideUnlock !== undefined) {
                  const maxPage = roomInfo.maxPage ? Number(roomInfo.maxPage) : null;
                  const slideUnlock = roomInfo.slideUnlock
                    ? String(roomInfo.slideUnlock) === "true"
                    : true;
                  setUnlockSettings({
                    maxRevealedPage: maxPage,
                    revealAllSlides: slideUnlock,
                    totalPages: roomInfo.totalPages ? Number(roomInfo.totalPages) : null,
                    presenterPage: roomInfo.currentPage ? Number(roomInfo.currentPage) : null,
                  });
                }

                if (roomInfo.sessionStatus) setSessionStatus(roomInfo.sessionStatus);
              } catch (error) {
                log.warn("Room info sync failed:", error);
              }
            };
            syncRoomInfo();
          }

          return;
        }
      }
    } catch (_error) {
      log.warn("SessionStorage read failed, proceeding with API call");
    }

    // No stored data — call joinRoom API
    const handleJoinRoom = async () => {
      try {
        const joinData = await joinRoom(code);

        // Store audience info in sessionStorage
        try {
          const dataToStore = {
            roomId: joinData.roomId,
            audienceId: joinData.audienceId,
            audienceToken: joinData.audienceToken,
            deckId:
              joinData.deckId ||
              joinData.deckID ||
              joinData.deck?.deckId ||
              joinData.presentation?.deckId,
            totalPages:
              joinData.totalPages || joinData.deck?.totalPages || joinData.presentation?.totalPages,
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
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
                wsUrlValue = `${apiBaseUrl}/ws/audience`;
              } else {
                if (wsUrlValue.includes(",")) wsUrlValue = wsUrlValue.split(",")[0].trim();
                if (!wsUrlValue.endsWith("/audience"))
                  wsUrlValue = wsUrlValue.replace(/\/ws\/?$/, "/ws/audience");
              }
              return wsUrlValue;
            })(),
          };
          sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
          log.log("Audience info saved to sessionStorage");
        } catch (storageError) {
          log.warn("SessionStorage write failed:", storageError);
        }

        setRoomId(joinData.roomId);
        setAudienceId(joinData.audienceId);
        setAudienceToken(joinData.audienceToken);

        const resolvedDeckId =
          joinData.deckId ||
          joinData.deckID ||
          joinData.deck?.deckId ||
          joinData.presentation?.deckId;
        if (resolvedDeckId) setDeckId(resolvedDeckId);

        const resolvedTotalPages =
          joinData.totalPages || joinData.deck?.totalPages || joinData.presentation?.totalPages;
        if (resolvedTotalPages != null) setTotalPages(Number(resolvedTotalPages));

        setSessionStatus(joinData.sessionStatus || "waiting");

        if (joinData.currentPage) {
          const presenterPage = Number(joinData.currentPage);
          if (Number.isFinite(presenterPage) && presenterPage > 0) {
            lastPresenterPageRef.current = presenterPage - 1;
          }
        }

        if (joinData.sticker != null)
          setQuickSettings((prev) => ({ ...prev, sticker: String(joinData.sticker) === "true" }));
        if (joinData.question != null)
          setQuickSettings((prev) => ({ ...prev, question: String(joinData.question) === "true" }));
        if (joinData.feedback != null)
          setQuickSettings((prev) => ({ ...prev, feedback: String(joinData.feedback) === "true" }));

        const maxPage = joinData.maxPage ? Number(joinData.maxPage) : null;
        const slideUnlock = joinData.slideUnlock ? String(joinData.slideUnlock) === "true" : true;
        setUnlockSettings({
          maxRevealedPage: maxPage,
          revealAllSlides: slideUnlock,
          totalPages: joinData.totalPages ? Number(joinData.totalPages) : null,
          presenterPage: joinData.currentPage ? Number(joinData.currentPage) : null,
        });

        let wsUrlValue = joinData.wsUrl;
        if (!wsUrlValue) {
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
          wsUrlValue = `${apiBaseUrl}/ws/audience`;
        } else {
          if (wsUrlValue.includes(",")) wsUrlValue = wsUrlValue.split(",")[0].trim();
          if (!wsUrlValue.endsWith("/audience"))
            wsUrlValue = wsUrlValue.replace(/\/ws\/?$/, "/ws/audience");
        }
        setWsUrl(wsUrlValue);
      } catch (err) {
        alert("방 입장에 실패했습니다. 코드를 확인해주세요.");
      }
    };

    handleJoinRoom();
  }, [
    code,
    lastPresenterPageRef,
    setFollowPresenter,
    changeCurrentSlide,
    setRoomId,
    setAudienceId,
    setAudienceToken,
    setWsUrl,
    setDeckId,
    setTotalPages,
    setSessionStatus,
    setQuickSettings,
    setUnlockSettings,
  ]);
};

export default useAudienceJoinRoom;
