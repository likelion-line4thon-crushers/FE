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

export interface BroadcastSlidePayload {
  slideIndex: number;
  slides: (string | null)[];
}

export type NavDirection = "next" | "prev";

export type BroadcastMessage =
  | ({ type: "slide" } & BroadcastSlidePayload)
  // Sent by the projector window on mount to pull the current state.
  | { type: "request" }
  // Sent by the projector window to drive navigation (clicker / laser pointer /
  // keyboard). The presenter window remains the single source of truth and
  // re-broadcasts the resulting slide.
  | { type: "nav"; direction: NavDirection };

export const getBroadcastChannelName = (roomId: string) => `boini-screen-${roomId}`;

export const broadcastScreenPath = (roomId: string) => `/rooms/${roomId}/screen`;

/** Fixed window name so re-clicking focuses/reuses the same projector window. */
const BROADCAST_WINDOW_NAME = "boini-broadcast-screen";

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

const pickExternalScreen = (
  screens: ScreenDetailedLike[],
  current: ScreenDetailedLike
): ScreenDetailedLike | null => {
  // Prefer an external, non-primary display; otherwise a non-primary one.
  return (
    screens.find((s) => !s.isPrimary && !s.isInternal) ??
    screens.find((s) => !s.isPrimary) ??
    (screens.length > 1 ? (screens.find((s) => s !== current) ?? null) : null)
  );
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

      const target = pickExternalScreen(details.screens, details.currentScreen);
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

  const win = window.open(url, BROADCAST_WINDOW_NAME, features);
  if (!win) {
    log.warn("Broadcast window was blocked by the browser");
    return null;
  }
  win.focus();
  return win;
}

export { useBroadcastPublisher } from "./useBroadcastPublisher";
