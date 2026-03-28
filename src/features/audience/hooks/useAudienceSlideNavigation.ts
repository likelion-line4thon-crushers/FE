import { useState, useCallback, useRef, useEffect } from "react";
import websocketService from "../../../services/websocketService";

const useAudienceSlideNavigation = ({
  code,
  slideCount,
  roomId,
  audienceId,
  lastPresenterPageRef,
}: { code?: any; slideCount?: any; roomId?: any; audienceId?: any; lastPresenterPageRef?: any }) => {
  const getInitialSlide = () => {
    if (!code) return 0;
    try {
      const storageKey = `boini_audience_${code}`;
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const storedData = JSON.parse(stored);
        if (storedData.currentPage) {
          const presenterPage = Number(storedData.currentPage);
          if (Number.isFinite(presenterPage) && presenterPage > 0) {
            return presenterPage - 1; // 페이지 번호를 인덱스로 변환
          }
        }
      }
    } catch (_error) {}
    return 0;
  };

  const [currentSlide, setCurrentSlide] = useState(getInitialSlide);
  const [followPresenter, setFollowPresenter] = useState(true);
  const followPresenterRef = useRef(followPresenter);
  const initialSlide = getInitialSlide();
  const prevSlideRef = useRef(initialSlide);

  useEffect(() => {
    followPresenterRef.current = followPresenter;
  }, [followPresenter]);

  const changeCurrentSlide = useCallback(
    (
      nextIndex: any,
      {
        source = "audience",
        broadcast = true,
        preserveFollowState = false,
      }: any = {}
    ) => {
      setCurrentSlide((prev) => {
        if (!Number.isFinite(nextIndex)) {
          return prev;
        }

        const maxIndex = Math.max(slideCount - 1, 0);
        const clamped = Math.min(Math.max(nextIndex, 0), maxIndex);

        if (clamped === prev) {
          return prev;
        }

        // 모든 청중 페이지 변경을 백엔드로 전송 (동기화 포함)
        if (roomId && audienceId && websocketService.getIsConnected()) {
          const beforePage = prev + 1;
          const changedPage = clamped + 1;

          websocketService.sendAudiencePageChange(
            roomId,
            audienceId,
            beforePage,
            changedPage
          );
        }

        prevSlideRef.current = clamped;
        return clamped;
      });

      if (!preserveFollowState && source !== "presenter") {
        setFollowPresenter(false);
      }
    },
    [slideCount, roomId, audienceId]
  );

  const handleToggleFollowPresenter = useCallback(
    (checked: any) => {
      setFollowPresenter(checked);

      if (checked) {
        const target = Number.isFinite(lastPresenterPageRef.current)
          ? lastPresenterPageRef.current
          : prevSlideRef.current;

        changeCurrentSlide(target, {
          source: "presenter",
          broadcast: false,
          preserveFollowState: true,
        });
      }
    },
    [changeCurrentSlide, lastPresenterPageRef, prevSlideRef, setFollowPresenter]
  );

  const handleAudienceSelectSlide = useCallback(
    (slideIndex: any, options?: any) => {
      changeCurrentSlide(slideIndex, { source: "audience", ...options });
    },
    [changeCurrentSlide]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        // 이전 슬라이드
        changeCurrentSlide(currentSlide - 1, { source: "audience" });
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        // 다음 슬라이드
        changeCurrentSlide(currentSlide + 1, { source: "audience" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlide, changeCurrentSlide]);

  return {
    currentSlide,
    setCurrentSlide,
    followPresenter,
    setFollowPresenter,
    followPresenterRef,
    prevSlideRef,
    changeCurrentSlide,
    handleToggleFollowPresenter,
    handleAudienceSelectSlide,
  };
};

export default useAudienceSlideNavigation;
