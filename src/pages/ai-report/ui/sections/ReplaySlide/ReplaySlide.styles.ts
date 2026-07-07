import styled from "styled-components";

export const ReplaySlideContainer = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 24px;
  padding-right: 2.8vw;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export const RevisitHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 36px;
  width: 100%;

  @media (max-width: 1180px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }
`;

export const HeaderTitle = styled.h2`
  margin: 0;
  color: #000;
  font-size: 32px;
  font-weight: 600;
  line-height: 42px;
  white-space: nowrap;
`;

export const HeaderDescriptionBox = styled.div`
  display: flex;
  min-height: 70px;
  flex: 1;
  align-items: center;
  overflow: hidden;
  border: 2px solid #eaeaea;
  border-radius: 8px;
  padding: 0 20px;
`;

export const HeaderDescriptionText = styled.p`
  margin: 0;
  color: #767676;
  font-size: 24px;
  font-weight: 400;
  line-height: 34px;
`;

export const CardsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 20px;
  width: 100%;
  min-width: 0;
`;

export const PreviewCard = styled.div`
  flex: 0 0 clamp(300px, 31.6%, 537px);
  height: 374px;
  overflow: hidden;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  background: #fafafa;
`;

export const PreviewInner = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  min-width: 0;
`;

export const SlidePreviewFrame = styled.div`
  display: flex;
  width: 100%;
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #eaeaea;
  border-radius: 7px;
  background: #f2f2f2;
`;

export const SlidePreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
`;

export const SlideBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #e74d07;
  color: #eaeaea;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
`;

export const ChartCard = styled.div`
  flex: 1;
  min-width: 0;
  height: 374px;
  overflow: hidden;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  background: #fafafa;
  padding: 32px;
`;

export const ChartHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
`;

export const ChartTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

export const AccentLine = styled.div`
  width: 24px;
  height: 4px;
  background: #e74d07;
`;

export const ChartTitle = styled.h3`
  margin: 0;
  color: #434343;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
`;

export const ChartBody = styled.div<{ $empty?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ $empty }) => ($empty ? "clamp(18px, 2vw, 34px)" : "clamp(18px, 2vw, 32px)")};
  margin-top: 22px;
  min-width: 0;
`;

export const RankingList = styled.div<{ $empty?: boolean }>`
  display: flex;
  flex: ${({ $empty }) => ($empty ? "0 1 694px" : "0 1 744px")};
  min-width: 0;
  flex-direction: column;
  gap: 13px;
`;

export const RankingRow = styled.div`
  display: flex;
  width: 100%;
  height: 34px;
  align-items: center;
  gap: 12px;
`;

export const RankBadge = styled.div<{ $active?: boolean; $muted?: boolean }>`
  display: flex;
  width: 32px;
  height: 24px;
  flex: 0 0 32px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? "#e74d07" : "#f0f0f0")};
  color: ${({ $active, $muted }) => ($active ? "#fafafa" : $muted ? "#bcbcbc" : "#767676")};
  font-size: 13px;
  font-weight: 700;
  line-height: 16px;
`;

export const SlideLabel = styled.div<{ $muted?: boolean }>`
  width: 94px;
  flex: 0 0 94px;
  color: ${({ $muted }) => ($muted ? "#bcbcbc" : "#434343")};
  font-size: 15px;
  font-weight: 600;
  line-height: 21px;
`;

export const BarTrack = styled.div`
  position: relative;
  height: 14px;
  flex: 1;
  overflow: hidden;
  border-radius: 7px;
  background: #efefef;
`;

export const BarFill = styled.div<{ $width: number; $color: string }>`
  width: ${({ $width }) => `${Math.min(Math.max($width, 0), 100)}%`};
  height: 14px;
  border-radius: 7px;
  background: ${({ $color }) => $color};
  transition: width 180ms ease;
`;

export const CountValue = styled.div<{ $active?: boolean; $muted?: boolean }>`
  width: 54px;
  flex: 0 0 54px;
  color: ${({ $active, $muted }) => ($active ? "#e74d07" : $muted ? "#bcbcbc" : "#434343")};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: ${({ $muted }) => ($muted ? "14px" : "15px")};
  font-weight: 700;
  line-height: ${({ $muted }) => ($muted ? "20px" : "21px")};
  text-align: right;
`;

export const InsightPanel = styled.div`
  display: flex;
  min-width: 220px;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding-top: 4px;
`;

export const InsightValue = styled.div`
  color: #434343;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 56px;
  font-weight: 700;
  line-height: 56px;
  white-space: nowrap;
`;

export const InsightLabel = styled.div`
  color: #434343;
  font-size: 16px;
  font-weight: 600;
  line-height: 23px;
`;

export const InsightText = styled.p`
  width: 100%;
  margin: 0;
  color: #767676;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
`;

export const EmptyInsightPanel = styled.div`
  display: flex;
  min-width: 240px;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding-top: 70px;
`;

export const EmptyInsightTitle = styled.div`
  width: 100%;
  color: #434343;
  font-size: 22px;
  font-weight: 700;
  line-height: 28px;
`;

export const Legend = styled.div`
  display: flex;
  height: 28px;
  align-items: center;
  gap: 8px;
`;

export const LegendDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e74d07;
`;

export const LegendLabel = styled.span`
  color: #767676;
  font-size: 13px;
  font-weight: 500;
  line-height: 17px;
`;
