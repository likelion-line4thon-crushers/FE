import styled from "styled-components";

/* 전체 패널 */
export const PanelWrapper = styled.aside`
  width: 17vw;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  border-radius: 0.6vw;
  box-shadow: 0 0.05vw 0.2vw rgba(0, 0, 0, 0.08);
  overflow-y: auto;
`;

/* 구역 */
export const Section = styled.section`
  display: flex;
  flex-direction: column;
  padding: 0;
`;

/* 상단 제목바 */
export const Title = styled.h2`
  height: 3vh;
  margin: 0;
  padding: 0.7vh 0.55vw;
  font-size: clamp(12px, 0.8vw, 15px);
  font-weight: 600;
  color: #303030;
  border-bottom: 0.05vw solid #eaeaea;
  background: #f9f9f9;
  display: flex;
  align-items: center;
`;

/* 청중 수 영역 */
export const AudienceCountWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 1.2vh 0.8vw;
  gap: 0.4vw;
  color: #5c5c5c;
  font-size: clamp(13px, 0.9vw, 16px);
  font-weight: 600;
  border-radius: 1vw;
  border: 0.05vw solid #eaeaea;
  background: #fafafa;
  margin: 1vh 0.6vw;
`;

export const AudienceIcon = styled.img`
  width: 1.2vw;
  height: 1.2vw;
  object-fit: contain;
`;

export const AudienceNum = styled.span`
  margin-left: auto;
  font-weight: 600;
  color: #555;
`;

/* 빠른 설정 토글 그리드 */
export const QuickTogglesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4vw;
  padding: 0 0.6vw 1vh;
`;

export const ToggleLabel = styled.div`
  color: #5c5c5c;
  font-size: clamp(11px, 0.75vw, 14px);
  font-weight: 600;
`;

export const ToggleDescription = styled.p`
  margin: 0;
  color: #838383;
  font-size: clamp(9px, 0.6vw, 11px);
  font-weight: 400;
`;

/* 토글 박스 */
export const ToggleBox = styled.div`
  border-radius: 1vw;
  border: 0.05vw solid #eaeaea;
  background: #fafafa;
  padding: 1.5vh 0.8vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.1vh;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }

  &:has(input:checked) {
    background: #303030;
    border-color: #303030;
  }

  &:has(input:checked) ${ToggleLabel}, &:has(input:checked) ${ToggleDescription} {
    color: #ffffff;
  }
`;

export const ToggleInput = styled.input.attrs({ type: "checkbox" })`
  appearance: none;
  width: 2.7vw;
  height: 2.6vh;
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
    top: 0.2vh;
    left: 0.2vw;
    width: 1.2vw;
    height: 2.2vh;
    background: #fff;
    border-radius: 100px;
    transition: transform 0.25s ease;
  }

  &:checked::after {
    transform: translateX(1.2vw);
  }
`;
