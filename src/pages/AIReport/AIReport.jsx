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
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PageContainer>
      <SideHeader onIconClick={scrollToSection} />
      <ContentContainer>
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
