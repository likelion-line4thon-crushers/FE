import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { usePostHog } from "@posthog/react";
import { ANALYTICS_EVENTS, ANALYTICS_GROUP_SESSION } from "@/shared/config/analytics-events";
import { useTour } from "@/shared/lib/tour";
import { reportTourSteps } from "../model/tour/reportTourSteps";
import { PageContainer, ContentContainer, FooterContainer } from "./AiReportPage.styles";
import { SideHeader } from "./navigation";
import {
  TotalReaction,
  Top3,
  PopularSlide,
  QuestionSlide,
  ReplaySlide,
  ReviewSlide,
} from "./sections";
import FooterImage from "@/shared/assets/images/AI/AIFooter.png";
import { loadStoredRoomData, computeRoomInfo } from "../model/room-info";
import { storedAiReportQuery, mostRevisitSlideQuery } from "@/shared/api/ai-report";

const AiReportPage = () => {
  const location = useLocation();
  const { roomId: roomIdParam } = useParams();
  const posthog = usePostHog();
  const totalReactionRef = useRef<HTMLDivElement | null>(null);
  const top3Ref = useRef<HTMLDivElement | null>(null);
  const popularSlideRef = useRef<HTMLDivElement | null>(null);
  const questionSlideRef = useRef<HTMLDivElement | null>(null);
  const replaySlideRef = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const contentContainerRef = useRef<HTMLDivElement | null>(null);
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
    posthog?.capture(ANALYTICS_EVENTS.AI_REPORT_VIEWED, { room_id: roomId });
    if (roomId) posthog?.group(ANALYTICS_GROUP_SESSION, roomId);
  }, [roomId, posthog]);

  const reportQuery = useQuery({ ...storedAiReportQuery(roomId ?? ""), enabled: !!roomId });
  const revisitQuery = useQuery({ ...mostRevisitSlideQuery(roomId ?? ""), enabled: !!roomId });

  // roomId 부재는 쿼리 에러가 아니라 로컬 에러로 합성한다.
  const missingRoomIdError = roomId ? null : new Error("roomId를 확인할 수 없습니다.");
  const storedReport = reportQuery.data ?? null;
  const reportLoading = reportQuery.isLoading;
  const reportError = missingRoomIdError ?? reportQuery.error;
  const revisitReport = revisitQuery.data ?? null;
  const revisitLoading = revisitQuery.isLoading;
  const revisitError = missingRoomIdError ?? revisitQuery.error;

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

  // 온보딩 투어(AI 리포트) — 리포트 데이터가 실제로 로드된 뒤 첫 방문 시 자동 실행.
  const reportReady = !reportLoading && !reportError && !!storedReport;
  useTour({ surface: "report", steps: reportTourSteps, enabled: reportReady, roomId });

  return (
    <PageContainer>
      <SideHeader onIconClick={scrollToSection} activeSection={activeSection} />
      <ContentContainer ref={contentContainerRef}>
        <div ref={totalReactionRef} data-tour="report-totalReaction">
          <TotalReaction
            reportData={storedReport}
            loading={reportLoading}
            error={reportError}
            roomId={roomId}
            deckId={deckId}
            fileName={fileName}
          />
        </div>
        <div ref={top3Ref} data-tour="report-top3">
          <Top3 />
        </div>
        <div ref={popularSlideRef} data-tour="report-popularSlide">
          <PopularSlide roomId={roomId} deckId={deckId} />
        </div>
        <div ref={questionSlideRef} data-tour="report-questionSlide">
          <QuestionSlide />
        </div>
        <div ref={replaySlideRef} data-tour="report-replaySlide">
          <ReplaySlide
            reportData={revisitReport}
            loading={revisitLoading}
            error={revisitError}
            roomId={roomId}
            deckId={deckId}
          />
        </div>
        <div ref={reviewRef} data-tour="report-review">
          <ReviewSlide />
        </div>
        <FooterContainer>
          <img src={FooterImage} alt="footer" />
        </FooterContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default AiReportPage;
