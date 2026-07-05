import styled from "styled-components";
import { ToggleInput } from "@/widgets/presentation-layout";

/* 빠른 설정 토글 리스트 (Figma: 카드 그리드 → 세로 선형 레이아웃) */
export const QuickTogglesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8vh;
  padding: 0 0.6vw 1vh;
`;

export const ToggleRowLabel = styled.span`
  color: #5c5c5c;
  font-size: clamp(13px, 0.85vw, 16px);
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.4px;
  transition: color 0.2s ease;
`;

/* 라벨 아래 보조 설명 (Figma: 스위치 설명 문구) */
export const ToggleRowDescription = styled.p`
  margin: 0;
  color: #838383;
  font-size: clamp(9px, 0.6vw, 11px);
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: -0.3px;
  transition: color 0.2s ease;
`;

/* 라벨 + 설명을 세로로 묶는 텍스트 열 */
export const ToggleRowText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2vh;
  min-width: 0;
`;

/* 한 줄: 텍스트(좌) + 토글(우) — 켜지면 행이 어둡게(#303030) 강조됨 (Figma) */
export const ToggleRow = styled.div`
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

  &:has(input:checked) ${ToggleRowLabel} {
    color: #ffffff;
  }

  &:has(input:checked) ${ToggleRowDescription} {
    color: #d0d0d0;
  }
`;

/* 카드용 ToggleInput 의 margin/align 을 리셋해 행 안에서 우측 정렬 */
export const RowToggleInput = styled(ToggleInput)`
  margin: 0 !important;
  align-self: center;
  flex-shrink: 0;
`;
