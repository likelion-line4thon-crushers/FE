import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  RefreshControls,
  RefreshCooldownText,
  RefreshButton,
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

const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const MANUAL_REFRESH_COOLDOWN_MS = 60 * 1000;

const ReviewSlide = () => {
  const location = useLocation();
  const [feedbackData, setFeedbackData] = useState<FeedbackReport | null>(null);
  const [voiceData, setVoiceData] = useState<AudienceVoiceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requestInFlight, setRequestInFlight] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [csvDownloading, setCsvDownloading] = useState(false);
  const [nextManualRefreshAt, setNextManualRefreshAt] = useState<number | null>(null);
  const [cooldownNow, setCooldownNow] = useState(() => Date.now());
  const mountedRef = useRef(true);
  const feedbackRequestIdRef = useRef(0);
  const pendingFeedbackRequestsRef = useRef(0);

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

  const cooldownRemainingSeconds = useMemo(() => {
    if (!nextManualRefreshAt) {
      return 0;
    }

    return Math.max(0, Math.ceil((nextManualRefreshAt - cooldownNow) / 1000));
  }, [cooldownNow, nextManualRefreshAt]);

  const loadFeedback = useCallback(
    async (mode: "initial" | "auto" | "manual") => {
      if (!roomId) {
        feedbackRequestIdRef.current += 1;
        setVoiceData(null);
        setFeedbackData(null);
        setError(new Error("roomId를 확인할 수 없습니다."));
        setLoading(false);
        setRefreshing(false);
        setRequestInFlight(false);
        return;
      }

      const requestId = feedbackRequestIdRef.current + 1;
      feedbackRequestIdRef.current = requestId;
      const canCommit = () => mountedRef.current && feedbackRequestIdRef.current === requestId;
      const isInitialLoad = mode === "initial";
      const isManualRefresh = mode === "manual";
      pendingFeedbackRequestsRef.current += 1;
      setRequestInFlight(true);

      if (isInitialLoad) {
        setLoading(true);
      }
      if (isManualRefresh) {
        setRefreshing(true);
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
        pendingFeedbackRequestsRef.current = Math.max(0, pendingFeedbackRequestsRef.current - 1);
        if (pendingFeedbackRequestsRef.current === 0 && mountedRef.current) {
          setRequestInFlight(false);
        }

        if (!canCommit()) {
          if (isManualRefresh && mountedRef.current) {
            setRefreshing(false);
          }
          return;
        }

        if (isInitialLoad) {
          setLoading(false);
        }
        if (isManualRefresh) {
          setRefreshing(false);
        }
      }
    },
    [roomId]
  );

  useEffect(() => {
    if (!roomId) {
      feedbackRequestIdRef.current += 1;
      setVoiceData(null);
      setFeedbackData(null);
      setError(new Error("roomId를 확인할 수 없습니다."));
      setLoading(false);
      setRefreshing(false);
      setRequestInFlight(false);
      return undefined;
    }

    setNextManualRefreshAt(null);
    loadFeedback("initial");

    const intervalId = window.setInterval(() => {
      if (pendingFeedbackRequestsRef.current === 0) {
        loadFeedback("auto");
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadFeedback, roomId]);

  useEffect(() => {
    if (!nextManualRefreshAt) {
      return undefined;
    }

    if (nextManualRefreshAt <= Date.now()) {
      setNextManualRefreshAt(null);
      return undefined;
    }

    const updateCooldownNow = () => {
      const now = Date.now();
      setCooldownNow(now);
      if (now >= nextManualRefreshAt) {
        setNextManualRefreshAt(null);
      }
    };

    updateCooldownNow();
    const intervalId = window.setInterval(() => {
      updateCooldownNow();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [nextManualRefreshAt]);

  const handleManualRefresh = useCallback(() => {
    if (!roomId || loading || refreshing || requestInFlight || cooldownRemainingSeconds > 0) {
      return;
    }

    const now = Date.now();
    setCooldownNow(now);
    setNextManualRefreshAt(now + MANUAL_REFRESH_COOLDOWN_MS);
    loadFeedback("manual");
  }, [cooldownRemainingSeconds, loadFeedback, loading, refreshing, requestInFlight, roomId]);

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

  const refreshButtonLabel = useMemo(() => {
    if (requestInFlight) {
      return "청중 후기 새로고침 중";
    }
    if (cooldownRemainingSeconds > 0) {
      return `청중 후기 새로고침 대기 ${cooldownRemainingSeconds}초`;
    }
    return "청중 후기 새로고침";
  }, [cooldownRemainingSeconds, requestInFlight]);

  const isRefreshDisabled =
    loading || refreshing || requestInFlight || cooldownRemainingSeconds > 0 || !roomId;

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
        <RefreshControls>
          {cooldownRemainingSeconds > 0 && (
            <RefreshCooldownText>{cooldownRemainingSeconds}초 후 가능</RefreshCooldownText>
          )}
          <RefreshButton
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshDisabled}
            aria-label={refreshButtonLabel}
            title={refreshButtonLabel}
          >
            ↻
          </RefreshButton>
        </RefreshControls>
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
              <QuestionVoiceCard key={question.questionId} index={index + 1} question={question} />
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
