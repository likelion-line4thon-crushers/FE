import React from "react";
import SideHeader from "../../components/AI/SideHeader/SideHeader";
import { PageContainer, ContentContainer } from "./AIReport.styles";
import TotalReaction from "../../components/AI/TotalReaction/TotalReaction";

const AiReportPage = () => {
  return (
    <PageContainer>
      <SideHeader />
      <ContentContainer>
        <TotalReaction />
        <Top3 />
        <PopularSlide />
        <QuestionSlide />
        <ReplaySlide />
        <Review />
      </ContentContainer>
    </PageContainer>
  );
};

export default AiReportPage;
