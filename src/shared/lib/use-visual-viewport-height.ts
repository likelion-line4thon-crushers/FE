import { useEffect } from "react";

// * 모바일 가상 키보드가 열릴 때 visualViewport 높이를 --app-height(px)로 반영
//   global.css 의 #root { height: var(--app-height, 100dvh) } 와 짝을 이룬다
export const useVisualViewportHeight = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    const update = () => {
      root.style.setProperty("--app-height", `${Math.round(viewport.height)}px`);
    };

    update();
    viewport.addEventListener("resize", update);

    return () => {
      viewport.removeEventListener("resize", update);
      root.style.removeProperty("--app-height");
    };
  }, [enabled]);
};
