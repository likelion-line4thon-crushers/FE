// src/pages/Presentation/PresenterViewPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout"; // ✅ LayoutContainer 말고 이거
import SidebarSlides from "../../components/SidebarSlides";
import SlideViewer from "../../components/SlideViewer";
import QuestionList from "../../components/QuestionList";
import { fetchAllOriginalSlideUrls } from "../../services/presentationService";
import websocketService from "../../services/websocketService";

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
    const { roomId } = useParams();
    const prevSlideRef = useRef(0);

    const [roomData, setRoomData] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideUrls, setSlideUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWebsocketReady, setIsWebsocketReady] = useState(false);

    // 1. 방 정보 로드 및 웹소켓 연결
    useEffect(() => {
        const storedRoomData = JSON.parse(sessionStorage.getItem("boini_room") || "{}");
        if (!storedRoomData.roomId || !storedRoomData.presenterToken) {
            alert("발표자 정보가 올바르지 않습니다. 다시 시도해주세요.");
            navigate("/");
            return;
        }
        setRoomData(storedRoomData);

        // wsUrl에 /presenter 엔드포인트 추가
        let wsUrl = storedRoomData.wsUrl;
        
        if (!wsUrl) {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
            wsUrl = `${apiBaseUrl}/ws/presenter`;
        } else {
            // 쉼표로 구분된 경우 첫 번째 URL만 사용
            if (wsUrl.includes(",")) {
                wsUrl = wsUrl.split(",")[0].trim();
            }
            
            // /presenter 엔드포인트 추가
            if (!wsUrl.endsWith("/presenter")) {
                wsUrl = wsUrl.replace(/\/ws\/?$/, "/ws/presenter");
            }
        }

        websocketService.connect(
            wsUrl,
            storedRoomData.presenterToken,
            () => {
                console.log("✅ [Presenter] 웹소켓 연결 성공");
                setIsWebsocketReady(true);
            },
            (err) => {
                console.error("🚨 [Presenter] 웹소켓 연결 실패:", err);
                setIsWebsocketReady(false);
            }
        );

        return () => {
            setIsWebsocketReady(false);
            websocketService.disconnect();
        };
    }, [navigate, roomId]);

    // 2. 슬라이드 URL 가져오기
    useEffect(() => {
        if (!roomData) return;

        const { deckId, totalPages } = roomData;

        const fetchSlides = async () => {
            try {
                const urls = await fetchAllOriginalSlideUrls(roomId, deckId, totalPages);
                setSlideUrls(urls);
            } catch (err) {
                console.error("❌ [Presenter] 슬라이드 생성 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, [roomData, roomId]);

    const handleSlideChange = (nextIndex) => {
        // 웹소켓이 연결된 경우에만 메시지 전송
        if (isWebsocketReady && websocketService.getIsConnected()) {
            websocketService.sendPageChange(roomId, currentSlide, nextIndex);
        } else {
            console.warn("[Presenter] 웹소켓 미연결: 슬라이드 동기화 불가");
        }
        
        setCurrentSlide(nextIndex);
        prevSlideRef.current = nextIndex;
    };

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

    if (!slideUrls.length) {
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
                setCurrentSlide={handleSlideChange}
            />

            {/* 🔹 중앙: 현재 슬라이드 */}
            <SlideViewer
                slides={slideUrls} // 이 부분을 slideUrls로 변경
                currentSlide={currentSlide}
                setCurrentSlide={handleSlideChange}
                mode="present"
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
                        />
                        <QuickSettingToggle
                            label="실시간 질문"
                            description="청중이 실시간으로 질문을 남길 수 있습니다."
                        />
                        <QuickSettingToggle
                            label="실시간 피드백"
                            description="수집된 청중의 반응을 실시간으로 분석합니다."
                        />
                        <QuickSettingToggle
                            label="다음 슬라이드 공개"
                            description="청중이 다음 슬라이드 화면들을 미리 볼 수 있습니다."
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
const QuickSettingToggle = ({ label, description }) => (
    <ToggleBox>
        <ToggleLabel>{label}</ToggleLabel>
        <ToggleDescription>{description}</ToggleDescription>
        <ToggleInput type="checkbox" />
    </ToggleBox>
);
