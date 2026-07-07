import { useCallback, useState } from "react";
import { storageKeys } from "@/shared/config/storage-keys";

/**
 * Presenter-controlled "show reaction stickers on the broadcast screen" flag,
 * persisted per-room in sessionStorage so it survives the prep → live page
 * transition (and refreshes). Defaults to hidden.
 */
export const useBroadcastReactionVisibility = (roomId: string | null) => {
  const key = roomId ? storageKeys.broadcastReactionsVisible(String(roomId)) : null;

  const [visible, setVisibleState] = useState<boolean>(() => {
    if (!key) return false;
    try {
      return sessionStorage.getItem(key) === "true";
    } catch {
      return false;
    }
  });

  const setVisible = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setVisibleState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        if (key) {
          try {
            sessionStorage.setItem(key, String(value));
          } catch {
            /* ignore */
          }
        }
        return value;
      });
    },
    [key]
  );

  return [visible, setVisible] as const;
};
