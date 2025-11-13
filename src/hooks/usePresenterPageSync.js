import { useEffect, useRef } from "react";

const usePresenterPageSync = ({
  slides,
  currentSlide,
  setCurrentSlide,
  lastPresenterPageRef,
  prevSlideRef,
  followPresenter,
  setFollowPresenter,
  followPresenterRef,
}) => {
  useEffect(() => {
    if (slides.length === 0) return;

    const targetPage = lastPresenterPageRef.current;
    if (
      Number.isFinite(targetPage) &&
      targetPage >= 0 &&
      targetPage < slides.length
    ) {
      setCurrentSlide(targetPage);
      prevSlideRef.current = targetPage;
      setFollowPresenter(true);
      followPresenterRef.current = true;
      lastPresenterPageRef.current = -1;
    } else {
      setCurrentSlide((prev) => {
        const next =
          prev >= slides.length ? slides.length - 1 : prev < 0 ? 0 : prev;
        prevSlideRef.current = next;
        return next;
      });
    }
  }, [
    slides,
    setCurrentSlide,
    lastPresenterPageRef,
    prevSlideRef,
    setFollowPresenter,
    followPresenterRef,
  ]);
};

export default usePresenterPageSync;
