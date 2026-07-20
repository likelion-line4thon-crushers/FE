import React, { useEffect, useRef, useState } from "react";
import { RevealBox } from "./common.styles";

// 리빌 트리거 라인: 스크롤 컨테이너 하단에서 14% 위 지점.
// threshold(요소 높이 비례) 방식은 요소 크기마다 발화 시점이 달라져서 고정선이 더 정확하다.
const ROOT_MARGIN = "0px 0px -14% 0px";
// 같은 프레임에 함께 교차한 요소들만 위→아래 순서로 계단식 지연을 받는다.
// 홀로 들어온 요소는 지연 없이 즉시 시작한다.
const STAGGER_MS = 90;

interface Registry {
  io: IntersectionObserver;
  cbs: Map<Element, (delay: number) => void>;
}

// 스크롤 루트별 공유 옵저버 — 랜딩에서는 PageScroll 하나만 쓰인다.
const registries = new Map<Element | null, Registry>();

const getRegistry = (root: Element | null): Registry => {
  let registry = registries.get(root);
  if (!registry) {
    const cbs = new Map<Element, (delay: number) => void>();
    const io = new IntersectionObserver(
      (entries) => {
        const hits = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        hits.forEach((entry, index) => {
          cbs.get(entry.target)?.(index * STAGGER_MS);
          cbs.delete(entry.target);
          io.unobserve(entry.target);
        });
      },
      { root, rootMargin: ROOT_MARGIN, threshold: 0 }
    );
    registry = { io, cbs };
    registries.set(root, registry);
  }
  return registry;
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

// 뷰포트 진입 시 1회 페이드업 — 스크롤 리스너 대신 IntersectionObserver 사용
export const Reveal = ({ children, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [delay, setDelay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const root = el.closest("[data-landing-scroll]");
    const registry = getRegistry(root);
    registry.cbs.set(el, (staggerDelay) => {
      setDelay(staggerDelay);
      setShown(true);
    });
    registry.io.observe(el);
    return () => {
      registry.cbs.delete(el);
      registry.io.unobserve(el);
      if (registry.cbs.size === 0) {
        registry.io.disconnect();
        registries.delete(root);
      }
    };
  }, []);

  return (
    <RevealBox ref={ref} $shown={shown} $delay={delay} className={className}>
      {children}
    </RevealBox>
  );
};
