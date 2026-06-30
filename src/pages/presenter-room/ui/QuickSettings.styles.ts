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
  letter-spacing: -0.4px;
  transition: color 0.2s ease;
`;

/* 한 줄: 라벨(좌) + 토글(우) — 켜지면 행이 어둡게(#303030) 강조됨 (Figma) */
export const ToggleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.6vw;
  min-height: 52px;
  padding: 1.4vh 0.8vw;
  border-radius: 1vw;
  border: 0.05vw solid #eaeaea;
  background: #fafafa;
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
`;

/* 카드용 ToggleInput 의 margin/align 을 리셋해 행 안에서 우측 정렬 */
export const RowToggleInput = styled(ToggleInput)`
  margin: 0;
  flex-shrink: 0;
`;
