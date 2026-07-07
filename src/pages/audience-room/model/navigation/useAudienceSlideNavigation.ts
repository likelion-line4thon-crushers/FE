import { useState, useCallback, useRef, useEffect } from "react";
import { useAtomValue } from "jotai";
import websocketService from "@/shared/api/websocket";
import { unlockSettingsAtom } from "@/entities/session";

const useAudienceSlideNavigation = ({
  code,
  slideCount,
  roomId,
  audienceId,
  lastPresenterPageRef,
}: {
  code?: any;
  slideCount?: any;
  roomId?: any;
  audienceId?: any;
  lastPresenterPageRef?: any;
}) => {
  const unlockSettings = useAtomValue(unlockSettingsAtom);

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

  const isLockedTarget = useCallback(
    (nextIndex: number) => {
      if (unlockSettings.revealAllSlides) {
        return false;
      }

      const maxRevealedPage = unlockSettings.maxRevealedPage;
      if (maxRevealedPage === null || !Number.isFinite(maxRevealedPage)) {
        return false;
      }

      // 발표자가 보여준(이동한) 슬라이드까지는 공개된 것으로 취급한다.
      // 미공개 상태에서 발표자가 슬라이드를 건너뛰어 이동하면 maxRevealedPage 가
      // 아직 따라오지 못해, 그 구간을 오갈 수 없는 문제를 방지. (사이드바 잠금 로직과 정렬)
      const presenterDrivenIndex = Number.isFinite(lastPresenterPageRef?.current)
        ? lastPresenterPageRef.current
        : -1;
      const revealedBoundaryIndex = Math.max(maxRevealedPage, presenterDrivenIndex);

      return nextIndex > revealedBoundaryIndex;
    },
    [unlockSettings.maxRevealedPage, unlockSettings.revealAllSlides, lastPresenterPageRef]
  );

  const changeCurrentSlide = useCallback(
    (
      nextIndex: any,
      { source = "audience", broadcast = true, preserveFollowState = false }: any = {}
    ) => {
      if (!Number.isFinite(nextIndex)) {
        return;
      }

      const clampedNextIndex = Math.min(Math.max(nextIndex, 0), Math.max(slideCount - 1, 0));
      const isPresenterDriven = source === "presenter" || source === "focusOn";

      if (!isPresenterDriven && isLockedTarget(clampedNextIndex)) {
        return;
      }

      setCurrentSlide((prev) => {
        const maxIndex = Math.max(slideCount - 1, 0);
        const clamped = Math.min(Math.max(nextIndex, 0), maxIndex);

        if (clamped === prev) {
          return prev;
        }

        if (broadcast && roomId && audienceId && websocketService.getIsConnected()) {
          const beforePage = prev + 1;
          const changedPage = clamped + 1;

          websocketService.sendAudiencePageChange(roomId, audienceId, beforePage, changedPage);
        }

        prevSlideRef.current = clamped;
        return clamped;
      });

      if (!preserveFollowState && !isPresenterDriven) {
        setFollowPresenter(false);
      }
    },
    [slideCount, roomId, audienceId, isLockedTarget]
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
