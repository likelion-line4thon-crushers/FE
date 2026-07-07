import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import styled from "styled-components";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("rating");
import Emoji3 from "@/shared/assets/images/emoji3.svg";
import StarIcon from "@/shared/assets/images/star.svg";
import StarCheckedIcon from "@/shared/assets/images/star_checked.svg";
import { getOriginalSlideUrl } from "@/shared/api/presentation";
import { resolveRatingSessionContext } from "../model/resolveRatingSessionContext";
import { hasSubmittedFeedback } from "../model/feedbackSubmissionMarker";
import { Skeleton } from "@/shared/ui/skeleton";
import { useRatingPdfDownload } from "../model/useRatingPdfDownload";
import { useAudienceFeedbackForm } from "../model/useAudienceFeedbackForm";
import { useRatingSubmission } from "../model/useRatingSubmission";
import { QuestionAnswerList } from "./QuestionAnswerList";
import { DownloadPopover } from "./DownloadPopover";
import { RatingActionButtons } from "./RatingActionButtons";

const RatingPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [popoverDismissed, setPopoverDismissed] = useState(false);
  const [firstSlideUrl, setFirstSlideUrl] = useState<string | null>(null);
  const [loadingSlide, setLoadingSlide] = useState(false);
  const [identityWarningDismissed, setIdentityWarningDismissed] = useState(false);

  const clearAudienceSession = () => {
    if (!code) return;
    try {
      sessionStorage.removeItem(`boini_audience_${code}`);
    } catch (error) {
      log.warn("평가 세션 스토리지 정리 실패:", error);
    }
  };

  const { roomId, audienceId, audienceToken, deckId, hasIdentity } = useMemo(
    () => resolveRatingSessionContext(code, location.state),
    [location.state, code]
  );

  const {
    questions,
    loading: loadingQuestions,
    error: questionsError,
    answers,
    setAnswer,
    hasCustomQuestions,
    allAnswered,
    buildAnswerList,
  } = useAudienceFeedbackForm(roomId);

  const {
    availability: pdfDownloadAvailability,
    downloading: pdfDownloading,
    error: pdfDownloadError,
    refreshAvailability,
    downloadSlides,
  } = useRatingPdfDownload({ roomId, audienceId, enabled: hasIdentity });

  const {
    submit,
    submitting,
    error: submitError,
  } = useRatingSubmission(roomId, audienceId, audienceToken);

  const isDownloadEnabled = Boolean(pdfDownloadAvailability?.enabled);
  const isComplete = rating > 0 && (hasCustomQuestions ? allAnswered : comment.trim().length > 0);

  // 첫 번째 슬라이드 로드
  useEffect(() => {
    if (!roomId || !deckId) return;
    const loadFirstSlide = async () => {
      setLoadingSlide(true);
      try {
        const url = await getOriginalSlideUrl(roomId, deckId, 1);
        setFirstSlideUrl(url);
      } catch (error) {
        log.error("첫 번째 슬라이드 로드 실패:", error);
        setFirstSlideUrl(null);
      } finally {
        setLoadingSlide(false);
      }
    };
    loadFirstSlide();
  }, [roomId, deckId]);

  const buildPayload = () => ({
    rating,
    hasCustomQuestions,
    answers: buildAnswerList(),
    comment,
  });

  const handleSubmit = async () => {
    if (!isComplete) return;
    const ok = await submit(buildPayload());
    if (ok) {
      clearAudienceSession();
      navigate("/", { replace: true });
    }
  };

  const handleDownload = async () => {
    if (!isComplete) return;
    const ok = await submit(buildPayload());
    if (!ok) return;
    const nextAvailability = await refreshAvailability();
    if (!nextAvailability?.sessionEnded || !nextAvailability?.canDownload) {
      alert("슬라이드 다운로드가 아직 허용되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    try {
      await downloadSlides();
      clearAudienceSession();
      navigate("/", { replace: true });
    } catch (error) {
      log.error("슬라이드 다운로드 실패:", error);
      alert("슬라이드 다운로드에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSkip = () => {
    clearAudienceSession();
    navigate("/", { replace: true });
  };

  // This identity already submitted (durable, per-browser marker). Re-submitting
  // replaces the previous feedback, so warn before they do.
  const alreadySubmitted = useMemo(
    () => hasSubmittedFeedback(roomId, audienceId),
    [roomId, audienceId]
  );

  const showIdentityWarning = !hasIdentity && !identityWarningDismissed;
  const showPopover = isDownloadEnabled && !popoverDismissed;

  const overwriteNotice =
    alreadySubmitted && hasIdentity ? (
      <OverwriteNotice role="status">
        이미 후기를 제출하셨어요. 다시 제출하면 기존 후기가 새 내용으로 대체됩니다.
      </OverwriteNotice>
    ) : null;

  const identityWarning = showIdentityWarning ? (
    <IdentityNotice role="status">
      평가 세션 정보를 찾을 수 없습니다. 청중 입장 후 받은 링크나 방 상태로 다시 열어주세요.
      <IdentityNoticeActions>
        <DismissButton type="button" onClick={() => setIdentityWarningDismissed(true)}>
          닫기
        </DismissButton>
      </IdentityNoticeActions>
    </IdentityNotice>
  ) : null;

  return (
    <MainLayout>
      {/* 좌측 빗금 */}
      <Side>
        <SideInner />
      </Side>

      {/* 중앙 영역: 좌측(썸네일 + 별점) / 우측(후기, 전체 높이) */}
      <CenterGrid>
        {/* 좌측 상단 - 발표자료 첫 번째 슬라이드 */}
        <ThumbnailBox>
          {!loadingSlide && firstSlideUrl ? (
            <img src={firstSlideUrl} alt="발표자료 첫 번째 슬라이드" />
          ) : (
            <Skeleton width="85%" height="60%" radius="0.5vw" />
          )}
        </ThumbnailBox>

        {/* 좌측 하단 - 별점 */}
        <StarRatingBox>
          <RatingBox>
            <RatingTitle>오늘의 세션, 잘 보였나요?</RatingTitle>
            <Stars>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarImg
                  key={star}
                  src={rating >= star ? StarCheckedIcon : StarIcon}
                  alt={`${star} star`}
                  onClick={() => setRating(star)}
                />
              ))}
            </Stars>
            {rating > 0 && (
              <RatingText>
                <RatingScore>{`${rating}점`}</RatingScore>
                <RatingDescription>
                  {rating === 1 && "(별로에요)"}
                  {rating === 2 && "(그저 그래요)"}
                  {rating === 3 && "(괜찮아요)"}
                  {rating === 4 && "(좋아요)"}
                  {rating === 5 && "(최고에요)"}
                </RatingDescription>
              </RatingText>
            )}
          </RatingBox>
        </StarRatingBox>

        {/* 우측 - 후기 입력.
            발표자가 질문을 작성한 경우: 질문 답변 폼(전체 높이).
            질문이 없는 경우: 원본 디자인(감사 메시지 + 단일 후기 입력). */}
        {loadingQuestions ? (
          <QuestionsBox>
            <div style={{ color: "#999", fontSize: "0.9vw" }}>질문 불러오는 중...</div>
          </QuestionsBox>
        ) : hasCustomQuestions ? (
          <QuestionsBox>
            <FeedbackBox>
              <FeedbackTitle>세션에 대한 후기를 남겨주세요!</FeedbackTitle>
              {questionsError && <ErrorNote role="alert">{questionsError}</ErrorNote>}
              {identityWarning}
              {overwriteNotice}
              <QuestionAnswerList
                questions={questions}
                answers={answers}
                onAnswerChange={setAnswer}
                disabled={!hasIdentity}
              />
            </FeedbackBox>
          </QuestionsBox>
        ) : (
          <>
            <ThanksBox>
              <ThanksText>
                <img src={Emoji3} alt="감사 로고" />
                <div>
                  세션에 참여해주셔서 감사합니다! <br />
                  함께해서 즐거웠어요 :)
                </div>
              </ThanksText>
            </ThanksBox>
            <CommentBox>
              <FeedbackBox>
                <FeedbackTitle>세션에 대한 후기를 남겨주세요!</FeedbackTitle>
                {questionsError && <ErrorNote role="alert">{questionsError}</ErrorNote>}
                {identityWarning}
                {overwriteNotice}
                <CommentTextArea
                  placeholder="여러분의 한 마디가 세션 진행자에게 큰 도움이 됩니다 :)"
                  value={comment}
                  disabled={!hasIdentity}
                  maxLength={2000}
                  onChange={(e) => setComment(e.target.value)}
                />
              </FeedbackBox>
            </CommentBox>
          </>
        )}

        {/* 하단 버튼 영역 */}
        <ButtonArea>
          {showPopover && <DownloadPopover onClose={() => setPopoverDismissed(true)} />}
          {(submitError || pdfDownloadError) && (
            <ErrorNote role="alert">{submitError || pdfDownloadError}</ErrorNote>
          )}
          <RatingActionButtons
            showDownload={isDownloadEnabled}
            isComplete={isComplete && hasIdentity}
            submitting={submitting || pdfDownloading}
            onSubmit={handleSubmit}
            onDownload={handleDownload}
            onSkip={handleSkip}
          />
        </ButtonArea>
      </CenterGrid>

      {/* 우측 빗금 */}
      <Side>
        <SideInner />
      </Side>
    </MainLayout>
  );
};

export default RatingPage;

/* ===============================
   Styled Components
=============================== */

/* 전체 레이아웃 */
const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 15vw 1fr 15vw;
  width: 100vw;
  min-height: 100vh;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: #fff;
  box-sizing: border-box;
`;

/* 양옆 빗금 영역 */
const Side = styled.div`
  background-color: #fff;
  height: 100%;
  padding: 2% 6%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
`;

const SideInner = styled.div`
  width: 100%;
  height: 100%;
  border: 0.1vw dashed #eaeaea;
  border-radius: 0.4vw;
  background-image: repeating-linear-gradient(
    135deg,
    #f3f3f3 0,
    #f3f3f3 0.1vw,
    transparent 0.1vw,
    transparent 0.3vw
  );
`;

/* 중앙 그리드: 좌측 2행(썸네일/별점) x 우측 1행(후기, 전체 높이) */
const CenterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  /* minmax(0, 1fr) lets the question row shrink below its content so the inner
     list scrolls instead of expanding the grid past the viewport. */
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 1vw;
  width: 100%;
  height: 100%;
  max-height: 100vh;
  padding: 5% 2%;
  box-sizing: border-box;
  border-left: 0.1vw solid #eaeaea;
  border-right: 0.1vw solid #eaeaea;
  overflow: hidden;
`;

/* 각 박스 */
const Box = styled.div`
  background: #fafafa;
  border: 0.1vw solid #eaeaea;
  border-radius: 0.6vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0.2vh 0.4vh rgba(0, 0, 0, 0.05);

  img {
    width: 85%;
    height: auto;
    border-radius: 0.5vw;
  }
`;

/* 좌측 상단 - 썸네일 */
const ThumbnailBox = styled(Box)`
  grid-column: 1;
  grid-row: 1;
`;

/* 좌측 하단 - 별점 */
const StarRatingBox = styled(Box)`
  grid-column: 1;
  grid-row: 2;
`;

/* 우측 - 후기 (좌측 두 행 전체 높이) — 발표자 질문이 있을 때 */
const QuestionsBox = styled(Box)`
  grid-column: 2;
  grid-row: 1 / 3;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
`;

/* 원본 디자인(질문 없음) - 우측 상단 감사 메시지 */
const ThanksBox = styled(Box)`
  grid-column: 2;
  grid-row: 1;
`;

/* 원본 디자인(질문 없음) - 우측 하단 단일 후기 입력 */
const CommentBox = styled(Box)`
  grid-column: 2;
  grid-row: 2;
`;

const ThanksText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: left;

  img {
    width: 12vw;
    height: auto;
    margin-right: -2vw;
    margin-left: -3vw;
  }

  div {
    font-size: 1.3vw;
    font-weight: 400;
    color: #333;
    line-height: 1.5;
  }
`;

const CommentTextArea = styled.textarea`
  width: 100%;
  flex: 1 1 0;
  min-height: 10vh;
  resize: none;
  border: 0.1vw solid #eaeaea;
  border-radius: 0.6vw;
  padding: 1vh 1vw;
  font-size: clamp(12px, 0.9vw, 15px);
  background: #fff;
  outline: none;
  &:focus {
    border-color: #e8541e;
  }
  &::placeholder {
    color: #b5b5b5;
    opacity: 0.8;
  }
`;

/* 별점 박스 */
const RatingBox = styled.div`
  text-align: center;
`;

const RatingTitle = styled.h3`
  font-size: 1.4vw;
  margin-bottom: 1vh;
  color: #5c5c5c;
`;

const StarImg = styled.img`
  width: 2vw !important;
  height: auto;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;

  &:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
  }
`;

const Stars = styled.div`
  display: flex;
  justify-content: center;
  gap: 0vw;
`;

const RatingText = styled.div`
  margin-top: 1vh;
  text-align: center;
  font-size: 14px;
  line-height: 26px;
  letter-spacing: -0.45px;
  color: #5c5c5c;
`;

const RatingScore = styled.span`
  font-weight: 600;
`;

const RatingDescription = styled.span`
  font-weight: 400;
`;

/* 후기 입력 */
const FeedbackBox = styled.div`
  width: 85%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1vh;
  padding: 2vh 0;
  box-sizing: border-box;
  min-height: 0;
`;

const FeedbackTitle = styled.div`
  font-size: clamp(13px, 0.9vw, 16px);
  font-weight: 600;
  color: #333;
`;

const IdentityNotice = styled.div`
  width: 100%;
  border: 0.1vw solid #f2b08d;
  background: #fff7f2;
  color: #8a3d1f;
  border-radius: 0.6vw;
  padding: 1vh 1vw;
  font-size: clamp(12px, 0.85vw, 14px);
  line-height: 1.5;
`;

const IdentityNoticeActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.8vh;
`;

const DismissButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.5vh 0.9vw;
  background: #e8541e;
  color: #fff;
  font-size: clamp(11px, 0.8vw, 13px);
  cursor: pointer;
`;

const OverwriteNotice = styled.div`
  width: 100%;
  border: 0.1vw solid #cdd8f0;
  background: #f2f6ff;
  color: #2c4a8a;
  border-radius: 0.6vw;
  padding: 1vh 1vw;
  font-size: clamp(12px, 0.85vw, 14px);
  line-height: 1.5;
`;

/* 버튼 영역 */
const ButtonArea = styled.div`
  grid-column: 1 / 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vh;
  margin-top: 1vh;
`;

const ErrorNote = styled.p`
  color: #e8541e;
  font-size: clamp(12px, 0.85vw, 14px);
  margin: 0;
`;
