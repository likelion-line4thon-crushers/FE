import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import websocketService from "../services/websocketService";

const useAudienceWebSocketSubscriptions = ({
  roomId,
  audienceId,
  wsUrl,
  audienceToken,
  questionTopics,
  handleIncomingQuestion,
  changeCurrentSlide,
  currentSlide,
  followPresenterRef,
  setFollowPresenter,
  lastPresenterPageRef,
  setSessionStatus,
  setQuickSettings,
  setUnlockSettings,
  code,
  deckId,
  triggerFocusHighlight,
}) => {
  const navigate = useNavigate();
  const { code: codeParam } = useParams();
  const questionSubscriptionsRef = useRef([]);
  const pageChangeUnsubscribeRef = useRef(null);
  const focusOnUnsubscribeRef = useRef(null);
  const optionUnsubscribeRef = useRef(null);
  const unlockUnsubscribeRef = useRef(null);
  const sessionStateUnsubscribeRef = useRef(null);
  const hasNavigatedToRatingRef = useRef(false);
  const [isWebsocketReady, setIsWebsocketReady] = useState(false);

  // WebSocket 연결
  useEffect(() => {
    if (!roomId || !audienceId || !wsUrl || !audienceToken) {
      return undefined;
    }

    setIsWebsocketReady(false);

    const onConnect = () => {
      setIsWebsocketReady(true);
    };

    const onError = () => {
      setIsWebsocketReady(false);
    };

    websocketService.connect(wsUrl, audienceToken, onConnect, onError);

    return () => {
      setIsWebsocketReady(false);
      websocketService.disconnect();
    };
  }, [roomId, audienceId, wsUrl, audienceToken]);

  // WebSocket 구독 관리
  useEffect(() => {
    questionSubscriptionsRef.current.forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
    questionSubscriptionsRef.current = [];

    pageChangeUnsubscribeRef.current?.();
    pageChangeUnsubscribeRef.current = null;

    if (!isWebsocketReady || !roomId) {
      return undefined;
    }

    const topics = Array.isArray(questionTopics) ? questionTopics : [];

    topics.forEach((topic) => {
      const unsubscribe = websocketService.subscribe(
        topic,
        handleIncomingQuestion
      );
      if (typeof unsubscribe === "function") {
        questionSubscriptionsRef.current.push(unsubscribe);
      }
    });

    const pageChangeTopic = `/topic/presentation/${roomId}/pageChange`;
    pageChangeUnsubscribeRef.current = websocketService.subscribe(
      pageChangeTopic,
      (data) => {
        if (!data || data.changedPage === undefined) {
          return;
        }

        const newSlideIndex = Number(data.changedPage);
        if (Number.isFinite(newSlideIndex)) {
          lastPresenterPageRef.current = newSlideIndex;
        }

        if (!followPresenterRef.current) {
          return;
        }

        changeCurrentSlide(newSlideIndex, {
          source: "presenter",
          broadcast: false,
          preserveFollowState: true,
        });
      }
    );

    // 🔹 옵션 변경 구독 (리액션 스티커, 질문, 실시간 피드백)
    const optionTopic = `/topic/presentation/${roomId}/option`;
    optionUnsubscribeRef.current = websocketService.subscribe(
      optionTopic,
      (data) => {
        if (data) {
          const payload = data?.data ?? data;
          const normalized = {
            sticker: String(payload?.sticker) === "true",
            question: String(payload?.question) === "true",
            feedback: String(payload?.feedback) === "true",
          };

          setQuickSettings(normalized);
        }
      }
    );

    //  다음 슬라이드 공개 옵션 구독
    const unlockTopic = `/topic/presentation/${roomId}/option/unlock`;
    unlockUnsubscribeRef.current = websocketService.subscribe(
      unlockTopic,
      (data) => {
        if (data) {
          const payload = data?.data ?? data;
          const maxPage = Number(payload?.maxRevealedPage);
          const revealAll = String(payload?.revealAllSlides) === "true";
          const presenterPage = Number(payload?.presenterPage);

          setUnlockSettings({
            maxRevealedPage: maxPage,
            revealAllSlides: revealAll,
            totalPages: Number(payload?.totalPages),
            presenterPage,
          });
        }
      }
    );

    // 세션 상태 변경 구독
    const sessionStateTopic = `/topic/p/${roomId}/public`;
    sessionStateUnsubscribeRef.current = websocketService.subscribe(
      sessionStateTopic,
      (data) => {
        console.log("[AudienceView] 세션 상태 변경 수신:", data);
        if (data && data.type === "SESSION_STATE" && data.status) {
          setSessionStatus(data.status);
          // 세션 종료 상태 확인
          if (data.status === "ended" || data.status === "ENDED") {
            console.log(
              "[AudienceView] 세션 종료 상태 확인 - rating 페이지로 이동"
            );
            if (!hasNavigatedToRatingRef.current) {
              hasNavigatedToRatingRef.current = true;
              const targetCode = code || codeParam;
              const targetUrl = targetCode
                ? `/rating/${encodeURIComponent(targetCode)}`
                : "/rating";
              navigate(targetUrl, {
                replace: false,
                state: {
                  roomId: roomId,
                  audienceId: audienceId,
                  deckId: deckId,
                },
              });
            }
          }
        }
      }
    );

    return () => {
      questionSubscriptionsRef.current.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
      questionSubscriptionsRef.current = [];

      pageChangeUnsubscribeRef.current?.();
      pageChangeUnsubscribeRef.current = null;

      optionUnsubscribeRef.current?.();
      optionUnsubscribeRef.current = null;

      unlockUnsubscribeRef.current?.();
      unlockUnsubscribeRef.current = null;

      sessionStateUnsubscribeRef.current?.();
      sessionStateUnsubscribeRef.current = null;
    };
  }, [
    isWebsocketReady,
    roomId,
    audienceId,
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
    deckId,
  ]);

  // focusOn 구독
  useEffect(() => {
    focusOnUnsubscribeRef.current?.();
    focusOnUnsubscribeRef.current = null;

    if (!isWebsocketReady || !roomId || !websocketService.getIsConnected()) {
      return undefined;
    }

    const topic = `/topic/presentation/${roomId}/focusOn`;
    const unsubscribe = websocketService.subscribeText(topic, (rawMessage) => {
      if (rawMessage == null) {
        return;
      }

      const trimmed = String(rawMessage).trim();
      if (!trimmed) {
        return;
      }

      let parsedNumber;
      try {
        parsedNumber = Number(JSON.parse(trimmed));
        if (!Number.isFinite(parsedNumber)) {
          throw new Error("NaN");
        }
      } catch (error) {
        parsedNumber = Number(trimmed.replace(/^"+|"+$/g, ""));
      }

      if (!Number.isFinite(parsedNumber) || parsedNumber < 0) {
        return;
      }

      lastPresenterPageRef.current = parsedNumber;

      // 집중유도 신호 수신 시 '발표자와 함께보기' 강제 활성화
      if (typeof setFollowPresenter === "function") {
        setFollowPresenter(true);
      }
      followPresenterRef.current = true;

      triggerFocusHighlight();

      changeCurrentSlide(parsedNumber, {
        source: "focusOn",
        broadcast: true,
        preserveFollowState: true,
      });
    });

    focusOnUnsubscribeRef.current = unsubscribe;

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
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

  return {
    isWebsocketReady: isWebsocketReady && websocketService.getIsConnected(),
  };
};

export default useAudienceWebSocketSubscriptions;
