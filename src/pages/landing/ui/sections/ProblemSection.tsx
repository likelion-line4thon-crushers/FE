import EyeOffIcon from "@/shared/assets/icons/landing/glass-eye-closed.svg";
import MessageCircleOffIcon from "@/shared/assets/icons/landing/glass-msgs.svg";
import ChartNoAxesIcon from "@/shared/assets/icons/landing/glass-square-chart-line.svg";
import * as C from "./common.styles";
import * as S from "./ProblemSection.styles";
import { Reveal } from "./Reveal";

const PAIN_POINTS = [
  {
    icon: EyeOffIcon,
    title: "반응을 알 수 없다",
    description: "잘 집중하고 있는지, 지루한지 발표 중엔 알 방법이 없어요.",
  },
  {
    icon: MessageCircleOffIcon,
    title: "질문이 한꺼번에 몰린다",
    description: "궁금한 게 있어도 흐름이 끊길까 묻지 못하고\nQ&A 시간에 몰아서 쏟아지죠.",
  },
  {
    icon: ChartNoAxesIcon,
    title: "피드백이 남지 않는다",
    description: "뭐가 좋았고, 뭐가 아쉬웠는지 다음 발표에 쓸 데이터가 잘 남지 않아요.",
  },
];

export const ProblemSection = () => (
  <C.Section $bg={C.palette.mist}>
    <C.SplitGrid>
      <Reveal>
        <S.HeadBlock>
          <div>
            <C.SectionMark $align="left" />
            <C.SectionHeadline $align="left">
              무대 위에서도, 화면 너머로도
              <br />
              청중은 잘 보이지 않아요
            </C.SectionHeadline>
          </div>
          <C.SectionSubtext $align="left">
            발표 중엔 청중 반응을 알 길이 없고
            <br />
            피드백은 늘 발표가 끝난 뒤에야, 그마저도 일부만 도착하죠.
          </C.SectionSubtext>
        </S.HeadBlock>
      </Reveal>
      <Reveal>
        <S.PainList>
          {PAIN_POINTS.map(({ icon, title, description }) => (
            <S.PainRow key={title}>
              <S.IconBox>
                <img src={icon} alt="" width={24} height={24} />
              </S.IconBox>
              <S.PainText>
                <S.PainTitle>{title}</S.PainTitle>
                <S.PainDesc>{description}</S.PainDesc>
              </S.PainText>
            </S.PainRow>
          ))}
        </S.PainList>
      </Reveal>
    </C.SplitGrid>
  </C.Section>
);
