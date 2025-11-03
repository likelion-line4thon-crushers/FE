import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/LayoutContainer";
import SidebarSlides from "../../components/SidebarSlides";
import SlideViewer from "../../components/SlideViewer";
import QuestionList from "../../components/QuestionList";

// SettingsPanel 스타일과 구성 요소 재사용
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
    const [currentSlide, setCurrentSlide] = useState(0);

    // ✅ UI 테스트용 더미 슬라이드 이미지
    const dummySlides = [
        "https://picsum.photos/seed/slide1/1280/720",
        "https://picsum.photos/seed/slide2/1280/720",
        "https://picsum.photos/seed/slide3/1280/720",
        "https://picsum.photos/seed/slide4/1280/720",
    ];

    const handleEndSession = () => {
        alert("세션이 종료되었습니다!");
        navigate("/");
    };

    return (
        <Layout>
            {/* 좌측: 슬라이드 썸네일 */}
            <SidebarSlides
                slides={dummySlides}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
                participantCount={3}
                maxParticipants={50}
            />

            {/* 중앙: 현재 슬라이드 */}
            <SlideViewer
                slides={dummySlides}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
                mode="present"
            />

            {/* 우측: 빠른 설정 + 실시간 질문 */}
            <PanelWrapper>
                {/* 🧩 빠른 설정 섹션 */}
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

                {/* 실시간 질문 섹션 (LiveWaitingBox → QuestionList 대체) */}
                <Section>
                    <Title>실시간 질문</Title>
                    <QuestionList onEndSession={handleEndSession} />
                </Section>
            </PanelWrapper>
        </Layout>
    );
};

export default PresenterViewPage;

// ✅ SettingsPanel의 toggle 요소 재활용
const QuickSettingToggle = ({ label, description }) => (
    <ToggleBox>
        <ToggleLabel>{label}</ToggleLabel>
        <ToggleDescription>{description}</ToggleDescription>
        <ToggleInput type="checkbox" />
    </ToggleBox>
);
