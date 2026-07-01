import React from "react";
import type { QuestionCluster } from "@/entities/question";
import {
  LiveBox,
  QuestionContainer,
  QuestionHeader,
  SlideTag,
  Time,
  Content,
  StatusMessage,
} from "./QuestionList.styles";
import {
  ActionButton,
  ActionGroup,
  ClusterItem,
  GroupTag,
  SubQuestion,
  ClusterToggle,
  Chevron,
} from "./ClusterQuestionList.styles";

interface ClusterQuestionListProps {
  clusters: QuestionCluster[];
  isExpanded: (clusterKey: string) => boolean;
  toggleExpand: (clusterKey: string) => void;
  onComplete?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  tsByContent?: Map<string, number>;
}

type ClusterDisplayQuestion = {
  id: string;
  content: string;
  slide: number;
  ts?: number;
};

const formatTimestamp = (ts: number | null | undefined) => {
  if (ts === null || ts === undefined) return "";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
};

const ChevronIcon = ({ up }: { up: boolean }) => (
  <Chevron $up={up}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 6L8 10L12 6"
        stroke="#303030"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </Chevron>
);

const ClusterQuestionList = ({
  clusters,
  isExpanded,
  toggleExpand,
  onComplete,
  onDelete,
  tsByContent,
}: ClusterQuestionListProps) => {
  const [actedQuestionIds, setActedQuestionIds] = React.useState<Set<string>>(new Set());

  const timeFor = (content: string) => formatTimestamp(tsByContent?.get(content));

  const runAction = (questionId: string | undefined, fn?: (id: string) => void) => {
    if (!questionId || actedQuestionIds.has(questionId)) return;
    setActedQuestionIds((prev) => new Set(prev).add(questionId));
    fn?.(questionId);
  };

  const runRepresentativeAction = (
    questionId: string | undefined,
    relatedQuestionIds: string[],
    fn?: (id: string) => void
  ) => {
    if (!questionId || actedQuestionIds.has(questionId)) return;
    setActedQuestionIds((prev) => {
      const next = new Set(prev);
      relatedQuestionIds.forEach((id) => next.add(id));
      return next;
    });
    fn?.(questionId);
  };

  const questionsFor = (cluster: QuestionCluster): ClusterDisplayQuestion[] => {
    if (Array.isArray(cluster.questions) && cluster.questions.length > 0) {
      return cluster.questions.map((question) => ({
        id: question.id,
        content: question.content,
        slide: question.slide,
        ts: question.ts,
      }));
    }

    return cluster.questionIds.map((id, index) => ({
      id,
      content: index === 0 ? cluster.representative : (cluster.samples[index] ?? ""),
      slide: cluster.slides[index] ?? cluster.slides[0] ?? 1,
    }));
  };

  if (clusters.length === 0) {
    return (
      <LiveBox>
        <QuestionContainer>
          <StatusMessage>아직 등록된 질문이 없습니다.</StatusMessage>
        </QuestionContainer>
      </LiveBox>
    );
  }

  return (
    <LiveBox>
      <QuestionContainer>
        {clusters.map((cluster) => {
          const key = cluster.clusterId ?? cluster.representative;
          const questions = questionsFor(cluster);
          const representativeId = cluster.representativeQuestionId ?? questions[0]?.id;
          const representativeQuestion =
            questions.find((question) => question.id === representativeId) ?? questions[0];
          const representativeText = representativeQuestion?.content ?? cluster.representative;
          const representativeSlide = representativeQuestion?.slide ?? cluster.slides[0] ?? 1;
          const representativeTime =
            formatTimestamp(representativeQuestion?.ts) || timeFor(representativeText);
          const subQuestions = questions.filter((question) => question.id !== representativeId);
          const relatedQuestionIds = questions.map((question) => question.id);
          const isGroup = cluster.count > 1;
          const expanded = isGroup && isExpanded(key);
          const representativeActed = representativeId
            ? actedQuestionIds.has(representativeId)
            : false;

          if (!isGroup) {
            return (
              <ClusterItem key={key}>
                <QuestionHeader>
                  <SlideTag as="div" $active={false} style={{ cursor: "default" }}>
                    슬라이드 {representativeSlide}
                  </SlideTag>
                  {representativeTime && <Time>{representativeTime}</Time>}
                  <ActionGroup>
                    <ActionButton
                      type="button"
                      $variant="delete"
                      aria-label="질문 삭제"
                      disabled={representativeActed}
                      onClick={() =>
                        runRepresentativeAction(representativeId, relatedQuestionIds, onDelete)
                      }
                    >
                      삭제
                    </ActionButton>
                    <ActionButton
                      type="button"
                      $variant="complete"
                      aria-label="질문 완료"
                      disabled={representativeActed}
                      onClick={() =>
                        runRepresentativeAction(representativeId, relatedQuestionIds, onComplete)
                      }
                    >
                      완료
                    </ActionButton>
                  </ActionGroup>
                </QuestionHeader>
                <Content>{representativeText}</Content>
              </ClusterItem>
            );
          }

          return (
            <ClusterItem key={key}>
              <QuestionHeader>
                <GroupTag>비슷한 질문들</GroupTag>
                {representativeTime && <Time>{representativeTime}</Time>}
                <ActionGroup>
                  <ActionButton
                    type="button"
                    $variant="delete"
                    aria-label="질문 삭제"
                    disabled={representativeActed}
                    onClick={() =>
                      runRepresentativeAction(representativeId, relatedQuestionIds, onDelete)
                    }
                  >
                    삭제
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $variant="complete"
                    aria-label="질문 완료"
                    disabled={representativeActed}
                    onClick={() =>
                      runRepresentativeAction(representativeId, relatedQuestionIds, onComplete)
                    }
                  >
                    완료
                  </ActionButton>
                </ActionGroup>
              </QuestionHeader>

              <Content>{representativeText}</Content>

              {expanded &&
                subQuestions.map((question) => {
                  const acted = actedQuestionIds.has(question.id);
                  const timestamp = formatTimestamp(question.ts) || timeFor(question.content);

                  return (
                    <SubQuestion key={question.id}>
                      <QuestionHeader>
                        <SlideTag as="div" $active={false} style={{ cursor: "default" }}>
                          슬라이드 {question.slide}
                        </SlideTag>
                        {timestamp && <Time>{timestamp}</Time>}
                        <ActionGroup>
                          <ActionButton
                            type="button"
                            $variant="delete"
                            aria-label="질문 삭제"
                            disabled={acted}
                            onClick={() => runAction(question.id, onDelete)}
                          >
                            삭제
                          </ActionButton>
                          <ActionButton
                            type="button"
                            $variant="complete"
                            aria-label="질문 완료"
                            disabled={acted}
                            onClick={() => runAction(question.id, onComplete)}
                          >
                            완료
                          </ActionButton>
                        </ActionGroup>
                      </QuestionHeader>
                      <Content>{question.content}</Content>
                    </SubQuestion>
                  );
                })}

              <ClusterToggle
                type="button"
                $expanded={expanded}
                aria-label={`${expanded ? "접기" : "펼치기"} — 질문 ${cluster.count}개`}
                onClick={() => toggleExpand(key)}
              >
                {expanded ? "숨기기" : `질문 ${cluster.count}개`}
                <ChevronIcon up={expanded} />
              </ClusterToggle>
            </ClusterItem>
          );
        })}
      </QuestionContainer>
    </LiveBox>
  );
};

export default ClusterQuestionList;
