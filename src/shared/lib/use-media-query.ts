import { useCallback, useSyncExternalStore } from "react";
import { MEDIA } from "@/shared/config/breakpoints";

// * matchMedia 구독 훅 — 뷰포트 변화(회전 포함)에 실시간 반응
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onChange);
      return () => mediaQueryList.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot);
};

export const useIsMobile = () => useMediaQuery(MEDIA.mobile);

export const useIsTouchDevice = () => useMediaQuery(MEDIA.touch);
