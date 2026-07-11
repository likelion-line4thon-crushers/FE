import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { joinRoom, getRoomInfo } from "@/shared/api/room";
import { roomIdAtom, deckIdAtom, totalPagesAtom, wsUrlAtom } from "@/entities/room";
import {
  sessionStatusAtom,
  quickSettingsAtom,
  unlockSettingsAtom,
  revealedPageToIndex,
} from "@/entities/session";
import { audienceIdAtom, audienceTokenAtom } from "./store";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("join-room");

const parseSlideUnlock = (value: unknown, fallback = true) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value) === "true";
};

const parseOptionalNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Decode the JWT `exp` claim (seconds) without a library to check the audience
// token is still usable before reusing a durable identity. No exp → treat valid.
const isAudienceTokenValid = (token?: string): boolean => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload?.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

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

  // `changeCurrentSlide`'s identity churns whenever unlock/lock state changes (the presenter
  // advancing to a new max slide broadcasts an option/unlock event → isLockedTarget →
  // changeCurrentSlide). Keeping it in this join effect's deps made the one-time join/restore
  // re-run on every forward move, re-snapping the audience to the presenter and flipping
  // "발표자와 함께 보기" back on. Read it through a ref so the effect stays a once-per-room init.
  const changeCurrentSlideRef = useRef(changeCurrentSlide);
  changeCurrentSlideRef.current = changeCurrentSlide;

  useEffect(() => {
    if (!code) return;

    const storageKey = `boini_audience_${code}`;
    let storedData: any = null;

    // Durable per-browser identity: this tab's sessionStorage copy is cleared
    // after submitting feedback, but we keep a durable copy in localStorage. If a
    // re-join finds no working copy, rehydrate it (only while the token is still
    // valid) so the browser reuses the SAME audienceId instead of minting a new
    // one — which is what makes feedback dedupe effective per browser.
    try {
      if (!sessionStorage.getItem(storageKey)) {
        const durable = localStorage.getItem(storageKey);
        if (durable && isAudienceTokenValid(JSON.parse(durable).audienceToken)) {
          sessionStorage.setItem(storageKey, durable);
        }
      }
    } catch (_error) {
      // ignore
    }

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        storedData = JSON.parse(stored);
        if (storedData.audienceId && storedData.audienceToken) {
          log.log("Restoring audience info from sessionStorage");

          // Keep the durable copy in sync (covers identities created before this
          // durable-storage change existed).
          try {
            localStorage.setItem(storageKey, stored);
          } catch (_error) {
            // ignore
          }

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
            const maxPage = parseOptionalNumber(storedData.maxPage);
            const slideUnlock = parseSlideUnlock(storedData.slideUnlock);
            setUnlockSettings({
              maxRevealedPage: revealedPageToIndex(maxPage),
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
                    if (typeof changeCurrentSlideRef.current === "function") {
                      changeCurrentSlideRef.current(presenterIndex, {
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
                  const maxPage = parseOptionalNumber(roomInfo.maxPage);
                  const slideUnlock = parseSlideUnlock(roomInfo.slideUnlock);
                  setUnlockSettings({
                    maxRevealedPage: revealedPageToIndex(maxPage),
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
          const serialized = JSON.stringify(dataToStore);
          sessionStorage.setItem(storageKey, serialized);
          // Durable copy so a later re-join in this browser reuses this identity.
          localStorage.setItem(storageKey, serialized);
          log.log("Audience info saved to session/local storage");
        } catch (storageError) {
          log.warn("Storage write failed:", storageError);
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
          setQuickSettings((prev) => ({
            ...prev,
            sticker: String(joinData.sticker) === "true",
          }));
        if (joinData.question != null)
          setQuickSettings((prev) => ({
            ...prev,
            question: String(joinData.question) === "true",
          }));
        if (joinData.feedback != null)
          setQuickSettings((prev) => ({
            ...prev,
            feedback: String(joinData.feedback) === "true",
          }));

        const maxPage = parseOptionalNumber(joinData.maxPage);
        const slideUnlock = parseSlideUnlock(joinData.slideUnlock);
        setUnlockSettings({
          maxRevealedPage: revealedPageToIndex(maxPage),
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
    // `changeCurrentSlide` is intentionally omitted — read via changeCurrentSlideRef so this
    // stays a once-per-room init (see ref comment above).
    code,
    lastPresenterPageRef,
    setFollowPresenter,
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
