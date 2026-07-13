import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, SyntheticEvent } from "react";
import { usePostHog } from "@posthog/react";
import { ANALYTICS_EVENTS, ANALYTICS_GROUP_SESSION } from "@/shared/config/analytics-events";
import {
  slideContentFractions,
  stampBoxStyle,
  imageNaturalRatio,
  SLIDE_BOX_ASPECT,
} from "@/shared/lib/slide-geometry";
import { useElementAspectRatio } from "@/shared/lib/use-element-aspect-ratio";
import { useParams } from "react-router";
import {
  getBroadcastChannelName,
  type BroadcastMessage,
  type BroadcastStamp,
  type NavDirection,
} from "@/shared/lib/broadcast";
import {
  Screen,
  Stage,
  SlideImage,
  BroadcastStampImage,
  Placeholder,
  FullscreenHint,
  BottomControls,
  ArrowButton,
} from "./BroadcastScreenPage.styles";

/** 전체화면 컨트롤 자동 숨김까지의 유휴 시간 — 청중 전체화면 동작과 동일한 패턴. */
const CONTROLS_IDLE_MS = 2500;

// Figma "하단 인디케이터 영역"의 좌우 화살표 (currentColor 로 렌더).
const ChevronLeft = () => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path
      d="M25 30L15 20L25 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path
      d="M15 10L25 20L15 30"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Projector view. Rendered bare (no app chrome) on the external display and
 * mirrors the presenter's current slide over a same-origin BroadcastChannel.
 *
 * Navigation intent (click / spacebar / arrows / PageUp-Down, e.g. from a laser
 * pointer clicker) is forwarded to the presenter window, which owns slide state
 * and re-broadcasts the result. This keeps a single source of truth so the live
 * audience stays in sync.
 */
const BroadcastScreenPage = () => {
  const { roomId } = useParams();
  const posthog = usePostHog();
  const [slides, setSlides] = useState<(string | null)[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [stamps, setStamps] = useState<BroadcastStamp[]>([]);
  const [showStamps, setShowStamps] = useState(false);
  const [slideNaturalRatio, setSlideNaturalRatio] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stageRatio = useElementAspectRatio(stageRef);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const controlsTimerRef = useRef<number | null>(null);
  // Stable id so the presenter can count this window via presence heartbeats.
  const screenIdRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `screen-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    if (!roomId) return;
    posthog?.capture(ANALYTICS_EVENTS.BROADCAST_SCREEN_OPENED, { room_id: roomId });
    posthog?.group(ANALYTICS_GROUP_SESSION, roomId);
  }, [roomId, posthog]);

  // Subscribe to the presenter and pull the current slide on mount.
  useEffect(() => {
    if (!roomId || typeof BroadcastChannel === "undefined") return undefined;

    const channel = new BroadcastChannel(getBroadcastChannelName(roomId));
    channelRef.current = channel;
    let received = false;

    const screenId = screenIdRef.current;
    const announceOpen = () =>
      channel.postMessage({ type: "screen-open", id: screenId } satisfies BroadcastMessage);
    const announceClose = () =>
      channel.postMessage({ type: "screen-close", id: screenId } satisfies BroadcastMessage);

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      if (event.data?.type === "slide") {
        received = true;
        setSlides(event.data.slides);
        setSlideIndex(event.data.slideIndex);
        setStamps(event.data.stamps ?? []);
        setShowStamps(Boolean(event.data.showStamps));
      } else if (event.data?.type === "screen-rollcall") {
        // A (re)mounted presenter is asking who's open — re-announce.
        announceOpen();
      }
    };

    // Ask for current state; retry a few times in case the presenter's
    // listener attaches slightly later.
    const requestState = () => channel.postMessage({ type: "request" } satisfies BroadcastMessage);
    requestState();
    const retry = window.setInterval(() => {
      if (received) {
        window.clearInterval(retry);
        return;
      }
      requestState();
    }, 400);
    const stopRetry = window.setTimeout(() => window.clearInterval(retry), 4000);

    // Announce presence once on mount; tell the presenter when we go away.
    // `pagehide` is the reliable teardown signal (tab close, navigation, bfcache);
    // `pageshow` with `persisted` covers a bfcache restore.
    announceOpen();
    const onPageHide = () => announceClose();
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) announceOpen();
    };
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.clearInterval(retry);
      window.clearTimeout(stopRetry);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      announceClose();
      channel.close();
      channelRef.current = null;
    };
  }, [roomId]);

  const navigate = useCallback((direction: NavDirection) => {
    channelRef.current?.postMessage({ type: "nav", direction } satisfies BroadcastMessage);
  }, []);

  const enterFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {
      /* rejected without activation — the hint button / "f" key remain available */
    });
  }, []);

  const clearControlsTimer = useCallback(() => {
    if (controlsTimerRef.current != null) {
      window.clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  }, []);

  // 마우스 이동/터치 시 하단 컨트롤을 노출하고, 유휴 시간이 지나면 다시 숨긴다 (전체화면에서만).
  const revealControls = useCallback(() => {
    if (!isFullscreen) return;
    setControlsVisible(true);
    clearControlsTimer();
    controlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      controlsTimerRef.current = null;
    }, CONTROLS_IDLE_MS);
  }, [isFullscreen, clearControlsTimer]);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      // 전체화면을 벗어나면 컨트롤/타이머를 초기화.
      setControlsVisible(false);
      clearControlsTimer();
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [clearControlsTimer]);

  useEffect(() => clearControlsTimer, [clearControlsTimer]);

  // Try to go fullscreen immediately (works when the window-management
  // permission carries activation into the opened window).
  const triedRef = useRef(false);
  useEffect(() => {
    if (triedRef.current) return;
    triedRef.current = true;
    enterFullscreen();
  }, [enterFullscreen]);

  // Remote control: keyboard driving from a clicker / laser pointer.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
        case "Spacebar":
          event.preventDefault();
          navigate("next");
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          navigate("prev");
          break;
        case "f":
        case "F":
          enterFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, enterFullscreen]);

  const handleScreenClick = () => navigate("next");

  const handleFullscreenClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // don't also advance the slide
    enterFullscreen();
  };

  const handlePrev = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // arrow drives nav; don't also advance via screen click
    navigate("prev");
    revealControls();
  };

  const handleNext = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    navigate("next");
    revealControls();
  };

  const currentSrc = slides[slideIndex] || null;

  return (
    <Screen
      onClick={handleScreenClick}
      onPointerMove={revealControls}
      onTouchStart={revealControls}
      $immersive={isFullscreen && !controlsVisible}
    >
      {currentSrc ? (
        <Stage ref={stageRef}>
          <SlideImage
            key={currentSrc}
            ref={(img: HTMLImageElement | null) => {
              // 캐시된 이미지는 onLoad 를 놓칠 수 있어 ref 시점에 complete 여부도 확인
              if (img && img.complete) setSlideNaturalRatio(imageNaturalRatio(img));
            }}
            src={currentSrc}
            alt={`슬라이드 ${slideIndex + 1}`}
            draggable={false}
            onLoad={(e: SyntheticEvent<HTMLImageElement>) =>
              setSlideNaturalRatio(imageNaturalRatio(e.currentTarget))
            }
          />
          {showStamps &&
            stamps.map((stamp, index) => (
              <BroadcastStampImage
                key={stamp.id || `${stamp.xPct}-${stamp.yPct}-${index}`}
                src={stamp.src}
                alt="reaction"
                style={stampBoxStyle(
                  stamp.xPct,
                  stamp.yPct,
                  slideContentFractions(slideNaturalRatio, stageRatio ?? SLIDE_BOX_ASPECT)
                )}
                draggable={false}
              />
            ))}
        </Stage>
      ) : (
        <Placeholder>발표자 화면과 연결 중입니다…</Placeholder>
      )}
      {!isFullscreen && (
        <FullscreenHint type="button" onClick={handleFullscreenClick}>
          전체 화면으로 보기
        </FullscreenHint>
      )}
      {isFullscreen && (
        <BottomControls $visible={controlsVisible}>
          <ArrowButton type="button" aria-label="이전 슬라이드" onClick={handlePrev}>
            <ChevronLeft />
          </ArrowButton>
          <ArrowButton type="button" aria-label="다음 슬라이드" onClick={handleNext}>
            <ChevronRight />
          </ArrowButton>
        </BottomControls>
      )}
    </Screen>
  );
};

export default BroadcastScreenPage;
