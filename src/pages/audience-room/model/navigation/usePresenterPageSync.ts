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

    // Only auto-jump to the presenter's page (and enable follow) while the audience
    // is actually following. `lastPresenterPageRef` is kept up-to-date by the pageChange
    // handler even when follow is off, and `slides` changes reference on every slideReady
    // patch — without this guard those re-runs would drag a browsing audience back to the
    // presenter and re-enable follow, ignoring their "발표자와 함께 보기" toggle.
    const targetPage = lastPresenterPageRef.current;
    if (
      followPresenterRef.current &&
      Number.isFinite(targetPage) &&
      targetPage >= 0 &&
      targetPage < slides.length
    ) {
      setCurrentSlide(targetPage);
      prevSlideRef.current = targetPage;
      setFollowPresenter(true);
      followPresenterRef.current = true;
      // Intentionally NOT reset to -1: this ref must keep holding the presenter's live page
      // so re-enabling "발표자와 함께 보기" can jump to the presenter's current slide. The
      // followPresenterRef guard above (not a stale sentinel) is what prevents re-yanking a
      // browsing audience. A -1 here would leak into handleToggleFollowPresenter, where
      // Number.isFinite(-1) is true, and clamp the audience back to slide 0 on toggle-on.
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
