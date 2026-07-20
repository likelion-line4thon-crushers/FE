import React from "react";
import ArrowRightMutedIcon from "@/shared/assets/icons/landing/arrow-right-muted.svg";
import * as C from "./common.styles";
import * as S from "./HowItWorksSection.styles";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    title: "자료 업로드",
    description: "PDF나 PPT를 올리면 발표 세션이 만들어져요.\n설치도 회원가입도 필요 없어요.",
  },
  {
    title: "링크 또는 세션 코드 공유",
    description: "청중은 링크 또는 세션 코드로 입장해 실시간으로 반응하고 질문해요.",
  },
  {
    title: "리포트 확인",
    description: "발표가 끝나면 설문 응답과 AI 리포트가 자동으로 정리돼요.",
  },
];

export const HowItWorksSection = () => (
  <C.Section $bg={C.palette.mist}>
    <C.SectionContent>
      <Reveal>
        <S.HeadBlock>
          <div>
            <C.SectionMark />
            <C.SectionHeadline>
              준비는 <C.Accent>3분이면</C.Accent> 충분해요
            </C.SectionHeadline>
          </div>
          <C.SectionSubtext>발표 자료 올리고 링크만 공유하면 끝이에요.</C.SectionSubtext>
        </S.HeadBlock>
      </Reveal>
      <Reveal>
        <S.Steps>
          {STEPS.map(({ title, description }, index) => (
            <React.Fragment key={title}>
              {index > 0 && <S.StepArrow src={ArrowRightMutedIcon} alt="" />}
              <S.Step>
                <S.StepTitle>{title}</S.StepTitle>
                <S.StepDesc>{description}</S.StepDesc>
              </S.Step>
            </React.Fragment>
          ))}
        </S.Steps>
      </Reveal>
    </C.SectionContent>
  </C.Section>
);
