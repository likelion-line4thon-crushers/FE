// src/pages/Presentation/PresenterViewPage.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout"; // ✅ LayoutContainer 말고 이거
import SidebarSlides from "../../components/SidebarSlides";
import SlideViewer from "../../components/SlideViewer";
import QuestionList from "../../components/QuestionList";
import { fetchAllOriginalSlideUrls } from "../../services/presentationService";
import websocketService from "../../services/websocketService";
import useEmojiReactions from "../../hooks/useEmojiReactions";
import { WebSocketService } from "../../services/websocketService";

// SettingsPanel 스타일 재사용
import {
  PanelWrapper,
  Section,
  Title,
  AudienceCountWrapper,
  AudienceIcon,
  AudienceNum,
  QuickTogglesGrid,
  ToggleBox,
  ToggleLabel,
  ToggleDescription,
  ToggleInput,
} from "../../components/SettingsPanel/SettingsPanel.styles";
import AudienceSVG from "../../assets/images/people.svg";

const PresenterViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId: roomIdParam } = useParams();

  const storedRoomData = useMemo(
    () =>
      JSON.parse(
        sessionStorage.getItem("boini_room") ||
          sessionStorage.getItem("roomData") ||
          "{}"
      ),
    []
  );

  const locationState = location.state || {};

  const roomId = roomIdParam || locationState.roomId || storedRoomData.roomId;
  const deckId = locationState.deckId || storedRoomData.deckId;
  const totalPages = locationState.totalPages || storedRoomData.totalPages || 0;
  const presenterToken =
    locationState.presenterToken || storedRoomData.presenterToken || null;

  const presenterWsUrl = useMemo(() => {
    const raw = locationState.wsUrl || storedRoomData.wsUrl || null;

    const deriveFromUrl = (input) => {
      if (!input) return null;
      try {
        const url = new URL(input, window.location.origin);
        const protocol =
          url.protocol === "ws:"
            ? "http:"
            : url.protocol === "wss:"
            ? "https:"
            : url.protocol;
        return `${protocol}//${url.host}/ws/presenter`;
      } catch (error) {
        console.warn(
          "[PresenterViewPage] presenter WS URL 파싱 실패:",
          input,
          error
        );
        return null;
      }
    };

    const derived = deriveFromUrl(raw);
    if (derived) return derived;

    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const fallback = deriveFromUrl(apiBase);
    return fallback ?? "http://localhost:8080/ws/presenter";
  }, [locationState.wsUrl, storedRoomData.wsUrl]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideUrls, setSlideUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReactions, setShowReactions] = useState(true);
  const presenterSocketService = useMemo(() => new WebSocketService(), []);
  const { stampsBySlide: reactionStamps, isReady: reactionsReady } =
    useEmojiReactions({
      sessionId: roomId,
      token: presenterToken,
      wsUrl: presenterWsUrl,
      enabled: Boolean(roomId && presenterToken && presenterWsUrl),
      disconnectOnUnmount: true,
      service: presenterSocketService,
    });

  const currentReactionStamps = reactionStamps[String(currentSlide)] || [];

  // 서버에서 presigned URL 하나씩 가져와서 썸네일로 사용
  const currentSlideRef = useRef(0);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  const slideCount = slideUrls.length;

  const changeSlide = useCallback(
    (nextIndex, { broadcast = true } = {}) => {
      setCurrentSlide((prev) => {
        if (!Number.isFinite(nextIndex)) {
          return prev;
        }

        const maxIndex = Math.max(slideCount - 1, 0);
        const clamped = Math.min(Math.max(nextIndex, 0), maxIndex);

        if (clamped === prev) {
          return prev;
        }

        if (broadcast && roomId && websocketService.getIsConnected()) {
          websocketService.sendPageChange(roomId, prev, clamped);
        }

        return clamped;
      });
    },
    [slideCount, roomId]
  );

  useEffect(() => {
    if (!roomId || !deckId || !totalPages) {
      console.warn("⚠️ [PresenterViewPage] 필수 파라미터 누락:", {
        roomId,
        deckId,
        totalPages,
      });
      setLoading(false);
      return;
    }

    const fetchSlides = async () => {
      try {
        const urls = await fetchAllOriginalSlideUrls(
          roomId,
          deckId,
          totalPages
        );

        // CreateSessionPage와 동일하게, URL 문자열 배열을 그대로 사용합니다.
        setSlideUrls(urls);
      } catch (err) {
        console.error("❌ [PresenterViewPage] 슬라이드 생성 실패:", err);
        setSlideUrls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, [roomId, deckId, totalPages]);

  useEffect(() => {
    if (!roomId || !presenterToken || !presenterWsUrl) {
      return undefined;
    }

    const onConnect = () => {
      console.log("✅ [Presenter] 웹소켓 연결 성공");
      websocketService.sendPageChange(
        roomId,
        currentSlideRef.current,
        currentSlideRef.current
      );
    };

    const onError = (error) => {
      console.error("🚨 [Presenter] 웹소켓 연결 실패:", error);
    };

    websocketService.connect(
      presenterWsUrl,
      presenterToken,
      onConnect,
      onError
    );

    return () => {
      websocketService.disconnect();
    };
  }, [roomId, presenterToken, presenterWsUrl]);

  useEffect(() => {
    if (!roomId || !presenterToken || !presenterWsUrl) {
      return undefined;
    }

    if (!websocketService.getIsConnected()) {
      return undefined;
    }

    const unsubscribe = websocketService.subscribe(
      `/topic/presentation/${roomId}/pageChange/audience`,
      (data) => {
        const nextSlide = Number(data?.changedPage);
        if (Number.isFinite(nextSlide)) {
          changeSlide(nextSlide, { broadcast: false });
        }
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [roomId, presenterToken, presenterWsUrl, changeSlide]);

  const handleEndSession = () => {
    alert("세션이 종료되었습니다!");
    navigate("/");
  };

  // ✅ 로딩 중일 때 표시
  if (loading) {
    return (
      <Layout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>슬라이드 로딩 중...</p>
        </div>
      </Layout>
    );
  }

  // 썸네일이 없을 때 표시
  if (!slideUrls.length) {
    // 이 부분을 slideUrls로 변경
    return (
      <Layout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>슬라이드를 불러올 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 🔹 좌측: 슬라이드 썸네일 리스트 */}
      <SidebarSlides
        slides={slideUrls} // 이 부분을 slideUrls로 변경
        currentSlide={currentSlide}
        setCurrentSlide={changeSlide}
      />

      {/* 🔹 중앙: 현재 슬라이드 */}
      <SlideViewer
        slides={slideUrls} // 이 부분을 slideUrls로 변경
        currentSlide={currentSlide}
        setCurrentSlide={changeSlide}
        mode="present"
        stamps={showReactions ? currentReactionStamps : []}
        showReactions={showReactions && reactionsReady}
      />

      {/* 🔹 우측: 빠른 설정 + 실시간 질문 */}
      <PanelWrapper>
        {/* === 빠른 설정 섹션 === */}
        <Section>
          <Title>빠른 설정</Title>
          <AudienceCountWrapper>
            <AudienceIcon src={AudienceSVG} alt="청중 아이콘" />
            <span>청중 수</span>
            <AudienceNum>03 / 50</AudienceNum>
          </AudienceCountWrapper>

          <QuickTogglesGrid>
            <QuickSettingToggle
              label="리액션 스티커"
              description="청중이 리액션 스티커로 반응을 남길 수 있습니다."
              checked={showReactions}
              onChange={(event) => setShowReactions(event.target.checked)}
              disabled={!reactionsReady}
            />
            <QuickSettingToggle
              label="실시간 질문"
              description="청중이 실시간으로 질문을 남길 수 있습니다."
              defaultChecked
            />
            <QuickSettingToggle
              label="실시간 피드백"
              description="수집된 청중의 반응을 실시간으로 분석합니다."
              defaultChecked
            />
            <QuickSettingToggle
              label="다음 슬라이드 공개"
              description="청중이 다음 슬라이드 화면들을 미리 볼 수 있습니다."
              defaultChecked
            />
          </QuickTogglesGrid>
        </Section>

        {/* === 실시간 질문 섹션 === */}
        <Section>
          <Title>실시간 질문</Title>
          <QuestionList onEndSession={handleEndSession} />
        </Section>
      </PanelWrapper>
    </Layout>
  );
};

export default PresenterViewPage;

// 빠른 설정 토글 UI
const QuickSettingToggle = ({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
}) => (
  <ToggleBox>
    <ToggleLabel>{label}</ToggleLabel>
    <ToggleDescription>{description}</ToggleDescription>
    <ToggleInput
      type="checkbox"
      onChange={onChange}
      disabled={disabled}
      checked={typeof checked === "boolean" ? checked : undefined}
      defaultChecked={typeof checked === "boolean" ? undefined : defaultChecked}
    />
  </ToggleBox>
);
