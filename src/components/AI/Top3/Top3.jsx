import React from "react";
import { Top3Container } from "./Top3.styles";
import ContentBox from "../ContentBox/ContentBox";
import AITitle from "../AITitle/AITitle";

const Top3 = () => {
  return (
    <Top3Container>
      <AITitle
        title="Top3 질문들"
        description="주요질문 TOP 3를 정리해드립니다."
      />
      <ContentBox
        title="Top 1 질문"
        content="(TOP 1 질문 내용)"
        variant="text"
        width="auto"
        height="auto"
      />
      <ContentBox
        title="Top 2 질문"
        content="(TOP 2 질문 내용)"
        variant="text"
        width="auto"
        height="auto"
      />
      <ContentBox
        title="Top 3 질문"
        content="(TOP 3 질문 내용)"
        variant="text"
        width="auto"
        height="auto"
      />
    </Top3Container>
  );
};

export default Top3;
