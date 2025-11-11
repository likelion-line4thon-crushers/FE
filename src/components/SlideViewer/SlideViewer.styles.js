import styled from "styled-components";

/* 전체 컨테이너 */
export const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 4vh 1vw;
  background: #fff;
  width: 100%;
`;

/* 상단 FocusBar */
export const FocusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 2.5vh;
`;

/* 왼쪽 그룹 */
export const FocusGroupLeft = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1vw;
`;

/* 집중유도 버튼 */
export const FocusLeft = styled.div`
  color: #5c5c5c;
  font-family: Pretendard;
  font-size: clamp(14px, 1vw, 18px);
  font-weight: 600;
  display: inline-flex;
  height: 2.5vh;
  padding: 1.2vh 1vw;
  justify-content: center;
  align-items: center;
  border-radius: 5vh;
  border: 0.05vw solid #eaeaea;
  background: #eaeaea;
  gap: 0.4vw;
`;

/* 검정박스 (집중도바+범례) */
export const LegendContainer = styled.div`
  display: flex;
  align-items: center;
  height: 3vh;
  gap: 0.8vw;
  background: #1e1e1e;
  border-radius: 2vh;
  padding: 1vh 1vw;
  color: #fff;
  font-family: Pretendard;
  font-weight: 500;
  font-size: clamp(11px, 0.8vw, 14px);
`;

/* 집중도 막대 */
export const AudienceBar = styled.div`
  display: flex;
  width: 5vw;
  height: 2vh;
  border-radius: 0.4vh;
  overflow: hidden;
  border: 1px solid #444;
`;

export const SegmentPrev = styled.div`
  width: ${(p) => p.width}%;
  background: #c53b2c;
  transition: width 0.3s ease;
`;

export const SegmentCurrent = styled.div`
  width: ${(p) => p.width}%;
  background: #ffffff;
  transition: width 0.3s ease;
`;

export const SegmentNext = styled.div`
  width: ${(p) => p.width}%;
  background: #4467ff;
  transition: width 0.3s ease;
`;

export const SegmentDefault = styled.div`
  width: 100%;
  background: #666;
`;

/* 범례 */
export const LegendItem = styled.div`
  display: flex;
  font-size: clamp(10px, 0.7vw, 12px);
  align-items: center;
  gap: 0.2vw;
`;

export const ColorDot = styled.div`
  width: 0.8vw;
  height: 0.8vw;
  border-radius: 0.2vw;
  background: ${(p) => p.color};
  ${(p) => p.border && `border: 1px solid #ccc;`}
`;

/* 오른쪽 로고/타이머 */
export const FocusRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8vw;
`;

export const IconButton = styled.button`
  background: #fafafa;
  border: 0.05vw solid #eaeaea;
  border-radius: 50%;
  width: 2.5vw;
  height: 2.5vw;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const TimerButton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2vw;
  height: 3.3vh;
  background: #fafafa;
  border: 0.05vw solid #eaeaea;
  border-radius: 2vw;
  padding: 0.8vh 1vw;
  font-size: clamp(14px, 1vw, 18px);
  color: #5c5c5c;
`;

/* 슬라이드 컨테이너 */
export const SlideContainer = styled.div`
  position: relative;
  background-color: #ffffff;
  border-radius: 0.6vw;
  border: 0.05vw solid #ddd;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  aspect-ratio: 16 / 9;
`;
