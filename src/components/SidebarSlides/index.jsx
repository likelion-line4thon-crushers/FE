import React from "react";
import {
  Sidebar,
  SlideList,
  SlideThumb,
  SlideImage,
  SlideIndex,
  SlidePlaceholder,
} from "./SidebarSlides.styles";

const SidebarSlides = ({
  slides,
  currentSlide,
  setCurrentSlide,
  isWaiting = false,
  placeholderCount = 10,
  maxRevealedPage = null,
  revealAllSlides = true,
}) => {
  const waitingSlides = Array.from({ length: placeholderCount });
  const slideItems = isWaiting ? waitingSlides : slides || [];

  const handleSelectSlide = (index) => {
    if (isWaiting || typeof setCurrentSlide !== "function") return;

    if (!revealAllSlides && maxRevealedPage !== null) {
      const slideNumber = index + 1;
      if (slideNumber > maxRevealedPage + 1) {
        return;
      }
    }

    setCurrentSlide(index, { source: "sidebar" });
  };

  const isSlideLocked = (index) => {
    if (isWaiting || revealAllSlides) return false;
    if (maxRevealedPage === null) return false;
    const slideNumber = index + 1;
    return slideNumber > maxRevealedPage + 1;
  };

  return (
    <Sidebar>
      <SlideList>
        {slideItems.map((slide, i) => {
          const locked = isSlideLocked(i);
          return (
            <SlideThumb
              key={i}
              $active={!isWaiting && i === currentSlide}
              $waiting={isWaiting}
              $locked={locked}
              onClick={() => handleSelectSlide(i)}
            >
              {isWaiting ? (
                <SlidePlaceholder />
              ) : locked ? (
                <SlidePlaceholder />
              ) : (
                <SlideImage
                  src={slide.thumbnailUrl || slide}
                  alt={`슬라이드 ${i + 1}`}
                />
              )}

              <SlideIndex $active={!isWaiting && i === currentSlide}>
                {i + 1}
              </SlideIndex>
            </SlideThumb>
          );
        })}
      </SlideList>
    </Sidebar>
  );
};

export default SidebarSlides;
