import { useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { useSetAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { audienceVoiceCsvEnabledAtom } from "@/entities/room";
import {
  ReviewSlideContainer,
  TotalContainer,
  LeftBoxContainer,
  RightBoxContainer,
  RatingWrapper,
  RatingRow,
  RatingScore,
  SummaryBoxContainer,
  FeedbackListCardWrapper,
  CenterHeader,
  SmallDivider,
  SectionHeaderRow,
  SectionTitleWrap,
  QuestionsContainer,
} from "./ReviewSlide.styles";
import { AITitle, ContentBox } from "../../summary";
import SatisfyImage from "@/shared/assets/images/AI/Satisfy.png";
import StarImage from "@/shared/assets/images/AI/Star.png";
import GrayFaceImage from "@/shared/assets/images/AI/reviewslide_face.png";
import {
  audienceVoiceReportQuery,
  feedbackReportQuery,
  type AudienceVoiceReport,
} from "@/shared/api/ai-report";
import { loadStoredRoomData, computeRoomInfo } from "../../../model/room-info";
import { SatisfactionCard } from "./SatisfactionCard";
import { QuestionVoiceCard } from "./QuestionVoiceCard";

interface FeedbackReport {
  averageRating?: number;
  summary?: string | null;
  feedbacks?: Array<{ comment?: string | null }>;
}

// 60초마다 청중 답변을 폴링한다. (요약은 서버에서 새 답변이 있을 때만 재생성)
const POLL_INTERVAL_MS = 60 * 1000;

const ReviewSlide = () => {
  const location = useLocation();

  const storedRoomData = useMemo(() => loadStoredRoomData(), []);

  const roomInfo = useMemo(
    () => computeRoomInfo(storedRoomData, location?.state),
    [storedRoomData, location]
  );

  const { roomId } = roomInfo;

  const voiceQuery = useQuery({
    ...audienceVoiceReportQuery(roomId ?? ""),
    enabled: !!roomId,
    refetchInterval: POLL_INTERVAL_MS,
  });
  const voice = voiceQuery.data;

  // 후기는 청중 질문이 없을 때만 조회하는 종속 쿼리다.
  // isSuccess 대신 data 기준으로 게이트한다 — 폴링 한 번 실패해도(status 'error', data 유지)
  // 후기 폴링이 멈추면 안 된다.
  const feedbackQuery = useQuery({
    ...feedbackReportQuery(roomId ?? ""),
    enabled: voice !== undefined && !voice?.hasQuestions,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const voiceData: AudienceVoiceReport | null = voice ?? null;
  const feedbackData: FeedbackReport | null = feedbackQuery.data ?? null;

  // 폴링 실패는 error 를 세팅하되 이전 데이터를 유지하므로, UI 에러는 아직 데이터가 없는
  // 초기 로드 실패에서만 켠다. (초기 로딩은 isLoading 으로 판단)
  const loading = voiceQuery.isLoading || feedbackQuery.isLoading;
  const error = useMemo(() => {
    if (!roomId) return new Error("roomId를 확인할 수 없습니다.");
    if (voiceQuery.error && voiceQuery.data === undefined) return voiceQuery.error;
    if (feedbackQuery.error && feedbackQuery.data === undefined) return feedbackQuery.error;
    return null;
  }, [roomId, voiceQuery.error, voiceQuery.data, feedbackQuery.error, feedbackQuery.data]);

  const averageRating = useMemo(() => {
    if (loading || error) {
      return "0.0";
    }
    return feedbackData?.averageRating?.toFixed(1) ?? "0.0";
  }, [feedbackData, loading, error]);

  const summaryText = useMemo(() => {
    if (loading) {
      return "청중 후기 요약을 불러오는 중입니다...";
    }
    if (error) {
      return "후기 요약을 불러오는 중 오류가 발생했습니다.";
    }
    return feedbackData?.summary ?? "청중 후기가 없습니다.";
  }, [feedbackData, loading, error]);

  const feedbackListContent = useMemo(() => {
    if (loading) {
      return "• 후기 목록을 불러오는 중입니다...";
    }
    if (error) {
      return "• 후기 데이터를 불러오는 중 문제가 발생했습니다.";
    }
    if (!feedbackData?.feedbacks || feedbackData.feedbacks.length === 0) {
      return "• 아직 등록된 후기가 없습니다.";
    }
    return feedbackData.feedbacks
      .map((feedback: { comment?: string | null }) => {
        const comment = feedback?.comment?.trim() || "";
        return comment ? `• ${comment}` : null;
      })
      .filter(Boolean)
      .join("\n");
  }, [feedbackData, loading, error]);

  const hasQuestions = Boolean(voiceData?.hasQuestions);

  // 내보낼 답변이 하나라도 있을 때만 GNB 의 CSV 버튼을 활성화한다.
  const setCsvEnabled = useSetAtom(audienceVoiceCsvEnabledAtom);
  useEffect(() => {
    const hasAnswers = Boolean(
      voiceData?.hasQuestions && voiceData.questions.some((q) => q.answerCount > 0)
    );
    setCsvEnabled(hasAnswers);
  }, [voiceData, setCsvEnabled]);
  useEffect(() => () => setCsvEnabled(false), [setCsvEnabled]);

  return (
    <ReviewSlideContainer>
      <SectionHeaderRow>
        <SectionTitleWrap>
          <AITitle title="청중의 목소리" description="청중이 세션에 대해 남긴 후기와 의견입니다." />
        </SectionTitleWrap>
      </SectionHeaderRow>

      {hasQuestions && voiceData ? (
        <>
          <SatisfactionCard averageRating={voiceData.averageRating} />
          <QuestionsContainer>
            {voiceData.questions.map((question, index) => (
              <QuestionVoiceCard
                key={question.questionId}
                index={index + 1}
                question={question}
                summarizationEnabled={voiceData.summarizationEnabled}
              />
            ))}
          </QuestionsContainer>
        </>
      ) : (
        <TotalContainer>
          <LeftBoxContainer>
            <ContentBox title="" variant="custom" width="640px" height="300px">
              <CenterHeader>
                <img src={SatisfyImage} alt="satisfy" width={48} height={48} />
                <h2>세션 만족도</h2>
                <SmallDivider />
              </CenterHeader>
              <RatingWrapper>
                <RatingRow>
                  <img src={StarImage} alt="star" width={28} height={28} />
                  <RatingScore>
                    {averageRating}점 <span>/ 5점</span>
                  </RatingScore>
                </RatingRow>
              </RatingWrapper>
            </ContentBox>

            <ContentBox title="청중 후기 요약" variant="custom" height="300px" width="640px">
              <SummaryBoxContainer>
                <img className="icon-image" src={GrayFaceImage} alt="face" />
                <h2>청중 후기 요약</h2>
                <SmallDivider />
                <h3>{summaryText}</h3>
              </SummaryBoxContainer>
            </ContentBox>
          </LeftBoxContainer>
          <RightBoxContainer>
            <FeedbackListCardWrapper>
              <ContentBox
                title="청중 후기 및 의견 모음"
                variant="text"
                width="765px"
                height="650px"
                content={feedbackListContent}
                titleStyle={{
                  color: "#434343",
                  fontSize: "20px",
                  fontWeight: "600",
                  fontStyle: "normal",
                }}
                contentStyle={{
                  color: "#5C5C5C",
                  fontSize: "19px",
                  fontWeight: "400",
                  fontStyle: "normal",
                }}
              />
            </FeedbackListCardWrapper>
          </RightBoxContainer>
        </TotalContainer>
      )}
    </ReviewSlideContainer>
  );
};

export default ReviewSlide;
