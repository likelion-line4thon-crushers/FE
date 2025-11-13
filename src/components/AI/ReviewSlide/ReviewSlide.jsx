import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  ReviewSlideContainer,
  TotalContainer,
  LeftBoxContainer,
  RightBoxContainer,
  RatingWrapper,
  RatingRow,
  RatingScore,
  SummaryBoxContainer,
  CenterHeader,
  SmallDivider,
} from "./ReviewSlide.styles";
import AITitle from "../AITitle/AITitle";
import ContentBox from "../ContentBox/ContentBox";
import SatisfyImage from "../../../assets/images/AI/Satisfy.png";
import StarImage from "../../../assets/images/AI/Star.png";
import RectangleImage from "../../../assets/images/AI/Rectangle.png";
import faceImage from "../../../assets/images/emoji1_black.svg";
import { fetchFeedbackReport } from "../../../services/aiReportService";
import {
  loadStoredRoomData,
  computeRoomInfo,
} from "../../../utils/aiReportRoom";

const ReviewSlide = () => {
  const location = useLocation();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const storedRoomData = useMemo(() => loadStoredRoomData(), []);

  const roomInfo = useMemo(
    () => computeRoomInfo(storedRoomData, location?.state),
    [storedRoomData, location]
  );

  const { roomId } = roomInfo;

  useEffect(() => {
    let cancelled = false;

    if (!roomId) {
      setFeedbackData(null);
      setError(new Error("roomId를 확인할 수 없습니다."));
      setLoading(false);
      return undefined;
    }

    const loadFeedback = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchFeedbackReport(roomId);
        if (!cancelled) {
          setFeedbackData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setFeedbackData(null);
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFeedback();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

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
      .map((feedback) => {
        const comment = feedback?.comment?.trim() || "";
        return comment ? `• ${comment}` : null;
      })
      .filter(Boolean)
      .join("\n");
  }, [feedbackData, loading, error]);

  return (
    <ReviewSlideContainer>
      <AITitle
        title="청중의 한마디"
        description="청중이 세션에 대해 남긴 후기와 의견입니다."
      />
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

          <ContentBox
            title="청중 후기 요약"
            variant="custom"
            height="300px"
            width="640px"
          >
            <SummaryBoxContainer>
              <img className="icon-image" src={faceImage} alt="face" />
              <h2>청중 후기 요약</h2>
              <SmallDivider />
              <h3>{summaryText}</h3>
            </SummaryBoxContainer>
          </ContentBox>
        </LeftBoxContainer>
        <RightBoxContainer>
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
        </RightBoxContainer>
      </TotalContainer>
    </ReviewSlideContainer>
  );
};

export default ReviewSlide;
