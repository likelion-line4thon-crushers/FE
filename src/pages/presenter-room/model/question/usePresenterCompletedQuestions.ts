import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { completedQuestionsQuery, type QuestionItemResponse } from "@/shared/api/question";
import { normalizeQuestion, sortQuestionsAsc } from "@/entities/question";
import type { NormalizedQuestion } from "@/entities/question";

const isNormalizedQuestion = (q: NormalizedQuestion | null): q is NormalizedQuestion => q !== null;

const selectCompleted = (list: QuestionItemResponse[]): NormalizedQuestion[] =>
  sortQuestionsAsc(list.map(normalizeQuestion).filter(isNormalizedQuestion));

const usePresenterCompletedQuestions = ({
  roomId,
  enabled,
}: {
  roomId?: string;
  enabled: boolean;
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    ...completedQuestionsQuery(roomId ?? ""),
    enabled: !!roomId && enabled,
    select: selectCompleted,
    // 탭을 열 때마다 다시 가져온다 — 세션 중 완료 처리된 질문이 30초 캐시에 가려지면 안 된다.
    staleTime: 0,
  });

  const completedQuestions = useMemo(() => data ?? [], [data]);

  const reloadCompleted = useCallback(() => {
    void refetch();
  }, [refetch]);

  return { completedQuestions, loading: isLoading, error, reloadCompleted };
};

export default usePresenterCompletedQuestions;
