import React from "react";
import {
  Sidebar,
  SlideList,
  SlideThumb,
  SlideImage,
  SlideIndex,
  SlidePlaceholder,
} from "./SidebarSlides.styles";

type SlideItem = string | { thumbnailUrl?: string | null };

interface SidebarSlidesProps {
  slides?: SlideItem[];
  currentSlide: number;
  setCurrentSlide?: (index: number, options?: Record<string, unknown>) => void;
  isWaiting?: boolean;
  placeholderCount?: number;
  maxRevealedPage?: number | null;
  revealAllSlides?: boolean;
}

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

  const handleSelectSlide = (index: number) => {
    if (isWaiting || typeof setCurrentSlide !== "function") return;

    if (!revealAllSlides && maxRevealedPage !== null) {
      const slideNumber = index + 1;
      if (slideNumber > maxRevealedPage + 1) {
        return;
      }
    }

    setCurrentSlide(index, { source: "sidebar" });
  };

  const isSlideLocked = (index: number) => {
    if (isWaiting || revealAllSlides) return false;
    if (maxRevealedPage === null) return false;
    const slideNumber = index + 1;
    return slideNumber > maxRevealedPage + 1;
  };

  return (
    <Sidebar>
      <SlideList>
        {slideItems.map((slide: SlideItem | undefined, i: number) => {
          const locked = isSlideLocked(i);
          const src = typeof slide === "string" ? slide : slide?.thumbnailUrl || "";
          const showPlaceholder = isWaiting || locked || !src;
          return (
            <SlideThumb
              key={i}
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

              <SlideIndex $active={!isWaiting && i === currentSlide}>{i + 1}</SlideIndex>
            </SlideThumb>
          );
        })}
      </SlideList>
    </Sidebar>
  );
};

export default SidebarSlides;
