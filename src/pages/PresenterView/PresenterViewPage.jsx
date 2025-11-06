// src/pages/Presentation/PresenterViewPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout/LayoutContainer";
import SidebarSlides from "../../components/SidebarSlides";
import SlideViewer from "../../components/SlideViewer";
import QuestionList from "../../components/QuestionList";

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
    const { roomId, deckId, totalPages } = location.state || {};

    const [currentSlide, setCurrentSlide] = useState(0);
    const [thumbnails, setThumbnails] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ 서버 이미지 경로 직접 조합해서 불러오기
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

        const loadSlides = async () => {
            try {
                console.log("🖼️ [PresenterViewPage] 슬라이드 경로 생성 시작:", {
                    roomId,
                    deckId,
                    totalPages,
                });

                // ✅ totalPages만큼 슬라이드 경로 생성
                const slideUrls = Array.from({ length: totalPages }, (_, i) => ({
                    page: i + 1,
                    thumbnailUrl: `/api/presentations/${roomId}/${deckId}/pages/${i + 1
                        }?ext=png`,
                }));

                setThumbnails(slideUrls);
                console.log("✅ [PresenterViewPage] 슬라이드 URL 자동 생성 완료:", {
                    slideCount: slideUrls.length,
                });
            } catch (err) {
                console.error("❌ [PresenterViewPage] 슬라이드 생성 실패:", err);
                setThumbnails([]);
            } finally {
                setLoading(false);
            }
        };

        loadSlides();
    }, [roomId, deckId, totalPages]);

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

    // ✅ 썸네일이 없을 때 표시
    if (!thumbnails.length) {
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
                slides={thumbnails}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
            />

            {/* 🔹 중앙: 현재 슬라이드 */}
            <SlideViewer
                slides={thumbnails}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
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

// ✅ 빠른 설정 토글 UI
const QuickSettingToggle = ({ label, description }) => (
    <ToggleBox>
        <ToggleLabel>{label}</ToggleLabel>
        <ToggleDescription>{description}</ToggleDescription>
        <ToggleInput type="checkbox" />
    </ToggleBox>
);
