import { useEffect, useState } from "react";
import type { RefObject } from "react";

// * 요소의 실제 렌더 비율(w/h)을 ResizeObserver 로 추적
//   슬라이드 박스는 CSS aspect-ratio 16:9 를 선언해도 flex 축소 등으로 비율이
//   깨질 수 있어, 스탬프 좌표 변환은 항상 실측 비율을 사용한다
export const useElementAspectRatio = (ref: RefObject<HTMLElement | null>) => {
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setRatio(rect.width / rect.height);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return ratio;
};
