import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { usePostHog } from "@posthog/react";
import { ANALYTICS_EVENTS } from "@/shared/config/analytics-events";
import { joinRoom, getRoomInfo, persistAudienceJoin, normalizeWsUrl } from "@/shared/api/room";
import { readAudienceIdentity } from "@/shared/lib/audience-identity";
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
  const posthog = usePostHog();
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

    // Durable per-browser identity: this tab's sessionStorage copy is cleared after
    // submitting feedback, but a durable localStorage copy lets the browser reuse the
    // SAME audienceId instead of minting a new one — which is what makes feedback
    // dedupe effective per browser. (readAudienceIdentity handles the rehydration.)
    const storedData = readAudienceIdentity(code);
    if (storedData) {
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

    // No stored data — call joinRoom API
    const handleJoinRoom = async () => {
      try {
        const joinData = await joinRoom(code);

        // Store audience info in session/local storage (durable copy reuses identity)
        persistAudienceJoin(code, joinData);

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

        setWsUrl(normalizeWsUrl(joinData.wsUrl));
      } catch (err) {
        posthog?.capture(ANALYTICS_EVENTS.AUDIENCE_JOIN_FAILED, {
          join_code: code,
          error_message: err instanceof Error ? err.message : String(err),
        });
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
    posthog,
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
