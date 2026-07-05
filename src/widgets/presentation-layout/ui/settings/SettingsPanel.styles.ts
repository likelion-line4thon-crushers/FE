import styled from "styled-components";

/* 전체 패널 */
export const PanelWrapper = styled.aside`
  width: 17.03vw;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-left: 1px solid #efefef;
  box-shadow: 0 0.05vw 0.2vw rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

/* 구역 */
export const Section = styled.section`
  display: flex;
  flex-direction: column;
  padding: 0;
`;

/* 상단 제목바 */
export const Title = styled.h2`
  min-height: clamp(32px, 3.52vh, 38px);
  margin: 0;
  padding: 0 clamp(12px, 1.15vw, 23px);
  font-size: clamp(12px, 0.8vw, 15px);
  font-weight: 600;
  color: #303030;
  border-bottom: 0.05vw solid #eaeaea;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  box-sizing: border-box;
`;

/* 청중 수 영역 */
export const AudienceCountWrapper = styled.div`
  display: flex;
  align-items: center;
  min-height: clamp(47px, 5.19vh, 56px);
  padding: 0 clamp(12px, 0.78vw, 15px);
  gap: 0.4vw;
  color: #5c5c5c;
  font-size: clamp(13px, 0.9vw, 16px);
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.4px;
  border-radius: clamp(16px, 1.04vw, 20px);
  border: 0.05vw solid #eaeaea;
  background: #fafafa;
  margin: clamp(23px, 2.65vh, 27px) 0.6vw clamp(9px, 1vh, 11px);
  box-sizing: border-box;
`;

export const AudienceIcon = styled.img`
  width: clamp(20px, 1.25vw, 24px);
  height: clamp(20px, 1.25vw, 24px);
  object-fit: contain;
`;

export const AudienceNum = styled.span`
  margin-left: auto;
  font-weight: 500;
  color: #5c5c5c;
`;

/* 정원(/50)은 흐린 회색으로 (Figma) */
export const AudienceCap = styled.span`
  font-weight: 500;
  color: #999;
`;

/* 빠른 설정 토글 리스트 (그리드 → 세로 스택, 가로형 스위치) */
export const QuickTogglesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8vh;
  padding: 0 0.6vw 1vh;
`;

export const ToggleLabel = styled.div`
  color: #5c5c5c;
  font-size: clamp(13px, 0.85vw, 16px);
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.4px;
  transition: color 0.2s ease;
`;

export const ToggleDescription = styled.p`
  margin: 0;
  color: #838383;
  font-size: clamp(9px, 0.6vw, 11px);
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: -0.3px;
  transition: color 0.2s ease;
`;

/* 라벨 + 설명을 세로로 묶는 텍스트 열 */
export const ToggleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2vh;
  min-width: 0;
`;

/* 토글 한 줄: 텍스트(좌) + 스위치(우) */
export const ToggleBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.6vw;
  min-height: clamp(50px, 5.56vh, 60px);
  padding: clamp(10px, 1vh, 14px) clamp(12px, 0.78vw, 15px);
  border-radius: clamp(16px, 1.04vw, 20px);
  border: 0.05vw solid #eaeaea;
  background: #fafafa;
  box-sizing: border-box;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:not(:has(input:checked)):hover {
    background: #f5f5f5;
  }

  &:has(input:checked) {
    background: #303030;
    border-color: #303030;
  }

  &:has(input:checked) ${ToggleLabel} {
    color: #ffffff;
  }

  &:has(input:checked) ${ToggleDescription} {
    color: #d0d0d0;
  }

  /* 가로형 행에서는 스위치를 세로 중앙 정렬 (카드용 margin/align 리셋) */
  & input[type="checkbox"] {
    margin-top: 0;
    align-self: center;
    flex-shrink: 0;
  }
`;

export const ToggleInput = styled.input.attrs({ type: "checkbox" })`
  --toggle-width: clamp(43px, 2.71vw, 52px);
  --toggle-height: clamp(23px, 2.59vh, 28px);
  --toggle-thumb: clamp(20px, 2.22vh, 24px);
  --toggle-offset: calc((var(--toggle-height) - var(--toggle-thumb)) / 2);

  appearance: none;
  width: var(--toggle-width);
  height: var(--toggle-height);
  margin-top: 2.8vh;
  border-radius: 100px;
  background: #ededed;
  position: relative;
  align-self: flex-end;
  cursor: pointer;
  transition: background 0.25s ease;

  &:checked {
    background: #e74d07;
  }

  &::after {
    content: "";
    position: absolute;
    top: var(--toggle-offset);
    left: var(--toggle-offset);
    width: var(--toggle-thumb);
    height: var(--toggle-thumb);
    background: #fff;
    border-radius: 100px;
    transition: transform 0.25s ease;
  }

  &:checked::after {
    transform: translateX(
      calc(var(--toggle-width) - var(--toggle-thumb) - (var(--toggle-offset) * 2))
    );
  }
`;
