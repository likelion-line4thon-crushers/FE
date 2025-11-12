import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SideHeader from "../../components/AI/SideHeader/SideHeader";
import {
  PageContainer,
  ContentContainer,
  FooterContainer,
} from "./AIReport.styles";
import TotalReaction from "../../components/AI/TotalReaction/TotalReaction";
import Top3 from "../../components/AI/Top3/Top3";
import PopularSlide from "../../components/AI/PopularSlide/PopularSlide";
import QuestionSlide from "../../components/AI/QuestionSlide/QuestionSlide";
import ReplaySlide from "../../components/AI/ReplaySlide/ReplaySlide";
import Review from "../../components/AI/ReviewSlide/ReviewSlide";
import FooterImage from "../../assets/images/AI/AIFooter.png";
import { loadStoredRoomData, computeRoomInfo } from "../../utils/aiReportRoom";
import {
  fetchStoredAiReport,
  fetchMostRevisitSlide,
} from "../../services/aiReportService";

const AiReportPage = () => {
  const location = useLocation();
  const totalReactionRef = useRef(null);
  const top3Ref = useRef(null);
  const popularSlideRef = useRef(null);
  const questionSlideRef = useRef(null);
  const replaySlideRef = useRef(null);
  const reviewRef = useRef(null);
  const contentContainerRef = useRef(null);
  const [storedReport, setStoredReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [revisitReport, setRevisitReport] = useState(null);
  const [revisitLoading, setRevisitLoading] = useState(false);
  const [revisitError, setRevisitError] = useState(null);

  const storedRoomData = useMemo(() => loadStoredRoomData(), []);

  const roomInfo = useMemo(
    () => computeRoomInfo(storedRoomData, location?.state),
    [storedRoomData, location]
  );

  const { roomId, deckId, fileName } = roomInfo;

  useEffect(() => {
    let cancelled = false;

    if (!roomId) {
      setStoredReport(null);
      setReportError(new Error("roomId를 확인할 수 없습니다."));
      setReportLoading(false);
      return undefined;
    }

    const loadReport = async () => {
      setReportLoading(true);
      setReportError(null);

      try {
        const data = await fetchStoredAiReport(roomId);
        if (!cancelled) {
          setStoredReport(data);
        }
      } catch (error) {
        if (!cancelled) {
          setStoredReport(null);
          setReportError(error);
        }
      } finally {
        if (!cancelled) {
          setReportLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  useEffect(() => {
    let cancelled = false;

    if (!roomId) {
      setRevisitReport(null);
      setRevisitError(new Error("roomId를 확인할 수 없습니다."));
      setRevisitLoading(false);
      return undefined;
    }

    const loadRevisit = async () => {
      setRevisitLoading(true);
      setRevisitError(null);

      try {
        const data = await fetchMostRevisitSlide(roomId);
        if (!cancelled) {
          setRevisitReport(data);
        }
      } catch (error) {
        if (!cancelled) {
          setRevisitReport(null);
          setRevisitError(error);
        }
      } finally {
        if (!cancelled) {
          setRevisitLoading(false);
        }
      }
    };

    loadRevisit();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const scrollToSection = (sectionName) => {
    const refs = {
      totalReaction: totalReactionRef,
      top3: top3Ref,
      popularSlide: popularSlideRef,
      questionSlide: questionSlideRef,
      replaySlide: replaySlideRef,
      review: reviewRef,
    };

    const targetRef = refs[sectionName];
    const container = contentContainerRef.current;

    if (targetRef?.current && container) {
      const targetElement = targetRef.current;
      const containerHeight = container.clientHeight;
      const targetTop = targetElement.offsetTop;
      const targetHeight = targetElement.offsetHeight;
      const maxScroll = container.scrollHeight - containerHeight;

      const offset = 40;
      let scrollPosition = Math.max(0, targetTop - offset);

      if (targetTop + targetHeight > container.scrollHeight - 50) {
        scrollPosition = Math.max(0, maxScroll);
      }

      container.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <PageContainer>
      <SideHeader onIconClick={scrollToSection} />
      <ContentContainer ref={contentContainerRef}>
        <div ref={totalReactionRef}>
          <TotalReaction
            reportData={storedReport}
            loading={reportLoading}
            error={reportError}
            roomId={roomId}
            deckId={deckId}
            fileName={fileName}
          />
        </div>
        <div ref={top3Ref}>
          <Top3 />
        </div>
        <div ref={popularSlideRef}>
          <PopularSlide roomId={roomId} deckId={deckId} />
        </div>
        <div ref={questionSlideRef}>
          <QuestionSlide />
        </div>
        <div ref={replaySlideRef}>
          <ReplaySlide
            reportData={revisitReport}
            loading={revisitLoading}
            error={revisitError}
            roomId={roomId}
            deckId={deckId}
          />
        </div>
        <div ref={reviewRef}>
          <Review />
        </div>
        <FooterContainer>
          <img src={FooterImage} alt="footer" />
        </FooterContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default AiReportPage;
