import { useCallback, useEffect, useRef } from "react";
import {
  getBroadcastChannelName,
  isWindowManagementSupported,
  openBroadcastScreen,
  type BroadcastMessage,
  type NavDirection,
} from "./index";

interface UseBroadcastPublisherArgs {
  roomId: string | null;
  slides: (string | null)[];
  currentSlide: number;
  /**
   * Handles navigation intent forwarded from the projector window (clicker,
   * laser pointer, keyboard). The presenter owns slide state, so this should
   * advance/rewind it — the change is then re-broadcast automatically.
   */
  onNavigate?: (direction: NavDirection) => void;
}

/**
 * Keeps a projector window in sync with the presenter's current slide.
 *
 * While mounted, it maintains a BroadcastChannel for the room, re-publishes the
 * current slide whenever it (or the deck) changes, and answers "request"
 * messages from a freshly-opened projector window. `openScreen` launches the
 * projector window on the external display.
 */
export const useBroadcastPublisher = ({
  roomId,
  slides,
  currentSlide,
  onNavigate,
}: UseBroadcastPublisherArgs) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  // Latest state/handler kept in refs so the message handler stays current
  // without re-creating the channel on every render.
  const stateRef = useRef({ slides, currentSlide });
  stateRef.current = { slides, currentSlide };
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  useEffect(() => {
    if (!roomId || typeof BroadcastChannel === "undefined") return undefined;

    const channel = new BroadcastChannel(getBroadcastChannelName(roomId));
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const message = event.data;
      if (message?.type === "request") {
        channel.postMessage({
          type: "slide",
          slideIndex: stateRef.current.currentSlide,
          slides: stateRef.current.slides,
        } satisfies BroadcastMessage);
      } else if (message?.type === "nav") {
        onNavigateRef.current?.(message.direction);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [roomId]);

  // Push slide/deck changes to any open projector window.
  useEffect(() => {
    channelRef.current?.postMessage({
      type: "slide",
      slideIndex: currentSlide,
      slides,
    } satisfies BroadcastMessage);
  }, [slides, currentSlide]);

  const openScreen = useCallback(async () => {
    if (!roomId) return null;
    return openBroadcastScreen(roomId);
  }, [roomId]);

  return { openScreen, isWindowManagementSupported: isWindowManagementSupported() };
};
