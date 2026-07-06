import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { createLogger } from "@/shared/lib/logger";
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
  CsvDownloadButton,
  QuestionsContainer,
} from "./ReviewSlide.styles";
import { AITitle, ContentBox } from "../../summary";
import SatisfyImage from "@/shared/assets/images/AI/Satisfy.png";
import StarImage from "@/shared/assets/images/AI/Star.png";
import GrayFaceImage from "@/shared/assets/images/AI/reviewslide_face.png";
import DownloadCsvIcon from "@/shared/assets/images/AI/download-csv.svg";
import {
  fetchFeedbackReport,
  fetchAudienceVoiceReport,
  downloadAudienceVoiceCsv,
  type AudienceVoiceReport,
} from "@/shared/api/ai-report";
import { loadStoredRoomData, computeRoomInfo } from "../../../model/room-info";
import { SatisfactionCard } from "./SatisfactionCard";
import { QuestionVoiceCard } from "./QuestionVoiceCard";

const log = createLogger("ai-report");

interface FeedbackReport {
  averageRating?: number;
  summary?: string | null;
  feedbacks?: Array<{ comment?: string | null }>;
}

// 60초마다 청중 답변을 폴링한다. (요약은 서버에서 새 답변이 있을 때만 재생성)
const POLL_INTERVAL_MS = 60 * 1000;

const ReviewSlide = () => {
  const location = useLocation();
  const [feedbackData, setFeedbackData] = useState<FeedbackReport | null>(null);
  const [voiceData, setVoiceData] = useState<AudienceVoiceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [csvDownloading, setCsvDownloading] = useState(false);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const pendingRequestsRef = useRef(0);

  const storedRoomData = useMemo(() => loadStoredRoomData(), []);

  const roomInfo = useMemo(
    () => computeRoomInfo(storedRoomData, location?.state),
    [storedRoomData, location]
  );

  const { roomId } = roomInfo;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadFeedback = useCallback(
    async (mode: "initial" | "poll") => {
      if (!roomId) {
        requestIdRef.current += 1;
        setVoiceData(null);
        setFeedbackData(null);
        setError(new Error("roomId를 확인할 수 없습니다."));
        setLoading(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const canCommit = () => mountedRef.current && requestIdRef.current === requestId;
      const isInitialLoad = mode === "initial";
      pendingRequestsRef.current += 1;

      if (isInitialLoad) {
        setLoading(true);
      }

      try {
        const voice = await fetchAudienceVoiceReport(roomId);
        if (canCommit()) {
          setVoiceData(voice);
          setError(null);
        }

        if (!voice || !voice.hasQuestions) {
          try {
            const data = await fetchFeedbackReport(roomId);
            if (canCommit()) {
              setFeedbackData(data);
            }
          } catch (feedbackErr) {
            if (!canCommit()) {
              return;
            }
            if (isInitialLoad) {
              setFeedbackData(null);
              setError(feedbackErr);
            } else {
              log.warn("후기 업데이트 실패 (기존 데이터 유지):", feedbackErr);
            }
          }
        }
      } catch (err) {
        if (!canCommit()) {
          return;
        }
        if (isInitialLoad) {
          setVoiceData(null);
          setError(err);
        } else {
          log.warn("청중의 목소리 업데이트 실패 (기존 데이터 유지):", err);
        }
      } finally {
        pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
        if (canCommit() && isInitialLoad) {
          setLoading(false);
        }
      }
    },
    [roomId]
  );

  useEffect(() => {
    if (!roomId) {
      requestIdRef.current += 1;
      setVoiceData(null);
      setFeedbackData(null);
      setError(new Error("roomId를 확인할 수 없습니다."));
      setLoading(false);
      return undefined;
    }

    loadFeedback("initial");

    const intervalId = window.setInterval(() => {
      if (pendingRequestsRef.current === 0) {
        loadFeedback("poll");
      }
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadFeedback, roomId]);

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

  const handleDownloadCsv = useCallback(async () => {
    if (!roomId) {
      return;
    }

    setCsvDownloading(true);
    try {
      await downloadAudienceVoiceCsv(roomId);
    } catch (err) {
      log.error("청중의 목소리 CSV 다운로드 실패:", err);
      alert("CSV 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setCsvDownloading(false);
    }
  }, [roomId]);

  const hasQuestions = Boolean(voiceData?.hasQuestions);

  return (
    <ReviewSlideContainer>
      <SectionHeaderRow>
        <SectionTitleWrap>
          <AITitle title="청중의 목소리" description="청중이 세션에 대해 남긴 후기와 의견입니다." />
        </SectionTitleWrap>
        {hasQuestions && (
          <CsvDownloadButton type="button" onClick={handleDownloadCsv} disabled={csvDownloading}>
            <img src={DownloadCsvIcon} alt="" />
            CSV 다운로드
          </CsvDownloadButton>
        )}
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
