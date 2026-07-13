import { useState, useCallback, useRef, useEffect } from "react";
import { useAtomValue } from "jotai";
import { usePostHog } from "@posthog/react";
import { ANALYTICS_EVENTS } from "@/shared/config/analytics-events";
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
  const posthog = usePostHog();

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
        // 사용자 주도 이탈(팔로우 true→false 전환)만 계측 — focusOn 소환이나 공개 경계
        // 복귀 같은 강제 전환은 세지 않아 returned_to_live/browsed_away가 부풀지 않는다.
        if (followPresenterRef.current) {
          followPresenterRef.current = false;
          posthog?.capture(ANALYTICS_EVENTS.AUDIENCE_BROWSED_AWAY, {
            room_id: roomId,
            slide_index: clampedNextIndex,
            presenter_slide_index: lastPresenterPageRef?.current,
          });
        }
        setFollowPresenter(false);
      }
    },
    [slideCount, roomId, audienceId, isLockedTarget, posthog, lastPresenterPageRef]
  );

  const handleToggleFollowPresenter = useCallback(
    (checked: any) => {
      if (Boolean(checked) !== followPresenterRef.current) {
        followPresenterRef.current = Boolean(checked);
        posthog?.capture(checked ? ANALYTICS_EVENTS.AUDIENCE_RETURNED_TO_LIVE : ANALYTICS_EVENTS.AUDIENCE_BROWSED_AWAY, {
          room_id: roomId,
          slide_index: prevSlideRef.current,
          presenter_slide_index: lastPresenterPageRef?.current,
        });
      }
      setFollowPresenter(checked);

      if (checked) {
        // Require >= 0: a bare Number.isFinite check lets a -1 sentinel through and clamps
        // the audience to slide 0 instead of the presenter's current page.
        const target =
          Number.isFinite(lastPresenterPageRef.current) && lastPresenterPageRef.current >= 0
            ? lastPresenterPageRef.current
            : prevSlideRef.current;

        changeCurrentSlide(target, {
          source: "presenter",
          broadcast: false,
          preserveFollowState: true,
        });
      }
    },
    [changeCurrentSlide, lastPresenterPageRef, prevSlideRef, setFollowPresenter, posthog, roomId]
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

  // 공개(다음 구간 공개하기)가 켜져 있을 때 발표자보다 앞서가 보던 청중은, 발표자가 공개를 끄는
  // 순간 공개 경계 밖 슬라이드에 "갇힌다" — 인접 슬라이드도 전부 잠겨 키보드/이전·다음 이동이
  // 모두 막히고, 발표자가 그 지점을 지날 때까지 되돌아올 수 없다. 이때 발표자의 현재 페이지로
  // 데려와 갇힘만 푼다(follow 는 강제로 켜지 않아, 공개된 구간을 자유롭게 다시 둘러볼 수 있다).
  useEffect(() => {
    if (unlockSettings.revealAllSlides || unlockSettings.maxRevealedPage == null) return;

    const presenterIdx = lastPresenterPageRef?.current;
    const boundary = Math.max(
      unlockSettings.maxRevealedPage,
      Number.isFinite(presenterIdx) ? presenterIdx : -1
    );
    if (!Number.isFinite(currentSlide) || currentSlide <= boundary) return;

    const target = Number.isFinite(presenterIdx) && presenterIdx >= 0 ? presenterIdx : boundary;
    changeCurrentSlide(target, {
      source: "presenter",
      broadcast: false,
      preserveFollowState: true,
    });
  }, [
    unlockSettings.revealAllSlides,
    unlockSettings.maxRevealedPage,
    currentSlide,
    changeCurrentSlide,
    lastPresenterPageRef,
  ]);

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
