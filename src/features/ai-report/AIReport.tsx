import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from 'react-router';
import SideHeader from "./components/SideHeader/SideHeader";
import {
  PageContainer,
  ContentContainer,
  FooterContainer,
} from "./AIReport.styles";
import TotalReaction from "./components/TotalReaction/TotalReaction";
import Top3 from "./components/Top3/Top3";
import PopularSlide from "./components/PopularSlide/PopularSlide";
import QuestionSlide from "./components/QuestionSlide/QuestionSlide";
import ReplaySlide from "./components/ReplaySlide/ReplaySlide";
import Review from "./components/ReviewSlide/ReviewSlide";
import FooterImage from "../../assets/images/AI/AIFooter.png";
import { loadStoredRoomData, computeRoomInfo } from "../../utils/aiReportRoom";
import {
  fetchStoredAiReport,
  fetchMostRevisitSlide,
} from "../../services/aiReportService";

const AiReportPage = () => {
  const location = useLocation();
  const { roomId: roomIdParam } = useParams();
  const totalReactionRef = useRef<HTMLDivElement | null>(null);
  const top3Ref = useRef<HTMLDivElement | null>(null);
  const popularSlideRef = useRef<HTMLDivElement | null>(null);
  const questionSlideRef = useRef<HTMLDivElement | null>(null);
  const replaySlideRef = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const contentContainerRef = useRef<HTMLDivElement | null>(null);
  const [storedReport, setStoredReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<Error | null>(null);
  const [revisitReport, setRevisitReport] = useState<any>(null);
  const [revisitLoading, setRevisitLoading] = useState(false);
  const [revisitError, setRevisitError] = useState<Error | null>(null);
  const [activeSection, setActiveSection] = useState("totalReaction");

  const storedRoomData = useMemo(() => loadStoredRoomData(), []);

  const roomInfo = useMemo(
    () => computeRoomInfo(storedRoomData, location?.state),
    [storedRoomData, location]
  );

  // * URL param is the primary source for roomId; fall back to storage/state
  const roomId = roomIdParam || roomInfo.roomId;
  const { deckId, fileName } = roomInfo;

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
          setReportError(error as Error);
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
          setRevisitError(error as Error);
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

  const scrollToSection = (sectionName: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
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

  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    const sections = [
      { name: "totalReaction", ref: totalReactionRef },
      { name: "top3", ref: top3Ref },
      { name: "popularSlide", ref: popularSlideRef },
      { name: "questionSlide", ref: questionSlideRef },
      { name: "replaySlide", ref: replaySlideRef },
      { name: "review", ref: reviewRef },
    ];

    const handleScroll = () => {
      if (!container) return;

      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const viewportMiddle = containerTop + containerHeight / 2;

      let activeSectionName = "totalReaction";

      for (const section of sections) {
        const element = section.ref.current;
        if (!element) continue;

        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;

        if (viewportMiddle >= elementTop && viewportMiddle <= elementBottom) {
          activeSectionName = section.name;
          break;
        }
      }

      if (containerTop < 100) {
        activeSectionName = "totalReaction";
      }

      setActiveSection(activeSectionName);
    };

    container.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [storedReport, revisitReport]);

  return (
    <PageContainer>
      <SideHeader onIconClick={scrollToSection} activeSection={activeSection} />
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
