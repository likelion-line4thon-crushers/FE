import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAtomValue, useSetAtom } from "jotai";
import websocketService from "@/shared/api/websocket";
import { roomIdAtom, wsUrlAtom, deckIdAtom } from "@/entities/room";
import {
  sessionStatusAtom,
  quickSettingsAtom,
  unlockSettingsAtom,
  revealedPageToIndex,
} from "@/entities/session";
import { audienceIdAtom, audienceTokenAtom } from "../room/store";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("audience-ws");

/**
 * ! Refactored to read room/session state from Jotai atoms.
 * Navigation-related params remain because they come from useAudienceSlideNavigation.
 */
const useAudienceWebSocketSubscriptions = ({
  questionTopics,
  handleIncomingQuestion,
  changeCurrentSlide,
  currentSlide,
  followPresenterRef,
  setFollowPresenter,
  lastPresenterPageRef,
  code,
  triggerFocusHighlight,
  applySlideReady,
}: {
  [key: string]: any;
}) => {
  const navigate = useNavigate();
  const { code: codeParam } = useParams();

  const roomId = useAtomValue(roomIdAtom);
  const audienceId = useAtomValue(audienceIdAtom);
  const audienceToken = useAtomValue(audienceTokenAtom);
  const wsUrl = useAtomValue(wsUrlAtom);
  const deckId = useAtomValue(deckIdAtom);
  const setSessionStatus = useSetAtom(sessionStatusAtom);
  const setQuickSettings = useSetAtom(quickSettingsAtom);
  const setUnlockSettings = useSetAtom(unlockSettingsAtom);

  const questionSubscriptionsRef = useRef<any[]>([]);
  const pageChangeUnsubscribeRef = useRef<(() => void) | null>(null);
  const focusOnUnsubscribeRef = useRef<(() => void) | null>(null);
  const optionUnsubscribeRef = useRef<(() => void) | null>(null);
  const unlockUnsubscribeRef = useRef<(() => void) | null>(null);
  const slideReadyUnsubscribeRef = useRef<(() => void) | null>(null);
  const hasNavigatedToRatingRef = useRef(false);
  const [isWebsocketReady, setIsWebsocketReady] = useState(false);

  // WebSocket connection
  useEffect(() => {
    if (!roomId || !audienceId || !wsUrl || !audienceToken) return undefined;

    setIsWebsocketReady(false);
    websocketService.connect(
      wsUrl,
      audienceToken,
      () => setIsWebsocketReady(true),
      () => setIsWebsocketReady(false)
    );

    return () => {
      setIsWebsocketReady(false);
      websocketService.disconnect();
    };
  }, [roomId, audienceId, wsUrl, audienceToken]);

  // WebSocket subscriptions
  useEffect(() => {
    questionSubscriptionsRef.current.forEach((unsub) => typeof unsub === "function" && unsub());
    questionSubscriptionsRef.current = [];
    pageChangeUnsubscribeRef.current?.();
    pageChangeUnsubscribeRef.current = null;

    if (!isWebsocketReady || !roomId) return undefined;

    // The websocket service uses a Map keyed by destination — only one handler per topic.
    // /topic/p/{roomId}/public carries both question events AND session state events,
    // so we route both through a single combined handler to avoid one overwriting the other.
    const handlePublic = (data: any) => {
      if (data?.type === "SESSION_STATE" && data.status) {
        log.log("Session state change:", data);
        setSessionStatus(data.status);
        if (
          (data.status === "ended" || data.status === "ENDED") &&
          !hasNavigatedToRatingRef.current
        ) {
          hasNavigatedToRatingRef.current = true;
          const targetCode = code || codeParam;
          const targetUrl = targetCode ? `/audience/${encodeURIComponent(targetCode)}/rating` : "/";
          navigate(targetUrl, { replace: false, state: { roomId, audienceId, deckId } });
        }
        return;
      }
      handleIncomingQuestion(data);
    };

    const topics = Array.isArray(questionTopics) ? questionTopics : [];
    topics.forEach((topic) => {
      const handler = topic === `/topic/p/${roomId}/public` ? handlePublic : handleIncomingQuestion;
      const unsub = websocketService.subscribe(topic, handler);
      if (typeof unsub === "function") questionSubscriptionsRef.current.push(unsub);
    });

    // Page change
    pageChangeUnsubscribeRef.current = websocketService.subscribe(
      `/topic/presentation/${roomId}/pageChange`,
      (data: any) => {
        if (!data || data.changedPage === undefined) return;
        const changedPageNumber = Number(data.changedPage);
        const newSlideIndex = Number.isFinite(changedPageNumber) ? changedPageNumber - 1 : NaN;
        if (Number.isFinite(newSlideIndex) && newSlideIndex >= 0) {
          lastPresenterPageRef.current = newSlideIndex;
        } else return;
        if (!followPresenterRef.current) return;
        changeCurrentSlide(newSlideIndex, {
          source: "presenter",
          broadcast: false,
          preserveFollowState: true,
        });
      }
    ) as unknown as (() => void) | null;

    // Option change
    optionUnsubscribeRef.current = websocketService.subscribe(
      `/topic/presentation/${roomId}/option`,
      (data: any) => {
        if (!data) return;
        const payload = data?.data ?? data;
        setQuickSettings((prev: any) => ({
          ...prev,
          sticker: String(payload?.sticker) === "true",
          question: String(payload?.question) === "true",
          feedback: String(payload?.feedback) === "true",
        }));
      }
    ) as unknown as (() => void) | null;

    // Unlock change
    unlockUnsubscribeRef.current = websocketService.subscribe(
      `/topic/presentation/${roomId}/option/unlock`,
      (data: any) => {
        if (!data) return;
        const payload = data?.data ?? data;
        const maxPage = Number(payload?.maxRevealedPage);
        const revealAll = String(payload?.revealAllSlides) === "true";
        const presenterPage = Number(payload?.presenterPage);
        if (Number.isFinite(presenterPage) && presenterPage > 0) {
          lastPresenterPageRef.current = presenterPage - 1;
        }
        setUnlockSettings({
          maxRevealedPage: revealedPageToIndex(maxPage),
          revealAllSlides: revealAll,
          totalPages: Number(payload?.totalPages),
          presenterPage,
        });
      }
    ) as unknown as (() => void) | null;

    // Session state is handled inside handlePublic above (combined with question events on /public).

    // Slide ready — audience receives pages live while PDF is being parsed
    slideReadyUnsubscribeRef.current = websocketService.subscribe(
      `/topic/presentation/${roomId}/slideReady`,
      (data: any) => {
        if (!data) return;
        const payload = data?.data ?? data;
        const idx = Number(payload?.pageIndex);
        const url = payload?.imageUrl;
        if (Number.isFinite(idx) && idx >= 0 && url && typeof applySlideReady === "function") {
          applySlideReady(idx, url);
        }
      }
    ) as unknown as (() => void) | null;

    return () => {
      questionSubscriptionsRef.current.forEach((unsub) => typeof unsub === "function" && unsub());
      questionSubscriptionsRef.current = [];
      pageChangeUnsubscribeRef.current?.();
      pageChangeUnsubscribeRef.current = null;
      optionUnsubscribeRef.current?.();
      optionUnsubscribeRef.current = null;
      unlockUnsubscribeRef.current?.();
      unlockUnsubscribeRef.current = null;
      slideReadyUnsubscribeRef.current?.();
      slideReadyUnsubscribeRef.current = null;
    };
  }, [
    isWebsocketReady,
    roomId,
    audienceId,
    deckId,
    handleIncomingQuestion,
    questionTopics,
    changeCurrentSlide,
    currentSlide,
    followPresenterRef,
    setFollowPresenter,
    lastPresenterPageRef,
    setSessionStatus,
    setQuickSettings,
    setUnlockSettings,
    code,
    codeParam,
    navigate,
    applySlideReady,
  ]);

  // FocusOn subscription
  useEffect(() => {
    focusOnUnsubscribeRef.current?.();
    focusOnUnsubscribeRef.current = null;

    if (!isWebsocketReady || !roomId || !websocketService.getIsConnected()) return undefined;

    const unsubscribe = websocketService.subscribeText(
      `/topic/presentation/${roomId}/focusOn`,
      (rawMessage) => {
        if (rawMessage == null) return;
        const trimmed = String(rawMessage).trim();
        if (!trimmed) return;

        let parsedPageNumber;
        try {
          parsedPageNumber = Number(JSON.parse(trimmed));
          if (!Number.isFinite(parsedPageNumber)) throw new Error("NaN");
        } catch {
          parsedPageNumber = Number(trimmed.replace(/^"+|"+$/g, ""));
        }

        if (!Number.isFinite(parsedPageNumber) || parsedPageNumber < 1) return;

        const parsedIndex = parsedPageNumber - 1;
        lastPresenterPageRef.current = parsedIndex;

        if (typeof setFollowPresenter === "function") setFollowPresenter(true);
        followPresenterRef.current = true;
        triggerFocusHighlight();
        changeCurrentSlide(parsedIndex, {
          source: "focusOn",
          broadcast: false,
          preserveFollowState: true,
        });
      }
    );

    focusOnUnsubscribeRef.current = unsubscribe as unknown as (() => void) | null;
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      focusOnUnsubscribeRef.current = null;
    };
  }, [
    isWebsocketReady,
    roomId,
    changeCurrentSlide,
    followPresenterRef,
    setFollowPresenter,
    lastPresenterPageRef,
    triggerFocusHighlight,
  ]);

  return { isWebsocketReady: isWebsocketReady && websocketService.getIsConnected() };
};

export default useAudienceWebSocketSubscriptions;
