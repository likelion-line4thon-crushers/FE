import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useParams } from "react-router";
import {
  getBroadcastChannelName,
  type BroadcastMessage,
  type NavDirection,
} from "@/shared/lib/broadcast";
import { Screen, SlideImage, Placeholder, FullscreenHint } from "./BroadcastScreenPage.styles";

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
  const [slides, setSlides] = useState<(string | null)[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Subscribe to the presenter and pull the current slide on mount.
  useEffect(() => {
    if (!roomId || typeof BroadcastChannel === "undefined") return undefined;

    const channel = new BroadcastChannel(getBroadcastChannelName(roomId));
    channelRef.current = channel;
    let received = false;

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      if (event.data?.type === "slide") {
        received = true;
        setSlides(event.data.slides);
        setSlideIndex(event.data.slideIndex);
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

    return () => {
      window.clearInterval(retry);
      window.clearTimeout(stopRetry);
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

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

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

  const currentSrc = slides[slideIndex] || null;

  return (
    <Screen onClick={handleScreenClick}>
      {currentSrc ? (
        <SlideImage src={currentSrc} alt={`슬라이드 ${slideIndex + 1}`} draggable={false} />
      ) : (
        <Placeholder>발표자 화면과 연결 중입니다…</Placeholder>
      )}
      {!isFullscreen && (
        <FullscreenHint type="button" onClick={handleFullscreenClick}>
          전체 화면으로 보기
        </FullscreenHint>
      )}
    </Screen>
  );
};

export default BroadcastScreenPage;
