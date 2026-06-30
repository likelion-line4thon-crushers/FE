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
  isExpanded: (representative: string) => boolean;
  toggleExpand: (representative: string) => void;
  onComplete?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  onDismiss?: (representative: string) => void;
  tsByContent?: Map<string, number>;
}

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
  onDismiss,
  tsByContent,
}: ClusterQuestionListProps) => {
  const [actedReps, setActedReps] = React.useState<Set<string>>(new Set());

  const timeFor = (content: string) => formatTimestamp(tsByContent?.get(content));

  const runAction = (rep: string, ids: string[], fn?: (id: string) => void) => {
    if (actedReps.has(rep)) return;
    setActedReps((prev) => new Set(prev).add(rep));
    ids.forEach((id) => fn?.(id));
    onDismiss?.(rep);
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
          const isGroup = cluster.count > 1;
          const expanded = isGroup && isExpanded(cluster.representative);
          const acted = actedReps.has(cluster.representative);

          if (!isGroup) {
            return (
              <ClusterItem key={cluster.representative}>
                <QuestionHeader>
                  <SlideTag as="div" $active={false} style={{ cursor: "default" }}>
                    슬라이드 {cluster.slides[0] ?? 1}
                  </SlideTag>
                  {timeFor(cluster.representative) && (
                    <Time>{timeFor(cluster.representative)}</Time>
                  )}
                  <ActionGroup>
                    <ActionButton
                      type="button"
                      $variant="delete"
                      aria-label="질문 삭제"
                      disabled={acted}
                      onClick={() =>
                        runAction(cluster.representative, cluster.questionIds, onDelete)
                      }
                    >
                      삭제
                    </ActionButton>
                    <ActionButton
                      type="button"
                      $variant="complete"
                      aria-label="질문 완료"
                      disabled={acted}
                      onClick={() =>
                        runAction(cluster.representative, cluster.questionIds, onComplete)
                      }
                    >
                      완료
                    </ActionButton>
                  </ActionGroup>
                </QuestionHeader>
                <Content>{cluster.representative}</Content>
              </ClusterItem>
            );
          }

          return (
            <ClusterItem key={cluster.representative}>
              <QuestionHeader>
                <GroupTag>비슷한 질문들</GroupTag>
                {timeFor(cluster.representative) && <Time>{timeFor(cluster.representative)}</Time>}
                <ActionGroup>
                  <ActionButton
                    type="button"
                    $variant="delete"
                    aria-label="질문 삭제"
                    disabled={acted}
                    onClick={() => runAction(cluster.representative, cluster.questionIds, onDelete)}
                  >
                    삭제
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $variant="complete"
                    aria-label="질문 완료"
                    disabled={acted}
                    onClick={() =>
                      runAction(cluster.representative, cluster.questionIds, onComplete)
                    }
                  >
                    완료
                  </ActionButton>
                </ActionGroup>
              </QuestionHeader>

              <Content>{cluster.representative}</Content>

              {expanded &&
                cluster.samples.map((sample, i) => (
                  <SubQuestion key={`${cluster.representative}-${i}`}>
                    <QuestionHeader>
                      <SlideTag as="div" $active={false} style={{ cursor: "default" }}>
                        슬라이드 {cluster.slides[i] ?? cluster.slides[0] ?? 1}
                      </SlideTag>
                      {timeFor(sample) && <Time>{timeFor(sample)}</Time>}
                      <ActionGroup>
                        <ActionButton
                          type="button"
                          $variant="delete"
                          aria-label="질문 삭제"
                          disabled={acted}
                          onClick={() =>
                            runAction(cluster.representative, cluster.questionIds, onDelete)
                          }
                        >
                          삭제
                        </ActionButton>
                        <ActionButton
                          type="button"
                          $variant="complete"
                          aria-label="질문 완료"
                          disabled={acted}
                          onClick={() =>
                            runAction(cluster.representative, cluster.questionIds, onComplete)
                          }
                        >
                          완료
                        </ActionButton>
                      </ActionGroup>
                    </QuestionHeader>
                    <Content>{sample}</Content>
                  </SubQuestion>
                ))}

              <ClusterToggle
                type="button"
                $expanded={expanded}
                aria-label={`${expanded ? "접기" : "펼치기"} — 질문 ${cluster.count}개`}
                onClick={() => toggleExpand(cluster.representative)}
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
