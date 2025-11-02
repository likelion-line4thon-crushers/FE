import React, { useRef } from "react";
import SideHeader from "../../components/AI/SideHeader/SideHeader";
import { PageContainer, ContentContainer } from "./AIReport.styles";
import TotalReaction from "../../components/AI/TotalReaction/TotalReaction";
import Top3 from "../../components/AI/Top3/Top3";
import PopularSlide from "../../components/AI/PopularSlide/PopularSlide";
import QuestionSlide from "../../components/AI/QuestionSlide/QuestionSlide";
import ReplaySlide from "../../components/AI/ReplaySlide/ReplaySlide";
import Review from "../../components/AI/ReviewSlide/ReviewSlide";

const AiReportPage = () => {
  const totalReactionRef = useRef(null);
  const top3Ref = useRef(null);
  const popularSlideRef = useRef(null);
  const questionSlideRef = useRef(null);
  const replaySlideRef = useRef(null);
  const reviewRef = useRef(null);
  const contentContainerRef = useRef(null);

  const scrollToSection = (sectionName) => {
    const refs = {
      totalReaction: totalReactionRef,
      top3: top3Ref,
      popularSlide: popularSlideRef,
      questionSlide: questionSlideRef,
      replaySlide: replaySlideRef,
      review: reviewRef,
    };

    const targetRef = refs[sectionName];
    const container = contentContainerRef.current;

    if (targetRef?.current && container) {
      const targetElement = targetRef.current;
      const containerHeight = container.clientHeight;
      const targetTop = targetElement.offsetTop;
      const targetHeight = targetElement.offsetHeight;
      const maxScroll = container.scrollHeight - containerHeight;

      let scrollPosition = targetTop;

      if (targetTop + targetHeight > container.scrollHeight - 50) {
        scrollPosition = Math.max(0, maxScroll);
      } else {
        scrollPosition = targetTop;
      }

      container.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <PageContainer>
      <SideHeader onIconClick={scrollToSection} />
      <ContentContainer ref={contentContainerRef}>
        <div ref={totalReactionRef}>
          <TotalReaction />
        </div>
        <div ref={top3Ref}>
          <Top3 />
        </div>
        <div ref={popularSlideRef}>
          <PopularSlide />
        </div>
        <div ref={questionSlideRef}>
          <QuestionSlide />
        </div>
        <div ref={replaySlideRef}>
          <ReplaySlide />
        </div>
        <div ref={reviewRef}>
          <Review />
        </div>
      </ContentContainer>
    </PageContainer>
  );
};

export default AiReportPage;
