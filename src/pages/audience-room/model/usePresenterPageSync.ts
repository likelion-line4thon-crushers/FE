import { useEffect, MutableRefObject } from "react";

interface UsePresenterPageSyncParams {
  slides: any[];
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
  lastPresenterPageRef: MutableRefObject<number>;
  prevSlideRef: MutableRefObject<number>;
  followPresenter: boolean;
  setFollowPresenter: (value: boolean) => void;
  followPresenterRef: MutableRefObject<boolean>;
}

const usePresenterPageSync = ({
  slides,
  setCurrentSlide,
  lastPresenterPageRef,
  prevSlideRef,
  setFollowPresenter,
  followPresenterRef,
}: UsePresenterPageSyncParams) => {
  useEffect(() => {
    if (slides.length === 0) return;

    const targetPage = lastPresenterPageRef.current;
    if (Number.isFinite(targetPage) && targetPage >= 0 && targetPage < slides.length) {
      setCurrentSlide(targetPage);
      prevSlideRef.current = targetPage;
      setFollowPresenter(true);
      followPresenterRef.current = true;
      lastPresenterPageRef.current = -1;
    } else {
      setCurrentSlide((prev) => {
        const next = prev >= slides.length ? slides.length - 1 : prev < 0 ? 0 : prev;
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
