import ArrowRightDarkIcon from "@/shared/assets/icons/landing/arrow-right-dark.svg";
import { useIsMobile } from "@/shared/lib/use-media-query";
import * as C from "./common.styles";
import * as S from "./FinalCtaSection.styles";
import { Reveal } from "./Reveal";

interface FinalCtaSectionProps {
  onStart: () => void;
}

// 모바일은 발표 시작 대신 세션 코드 참여로 안내한다 (발표자 플로우는 태블릿·PC 전용)
export const FinalCtaSection = ({ onStart }: FinalCtaSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <C.Section $bg="linear-gradient(75deg, #E74D07 0%, #C23E03 90%)" $padY={150}>
      <C.SectionContent $maxWidth={1000}>
        <Reveal>
          <S.CtaBlock>
            <C.SectionHeadline $max={56} $color="#fff" $mobileCenter>
              이제, 청중이 <S.Emphasis>보이는</S.Emphasis>
              <br />
              발표를 시작해볼까요?
            </C.SectionHeadline>
            <S.CtaSub>
              {isMobile ? (
                <>
                  발표 만들기는 태블릿이나 PC 브라우저에서 열 수 있어요.
                  <br />
                  지금은 세션 코드로 발표에 참여해보세요.
                </>
              ) : (
                <>설치도 회원가입도 없이, 지금 무료로 시작할 수 있어요.</>
              )}
            </S.CtaSub>
            <S.Buttons>
              <S.StartButton type="button" onClick={onStart}>
                {isMobile ? "세션 참여하기" : "발표 시작하기"}
                <img src={ArrowRightDarkIcon} alt="" width={19} height={19} />
              </S.StartButton>
            </S.Buttons>
          </S.CtaBlock>
        </Reveal>
      </C.SectionContent>
    </C.Section>
  );
};
