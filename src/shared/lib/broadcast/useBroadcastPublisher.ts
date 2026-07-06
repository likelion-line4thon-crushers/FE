import { useCallback, useEffect, useRef, useState } from "react";
import {
  getBroadcastChannelName,
  isWindowManagementSupported,
  openBroadcastScreen,
  type BroadcastMessage,
  type BroadcastStamp,
  type NavDirection,
} from "./index";

interface UseBroadcastPublisherArgs {
  roomId: string | null;
  slides: (string | null)[];
  currentSlide: number;
  /** Reaction stickers for the current slide, relayed to open projector windows. */
  stamps?: BroadcastStamp[];
  /** Whether projector windows should render the relayed stickers. */
  broadcastReactionsVisible?: boolean;
  /**
   * Handles navigation intent forwarded from the projector window (clicker,
   * laser pointer, keyboard). The presenter owns slide state, so this should
   * advance/rewind it — the change is then re-broadcast automatically.
   */
  onNavigate?: (direction: NavDirection) => void;
}

/**
 * Keeps projector windows in sync with the presenter's current slide.
 *
 * While mounted, it maintains a BroadcastChannel for the room, re-publishes the
 * current slide (and its reaction stickers) whenever they change, and answers
 * "request" messages from a freshly-opened projector window. `openScreen`
 * launches a projector window on an external display.
 *
 * `openScreenCount` reflects how many projector windows are currently live,
 * derived from their heartbeat presence — so it stays accurate even for windows
 * opened by a previous page (e.g. during prep, before the session went live).
 */
export const useBroadcastPublisher = ({
  roomId,
  slides,
  currentSlide,
  stamps,
  broadcastReactionsVisible = false,
  onNavigate,
}: UseBroadcastPublisherArgs) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  // Latest state/handler kept in refs so the message handler stays current
  // without re-creating the channel on every render.
  const stateRef = useRef({ slides, currentSlide, stamps, showStamps: broadcastReactionsVisible });
  stateRef.current = { slides, currentSlide, stamps, showStamps: broadcastReactionsVisible };
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  const [openScreenCount, setOpenScreenCount] = useState(0);

  const buildSlideMessage = (): BroadcastMessage => ({
    type: "slide",
    slideIndex: stateRef.current.currentSlide,
    slides: stateRef.current.slides,
    stamps: stateRef.current.stamps,
    showStamps: stateRef.current.showStamps,
  });

  useEffect(() => {
    if (!roomId || typeof BroadcastChannel === "undefined") return undefined;

    const channel = new BroadcastChannel(getBroadcastChannelName(roomId));
    channelRef.current = channel;

    // Live projector windows, tracked purely by open/close events.
    const screens = new Set<string>();
    const syncCount = () => setOpenScreenCount(screens.size);

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const message = event.data;
      if (message?.type === "request") {
        channel.postMessage(buildSlideMessage());
      } else if (message?.type === "nav") {
        onNavigateRef.current?.(message.direction);
      } else if (message?.type === "screen-open") {
        if (!screens.has(message.id)) {
          screens.add(message.id);
          syncCount();
        }
      } else if (message?.type === "screen-close") {
        if (screens.delete(message.id)) syncCount();
      }
    };

    // Discover projectors already open before this publisher mounted (e.g. one
    // opened during prep, now that the session has gone live).
    channel.postMessage({ type: "screen-rollcall" } satisfies BroadcastMessage);

    return () => {
      channel.close();
      channelRef.current = null;
      setOpenScreenCount(0);
    };
  }, [roomId]);

  // Push slide/deck/sticker changes to any open projector window.
  useEffect(() => {
    channelRef.current?.postMessage(buildSlideMessage());
  }, [slides, currentSlide, stamps, broadcastReactionsVisible]);

  const openScreen = useCallback(async () => {
    if (!roomId) return null;
    return openBroadcastScreen(roomId);
  }, [roomId]);

  return {
    openScreen,
    isWindowManagementSupported: isWindowManagementSupported(),
    openScreenCount,
  };
};
