import React from "react";
import type { QuestionCluster } from "@/entities/question";
import {
  LiveBox,
  QuestionContainer,
  QuestionItem,
  QuestionHeader,
  SlideTag,
  Content,
  StatusMessage,
} from "./QuestionList.styles";
import {
  ActionButton,
  ActionGroup,
  GroupTag,
  ExpandToggle,
  SampleItem,
  SamplesWrapper,
} from "./ClusterQuestionList.styles";

interface ClusterQuestionListProps {
  clusters: QuestionCluster[];
  isExpanded: (representative: string) => boolean;
  toggleExpand: (representative: string) => void;
  onComplete?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  onDismiss?: (representative: string) => void;
}

const ClusterQuestionList = ({
  clusters,
  isExpanded,
  toggleExpand,
  onComplete,
  onDelete,
  onDismiss,
}: ClusterQuestionListProps) => {
  const [actedReps, setActedReps] = React.useState<Set<string>>(new Set());

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

          return (
            <QuestionItem key={cluster.representative} $active={false}>
              <QuestionHeader>
                {isGroup ? (
                  <GroupTag>비슷한 질문들</GroupTag>
                ) : (
                  <SlideTag as="div" $active={false} style={{ cursor: "default" }}>
                    슬라이드 {cluster.slides[0] ?? 1}
                  </SlideTag>
                )}
                <ActionGroup>
                  <ActionButton
                    type="button"
                    $variant="delete"
                    aria-label="질문 삭제"
                    disabled={actedReps.has(cluster.representative)}
                    onClick={() => runAction(cluster.representative, cluster.questionIds, onDelete)}
                  >
                    삭제
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $variant="complete"
                    aria-label="질문 완료"
                    disabled={actedReps.has(cluster.representative)}
                    onClick={() =>
                      runAction(cluster.representative, cluster.questionIds, onComplete)
                    }
                  >
                    완료
                  </ActionButton>
                </ActionGroup>
              </QuestionHeader>

              <Content>{cluster.representative}</Content>

              {isGroup && (
                <ExpandToggle
                  type="button"
                  aria-label={`${expanded ? "접기" : "펼치기"} — 질문 ${cluster.count}개`}
                  onClick={() => toggleExpand(cluster.representative)}
                >
                  질문 {cluster.count}개 {expanded ? "▲" : "▶"}
                </ExpandToggle>
              )}

              {expanded && cluster.samples.length > 0 && (
                <SamplesWrapper>
                  {cluster.samples.map((sample, i) => (
                    <SampleItem key={`${cluster.representative}-${i}`}>{sample}</SampleItem>
                  ))}
                </SamplesWrapper>
              )}
            </QuestionItem>
          );
        })}
      </QuestionContainer>
    </LiveBox>
  );
};

export default ClusterQuestionList;
