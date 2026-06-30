import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import styled from "styled-components";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("rating");
import Emoji3 from "@/shared/assets/images/emoji3.svg";
import StarIcon from "@/shared/assets/images/star.svg";
import StarCheckedIcon from "@/shared/assets/images/star_checked.svg";
import { submitFeedback } from "@/shared/api/feedback";
import { getOriginalSlideUrl } from "@/shared/api/presentation";
import { resolveRatingSessionContext } from "../model/resolveRatingSessionContext";

const RatingPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstSlideUrl, setFirstSlideUrl] = useState<string | null>(null);
  const [loadingSlide, setLoadingSlide] = useState(false);
  const [identityWarningDismissed, setIdentityWarningDismissed] = useState(false);

  const clearAudienceSession = () => {
    if (!code) {
      return;
    }

    try {
      sessionStorage.removeItem(`boini_audience_${code}`);
    } catch (error) {
      log.warn("평가 세션 스토리지 정리 실패:", error);
    }
  };

  // * roomId, audienceId, deckId: route state → audience sessionStorage only
  const { roomId, audienceId, deckId, hasIdentity } = useMemo(() => {
    const context = resolveRatingSessionContext(code, location.state);
    return context;
  }, [location.state, code]);

  // 첫 번째 슬라이드 로드
  useEffect(() => {
    if (!roomId || !deckId) {
      return;
    }

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

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!rating || !roomId || !audienceId) {
      log.warn("제출 불가: rating, roomId, audienceId 필요");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitFeedback({
        roomId,
        audienceId,
        rating,
        comment: comment.trim(),
      });

      log.log("피드백 제출 성공:", result);

      clearAudienceSession();

      // 메인페이지로 이동
      navigate("/", { replace: true });
    } catch (error) {
      log.error("피드백 제출 실패:", error);
      alert("피드백 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 건너뛰기 핸들러
  const handleSkip = () => {
    clearAudienceSession();
    navigate("/", { replace: true });
  };

  const showIdentityWarning = !hasIdentity && !identityWarningDismissed;

  return (
    <MainLayout>
      {/* 좌측 빗금 */}
      <Side>
        <SideInner />
      </Side>

      {/* 중앙 영역 */}
      <CenterGrid>
        {/* 왼쪽 상단 - 발표자료 첫 번째 슬라이드 */}
        <Box>
          {loadingSlide ? (
            <div style={{ color: "#999", fontSize: "0.9vw" }}>로딩 중...</div>
          ) : firstSlideUrl ? (
            <img src={firstSlideUrl} alt="발표자료 첫 번째 슬라이드" />
          ) : (
            <img src="https://via.placeholder.com/400x200.png?text=발표+썸네일" alt="썸네일" />
          )}
        </Box>

        {/* 오른쪽 상단 - 감사 메시지 */}
        <Box>
          <ThanksText>
            <img src={Emoji3} alt="감사 로고" />
            <div>
              세션에 참여해주셔서 감사합니다! <br />
              함께해서 즐거웠어요 :)
            </div>
          </ThanksText>
        </Box>

        {/* 왼쪽 하단 - 별점 */}
        <Box>
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
                <RatingScore>
                  {rating === 1 && "1점"}
                  {rating === 2 && "2점"}
                  {rating === 3 && "3점"}
                  {rating === 4 && "4점"}
                  {rating === 5 && "5점"}
                </RatingScore>
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
        </Box>

        {/* 오른쪽 하단 - 후기 입력 */}
        <Box>
          <FeedbackBox>
            <FeedbackTitle>세션에 대한 후기를 남겨주세요!</FeedbackTitle>
            {showIdentityWarning && (
              <IdentityNotice role="status">
                평가 세션 정보를 찾을 수 없습니다. 청중 입장 후 받은 링크나 방 상태로 다시
                열어주세요.
                <IdentityNoticeActions>
                  <DismissButton type="button" onClick={() => setIdentityWarningDismissed(true)}>
                    닫기
                  </DismissButton>
                </IdentityNoticeActions>
              </IdentityNotice>
            )}
            <TextArea
              placeholder="여러분의 한 마디가 세션 진행자에게 큰 도움이 됩니다 :)"
              value={comment}
              disabled={!hasIdentity}
              onChange={(e) => setComment(e.target.value)}
            />
          </FeedbackBox>
        </Box>

        {/* 하단 버튼 영역 */}
        <ButtonRow>
          <SubmitButton disabled={!rating || isSubmitting || !hasIdentity} onClick={handleSubmit}>
            {isSubmitting ? "제출 중..." : "제출"}
          </SubmitButton>
          <SkipButton onClick={handleSkip}>건너뛰기</SkipButton>
        </ButtonRow>
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

/* 중앙 2×2 그리드 */
const CenterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  grid-template-rows: 1fr 1fr auto;
  gap: 1vw;
  width: 100%;
  height: 100%;
  max-height: 100vh;
  padding: 5% 2%;
  box-sizing: border-box;
  border-left: 0.1vw solid #eaeaea;
  border-right: 0.1vw solid #eaeaea;
  overflow-y: auto;
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

/* 감사 메시지 */
const ThanksText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0vw;
  text-align: left;

  img {
    width: 15vw;
    height: auto;
    padding: 0;
    margin-right: -3vw;
    margin-left: -4vw;
  }

  div {
    font-size: 1.5vw;
    font-weight: 400;
    color: #333;
    line-height: 1.5;
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
  display: flex;
  flex-direction: column;
  gap: 1vh;
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 12vh;
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
    font-weight: 400;
    opacity: 0.8; /* 흐릿한 효과 */
    font-size: clamp(12px, 0.9vw, 15px);
  }
`;

/* 버튼 영역 */
const ButtonRow = styled.div`
  grid-column: 1 / 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1vw;
  margin-top: 1vh;
`;

const SubmitButton = styled.button`
  background-color: ${(props) => (props.disabled ? "#ccc" : "#e8541e")};
  color: white;
  border: none;
  border-radius: 1.2vw;
  padding: 1.2vh 2.4vw;
  font-size: clamp(12px, 0.9vw, 16px);
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background 0.2s ease;
`;

const SkipButton = styled(SubmitButton)`
  background: #fff;
  color: #555;
  text-decoration: underline;
`;
