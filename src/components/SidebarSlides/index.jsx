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
}) => {
  const waitingSlides = Array.from({ length: placeholderCount });
  const slideItems = isWaiting ? waitingSlides : slides || [];

  const handleSelectSlide = (index) => {
    if (isWaiting || typeof setCurrentSlide !== "function") return;
    setCurrentSlide(index, { source: "sidebar" });
  };

  return (
    <Sidebar>
      <SlideList>
        {slideItems.map((slide, i) => (
          <SlideThumb
            key={i}
            $active={!isWaiting && i === currentSlide}
            $waiting={isWaiting}
            onClick={() => handleSelectSlide(i)}
          >
            {isWaiting ? (
              <SlidePlaceholder />
            ) : (
              <SlideImage
                src={slide.thumbnailUrl || slide}
                alt={`슬라이드 ${i + 1}`}
              />
            )}
            {/* <SlideIndex>{i + 1}</SlideIndex> */}
            <SlideIndex $active={!isWaiting && i === currentSlide}>
              {i + 1}
            </SlideIndex>
          </SlideThumb>
        ))}
      </SlideList>
    </Sidebar>
  );
};

export default SidebarSlides;
