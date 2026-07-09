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

      // iOS 는 입력 포커스 시 문서를 위로 밀어 올린다(visualViewport 팬).
      // 레이아웃이 이미 vv 높이에 맞으므로 스크롤을 되돌려 상단 UI 를 고정한다.
      if (viewport.offsetTop > 0 || window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      root.style.removeProperty("--app-height");
    };
  }, [enabled]);
};
