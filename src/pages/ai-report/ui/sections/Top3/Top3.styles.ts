import styled from "styled-components";

// * 콘텐츠 우측 여백을 다른 섹션과 동일하게 유지
const RIGHT_GUTTER = "2.8vw";

export const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 36px;
  padding-right: ${RIGHT_GUTTER};
`;

export const SectionTitle = styled.h1`
  color: #000;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.8px;
  margin: 0;
  white-space: nowrap;
`;

export const TabBar = styled.div`
  display: flex;
  align-items: stretch;
  height: 70px;
  padding: 4px;
  gap: 4px;
  border-radius: 8px;
  background: #f1f1f1;
  box-sizing: border-box;
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  padding: 4px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  letter-spacing: -0.5px;
  white-space: nowrap;
  background: ${(props) => (props.$active ? "#303030" : "transparent")};
  color: ${(props) => (props.$active ? "#fff" : "#767676")};
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  transition:
    background 0.15s ease,
    color 0.15s ease;
`;

export const DescriptionBox = styled.div`
  flex: 1;
  min-width: 0;
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  border: 2px dashed #eaeaea;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  box-sizing: border-box;
`;

export const DescriptionText = styled.p`
  margin: 0;
  color: #767676;
  font-size: 24px;
  letter-spacing: -0.6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// * TOP 3 탭 카드
export const Top3List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: ${RIGHT_GUTTER};
`;

export const Top3Card = styled.div<{ $highlight?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 31px;
  border-radius: 12px;
  background: ${(props) => (props.$highlight ? "#303030" : "#fafafa")};
  border: 1px solid ${(props) => (props.$highlight ? "#767676" : "#eaeaea")};
`;

export const OrangeLine = styled.div`
  width: 24px;
  height: 4px;
  background: #e74d07;
`;

export const CardLabel = styled.p<{ $highlight?: boolean }>`
  margin: 8px 0 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  letter-spacing: -0.5px;
  color: ${(props) => (props.$highlight ? "#fff" : "#434343")};
`;

export const CardContent = styled.p<{ $highlight?: boolean }>`
  margin: 16px 0 0;
  font-size: 40px;
  font-weight: 400;
  line-height: 52px;
  letter-spacing: -1px;
  white-space: pre-line;
  color: ${(props) => (props.$highlight ? "#fff" : "#434343")};
`;

// * 답변 완료 / 미답변 탭 리스트
export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 608px;
  border-radius: 12px;
  background: #fafafa;
  overflow: hidden;
  margin-right: ${RIGHT_GUTTER};
`;

export const ListHeader = styled.p`
  margin: 0;
  flex-shrink: 0;
  height: 57px;
  line-height: 57px;
  padding: 0 32px;
  border-bottom: 1px solid #eaeaea;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.45px;
  color: #000;
`;

export const HeaderCount = styled.span`
  color: #e74d07;
`;

export const ListBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 26px 32px 32px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cacbd5;
    border-radius: 100px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const QuestionItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

export const SlideBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background: #5c5c5c;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: -0.3px;
  white-space: nowrap;
`;

export const ItemTime = styled.span`
  color: #767676;
  font-size: 12px;
  line-height: 1.45;
  letter-spacing: -0.3px;
`;

export const ItemText = styled.p`
  margin: 0;
  color: #111;
  font-size: 18px;
  line-height: 1.4;
  letter-spacing: -0.45px;
`;

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #767676;
  font-size: 18px;
  letter-spacing: -0.45px;
`;
