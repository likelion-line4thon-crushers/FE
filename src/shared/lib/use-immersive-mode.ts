import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
};

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
  unlock?: () => void;
};

// * 몰입(전체화면) 모드 훅
//   - Element Fullscreen API 지원(데스크톱/안드로이드/아이패드): 네이티브 전체화면
//   - 미지원(아이폰 Safari): position fixed 오버레이 pseudo-fullscreen 폴백
//   isImmersive 하나로 두 모드를 동일하게 소비하고, pseudo 여부는 스타일 분기에만 쓴다
export const useImmersiveMode = (targetRef: RefObject<HTMLElement | null>) => {
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      const doc = document as FullscreenDocument;
      const activeElement = document.fullscreenElement ?? doc.webkitFullscreenElement;
      setIsNativeFullscreen(Boolean(activeElement && activeElement === targetRef.current));
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, [targetRef]);

  const toggleImmersive = useCallback(async () => {
    const element = targetRef.current as FullscreenCapableElement | null;
    if (!element) return;

    const doc = document as FullscreenDocument;
    const fullscreenAllowed = (document.fullscreenEnabled ?? doc.webkitFullscreenEnabled) !== false;
    const supportsNative =
      fullscreenAllowed && Boolean(element.requestFullscreen || element.webkitRequestFullscreen);

    if (!supportsNative) {
      setIsPseudoFullscreen((prev) => !prev);
      return;
    }

    const activeElement = document.fullscreenElement ?? doc.webkitFullscreenElement;
    const orientation = screen.orientation as LockableOrientation | undefined;

    if (activeElement) {
      try {
        orientation?.unlock?.();
      } catch {
        /* ignore */
      }
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return;
      }
      await doc.webkitExitFullscreen?.();
      return;
    }

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else {
        await element.webkitRequestFullscreen?.();
      }
    } catch {
      // 권한 정책 등으로 거부되면 pseudo-fullscreen 으로 폴백
      setIsPseudoFullscreen(true);
      return;
    }

    // 터치 기기(안드로이드)에서는 몰입 모드 진입 시 가로 고정 시도 — 미지원이면 조용히 무시
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      try {
        await orientation?.lock?.("landscape");
      } catch {
        /* ignore */
      }
    }
  }, [targetRef]);

  return {
    isImmersive: isNativeFullscreen || isPseudoFullscreen,
    isPseudoFullscreen,
    toggleImmersive,
  };
};
