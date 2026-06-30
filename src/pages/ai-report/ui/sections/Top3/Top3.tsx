import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import {
  SectionContainer,
  HeaderRow,
  SectionTitle,
  TabBar,
  TabButton,
  DescriptionBox,
  DescriptionText,
  Top3List,
  Top3Card,
  OrangeLine,
  CardLabel,
  CardContent,
  ListContainer,
  ListHeader,
  HeaderCount,
  ListBody,
  QuestionItem,
  ItemMeta,
  SlideBadge,
  ItemTime,
  ItemText,
  EmptyState,
} from "./Top3.styles";
import { loadStoredRoomData, computeRoomInfo } from "../../../model/room-info";
import {
  fetchTopQuestionsReport,
  fetchCompletedQuestions,
  fetchUnansweredQuestions,
  type QuestionItemResponse,
} from "@/shared/api/ai-report";

type TabKey = "top3" | "answered" | "unanswered";

const TABS: { key: TabKey; label: string; description: string }[] = [
  {
    key: "top3",
    label: "TOP 3 질문들",
    description: "실시간 질문들을 TOP 3 질문들로 정리해 드립니다.",
  },
  {
    key: "answered",
    label: "답변 완료한 질문",
    description: "답변이 완료된 질문들을 한눈에 확인할 수 있습니다.",
  },
  {
    key: "unanswered",
    label: "미답변 질문",
    description: "아직 답변되지 않은 질문들을 모아서 보여드립니다.",
  },
];

interface TopQuestionReportItem {
  representative?: string | null;
  samples?: string[];
  count?: number | null;
  slides?: number[] | null;
}

interface TopQuestionReport {
  top3?: TopQuestionReportItem[];
}

interface QuestionListItem {
  id: string;
  slideNumber: number;
  time: string;
  content: string;
}

// * epoch millis(ts) -> HH:MM 표기
const formatTime = (ts: number) => {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "--:--";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const toListItems = (items: QuestionItemResponse[]): QuestionListItem[] =>
  items.map((item) => ({
    id: item.id,
    slideNumber: item.slide,
    time: formatTime(item.ts),
    content: item.content,
  }));

const getQuestionText = (item?: TopQuestionReportItem | null) => {
  if (!item) return "해당 순위의 질문이 없습니다.";

  return (
    item.representative ||
    (Array.isArray(item.samples) && item.samples.length > 0 ? item.samples[0] : null) ||
    "질문 내용을 불러올 수 없습니다."
  );
};

const Top3 = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("top3");
  const [report, setReport] = useState<TopQuestionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [answeredItems, setAnsweredItems] = useState<QuestionListItem[]>([]);
  const [unansweredItems, setUnansweredItems] = useState<QuestionListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<Error | null>(null);

  const storedRoomData = useMemo(() => loadStoredRoomData(), []);

  const roomInfo = useMemo(
    () => computeRoomInfo(storedRoomData, location?.state),
    [storedRoomData, location?.state]
  );

  const { roomId } = roomInfo;

  useEffect(() => {
    let cancelled = false;

    if (!roomId) {
      setReport(null);
      setError(new Error("방 정보를 찾을 수 없습니다."));
      setLoading(false);
      return undefined;
    }

    const loadReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchTopQuestionsReport(roomId);
        if (!cancelled) {
          setReport(result);
        }
      } catch (err) {
        if (!cancelled) {
          setReport(null);
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  useEffect(() => {
    let cancelled = false;

    if (!roomId) {
      setAnsweredItems([]);
      setUnansweredItems([]);
      setListError(new Error("방 정보를 찾을 수 없습니다."));
      setListLoading(false);
      return undefined;
    }

    const loadLists = async () => {
      setListLoading(true);
      setListError(null);

      // * 두 목록은 독립적으로 처리해, 한쪽 실패가 다른 탭을 비우지 않도록 한다
      const [completed, unanswered] = await Promise.allSettled([
        fetchCompletedQuestions(roomId),
        fetchUnansweredQuestions(roomId),
      ]);

      if (cancelled) return;

      setAnsweredItems(completed.status === "fulfilled" ? toListItems(completed.value) : []);
      setUnansweredItems(unanswered.status === "fulfilled" ? toListItems(unanswered.value) : []);

      // * 두 요청이 모두 실패한 경우에만 에러 상태로 전환
      if (completed.status === "rejected" && unanswered.status === "rejected") {
        setListError(completed.reason as Error);
      } else {
        setListError(null);
      }
      setListLoading(false);
    };

    loadLists();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const topItems = report?.top3 ?? [];

  const cardTextForIndex = (index: number) => {
    if (loading) return "질문 데이터를 불러오는 중입니다...";
    if (error) return "질문 데이터를 불러오는 중 문제가 발생했습니다.";
    return getQuestionText(topItems[index]);
  };

  const activeDescription = TABS.find((tab) => tab.key === activeTab)?.description ?? "";

  const renderTop3 = () => (
    <Top3List>
      {[0, 1, 2].map((index) => {
        const highlight = index === 1;
        return (
          <Top3Card key={index} $highlight={highlight}>
            <OrangeLine />
            <CardLabel $highlight={highlight}>Top {index + 1} 질문</CardLabel>
            <CardContent $highlight={highlight}>{cardTextForIndex(index)}</CardContent>
          </Top3Card>
        );
      })}
    </Top3List>
  );

  const renderQuestionList = (label: string, items: QuestionListItem[]) => (
    <ListContainer>
      <ListHeader>
        {label} <HeaderCount>{items.length}</HeaderCount>개
      </ListHeader>
      <ListBody>
        {listLoading ? (
          <EmptyState>질문을 불러오는 중입니다...</EmptyState>
        ) : listError ? (
          <EmptyState>질문을 불러오는 중 문제가 발생했습니다.</EmptyState>
        ) : items.length === 0 ? (
          <EmptyState>표시할 질문이 없습니다.</EmptyState>
        ) : (
          items.map((item) => (
            <QuestionItem key={item.id}>
              <ItemMeta>
                <SlideBadge>슬라이드 {item.slideNumber}</SlideBadge>
                <ItemTime>{item.time}</ItemTime>
              </ItemMeta>
              <ItemText>{item.content}</ItemText>
            </QuestionItem>
          ))
        )}
      </ListBody>
    </ListContainer>
  );

  return (
    <SectionContainer>
      <HeaderRow>
        <SectionTitle>질문 모아보기</SectionTitle>
        <TabBar>
          {TABS.map((tab) => (
            <TabButton
              key={tab.key}
              type="button"
              $active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabBar>
        <DescriptionBox>
          <DescriptionText>{activeDescription}</DescriptionText>
        </DescriptionBox>
      </HeaderRow>

      {activeTab === "top3" && renderTop3()}
      {activeTab === "answered" && renderQuestionList("답변 완료한 질문", answeredItems)}
      {activeTab === "unanswered" && renderQuestionList("미답변 질문", unansweredItems)}
    </SectionContainer>
  );
};

export default Top3;
