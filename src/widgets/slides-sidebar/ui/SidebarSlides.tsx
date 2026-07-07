import React, { useEffect, useRef, useState } from "react";
import {
  Sidebar,
  SlideList,
  SlideThumb,
  SlideImage,
  SlideIndex,
  SlidePlaceholder,
} from "./SidebarSlides.styles";

type SlideItem = string | null | { thumbnailUrl?: string | null };

interface SidebarSlidesProps {
  slides?: SlideItem[];
  currentSlide: number;
  setCurrentSlide?: (index: number, options?: Record<string, unknown>) => void;
  isWaiting?: boolean;
  placeholderCount?: number;
  maxRevealedPage?: number | null;
  revealAllSlides?: boolean;
}

// 뷰포트 높이를 측정하기 전에 사용할 미공개(블랭크) 슬라이드 기본 노출 개수
const FALLBACK_BLANK_CAPACITY = 8;

const SidebarSlides = ({
  slides,
  currentSlide,
  setCurrentSlide,
  isWaiting = false,
  placeholderCount = 10,
  maxRevealedPage = null,
  revealAllSlides = true,
}: SidebarSlidesProps) => {
  const waitingSlides: SlideItem[] = Array.from({ length: placeholderCount }, () => "");
  const slideItems: SlideItem[] = isWaiting ? waitingSlides : slides || [];

  // 발표자가 현재 보여주는 슬라이드(currentSlide)는 항상 공개된 것으로 취급한다.
  // 미공개 상태에서 발표자가 슬라이드를 건너뛰어 이동하면 maxRevealedPage 가 아직
  // 따라오지 못해 현재 슬라이드 썸네일이 잠긴 블랭크로 보이는 문제를 방지.
  const currentSlideIndex = Number.isFinite(currentSlide) ? currentSlide : -1;
  const revealedBoundaryIndex = Math.max(maxRevealedPage ?? -1, currentSlideIndex);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);
  const [blankCapacity, setBlankCapacity] = useState<number | null>(null);

  // 라우팅/로드 시 현재 슬라이드 썸네일을 패널 안에서 보이도록(가운데로) 스크롤
  useEffect(() => {
    if (isWaiting) return;
    const container = sidebarRef.current;
    const active = activeThumbRef.current;
    if (!container || !active) return;

    const raf = requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const fullyVisible =
        activeRect.top >= containerRect.top && activeRect.bottom <= containerRect.bottom;
      if (fullyVisible) return;

      // 컨테이너(사이드바)만 스크롤 — 페이지 전체 스크롤은 건드리지 않음
      const offset = activeRect.top - containerRect.top;
      const centered = offset - (container.clientHeight - active.offsetHeight) / 2;
      container.scrollTop = Math.max(0, container.scrollTop + centered);
    });

    return () => cancelAnimationFrame(raf);
  }, [currentSlide, isWaiting, slideItems.length]);

  // 슬라이드 패널 뷰포트에 들어가는 썸네일 개수를 측정해 블랭크 노출량을 제한
  useEffect(() => {
    const viewport = sidebarRef.current;
    if (!viewport) return;

    const measure = () => {
      const thumb = viewport.querySelector<HTMLElement>("[data-slide-thumb]");
      const thumbHeight = thumb?.offsetHeight ?? 0;
      if (!thumb || thumbHeight <= 0) return;

      const list = thumb.parentElement;
      const gap = list ? parseFloat(window.getComputedStyle(list).rowGap || "0") || 0 : 0;
      const capacity = Math.max(1, Math.floor((viewport.clientHeight + gap) / (thumbHeight + gap)));
      setBlankCapacity(capacity);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [slideItems.length, isWaiting]);

  const handleSelectSlide = (index: number) => {
    if (isWaiting || typeof setCurrentSlide !== "function") return;

    if (!revealAllSlides && maxRevealedPage !== null) {
      if (index > revealedBoundaryIndex) {
        return;
      }
    }

    setCurrentSlide(index, { source: "sidebar" });
  };

  const isSlideLocked = (index: number) => {
    if (isWaiting || revealAllSlides) return false;
    if (maxRevealedPage === null) return false;
    return index > revealedBoundaryIndex;
  };

  // 미공개(잠긴) 슬라이드는 전부 그리지 않고, 뷰포트를 채울 만큼만 블랭크로 노출
  const isAudienceLockMode = !isWaiting && !revealAllSlides && maxRevealedPage !== null;
  const revealedCount = Math.min(slideItems.length, Math.max(0, revealedBoundaryIndex + 1));
  const capacity = blankCapacity ?? FALLBACK_BLANK_CAPACITY;
  const renderLimit = isAudienceLockMode
    ? Math.min(slideItems.length, revealedCount + capacity)
    : slideItems.length;
  const visibleSlideItems = slideItems.slice(0, renderLimit);

  return (
    <Sidebar ref={sidebarRef}>
      <SlideList>
        {visibleSlideItems.map((slide: SlideItem | undefined, i: number) => {
          const locked = isSlideLocked(i);
          const src = typeof slide === "string" ? slide : slide?.thumbnailUrl || "";
          const showPlaceholder = isWaiting || locked || !src;
          return (
            <SlideThumb
              key={i}
              ref={!isWaiting && i === currentSlide ? activeThumbRef : undefined}
              data-slide-thumb
              $active={!isWaiting && i === currentSlide}
              $waiting={isWaiting}
              $locked={locked}
              onClick={() => handleSelectSlide(i)}
            >
              {showPlaceholder ? (
                <SlidePlaceholder />
              ) : (
                <SlideImage src={src} alt={`슬라이드 ${i + 1}`} />
              )}

              {/* 블랭크(미공개) 슬라이드에는 번호를 표시하지 않음 */}
              {!showPlaceholder && (
                <SlideIndex $active={!isWaiting && i === currentSlide}>{i + 1}</SlideIndex>
              )}
            </SlideThumb>
          );
        })}
      </SlideList>
    </Sidebar>
  );
};

export default SidebarSlides;
