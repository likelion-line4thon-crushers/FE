import React from "react";
import { Top3Container } from "./Top3.styles";
import ContentBox from "../ContentBox/ContentBox";

const Top3 = () => {
  return (
    <Top3Container>
      <h1>Top 3 질문들</h1>
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
