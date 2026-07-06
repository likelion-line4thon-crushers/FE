import { createLogger } from "@/shared/lib/logger";

const log = createLogger("broadcast");

/**
 * Local presenter → giant-screen slide mirror.
 *
 * The presenter's prep/live window is the source of truth for the current slide.
 * A second (projector) window opened on an external display subscribes over a
 * same-origin BroadcastChannel and renders only the current slide, fullscreen.
 *
 * BroadcastChannel is same-origin + same-browser only — which is exactly the
 * "laptop + HDMI projector on the same machine" case this feature targets.
 */

/** Minimal reaction-sticker shape relayed to the projector (mirrors entities' Stamp). */
export interface BroadcastStamp {
  id: string;
  xPct: number;
  yPct: number;
  src: string;
}

export interface BroadcastSlidePayload {
  slideIndex: number;
  slides: (string | null)[];
  /** Reaction stickers for the current slide. */
  stamps?: BroadcastStamp[];
  /** Whether the projector should render those stickers (presenter-controlled). */
  showStamps?: boolean;
}

export type NavDirection = "next" | "prev";

export type BroadcastMessage =
  | ({ type: "slide" } & BroadcastSlidePayload)
  // Sent by the projector window on mount to pull the current state.
  | { type: "request" }
  // Sent by the projector window to drive navigation (clicker / laser pointer /
  // keyboard). The presenter window remains the single source of truth and
  // re-broadcasts the resulting slide.
  | { type: "nav"; direction: NavDirection }
  // Projector presence, event-driven (no heartbeat):
  //  - a projector announces "screen-open" when it mounts and whenever it's
  //    asked via a roll-call,
  //  - it sends "screen-close" when it goes away (pagehide / unmount),
  //  - the presenter broadcasts "screen-rollcall" on mount to discover screens
  //    that were already open (e.g. opened during prep before going live).
  | { type: "screen-open"; id: string }
  | { type: "screen-close"; id: string }
  | { type: "screen-rollcall" };

export const getBroadcastChannelName = (roomId: string) => `boini-screen-${roomId}`;

export const broadcastScreenPath = (roomId: string) => `/rooms/${roomId}/broadcast`;

/**
 * Base window name. A per-open sequence is appended so each launch spawns a
 * distinct projector window (e.g. one per beam projector) instead of reusing
 * and focusing a single one.
 */
const BROADCAST_WINDOW_NAME = "boini-broadcast-screen";
let broadcastWindowSeq = 0;

/**
 * The Window Management API (Chromium) lets us enumerate displays and place a
 * window on the external one. Absent it (Firefox/Safari), we fall back to a
 * plain popup the presenter drags onto the projector.
 */
export const isWindowManagementSupported = () =>
  typeof window !== "undefined" && "getScreenDetails" in window;

interface ScreenDetailedLike {
  isPrimary: boolean;
  isInternal: boolean;
  availLeft: number;
  availTop: number;
  availWidth: number;
  availHeight: number;
}

const listExternalScreens = (
  screens: ScreenDetailedLike[],
  current: ScreenDetailedLike
): ScreenDetailedLike[] => {
  // Prefer external, non-primary displays; then any non-primary; then anything
  // other than the current one. Returned in order so successive opens can be
  // spread across multiple projectors.
  const external = screens.filter((s) => !s.isPrimary && !s.isInternal);
  if (external.length) return external;
  const nonPrimary = screens.filter((s) => !s.isPrimary);
  if (nonPrimary.length) return nonPrimary;
  return screens.filter((s) => s !== current);
};

/**
 * Open (or focus) the projector window. Must be called from a user gesture so
 * the popup is not blocked. Returns the window handle, or null if blocked.
 *
 * When a second display is available and the user grants window-management
 * permission, the window is positioned to fill that display. Otherwise it opens
 * as a normal window on the current screen.
 */
export async function openBroadcastScreen(roomId: string): Promise<Window | null> {
  const url = broadcastScreenPath(roomId);
  const windowIndex = broadcastWindowSeq++;
  let features = "popup=yes";

  try {
    if (isWindowManagementSupported()) {
      const details = await (
        window as unknown as {
          getScreenDetails: () => Promise<{
            screens: ScreenDetailedLike[];
            currentScreen: ScreenDetailedLike;
          }>;
        }
      ).getScreenDetails();

      // Spread successive opens across the available external displays so a
      // presenter with several projectors lands one window on each.
      const candidates = listExternalScreens(details.screens, details.currentScreen);
      const target = candidates.length ? candidates[windowIndex % candidates.length] : null;
      if (target) {
        features = `popup=yes,left=${target.availLeft},top=${target.availTop},width=${target.availWidth},height=${target.availHeight}`;
        log.log("Placing broadcast window on external screen", features);
      } else {
        log.log("No external screen detected — opening on current screen");
      }
    }
  } catch (error) {
    // Permission denied or API unavailable — fall back to a plain popup.
    log.warn("Window Management unavailable, using default placement", error);
  }

  // Unique window name per open → a new projector window each time instead of
  // reusing/focusing a single one, so multiple screens can be driven at once.
  const win = window.open(url, `${BROADCAST_WINDOW_NAME}-${windowIndex}`, features);
  if (!win) {
    log.warn("Broadcast window was blocked by the browser");
    return null;
  }
  win.focus();
  return win;
}

export { useBroadcastPublisher } from "./useBroadcastPublisher";
