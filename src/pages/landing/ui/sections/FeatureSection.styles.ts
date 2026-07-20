import styled, { css } from "styled-components";
import { MEDIA } from "@/shared/config/breakpoints";
import { RADIUS, palette } from "./common.styles";

/* === 스플릿 레이아웃 === */
export const TextCol = styled.div`
  min-width: 0;
`;

export const TextColInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

export const MediaCol = styled.div<{ $lead?: boolean }>`
  min-width: 0;
  order: ${({ $lead }) => ($lead ? -1 : 0)};

  @media ${MEDIA.tabletDown} {
    order: 0;
  }
`;

export const BulletRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 12px;
`;

export const BulletRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

export const BulletIconChip = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #fff;
  /* Problem 아이콘 박스와 같은 얇은 라인 카드 모티프 (글라스 아이콘 색이 잘 보이도록) */
  border: 1px solid ${palette.line};
  border-radius: ${RADIUS.chip}px;
`;

export const BulletText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

export const BulletTitle = styled.div`
  font-size: 16.5px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${palette.ink};
`;

export const BulletDesc = styled.div`
  font-size: 14.5px;
  line-height: 22px;
  letter-spacing: -0.2px;
  color: ${palette.textSub};
  /* 문구의 \n을 줄바꿈으로 렌더 */
  white-space: pre-line;
`;

/* === 센터 레이아웃 (two-up / wide) === */
export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: clamp(40px, 3.5vw, 64px);
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 780px;

  @media ${MEDIA.mobile} {
    align-items: flex-start;

    > div {
      width: 100%;
    }
  }
`;

export const MediaRow = styled.div<{ $maxWidth: number }>`
  display: flex;
  justify-content: center;
  gap: 48px;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth}px;

  @media ${MEDIA.tabletDown} {
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }
`;

// flex-grow를 시안 폭에 비례시켜 2단 배치의 폭 비율을 유지한다
export const MediaColumn = styled.div<{ $grow: number }>`
  flex: ${({ $grow }) => $grow} 1 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;

  @media ${MEDIA.tabletDown} {
    flex: initial;
    width: 100%;
  }
`;

export const MediaCaption = styled.div`
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: ${palette.textMuted};
`;

// $bare: 프레임(테두리·라운딩) 없이 이미지 원본 그대로 (예: 후기 설문 섹션)
const demoMediaFrame = css<{ $onMist?: boolean; $radius: number; $bare?: boolean }>`
  display: block;
  width: 100%;
  border-radius: ${({ $bare, $radius }) => ($bare ? 0 : $radius)}px;
  border: ${({ $bare, $onMist }) =>
    $bare ? "none" : `2px solid ${$onMist ? "#e4e4e4" : palette.line}`};
  background: ${({ $bare, $onMist }) => ($bare ? "transparent" : $onMist ? "#fff" : palette.mist)};
  box-sizing: border-box;
`;

// 영상은 고정 비율 없이 원본 비율대로 높이가 정해진다
export const DemoVideo = styled.video<{ $onMist?: boolean; $radius: number; $bare?: boolean }>`
  ${demoMediaFrame}
  height: auto;
`;

export const DemoImage = styled.img<{
  $onMist?: boolean;
  $ratio: string;
  $radius: number;
  $bare?: boolean;
}>`
  ${demoMediaFrame}
  aspect-ratio: ${({ $ratio }) => $ratio};
  object-fit: cover;
`;

export const InlineBullets = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(28px, 3vw, 56px);
  width: 100%;
  max-width: 1000px;

  @media ${MEDIA.mobile} {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

export const InlineBullet = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 20px;
  border-left: 1px solid ${palette.line};
`;

export const InlineBulletHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
