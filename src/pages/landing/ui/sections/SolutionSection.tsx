import * as C from "./common.styles";
import * as S from "./SolutionSection.styles";
import { Reveal } from "./Reveal";

export const SolutionSection = () => (
  <C.Section $bg={C.palette.dark}>
    <C.SectionContent>
      <Reveal>
        <S.HeadBlock>
          <div>
            <C.SectionMark />
            <C.SectionHeadline $max={54} $color="#fff">
              그래서, 청중이 <C.Accent>보이는</C.Accent>
              <br />
              발표를 만들었어요
            </C.SectionHeadline>
          </div>
          <C.SectionSubtext $color={C.palette.darkText}>
            BOiNi가 발표자와 청중을 슬라이드 위에서 실시간으로 이어줘요
          </C.SectionSubtext>
        </S.HeadBlock>
      </Reveal>
    </C.SectionContent>
  </C.Section>
);
